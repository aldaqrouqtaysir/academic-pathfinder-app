import type {
  GoalClarity,
  RiskPreference,
  ScholarshipImportance,
  SelfReportedAcademicConfidence,
  StrengthArea,
  StudentGrade,
  StudentId,
  TargetCountry,
  WorkloadTolerance,
} from "./common";

export type CountryIntent = "main_focus" | "keep_options_open" | "unsure";
export type PriorityStyle = "strongest_path" | "balanced_path" | "safest_highest_grade" | "not_sure";
export type OptimizationTarget =
  | "career_alignment"
  | "lighter_workload"
  | "university_competitiveness"
  | "keeping_options_open"
  | "higher_grades";

export interface StudentProfile {
  // Identity
  studentId: StudentId;

  // Current academic state (used for hard constraint validation + sequencing)
  currentGrade: StudentGrade;
  currentCourses: string[]; // course codes (coursework already completed/present)
  currentAPs: string[]; // AP codes currently enrolled/in progress

  // Country targeting model (updated)
  mainCountry: TargetCountry; // required
  additionalCountries: TargetCountry[]; // optional list
  countryIntent: CountryIntent;
  // Backward compatibility for earlier engine functions; derived by helper when absent.
  targetCountries?: TargetCountry[];

  // Self-report inputs
  strengths: StrengthArea[];
  weaknesses: StrengthArea[];
  interests: string[]; // free-text tags
  careerGoals: string[]; // free-text tags
  goalClarity: GoalClarity;
  workloadTolerance: WorkloadTolerance;
  riskPreference: RiskPreference;
  scholarshipImportance: ScholarshipImportance;
  futurePlans: string; // free-text narrative

  // Preferences / things to avoid (soft constraints + trade-offs later)
  preferencesToAvoid: string[]; // e.g. "very heavy homework", "no lab sciences", etc.
  preferences: string[]; // e.g. "hands-on projects", "writing-heavy", etc.

  // Additional self-report signal for deterministic match-score framing, not statistical confidence
  selfReportedAcademicConfidence: SelfReportedAcademicConfidence;

  // Student preference about when to apply changes (kept for MVP; used later if needed)
  desiredCourseYear: "Now" | "Next";

  // Dynamic scoring priorities
  priorityStyle?: PriorityStyle;
  optimizationTarget?: OptimizationTarget;
}

export function getSelectedCountries(profile: StudentProfile): TargetCountry[] {
  if (profile.targetCountries && profile.targetCountries.length > 0) {
    return profile.targetCountries;
  }
  return [profile.mainCountry, ...profile.additionalCountries];
}

