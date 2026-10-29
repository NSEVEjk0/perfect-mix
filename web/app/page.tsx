import AnalyzePanel from "@/components/AnalyzePanel";

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Read the place",
    body: "Perfect Mix resolves the location and reads its cultural taste via Qloo — the restaurants, brands, and experiences the neighborhood actually gravitates toward. Not demographics. Taste.",
  },
  {
    n: "02",
    title: "Score the tenants",
    body: "Candidate tenants are evaluated against that taste profile — audience overlap, category fit, rent, traffic, and space. Every score carries a plain-language reason.",
  },
  {
    n: "03",
    title: "Flag the risk",
    body: "Mismatches are surfaced before you lease: a fast-food chain in a farm-to-table neighborhood, a discount outlet in a vintage district. The report tells you why, not just what.",
  },
];

const EVIDENCE = [
  {
    label: "Generic LLM",
    items: ["Café", "Restaurant", "Retail store", "Fitness studio", "Bank branch"],
    note: "Broad categories. No sense of the place.",
    muted: true,
  },
  {
    label: "Perfect Mix",
    items: ["Natural Wine Bar", "Third Wave Coffee", "Vintage Denim", "Farm-to-Table"],
    note: "Grounded in this neighborhood's actual cultural signals — with scores, reasons, and risk flags.",
    muted: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-forest text-white">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M3 21h18M5 21V8l7-5 7 5v13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[15px] font-medium tracking-tight text-ink">
              Perfect Mix
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] text-ink-soft md:block">
              Qloo Agentic Hackathon
            </span>
            <a
              href="#analyze"
              className="rounded-input bg-forest px-4 py-1.5 text-sm font-medium text-white transition hover:bg-forest-hover"
            >
              Analyze a location
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="hero-in hero-in-1 font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
          Prescriptive retail real estate
        </div>
        <h1 className="hero-in hero-in-2 mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-ink sm:text-6xl">
          Stop guessing the tenant mix.
        </h1>
        <p className="hero-in hero-in-3 mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Most new retail spaces fail because the tenants don't match what the neighborhood
          actually wants. Perfect Mix uses Qloo's cultural taste intelligence to prescribe the
          specific restaurants, brands, and services whose audiences fit the location — then
          scores them with clear reasons and risk flags.
        </p>
        <div className="hero-in hero-in-4 mt-8 flex items-center gap-4">
          <a
            href="#analyze"
            className="rounded-input bg-forest px-6 py-3 text-sm font-medium text-white transition hover:bg-forest-hover"
          >
            Generate tenant mix
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-ink-soft transition hover:text-forest"
          >
            How it works →
          </a>
        </div>
        <div className="hero-in hero-in-4 mt-4 font-mono text-[11px] text-ink-faint">
          No account · Demo runs entirely in your browser
        </div>
      </header>

      {/* NUMBERED PROCESS */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          {PROCESS_STEPS.map((step) => (
            <div key={step.n} className="reveal border-t border-line pt-6">
              <div className="font-mono text-4xl font-semibold tracking-tight text-forest/40 sm:text-5xl">
                {step.n}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE / DEMO — the tool */}
      <section id="analyze" className="mx-auto max-w-6xl scroll-mt-16 px-6 pb-16">
        <div className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
            The tool
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Test a location. Test an idea.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Generate a full scored tenant mix — or evaluate a specific business idea against the
            neighborhood before you commit to a lease.
          </p>
        </div>
        <AnalyzePanel />
      </section>

      {/* EVIDENCE — before / after */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
            The difference
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            A plain LLM suggests categories. Perfect Mix reads the place.
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {EVIDENCE.map((col) => (
            <div
              key={col.label}
              className={`reveal rounded-card border p-6 ${
                col.muted ? "border-line bg-surface" : "border-forest/25 bg-forest/5"
              }`}
            >
              <div className={`font-mono text-[10px] font-medium uppercase tracking-widest ${col.muted ? "text-ink-soft" : "text-forest"}`}>
                {col.label}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {col.items.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full px-3 py-1 text-xs ${
                      col.muted ? "border border-line text-ink-soft" : "bg-forest text-white"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{col.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="reveal rounded-card border border-line bg-surface p-10 text-center sm:p-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            The tenant mix is a multi-million-dollar decision.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            It should be made on data — scored, reasoned, and transparent.
          </p>
          <a
            href="#analyze"
            className="mt-8 inline-block rounded-input bg-forest px-8 py-3 text-sm font-medium text-white transition hover:bg-forest-hover"
          >
            Generate tenant mix
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-6 sm:flex-row sm:items-center">
          <div className="font-mono text-[11px] text-ink-soft">
            Perfect Mix · Qloo Agentic Hackathon
          </div>
          <a
            href="https://github.com/NSEVEjk0/perfect-mix"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-ink-soft transition hover:text-forest"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
