import type { AnalysisReport } from "@/lib/types";

export default function LocationSummary({ report }: { report: AnalysisReport }) {
  if (!report.coverage) return null;
  const place = report.locality;
  return (
    <div className={`coverage-card coverage-${report.coverage.status}`}>
      <span className="eyebrow">{report.coverage.label}</span>
      <p>{report.coverage.detail}</p>
      <dl className="location-facts">
        <div><dt>Resolved place</dt><dd>{place.name}</dd></div>
        <div><dt>Coordinates</dt><dd>{place.lat.toFixed(4)}, {place.lon.toFixed(4)}</dd></div>
        {place.population !== undefined && <div><dt>Locality population</dt><dd>{place.population.toLocaleString("en-US")}</dd></div>}
        {place.timezone && <div><dt>Time zone</dt><dd>{place.timezone}</dd></div>}
      </dl>
      <div className="coverage-links">
        <a href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=13/${place.lat}/${place.lon}`} target="_blank" rel="noreferrer">Explore the mapped location ↗</a>
        {place.source === "GeoNames" && <span>Location data: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> via <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>. Population describes the locality, not potential customers.</span>}
      </div>
    </div>
  );
}
