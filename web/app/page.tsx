import AnalyzePanel from "@/components/AnalyzePanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* NAV */}
      <nav className="border-b border-line bg-canvas">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
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
            <span className="hidden font-mono text-[11px] text-ink-soft sm:block">
              Qloo Agentic Hackathon
            </span>
            <a
              href="https://github.com/NSEVEjk0/perfect-mix"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-ink-soft transition hover:text-forest"
            >
              Source
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-6">
        <div className="hero-in hero-in-1 font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
          Prescriptive retail real estate
        </div>
        <h1 className="hero-in hero-in-2 mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl">
          Stop guessing the tenant mix.
        </h1>
        <p className="hero-in hero-in-3 mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          Most new retail spaces fail because the tenants don't match what the neighborhood
          actually wants. Perfect Mix uses Qloo's cultural taste intelligence to prescribe the
          specific restaurants, brands, and services whose audiences fit the location — then
          scores them with clear reasons and risk flags.
        </p>
      </header>

      {/* PROBLEM / SOLUTION / WHY QLOO */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="hero-in hero-in-2 rounded-card border border-line bg-surface p-5">
            <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink-soft">
              the problem
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              Demographics tell you who lives nearby. They don't tell you what those people will
              actually buy, eat, or visit. Two blocks with identical income and age profiles can
              demand completely different tenants. Getting the mix wrong costs millions in lost
              rent and failed openings.
            </p>
          </div>
          <div className="hero-in hero-in-3 rounded-card border border-line bg-surface p-5">
            <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-forest">
              the solution
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              Perfect Mix reads the cultural taste of a precise location via Qloo, evaluates
              candidate tenants against that taste, and returns a scored, reasoned mix. It flags
              mismatches before you lease.
            </p>
          </div>
          <div className="hero-in hero-in-3 rounded-card border border-line bg-surface p-5">
            <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink-soft">
              why qloo
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              Qloo's cultural graph models what places and people actually like — across
              restaurants, brands, music, and more. That's the signal standard demographics
              miss.
            </p>
          </div>
        </div>
      </section>

      {/* ANALYSIS PANEL */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <AnalyzePanel />
      </section>

      {/* WHY THIS WORKS */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-card border border-line bg-surface p-7 shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Why cultural taste beats demographics alone
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-forest">
                Locality intelligence
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Qloo reads the cultural shape of a place. Two neighborhoods with identical income
                and age profiles can want completely different tenants.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-forest">
                Cross-domain inference
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A neighborhood that loves indie film and craft coffee is predictable in food,
                fashion, and experiences. Perfect Mix uses that signal.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-forest">
                Transparent scoring
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Every recommendation includes an audience-overlap score and a plain-language
                reason. No black box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="font-mono text-[11px] text-ink-soft">
            Perfect Mix · Qloo Agentic Hackathon — The tenant mix is a multi-million-dollar
            decision. It should be made on data.
          </div>
        </div>
      </footer>
    </main>
  );
}
