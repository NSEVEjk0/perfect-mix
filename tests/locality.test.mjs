import test from "node:test";
import assert from "node:assert/strict";
import { selectLocality } from "../web/lib/locality.ts";
const loc = (name, disambiguation) => ({
  name,
  disambiguation,
  location: { lat: 1, lon: 1 },
});

test("a place without regional context resolves instead of requiring an empty search term", () => {
  const brooklyn = loc("Brooklyn", "Brooklyn, New York, United States");
  assert.equal(selectLocality("brooklyn", [brooklyn]), brooklyn);
  assert.equal(selectLocality("Brooklyn, ", [brooklyn]), brooklyn);
});
test("localities written in non-Latin scripts retain their place name", () => {
  const place = loc("東京", "東京, 日本");
  assert.equal(selectLocality("東京, 日本", [place]), place);
});
test("a bare city name prefers an exact locality name over a neighborhood", () => {
  const city = loc("Brooklyn", "Brooklyn, New York, United States");
  assert.equal(
    selectLocality("Brooklyn", [
      { ...loc("Downtown Brooklyn", "Brooklyn, New York, United States"), popularity: 1 },
      { ...city, popularity: 0.9 },
    ])?.name,
    "Brooklyn",
  );
});
test("empty or generic location text cannot select an arbitrary locality", () => {
  const candidates = [loc("Brooklyn", "Brooklyn, New York, United States")];
  for (const query of ["", ", ,", "the city", "district"]) {
    assert.equal(selectLocality(query, candidates), null);
  }
});

test("Mission District resolves to San Francisco even when Qloo ranks a Philippine locality first", () => {
  const candidates = [
    loc("San Francisco del Monte", "Quezon City, Philippines"),
    loc("Mission San Jose District", "Fremont, California, United States"),
    loc(
      "Mission District",
      "Mission District, San Francisco, California, United States",
    ),
  ];
  assert.equal(
    selectLocality("Mission District, San Francisco", candidates)?.name,
    "Mission District",
  );
});
test("regional context prevents selection of a same-named place in the wrong country", () => {
  const candidates = [
    loc("London", "London, Ontario, Canada"),
    loc("London", "London, England, United Kingdom"),
  ];
  assert.match(
    selectLocality("London, UK", candidates)?.disambiguation,
    /United Kingdom/,
  );
});
test("absent regional matches return a gap rather than substitute another location", () => {
  assert.equal(
    selectLocality("Williamsburg, Brooklyn", [
      loc("Williamsburg", "Williamsburg, Virginia, United States"),
    ]),
    null,
  );
});
test("common region abbreviations and a leading article retain the intended neighborhood", () => {
  assert.equal(
    selectLocality("The Mission, San Francisco, CA", [
      loc(
        "Mission District",
        "Mission District, San Francisco, California, United States",
      ),
    ])?.name,
    "Mission District",
  );
});
