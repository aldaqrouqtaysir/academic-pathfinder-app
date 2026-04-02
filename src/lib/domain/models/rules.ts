export type ConstraintType = "hard" | "soft";

export type RuleKey =
  | "grade_no_electives_g9_g10"
  | "elective_set_pattern_g11_g12"
  | "prerequisite_satisfied"
  | "sequence_continuity"
  | "year_long_cannot_drop"
  | "country_alignment"
  | "duplicate_choice";

export interface Rule {
  id: string;
  key: RuleKey;
  type: ConstraintType;
  description: string;
}

export interface RuleViolation {
  ruleKey: RuleKey;
  type: ConstraintType;
  message: string;
  blocked: boolean; // convenience derived from type
}

