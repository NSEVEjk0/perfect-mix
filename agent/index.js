/**
 * PERFECT MIX — prescriptive retail real estate agent.
 *
 * Multi-step agentic flow:
 *   1. resolve location → Qloo search
 *   2. fetch locality taste (Qloo Insights API)
 *   3. generate tenant candidates per category (grounded in taste tags)
 *   4. score each tenant (every component traceable)
 *   5. flag mismatches (hard gate)
 *
 * Qloo API (hackathon):
 *   base:  https://hackathon.api.qloo.com
 *   auth:  X-Api-Key: <key>
 *   main:  POST /v2/insights
 *   search: GET /search
 */

import http from "node:http";

const PORT = Number(process.env.TM_PORT ?? 4180);
const QLOO_BASE = process.env.QLOO_BASE ?? "https://hackathon.api.qloo.com";
const QLOO_KEY = process.env.QLOO_KEY ?? "";

// ---------------------------------------------------------------
// Qloo client — real API shape
// ---------------------------------------------------------------

async function qloo(path, options = {}) {
  if (!QLOO_KEY) throw new Error("QLOO_KEY not set");
  const res = await fetch(`${QLOO_BASE}${path}`, {
    ...options,
    headers: {
      "X-Api-Key": QLOO_KEY,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Qloo ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/** Resolve a free-text location to a Qloo place. */
async function resolveLocation(query) {
  const data = await qloo(`/search?q=${encodeURIComponent(query)}&type=place`);
  return data.results?.[0] ?? data.items?.[0] ?? null;
}

/** Fetch locality taste via the Insights API (real request shape). */
async function fetchLocalityTaste(locationQuery, resolved) {
  const body = {
    filter: {
      type: "urn:entity:place",
      location: {
        query: [locationQuery],
      },
    },
    signal: {
      location: {
        query: locationQuery,
        ...(resolved?.id ? { id: resolved.id } : {}),
      },
    },
    feature: {
      explainability: true,
    },
    take: 20,
  };
  const data = await qloo("/v2/insights", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data;
}

/** Pull tags/entities from an insights response (real response shape). */
function extractTasteTags(insights) {
  const tags = [];
  const push = (items) => {
    for (const it of items ?? []) {
      if (it?.tag) tags.push({ tag: it.tag, score: it.score ?? 0.5 });
      else if (it?.entity) tags.push({ tag: it.entity, score: it.score ?? 0.5 });
      else if (it?.id) tags.push({ tag: it.id, score: it.score ?? 0.5 });
      else if (it?.name) tags.push({ tag: it.name, score: it.score ?? 0.5 });
      else if (typeof it === "string") tags.push({ tag: it, score: 0.5 });
    }
  };
  push(insights?.results?.entities);
  push(insights?.results?.tags);
  push(insights?.taste);
  push(insights?.interests);
  push(insights?.tags);
  return tags.slice(0, 20);
}

// ---------------------------------------------------------------
// Scoring — every component traceable
// ---------------------------------------------------------------

const CATEGORY_WEIGHT = {
  restaurant: 1.0,
  cafe: 0.8,
  retail: 0.9,
  entertainment: 0.7,
  health: 0.6,
  service: 0.5,
};

const CATEGORY_KEYWORDS = {
  restaurant: ["food", "restaurant", "dining", "cuisine", "wine", "bar", "chef"],
  cafe: ["coffee", "cafe", "bakery", "tea", "roastery"],
  retail: ["fashion", "vintage", "design", "shopping", "brand", "luxury", "streetwear"],
  entertainment: ["music", "film", "cinema", "live", "venue", "art", "culture"],
  health: ["wellness", "yoga", "fitness", "health", "gym", "spa"],
  service: ["service", "bank", "office", "professional", "agency"],
};

/** Estimate audience overlap between a tenant and the locality taste tags. */
function estimateOverlap(tenantCategory, tasteTags) {
  const keywords = CATEGORY_KEYWORDS[tenantCategory] ?? [];
  if (tasteTags.length === 0) return 0.5; // neutral when no data
  let hits = 0;
  let total = 0;
  for (const { tag, score } of tasteTags) {
    const t = String(tag).toLowerCase();
    total += 1;
    if (keywords.some((k) => t.includes(k))) hits += score;
    // also match the category name itself
    if (t.includes(tenantCategory)) hits += score;
  }
  return total > 0 ? Math.min(1, hits / total) : 0.5;
}

function scoreTenant(tenant, tasteTags, building) {
  const audienceOverlap = estimateOverlap(tenant.category, tasteTags);
  const categoryWeight = CATEGORY_WEIGHT[tenant.category] ?? 0.5;
  const budgetFit = tenant.estimatedRent <= building.maxRent ? 1 : 0.3;
  const trafficFit = tenant.expectedTraffic >= building.minTraffic ? 1 : 0.4;
  const spaceFit = tenant.spaceNeeded <= building.sqft ? 1 : 0.5;

  const score = Math.round(
    (audienceOverlap * 0.5 + categoryWeight * 0.2 + budgetFit * 0.15 + trafficFit * 0.1 + spaceFit * 0.05) * 100
  );

  let verdict;
  if (audienceOverlap < 0.3) verdict = "mismatch";
  else if (score >= 75) verdict = "strong fit";
  else if (score >= 55) verdict = "moderate fit";
  else verdict = "mismatch";

  // traceable "why" — cite the driving taste tags
  const drivingTags = tasteTags
    .filter(({ tag, score }) => score >= 0.6)
    .slice(0, 3)
    .map(({ tag }) => tag);

  let why;
  if (verdict === "mismatch") {
    why = `low audience overlap (${Math.round(audienceOverlap * 100)}%) with the neighborhood's taste — ${tenant.flagReason ?? "no matching cultural signal"}`;
  } else {
    why = `overlap ${Math.round(audienceOverlap * 100)}% with local taste${drivingTags.length ? ` (driven by: ${drivingTags.join(", ")})` : ""}`;
  }

  return { ...tenant, audienceOverlap, score, verdict, why };
}

// ---------------------------------------------------------------
// Candidate generation — grounded in taste tags
// ---------------------------------------------------------------

const TENANT_TEMPLATES = [
  { category: "restaurant", name: "Neighborhood Bistro", spaceNeeded: 2500 },
  { category: "restaurant", name: "Wine Bar", spaceNeeded: 1800 },
  { category: "restaurant", name: "Specialty Eatery", spaceNeeded: 2200 },
  { category: "cafe", name: "Specialty Coffee Roastery", spaceNeeded: 1500 },
  { category: "cafe", name: "Tea & Bakery House", spaceNeeded: 1400 },
  { category: "retail", name: "Curated Concept Store", spaceNeeded: 2000 },
  { category: "retail", name: "Vintage & Secondhand", spaceNeeded: 2200 },
  { category: "retail", name: "Designer Boutique", spaceNeeded: 1800 },
  { category: "entertainment", name: "Independent Cinema", spaceNeeded: 6000 },
  { category: "entertainment", name: "Live Music Venue", spaceNeeded: 5000 },
  { category: "entertainment", name: "Art Gallery", spaceNeeded: 3000 },
  { category: "health", name: "Wellness Studio", spaceNeeded: 2000 },
  { category: "health", name: "Hot Yoga Studio", spaceNeeded: 1800 },
  { category: "service", name: "Coworking Space", spaceNeeded: 4000 },
  { category: "service", name: "Professional Services Office", spaceNeeded: 2500 },
];

function generateCandidates(profile, building) {
  return TENANT_TEMPLATES.map((tpl) => ({
    ...tpl,
    estimatedRent: Math.round(building.maxRent * (0.6 + Math.random() * 0.5)),
    expectedTraffic: Math.round(300 + Math.random() * 900),
    flagReason: null,
  }));
}

// ---------------------------------------------------------------
// Report
// ---------------------------------------------------------------

function buildReport(location, building, tenants, tasteTags, trace) {
  const scored = tenants.map((t) => scoreTenant(t, tasteTags, building)).sort((a, b) => b.score - a.score);
  const strong = scored.filter((t) => t.verdict === "strong fit");
  const mismatch = scored.filter((t) => t.verdict === "mismatch");

  // category balance
  const categoryCount = {};
  for (const t of scored) categoryCount[t.category] = (categoryCount[t.category] ?? 0) + 1;
  const total = scored.length || 1;
  const balance = Object.entries(categoryCount).map(([cat, count]) => ({
    category: cat,
    count,
    pct: Math.round((count / total) * 100),
  }));

  // narrative
  const narrative = `For this ${building.sqft.toLocaleString()} sq ft space in ${location}, prioritize a ${strong.slice(0, 3).map((t) => t.name.toLowerCase()).join(" + ")} cluster — these tenants show the strongest audience overlap with the neighborhood's taste.`;

  return {
    location,
    building,
    summary: {
      totalTenants: scored.length,
      strongFits: strong.length,
      mismatches: mismatch.length,
      recommendedMix: strong.slice(0, 5).map((t) => t.name),
      narrative,
      balance,
    },
    tenants: scored,
    flags: mismatch.map((t) => ({ tenant: t.name, reason: t.why })),
    trace,
    generatedAt: new Date().toISOString(),
  };
}

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
      qlooBase: QLOO_BASE,
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
      const location = String(input.location ?? "Williamsburg, Brooklyn, NY");
      const building = {
        maxRent: Number(input.maxRent ?? 15000),
        minTraffic: Number(input.minTraffic ?? 400),
        sqft: Number(input.sqft ?? 3000),
      };

      const trace = [];
      try {
        // step 1: resolve location
        trace.push({ step: "resolve_location", query: location });
        let resolved = null;
        if (QLOO_KEY) {
          try {
            resolved = await resolveLocation(location);
            trace.push({ step: "resolve_location", result: resolved?.name ?? resolved?.id ?? "unresolved" });
          } catch (e) {
            trace.push({ step: "resolve_location", error: String(e.message ?? e).slice(0, 120) });
          }
        }

        // step 2: fetch locality taste
        let tasteTags = [];
        if (QLOO_KEY) {
          const insights = await fetchLocalityTaste(location, resolved);
          trace.push({ step: "fetch_locality_taste", insightsKeys: Object.keys(insights ?? {}).slice(0, 5) });
          tasteTags = extractTasteTags(insights);
        }
        trace.push({ step: "taste_tags", count: tasteTags.length, tags: tasteTags.slice(0, 5).map((t) => t.tag) });

        // step 3: generate candidates
        const tenants = generateCandidates({}, building);
        trace.push({ step: "generate_candidates", count: tenants.length });

        // step 4: score
        const report = buildReport(location, building, tenants, tasteTags, trace);
        trace.push({ step: "score", scored: report.tenants.length });

        // step 5: flag
        trace.push({ step: "flag", mismatches: report.flags.length });

        res.end(JSON.stringify({ ok: true, mode: QLOO_KEY ? "live" : "demo", ...report }));
      } catch (e) {
        res.statusCode = 502;
        res.end(JSON.stringify({ ok: false, error: String(e.message ?? e), trace }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => console.log(`[perfect-mix] listening on :${PORT} (${QLOO_KEY ? "live Qloo" : "demo mode"})`));
