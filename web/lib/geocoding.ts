import { selectLocality } from "./locality";
import type { ResolvedLocation } from "./types";

export function coordinateLocation(query: string): ResolvedLocation | null {
  const match = query.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*[,;]\s*([+-]?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180)
    throw new Error("Use latitude from −90 to 90 and longitude from −180 to 180.");
  return {
    id: `coordinates:${lat},${lon}`,
    name: "Your selected location",
    address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    lat, lon, source: "Coordinates", scope: "requested",
  };
}

type GeoName = {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  population?: number;
  timezone?: string;
  postcodes?: string[];
};

export function selectGeocodedLocation(query: string, results: GeoName[]): ResolvedLocation | null {
  const primary = query.split(",")[0].trim();
  const candidates = results.filter((r) => r.id && r.name &&
    Number.isFinite(r.latitude) && Number.isFinite(r.longitude) &&
    Math.abs(r.latitude!) <= 90 && Math.abs(r.longitude!) <= 180).map((r) => {
      const address = [...new Set([r.name, r.admin4, r.admin3, r.admin2, r.admin1, r.country].filter(Boolean))].join(", ");
      return {
        ...r, name: r.postcodes?.some((p) => p.toLowerCase() === primary.toLowerCase()) ? primary : r.name!, displayName: r.name!, address,
        disambiguation: `${address}, ${r.country_code ?? ""}`,
        location: { lat: r.latitude!, lon: r.longitude! },
        popularity: Math.min(0.99, Math.log10((r.population ?? 0) + 1) / 10),
      };
    });
  const selected = selectLocality(query, candidates);
  if (!selected) return null;
  return {
    id: `geonames:${selected.id}`, name: selected.displayName, address: selected.address,
    lat: selected.location.lat, lon: selected.location.lon,
    source: "GeoNames", scope: "requested", country: selected.country,
    population: Number.isFinite(selected.population) ? selected.population : undefined,
    timezone: selected.timezone,
  };
}
