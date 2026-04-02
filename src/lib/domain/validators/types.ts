import type { RuleKey } from "../models/rules";
import type { ScenarioAdjustments } from "../models/session";
import type { StudentGrade, TargetCountry } from "../models/common";
import type { PlanCategoryKey } from "../models/course";

export interface HardConstraintInput {
  currentGrade: StudentGrade;
  targetCountries: TargetCountry[];
  scenario: ScenarioAdjustments;

  categorySelections: Partial<Record<PlanCategoryKey, string>>;

  core: string[];
  set1: string[];
  set2: string[];

  currentCourses: string[];
  currentAPs: string[];
}

export interface ConstraintViolation {
  ruleKey: RuleKey;
  blocked: boolean;
  message: string;
}

