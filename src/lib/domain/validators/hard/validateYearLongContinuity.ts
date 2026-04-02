import type { CourseCatalog } from "@/lib/domain/engine/types";
import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";

function isYearLong(courseCode: string, catalog: CourseCatalog) {
  return Boolean(catalog.courses.find((c) => c.code === courseCode)?.yearLong);
}

function electiveSetOf(courseCode: string, catalog: CourseCatalog): "Set1" | "Set2" | "Core" | null {
  const c = catalog.courses.find((x) => x.code === courseCode);
  return c?.electiveSet ?? null;
}

/**
 * Hard rule: if mid-year and student is currently in a year-long course/AP, it cannot be dropped/swapped.
 *
 * Implementation choice for MVP:
 * - Only enforces continuity for year-long courses that appear in our catalog.
 * - Checks both currentAPs and currentCourses lists.
 */
export function validateYearLongContinuity(params: {
  input: PlanSelectionInput;
  catalog: CourseCatalog;
}): ConstraintViolation[] {
  const { input, catalog } = params;
  if (!input.scenario.isMidYear) return [];

  const currentlyIn = Array.from(new Set([...input.currentAPs, ...input.currentCourses]));
  const currentYearLong = currentlyIn.filter((code) => isYearLong(code, catalog));
  if (currentYearLong.length === 0) return [];

  const violations: ConstraintViolation[] = [];
  const selectedAll = new Set([...input.core, ...input.set1, ...input.set2]);

  for (const code of currentYearLong) {
    const set = electiveSetOf(code, catalog);
    if (!set) continue;

    // If it is a year-long elective (Set1/Set2) we require it to remain in that set selection.
    if (set === "Set1" && !input.set1.includes(code)) {
      violations.push({
        ruleKey: "year_long_cannot_drop",
        blocked: true,
        message: `Mid-year: you are currently in year-long course ${code}. Set 1 selection cannot drop/swap it.`,
      });
    }
    if (set === "Set2" && !input.set2.includes(code)) {
      violations.push({
        ruleKey: "year_long_cannot_drop",
        blocked: true,
        message: `Mid-year: you are currently in year-long course ${code}. Set 2 selection cannot drop/swap it.`,
      });
    }

    // If it is a year-long core course/AP (Core), require it to remain in the core plan.
    if (set === "Core" && !selectedAll.has(code)) {
      violations.push({
        ruleKey: "year_long_cannot_drop",
        blocked: true,
        message: `Mid-year: you are currently in year-long course ${code}. The plan cannot drop/swap it.`,
      });
    }
  }

  return violations;
}

