import type { RuleKey } from "../models/rules";
import type { CourseCatalog, RulesCatalog } from "../engine/types";
import type { HardConstraintInput, ConstraintViolation } from "./types";
import { validateGradeElectives } from "./hard/validateGradeElectives";
import { validateNoDuplicates } from "./hard/validateNoDuplicates";
import { validateYearLongContinuity } from "./hard/validateYearLongContinuity";
import { validateCoreReplacementConflicts } from "./hard/validateCoreReplacementConflicts";
import { validateGrade12ScienceRequirement } from "./hard/validateGrade12ScienceRequirement";
import { validateRequiredCategories } from "./hard/validateRequiredCategories";
import type { PlanSelectionInput } from "./hard/types";

export interface HardValidationResult {
  violations: ConstraintViolation[];
  blocked: boolean;
  hardBlockedRuleKeys: RuleKey[];
}

/**
 * Deterministic hard constraint validator.
 *
 * Phase 1 starter behavior:
 * - Enforces the *shape* of SAIS rules that we can express from the docs.
 * - Does NOT yet enforce the full prerequisite matrices because the course catalog is starter seed only.
 *
 * Phase 2 will replace placeholder logic with validator_config-driven checks and real course prerequisite data.
 */
export function validateHardConstraints(params: {
  input: HardConstraintInput;
  catalog: CourseCatalog;
  rules: RulesCatalog;
}): HardValidationResult {
  const { input, catalog } = params;

  const planInput: PlanSelectionInput = {
    currentGrade: input.currentGrade,
    targetCountries: input.targetCountries,
    scenario: input.scenario,
    categorySelections: input.categorySelections,
    core: input.core.length > 0 ? input.core : Object.values(input.categorySelections).filter(Boolean) as string[],
    set1: input.set1.length > 0 ? input.set1 : (input.categorySelections.set1_elective ? [input.categorySelections.set1_elective] : []),
    set2: input.set2.length > 0 ? input.set2 : (input.categorySelections.set2_elective ? [input.categorySelections.set2_elective] : []),
    currentCourses: input.currentCourses,
    currentAPs: input.currentAPs,
  };

  const violations: ConstraintViolation[] = [
    ...validateRequiredCategories({ input: planInput, catalog }),
    ...validateGradeElectives({ input: planInput, catalog }),
    ...validateNoDuplicates(planInput),
    ...validateYearLongContinuity({ input: planInput, catalog }),
    ...validateCoreReplacementConflicts({ input: planInput, catalog }),
    ...validateGrade12ScienceRequirement({ input: planInput, catalog }),
  ];

  const hardBlockedRuleKeys: RuleKey[] = violations.filter((v) => v.blocked).map((v) => v.ruleKey);
  return { violations, blocked: hardBlockedRuleKeys.length > 0, hardBlockedRuleKeys };
}

