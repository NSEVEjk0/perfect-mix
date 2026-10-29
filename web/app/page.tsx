import AnalyzePanel from "@/components/AnalyzePanel";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* NAV */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-paper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 21h18M5 21V8l7-5 7 5v13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight text-ink">
            Perfect Mix<span className="text-accent">.</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[10px] text-ink-faint sm:block">
            powered by Qloo cultural taste intelligence
          </span>
          <a
            href="https://github.com/NSEVEjk0/perfect-mix"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-4 py-1.5 font-mono text-[11px] text-ink-soft transition hover:border-accent/40 hover:text-accent-deep"
          >
            source
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto max-w-5xl px-5 pt-16 pb-10 sm:pt-24">
        <div className="hero-in hero-in-1 font-mono text-[10px] uppercase tracking-[0.35em] text-accent-deep">
          Prescriptive retail real estate
        </div>
        <h1 className="hero-in hero-in-2 mt-5 max-w-3xl font-sans text-4xl font-medium leading-[1.08] tracking-tight text-ink sm:text-6xl">
          A location in. A perfect mix out.
        </h1>
        <p className="hero-in hero-in-3 mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          Developers and landlords lose millions on the wrong perfect mix. Perfect Mix reads the
          cultural taste of a neighborhood and prescribes the tenants whose audiences actually
          match — with a scored, actionable report.
        </p>
      </header>

      {/* ANALYZE PANEL */}
      <section className="mx-auto max-w-5xl px-5 py-6">
        <AnalyzePanel />
      </section>

      {/* WHY QLOO */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="reveal rounded-2xl border border-line bg-paper-dim/60 p-8 sm:p-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent-deep">
            why cultural data
          </div>
          <h2 className="mt-4 text-2xl font-medium text-ink sm:text-3xl">
            Demographics tell you who lives there. Taste tells you what they'll buy.
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink">Locality intelligence</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Qloo reads the cultural shape of a place — from a block to a country. Two
                neighborhoods with identical demographics can have completely different tastes.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink">Cross-domain inference</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A neighborhood that loves indie film and craft coffee is predictable in what it
                will eat, wear, and do. Qloo connects those dots across categories.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink">Privacy-first</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Intelligence without identity — no PII, no consumer profiles. Just aggregate
                cultural signals, stateless and anonymized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-5xl px-5 pb-12 pt-4">
        <div className="border-t border-line pt-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Perfect Mix · Qloo Agentic Hackathon
              </div>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-faint">
                A prescriptive decision engine for retail real estate — the perfect mix is a
                multi-million-dollar bet, and it should be made on data, not guesswork.
              </p>
            </div>
            <a
              href="https://github.com/NSEVEjk0/perfect-mix"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs text-ink-soft transition hover:border-accent/40 hover:text-accent-deep"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              github.com/NSEVEjk0/perfect-mix
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
