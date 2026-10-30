import type { AnalysisInput, Concept, Unit } from "./types";

/** Enumerate feasible combinations. Qloo ranks drive utility; area is a hard constraint. */
export function planMix(concepts: Concept[], input: AnalysisInput) {
  const sharedSqft = Math.ceil(input.sqft * 0.1);
  const usableSqft = input.sqft - sharedSqft;
  const eligible = concepts.filter(
    (c) =>
      c.affinity !== null &&
      c.minSqft <= usableSqft &&
      (input.focus === "balanced" ||
        (input.focus === "food" ? c.family === "food" : c.family !== "food")),
  );
  let best: Concept[] = [];
  let bestUtility = -Infinity;
  for (let mask = 1; mask < 1 << eligible.length; mask++) {
    const group = eligible.filter((_, i) => mask & (1 << i));
    const used = group.reduce((sum, c) => sum + c.minSqft, 0);
    if (group.length > input.maxUnits || used > usableSqft) continue;
    const ranks = group.map(
      (c) =>
        (concepts.length + 1 - (c.rank ?? concepts.length)) / concepts.length,
    );
    const utility =
      ranks.reduce((sum, rank) => sum + rank, 0) +
      new Set(group.map((c) => c.family)).size * 0.12;
    if (utility > bestUtility) {
      best = group;
      bestUtility = utility;
    }
  }
  best.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  // Keep unused space visible: minimum allowances are not fabricated unit dimensions.
  const units: Unit[] = best.map((c) => ({
    conceptId: c.id,
    name: c.name,
    family: c.family,
    sqft: c.minSqft,
    monthlyRent: Math.floor((input.monthlyRent * c.minSqft) / usableSqft),
  }));
  const usedSqft = units.reduce((sum, u) => sum + u.sqft, 0);
  return {
    units,
    usableSqft,
    usedSqft,
    sharedSqft,
    remainingSqft: usableSqft - usedSqft,
    allocatedRent: units.reduce((sum, u) => sum + u.monthlyRent, 0),
  };
}

export function validateInput(body: Record<string, unknown>): AnalysisInput {
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  if (location.length < 3 || location.length > 160)
    throw new Error(
      "Enter a neighborhood or city, between 3 and 160 characters.",
    );
  const number = (value: unknown, min: number, max: number, label: string) => {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      throw new Error(
        `${label} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`,
      );
    return Math.round(value);
  };
  return {
    location,
    sqft: number(body.sqft, 300, 100_000, "Floor area"),
    monthlyRent: number(body.monthlyRent, 0, 1_000_000, "Monthly rent target"),
    maxUnits: number(body.maxUnits, 1, 4, "Number of units"),
    focus:
      body.focus === "food" || body.focus === "lifestyle"
        ? body.focus
        : "balanced",
    proposed:
      typeof body.proposed === "string"
        ? body.proposed.trim().slice(0, 120)
        : "",
  };
}
