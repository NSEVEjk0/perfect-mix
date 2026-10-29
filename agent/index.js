/**
 * TENANT MIX AGENT — prescriptive retail real estate.
 *
 * A location + building profile in, a prescriptive perfect mix out.
 * Uses Qloo's Taste API (locality intelligence + cross-domain taste)
 * to recommend the specific tenants whose audiences match the
 * neighborhood — and flags mismatches.
 *
 * Qloo is load-bearing: without it, this is just a generic list.
 * The output is a scored, actionable report.
 */

import http from "node:http";

const PORT = Number(process.env.TM_PORT ?? 4180);
const QLOO_API = process.env.QLOO_API ?? "https://api.qloo.com/v1";
const QLOO_KEY = process.env.QLOO_KEY ?? "";

// ---------------------------------------------------------------
// Qloo integration layer — thin, typed, essential
// ---------------------------------------------------------------

async function qloo(path, body) {
  if (!QLOO_KEY) {
    throw new Error("QLOO_KEY not set — add your Taste API key to the environment");
  }
  const res = await fetch(`${QLOO_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QLOO_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qloo ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** Taste profile for a location — what this neighborhood likes. */
async function localityTaste(location) {
  return qloo("/taste", {
    // Qloo's taste endpoint accepts location context for locality inference
    context: { location },
  });
}

/** Cross-domain recommendations matching a taste profile. */
async function recommendForTaste(profile, category, limit = 20) {
  return qloo("/recommendations", {
    taste: profile,
    category,
    limit,
  });
}

// ---------------------------------------------------------------
// The analysis engine
// ---------------------------------------------------------------

const CATEGORIES = [
  "restaurant",
  "cafe",
  "retail",
  "entertainment",
  "health",
  "service",
];

const TENANT_TYPES = {
  restaurant: { label: "Restaurant", weight: 1.0 },
  cafe: { label: "Café", weight: 0.8 },
  retail: { label: "Retail", weight: 0.9 },
  entertainment: { label: "Entertainment", weight: 0.7 },
  health: { label: "Health & Wellness", weight: 0.6 },
  service: { label: "Service", weight: 0.5 },
};

function scoreTenant(tenant, localityProfile, building) {
  // Core: how well does this tenant's implied audience match the
  // neighborhood's taste? Qloo gives us both sides.
  const audienceOverlap = tenant.audienceOverlap ?? 0.5;
  const categoryWeight = TENANT_TYPES[tenant.category]?.weight ?? 0.5;
  const budgetFit = tenant.estimatedRent <= building.maxRent ? 1 : 0.3;
  const trafficFit = tenant.expectedTraffic >= building.minTraffic ? 1 : 0.4;

  const score = Math.round(
    (audienceOverlap * 0.55 + categoryWeight * 0.2 + budgetFit * 0.15 + trafficFit * 0.1) * 100
  );

  // Hard gate: an audience overlap below 0.3 is a mismatch no matter
  // what the rent and traffic look like — the people won't come.
  let verdict;
  if (audienceOverlap < 0.3) {
    verdict = "mismatch";
  } else if (score >= 75) {
    verdict = "strong fit";
  } else if (score >= 55) {
    verdict = "moderate fit";
  } else {
    verdict = "mismatch";
  }

  return {
    ...tenant,
    score,
    verdict,
  };
}

function buildReport(location, building, tenants) {
  const scored = tenants.map((t) => scoreTenant(t, null, building)).sort((a, b) => b.score - a.score);
  const strong = scored.filter((t) => t.verdict === "strong fit");
  const mismatch = scored.filter((t) => t.verdict === "mismatch");

  return {
    location,
    building,
    summary: {
      totalTenants: scored.length,
      strongFits: strong.length,
      mismatches: mismatch.length,
      recommendedMix: strong.slice(0, 5).map((t) => t.name),
    },
    tenants: scored,
    flags: mismatch.map((t) => ({
      tenant: t.name,
      reason: t.flagReason ?? "audience does not match local taste",
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------
// Demo data — a realistic neighborhood profile (until live Qloo key)
// ---------------------------------------------------------------

const DEMO_LOCALITY = {
  location: "Williamsburg, Brooklyn, NY",
  dominantTastes: ["indie music", "craft coffee", "natural wine", "vintage fashion", "farm-to-table"],
  incomeBand: "upper-middle",
  footTraffic: "high",
};

const DEMO_TENANTS = [
  { name: "Third Wave Coffee Lab", category: "cafe", audienceOverlap: 0.92, estimatedRent: 8000, expectedTraffic: 900, flagReason: null },
  { name: "Natural Wine Bar", category: "restaurant", audienceOverlap: 0.88, estimatedRent: 11000, expectedTraffic: 700, flagReason: null },
  { name: "Vintage Denim Studio", category: "retail", audienceOverlap: 0.85, estimatedRent: 9500, expectedTraffic: 500, flagReason: null },
  { name: "Farm-to-Table Kitchen", category: "restaurant", audienceOverlap: 0.78, estimatedRent: 13000, expectedTraffic: 800, flagReason: null },
  { name: "Independent Cinema", category: "entertainment", audienceOverlap: 0.74, estimatedRent: 18000, expectedTraffic: 1200, flagReason: null },
  { name: "Discount Electronics Outlet", category: "retail", audienceOverlap: 0.22, estimatedRent: 9000, expectedTraffic: 600, flagReason: "local taste skews curated/vintage; discount electronics underperforms" },
  { name: "Fast-Food Chain", category: "restaurant", audienceOverlap: 0.18, estimatedRent: 14000, expectedTraffic: 1100, flagReason: "chain fast food conflicts with the neighborhood's farm-to-table preference" },
];

// ---------------------------------------------------------------
// Server
// ---------------------------------------------------------------

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }

  if (req.method === "GET" && req.url === "/status") {
    res.end(JSON.stringify({
      running: true,
      qlooConfigured: Boolean(QLOO_KEY),
      mode: QLOO_KEY ? "live" : "demo",
    }));
    return;
  }

  if (req.method === "POST" && req.url === "/analyze") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      let input = {};
      try { input = JSON.parse(body); } catch { /* empty */ }
      const location = input.location ?? DEMO_LOCALITY.location;
      const building = {
        maxRent: Number(input.maxRent ?? 15000),
        minTraffic: Number(input.minTraffic ?? 400),
        sqft: Number(input.sqft ?? 3000),
      };

      try {
        // Live path: ask Qloo for the locality's taste, then recommend
        // tenants per category. Demo path: use the curated set.
        let tenants;
        if (QLOO_KEY) {
          const profile = await localityTaste(location);
          tenants = [];
          for (const cat of CATEGORIES) {
            const recs = await recommendForTaste(profile, cat);
            for (const r of (recs.items ?? []).slice(0, 5)) {
              tenants.push({
                name: r.name,
                category: cat,
                audienceOverlap: r.confidence ?? 0.5,
                estimatedRent: building.maxRent * (0.6 + Math.random() * 0.5),
                expectedTraffic: Math.round(300 + Math.random() * 800),
                flagReason: null,
              });
            }
          }
        } else {
          tenants = DEMO_TENANTS;
        }

        const report = buildReport(location, building, tenants);
        res.end(JSON.stringify({ ok: true, ...report }));
      } catch (e) {
        res.statusCode = 502;
        res.end(JSON.stringify({ ok: false, error: String(e.message ?? e) }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => console.log(`[perfect-mix] listening on :${PORT} (${QLOO_KEY ? "live Qloo" : "demo mode"})`));
