import "server-only";
import { qloo, entities, tags, evidence, findTag } from "./qloo";
import { planMix } from "./planner";
import { selectLocality } from "./locality";
import type {
  AnalysisInput,
  AnalysisReport,
  Concept,
  Evidence,
  Family,
  Taste,
  TraceStep,
} from "./types";

const catalog: {
  id: string;
  name: string;
  family: Family;
  minSqft: number;
  query: string;
  description: string;
}[] = [
  {
    id: "coffee",
    name: "Specialty coffee",
    family: "food",
    minSqft: 850,
    query: "Coffee shop",
    description:
      "A neighborhood ritual, from the first cup to the afternoon catch-up.",
  },
  {
    id: "restaurant",
    name: "Neighborhood dining",
    family: "food",
    minSqft: 1800,
    query: "Restaurant",
    description: "A food-led anchor with a reason to return in the evening.",
  },
  {
    id: "wine",
    name: "Wine & conversation",
    family: "food",
    minSqft: 1100,
    query: "Wine bar",
    description:
      "A smaller evening destination with a social, intimate atmosphere.",
  },
  {
    id: "retail",
    name: "Independent fashion",
    family: "retail",
    minSqft: 950,
    query: "Clothing store",
    description:
      "A considered retail edit rather than a generic shopping destination.",
  },
  {
    id: "wellness",
    name: "Movement studio",
    family: "wellness",
    minSqft: 1200,
    query: "Gym",
    description: "An everyday fitness destination built around repeat visits.",
  },
  {
    id: "gallery",
    name: "Gallery & creative space",
    family: "culture",
    minSqft: 800,
    query: "Art gallery",
    description:
      "A cultural anchor for exhibitions, discovery, and small gatherings.",
  },
  {
    id: "books",
    name: "Independent bookshop",
    family: "culture",
    minSqft: 700,
    query: "Book store",
    description:
      "A quieter destination for discovery and community programming.",
  },
];

