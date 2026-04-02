import type { CourseCatalog } from "@/lib/domain/engine/types";
import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";

const REPLACEMENTS = [
  { ap: "AP_LANG_COMP", core: "ENG_11", subject: "English" },
  { ap: "AP_PHYSICS_C1", core: "PHYS_11", subject: "Physics" },
  // Math has multiple “core” options; rule: AP Calc AB cannot be selected alongside any other math core.
  { ap: "AP_CALC_AB", core: "MATH_INT_3", subject: "Math" },
  { ap: "AP_CALC_AB", core: "PRECALC", subject: "Math" },
  { ap: "AP_CALC_AB", core: "MATH_BUSINESS", subject: "Math" },
  { ap: "AP_CALC_AB", core: "AP_STATS", subject: "Math" },
  { ap: "AP_CALC_AB", core: "CALCULUS", subject: "Math" },
  { ap: "AP_CALC_AB", core: "CALC_BUSINESS", subject: "Math" },
  { ap: "AP_CALC_AB", core: "CALC_FOUNDATION", subject: "Math" },
];

export function validateCoreReplacementConflicts(params: {
  input: PlanSelectionInput;
  catalog: CourseCatalog;
}): ConstraintViolation[] {
  const { input } = params;
  const coreSet = new Set([...input.core, ...Object.values(input.categorySelections).filter(Boolean) as string[]]);
  const violations: ConstraintViolation[] = [];

  for (const r of REPLACEMENTS) {
    if (coreSet.has(r.ap) && coreSet.has(r.core)) {
      violations.push({
        ruleKey: "duplicate_choice",
        blocked: true,
        message: `Invalid combination: ${r.ap} replaces ${r.subject}. You cannot select both ${r.ap} and ${r.core} together.`,
      });
    }
  }

  return violations;
}

