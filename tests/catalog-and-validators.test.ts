import { categoryTemplatesSeed, courseCatalogSeed } from "@/data/sais";
import type { PlanSelectionInput } from "@/lib/domain/validators/hard/types";
import { validateCoreReplacementConflicts } from "@/lib/domain/validators/hard/validateCoreReplacementConflicts";
import { validateGrade12ScienceRequirement } from "@/lib/domain/validators/hard/validateGrade12ScienceRequirement";
import { validateGradeElectives } from "@/lib/domain/validators/hard/validateGradeElectives";
import { validateNoDuplicates } from "@/lib/domain/validators/hard/validateNoDuplicates";
import { validateRequiredCategories } from "@/lib/domain/validators/hard/validateRequiredCategories";
import { validateYearLongContinuity } from "@/lib/domain/validators/hard/validateYearLongContinuity";
import { buildDynamicWeights, SCORING_WEIGHTS } from "@/lib/domain/scoring/weights";
import { describe, expect, it } from "vitest";
import { enumerateCandidates } from "./helpers/recommendationTestHarness";
import { recommendationFixtures } from "./test-fixtures/studentProfiles";

const catalog = { courses: courseCatalogSeed };

function selectionInput(overrides: Partial<PlanSelectionInput> = {}): PlanSelectionInput {
  return {
    currentGrade: 12,
    targetCountries: ["UAE"],
    scenario: { semester: "Semester1", isMidYear: false },
    categorySelections: {
      math_category: "AP_STATS",
      science_category: "ENV_SCI",
      set1_elective: "PSYCH_I",
      set2_elective: "AP_CSP",
    },
    core: ["ENV_SCI", "AP_STATS"],
    set1: ["PSYCH_I"],
    set2: ["AP_CSP"],
    currentCourses: [],
    currentAPs: [],
    ...overrides,
  };
}

describe("course catalog and template integrity", () => {
  it("contains exactly 57 uniquely identified courses", () => {
    const codes = courseCatalogSeed.map((course) => course.code);
    expect(courseCatalogSeed).toHaveLength(57);
    expect(new Set(codes).size).toBe(57);
  });

  it("contains no duplicate course records", () => {
    const records = courseCatalogSeed.map((course) => JSON.stringify(course));
    expect(new Set(records).size).toBe(courseCatalogSeed.length);
  });

  it("resolves every template course code to the catalog", () => {
    const catalogCodes = new Set(courseCatalogSeed.map((course) => course.code));
    const templateCodes = categoryTemplatesSeed.flatMap((template) =>
      template.categories.flatMap((category) =>
        category.options.map((option) => option.courseCode),
      ),
    );
    expect(templateCodes.filter((code) => !catalogCodes.has(code))).toEqual([]);
  });

  it("preserves the 1,440 and 1,728 candidate maxima", () => {
    const semester1 = recommendationFixtures.highStemGrade12Semester1;
    const semester2 = recommendationFixtures.tieHeavyGrade12Semester2;
    expect(enumerateCandidates(semester1.profile, semester1.scenario)).toHaveLength(1440);
    expect(enumerateCandidates(semester2.profile, semester2.scenario)).toHaveLength(1728);

    const allTemplateCounts = categoryTemplatesSeed.map((template) =>
      template.categories.reduce(
        (product, category) => product * category.options.length,
        1,
      ),
    );
    expect(new Set(allTemplateCounts)).toEqual(new Set([1440, 1728]));
  });

  it("does not enumerate duplicate plans", () => {
    for (const fixture of [
      recommendationFixtures.highStemGrade12Semester1,
      recommendationFixtures.tieHeavyGrade12Semester2,
    ]) {
      const candidates = enumerateCandidates(fixture.profile, fixture.scenario);
      const signatures = candidates.map((candidate) =>
        JSON.stringify(candidate.categorySelections),
      );
      expect(new Set(signatures).size).toBe(candidates.length);
    }
  });
});

describe("scoring weight integrity", () => {
  it("keeps all nine base weights normalized", () => {
    expect(Object.keys(SCORING_WEIGHTS)).toHaveLength(9);
    expect(Object.values(SCORING_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
  });

  it("normalizes every supported dynamic weighting combination", () => {
    const priorityStyles = ["strongest_path", "balanced_path", "safest_highest_grade", "not_sure"] as const;
    const optimizationTargets = [
      "career_alignment",
      "lighter_workload",
      "university_competitiveness",
      "keeping_options_open",
      "higher_grades",
    ] as const;
    const countryIntents = ["main_focus", "keep_options_open", "unsure"] as const;

    for (const priorityStyle of priorityStyles) {
      for (const optimizationTarget of optimizationTargets) {
        for (const countryIntent of countryIntents) {
          const result = buildDynamicWeights({
            priorityStyle,
            optimizationTarget,
            countryIntent,
          });
          expect(Object.values(result.normalizedWeights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 12);
        }
      }
    }
  });
});

describe("the six current hard-validator functions", () => {
  it("blocks a missing required category", () => {
    const violations = validateRequiredCategories({
      input: selectionInput({ categorySelections: {} }),
      catalog,
    });
    expect(violations.some((violation) => violation.blocked)).toBe(true);
    expect(violations.map((violation) => violation.ruleKey)).toContain(
      "elective_set_pattern_g11_g12",
    );
  });

  it("blocks electives for Grades 9–10", () => {
    const violations = validateGradeElectives({
      input: selectionInput({ currentGrade: 10 }),
      catalog,
    });
    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: "grade_no_electives_g9_g10",
        blocked: true,
      }),
    ]);
  });

  it("blocks duplicate category selections", () => {
    const violations = validateNoDuplicates(
      selectionInput({
        categorySelections: {
          math_category: "AP_STATS",
          science_category: "ENV_SCI",
          set1_elective: "AP_CSP",
          set2_elective: "AP_CSP",
        },
      }),
    );
    expect(violations).toEqual([
      expect.objectContaining({ ruleKey: "duplicate_choice", blocked: true }),
    ]);
  });

  it("blocks dropping a year-long course mid-year", () => {
    const violations = validateYearLongContinuity({
      input: selectionInput({
        scenario: { semester: "Semester2", isMidYear: true },
        currentAPs: ["AP_CHEM"],
        set1: ["PSYCH_II"],
      }),
      catalog,
    });
    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: "year_long_cannot_drop",
        blocked: true,
      }),
    ]);
  });

  it("blocks core-replacement conflicts", () => {
    const violations = validateCoreReplacementConflicts({
      input: selectionInput({
        categorySelections: { math_category: "AP_CALC_AB" },
        core: ["AP_CALC_AB", "CALCULUS"],
      }),
      catalog,
    });
    expect(violations).toEqual([
      expect.objectContaining({ ruleKey: "duplicate_choice", blocked: true }),
    ]);
  });

  it("blocks a Grade 12 plan without a science path", () => {
    const violations = validateGrade12ScienceRequirement({
      input: selectionInput({
        categorySelections: {
          math_category: "AP_STATS",
          set1_elective: "GRAPHIC_DESIGN_I",
          set2_elective: "ACCOUNTING",
        },
        core: ["AP_STATS"],
        set1: ["GRAPHIC_DESIGN_I"],
        set2: ["ACCOUNTING"],
      }),
      catalog,
    });
    expect(violations).toEqual([
      expect.objectContaining({
        ruleKey: "prerequisite_satisfied",
        blocked: true,
      }),
    ]);
  });
});
