import test from "node:test";
import assert from "node:assert/strict";
import { loadEngine } from "./helpers/load-engine.mjs";

const input = { location: "Nagpur, India", sqft: 3000, monthlyRent: 15000, maxUnits: 2, focus: "balanced", proposed: "" };
const nagpur = { id: 1262180, name: "Nagpur", latitude: 21.14631, longitude: 79.08491, country: "India", country_code: "IN", admin1: "Maharashtra", population: 2405665, timezone: "Asia/Kolkata" };
const places = Array.from({ length: 4 }, (_, i) => ({ entity_id: `place-${i}`, name: `Local business ${i}`, tags: [], location: { lat: 21.15, lon: 79.08 }, properties: { is_closed: false } }));
const reply = (data, status = 200) => Promise.resolve(new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } }));

function boundary({ nearby = places, measured = true, failed = false, geocoded = [nagpur] } = {}) {
  const urls = [];
  const fetch = (raw) => {
    const url = new URL(raw); urls.push(url);
    if (url.hostname.includes("open-meteo")) return reply({ results: geocoded });
    if (failed) return reply({ error: "Unauthorized" }, 401);
    if (url.pathname === "/search") return reply({ results: [] });
    if (url.pathname === "/v2/tags") {
      const name = url.searchParams.get("filter.query");
      return reply({ results: { tags: [{ tag_id: `urn:tag:genre:place:${name.toLowerCase().replaceAll(" ", "_")}`, name }] } });
    }
    if (url.searchParams.get("filter.type") === "urn:entity:place") return reply({ results: { entities: nearby } });
    if (url.searchParams.get("filter.type") === "urn:tag") {
      const requested = url.searchParams.get("filter.results.tags");
      return reply({ results: { tags: requested && measured ? requested.split(",").map((id, i) => ({ tag_id: id, name: id.split(":").at(-1), query: { affinity: 0.95 - i * 0.05 } })) : [] } });
    }
    return reply({ results: { entities: [] } });
  };
  return { fetch, urls };
}

test("a city outside Qloo locality search uses real geocoded coordinates for cultural research", async () => {
  const mock = boundary();
  const report = await loadEngine(mock.fetch).analyze(input, () => {});
  assert.equal(report.locality.source, "GeoNames");
  assert.equal(report.locality.population, 2405665);
  assert.equal(report.locality.country, "India");
  assert.equal(report.coverage.status, "measured");
  assert.ok(report.mix.units.length > 0);
  assert.ok(mock.urls.some((u) => u.searchParams.get("filter.location") === "POINT(79.08491 21.14631)"));
});

test("coordinates with no place coverage return a location report and no invented affinity or tenants", async () => {
  const mock = boundary({ nearby: [] });
  const report = await loadEngine(mock.fetch).analyze({ ...input, location: "0, -140" }, () => {});
  assert.equal(report.locality.source, "Coordinates");
  assert.equal(report.locality.lon, -140);
  assert.equal(report.coverage.status, "location-only");
  assert.equal(report.mix.units.length, 0);
  assert.equal(report.mix.remainingSqft + report.mix.sharedSqft, input.sqft);
  assert.ok(report.concepts.length > 0);
  assert.ok(report.concepts.every((c) => c.affinity === null && c.rank === null));
  assert.ok(!mock.urls.some((u) => u.pathname === "/search" || u.hostname.includes("open-meteo")));
  assert.deepEqual(mock.urls.map((u) => Number(u.searchParams.get("filter.location.radius"))), [2500, 5000, 10000, 25000]);
});

test("available local businesses remain visible when taste measurements are absent", async () => {
  const mock = boundary({ measured: false });
  const report = await loadEngine(mock.fetch).analyze(input, () => {});
  assert.equal(report.coverage.status, "partial");
  assert.equal(report.localPlaces.length, 4);
  assert.equal(report.mix.units.length, 0);
  assert.ok(report.concepts.every((c) => c.affinity === null));
});

test("a Qloo outage still preserves verified geographic facts without implying a successful cultural query", async () => {
  const mock = boundary({ failed: true });
  const report = await loadEngine(mock.fetch).analyze(input, () => {});
  assert.equal(report.locality.name, "Nagpur");
  assert.equal(report.coverage.status, "location-only");
  assert.equal(report.mix.units.length, 0);
  assert.ok(report.trace.some((t) => t.status === "limited"));
});

test("a conflicting regional context cannot silently select a city in another country", async () => {
  const mock = boundary();
  await assert.rejects(loadEngine(mock.fetch).analyze({ ...input, location: "Nagpur, France" }, () => {}), /could not identify/);
});
test("a lone country qualifier cannot become a same-named locality in another country", async () => {
  const mock = boundary({ geocoded: [{ id: 123, name: "France", latitude: 38, longitude: -90, country: "United States" }] });
  await assert.rejects(loadEngine(mock.fetch).analyze({ ...input, location: "Unknown Quarter, France" }, () => {}), /could not identify/);
});

test("invalid coordinates are rejected before sending external requests", async () => {
  const mock = boundary();
  await assert.rejects(loadEngine(mock.fetch).analyze({ ...input, location: "95, 3" }, () => {}), /latitude/);
  assert.equal(mock.urls.length, 0);
});
test("a smaller unresolved place can show its requested city context only with explicit broader-area labeling", async () => {
  const mock = boundary();
  const report = await loadEngine(mock.fetch).analyze({ ...input, location: "Unknown Quarter, Nagpur, India" }, () => {});
  assert.equal(report.locality.name, "Nagpur");
  assert.equal(report.locality.scope, "broader");
  assert.equal(report.input.location, "Unknown Quarter, Nagpur, India");
  assert.equal(report.coverage.status, "partial");
  assert.match(report.coverage.detail, /broader regional context/);
});
test("a postcode can identify a place without renaming that place to the postal code", async () => {
  const mock = boundary({ geocoded: [{ id: 5328041, name: "Beverly Hills", latitude: 34.07, longitude: -118.4, country: "United States", admin1: "California", postcodes: ["90210"] }] });
  const report = await loadEngine(mock.fetch).analyze({ ...input, location: "90210" }, () => {});
  assert.equal(report.locality.name, "Beverly Hills");
  assert.equal(report.locality.source, "GeoNames");
});
