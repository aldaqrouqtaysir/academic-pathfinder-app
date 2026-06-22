import type { CourseType, ElectiveSet } from "./common";
import type { StudentGrade } from "./common";

export type CoreSubject = "Math" | "English" | "Physics" | "Biology" | "Chemistry" | "Other";

export type PathwayId =
  | "ai_tech"
  | "engineering"
  | "business_finance"
  | "medicine"
  | "creative"
  | "undecided";

export type CourseTag =
  | "STEM"
  | "Humanities"
  | "Arts"
  | "Coding"
  | "Writing"
  | "Lab"
  | "ProjectBased"
  | "Research"
  | "Business"
  | "Health"
  | "Data"
  | "Quantitative"
  | "AppliedMath"
  | "SocialScience"
  | "Communication"
  | "Environmental";

export type RigorLevel = "low" | "medium" | "high" | "very_high";
export type DifficultyLevel = "low" | "medium" | "high" | "very_high";
export type WorkloadLevel = "low" | "medium" | "high" | "very_high";
export type GradeSafetyLevel = "low" | "medium" | "high";
export type ExplorationValue = "low" | "medium" | "high";

export type PlanCategoryKey =
  | "english_category"
  | "science_category"
  | "math_category"
  | "set1_elective"
  | "set2_elective";

export type SemesterKey = "Semester1" | "Semester2";

export interface ContinuationRule {
  toCourseCode: string;
  kind: "recommended" | "optional" | "not_recommended" | "required";
  note?: string;
}

export interface Course {
  code: string;
  name: string;
  type: CourseType;
  electiveSet: ElectiveSet;

  // Some APs replace core (examples from docs: Physics, English, Math)
  replacesCoreSubjects: CoreSubject[];

  yearLong: boolean; // per docs: AP + Environmental Science year-long (cannot drop mid-year)

  // Deterministic prerequisites/sequencing
  prerequisites: string[];
  sequenceNext?: string;
  sequencePrev?: string;

  // Scoring metadata (starter seed values; replace later with SAIS-specific values if needed)
  workloadPoints: 1 | 2 | 3 | 4 | 5;
  rigorPoints: 1 | 2 | 3 | 4 | 5;
  realWorldRelevancePoints: 1 | 2 | 3 | 4 | 5;
  futureRelevancePoints: 1 | 2 | 3 | 4 | 5;

  tags: CourseTag[];
  pathwayAffinity: Partial<Record<PathwayId, number>>; // 0..1 affinity per pathway
  // Category-based planning metadata
  categoryKeys?: PlanCategoryKey[];
  gradeAvailability?: StudentGrade[];
  semesterAvailability?: SemesterKey[];
  continuations?: ContinuationRule[];
  // Human-friendly rigor modeling
  rigorLevel?: RigorLevel;
  perceivedDifficulty?: DifficultyLevel;
  workloadLevel?: WorkloadLevel;
  gradeSafetyLevel?: GradeSafetyLevel;
  explorationValue?: ExplorationValue;
  /**
   * Country compliance is handled at rule/recommendation level (not per-course),
   * per MVP principle: activate Egypt/Jordan logic only when selected and avoid
   * “warning spam” on every course.
   */
}
