import {
  categoryBasedCourseCatalogSeed,
  G11_MATH_INTAKE_ONLY_CODES,
  G11_MATH_PLANNING_CODES,
  G12_MATH_INTAKE_ONLY_CODES,
  G12_MATH_PLANNING_CODES,
  G12_SCIENCE_CATEGORY_SEMESTER2_CODES,
  SET1_SEMESTER2_CODES,
  SET2_SEMESTER2_CODES,
} from "@/data/sais";
import type { PlanCategoryKey } from "@/lib/domain/models/course";

export type CurrentCoursePanel = {
  id: string;
  label: string;
  /** Maps to template category when applicable (11/12) */
  categoryKey?: PlanCategoryKey;
  options: { code: string; name: string; isAp: boolean }[];
};

const byCode = new Map(categoryBasedCourseCatalogSeed.map((c) => [c.code, c] as const));

function opt(code: string) {
  const c = byCode.get(code);
  return {
    code,
    name: c?.name ?? code,
    isAp: c?.type === "AP",
  };
}

const G11_MATH_INTAKE = [...G11_MATH_PLANNING_CODES, ...G11_MATH_INTAKE_ONLY_CODES];
const G12_MATH_INTAKE = [...G12_MATH_PLANNING_CODES, ...G12_MATH_INTAKE_ONLY_CODES];

/**
 * Semester 2 “what you’re enrolled in now” — full inventory by category (includes fundamentals math for
 * students already on those tracks). APs appear in the same dropdown as other courses; API still splits
 * AP codes into `currentAPs` for storage compatibility.
 */
export function getSemester2CurrentCoursePanels(grade: 9 | 10 | 11 | 12): CurrentCoursePanel[] {
  if (grade === 11) {
    return [
      {
        id: "english_category",
        label: "English",
        categoryKey: "english_category",
        options: [opt("ENG_11"), opt("AP_LANG_COMP")],
      },
      {
        id: "science_category",
        label: "Science",
        categoryKey: "science_category",
        options: [opt("PHYS_11"), opt("AP_PHYSICS_C1")],
      },
      {
        id: "math_category",
        label: "Math",
        categoryKey: "math_category",
        options: G11_MATH_INTAKE.map((code) => opt(code)),
      },
      {
        id: "set1_elective",
        label: "Set 1 elective",
        categoryKey: "set1_elective",
        options: SET1_SEMESTER2_CODES.map((code) => opt(code)),
      },
      {
        id: "set2_elective",
        label: "Set 2 elective",
        categoryKey: "set2_elective",
        options: SET2_SEMESTER2_CODES.map((code) => opt(code)),
      },
    ];
  }

  if (grade === 12) {
    return [
      {
        id: "math_category",
        label: "Math",
        categoryKey: "math_category",
        options: G12_MATH_INTAKE.map((code) => opt(code)),
      },
      {
        id: "science_category",
        label: "Science",
        categoryKey: "science_category",
        options: G12_SCIENCE_CATEGORY_SEMESTER2_CODES.map((code) => opt(code)),
      },
      {
        id: "set1_elective",
        label: "Set 1 elective",
        categoryKey: "set1_elective",
        options: SET1_SEMESTER2_CODES.map((code) => opt(code)),
      },
      {
        id: "set2_elective",
        label: "Set 2 elective",
        categoryKey: "set2_elective",
        options: SET2_SEMESTER2_CODES.map((code) => opt(code)),
      },
    ];
  }

  if (grade === 9) {
    return [
      { id: "g9_math", label: "Math", options: [opt("MATH_INT_1")] },
      { id: "g9_science", label: "Science", options: [opt("BIO_9")] },
      { id: "g9_arts", label: "Visual & Performing Arts", options: [opt("VPA")] },
    ];
  }
  if (grade === 10) {
    return [
      { id: "g10_math", label: "Math", options: [opt("MATH_INT_2")] },
      { id: "g10_science", label: "Science", options: [opt("CHEM_10")] },
      { id: "g10_arts", label: "Visual & Performing Arts", options: [opt("VPA")] },
    ];
  }
  return [];
}

/** Map category-style selections to API arrays: non-AP → currentCourses, AP → currentAPs */
export function splitCurrentCoursesForApi(selectedByPanelId: Record<string, string>): {
  currentCourses: string[];
  currentAPs: string[];
} {
  const currentCourses: string[] = [];
  const currentAPs: string[] = [];
  for (const code of Object.values(selectedByPanelId)) {
    if (!code) continue;
    const c = byCode.get(code);
    if (c?.type === "AP") currentAPs.push(code);
    else currentCourses.push(code);
  }
  return { currentCourses, currentAPs };
}

/** Hydrate UI state from saved session codes (edit mode). */
export function hydrateCurrentSelectionsFromCodes(
  grade: 9 | 10 | 11 | 12,
  codes: string[],
): Record<string, string> {
  const set = new Set(codes);
  const panels = getSemester2CurrentCoursePanels(grade);
  const out: Record<string, string> = {};
  for (const p of panels) {
    const match = p.options.find((o) => set.has(o.code));
    if (match) out[p.id] = match.code;
  }
  return out;
}
