import { categoryTemplatesSeed, courseCatalogSeed, rulesCatalogSeed } from "@/data/sais";
import type { RecommendationComputeInput } from "@/lib/domain/engine/types";
import { computeRecommendations } from "@/lib/domain/engine/computeRecommendations";
import type { PlanCategoryKey } from "@/lib/domain/models/course";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";
import type { ScenarioAdjustments } from "@/lib/domain/models/session";
import type { StudentProfile } from "@/lib/domain/models/studentProfile";
import { getSelectedCountries } from "@/lib/domain/models/studentProfile";
import { validateHardConstraints } from "@/lib/domain/validators/validateHardConstraints";

export interface CandidateSelection {
  categorySelections: Partial<Record<PlanCategoryKey, string>>;
  core: string[];
  set1: string[];
  set2: string[];
}

export function enumerateCandidates(
  profile: StudentProfile,
  scenario: ScenarioAdjustments,
): CandidateSelection[] {
  const template = categoryTemplatesSeed.find(
    (item) => item.grade === profile.currentGrade && item.semester === scenario.semester,
  );
  if (!template) return [];

  let combinations: Array<Partial<Record<PlanCategoryKey, string>>> = [{}];
  for (const category of template.categories) {
    combinations = combinations.flatMap((selection) =>
      category.options.map((option) => ({
        ...selection,
        [category.key]: option.courseCode,
      })),
    );
  }

  return combinations.map((categorySelections) => {
    const core = [
      categorySelections.english_category,
      categorySelections.science_category,
      categorySelections.math_category,
    ].filter((code): code is string => Boolean(code));
    const set1 = categorySelections.set1_elective
      ? [categorySelections.set1_elective]
      : [];
    const set2 = categorySelections.set2_elective
      ? [categorySelections.set2_elective]
      : [];
    return { categorySelections, core, set1, set2 };
  });
}

export function acceptedCandidates(
  profile: StudentProfile,
  scenario: ScenarioAdjustments,
): CandidateSelection[] {
  return enumerateCandidates(profile, scenario).filter((candidate) => {
    const result = validateHardConstraints({
      input: {
        currentGrade: profile.currentGrade,
        targetCountries: getSelectedCountries(profile),
        scenario,
        categorySelections: candidate.categorySelections,
        core: candidate.core,
        set1: candidate.set1,
        set2: candidate.set2,
        currentCourses: profile.currentCourses,
        currentAPs: profile.currentAPs,
      },
      catalog: { courses: courseCatalogSeed },
      rules: { rules: rulesCatalogSeed },
    });
    return !result.blocked;
  });
}

export function computeFixture(
  profile: StudentProfile,
  scenario: ScenarioAdjustments,
) {
  const input: RecommendationComputeInput = {
    profile,
    semester: scenario.semester,
    scenario,
    catalog: { courses: courseCatalogSeed },
    rules: { rules: rulesCatalogSeed },
  };
  return computeRecommendations(input).bundle;
}

export function recommendationCourseOrder(
  recommendation: PathRecommendation,
): string[] {
  return [
    ...recommendation.selections.core,
    ...recommendation.selections.set1,
    ...recommendation.selections.set2,
  ];
}

export function recommendationSignature(
  recommendation: PathRecommendation,
): string {
  return recommendationCourseOrder(recommendation).join("|");
}
