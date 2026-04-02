import type { StudentGrade, TargetCountry } from "@/lib/domain/models/common";
import type { ScenarioAdjustments } from "@/lib/domain/models/session";
import type { PlanCategoryKey } from "@/lib/domain/models/course";

export interface PlanSelectionInput {
  currentGrade: StudentGrade;
  targetCountries: TargetCountry[];
  scenario: ScenarioAdjustments;

  categorySelections: Partial<Record<PlanCategoryKey, string>>;

  // What we are validating
  core: string[];
  set1: string[];
  set2: string[];

  // For mid-year continuity rules
  currentCourses: string[];
  currentAPs: string[];
}

