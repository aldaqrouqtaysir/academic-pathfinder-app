import type { PlanCategoryKey } from "@/lib/domain/models/course";
import { categoryBasedCourseCatalogSeed } from "@/data/sais";

const nameByCode = new Map(categoryBasedCourseCatalogSeed.map((c) => [c.code, c.name] as const));

const valueLabels: Record<string, string> = {
  Semester1: "Semester 1",
  Semester2: "Semester 2",
  strongest_path: "Strongest path",
  balanced_path: "Balanced path",
  safest_highest_grade: "Safer grades path",
  not_sure: "Not sure yet",
  career_alignment: "Career alignment",
  university_competitiveness: "University competitiveness",
  lighter_workload: "Lighter workload",
  higher_grades: "Higher grades",
  keeping_options_open: "Keeping options open",
  keep_options_open: "Keep options open",
  high: "High",
  medium: "Medium",
  low: "Low",
  unsure: "Unsure",
  stem: "STEM",
  business: "Business",
  humanities: "Humanities",
  social_sciences: "Social sciences",
  health: "Health",
  arts: "Arts",
  data: "Data",
  ai: "AI",
  coding: "Coding",
};

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

export function formatDisplayValue(value?: unknown): string {
  if (Array.isArray(value)) {
    return value.length ? value.map(formatDisplayValue).join(", ") : "Not provided";
  }

  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const raw = String(value);
  if (valueLabels[raw]) return valueLabels[raw];

  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
