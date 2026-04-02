export type StudentId = string; // validated as 8 digits at input boundary

export type StudentGrade = 9 | 10 | 11 | 12;

// Qatar/US are needed for sample profile; only Egypt/Jordan have conditional compliance logic in MVP.
export type TargetCountry = "UAE" | "Qatar" | "US" | "Egypt" | "Jordan";

export type WorkloadTolerance = "Low" | "Medium" | "High";
export type RiskPreference = "Avoid risk" | "Balanced" | "Embrace stretch";
export type GoalClarity = "Low" | "Medium" | "High";
export type ScholarshipImportance = "Low" | "Medium" | "High";
export type SelfReportedAcademicConfidence = "Low" | "Medium" | "High";

export type StrengthArea =
  | "Math"
  | "English"
  | "Science"
  | "Humanities"
  | "Writing"
  | "Coding"
  | "Arts"
  | "Other";

export type ElectiveSet = "Set1" | "Set2" | "Core";

export type CourseType = "core" | "elective" | "AP";

