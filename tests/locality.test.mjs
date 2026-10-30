import test from "node:test";
import assert from "node:assert/strict";
import { selectLocality } from "../web/lib/locality.ts";
const loc = (name, disambiguation) => ({
  name,
  disambiguation,
  location: { lat: 1, lon: 1 },
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
