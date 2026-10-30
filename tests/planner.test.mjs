import test from "node:test";
import assert from "node:assert/strict";
import { planMix, validateInput } from "../web/lib/planner.ts";

const brief = {
  location: "Williamsburg, Brooklyn",
  sqft: 3000,
  monthlyRent: 15000,
  maxUnits: 2,
  focus: "balanced",
  proposed: "",
};
const concept = (id, minSqft, rank, family = "food", measured = true) => ({
  id,
  name: id,
  family,
  minSqft,
  affinity: measured ? 0.95 - rank * 0.02 : null,
  rank: measured ? rank : null,
});

test("every proposed mix respects the gross area, shared-space reserve, unit limit, and rent target", () => {
  const concepts = [
    concept("restaurant", 1800, 1),
    concept("coffee", 850, 2),
    concept("retail", 950, 3, "retail"),
    concept("gallery", 800, 4, "culture"),
  ];
  for (const sqft of [300, 700, 1200, 2000, 3000, 4500, 10000]) {
    for (const maxUnits of [1, 2, 3, 4]) {
      const input = { ...brief, sqft, maxUnits };
      const mix = planMix(concepts, input);
      assert.ok(mix.usedSqft + mix.sharedSqft <= sqft);
      assert.equal(mix.usedSqft + mix.remainingSqft, mix.usableSqft);
      assert.equal(mix.sharedSqft + mix.usableSqft, sqft);
      assert.ok(mix.units.length <= maxUnits);
      assert.ok(mix.allocatedRent <= input.monthlyRent);
    }
  }
});

test("absent Qloo affinities never become recommendations", () => {
  const mix = planMix([concept("unsupported", 500, 1, "retail", false)], brief);
  assert.equal(mix.units.length, 0);
});

test("a lifestyle brief excludes food and a food brief excludes other families", () => {
  const concepts = [
    concept("coffee", 850, 1),
    concept("retail", 950, 2, "retail"),
    concept("gallery", 800, 3, "culture"),
  ];
  const lifestyle = planMix(concepts, { ...brief, focus: "lifestyle" });
  assert.ok(lifestyle.units.length > 0);
  assert.ok(lifestyle.units.every((u) => u.family !== "food"));
  const food = planMix(concepts, { ...brief, focus: "food" });
  assert.ok(food.units.every((u) => u.family === "food"));
});

test("changing measured Qloo ranks changes the selected anchor", () => {
  const a = planMix(
    [concept("coffee", 850, 1), concept("retail", 950, 2, "retail")],
    { ...brief, maxUnits: 1 },
  );
  const b = planMix(
    [concept("retail", 950, 1, "retail"), concept("coffee", 850, 2)],
    { ...brief, maxUnits: 1 },
  );
  assert.equal(a.units[0].conceptId, "coffee");
  assert.equal(b.units[0].conceptId, "retail");
});

test("zero asking rent stays zero, and a space too small returns a research gap", () => {
  assert.equal(
    planMix([concept("coffee", 850, 1)], { ...brief, monthlyRent: 0 })
      .allocatedRent,
    0,
  );
  assert.equal(
    planMix([concept("restaurant", 1800, 1)], { ...brief, sqft: 1000 }).units
      .length,
    0,
  );
});

test("invalid and non-finite planning inputs are rejected", () => {
  for (const invalid of [
    { sqft: -1 },
    { sqft: NaN },
    { sqft: Infinity },
    { monthlyRent: -1 },
    { maxUnits: 9 },
    { location: "" },
  ]) {
    assert.throws(() => validateInput({ ...brief, ...invalid }));
  }
  assert.equal(validateInput(brief).location, brief.location);
});
