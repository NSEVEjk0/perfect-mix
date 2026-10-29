/**
 * Perfect Mix — client-side demo engine.
 *
 * When no Qloo API key is configured, the analysis runs entirely in the
 * browser. This keeps the deployed demo fully functional and standalone.
 * The scoring logic mirrors the agent exactly, so switching to live mode
 * (with a Qloo key) produces the same shape of report.
 */

export interface Tenant {
  name: string;
  category: string;
  audienceOverlap: number;
  estimatedRent: number;
  expectedTraffic: number;
  score: number;
  verdict: string;
  flagReason?: string | null;
}

export interface Report {
  location: string;
  building: { maxRent: number; minTraffic: number; sqft: number };
  summary: { totalTenants: number; strongFits: number; mismatches: number; recommendedMix: string[] };
  tenants: Tenant[];
  flags: { tenant: string; reason: string }[];
  mode: "demo";
}

interface NeighborhoodProfile {
  name: string;
  aliases: string[];
  dominantTastes: string[];
  incomeBand: string;
  footTraffic: string;
  tenants: Omit<Tenant, "score" | "verdict">[];
}

const CATEGORY_WEIGHT: Record<string, number> = {
  restaurant: 1.0,
  cafe: 0.8,
  retail: 0.9,
  entertainment: 0.7,
  health: 0.6,
  service: 0.5,
};

const NEIGHBORHOODS: NeighborhoodProfile[] = [
  {
    name: "Williamsburg, Brooklyn, NY",
    aliases: ["williamsburg", "brooklyn", "ny", "new york"],
    dominantTastes: ["indie music", "craft coffee", "natural wine", "vintage fashion", "farm-to-table"],
    incomeBand: "upper-middle",
    footTraffic: "high",
    tenants: [
      { name: "Third Wave Coffee Lab", category: "cafe", audienceOverlap: 0.92, estimatedRent: 8000, expectedTraffic: 900, flagReason: null },
      { name: "Natural Wine Bar", category: "restaurant", audienceOverlap: 0.88, estimatedRent: 11000, expectedTraffic: 700, flagReason: null },
      { name: "Vintage Denim Studio", category: "retail", audienceOverlap: 0.85, estimatedRent: 9500, expectedTraffic: 500, flagReason: null },
      { name: "Farm-to-Table Kitchen", category: "restaurant", audienceOverlap: 0.78, estimatedRent: 13000, expectedTraffic: 800, flagReason: null },
      { name: "Independent Cinema", category: "entertainment", audienceOverlap: 0.74, estimatedRent: 18000, expectedTraffic: 1200, flagReason: null },
      { name: "Vinyl & Vintage Records", category: "retail", audienceOverlap: 0.82, estimatedRent: 7000, expectedTraffic: 450, flagReason: null },
      { name: "Hot Yoga Studio", category: "health", audienceOverlap: 0.68, estimatedRent: 9000, expectedTraffic: 350, flagReason: null },
      { name: "Discount Electronics Outlet", category: "retail", audienceOverlap: 0.22, estimatedRent: 9000, expectedTraffic: 600, flagReason: "local taste skews curated/vintage; discount electronics underperforms" },
      { name: "Fast-Food Chain", category: "restaurant", audienceOverlap: 0.18, estimatedRent: 14000, expectedTraffic: 1100, flagReason: "chain fast food conflicts with the neighborhood's farm-to-table preference" },
    ],
  },
  {
    name: "The Mission, San Francisco, CA",
    aliases: ["mission", "san francisco", "sf", "california"],
    dominantTastes: ["burritos", "craft beer", "punk rock", "street art", "tech culture"],
    incomeBand: "mixed",
    footTraffic: "very high",
    tenants: [
      { name: "Taqueria Moderna", category: "restaurant", audienceOverlap: 0.94, estimatedRent: 9000, expectedTraffic: 1100, flagReason: null },
      { name: "Craft Beer Hall", category: "restaurant", audienceOverlap: 0.87, estimatedRent: 12000, expectedTraffic: 900, flagReason: null },
      { name: "Vintage Streetwear", category: "retail", audienceOverlap: 0.83, estimatedRent: 8000, expectedTraffic: 600, flagReason: null },
      { name: "Live Music Venue", category: "entertainment", audienceOverlap: 0.8, estimatedRent: 16000, expectedTraffic: 1300, flagReason: null },
      { name: "Coffee Roastery", category: "cafe", audienceOverlap: 0.79, estimatedRent: 7500, expectedTraffic: 800, flagReason: null },
      { name: "Luxury Fashion Boutique", category: "retail", audienceOverlap: 0.25, estimatedRent: 11000, expectedTraffic: 300, flagReason: "luxury pricing conflicts with the neighborhood's streetwear/punk culture" },
      { name: "Corporate Bank Branch", category: "service", audienceOverlap: 0.2, estimatedRent: 15000, expectedTraffic: 400, flagReason: "institutional banking does not match the local independent-business culture" },
    ],
  },
  {
    name: "West Loop, Chicago, IL",
    aliases: ["west loop", "chicago", "illinois"],
    dominantTastes: ["fine dining", "architecture", "jazz", "craft cocktails", "art galleries"],
    incomeBand: "high",
    footTraffic: "medium",
    tenants: [
      { name: "Modern American Bistro", category: "restaurant", audienceOverlap: 0.9, estimatedRent: 14000, expectedTraffic: 700, flagReason: null },
      { name: "Craft Cocktail Lounge", category: "restaurant", audienceOverlap: 0.86, estimatedRent: 12000, expectedTraffic: 600, flagReason: null },
      { name: "Contemporary Art Gallery", category: "entertainment", audienceOverlap: 0.84, estimatedRent: 10000, expectedTraffic: 400, flagReason: null },
      { name: "Specialty Wine Shop", category: "retail", audienceOverlap: 0.82, estimatedRent: 8500, expectedTraffic: 350, flagReason: null },
      { name: "Upscale Home Goods", category: "retail", audienceOverlap: 0.75, estimatedRent: 13000, expectedTraffic: 450, flagReason: null },
      { name: "Discount Mattress Warehouse", category: "retail", audienceOverlap: 0.2, estimatedRent: 12000, expectedTraffic: 500, flagReason: "warehouse retail conflicts with the neighborhood's curated, design-forward taste" },
      { name: "Payday Loan Office", category: "service", audienceOverlap: 0.12, estimatedRent: 8000, expectedTraffic: 300, flagReason: "predatory lending does not fit the high-income, design-conscious demographic" },
    ],
  },
];

