import type { GradePlanTemplate } from "@/lib/domain/models/categories";
import {
  G11_MATH_PLANNING_CODES,
  G12_MATH_PLANNING_CODES,
  G12_SCIENCE_CATEGORY_SEMESTER1_CODES,
  G12_SCIENCE_CATEGORY_SEMESTER2_CODES,
  SET1_SEMESTER1_CODES,
  SET1_SEMESTER2_CODES,
  SET2_SEMESTER1_CODES,
  SET2_SEMESTER2_CODES,
} from "./confirmedSaisElectiveInventory";

/**
 * Planning / recommendation templates — fundamentals math tracks excluded from open enumeration.
 * Semester 2 current-course intake uses `getSemester2CurrentCoursePanels` (includes fundamentals where needed).
 */

const G11_MATH = G11_MATH_PLANNING_CODES.map((courseCode) => ({ courseCode }));
const G12_MATH = G12_MATH_PLANNING_CODES.map((courseCode) => ({ courseCode }));

const G11_S1_SET1 = SET1_SEMESTER1_CODES.map((courseCode) => ({ courseCode }));
const G11_S1_SET2 = SET2_SEMESTER1_CODES.map((courseCode) => ({ courseCode }));
const G11_S2_SET1 = SET1_SEMESTER2_CODES.map((courseCode) => ({ courseCode }));
const G11_S2_SET2 = SET2_SEMESTER2_CODES.map((courseCode) => ({ courseCode }));

const G12_S1_SET1 = SET1_SEMESTER1_CODES.map((courseCode) => ({ courseCode }));
const G12_S1_SET2 = SET2_SEMESTER1_CODES.map((courseCode) => ({ courseCode }));
const G12_S2_SET1 = SET1_SEMESTER2_CODES.map((courseCode) => ({ courseCode }));
const G12_S2_SET2 = SET2_SEMESTER2_CODES.map((courseCode) => ({ courseCode }));

export const categoryTemplatesSeed: GradePlanTemplate[] = [
  {
    grade: 11,
    semester: "Semester1",
    categories: [
      { key: "english_category", label: "English Category", required: true, options: [{ courseCode: "ENG_11" }, { courseCode: "AP_LANG_COMP" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "PHYS_11" }, { courseCode: "AP_PHYSICS_C1" }] },
      { key: "math_category", label: "Math Category", required: true, options: [...G11_MATH] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [...G11_S1_SET1] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [...G11_S1_SET2] },
    ],
  },
  {
    grade: 11,
    semester: "Semester2",
    categories: [
      { key: "english_category", label: "English Category", required: true, options: [{ courseCode: "ENG_11" }, { courseCode: "AP_LANG_COMP" }] },
      { key: "science_category", label: "Science Category", required: true, options: [{ courseCode: "PHYS_11" }, { courseCode: "AP_PHYSICS_C1" }] },
      { key: "math_category", label: "Math Category", required: true, options: [...G11_MATH] },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [...G11_S2_SET1] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [...G11_S2_SET2] },
    ],
  },
  {
    grade: 12,
    semester: "Semester1",
    categories: [
      { key: "math_category", label: "Math Category", required: true, options: [...G12_MATH] },
      {
        key: "science_category",
        label: "Science Category",
        required: true,
        options: [...G12_SCIENCE_CATEGORY_SEMESTER1_CODES.map((courseCode) => ({ courseCode }))],
      },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [...G12_S1_SET1] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [...G12_S1_SET2] },
    ],
    notes: [],
  },
  {
    grade: 12,
    semester: "Semester2",
    categories: [
      { key: "math_category", label: "Math Category", required: true, options: [...G12_MATH] },
      {
        key: "science_category",
        label: "Science Category",
        required: true,
        options: [...G12_SCIENCE_CATEGORY_SEMESTER2_CODES.map((courseCode) => ({ courseCode }))],
      },
      { key: "set1_elective", label: "Set 1 Elective", required: true, options: [...G12_S2_SET1] },
      { key: "set2_elective", label: "Set 2 Elective", required: true, options: [...G12_S2_SET2] },
    ],
  },
];
