"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AnalysisInput,
  AnalysisReport,
  Concept,
  Evidence,
  TraceStep,
} from "@/lib/types";
import StreetScene from "./StreetScene";
import LocationSummary from "./LocationSummary";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const number = (n: number) => n.toLocaleString("en-US");
const affinity = (n: number | null) =>
  n === null ? "No measurement" : n.toFixed(4);
const families: Record<string, string> = {
  food: "Food & drink",
  retail: "Retail",
  wellness: "Wellness",
  culture: "Culture",
};
const defaults: AnalysisInput = {
  location: "Williamsburg, Brooklyn, NY",
  sqft: 3000,
  monthlyRent: 15000,
  maxUnits: 2,
  focus: "balanced",
  proposed: "",
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 6-10 6L2 9l10-6Z" />
        <path d="m2 14 10 6 10-6M2 18l10 6 10-6" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H5v20h14V7l-5-5Z" />
        <path d="M14 2v5h5M8 12h8M8 16h6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6" />
      </>
    ),
    book: (
      <>
        <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    coffee: (
      <>
        <path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM16 9h2a3 3 0 1 1 0 6h-2M7 3v2M11 3v2" />
      </>
    ),
    expand: (
      <>
        <path d="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}
function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <i />
        <i />
        <i />
        <i />
      </span>
      perfectmix<span className="brand-period">.</span>
    </span>
  );
}

