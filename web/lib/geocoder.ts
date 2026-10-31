import "server-only";
import { selectGeocodedLocation } from "./geocoding";
import type { ResolvedLocation } from "./types";

const cache = new Map<string, { at: number; data: any[] }>();
const pending = new Map<string, Promise<any[]>>();

async function search(query: string) {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < 24 * 60 * 60_000) return cached.data;
  const active = pending.get(query);
  if (active) return active;
  const request = (async () => {
    const apiKey = process.env.GEOCODING_API_KEY;
    const params = new URLSearchParams({ name: query, count: "100", language: "en", format: "json" });
    if (apiKey) params.set("apikey", apiKey);
    const origin = apiKey ? "https://customer-geocoding-api.open-meteo.com" : "https://geocoding-api.open-meteo.com";
    const response = await fetch(`${origin}/v1/search?${params}`, {
      signal: AbortSignal.timeout(8000), cache: "no-store",
    });
    if (!response.ok) throw new Error("The worldwide place lookup is temporarily unavailable. You can enter latitude, longitude instead.");
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (cache.size > 300) cache.clear();
    cache.set(query, { at: Date.now(), data: results });
    return results;
  })();
  pending.set(query, request);
  try { return await request; } finally { pending.delete(query); }
}

export async function geocodeLocation(query: string): Promise<ResolvedLocation | null> {
  const primary = query.split(",")[0].trim();
  for (const name of [...new Set([query, primary])]) {
    const found = selectGeocodedLocation(query, await search(name));
    if (found) return found;
  }
  // Preserve the requested region and disclose city-level context when a smaller place is absent.
  const context = query.split(",").slice(1).join(",").trim();
  if (context && query.split(",").filter((p) => p.trim()).length >= 3) {
    const found = selectGeocodedLocation(context, await search(context));
    if (found) return { ...found, scope: "broader" };
  }
  return null;
}
