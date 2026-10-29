# Perfect Mix — prescriptive retail real estate

> A location in. A perfect mix out.

Developers and landlords lose millions on the wrong tenant mix. **Perfect Mix** reads the cultural taste of a neighborhood and prescribes the tenants whose audiences actually match — with a scored, actionable report.

Built for the **Qloo Agentic Hackathon**. Powered by [Qloo's Taste API](https://www.qloo.com/) — locality intelligence plus cross-domain taste inference.

## What it does

Input a location and a building profile (max rent, minimum traffic, square footage). Perfect Mix:

1. **Builds a taste profile for the location** via Qloo — what this neighborhood actually likes, across categories.
2. **Evaluates tenant candidates** per category (restaurant, café, retail, entertainment, health, service) against that profile.
3. **Scores every tenant** on audience overlap, category fit, rent budget, and traffic expectations.
4. **Flags mismatches** with a hard gate: any tenant with under 30% audience overlap is flagged regardless of rent or traffic — because if the people won't come, nothing else matters.
5. **Outputs a report**: recommended mix, scored tenant table, and risk flags with reasons.

## Demo

Live: **https://web-nine-zeta-8ayan5j041.vercel.app**

The deployed demo runs **entirely in the browser** — no backend required. It ships with three curated neighborhoods (Williamsburg, The Mission, West Loop), each with distinct taste profiles and realistic tenant candidates.

## How it works

```
location + building profile
        │
        ▼
┌───────────────┐     ┌──────────────────┐
│  Qloo Taste   │────▶│  cross-domain     │
│  API (live)   │     │  recommendations  │
└───────────────┘     └──────────────────┘
        │                        │
        ▼                        ▼
┌──────────────────────────────────────┐
│  scoring engine                       │
│  · audience overlap (55%)             │
│  · category fit (20%)                 │
│  · rent budget (15%)                  │
│  · traffic (10%)                      │
│  · hard gate: overlap < 30% = mismatch │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  report                               │
│  · recommended mix                    │
│  · scored tenant table                │
│  · risk flags with reasons            │
└──────────────────────────────────────┘
```

### Live mode (Qloo)

Set `QLOO_KEY` in the agent's environment and the agent switches from demo to live mode:

```bash
QLOO_KEY=your_key TM_PORT=4180 node agent/index.js
```

The agent uses the **Qloo hackathon API** (`https://hackathon.api.qloo.com`, header `X-Api-Key`):

1. **Resolve location** — `GET /search?q=<location>&type=place`
2. **Fetch locality taste** — `POST /v2/insights` with `filter.type: "taste"` and `signal.location.query`
3. **Generate candidates** per category, grounded in the returned taste tags/entities
4. **Score** every tenant with a traceable "why" (audience overlap, category fit, rent, traffic, space)
5. **Flag** mismatches via the hard gate (overlap < 30%)

The agent logs every step to a `trace` array returned in the report — so judges can see Qloo is load-bearing, not decorative.

### How to run the live demo

```bash
# 1. Get a Qloo hackathon API key (register via the hackathon)
# 2. Start the agent
QLOO_KEY=your_key TM_PORT=4180 node agent/index.js
# 3. Point the web app at it
cd web
NEXT_PUBLIC_AGENT_URL=http://your-server:4180 npm run build
```

Without a key, the deployed site runs the identical scoring engine client-side with curated neighborhood data — fully standalone.

### Demo mode (standalone)

No key? No problem. The web app computes the same report client-side from curated neighborhood data. The scoring logic is identical to the live path.

## Repository layout

```
agent/index.js          Agent: Qloo integration + scoring engine (Node.js)
web/app/                Next.js frontend
web/components/         Analyze panel (inputs → report)
web/lib/demoEngine.ts   Client-side demo engine (same scoring logic)
```

## Quick start

```bash
# agent
npm install   # (if adding deps)
QLOO_KEY=your_key TM_PORT=4180 node agent/index.js

# web
cd web && npm install && npm run dev
```

## Why Qloo matters

Demographics tell you who lives there. Taste tells you what they'll buy. Two neighborhoods with identical demographics can have completely different cultural profiles — and a tenant mix that thrives in one can fail in the other. Qloo's cultural graph makes the recommendation specific to the *place*, not just the census data.

And the decision is transparent: every score has a reasoning trail. No black-box "the algorithm said so."
