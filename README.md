# PerfectMix

Find the businesses that belong. PerfectMix turns a neighborhood and a vacant retail space into an evidence-backed leasing research scenario.

Built for the Qloo Agentic Hackathon. MIT licensed.

## The product

- Resolve a neighborhood or city through Qloo entity search.
- Inspect nearby open places around its actual coordinates. Sparse coverage triggers a disclosed expansion from 2.5 km to 5 km.
- Use nearby business audiences as cultural taste anchors, then infer tastes and compare seven tenant concept tags in the same Qloo query.
- Research local reference operators for the selected concepts and an alternative.
- Infer brands and music from the same local anchors, with Qloo explainability contributions when available.
- Enumerate feasible concept combinations under floor-area, category-focus, and unit-count constraints.
- Show an interactive allocation diagram, measured affinities, evidence, research activity, next validation steps, saved reports, and a downloadable brief.
- Test an optional business idea through Qloo semantic tag search. The report shows exactly how the description was interpreted.

All cultural evidence comes from the live Qloo hackathon API. There is no hardcoded neighborhood demo, invented affinity, random rent estimate, or fabricated LLM comparison. The research workflow adapts to coverage and to the selected shortlist. It uses Qloo tools and a deterministic constraint planner; it does not currently use an LLM.

## Run locally

Node.js 22.18+ recommended.

```bash
cd web
npm ci
cp .env.example .env.local
# Put your Qloo hackathon key in .env.local.
npm run dev
```

Open http://localhost:3004. For a production build, run `npm run build` and `npm start`.

The key stays server-side. The API uses GET requests to https://hackathon.api.qloo.com with the X-Api-Key header. Never add the key to NEXT_PUBLIC variables or source control. On Vercel, configure QLOO_KEY in the project's server environment. The website and server API deploy together from the web directory.

## Use as an agent tool

GET /api/tool returns a tool description and JSON input schema. POST /api/analyze accepts the following JSON and returns a full research report. Agents can invoke this tool to ground a leasing decision in Qloo evidence rather than guess cultural fit.

```json
{
  "location": "Williamsburg, Brooklyn, NY",
  "sqft": 3000,
  "monthlyRent": 15000,
  "maxUnits": 2,
  "focus": "balanced",
  "proposed": "wine bar"
}
```

With Accept: text/event-stream, the endpoint streams step, report, and error events. Otherwise it returns JSON. Responses from Qloo may be cached for up to 15 minutes. The public endpoint limits repeated analyses per client. No Qloo credentials appear in responses.

## What the numbers mean

Qloo affinity is a relative taste measure, not an audience percentage, projected revenue, or success probability. The concept comparison uses the same local audience anchors. Music and brand scores come from separate cross-domain queries and are not treated as comparable concept ranks.

The prototype reserves 10% of gross area for shared space and uses fixed, documented concept area allowances. These are planning assumptions, not measurements of reference businesses. Monthly asking rent is allocated from the user's target, in proportion to usable area. It does not establish an operator's affordability.

The nearby results are a ranked sample, not a complete inventory or competition count. Reference operators are existing businesses, not verified available tenants. Neighborhood audiences are inferred from nearby places, not a census of residents. Missing data remains missing, and insufficient local evidence produces a clear error rather than substituting another city.

The planner maximizes the sum of rank-derived concept utilities, with a small category-variety bonus. It enforces minimum concept footprints, the shared-space reserve, the requested focus, and the maximum number of units. Unused floor area stays visible for layout refinement.

## Validation

```bash
cd web
npm test
npm run check
npm run build
```

Planner checks cover area and rent conservation, unit limits, focus, missing affinities, dependence on Qloo ranks, and invalid input. Live API and browser verification reports are recorded during development; they should not be confused with a security audit or commercial validation.

## Source

- web/lib/qloo.ts — private Qloo client and evidence parsing
- web/lib/engine.ts — adaptive research workflow
- web/lib/planner.ts — validation and feasible mix selection
- web/app/api/analyze/route.ts — streaming and JSON agent tool
- web/components/PerfectMixApp.tsx — responsive research workspace
- tests/planner.test.mjs — decision constraints

Documentation: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
