import type { PlanCategoryKey } from "@/lib/domain/models/course";
import { categoryBasedCourseCatalogSeed } from "@/data/sais";

const nameByCode = new Map(categoryBasedCourseCatalogSeed.map((c) => [c.code, c.name] as const));

export function courseName(code: string) {
  return nameByCode.get(code) ?? code;
}

export function categoryLabel(key: PlanCategoryKey): string {
  switch (key) {
    case "english_category":
      return "English";
    case "math_category":
      return "Math";
    case "science_category":
      return "Science";
    case "set1_elective":
      return "Set 1 Elective";
    case "set2_elective":
      return "Set 2 Elective";
    default:
      return key;
  }
}

