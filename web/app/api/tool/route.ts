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
            description: "Neighborhood and city, or a city name.",
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
        "Resolve locality → inspect nearby places → infer audience tastes → compare concept tags → research selected operators → connect brands/music → constrain the space scenario.",
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
