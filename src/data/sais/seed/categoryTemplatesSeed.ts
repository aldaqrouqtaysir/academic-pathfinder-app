import type { GradePlanTemplate } from "@/lib/domain/models/categories";

export const categoryTemplatesSeed: GradePlanTemplate[] = [
  {
    grade: 11,
    semester: "Semester1",
    categories: [
      { key: "english_category", label: "English Category", required: true, options: [{ courseCode: "ENG_11" }, { courseCode: "AP_LANG_COMP" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "PHYS_11" }, { courseCode: "AP_PHYSICS_C1" }] },
      { key: "math_category", label: "Math Category", required: true, options: [{ courseCode: "MATH_INT_3" }, { courseCode: "PRECALC" }, { courseCode: "MATH_BUSINESS" }] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [{ courseCode: "AP_CHEM" }] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [{ courseCode: "AP_BIO" }, { courseCode: "AP_CSP" }] },
    ],
  },
  {
    grade: 11,
    semester: "Semester2",
    categories: [
      { key: "english_category", label: "English Category", required: true, options: [{ courseCode: "ENG_11" }, { courseCode: "AP_LANG_COMP" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "PHYS_11" }, { courseCode: "AP_PHYSICS_C1" }] },
      { key: "math_category", label: "Math Category", required: true, options: [{ courseCode: "MATH_INT_3" }, { courseCode: "PRECALC" }, { courseCode: "MATH_BUSINESS" }] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [{ courseCode: "AP_CHEM" }] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [{ courseCode: "AP_BIO" }, { courseCode: "AP_CSP" }] },
    ],
  },
  {
    grade: 12,
    semester: "Semester1",
    categories: [
      { key: "math_category", label: "Math Category", required: true, options: [{ courseCode: "AP_CALC_AB" }, { courseCode: "AP_STATS" }, { courseCode: "CALCULUS" }, { courseCode: "CALC_BUSINESS" }, { courseCode: "CALC_FOUNDATION" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "ENV_SCI" }, { courseCode: "THERMO" }, { courseCode: "ORG_CHEM" }] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [{ courseCode: "AP_CHEM" }] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [{ courseCode: "AP_BIO" }, { courseCode: "AP_CSP" }] },
    ],
    notes: [],
  },
  {
    grade: 12,
    semester: "Semester2",
    categories: [
      { key: "math_category", label: "Math Category", required: true, options: [{ courseCode: "AP_CALC_AB" }, { courseCode: "AP_STATS" }, { courseCode: "CALCULUS" }, { courseCode: "CALC_BUSINESS" }, { courseCode: "CALC_FOUNDATION" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "ENV_SCI" }, { courseCode: "ELECTROMAG" }, { courseCode: "BIOCHEM" }] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [{ courseCode: "AP_CHEM" }] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [{ courseCode: "AP_BIO" }, { courseCode: "AP_CSP" }] },
    ],
  },
];

