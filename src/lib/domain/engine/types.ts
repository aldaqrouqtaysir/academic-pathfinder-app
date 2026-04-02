import type { StudentProfile } from "../models/studentProfile";
import type { Course } from "../models/course";
import type { Rule } from "../models/rules";
import type { ScenarioAdjustments } from "../models/session";

export type Semester = "Semester1" | "Semester2";

export interface CourseCatalog {
  courses: Course[];
}

export interface RulesCatalog {
  rules: Rule[];
}

export interface RecommendationComputeInput {
  profile: StudentProfile;
  semester: Semester;
  scenario: ScenarioAdjustments;
  catalog: CourseCatalog;
  rules: RulesCatalog;
}

