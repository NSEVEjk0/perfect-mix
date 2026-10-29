"use client";

import { useState } from "react";
import { analyzeDemo, type Report } from "@/lib/demoEngine";

const LIVE_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? "http://127.0.0.1:4180";

const CATEGORY_LABEL: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  retail: "Retail",
  entertainment: "Entertainment",
  health: "Health & Wellness",
  service: "Service",
};

const VERDICT_STYLE: Record<string, string> = {
  "strong fit": "bg-good-soft text-good",
  "moderate fit": "bg-moderate-soft text-moderate",
  mismatch: "bg-bad-soft text-bad",
};

const VERDICT_LABEL: Record<string, string> = {
  "strong fit": "Strong fit",
  "moderate fit": "Moderate fit",
  mismatch: "Mismatch",
};

const EXAMPLE_NEIGHBORHOODS = [
  "Williamsburg, Brooklyn, NY",
  "The Mission, San Francisco, CA",
  "West Loop, Chicago, IL",
];

export default function AnalyzePanel() {
  const [location, setLocation] = useState("Williamsburg, Brooklyn, NY");
  const [maxRent, setMaxRent] = useState("15000");
  const [minTraffic, setMinTraffic] = useState("400");
  const [sqft, setSqft] = useState("3000");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [showTrace, setShowTrace] = useState(false);

  const run = async () => {
    setLoading(true);
    setError("");
    setReport(null);

    if (mode === "demo") {
      await new Promise((r) => setTimeout(r, 700));
      const result = analyzeDemo(location, Number(maxRent), Number(minTraffic), Number(sqft));
      setReport(result);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${LIVE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          maxRent: Number(maxRent),
          minTraffic: Number(minTraffic),
          sqft: Number(sqft),
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (!data.ok) {
        const trace = data.trace?.length ? `\nTrace: ${data.trace.map((t: { step?: string }) => t.step ?? "?").join(" → ")}` : "";
        throw new Error(`${data.error ?? "analysis failed"}${trace}`);
      }
      setReport(data);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-soft sm:p-7">
      {/* card title */}
      <div className="mb-5 font-mono text-[11px] font-medium uppercase tracking-widest text-ink-soft">
        New analysis
      </div>

      {/* inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Neighborhood or address, e.g. Williamsburg, Brooklyn"
            className="w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            max rent /mo
          </label>
          <input
            type="number"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="tnum w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            min traffic/day
          </label>
          <input
            type="number"
            value={minTraffic}
            onChange={(e) => setMinTraffic(e.target.value)}
            className="tnum w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-ink-soft">
            sq ft
          </label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="tnum w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-forest/40 focus:ring-2 focus:ring-forest/10"
          />
        </div>
      </div>

      {/* action row */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={run}
          disabled={loading}
          className="rounded-input bg-forest px-5 py-2.5 text-sm font-medium text-white transition hover:bg-forest-hover disabled:opacity-50"
        >
          {loading ? "Reading local taste…" : "Generate tenant mix"}
        </button>

        {/* mode toggle pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line bg-canvas p-0.5">
            <button
              onClick={() => setMode("demo")}
              className={`rounded-full px-3 py-1 font-mono text-[10px] transition ${
                mode === "demo" ? "bg-surface text-ink shadow-soft" : "text-ink-soft hover:text-ink"
              }`}
            >
              Demo data
            </button>
            <button
              onClick={() => setMode("live")}
              className={`rounded-full px-3 py-1 font-mono text-[10px] transition ${
                mode === "live" ? "bg-surface text-ink shadow-soft" : "text-ink-soft hover:text-ink"
              }`}
            >
              Live Qloo
            </button>
          </div>
          <span className="hidden text-xs text-ink-faint sm:block">
            Demo uses curated neighborhoods. Live uses the Qloo Taste API.
          </span>
        </div>
      </div>

      {/* example neighborhoods */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          example neighborhoods
        </span>
        {EXAMPLE_NEIGHBORHOODS.map((n) => (
          <button
            key={n}
            onClick={() => setLocation(n)}
            className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft transition hover:border-forest/30 hover:text-forest"
          >
            {n.split(",")[0]}
          </button>
        ))}
      </div>

      {/* empty state */}
      {!report && !loading && !error && (
        <div className="mt-8 rounded-card border border-dashed border-line py-12 text-center">
          <p className="text-sm text-ink-soft">
            Enter a location and building profile to generate a tenant mix.
          </p>
        </div>
      )}

      {/* error */}
      {error && (
        <div className="mt-6 rounded-card border border-bad/20 bg-bad-soft p-4">
          <p className="text-sm text-bad">
            Could not complete the analysis. {error}
          </p>
        </div>
      )}

      {/* report */}
      {report && !loading && (
        <div className="mt-8">
          {/* report header */}
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${
              report.mode === "demo"
                ? "border-line bg-canvas text-ink-soft"
                : "border-good/30 bg-good-soft text-good"
            }`}>
              {report.mode === "demo" ? "Demo data" : "Live Qloo"}
            </span>
            <span className="text-sm font-medium text-ink">{report.location}</span>
          </div>

          {/* narrative */}
          <div className="mt-4 rounded-card border border-good/20 bg-good-soft p-5">
            <p className="text-sm leading-relaxed text-ink">{report.summary.narrative}</p>
          </div>

          {/* metric cards */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="tnum text-2xl font-semibold text-ink">{report.summary.strongFits}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">strong fits</div>
            </div>
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="tnum text-2xl font-semibold text-ink">{report.summary.totalTenants}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">tenants evaluated</div>
            </div>
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="tnum text-2xl font-semibold text-bad">{report.summary.mismatches}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-soft">mismatches flagged</div>
            </div>
            <div className="rounded-card border border-line bg-surface p-5">
              <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink-soft">recommended mix</div>
              <div className="mt-2 space-y-1">
                {report.summary.recommendedMix.map((name) => (
                  <div key={name} className="text-sm text-ink">{name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* category balance */}
          <div className="mt-5 rounded-card border border-line bg-surface p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">category balance</div>
            <div className="mt-3 space-y-2.5">
              {report.summary.balance.map((b) => (
                <div key={b.category} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-ink">{b.category}</span>
                  <div className="overlap-bar flex-1">
                    <div style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="tnum w-10 text-right font-mono text-xs text-ink-soft">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* tenant table — desktop */}
          <div className="mt-5 hidden overflow-hidden rounded-card border border-line lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-left font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                  <th className="px-5 py-3 font-medium">tenant</th>
                  <th className="px-4 py-3 font-medium">category</th>
                  <th className="px-4 py-3 font-medium">audience overlap</th>
                  <th className="px-4 py-3 font-medium">est. rent</th>
                  <th className="px-4 py-3 font-medium">traffic</th>
                  <th className="px-4 py-3 font-medium">space</th>
                  <th className="px-4 py-3 font-medium">score</th>
                  <th className="px-4 py-3 font-medium">verdict</th>
                  <th className="px-5 py-3 font-medium">why</th>
                </tr>
              </thead>
              <tbody>
                {report.tenants.map((t) => (
                  <tr key={t.name} className="border-b border-line/60 last:border-0 align-top hover:bg-canvas/50">
                    <td className="px-5 py-3.5 font-medium text-ink">{t.name}</td>
                    <td className="px-4 py-3.5 text-ink-soft">{CATEGORY_LABEL[t.category] ?? t.category}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="overlap-bar w-16">
                          <div style={{ width: `${Math.round(t.audienceOverlap * 100)}%` }} />
                        </div>
                        <span className="tnum font-mono text-xs text-ink-soft">{Math.round(t.audienceOverlap * 100)}%</span>
                      </div>
                    </td>
                    <td className="tnum px-4 py-3.5 font-mono text-xs text-ink-soft">${t.estimatedRent.toLocaleString()}</td>
                    <td className="tnum px-4 py-3.5 font-mono text-xs text-ink-soft">{t.expectedTraffic.toLocaleString()}</td>
                    <td className="tnum px-4 py-3.5 font-mono text-xs text-ink-soft">
                      {t.spaceNeeded ? `${t.spaceNeeded.toLocaleString()}` : "—"}
                    </td>
                    <td className="tnum px-4 py-3.5">
                      <span className="font-mono text-base font-semibold text-ink">{t.score}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${VERDICT_STYLE[t.verdict] ?? "bg-canvas text-ink-soft"}`}>
                        {VERDICT_LABEL[t.verdict] ?? t.verdict}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs leading-relaxed text-ink-soft">{t.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* tenant cards — mobile */}
          <div className="mt-5 space-y-3 lg:hidden">
            {report.tenants.map((t) => (
              <div key={t.name} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-ink">{t.name}</div>
                    <div className="mt-0.5 text-xs text-ink-soft">{CATEGORY_LABEL[t.category] ?? t.category}</div>
                  </div>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${VERDICT_STYLE[t.verdict] ?? "bg-canvas text-ink-soft"}`}>
                    {VERDICT_LABEL[t.verdict] ?? t.verdict}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-line pt-3">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-soft">overlap</div>
                    <div className="tnum mt-1 font-mono text-sm font-semibold text-ink">{Math.round(t.audienceOverlap * 100)}%</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-soft">rent</div>
                    <div className="tnum mt-1 font-mono text-sm text-ink">${t.estimatedRent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-soft">traffic</div>
                    <div className="tnum mt-1 font-mono text-sm text-ink">{t.expectedTraffic.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ink-soft">score</div>
                    <div className="tnum mt-1 font-mono text-sm font-semibold text-ink">{t.score}</div>
                  </div>
                </div>
                <div className="mt-2.5 text-xs leading-relaxed text-ink-soft">{t.why}</div>
              </div>
            ))}
          </div>

          {/* risk flags */}
          {report.flags.length > 0 && (
            <div className="mt-5 rounded-card border border-bad/20 bg-bad-soft p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-bad">risk flags</div>
              <div className="mt-3 space-y-2.5">
                {report.flags.map((f) => (
                  <div key={f.tenant} className="text-sm leading-relaxed text-ink">
                    <span className="font-semibold text-bad">{f.tenant}</span> — {f.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* report footer */}
          <div className="mt-6 font-mono text-[11px] text-ink-faint">
            Generated for {report.location} · {report.building.sqft.toLocaleString()} sq ft · max rent ${report.building.maxRent.toLocaleString()}/mo
          </div>

          {/* trace */}
          {report.trace && report.trace.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <button
                onClick={() => setShowTrace((v) => !v)}
                className="flex items-center gap-2 font-mono text-[11px] text-ink-soft transition hover:text-forest"
              >
                <span className={`transition-transform ${showTrace ? "rotate-90" : ""}`}>▸</span>
                How this was calculated
              </button>
              {showTrace && (
                <div className="mt-3 space-y-1.5 rounded-card border border-line bg-canvas p-5">
                  {report.trace.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 font-mono text-[11px] leading-5">
                      <span className="tnum text-forest">{i + 1}.</span>
                      <span className="text-ink-soft">{t.step}</span>
                      {t.result && <span className="text-ink-faint">→ {t.result}</span>}
                      {t.count !== undefined && <span className="text-ink-faint">({t.count})</span>}
                      {t.tags && t.tags.length > 0 && (
                        <span className="text-ink-faint">· {t.tags.join(", ")}</span>
                      )}
                      {t.error && <span className="text-bad">· {t.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
