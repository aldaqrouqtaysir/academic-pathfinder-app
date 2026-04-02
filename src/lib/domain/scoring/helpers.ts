import { pathwaysSeed } from "@/data/sais";
import type { Course, PathwayId } from "../models/course";
import type { StudentProfile } from "../models/studentProfile";

export interface PlanCourses {
  core: Course[];
  set1: Course[];
  set2: Course[];
  all: Course[];
}

export function determineTargetPathway(profile: StudentProfile): PathwayId {
  const text = [...profile.interests, ...profile.careerGoals, profile.futurePlans]
    .join(" ")
    .toLowerCase();
  if (!text.trim()) return "undecided";

  let best: { id: PathwayId; score: number } = { id: "undecided", score: 0 };
  for (const p of pathwaysSeed) {
    const score = p.keywords.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
    if (score > best.score) best = { id: p.id, score };
  }
  return best.score === 0 ? "undecided" : best.id;
}

export function strengthToTags(strength: string): string[] {
  switch (strength.toLowerCase()) {
    case "math":
      return ["STEM"];
    case "science":
      return ["STEM", "Lab", "Health"];
    case "english":
    case "writing":
      return ["Writing", "Humanities"];
    case "coding":
      return ["Coding", "STEM", "ProjectBased"];
    case "humanities":
      return ["Humanities"];
    case "arts":
      return ["Arts", "ProjectBased"];
    default:
      return [];
  }
}

export function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

