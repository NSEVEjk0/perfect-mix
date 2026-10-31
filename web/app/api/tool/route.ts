export async function GET() {
  return Response.json(
    {
      name: "perfectmix_analyze_site",
      description:
        "Research a retail site's cultural catchment with Qloo and return a feasible tenant-concept mix, real evidence, assumptions, and a trace. Use as a leasing research tool in an agent. Never interpret taste affinity as a sales forecast or an audience percentage.",
      endpoint: {
        method: "POST",
        path: "/api/analyze",
        contentType: "application/json",
        accept: "application/json",
      },
      inputSchema: {
        type: "object",
        required: ["location", "sqft", "monthlyRent", "maxUnits"],
        properties: {
          location: {
            type: "string",
            description: "Neighborhood and city, city and country, postal code, or latitude, longitude. Unresolved smaller places may return explicitly labeled broader regional context.",
            minLength: 3,
            maxLength: 160,
          },
          sqft: { type: "number", minimum: 300, maximum: 100000 },
          monthlyRent: {
            type: "number",
            minimum: 0,
            maximum: 1000000,
            description:
              "User's total monthly asking-rent planning target in USD; not a measured market rent.",
          },
          maxUnits: { type: "integer", minimum: 1, maximum: 4 },
          focus: {
            type: "string",
            enum: ["balanced", "food", "lifestyle"],
            default: "balanced",
          },
          proposed: {
            type: "string",
            maxLength: 120,
            description: "Optional business type for semantic tag research.",
          },
        },
      },
      provider: "Qloo Taste AI",
      workflow:
        "Resolve the location with Qloo or worldwide GeoNames lookup → inspect nearby places, expanding a disclosed radius when sparse → infer audience tastes when available → compare concept tags → constrain the space scenario. If cultural evidence is insufficient, return geographic facts, available places, and unranked planning formats without inventing affinities.",
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
