import type { StudentProfile } from "@/lib/domain/models/studentProfile";
import type { Course } from "@/lib/domain/models/course";
import type { PathScoringResult } from "@/lib/domain/scoring/scorePathway";
import type { ScenarioAdjustments } from "@/lib/domain/models/session";

export interface SoftValidationInput {
  profile: StudentProfile;
  selected: {
    core: Course[];
    set1: Course[];
    set2: Course[];
    all: Course[];
  };
  scoring: PathScoringResult;
  scenario: ScenarioAdjustments;
}

