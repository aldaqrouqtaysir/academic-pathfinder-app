import type { StudentId } from "./common";
import type { RecommendationBundle } from "./recommendations";

export type Semester = "Semester1" | "Semester2";

export interface ScenarioAdjustments {
  semester: Semester;
  isMidYear: boolean; // true means “year-long cannot drop” should be enforced using current enrollments

  // scenario explorer toggles
  preferLowerWorkload?: boolean;
  preferHigherRigor?: boolean;
  targetPathwayOverride?: string; // pathway id
}

export type IntakeAnswers = Record<string, unknown>;

export interface RecommendationOutputs {
  bundle: RecommendationBundle;
  generatedAt: string;
}

export interface StoredSession {
  id: string;
  studentId: StudentId;
  createdAt: string;
  updatedAt?: string;

  answers: IntakeAnswers;
  scenario: ScenarioAdjustments;
  outputs?: RecommendationOutputs;
}

