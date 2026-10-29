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
  "strong fit": "bg-good-soft text-good border-good/30",
  "moderate fit": "bg-accent-wash text-accent-deep border-accent/30",
  mismatch: "bg-bad-soft text-bad border-bad/30",
};

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
      await new Promise((r) => setTimeout(r, 600));
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
        // surface the agent's error + partial trace
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
    <div className="rounded-2xl border border-line bg-white p-6 shadow-card-lg sm:p-8">
      {/* input */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            location
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Williamsburg, Brooklyn, NY"
            className="w-full rounded-lg border border-line bg-paper-dim px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            max rent /mo
          </label>
          <input
            type="number"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-dim px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            min traffic/day
          </label>
          <input
            type="number"
            value={minTraffic}
            onChange={(e) => setMinTraffic(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-dim px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            sq ft
          </label>
          <input
            type="number"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-dim px-3 py-2 text-sm text-ink outline-none focus:border-accent/50"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={run}
            disabled={loading}
            className="w-full rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-accent-deep disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${mode === "demo" ? "border-accent/40 bg-accent-wash text-accent-deep" : "border-line text-ink-faint"}`}>
          {mode === "demo" ? "demo data" : "live Qloo"}
        </span>
        <button
          onClick={() => setMode(mode === "demo" ? "live" : "demo")}
          className="font-mono text-[10px] text-ink-faint underline-offset-2 hover:underline"
        >
          {mode === "demo" ? "switch to live (needs Qloo key)" : "switch to demo"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-bad/30 bg-bad-soft p-3 text-sm text-bad">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2.5 text-sm text-ink-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Reading the neighborhood's taste…
        </div>
      )}

      {/* report */}
      {report && !loading && (
        <div className="mt-8">
          {/* report badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${report.mode === "demo" ? "border-accent/40 bg-accent-wash text-accent-deep" : "border-good/30 bg-good-soft text-good"}`}>
              {report.mode === "demo" ? "demo data" : "live Qloo"}
            </span>
            <span className="font-mono text-[10px] text-ink-faint">report</span>
          </div>

          {/* narrative */}
          <div className="rounded-xl border border-accent/30 bg-accent-wash p-4">
            <p className="text-sm leading-relaxed text-ink">{report.summary.narrative}</p>
          </div>

          {/* summary */}
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-paper-dim p-4">
              <div className="font-mono text-2xl font-bold text-ink">{report.summary.strongFits}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">strong fits</div>
            </div>
            <div className="rounded-xl border border-line bg-paper-dim p-4">
              <div className="font-mono text-2xl font-bold text-ink">{report.summary.totalTenants}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">tenants evaluated</div>
            </div>
            <div className="rounded-xl border border-line bg-paper-dim p-4">
              <div className="font-mono text-2xl font-bold text-bad">{report.summary.mismatches}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">mismatches flagged</div>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent-wash p-4">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-accent-deep">recommended mix</div>
              <div className="mt-2 space-y-1">
                {report.summary.recommendedMix.map((name) => (
                  <div key={name} className="text-sm text-ink">{name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* category balance */}
          <div className="mt-4 rounded-xl border border-line p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">category balance</div>
            <div className="mt-2 flex flex-wrap gap-3">
              {report.summary.balance.map((b) => (
                <div key={b.category} className="flex items-center gap-2">
                  <span className="text-sm text-ink">{b.category}</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line/40">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="font-mono text-xs text-ink-soft">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* tenant table */}
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-dim text-left font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">tenant</th>
                  <th className="px-4 py-2.5 font-medium">category</th>
                  <th className="px-4 py-2.5 font-medium">audience overlap</th>
                  <th className="px-4 py-2.5 font-medium">est. rent</th>
                  <th className="px-4 py-2.5 font-medium">traffic</th>
                  <th className="px-4 py-2.5 font-medium">space</th>
                  <th className="px-4 py-2.5 font-medium">score</th>
                  <th className="px-4 py-2.5 font-medium">verdict</th>
                  <th className="px-4 py-2.5 font-medium">why</th>
                </tr>
              </thead>
              <tbody>
                {report.tenants.map((t) => (
                  <tr key={t.name} className="border-b border-line/60 last:border-0 align-top">
                    <td className="px-4 py-2.5 font-medium text-ink">{t.name}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{CATEGORY_LABEL[t.category] ?? t.category}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line/40">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${Math.round(t.audienceOverlap * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-ink-soft">{Math.round(t.audienceOverlap * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">${t.estimatedRent.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">{t.expectedTraffic.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                      {t.spaceNeeded ? `${t.spaceNeeded.toLocaleString()} sqft` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-base font-bold text-ink">{t.score}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${VERDICT_STYLE[t.verdict] ?? "border-line text-ink-faint"}`}>
                        {t.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs leading-relaxed text-ink-soft">{t.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* flags */}
          {report.flags.length > 0 && (
            <div className="mt-4 rounded-xl border border-bad/30 bg-bad-soft p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-bad">risk flags</div>
              <div className="mt-2 space-y-2">
                {report.flags.map((f) => (
                  <div key={f.tenant} className="text-sm text-ink">
                    <span className="font-semibold text-bad">{f.tenant}</span> — {f.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 font-mono text-[10px] text-ink-faint">
            generated for {report.location} · {report.building.sqft.toLocaleString()} sq ft · max rent ${report.building.maxRent.toLocaleString()}/mo
          </div>

          {/* trace — how this was calculated */}
          {report.trace && report.trace.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <button
                onClick={() => setShowTrace((v) => !v)}
                className="flex items-center gap-2 font-mono text-[11px] text-ink-soft transition hover:text-accent-deep"
              >
                <span className={`transition-transform ${showTrace ? "rotate-90" : ""}`}>▸</span>
                How this was calculated
              </button>
              {showTrace && (
                <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-paper-dim p-4">
                  {report.trace.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 font-mono text-[11px] leading-5">
                      <span className="text-accent-deep">{i + 1}.</span>
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
