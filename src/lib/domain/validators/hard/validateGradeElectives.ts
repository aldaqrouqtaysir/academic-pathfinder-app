import type { CourseCatalog } from "@/lib/domain/engine/types";
import type { ConstraintViolation } from "../types";
import type { PlanSelectionInput } from "./types";

export function validateGradeElectives(params: {
  input: PlanSelectionInput;
  catalog: CourseCatalog;
}): ConstraintViolation[] {
  const { input } = params;
  const violations: ConstraintViolation[] = [];

  const set1 = input.categorySelections.set1_elective ?? input.set1[0];
  const set2 = input.categorySelections.set2_elective ?? input.set2[0];
  const electiveCount = [set1, set2].filter(Boolean).length;

  if ((input.currentGrade === 9 || input.currentGrade === 10) && electiveCount > 0) {
    violations.push({
      ruleKey: "grade_no_electives_g9_g10",
      blocked: true,
      message: "Grades 9–10 cannot select semester electives. (VPA is taken as a core subject.)",
    });
  }

  if ((input.currentGrade === 11 || input.currentGrade === 12) && (!set1 || !set2)) {
    violations.push({
      ruleKey: "elective_set_pattern_g11_g12",
      blocked: true,
      message: "Grades 11–12 must select exactly 1 course from Set 1 and exactly 1 course from Set 2 for semester electives.",
    });
  }

  return violations;
}

