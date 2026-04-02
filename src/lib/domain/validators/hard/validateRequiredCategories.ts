import { categoryTemplatesSeed } from "@/data/sais";
import type { CourseCatalog } from "@/lib/domain/engine/types";
import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";

/**
 * Category-native validation:
 * - required categories exist for grade+semester template
 * - exactly one option selected for each required category
 * - selected option must be one of template options
 */
export function validateRequiredCategories(params: {
  input: PlanSelectionInput;
  catalog: CourseCatalog;
}): ConstraintViolation[] {
  const { input } = params;
  const template = categoryTemplatesSeed.find((t) => t.grade === input.currentGrade && t.semester === input.scenario.semester);
  if (!template) return [];

  const violations: ConstraintViolation[] = [];
  for (const cat of template.categories.filter((c) => c.required)) {
    const selected = input.categorySelections[cat.key];
    if (!selected) {
      violations.push({
        ruleKey: "elective_set_pattern_g11_g12",
        blocked: true,
        message: `Required category missing selection: ${cat.label}.`,
      });
      continue;
    }
    const allowed = cat.options.map((o) => o.courseCode);
    if (!allowed.includes(selected)) {
      violations.push({
        ruleKey: "elective_set_pattern_g11_g12",
        blocked: true,
        message: `Invalid selection for ${cat.label}: ${selected}.`,
      });
    }
  }

  // Set 1 / Set 2 are also required categories for grades where electives are enabled.
  return violations;
}

