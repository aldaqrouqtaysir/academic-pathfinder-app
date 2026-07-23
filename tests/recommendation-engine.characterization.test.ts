import { courseCatalogSeed, rulesCatalogSeed } from "@/data/sais";
import { computeRecommendations } from "@/lib/domain/engine/computeRecommendations";
import type { RecommendationComputeInput } from "@/lib/domain/engine/types";
import { scorePathway } from "@/lib/domain/scoring/scorePathway";
import { validateSoftConstraints } from "@/lib/domain/validators/validateSoftConstraints";
import { describe, expect, it } from "vitest";
import {
  acceptedCandidates,
  computeFixture,
  enumerateCandidates,
  recommendationCourseOrder,
  recommendationSignature,
} from "./helpers/recommendationTestHarness";
import { recommendationFixtures } from "./test-fixtures/studentProfiles";

const EXPECTED_CHARACTERIZATION = {
  highStemGrade12Semester1: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["THERMO|AP_CALC_AB|AP_CHEM|AP_CSP", 76.6, 1],
    balanced: ["THERMO|AP_CALC_AB|DATA_SCIENCE|AP_CSP", 76.7, 1],
    stretch: ["THERMO|AP_CALC_AB|AP_CHEM|AP_BIO", 74.3, 1],
  },
  computerScienceFocused: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["THERMO|AP_STATS|DATA_SCIENCE|AP_CSP", 86.2, 0],
    balanced: ["THERMO|AP_STATS|DATA_SCIENCE|PYTHON_PROG", 85.9, 0],
    stretch: ["THERMO|AP_CALC_AB|DATA_SCIENCE|AP_CSP", 84.4, 0],
  },
  businessGrade12Semester1: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["ENV_SCI|AP_STATS|MICROECON|ETHICAL_BUSINESS_LEADERSHIP", 76.9, 0],
    balanced: ["ENV_SCI|CALC_BUSINESS|MICROECON|ETHICAL_BUSINESS_LEADERSHIP", 75.5, 0],
    stretch: ["ENV_SCI|AP_STATS|PUBLIC_SPEAKING_DEBATE|ETHICAL_BUSINESS_LEADERSHIP", 74.8, 0],
  },
  humanitiesGrade11: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["AP_LANG_COMP|PHYS_11|MATH_BUSINESS|PUBLIC_SPEAKING_DEBATE|ETHICAL_BUSINESS_LEADERSHIP", 67.3, 2],
    balanced: ["ENG_11|PHYS_11|MATH_INT_3|PUBLIC_SPEAKING_DEBATE|ETHICAL_BUSINESS_LEADERSHIP", 67, 2],
    stretch: ["AP_LANG_COMP|PHYS_11|MATH_INT_3|PUBLIC_SPEAKING_DEBATE|ETHICAL_BUSINESS_LEADERSHIP", 66.8, 2],
  },
  highWorkloadTolerance: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["AP_LANG_COMP|AP_PHYSICS_C1|PRECALC|AI_I|AP_CSP", 79.2, 1],
    balanced: ["AP_LANG_COMP|AP_PHYSICS_C1|PRECALC|DATA_SCIENCE|AP_CSP", 79.1, 1],
    stretch: ["AP_LANG_COMP|AP_PHYSICS_C1|MATH_INT_3|AI_I|AP_CSP", 78.3, 1],
  },
  lowWorkloadTolerance: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["ENG_11|PHYS_11|MATH_BUSINESS|GRAPHIC_DESIGN_I|DIGITAL_ART_I", 63.4, 2],
    balanced: ["ENG_11|PHYS_11|MATH_BUSINESS|GRAPHIC_DESIGN_I|PAINTING_SKETCHING_I", 63.4, 2],
    stretch: ["AP_LANG_COMP|PHYS_11|MATH_BUSINESS|GRAPHIC_DESIGN_I|DIGITAL_ART_I", 62.3, 2],
  },
  missingOptionalAnswers: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["ENG_11|PHYS_11|MATH_INT_3|PSYCH_I|IAJJAZ_EL_AALMI", 61.8, 1],
    balanced: ["ENG_11|PHYS_11|MATH_INT_3|SOCIOLOGY_I|IAJJAZ_EL_AALMI", 61.8, 1],
    stretch: ["AP_LANG_COMP|PHYS_11|MATH_INT_3|PSYCH_I|AP_CSP", 59.2, 1],
  },
  conflictingGoals: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["ENV_SCI|AP_STATS|AI_I|PAINTING_SKETCHING_I", 67.6, 1],
    balanced: ["ENV_SCI|AP_STATS|DATA_SCIENCE|PAINTING_SKETCHING_I", 67.4, 1],
    stretch: ["ENV_SCI|AP_STATS|AI_I|AP_CSP", 66.8, 1],
  },
  prerequisiteBoundary: {
    candidates: 1440,
    valid: 1440,
    bestFit: ["ORG_CHEM|AP_STATS|AP_CHEM|HUMAN_ANATOMY_I", 81.9, 1],
    balanced: ["ORG_CHEM|AP_STATS|PSYCH_I|HUMAN_ANATOMY_I", 79.6, 1],
    stretch: ["ORG_CHEM|AP_STATS|AP_CHEM|AP_BIO", 80.7, 2],
  },
  fewValidPlansGrade12Semester2: {
    candidates: 1728,
    valid: 1,
    bestFit: ["ENV_SCI|AP_CALC_AB|AP_CHEM|AP_BIO", 80.2, 1],
    balanced: ["ENV_SCI|AP_CALC_AB|AP_CHEM|AP_BIO", 80.2, 1],
    stretch: ["ENV_SCI|AP_CALC_AB|AP_CHEM|AP_BIO", 80.2, 1],
  },
  tieHeavyGrade12Semester2: {
    candidates: 1728,
    valid: 1728,
    bestFit: ["ENV_SCI|AP_STATS|PSYCH_II|IAJJAZ_EL_AALMI", 65.1, 1],
    balanced: ["ENV_SCI|AP_STATS|SOCIOLOGY_II|IAJJAZ_EL_AALMI", 65.1, 1],
    stretch: ["ENV_SCI|AP_STATS|PSYCH_II|AP_CSP", 64.4, 1],
  },
} as const;

