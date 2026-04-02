import type { StudentGrade } from "@/lib/domain/models/common";

export interface GradeCoreStructure {
  grade: StudentGrade;
  coreCourseGroups: Array<{
    groupKey: "Math" | "English" | "Science" | "VPA";
    required: boolean;
    options: string[]; // course codes
  }>;
  semesterElectivesEnabled: boolean;
  mustPickSet1AndSet2: boolean;
  grade12ScienceMustBeElectiveScience: boolean;
}

/**
 * Confirmed structures from project context + your corrections.
 *
 * Notes:
 * - For G9/G10: electives disabled.
 * - For G11/G12: electives enabled; must pick 1 from Set1 and 1 from Set2.
 * - For Grade 12: science is mandatory and selected via “science elective path” (set choice).
 */
export const gradeStructureSeed: GradeCoreStructure[] = [
  {
    grade: 9,
    coreCourseGroups: [
      { groupKey: "Math", required: true, options: ["MATH_INT_1"] },
      { groupKey: "VPA", required: true, options: ["VPA"] },
      // We keep science/english groups out for now; catalog can expand later without breaking structure.
    ],
    semesterElectivesEnabled: false,
    mustPickSet1AndSet2: false,
    grade12ScienceMustBeElectiveScience: false,
  },
  {
    grade: 10,
    coreCourseGroups: [
      { groupKey: "Math", required: true, options: ["MATH_INT_2"] },
      { groupKey: "VPA", required: true, options: ["VPA"] },
    ],
    semesterElectivesEnabled: false,
    mustPickSet1AndSet2: false,
    grade12ScienceMustBeElectiveScience: false,
  },
  {
    grade: 11,
    coreCourseGroups: [
      { groupKey: "Math", required: true, options: ["MATH_INT_3", "PRECALC", "MATH_BUSINESS"] },
      { groupKey: "English", required: true, options: ["ENG_11", "AP_LANG_COMP"] }, // AP Lang Comp replaces English
      { groupKey: "Science", required: true, options: ["PHYS_11", "AP_PHYSICS_C1"] }, // AP Physics C1 replaces Physics
    ],
    semesterElectivesEnabled: true,
    mustPickSet1AndSet2: true,
    grade12ScienceMustBeElectiveScience: false,
  },
  {
    grade: 12,
    coreCourseGroups: [
      { groupKey: "Math", required: true, options: ["AP_CALC_AB", "AP_STATS", "CALCULUS", "CALC_BUSINESS", "CALC_FOUNDATION"] },
      // Science requirement is enforced as “elective science path” (set1/set2)
    ],
    semesterElectivesEnabled: true,
    mustPickSet1AndSet2: true,
    grade12ScienceMustBeElectiveScience: true,
  },
];

export const scienceElectiveCodesSeed: string[] = [
  // Confirmed or grounded in current context:
  "AP_CHEM",
  "AP_BIO",
  "ENV_SCI",
  "THERMO",
  "ORG_CHEM",
];

