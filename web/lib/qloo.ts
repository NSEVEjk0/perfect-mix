import "server-only";
import type { Evidence, Taste } from "./types";

type Json = Record<string, any>;
const cache = new Map<string, { at: number; data: Json }>();
const pending = new Map<string, Promise<Json>>();
let nextRequestAt = 0;
async function paceRequest() {
  const start = Math.max(Date.now(), nextRequestAt);
  nextRequestAt = start + 200;
  const delay = start - Date.now();
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
}

export async function qloo(
  path: string,
  params: Record<string, string>,
): Promise<Json> {
  const key = process.env.QLOO_KEY;
  if (!key)
    throw new Error(
      "Live taste intelligence is not configured. Set QLOO_KEY on the server.",
    );
  const url = `https://hackathon.api.qloo.com${path}?${new URLSearchParams(params)}`;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < 15 * 60_000) return cached.data;
  const existing = pending.get(url);
  if (existing) return existing;
  const request = (async () => {
    const send = async () => {
      await paceRequest();
      return fetch(url, {
        headers: { "X-Api-Key": key, Accept: "application/json" },
        signal: AbortSignal.timeout(12_000),
        cache: "no-store",
      });
    };
    let response = await send();
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(
        response.headers.get("retry-after") ??
          response.headers.get("x-second-ratelimit-reset") ??
          1,
      );
      await response.body?.cancel();
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.max(1100, Math.min(5000, retryAfter * 1000 || 1100)),
        ),
      );
      response = await send();
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403)
        throw new Error(
          "Qloo did not authorize this request. Check the server API key and permitted entity types.",
        );
      if (response.status === 429)
        throw new Error(
          "Qloo is receiving too many requests. Please try again in a minute.",
        );
      throw new Error(
        `Qloo could not complete the research (HTTP ${response.status}). Try a nearby neighborhood or city.`,
      );
    }
    const data = (await response.json()) as Json;
    if (data.success === false || data.errors?.length)
      throw new Error("Qloo could not resolve this research query.");
    if (cache.size > 400) cache.clear();
    cache.set(url, { at: Date.now(), data });
    return data;
  })();
  pending.set(url, request);
  try {
    return await request;
  } finally {
    pending.delete(url);
  }
}

export function entities(data: Json): Json[] {
  return Array.isArray(data.results)
    ? data.results
    : (data.results?.entities ?? []);
}
export function tags(data: Json): Taste[] {
  return (data.results?.tags ?? [])
    .map((t: Json) => ({
      id: t.tag_id ?? t.id,
      name: t.name,
      affinity: affinity(t.query?.affinity),
    }))
    .filter((t: Taste) => t.id && t.name);
}
function affinity(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
export function evidence(e: Json, seeds: Evidence[] = []): Evidence {
  const contributions =
    e.query?.explainability?.["signal.interests.entities"] ?? [];
  const website = e.properties?.website;
  const image = e.properties?.image?.url ?? e.properties?.images?.[0]?.url;
  return {
    id: e.entity_id ?? e.id,
    name: e.name,
    affinity: affinity(e.query?.affinity),
    address: e.properties?.address ?? e.disambiguation ?? undefined,
    lat: e.location?.lat,
    lon: e.location?.lon,
    distance: e.query?.distance,
    image:
      typeof image === "string" && image.startsWith("https://images.qloo.com/")
        ? image
        : undefined,
    website:
      typeof website === "string" && /^https?:\/\//.test(website)
        ? website
        : undefined,
    tags: (e.tags ?? [])
      .map((t: Json) => ({ id: t.id ?? t.tag_id, name: t.name }))
      .filter((t: Taste) => t.id && t.name),
    contributors: contributions.map((c: Json) => ({
      id: c.entity_id,
      name:
        seeds.find((s) => s.id === c.entity_id)?.name ?? "Nearby taste anchor",
      weight: c.score,
    })),
  };
}

export async function findTag(query: string): Promise<Taste | null> {
  const data = await qloo("/v2/tags", { "filter.query": query, take: "12" });
  const found = tags(data);
  const normalized = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    found
      .sort((a, b) => {
        const score = (t: Taste) =>
          (t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
            ? 20
            : 0) +
          (t.id.startsWith("urn:tag:genre:place:")
            ? 8
            : t.id.startsWith("urn:tag:category:place:")
              ? 6
              : 0);
        return score(b) - score(a);
      })
      .find((t) => t.id.includes(":place:") || t.id.includes(":qloo:")) ?? null
  );
}