describe("recommendation engine characterization", () => {
  for (const [key, expected] of Object.entries(EXPECTED_CHARACTERIZATION)) {
    it(`preserves ${recommendationFixtures[key as keyof typeof recommendationFixtures].name}`, () => {
      const fixture = recommendationFixtures[key as keyof typeof recommendationFixtures];
      const bundle = computeFixture(fixture.profile, fixture.scenario);

      expect(enumerateCandidates(fixture.profile, fixture.scenario)).toHaveLength(expected.candidates);
      expect(acceptedCandidates(fixture.profile, fixture.scenario)).toHaveLength(expected.valid);

      for (const kind of ["bestFit", "balanced", "stretch"] as const) {
        const recommendation = bundle[kind];
        const [signature, score, warningCount] = expected[kind];
        expect(recommendation.kind).toBe(kind);
        expect(recommendation.label).toBe("Recommended");
        expect(recommendationSignature(recommendation)).toBe(signature);
        expect(recommendation.score).toBe(score);
        expect(recommendation.softWarnings).toHaveLength(warningCount);
        expect(recommendation.hardRisks).toEqual([]);
      }
    });
  }

  it("pins the high-STEM factor contributions, warnings, explanations, and action steps", () => {
    const fixture = recommendationFixtures.highStemGrade12Semester1;
    const bestFit = computeFixture(fixture.profile, fixture.scenario).bestFit;

    expect(bestFit.rationale.factorBreakdown.map(({ key, points }) => [key, points])).toEqual([
      ["interest_alignment", 0],
      ["strength_match", 8.7],
      ["workload_fit", 10.1],
      ["pathway_alignment", 12.9],
      ["country_alignment", 7.3],
      ["future_relevance", 13.4],
      ["learning_stretch", 9.9],
      ["real_world_relevance", 6.1],
      ["scholarship_competitiveness", 8.2],
    ]);
    expect(bestFit.softWarnings).toEqual([
      "A few choices don’t line up as tightly with the interests or career ideas you shared — you might swap one elective after talking with your counselor.",
    ]);
    expect(bestFit.selectionBecause).toEqual([
      "Math: AP Calculus AB was chosen because your profile points toward strong STEM, math-heavy preparation, or competitive applications. The trade-off is a heavier algebra and calculus workload than statistics or business calculus.",
      "Science: Thermodynamics was chosen for engineering or physics-style preparation. It is more demanding than Environmental Science, but it gives a stronger quantitative science signal.",
      "Set 1: AP Chemistry fills this elective slot while staying consistent with your workload and pathway; Psychology I is a common alternative if you want a different flavor.",
      "Set 2: AP Computer Science Principles fills this elective slot while staying consistent with your workload and pathway; AP Biology is a common alternative if you want a different flavor.",
      "Overall path: Best Fit leans flexible — based on keeping majors or destinations easier to change later.",
    ]);
    expect(bestFit.actionSteps).toEqual([
      "Book a short check-in with your counselor to confirm section availability and prerequisites.",
      "If you chose a year-long AP, confirm you’re ready to stay with it through Semester 2.",
      "Try a two-week study rhythm now so you know how this load feels before midterms.",
      "We emphasized courses that push your stated direction forward.",
      "We favored options that keep competitive university paths realistic.",
      "We tuned this plan using how you answered the SAIS planning questions.",
    ]);
    expect(bestFit.confidence.overall).toBeCloseTo(0.766, 12);
    expect(bestFit.explanation).toContain("Your Best Fit is the strongest match");
    expect(bestFit.confidenceExplanation).toBe(
      "This recommendation lines up strongly with what you told us — use it as a confident starting point with your counselor.",
    );
  });

  it("preserves the current shared warning trigger key behavior", () => {
    const fixture = recommendationFixtures.lowWorkloadTolerance;
    const bestFit = computeFixture(fixture.profile, fixture.scenario).bestFit;
    const categorySelections = bestFit.selections.categorySelections ?? {};
    const selectedCodes = recommendationCourseOrder(bestFit);
    const selectedCourses = selectedCodes.map((code) => {
      const course = courseCatalogSeed.find((item) => item.code === code);
      if (!course) throw new Error(`Missing course in synthetic test: ${code}`);
      return course;
    });
    const scoring = scorePathway({
      profile: fixture.profile,
      categorySelections,
      selectedCore: bestFit.selections.core,
      selectedSet1: bestFit.selections.set1,
      selectedSet2: bestFit.selections.set2,
      catalog: { courses: courseCatalogSeed },
      scenario: fixture.scenario,
    });
    const result = validateSoftConstraints({
      profile: fixture.profile,
      scenario: fixture.scenario,
      scoring,
      selected: {
        core: selectedCourses.slice(0, bestFit.selections.core.length),
        set1: selectedCourses.slice(
          bestFit.selections.core.length,
          bestFit.selections.core.length + bestFit.selections.set1.length,
        ),
        set2: selectedCourses.slice(-bestFit.selections.set2.length),
        all: selectedCourses,
      },
    });

    expect(result.softWarnings).toHaveLength(2);
    expect(result.triggeredRuleKeys).toEqual(["country_alignment"]);
  });

  it("preserves Semester 2 continuation suggestions", () => {
    const source = recommendationFixtures.computerScienceFocused;
    const profile = structuredClone(source.profile);
    profile.currentCourses = ["THERMO"];
    profile.desiredCourseYear = "Next";
    const scenario = { semester: "Semester2", isMidYear: true } as const;
    const bestFit = computeFixture(profile, scenario).bestFit;

    expect(bestFit.continuationSuggestions).toContainEqual({
      fromCourseCode: "THERMO",
      toCourseCode: "ELECTROMAG",
      kind: "recommended",
      note: "Thermodynamics -> Electromagnetism is recommended in Semester 2; switching remains allowed.",
    });
    expect(bestFit.continuationSuggestions).toContainEqual({
      fromCourseCode: "THERMO",
      toCourseCode: "BIOCHEM",
      kind: "optional",
      note: "Switching to Biochemistry is allowed if alignment improves.",
    });
  });

  it("preserves the one-valid-plan duplication behavior", () => {
    const fixture = recommendationFixtures.fewValidPlansGrade12Semester2;
    const bundle = computeFixture(fixture.profile, fixture.scenario);
    const signatures = [
      recommendationSignature(bundle.bestFit),
      recommendationSignature(bundle.balanced),
      recommendationSignature(bundle.stretch),
    ];

    expect(acceptedCandidates(fixture.profile, fixture.scenario)).toHaveLength(1);
    expect(new Set(signatures).size).toBe(1);
    expect(bundle.bestFit.score).toBe(bundle.balanced.score);
    expect(bundle.bestFit.score).toBe(bundle.stretch.score);
  });

  it("preserves stable insertion-order tie handling", () => {
    const fixture = recommendationFixtures.tieHeavyGrade12Semester2;
    const bundle = computeFixture(fixture.profile, fixture.scenario);

    expect([
      recommendationSignature(bundle.bestFit),
      recommendationSignature(bundle.balanced),
      recommendationSignature(bundle.stretch),
    ]).toEqual([
      "ENV_SCI|AP_STATS|PSYCH_II|IAJJAZ_EL_AALMI",
      "ENV_SCI|AP_STATS|SOCIOLOGY_II|IAJJAZ_EL_AALMI",
      "ENV_SCI|AP_STATS|PSYCH_II|AP_CSP",
    ]);
  });

  it("does not mutate recommendation inputs", () => {
    const fixture = recommendationFixtures.conflictingGoals;
    const input: RecommendationComputeInput = {
      profile: structuredClone(fixture.profile),
      semester: fixture.scenario.semester,
      scenario: structuredClone(fixture.scenario),
      catalog: { courses: structuredClone(courseCatalogSeed) },
      rules: { rules: structuredClone(rulesCatalogSeed) },
    };
    const before = structuredClone(input);

    computeRecommendations(input);

    expect(input).toEqual(before);
  });

  it("returns byte-for-byte equivalent results across repeated runs", () => {
    const fixture = recommendationFixtures.highStemGrade12Semester1;
    const baseline = computeFixture(fixture.profile, fixture.scenario);

    for (let run = 0; run < 6; run += 1) {
      expect(computeFixture(fixture.profile, fixture.scenario)).toEqual(baseline);
    }
  });
});
