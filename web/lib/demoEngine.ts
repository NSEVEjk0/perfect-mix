/**
 * Perfect Mix — client-side demo engine.
 *
 * Runs entirely in the browser when no Qloo key is configured, so the
 * deployed demo is fully standalone. Scoring mirrors the agent exactly.
 */

export interface Tenant {
  name: string;
  category: string;
  audienceOverlap: number;
  estimatedRent: number;
  expectedTraffic: number;
  spaceNeeded: number;
  score: number;
  verdict: string;
  why: string;
  flagReason?: string | null;
}

export interface Report {
  location: string;
  building: { maxRent: number; minTraffic: number; sqft: number };
  summary: {
    totalTenants: number;
    strongFits: number;
    mismatches: number;
    recommendedMix: string[];
    narrative: string;
    balance: { category: string; count: number; pct: number }[];
  };
  tenants: Tenant[];
  flags: { tenant: string; reason: string }[];
  trace?: { step: string; result?: string; count?: number; error?: string; tags?: string[] }[];
  mode: "demo" | "live";
}

interface NeighborhoodProfile {
  name: string;
  aliases: string[];
  dominantTastes: string[];
  tenants: Omit<Tenant, "score" | "verdict" | "why">[];
}

const CATEGORY_WEIGHT: Record<string, number> = {
  restaurant: 1.0,
  cafe: 0.8,
  retail: 0.9,
  entertainment: 0.7,
  health: 0.6,
  service: 0.5,
};

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  retail: "Retail",
  entertainment: "Entertainment",
  health: "Health & Wellness",
  service: "Service",
};

const NEIGHBORHOODS: NeighborhoodProfile[] = [
  {
    name: "Williamsburg, Brooklyn, NY",
    aliases: ["williamsburg", "brooklyn", "ny", "new york"],
    dominantTastes: ["indie music", "craft coffee", "natural wine", "vintage fashion", "farm-to-table"],
    tenants: [
      { name: "Devoción Coffee", category: "cafe", audienceOverlap: 0.92, estimatedRent: 8000, expectedTraffic: 900, spaceNeeded: 1500, flagReason: null },
      { name: "The Natural Wine", category: "restaurant", audienceOverlap: 0.88, estimatedRent: 11000, expectedTraffic: 700, spaceNeeded: 1800, flagReason: null },
      { name: "Awoke Vintage", category: "retail", audienceOverlap: 0.85, estimatedRent: 9500, expectedTraffic: 500, spaceNeeded: 2200, flagReason: null },
      { name: "Lilia", category: "restaurant", audienceOverlap: 0.78, estimatedRent: 13000, expectedTraffic: 800, spaceNeeded: 2500, flagReason: null },
      { name: "Nitehawk Cinema", category: "entertainment", audienceOverlap: 0.74, estimatedRent: 18000, expectedTraffic: 1200, spaceNeeded: 6000, flagReason: null },
      { name: "Rough Trade NYC", category: "retail", audienceOverlap: 0.82, estimatedRent: 7000, expectedTraffic: 450, spaceNeeded: 1800, flagReason: null },
      { name: "Brooklyn Yoga Project", category: "health", audienceOverlap: 0.68, estimatedRent: 9000, expectedTraffic: 350, spaceNeeded: 1800, flagReason: null },
      { name: "Electronics Discount Warehouse", category: "retail", audienceOverlap: 0.22, estimatedRent: 9000, expectedTraffic: 600, spaceNeeded: 3000, flagReason: "local taste skews curated/vintage; discount electronics underperforms" },
      { name: "National Fast-Food Chain", category: "restaurant", audienceOverlap: 0.18, estimatedRent: 14000, expectedTraffic: 1100, spaceNeeded: 2000, flagReason: "chain fast food conflicts with the neighborhood's farm-to-table preference" },
    ],
  },
  {
    name: "The Mission, San Francisco, CA",
    aliases: ["mission", "san francisco", "sf", "california"],
    dominantTastes: ["burritos", "craft beer", "punk rock", "street art", "tech culture"],
    tenants: [
      { name: "La Taqueria", category: "restaurant", audienceOverlap: 0.94, estimatedRent: 9000, expectedTraffic: 1100, spaceNeeded: 2000, flagReason: null },
      { name: "Barebottle Brewing", category: "restaurant", audienceOverlap: 0.87, estimatedRent: 12000, expectedTraffic: 900, spaceNeeded: 3000, flagReason: null },
      { name: "Ambiance Vintage", category: "retail", audienceOverlap: 0.83, estimatedRent: 8000, expectedTraffic: 600, spaceNeeded: 2000, flagReason: null },
      { name: "The Chapel", category: "entertainment", audienceOverlap: 0.8, estimatedRent: 16000, expectedTraffic: 1300, spaceNeeded: 5000, flagReason: null },
      { name: "Sightglass Coffee", category: "cafe", audienceOverlap: 0.79, estimatedRent: 7500, expectedTraffic: 800, spaceNeeded: 1500, flagReason: null },
      { name: "Luxury Fashion Boutique", category: "retail", audienceOverlap: 0.25, estimatedRent: 11000, expectedTraffic: 300, spaceNeeded: 1800, flagReason: "luxury pricing conflicts with the neighborhood's streetwear/punk culture" },
      { name: "Corporate Bank Branch", category: "service", audienceOverlap: 0.2, estimatedRent: 15000, expectedTraffic: 400, spaceNeeded: 2500, flagReason: "institutional banking does not match the local independent-business culture" },
    ],
  },
  {
    name: "West Loop, Chicago, IL",
    aliases: ["west loop", "chicago", "illinois"],
    dominantTastes: ["fine dining", "architecture", "jazz", "craft cocktails", "art galleries"],
    tenants: [
      { name: "Aba", category: "restaurant", audienceOverlap: 0.9, estimatedRent: 14000, expectedTraffic: 700, spaceNeeded: 2500, flagReason: null },
      { name: "The Allis", category: "restaurant", audienceOverlap: 0.86, estimatedRent: 12000, expectedTraffic: 600, spaceNeeded: 1800, flagReason: null },
      { name: "Monique Meloche Gallery", category: "entertainment", audienceOverlap: 0.84, estimatedRent: 10000, expectedTraffic: 400, spaceNeeded: 3000, flagReason: null },
      { name: "Perman Wine Selections", category: "retail", audienceOverlap: 0.82, estimatedRent: 8500, expectedTraffic: 350, spaceNeeded: 1500, flagReason: null },
      { name: "CB2", category: "retail", audienceOverlap: 0.75, estimatedRent: 13000, expectedTraffic: 450, spaceNeeded: 3000, flagReason: null },
      { name: "Mattress Firm", category: "retail", audienceOverlap: 0.2, estimatedRent: 12000, expectedTraffic: 500, spaceNeeded: 5000, flagReason: "warehouse retail conflicts with the neighborhood's curated, design-forward taste" },
      { name: "Payday Loan Office", category: "service", audienceOverlap: 0.12, estimatedRent: 8000, expectedTraffic: 300, spaceNeeded: 1500, flagReason: "predatory lending does not fit the high-income, design-conscious demographic" },
    ],
  },
];

