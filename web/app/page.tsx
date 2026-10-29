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
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-8">
        <div className="hero-in hero-in-1 font-mono text-[11px] uppercase tracking-[0.22em] text-forest">
          Prescriptive tenant mix
        </div>
        <h1 className="hero-in hero-in-2 mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl">
          Prescribe the right tenants for this address.
        </h1>
        <p className="hero-in hero-in-3 mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Perfect Mix reads the cultural taste of a neighborhood — not just its demographics —
          and returns a scored, reasoned tenant mix with clear risk flags. Built for developers
          and landlords who can't afford the wrong storefront.
        </p>
      </header>

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
            Perfect Mix · Qloo Agentic Hackathon
          </div>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-ink-faint">
            A prescriptive decision engine for retail real estate. The tenant mix is a
            multi-million-dollar bet — it should be made on data.
          </p>
        </div>
      </footer>
    </main>
  );
}