function EvidenceCard({ item }: { item: Evidence }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="evidence-item">
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="evidence-image"
        />
      ) : (
        <div className="evidence-image placeholder-image">
          <Icon name="spark" />
        </div>
      )}
      <div className="evidence-content">
        <strong>{item.name}</strong>
        {item.address && (
          <span className="evidence-address">{item.address}</span>
        )}
        <span className="evidence-score">
          Taste affinity <b>{affinity(item.affinity)}</b>
        </span>
        {item.contributors.length > 0 && (
          <>
            <button
              className="text-button why-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              Why this connection? <Icon name="down" size={13} />
            </button>
            {open && (
              <div className="contributors">
                {item.contributors.slice(0, 3).map((c) => (
                  <div key={c.id}>
                    <span>{c.name}</span>
                    <span>{(c.weight * 100).toFixed(1)}% contribution</span>
                  </div>
                ))}
                <small>
                  Qloo explainability weights for the supplied taste anchors.
                </small>
              </div>
            )}
          </>
        )}
      </div>
      {item.website && (
        <a
          className="external-link"
          href={item.website}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${item.name}`}
        >
          <Icon name="expand" size={15} />
        </a>
      )}
    </div>
  );
}

function MethodDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="method-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        className="dialog-close icon-button"
        onClick={close}
        aria-label="Close methodology"
      >
        <Icon name="close" />
      </button>
      <span className="eyebrow">THE THINKING BEHIND THE MIX</span>
      <h2>
        Local evidence.
        <br />
        Considered decisions.
      </h2>
      <p>
        PerfectMix is a Qloo-powered leasing research tool. It resolves a
        location, finds nearby places, and uses their audiences as taste
        anchors. It then compares tenant categories, looks across cultural
        domains, and chooses a feasible space scenario.
      </p>
      <div className="method-steps">
        <p>
          <b>01 / Research</b> Real Qloo entity IDs and validated tags. Sparse
          coverage triggers a larger, disclosed search radius. GeoNames provides
          a worldwide place lookup when Qloo cannot locate the requested place.
        </p>
        <p>
          <b>02 / Compare</b> Qloo&apos;s measured affinities rank the concepts
          in the same query. Missing evidence stays missing.
        </p>
        <p>
          <b>03 / Plan</b> A constraint planner compares feasible combinations.
          It favors leading cultural signals and some category variety, while
          respecting your floor area, focus, and unit limit.
        </p>
      </div>
      <p className="fine-print">
        The prototype reserves 10% for shared space and uses fixed concept area
        allowances. Rent comes from your input. These are planning assumptions;
        Qloo does not supply lease rates, unit dimensions, availability, or
        revenue predictions. The workflow uses Qloo tools and a deterministic
        planner, with no LLM-generated claims.
      </p>
      <a
        className="text-button"
        href="https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide"
        target="_blank"
        rel="noreferrer"
      >
        Read Qloo&apos;s documentation <Icon name="expand" size={15} />
      </a>
    </dialog>
  );
}

function exportReport(report: AnalysisReport) {
  const text = `# PerfectMix — ${report.locality.name}\n\nResearched ${report.generatedAt}\nResolved location: ${report.locality.address}\nLocation source: ${report.locality.source ?? "Qloo"}\n${report.coverage ? `Coverage: ${report.coverage.label}\n${report.coverage.detail}\n` : ""}\n${report.narrative}\n\n## Leasing scenario\n\n${report.mix.units.map((u) => `- ${u.name}: ${number(u.sqft)} sq ft / ${money(u.monthlyRent)} monthly allocated asking rent`).join("\n")}\n\n${number(report.mix.sharedSqft)} sq ft shared space; ${number(report.mix.remainingSqft)} sq ft unallocated.\n\n## Measured concept affinities\n\n${report.concepts.map((c) => `- ${c.name}: ${affinity(c.affinity)}; Qloo tag ${c.tag?.id ?? "unresolved"}`).join("\n")}\n\n## Local taste anchors\n\n${report.seedPlaces.map((p) => `- ${p.name} / ${p.id}`).join("\n")}\n\n## Next steps\n\n${report.nextSteps.map((s) => `- ${s}`).join("\n")}\n\n## Evidence limits and assumptions\n\n${report.limitations.map((s) => `- ${s}`).join("\n")}\n\nPowered by Qloo Taste AI. This is a research scenario, not a demand forecast.\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `perfectmix-${report.locality.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

function FloorPlan({
  report,
  selected,
  onSelect,
}: {
  report: AnalysisReport;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { mix, input } = report;
  return (
    <div className="floorplan-card">
      <div className="section-card-heading">
        <div>
          <span className="eyebrow">A SCENARIO THAT FITS</span>
          <h3>Your space, thoughtfully divided.</h3>
        </div>
        <span className="subtle-badge">{number(input.sqft)} sq ft</span>
      </div>
      <div className="floorplan">
        <div className="floorplan-units">
          {mix.units.map((u, i) => (
            <button
              key={u.conceptId}
              className={`floor-unit family-${u.family} ${selected === u.conceptId ? "selected" : ""}`}
              style={{ flexBasis: `${(u.sqft / mix.usableSqft) * 100}%` }}
              onClick={() => onSelect(u.conceptId)}
              aria-pressed={selected === u.conceptId}
            >
              <span className="unit-number">0{i + 1}</span>
              <span className="unit-name">{u.name}</span>
              <span className="unit-area">
                {number(u.sqft)}
                <small> sq ft</small>
              </span>
              <span className="unit-door" />
            </button>
          ))}
          {mix.remainingSqft > 0 && (
            <div
              className="floor-unit unallocated"
              style={{
                flexBasis: `${(mix.remainingSqft / mix.usableSqft) * 100}%`,
              }}
            >
              <span>Room to refine</span>
              <b>
                {number(mix.remainingSqft)}
                <small> sq ft</small>
              </b>
            </div>
          )}
        </div>
        <div className="shared-space">
          <span>SHARED SPACE & CIRCULATION</span>
          <span>{number(mix.sharedSqft)} sq ft</span>
        </div>
      </div>
      <div className="floorplan-legend">
        {mix.units.map((u) => (
          <span key={u.conceptId}>
            <i className={`family-dot family-${u.family}`} />
            {u.name}
          </span>
        ))}
      </div>
      <p className="fine-print">
        Concept area allowances, with 10% reserved for shared space. Diagram
        shows the allocation; it is not an architectural floor plan.
      </p>
    </div>
  );
}

function ConceptDetail({
  concept,
  report,
}: {
  concept: Concept;
  report: AnalysisReport;
}) {
  const unit = report.mix.units.find((u) => u.conceptId === concept.id);
  return (
    <div className={`concept-detail family-${concept.family}`}>
      <div className="concept-detail-top">
        <span className="subtle-badge">{families[concept.family]}</span>
        <span className="detail-rank">
          {concept.rank ? `Qloo rank #${concept.rank}` : "Evidence gap"}
        </span>
      </div>
      <h3>{concept.name}</h3>
      <p>{concept.description}</p>
      <div className="detail-metrics">
        <div>
          <span>TASTE AFFINITY</span>
          <b>{affinity(concept.affinity)}</b>
        </div>
        <div>
          <span>AREA ALLOWANCE</span>
          <b>
            {number(concept.minSqft)}
            <small> sq ft</small>
          </b>
        </div>
      </div>
      {unit && (
        <div className="rent-allocation">
          <span>Allocated monthly rent target</span>
          <b>{money(unit.monthlyRent)}</b>
        </div>
      )}
      <div className="evidence-reason">
        <Icon name="spark" size={16} />
        <p>{concept.reason}</p>
      </div>
      <h4>Local reference operators</h4>
      {concept.examples.length ? (
        concept.examples
          .slice(0, 3)
          .map((e) => <EvidenceCard item={e} key={e.id} />)
      ) : (
        <p className="fine-print">
          No local reference operators were loaded for this concept. This is not
          evidence of an empty market.
        </p>
      )}
      <p className="fine-print">
        Existing businesses illustrate the concept. Tenant interest and
        availability require direct verification.
      </p>
    </div>
  );
}

function PlanResults({ report }: { report: AnalysisReport }) {
  const [selected, setSelected] = useState(
    report.mix.units[0]?.conceptId ?? report.concepts[0]?.id,
  );
  const concept = report.concepts.find((c) => c.id === selected);
  const measured = report.concepts.some((c) => c.affinity !== null);
  return (
    <>
      <LocationSummary report={report} />
      <div className="recommendation-banner">
        <div>
          <span className="eyebrow">
            <Icon name="spark" size={14} /> YOUR LEASING DIRECTION
          </span>
          <h2>
            {report.mix.units.length
              ? report.mix.units.map((u) => u.name).join(" + ")
              : measured ? "A smaller format needs a closer look." : "Your location. A useful starting point."}
          </h2>
          <p>{report.narrative}</p>
        </div>
        <div className="recommendation-stats">
          <div>
            <b>{report.mix.units.length}</b>
            <span>selected concepts</span>
          </div>
          <div>
            <b>{number(report.mix.usedSqft)}</b>
            <span>sq ft allocated</span>
          </div>
          <div>
            <b>{report.seedPlaces.length}</b>
            <span>local taste anchors</span>
          </div>
        </div>
      </div>
      {report.proposed && (
        <div className="proposed-result">
          <div className="proposed-icon">
            <Icon name="spark" />
          </div>
          <div>
            <span className="eyebrow">YOUR IDEA, TESTED</span>
            <h3>{report.proposed.query}</h3>
            <p>{report.proposed.comparison}</p>
            <span className="tag-caption">
              Mapped tags:{" "}
              {report.proposed.tags.map((t) => t.name).join(", ") ||
                "Unresolved"}
            </span>
          </div>
          <div className="proposed-affinity">
            <b>{affinity(report.proposed.affinity)}</b>
            <span>Qloo affinity</span>
          </div>
        </div>
      )}
      <div className="plan-columns">
        <div>
          <FloorPlan
            report={report}
            selected={selected}
            onSelect={setSelected}
          />
          <div className="ranking-card">
            <div className="section-card-heading">
              <div>
                <span className="eyebrow">{measured ? "THE OPTIONS, COMPARED" : "PLANNING OPTIONS"}</span>
                <h3>{measured ? "A considered shortlist." : "Formats to investigate."}</h3>
              </div>
              <span className="small-muted">
                {report.concepts.filter((c) => c.affinity !== null).length}{" "}
                measured concepts
              </span>
            </div>
            {report.concepts.map((c) => (
              <button
                className={`concept-row ${selected === c.id ? "active" : ""}`}
                key={c.id}
                onClick={() => setSelected(c.id)}
                aria-pressed={selected === c.id}
              >
                <span className="concept-rank">
                  {c.rank ? String(c.rank).padStart(2, "0") : "—"}
                </span>
                <span className={`family-dot family-${c.family}`} />
                <span className="concept-row-name">
                  <strong>{c.name}</strong>
                  <small>
                    {number(c.minSqft)} sq ft allowance
                    {report.mix.units.some((u) => u.conceptId === c.id)
                      ? " · In your mix"
                      : c.minSqft > report.mix.usableSqft
                        ? " · Too large for this space"
                        : ""}
                  </small>
                </span>
                <span className="concept-affinity">{affinity(c.affinity)}</span>
                <Icon name="arrow" size={15} />
              </button>
            ))}
            <p className="fine-print">
              {measured ? "Affinities compare these concept tags for the same nearby taste anchors. A value of 0.9 does not mean 90% of residents will visit." : "These are standard business formats and their assumed footprints. No local affinity or tenant ranking is available; use them to plan your next research steps."}
            </p>
          </div>
        </div>
        {concept && <ConceptDetail concept={concept} report={report} />}
      </div>
      <div className="next-step-card">
        <span className="eyebrow">FROM INSIGHT TO A BETTER LEASE</span>
        <h3>What to validate next.</h3>
        <div className="next-steps">
          {report.nextSteps.map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function LocalEvidence({ report }: { report: AnalysisReport }) {
  const { lat, lon } = report.locality;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.035}%2C${lat - 0.025}%2C${lon + 0.035}%2C${lat + 0.025}&layer=mapnik&marker=${lat}%2C${lon}`;
  return (
    <>
      <div className="evidence-intro">
        <span className="eyebrow">READ THE NEIGHBORHOOD</span>
        <h2>The people behind the place.</h2>
        <p>
          These are cultural signals inferred from the audiences of nearby
          businesses. They describe a taste catchment, with clear limits on what
          we can conclude.
        </p>
      </div>
      <div className="local-grid">
        <div className="map-card">
          <iframe
            title={`Street map of ${report.locality.name}`}
            src={map}
            loading="lazy"
          />
          <div className="map-caption">
            <Icon name="pin" size={17} />
            <div>
              <strong>{report.locality.name}</strong>
              <span>
                {report.radius / 1000} km business research radius · centered on
                the resolved location
              </span>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open full street map"
            >
              <Icon name="expand" size={16} />
            </a>
          </div>
        </div>
        <div className="taste-card">
          <span className="eyebrow">CULTURAL FINGERPRINT</span>
          <h3>What connects this audience.</h3>
          <div className="taste-tags">
            {report.tastes.slice(0, 15).map((t) => (
              <span
                key={t.id}
                title={`Qloo tag ${t.id}; affinity ${affinity(t.affinity)}`}
              >
                {t.name}
                <small>{t.affinity?.toFixed(2)}</small>
              </span>
            ))}
          </div>
          <p className="fine-print">
            {report.tastes.length ? `Qloo taste tags for the audiences of ${report.seedPlaces.map((p) => p.name).join(", ")}. These are inferred signals, not self-reported preferences.` : "No measured taste fingerprint is available. The location, available places, and planning brief remain useful starting points for local research."}
          </p>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LOCAL ANCHORS</span>
          <h3>Real places. A traceable starting point.</h3>
        </div>
        <span className="small-muted">
          {report.localPlaces.length} open places in the returned sample
        </span>
      </div>
      <div className="anchor-grid">
        {report.seedPlaces.map((e) => (
          <div className="anchor-card" key={e.id}>
            {e.image && <img src={e.image} alt="" loading="lazy" />}
            <div>
              <span className="anchor-label">
                <Icon name="pin" size={12} /> TASTE ANCHOR
              </span>
              <h4>{e.name}</h4>
              <p>{e.address}</p>
              <div className="anchor-tags">
                {e.tags
                  .filter((t) => /:genre:|:ambience:/.test(t.id))
                  .slice(0, 2)
                  .map((t) => (
                    <span key={t.id}>{t.name}</span>
                  ))}
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${e.lat ?? lat}&mlon=${e.lon ?? lon}#map=17/${e.lat ?? lat}/${e.lon ?? lon}`}
                target="_blank"
                rel="noreferrer"
                className="text-button"
              >
                View location <Icon name="expand" size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">BEYOND THE POSTCODE</span>
          <h3>A neighborhood has more than one kind of taste.</h3>
          <p>
            Qloo connects the same local anchors to brands and music. Use these
            signals to explore positioning and programming.
          </p>
        </div>
      </div>
      <div className="cross-grid">
        <div className="cross-card">
          <div className="cross-heading">
            <Icon name="layers" />
            <h4>Brands in the orbit</h4>
            <span>Cross-domain inference</span>
          </div>
          {report.brands.length ? (
            report.brands.map((b) => <EvidenceCard key={b.id} item={b} />)
          ) : (
            <p className="fine-print">
              Brand inference was unavailable for this audience.
            </p>
          )}
        </div>
        <div className="cross-card">
          <div className="cross-heading">
            <Icon name="spark" />
            <h4>The sound of the audience</h4>
            <span>Cross-domain inference</span>
          </div>
          {report.artists.length ? (
            report.artists.map((a) => <EvidenceCard key={a.id} item={a} />)
          ) : (
            <p className="fine-print">
              Music inference was unavailable for this audience.
            </p>
          )}
        </div>
      </div>
      <div className="limits-card">
        <span className="eyebrow">GOOD JUDGMENT KNOWS ITS LIMITS</span>
        <h3>What this research can—and can&apos;t—tell you.</h3>
        {report.limitations.map((l, i) => (
          <p key={l}>
            <span>0{i + 1}</span>
            {l}
          </p>
        ))}
      </div>
    </>
  );
}

function Activity({
  steps,
  loading = false,
  failed = false,
}: {
  steps: TraceStep[];
  loading?: boolean;
  failed?: boolean;
}) {
  return (
    <div className="activity-card">
      <div className="section-card-heading">
        <div>
          <span className="eyebrow">RESEARCH YOU CAN INSPECT</span>
          <h3>
            {loading
              ? "The neighborhood is coming into focus."
              : "Every decision has a trail."}
          </h3>
        </div>
        <span className={`subtle-badge ${loading ? "is-live" : ""}`}>
          {loading
            ? "Researching"
            : failed
              ? "Research stopped"
              : "Research complete"}
        </span>
      </div>
      <p className="activity-explainer">
        Qloo and worldwide place lookup tools resolve the location. Qloo supplies the cultural evidence. The workflow
        adapts its catchment to coverage and researches the shortlist selected
        by the constraint planner.
      </p>
      <ol className="activity-list">
        {steps.map((s) => (
          <li key={s.id} className={`step-${s.status}`}>
            <span className="activity-status">
              {s.status === "running" ? (
                <span className="spinner" />
              ) : s.status === "done" ? (
                <Icon name="check" size={13} />
              ) : (
                "!"
              )}
            </span>
            <div>
              <div className="activity-title">
                <strong>{s.title}</strong>
                <span>
                  {s.durationMs !== undefined
                    ? `${(s.durationMs / 1000).toFixed(1)}s`
                    : ""}
                </span>
              </div>
              <p>{s.detail}</p>
              <details>
                <summary>
                  {s.tool} <Icon name="down" size={12} />
                </summary>
                <pre>
                  {s.params
                    ? JSON.stringify(s.params, null, 2)
                    : "Enumerates feasible combinations under area, category focus, and unit-count constraints."}
                </pre>
              </details>
            </div>
          </li>
        ))}
      </ol>
      {loading && (
        <div className="loading-note">
          <span className="pulse-dot" />
          Live research usually takes 10–30 seconds.
        </div>
      )}
    </div>
  );
}

export default function PerfectMixApp() {
  const [input, setInput] = useState<AnalysisInput>(defaults);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [saved, setSaved] = useState<AnalysisReport[]>([]);
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("plan");
  const [method, setMethod] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem("perfectmix-reports-v2") ?? "[]",
      );
      if (Array.isArray(data))
        setSaved(
          data
            .filter(
              (r: AnalysisReport) => r?.id && r?.mix && r?.trace && r?.locality,
            )
            .slice(0, 4),
        );
    } catch {
      /* Storage is optional. */
    }
    return () => abortRef.current?.abort();
  }, []);
  const toggleHistory = () => {
    setHistoryOpen(!historyOpen);
    if (!historyOpen)
      setTimeout(
        () =>
          document
            .querySelector(".saved-reports")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
  };
  const loadReport = (r: AnalysisReport) => {
    if (loading) return;
    setReport(r);
    setInput(r.input);
    setSteps(r.trace);
    setTab("plan");
    setError("");
    setHistoryOpen(false);
    setTimeout(
      () =>
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    );
  };
  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setReport(null);
    setSteps([]);
    setTab("activity");
    abortRef.current = new AbortController();
    let received = false;
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(input),
        signal: abortRef.current.signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "The research could not be started.");
      }
      if (!response.body)
        throw new Error("The research stream could not be opened.");
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        80,
      );
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const event = frame
            .split("\n")
            .find((l) => l.startsWith("event: "))
            ?.slice(7);
          const line = frame.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const data = JSON.parse(line.slice(6));
          if (event === "step")
            setSteps((prev) => {
              const next = [...prev];
              next[data.id] = data;
              return next;
            });
          if (event === "error") throw new Error(data.error);
          if (event === "report") {
            received = true;
            setReport(data);
            setTab("plan");
            setSaved((prev) => {
              const next = [
                data,
                ...prev.filter((r) => r.id !== data.id),
              ].slice(0, 4);
              try {
                localStorage.setItem(
                  "perfectmix-reports-v2",
                  JSON.stringify(next),
                );
              } catch {
                /* A report still works when storage is unavailable. */
              }
              return next;
            });
          }
        }
        if (done) break;
      }
      if (!received)
        throw new Error(
          "The connection ended before a report arrived. Please try again.",
        );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.name === "AbortError"
            ? "Research cancelled."
            : e.message
          : "The research could not be completed.",
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand-link" aria-label="PerfectMix home">
          <Brand />
        </a>
        <div className="sidebar-caption">
          Better places begin
          <br />
          with better neighbors.
        </div>
        <span className="nav-label">YOUR WORKSPACE</span>
        <button
          className="sidebar-nav active"
          onClick={() =>
            formRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        >
          <Icon name="grid" size={18} />
          Site intelligence
          <Icon name="arrow" size={14} />
        </button>
        <button className="sidebar-nav" onClick={toggleHistory}>
          <Icon name="file" size={18} />
          Saved reports<span className="nav-count">{saved.length}</span>
        </button>
        <button className="sidebar-nav" onClick={() => setMethod(true)}>
          <Icon name="book" size={18} />
          How it works
        </button>
        <div className="sidebar-recent">
          <span className="nav-label">RECENT PLACES</span>
          {saved.length ? (
            saved.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => loadReport(r)}
                disabled={loading}
              >
                <Icon name="pin" size={15} />
                <span>
                  {r.locality.name}
                  <small>
                    {new Date(r.generatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </span>
              </button>
            ))
          ) : (
            <p>
              Your next analysis
              <br />
              starts a new story.
            </p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="qloo-powered">
            <span className="qloo-symbol">Q</span>
            <div>
              Powered by Qloo<span>Taste AI, with purpose.</span>
            </div>
          </div>
          <span className="sidebar-footnote">
            Qloo Agentic Hackathon · 2026
          </span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <span className="breadcrumb">
            Workspace <span>/</span> <b>Site intelligence</b>
          </span>
          <div className="topbar-right">
            <button
              className="mobile-history icon-button"
              aria-label="Saved reports"
              onClick={toggleHistory}
            >
              <Icon name="file" size={17} />
            </button>
            <span className="connection-label">
              <i />
              Live Qloo intelligence
            </span>
            <a
              href="https://github.com/NSEVEjk0/perfect-mix"
              target="_blank"
              rel="noreferrer"
              className="source-link"
            >
              View source <Icon name="expand" size={13} />
            </a>
          </div>
        </header>
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="tiny-rule" />
                CULTURAL INTELLIGENCE FOR RETAIL REAL ESTATE
              </span>
              <h1>
                Every neighborhood
                <br />
                has a <em>perfect mix.</em>
              </h1>
              <p>
                Find the businesses that belong. Turn local taste into a
                thoughtful leasing plan for your next vacant space.
              </p>
              <div className="hero-note">
                <Icon name="spark" size={15} />
                <span>Real cultural signals. A more considered lease.</span>
              </div>
            </div>
            <div className="hero-scene">
              <StreetScene />
              <div className="scene-note">
                <span className="pulse-dot" />
                The right neighbor changes everything.
              </div>
            </div>
          </section>
          <section className="analysis-workspace">
            <div className="workspace-heading">
              <div>
                <span className="eyebrow">START WITH A PLACE</span>
                <h2>Let&apos;s find what belongs.</h2>
              </div>
              <span className="workspace-step">
                01 <span>/</span> Site brief
              </span>
            </div>
            <form ref={formRef} onSubmit={run} className="analysis-form">
              <div className="form-main">
                <label className="location-field">
                  <span>Neighborhood, city or coordinates</span>
                  <div className="input-with-icon">
                    <Icon name="pin" size={18} />
                    <input
                      required
                      minLength={3}
                      maxLength={160}
                      value={input.location}
                      onChange={(e) =>
                        setInput({ ...input, location: e.target.value })
                      }
                      placeholder="e.g. Lagos, Nigeria or 6.5244, 3.3792"
                      disabled={loading}
                    />
                  </div>
                </label>
                <label>
                  <span>
                    Total floor area <small>sq ft</small>
                  </span>
                  <input
                    required
                    type="number"
                    min="300"
                    max="100000"
                    value={input.sqft}
                    onChange={(e) =>
                      setInput({ ...input, sqft: Number(e.target.value) })
                    }
                    disabled={loading}
                  />
                </label>
                <label>
                  <span>
                    Monthly rent target <small>USD</small>
                  </span>
                  <div className="input-with-icon currency-input">
                    <span>$</span>
                    <input
                      required
                      type="number"
                      min="0"
                      max="1000000"
                      value={input.monthlyRent}
                      onChange={(e) =>
                        setInput({
                          ...input,
                          monthlyRent: Number(e.target.value),
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                </label>
              </div>
              <div className="form-secondary">
                <label>
                  <span>Leasing direction</span>
                  <select
                    value={input.focus}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        focus: e.target.value as AnalysisInput["focus"],
                      })
                    }
                    disabled={loading}
                  >
                    <option value="balanced">Open to any mix</option>
                    <option value="food">Food & drink</option>
                    <option value="lifestyle">
                      Retail, wellness & culture
                    </option>
                  </select>
                </label>
                <label>
                  <span>Maximum units</span>
                  <select
                    value={input.maxUnits}
                    onChange={(e) =>
                      setInput({ ...input, maxUnits: Number(e.target.value) })
                    }
                    disabled={loading}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? "1 anchor tenant" : `Up to ${n} tenants`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="idea-field">
                  <span>
                    Have a business in mind? <small>optional</small>
                  </span>
                  <input
                    maxLength={120}
                    value={input.proposed}
                    onChange={(e) =>
                      setInput({ ...input, proposed: e.target.value })
                    }
                    placeholder="e.g. wine bar, coffee shop, clothing store"
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="form-footer">
                <div className="example-locations">
                  <span>Try a place</span>
                  {[
                    "Williamsburg, Brooklyn, NY",
                    "Mission District, San Francisco",
                    "West Loop, Chicago",
                  ].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setInput({ ...input, location: l })}
                      disabled={loading}
                    >
                      {l.split(",")[0]}
                      <Icon name="arrow" size={12} />
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Reading the neighborhood
                    </>
                  ) : (
                    <>
                      Find my perfect mix <Icon name="arrow" size={17} />
                    </>
                  )}
                </button>
              </div>
              <p className="form-assumption">
                Rent is your planning target. Area allowances are prototype
                assumptions. Cultural evidence comes from Qloo. Place-name fallback uses GeoNames via Open-Meteo; the submitted location text is sent for lookup.
              </p>
            </form>
          </section>
          {error && (
            <div className="error-message" role="alert">
              <span>Research could not be completed</span>
              <p>{error}</p>
            </div>
          )}
          {historyOpen && (
            <section className="saved-reports">
              <div className="section-card-heading">
                <h3>Your saved research.</h3>
                <button
                  className="icon-button"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Close saved reports"
                >
                  <Icon name="close" />
                </button>
              </div>
              {saved.length ? (
                saved.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => loadReport(r)}
                    disabled={loading}
                  >
                    <Icon name="pin" />
                    <span>
                      <strong>{r.locality.name}</strong>
                      <small>
                        {number(r.input.sqft)} sq ft ·{" "}
                        {new Date(r.generatedAt).toLocaleString()}
                      </small>
                    </span>
                    <Icon name="arrow" />
                  </button>
                ))
              ) : (
                <p className="small-muted">
                  Completed analyses are saved in this browser. Start your first
                  analysis above.
                </p>
              )}
            </section>
          )}
          {(loading || report || steps.length > 0) && (
            <section
              className="results-section"
              ref={resultRef}
              aria-live="polite"
            >
              <div className="report-heading">
                <div>
                  <span className="eyebrow">YOUR SITE INTELLIGENCE</span>
                  <h2>
                    {report?.locality.name ??
                      "Good places are worth understanding."}
                  </h2>
                  {report && (
                    <p>
                      <Icon name="pin" size={13} />
                      {report.locality.address}
                    </p>
                  )}
                </div>
                {report && (
                  <button
                    className="secondary-button"
                    onClick={() => exportReport(report)}
                  >
                    <Icon name="download" size={15} />
                    Export brief
                  </button>
                )}
                {loading && (
                  <button
                    className="text-button"
                    onClick={() => abortRef.current?.abort()}
                  >
                    Cancel research
                  </button>
                )}
              </div>
              <div
                className="report-tabs"
                role="tablist"
                aria-label="Research report"
              >
                {[
                  { id: "plan", label: "Leasing plan", icon: "layers" },
                  { id: "evidence", label: "Local evidence", icon: "pin" },
                  { id: "activity", label: "Research activity", icon: "spark" },
                ].map((t) => (
                  <button
                    role="tab"
                    aria-selected={tab === t.id}
                    aria-controls={`panel-${t.id}`}
                    id={`tab-${t.id}`}
                    disabled={!report && t.id !== "activity"}
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={tab === t.id ? "active" : ""}
                  >
                    <Icon name={t.icon} size={16} />
                    {t.label}
                    {t.id === "activity" && (
                      <span className="tab-count">{steps.length}</span>
                    )}
                  </button>
                ))}
                {report && (
                  <span className="report-timestamp">
                    <i />
                    {new Date(report.generatedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · Qloo research
                  </span>
                )}
              </div>
              <div
                role="tabpanel"
                id={`panel-${tab}`}
                aria-labelledby={`tab-${tab}`}
                className="report-panel"
              >
                {tab === "plan" && report && (
                  <PlanResults key={report.id} report={report} />
                )}{" "}
                {tab === "evidence" && report && (
                  <LocalEvidence report={report} />
                )}{" "}
                {tab === "activity" && (
                  <Activity
                    steps={steps}
                    loading={loading}
                    failed={Boolean(error)}
                  />
                )}
              </div>
            </section>
          )}
          {!loading && !report && !steps.length && (
            <section className="principles">
              <div>
                <span className="principle-icon">
                  <Icon name="pin" />
                </span>
                <h3>Understand the place.</h3>
                <p>
                  Read the cultural signals around your site, through the
                  audiences of real nearby businesses.
                </p>
              </div>
              <div>
                <span className="principle-icon">
                  <Icon name="layers" />
                </span>
                <h3>Find the right neighbors.</h3>
                <p>
                  Compare tenant concepts and explore the brands and music
                  connected to local taste.
                </p>
              </div>
              <div>
                <span className="principle-icon">
                  <Icon name="check" />
                </span>
                <h3>Make a plan that fits.</h3>
                <p>
                  Get a space scenario with a workable footprint, a clear
                  rationale, and next steps to validate.
                </p>
              </div>
            </section>
          )}
          <footer className="page-footer">
            <span>Good places don&apos;t happen by accident.</span>
            <div>
              <button onClick={() => setMethod(true)}>Our methodology</button>
              <span>Built with Qloo Taste AI™</span>
            </div>
          </footer>
        </main>
      </div>
      {method && <MethodDialog close={() => setMethod(false)} />}
    </div>
  );
}