const DEFAULT_NEIGHBORHOOD = NEIGHBORHOODS[0];

/** Fuzzy match: score a location string against each neighborhood's aliases. */
function findNeighborhood(location: string): NeighborhoodProfile {
  const loc = location.toLowerCase();
  let best: NeighborhoodProfile | null = null;
  let bestScore = 0;
  for (const n of NEIGHBORHOODS) {
    for (const a of n.aliases) {
      if (loc.includes(a)) {
        const score = a.length; // longer alias match = more specific
        if (score > bestScore) {
          bestScore = score;
          best = n;
        }
      }
    }
  }
  return best ?? DEFAULT_NEIGHBORHOOD;
}

function scoreTenant(tenant: Omit<Tenant, "score" | "verdict" | "why">, building: Report["building"], tastes: string[]): Tenant {
  const audienceOverlap = tenant.audienceOverlap;
  const categoryWeight = CATEGORY_WEIGHT[tenant.category] ?? 0.5;
  const budgetFit = tenant.estimatedRent <= building.maxRent ? 1 : 0.3;
  const trafficFit = tenant.expectedTraffic >= building.minTraffic ? 1 : 0.4;
  const spaceFit = tenant.spaceNeeded <= building.sqft ? 1 : 0.5;

  const score = Math.round(
    (audienceOverlap * 0.5 + categoryWeight * 0.2 + budgetFit * 0.15 + trafficFit * 0.1 + spaceFit * 0.05) * 100
  );

  let verdict: string;
  if (audienceOverlap < 0.3) {
    verdict = "mismatch";
  } else if (score >= 75) {
    verdict = "strong fit";
  } else if (score >= 55) {
    verdict = "moderate fit";
  } else {
    verdict = "mismatch";
  }

  let why: string;
  if (verdict === "mismatch") {
    why = `low audience overlap (${Math.round(audienceOverlap * 100)}%) with the neighborhood's taste — ${tenant.flagReason ?? "no matching cultural signal"}`;
  } else {
    why = `overlap ${Math.round(audienceOverlap * 100)}% with local taste (driven by: ${tastes.slice(0, 3).join(", ")})`;
  }

  return { ...tenant, score, verdict, why };
}

export function analyzeDemo(location: string, maxRent: number, minTraffic: number, sqft: number): Report {
  const neighborhood = findNeighborhood(location);
  const building = { maxRent, minTraffic, sqft };

  const tenants = neighborhood.tenants
    .map((t) => scoreTenant(t, building, neighborhood.dominantTastes))
    .sort((a, b) => b.score - a.score);

  const strong = tenants.filter((t) => t.verdict === "strong fit");
  const mismatch = tenants.filter((t) => t.verdict === "mismatch");

  const categoryCount: Record<string, number> = {};
  for (const t of tenants) categoryCount[t.category] = (categoryCount[t.category] ?? 0) + 1;
  const total = tenants.length || 1;
  const balance = Object.entries(categoryCount).map(([cat, count]) => ({
    category: CATEGORY_LABEL[cat] ?? cat,
    count,
    pct: Math.round((count / total) * 100),
  }));

  const narrative = `For this ${sqft.toLocaleString()} sq ft space in ${neighborhood.name}, prioritize a ${strong.slice(0, 3).map((t) => t.name.toLowerCase()).join(" + ")} cluster — these tenants show the strongest audience overlap with the neighborhood's taste.`;

  return {
    location: neighborhood.name,
    building,
    summary: {
      totalTenants: tenants.length,
      strongFits: strong.length,
      mismatches: mismatch.length,
      recommendedMix: strong.slice(0, 5).map((t) => t.name),
      narrative,
      balance,
    },
    tenants,
    flags: mismatch.map((t) => ({ tenant: t.name, reason: t.why })),
    trace: [
      { step: "resolve_location", result: neighborhood.name },
      { step: "fetch_locality_taste", tags: neighborhood.dominantTastes },
      { step: "generate_candidates", count: tenants.length },
      { step: "score", count: tenants.length },
      { step: "flag", count: mismatch.length },
    ],
    mode: "demo",
  };
}
