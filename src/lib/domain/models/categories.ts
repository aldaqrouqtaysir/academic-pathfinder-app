import type { StudentGrade } from "./common";
import type { PlanCategoryKey, SemesterKey } from "./course";

export interface PlanCategoryOption {
  courseCode: string;
}

export interface PlanCategoryDefinition {
  key: PlanCategoryKey;
  label: string;
  required: boolean;
  options: PlanCategoryOption[];
}

export interface GradePlanTemplate {
  grade: StudentGrade;
  semester: SemesterKey;
  categories: PlanCategoryDefinition[];
  notes?: string[];
}