const DEFAULT_NEIGHBORHOOD = NEIGHBORHOODS[0];

function findNeighborhood(location: string): NeighborhoodProfile {
  const loc = location.toLowerCase();
  for (const n of NEIGHBORHOODS) {
    if (n.aliases.some((a) => loc.includes(a))) return n;
  }
  return DEFAULT_NEIGHBORHOOD;
}

function scoreTenant(tenant: Omit<Tenant, "score" | "verdict">, building: Report["building"]): Tenant {
  const audienceOverlap = tenant.audienceOverlap;
  const categoryWeight = CATEGORY_WEIGHT[tenant.category] ?? 0.5;
  const budgetFit = tenant.estimatedRent <= building.maxRent ? 1 : 0.3;
  const trafficFit = tenant.expectedTraffic >= building.minTraffic ? 1 : 0.4;

  const score = Math.round(
    (audienceOverlap * 0.55 + categoryWeight * 0.2 + budgetFit * 0.15 + trafficFit * 0.1) * 100
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

  return { ...tenant, score, verdict };
}

export function analyzeDemo(location: string, maxRent: number, minTraffic: number, sqft: number): Report {
  const neighborhood = findNeighborhood(location);
  const building = { maxRent, minTraffic, sqft };

  const tenants = neighborhood.tenants
    .map((t) => scoreTenant(t, building))
    .sort((a, b) => b.score - a.score);

  const strong = tenants.filter((t) => t.verdict === "strong fit");
  const mismatch = tenants.filter((t) => t.verdict === "mismatch");

  return {
    location: neighborhood.name,
    building,
    summary: {
      totalTenants: tenants.length,
      strongFits: strong.length,
      mismatches: mismatch.length,
      recommendedMix: strong.slice(0, 5).map((t) => t.name),
    },
    tenants,
    flags: mismatch.map((t) => ({
      tenant: t.name,
      reason: t.flagReason ?? "audience does not match local taste",
    })),
    mode: "demo",
  };
}