export async function analyze(
  input: AnalysisInput,
  onStep: (step: TraceStep) => void,
): Promise<AnalysisReport> {
  const trace: TraceStep[] = [];
  const limitations: string[] = [];
  async function tool<T>(
    name: string,
    title: string,
    params: Record<string, string>,
    fn: () => Promise<T>,
    describe: (result: T) => string,
  ): Promise<T> {
    const step: TraceStep = {
      id: trace.length,
      tool: name,
      title,
      detail: "Researching…",
      status: "running",
      params,
    };
    trace.push(step);
    onStep({ ...step });
    const start = Date.now();
    try {
      const result = await fn();
      Object.assign(step, {
        detail: describe(result),
        status: "done",
        durationMs: Date.now() - start,
      });
      onStep({ ...step });
      return result;
    } catch (error) {
      Object.assign(step, {
        detail: error instanceof Error ? error.message : "Research unavailable",
        status: "limited",
        durationMs: Date.now() - start,
      });
      onStep({ ...step });
      throw error;
    }
  }
  const resolved = await tool(
    "Qloo /search",
    "Locate the neighborhood",
    { query: input.location, types: "urn:entity:locality" },
    () =>
      qloo("/search", {
        query: input.location,
        types: "urn:entity:locality",
        take: "20",
      }),
    (data) => `${entities(data).length} locality matches found`,
  );
  let loc = selectLocality(input.location, entities(resolved));
  if (!loc) {
    const primary = input.location
      .split(",")[0]
      .replace(/^the\s+/i, "")
      .trim();
    const params = { query: primary, types: "urn:entity:locality", take: "30" };
    const narrowed = await tool(
      "Qloo /search",
      "Disambiguate the requested place",
      params,
      () => qloo("/search", params),
      (data) =>
        `${entities(data).length} candidates checked against the requested regional context`,
    );
    loc = selectLocality(input.location, entities(narrowed));
  }
  if (!loc)
    throw new Error(
      "Qloo could not match both the place and its regional context. Try an exact neighborhood and city, such as Mission District, San Francisco. We will not substitute an unrelated location.",
    );
  const locality = {
    id: loc.entity_id,
    name: loc.name,
    address: loc.disambiguation ?? loc.name,
    lat: loc.location.lat,
    lon: loc.location.lon,
  };
  const point = `POINT(${locality.lon} ${locality.lat})`;
  let radius = 2500;
  const nearbyParams = {
    "filter.type": "urn:entity:place",
    "filter.location": point,
    "filter.location.radius": String(radius),
    "signal.location": point,
    take: "30",
  };
  let nearby = await tool(
    "Qloo /v2/insights",
    "Read nearby businesses",
    nearbyParams,
    () => qloo("/v2/insights", nearbyParams),
    (d) => `${entities(d).length} nearby places returned within 2.5 km`,
  );
  if (entities(nearby).length < 4) {
    radius = 5000;
    const broader = {
      ...nearbyParams,
      "filter.location.radius": String(radius),
    };
    nearby = await tool(
      "Qloo /v2/insights",
      "Expand sparse local coverage",
      broader,
      () => qloo("/v2/insights", broader),
      (d) => `${entities(d).length} places returned within 5 km`,
    );
    limitations.push(
      "Local coverage was sparse. Nearby business research was expanded to a 5 km radius.",
    );
  }
  const localPlaces = entities(nearby)
    .filter((e) => e.properties?.is_closed !== true)
    .map((e) => evidence(e));
  if (localPlaces.length < 2)
    throw new Error(
      "Qloo has too little nearby business data to support a recommendation here. Try another neighborhood; we will not substitute a different city.",
    );
  const commercial = localPlaces.filter(
    (e) =>
      !e.tags.some((t) =>
        /:park$|:hotel$|:tourist_attraction$|:stadium$/.test(t.id),
      ),
  );
  const seedPlaces = (commercial.length >= 3 ? commercial : localPlaces).slice(
    0,
    5,
  );
  const signals = {
    "signal.interests.entities": seedPlaces.map((e) => e.id).join(","),
  };
  const tagLookups = await tool(
    "Qloo /v2/tags",
    "Resolve tenant concepts to real Qloo tags",
    { "filter.query": catalog.map((c) => c.query).join("; ") },
    () =>
      Promise.all(
        catalog.map(async (c) => ({ concept: c, tag: await findTag(c.query) })),
      ),
    (found) =>
      `${found.filter((c) => c.tag).length} concepts mapped to valid tag IDs`,
  );
  const tasteParams = { "filter.type": "urn:tag", ...signals, take: "35" };
  const tasteData = await tool(
    "Qloo /v2/insights",
    "Infer the audience's cultural preferences",
    tasteParams,
    () => qloo("/v2/insights", tasteParams),
    (d) =>
      `${tags(d).length} taste signals inferred from ${seedPlaces.length} nearby anchors`,
  );
  const tastes = tags(tasteData);
  const validTags = tagLookups
    .map((c) => c.tag?.id)
    .filter(Boolean)
    .join(",");
  const conceptParams = {
    "filter.type": "urn:tag",
    ...signals,
    "filter.results.tags": validTags,
    take: "20",
  };
  const affinityData = validTags
    ? await tool(
        "Qloo /v2/insights",
        "Compare cultural fit across tenant types",
        conceptParams,
        () => qloo("/v2/insights", conceptParams),
        (d) => `${tags(d).length} measured concept affinities returned`,
      )
    : { results: { tags: [] } };
  const conceptAffinities = tags(affinityData);
  const concepts: Concept[] = tagLookups.map(({ concept, tag }) => ({
    ...concept,
    tag,
    affinity: conceptAffinities.find((t) => t.id === tag?.id)?.affinity ?? null,
    rank: null,
    examples: [],
    reason: "",
  }));
  concepts.sort((a, b) => (b.affinity ?? -1) - (a.affinity ?? -1));
  concepts.forEach((c, i) => {
    c.rank = c.affinity !== null ? i + 1 : null;
    c.reason =
      c.affinity === null
        ? "Qloo did not return enough evidence for this concept; it is excluded from the automatic mix."
        : `Qloo ranks ${c.tag?.name.toLowerCase()} #${c.rank} among the measured concepts for the audience of ${seedPlaces
            .slice(0, 2)
            .map((e) => e.name)
            .join(" and ")}.`;
  });
  const mix = planMix(concepts, input);
  // Research selected concepts plus the first alternative; adapt calls to the actual decision.
  const chosen = concepts.filter((c) =>
    mix.units.some((u) => u.conceptId === c.id),
  );
  const researched = [
    ...chosen,
    ...concepts
      .filter((c) => !chosen.includes(c) && c.affinity !== null)
      .slice(0, 1),
  ];
  await tool(
    "Qloo /v2/insights",
    "Find local reference operators for the shortlist",
    {
      concepts: researched.map((c) => c.name).join(", "),
      radius: String(radius),
    },
    async () => {
      await Promise.all(
        researched.map(async (c) => {
          if (!c.tag) return;
          const params = {
            "filter.type": "urn:entity:place",
            "filter.location": point,
            "filter.location.radius": String(radius),
            ...signals,
            "filter.tags": c.tag.id,
            "feature.explainability": "true",
            take: "4",
          };
          try {
            c.examples = entities(await qloo("/v2/insights", params))
              .filter((e) => e.properties?.is_closed !== true)
              .map((e) => evidence(e, seedPlaces));
          } catch {
            limitations.push(
              `Local reference operators could not be loaded for ${c.name}.`,
            );
          }
        }),
      );
      return researched;
    },
    (found) =>
      `${found.reduce((sum, c) => sum + c.examples.length, 0)} reference operators found; these are examples, not available tenants`,
  );
  const cross = await tool(
    "Qloo /v2/insights",
    "Connect local taste to brands and music",
    {
      ...signals,
      types: "urn:entity:brand; urn:entity:artist",
      "feature.explainability": "true",
    },
    async () => {
      const results = await Promise.allSettled(
        ["urn:entity:brand", "urn:entity:artist"].map((type) =>
          qloo("/v2/insights", {
            "filter.type": type,
            ...signals,
            "feature.explainability": "true",
            take: "6",
          }),
        ),
      );
      return results.map((r) =>
        r.status === "fulfilled"
          ? entities(r.value).map((e) => evidence(e, seedPlaces))
          : [],
      );
    },
    (result) =>
      `${result[0].length} brands and ${result[1].length} artists inferred from the same local taste anchors`,
  );
  let proposed: AnalysisReport["proposed"] = null;
  if (input.proposed) {
    proposed = await tool(
      "Qloo /v2/tags + /v2/insights",
      "Test your business idea against the evidence",
      { query: input.proposed },
      async () => {
        const exactTag = await findTag(input.proposed);
        const found = exactTag
          ? [exactTag]
          : tags(
              await qloo("/v2/tags", {
                "filter.query": input.proposed,
                "feature.semantic_search": "true",
                take: "20",
              }),
            );
        const supported = found
          .filter((t) => t.id.includes(":place:") || t.id.includes(":qloo:"))
          .sort(
            (a, b) =>
              Number(b.id.startsWith("urn:tag:genre:place:")) -
              Number(a.id.startsWith("urn:tag:genre:place:")),
          )
          .slice(0, 3);
        if (!supported.length)
          return {
            query: input.proposed,
            tags: [],
            affinity: null,
            comparison:
              "Qloo could not map this description to a supported business tag. Try a simpler category such as coffee shop or clothing store.",
            examples: [],
          };
        const result = tags(
          await qloo("/v2/insights", {
            "filter.type": "urn:tag",
            ...signals,
            "filter.results.tags": supported.map((t) => t.id).join(","),
            take: "5",
          }),
        );
        const best = result.find((t) => t.affinity !== null);
        const exact = concepts.find((c) => c.tag?.id === best?.id);
        return {
          query: input.proposed,
          tags: supported,
          affinity: best?.affinity ?? null,
          comparison: best
            ? `Interpreted as ${best.name}. ${exact ? `This is #${exact.rank} in the concept comparison.` : "This separate semantic query is exploratory; its score is not treated as a directly comparable concept rank."} Verify the interpretation before making a leasing decision.`
            : "Qloo resolved tags, but did not return an affinity for the local audience. This is missing evidence, not a rejection.",
          examples: [],
        };
      },
      (result) =>
        result.affinity !== null
          ? `Mapped to ${result.tags.map((t) => t.name).join(", ")}; measured affinity ${result.affinity.toFixed(4)}`
          : "No measured affinity; reported as unresolved",
    ).catch(() => ({
      query: input.proposed,
      tags: [],
      affinity: null,
      comparison:
        "The optional business query could not be completed. The leasing plan still uses the measured concept evidence above; try a simpler business category for this separate query.",
      examples: [],
    }));
  }
  const planStep: TraceStep = {
    id: trace.length,
    tool: "Constraint planner",
    title: "Build a feasible leasing scenario",
    detail: `${mix.units.length} concepts, ${mix.usedSqft.toLocaleString()} of ${mix.usableSqft.toLocaleString()} usable sq ft; 10% reserved for shared space`,
    status: "done",
  };
  trace.push(planStep);
  onStep(planStep);
  limitations.push(
    "Taste signals describe the inferred audience of nearby Qloo places, not a census of residents or a guarantee of commercial demand.",
    "Affinity is Qloo's relative taste measure, not an audience percentage, revenue forecast, or probability of success. Rankings compare the concept tags in this query.",
    "Area allowances and the 10% shared-space reserve are prototype planning assumptions. Rent is allocated from your target in proportion to usable floor area; operator affordability is unverified.",
    "Reference operators are existing businesses, not a verified pipeline of available tenants. The nearby results are a ranked sample, not a complete competition count.",
  );
  if (!cross[0].length || !cross[1].length)
    limitations.push(
      "Some cross-domain signals were unavailable; no substitute brands or artists were generated.",
    );
  const first = mix.units[0];
  const narrative = first
    ? `Lead with ${first.name.toLowerCase()}${mix.units[1] ? `, paired with ${mix.units[1].name.toLowerCase()}` : ""}. This scenario follows the strongest measured concept signals that fit your brief and floor area. ${mix.remainingSqft ? `${mix.remainingSqft.toLocaleString()} usable sq ft remains for layout flexibility or further research.` : "The concepts use the available planning area."}`
    : "The measured concepts do not fit the current space or focus. Expand the area, change the focus, or use the evidence below to research a smaller format.";
  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    input,
    locality,
    radius,
    tastes,
    localPlaces,
    seedPlaces,
    brands: cross[0],
    artists: cross[1],
    concepts,
    mix,
    proposed,
    narrative,
    nextSteps: [
      first
        ? `Validate a ${first.sqft.toLocaleString()} sq ft ${first.name.toLowerCase()} format with a local operator and an architect.`
        : "Validate a smaller operator format before signing a lease.",
      `Walk the catchment around ${locality.name}; count direct competitors and verify daytime and evening footfall.`,
      `Test the $${input.monthlyRent.toLocaleString()}/month total rent target against operator unit economics and local lease comparables.`,
      "Use a pop-up or customer interviews to test whether the inferred taste signals translate into repeat purchases.",
    ],
    limitations: [...new Set(limitations)],
    trace,
  };
}
