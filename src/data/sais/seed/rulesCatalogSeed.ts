import type { Rule } from "@/lib/domain/models/rules";

/**
 * Prototype rule metadata used by the current deterministic engine.
 *
 * This catalog is not a complete or school-approved policy source. In
 * particular, prerequisite and sequence coverage remains incomplete.
 */
export const rulesCatalogSeed: Rule[] = [
  {
    id: "rule-grade-no-electives-g9-g10",
    key: "grade_no_electives_g9_g10",
    type: "hard",
    description: "Grades 9–10 must not select electives; VPA is taken as a core subject.",
  },
  {
    id: "rule-elective-set-pattern-g11-g12",
    key: "elective_set_pattern_g11_g12",
    type: "hard",
    description: "Grades 11–12 must choose exactly 1 elective from Set 1 and 1 from Set 2 each semester.",
  },
  {
    id: "rule-prerequisite-satisfied",
    key: "prerequisite_satisfied",
    type: "hard",
    description: "Selected courses must satisfy prerequisite chains.",
  },
  {
    id: "rule-sequence-continuity",
    key: "sequence_continuity",
    type: "hard",
    description: "Sequenced course continuity must be respected (e.g., I -> II).",
  },
  {
    id: "rule-year-long-cannot-drop",
    key: "year_long_cannot_drop",
    type: "hard",
    description: "AP and Environmental Science are year-long and cannot be dropped mid-year.",
  },
  {
    id: "rule-duplicate-choice",
    key: "duplicate_choice",
    type: "hard",
    description: "A course cannot be duplicated across both sets in a single semester.",
  },
  {
    id: "rule-country-alignment",
    key: "country_alignment",
    type: "soft",
    description:
      "Egypt/Jordan pathway alignment is conditional and stricter when selected; UAE is default logic.",
  },
];

