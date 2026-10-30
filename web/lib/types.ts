export type Family = "food" | "retail" | "wellness" | "culture";
export interface AnalysisInput {
  location: string;
  sqft: number;
  monthlyRent: number;
  maxUnits: number;
  focus: "balanced" | "food" | "lifestyle";
  proposed: string;
}
export interface Evidence {
  id: string;
  name: string;
  affinity: number | null;
  address?: string;
  lat?: number;
  lon?: number;
  distance?: number;
  image?: string;
  website?: string;
  tags: { id: string; name: string }[];
  contributors: { id: string; name: string; weight: number }[];
}
export interface Taste {
  id: string;
  name: string;
  affinity: number | null;
}
export interface Concept {
  id: string;
  name: string;
  family: Family;
  description: string;
  minSqft: number;
  tag: Taste | null;
  affinity: number | null;
  rank: number | null;
  examples: Evidence[];
  reason: string;
}
export interface Unit {
  conceptId: string;
  name: string;
  family: Family;
  sqft: number;
  monthlyRent: number;
}
export interface TraceStep {
  id: number;
  tool: string;
  title: string;
  detail: string;
  status: "running" | "done" | "limited";
  params?: Record<string, string>;
  count?: number;
  durationMs?: number;
}
export interface AnalysisReport {
  id: string;
  generatedAt: string;
  input: AnalysisInput;
  locality: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
  };
  radius: number;
  tastes: Taste[];
  localPlaces: Evidence[];
  seedPlaces: Evidence[];
  brands: Evidence[];
  artists: Evidence[];
  concepts: Concept[];
  mix: {
    units: Unit[];
    usableSqft: number;
    usedSqft: number;
    sharedSqft: number;
    remainingSqft: number;
    allocatedRent: number;
  };
  proposed: {
    query: string;
    tags: Taste[];
    affinity: number | null;
    comparison: string;
    examples: Evidence[];
  } | null;
  narrative: string;
  nextSteps: string[];
  limitations: string[];
  trace: TraceStep[];
}
