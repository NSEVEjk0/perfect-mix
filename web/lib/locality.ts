type LocalityCandidate = {
  name?: string;
  disambiguation?: string;
  popularity?: number;
  location?: { lat?: number; lon?: number };
};
const aliases: Record<string, string> = {
  uk: "united kingdom",
  us: "united states",
  usa: "united states",
  ny: "new york",
  nyc: "new york",
  ca: "california",
  il: "illinois",
  sf: "san francisco",
  la: "los angeles",
};
function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .flatMap((t) => (aliases[t] ?? t).split(" "))
    .filter(Boolean)
    .filter((t) => !["the", "city", "district", "neighborhood"].includes(t));
}

/** Require the requested place and regional context, rather than trust search ordering. */
export function selectLocality<T extends LocalityCandidate>(
  query: string,
  candidates: T[],
): T | null {
  const parts = query
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const primary = tokens(parts[0]);
  if (!primary.length) return null;
  const context = tokens(parts.slice(1).join(" "));
  const scored = candidates
    .filter(
      (e) =>
        Number.isFinite(e.location?.lat) && Number.isFinite(e.location?.lon),
    )
    .map((e) => {
      const name = tokens(e.name ?? "");
      const address = tokens(`${e.name ?? ""} ${e.disambiguation ?? ""}`);
      const mainMatches =
        parts.length > 1
          ? primary.every((t) => name.includes(t))
          : primary.every((t) => address.includes(t)) &&
            name.some((t) => primary.includes(t));
      const contextMatches = context.every((t) => address.includes(t));
      const exactName = name.join(" ") === primary.join(" ");
      return {
        e,
        accepted: mainMatches && contextMatches,
        score:
          (exactName ? 100 : 0) +
          name.filter((t) => primary.includes(t)).length +
          (e.popularity ?? 0),
      };
    })
    .filter((e) => e.accepted)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.e ?? null;
}
