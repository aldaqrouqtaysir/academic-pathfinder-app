import type { CourseCatalog } from "@/lib/domain/engine/types";
import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";
import { scienceElectiveCodesSeed } from "@/data/sais";

function isScienceChoice(code: string, catalog: CourseCatalog) {
  if (scienceElectiveCodesSeed.includes(code)) return true;
  const c = catalog.courses.find((x) => x.code === code);
  if (!c) return false;
  return c.tags.includes("Lab") || c.tags.includes("Health") || c.name.toLowerCase().includes("science");
}

/**
 * Hard rule: Grade 12 must include a science elective path.
 *
 * Implementation for MVP:
 * - We enforce that at least one of (Set1/Set2) is a science choice (seed list + tag heuristics).
 */
export function validateGrade12ScienceRequirement(params: {
  input: PlanSelectionInput;
  catalog: CourseCatalog;
}): ConstraintViolation[] {
  const { input, catalog } = params;
  if (input.currentGrade !== 12) return [];

  const scienceCategoryChoice = input.categorySelections.science_category;
  const electiveCodes = [...input.set1, ...input.set2];
  const hasScience = Boolean(scienceCategoryChoice && isScienceChoice(scienceCategoryChoice, catalog)) ||
    electiveCodes.some((c) => isScienceChoice(c, catalog));
  if (hasScience) return [];

  return [
    {
      ruleKey: "prerequisite_satisfied",
      blocked: true,
      message:
        "Grade 12 requires a science path. Pick a science row course (e.g., Environmental Science) and/or a science-heavy elective/AP in your plan (e.g., AP Biology, AP Chemistry).",
    },
  ];
}

