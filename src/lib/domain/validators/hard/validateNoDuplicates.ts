import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";

export function validateNoDuplicates(input: PlanSelectionInput): ConstraintViolation[] {
  const categoryValues = Object.values(input.categorySelections).filter(Boolean) as string[];
  // Category-native mode: category selections are source of truth; compatibility arrays may mirror same codes.
  const all =
    categoryValues.length > 0
      ? [...categoryValues]
      : [...input.core, ...input.set1, ...input.set2];
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const c of all) {
    if (seen.has(c)) dups.add(c);
    seen.add(c);
  }

  if (dups.size === 0) return [];

  return [
    {
      ruleKey: "duplicate_choice",
      blocked: true,
      message: `A course cannot be selected more than once in the same plan. Duplicates: ${Array.from(dups).join(", ")}.`,
    },
  ];
}

