import { planMix } from "./planner";
import type { AnalysisInput, AnalysisReport, Concept, Evidence, ResolvedLocation, TraceStep } from "./types";

export function locationReport(
  input: AnalysisInput,
  locality: ResolvedLocation,
  radius: number,
  concepts: Concept[],
  localPlaces: Evidence[],
  seedPlaces: Evidence[],
  trace: TraceStep[],
  limitations: string[],
): AnalysisReport {
  const unmeasured = concepts.map((c) => ({
    ...c, affinity: null, rank: null, examples: [],
    reason: "A standard format to investigate. There is no measured local taste affinity for this option.",
  }));
  return {
    id: crypto.randomUUID(), generatedAt: new Date().toISOString(), input,
    locality, radius, concepts: unmeasured, localPlaces, seedPlaces, tastes: [], brands: [], artists: [],
    mix: planMix(unmeasured, input), proposed: input.proposed ? {
      query: input.proposed, tags: [], affinity: null, examples: [],
      comparison: "Keep this idea in your research brief. There is not enough cultural evidence to score it for this location.",
    } : null,
    coverage: {
      status: localPlaces.length ? "partial" : "location-only",
      label: localPlaces.length ? "Some place evidence, no measured shortlist" : "Location found · cultural evidence is limited",
      detail: `Your location and space brief are available. ${localPlaces.length} open Qloo places were returned within ${radius / 1000} km. The business formats below are unranked planning options, not local recommendations.`,
    },
    narrative: "Start with the resolved location and the space you have. Review the format footprints below, then validate the audience and demand locally before choosing a tenant. No local-fit scores have been filled in.",
    nextSteps: [
      `Review the mapped location: ${locality.address}.`,
      "Compare the listed format footprints with your building's access, services, and permitted uses.",
      "Walk the catchment, record competitors and footfall, and interview prospective customers.",
      `Check the $${input.monthlyRent.toLocaleString()}/month rent target with local operators and lease comparables.`,
    ],
    limitations: [...new Set([
      ...limitations,
      "Insufficient cultural evidence: no tenant recommendation, audience percentage, or performance forecast has been generated.",
      "Business footprints and the 10% shared-space reserve are prototype planning assumptions, not measurements of this property.",
      ...(locality.source === "GeoNames" ? ["Location facts come from GeoNames via Open-Meteo. Population refers to the returned locality and is not a count of customers in the catchment."] : []),
    ])], trace,
  };
}
