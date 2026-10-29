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
            <span className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[10px] text-ink-soft">
              demo · live
            </span>
          </div>
        </div>
      </nav>

      {/* HEADER — tight, not marketing */}
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-8">
        <h1 className="hero-in hero-in-1 max-w-2xl text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl">
          The right tenant mix for this address.
        </h1>
        <p className="hero-in hero-in-2 mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Perfect Mix reads the cultural taste of a neighborhood and prescribes the tenants whose
          audiences actually match — with a scored, transparent report.
        </p>
      </header>

      {/* ANALYSIS PANEL */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <AnalyzePanel />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-mono text-[11px] text-ink-soft">
            Perfect Mix · Powered by Qloo Taste Intelligence
          </span>
          <a
            href="https://github.com/NSEVEjk0/perfect-mix"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-ink-soft transition hover:text-forest"
          >
            source
          </a>
        </div>
      </footer>
    </main>
  );
}
