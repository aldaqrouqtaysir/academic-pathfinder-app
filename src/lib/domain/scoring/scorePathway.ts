import type { StudentProfile } from "../models/studentProfile";
import { getSelectedCountries } from "../models/studentProfile";
import type { CourseCatalog, RecommendationComputeInput } from "../engine/types";
import type { Course, PlanCategoryKey } from "../models/course";
import type { ScoringFactorContribution, ScoringFactorKey } from "../models/recommendations";
import { buildDynamicWeights } from "./weights";
import { avg, clamp01, determineTargetPathway, strengthToTags } from "./helpers";

export interface PathScoringResult {
  total: number; // 0..100
  targetPathway: ReturnType<typeof determineTargetPathway>;
  factors: ScoringFactorContribution[];
  topReasons: string[];
  weightModel: ReturnType<typeof buildDynamicWeights>;
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k.toLowerCase()));
}

function contribution(
  normalizedWeights: Record<ScoringFactorKey, number>,
  key: ScoringFactorKey,
  label: string,
  normalizedValue: number,
  evidence: string[],
): ScoringFactorContribution {
  const points = Math.round(clamp01(normalizedValue) * normalizedWeights[key] * 1000) / 10;
  return { key, label, points, evidence };
}

export function scorePathway(params: {
  profile: StudentProfile;
  categorySelections: Partial<Record<PlanCategoryKey, string>>;
  selectedCore: string[];
  selectedSet1: string[];
  selectedSet2: string[];
  catalog: CourseCatalog;
  scenario: RecommendationComputeInput["scenario"];
}): PathScoringResult {
  const { profile, categorySelections, selectedCore, selectedSet1, selectedSet2, catalog } = params;

  const selectedCodes = [...selectedCore, ...selectedSet1, ...selectedSet2];
  const selectedCourses = selectedCodes
    .map((code) => catalog.courses.find((c) => c.code === code))
    .filter(Boolean) as Course[];
  const categoryCourses = Object.entries(categorySelections)
    .map(([k, code]) => ({ key: k as PlanCategoryKey, course: catalog.courses.find((c) => c.code === code) }))
    .filter((x) => x.course) as Array<{ key: PlanCategoryKey; course: Course }>;

  const targetPathway = determineTargetPathway(profile);
  const weightModel = buildDynamicWeights({
    priorityStyle: profile.priorityStyle,
    optimizationTarget: profile.optimizationTarget,
    countryIntent: profile.countryIntent,
  });
  const interestText = profile.interests.join(" ").toLowerCase();
  const goalText = profile.careerGoals.join(" ").toLowerCase();

  const avgWorkload = avg(selectedCourses.map((c) => c.workloadPoints));
  const avgRigor = avg(selectedCourses.map((c) => c.rigorPoints));
  const avgFuture = avg((categoryCourses.length > 0 ? categoryCourses.map((x) => x.course) : selectedCourses).map((c) => c.futureRelevancePoints)) / 5;
  const avgRealWorld = avg((categoryCourses.length > 0 ? categoryCourses.map((x) => x.course) : selectedCourses).map((c) => c.realWorldRelevancePoints)) / 5;

  // Interest alignment
  const interestMatches = selectedCourses.filter((c) =>
    containsAny(`${c.name} ${c.tags.join(" ")}`.toLowerCase(), interestText.split(/\s+/).filter(Boolean)),
  ).length;
  const interestNorm = selectedCourses.length ? interestMatches / selectedCourses.length : 0;

  // Strength match
  const strengthTags = profile.strengths.flatMap((s) => strengthToTags(s));
  const strengthMatches = selectedCourses.filter((c) => c.tags.some((t) => strengthTags.includes(t))).length;
  const strengthNorm = selectedCourses.length ? strengthMatches / selectedCourses.length : 0;

  // Workload fit
  const desiredWorkload = profile.workloadTolerance === "Low" ? 2.2 : profile.workloadTolerance === "Medium" ? 3.3 : 4.4;
  const workloadNorm = clamp01(1 - Math.abs(avgWorkload - desiredWorkload) / 3);

  // Pathway/career alignment with category-role impact
  const pathwayNorm = avg(
    (categoryCourses.length > 0 ? categoryCourses : selectedCourses.map((course) => ({ key: "set1_elective" as PlanCategoryKey, course }))).map(({ key, course }) => {
      const base = course.pathwayAffinity[targetPathway] ?? 0;
      const roleWeight = key === "math_category" || key === "science_category" || key === "english_category" ? 1.15 : 1;
      return Math.min(1, base * roleWeight);
    }),
  );

  // Country alignment (rule-level logic)
  const selectedCountries = getSelectedCountries(profile);
  const hasStrictCountries = selectedCountries.includes("Egypt") || selectedCountries.includes("Jordan");
  const academicallyStrongChoices = selectedCourses.filter((c) => c.type === "AP" || c.rigorPoints >= 4).length;
  const countryNorm = hasStrictCountries ? clamp01(0.55 + academicallyStrongChoices * 0.08) : 1;

  // Learning stretch
  const confidenceTarget = profile.selfReportedAcademicConfidence === "Low" ? 2.5 : profile.selfReportedAcademicConfidence === "Medium" ? 3.4 : 4.2;
  const stretchNorm = clamp01(1 - Math.abs(avgRigor - confidenceTarget) / 3);

  // Scholarship competitiveness
  const scholarshipBase = clamp01((avgRigor / 5 + avgFuture) / 2);
  const scholarshipNorm = profile.scholarshipImportance === "High" ? scholarshipBase : 0.8 * scholarshipBase + 0.2;

  const factors: ScoringFactorContribution[] = [
    contribution(weightModel.normalizedWeights, "interest_alignment", "Interest alignment", interestNorm, [
      `Matched ${interestMatches}/${selectedCourses.length || 1} selected courses with student interests.`,
      `Interests considered: ${profile.interests.join(", ") || "none provided"}.`,
    ]),
    contribution(weightModel.normalizedWeights, "strength_match", "Strength match", strengthNorm, [
      `Strength-tag overlap in ${strengthMatches}/${selectedCourses.length || 1} selected courses.`,
      `Strengths considered: ${profile.strengths.join(", ") || "none provided"}.`,
    ]),
    contribution(weightModel.normalizedWeights, "workload_fit", "Workload fit", workloadNorm, [
      `Average workload points: ${avgWorkload.toFixed(2)} vs tolerance target ${desiredWorkload.toFixed(1)}.`,
    ]),
    contribution(weightModel.normalizedWeights, "pathway_alignment", "Career/pathway alignment", pathwayNorm, [
      `Detected pathway: ${targetPathway}.`,
      `Average pathway affinity: ${(pathwayNorm * 100).toFixed(0)}%.`,
      `Career goals considered: ${profile.careerGoals.join(", ") || "none provided"}.`,
    ]),
    contribution(weightModel.normalizedWeights, "country_alignment", "Country alignment", countryNorm, [
      hasStrictCountries
        ? "Egypt/Jordan selected: plan favors academically rigorous, broadly recognized options."
        : "Default/flexible country logic applies (UAE/Qatar/US).",
      `Target countries: ${selectedCountries.join(", ")}.`,
    ]),
    contribution(weightModel.normalizedWeights, "future_relevance", "Future relevance", avgFuture, [
      `Average future relevance points: ${(avgFuture * 5).toFixed(2)}/5.`,
      `Career goal text signal: ${goalText || "none provided"}.`,
    ]),
    contribution(weightModel.normalizedWeights, "learning_stretch", "Learning stretch", stretchNorm, [
      `Average rigor points: ${avgRigor.toFixed(2)} vs confidence-adjusted target ${confidenceTarget.toFixed(1)}.`,
      `Risk preference: ${profile.riskPreference}.`,
    ]),
    contribution(weightModel.normalizedWeights, "real_world_relevance", "Real-world application relevance", avgRealWorld, [
      `Average real-world relevance points: ${(avgRealWorld * 5).toFixed(2)}/5.`,
    ]),
    contribution(weightModel.normalizedWeights, "scholarship_competitiveness", "Scholarship competitiveness", scholarshipNorm, [
      `Scholarship importance: ${profile.scholarshipImportance}.`,
      `Scholarship competitiveness proxy: ${(scholarshipNorm * 100).toFixed(0)}%.`,
    ]),
  ];

  const total = Math.round(factors.reduce((sum, f) => sum + f.points, 0) * 10) / 10;
  const topReasons = [...factors]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .flatMap((f) => f.evidence.slice(0, 1));

  return { total, factors, topReasons, targetPathway, weightModel };
}

