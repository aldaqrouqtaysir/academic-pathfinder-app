import { categoryTemplatesSeed } from "@/data/sais";
import { getSelectedCountries, type StudentProfile } from "../models/studentProfile";
import type { CourseCatalog, RecommendationComputeInput } from "../engine/types";
import type { PathRecommendation, RecommendationBundle } from "../models/recommendations";
import type { Course, PlanCategoryKey } from "../models/course";
import { scorePathway } from "../scoring/scorePathway";
import { validateHardConstraints } from "../validators/validateHardConstraints";
import { validateSoftConstraints } from "../validators/validateSoftConstraints";

interface CandidatePlan {
  categorySelections: Partial<Record<PlanCategoryKey, string>>;
  core: string[];
  set1: string[];
  set2: string[];
  score: ReturnType<typeof scorePathway>;
  softWarnings: string[];
}

function buildCategorySelections(profile: StudentProfile, plan: { core: string[]; set1: string[]; set2: string[]; categorySelections?: Partial<Record<PlanCategoryKey, string>> }) {
  if (plan.categorySelections) return plan.categorySelections;
  const map: Partial<Record<PlanCategoryKey, string>> = {};
  for (const code of plan.core) {
    if (["ENG_11", "AP_LANG_COMP"].includes(code)) map.english_category = code;
    if (["PHYS_11", "AP_PHYSICS_C1", "ENV_SCI", "THERMO", "ORG_CHEM"].includes(code)) map.science_category = code;
    if (["MATH_INT_3", "PRECALC", "MATH_BUSINESS", "AP_CALC_AB", "AP_STATS", "CALCULUS", "CALC_BUSINESS", "CALC_FOUNDATION"].includes(code)) {
      map.math_category = code;
    }
  }
  if (plan.set1[0]) map.set1_elective = plan.set1[0];
  if (plan.set2[0]) map.set2_elective = plan.set2[0];
  return map;
}

function buildContinuationSuggestions(params: {
  selectedCodes: string[];
  catalog: CourseCatalog;
  profile: StudentProfile;
  scenario: RecommendationComputeInput["scenario"];
}): PathRecommendation["continuationSuggestions"] {
  const { selectedCodes, catalog, profile, scenario } = params;
  const suggestions: PathRecommendation["continuationSuggestions"] = [];
  for (const code of selectedCodes) {
    const c = catalog.courses.find((x) => x.code === code);
    if (!c?.continuations) continue;
    for (const cont of c.continuations) {
      suggestions.push({
        fromCourseCode: code,
        toCourseCode: cont.toCourseCode,
        kind: cont.kind,
        note: cont.note,
      });
    }
  }

  // Semester 2 category-aware science continuation guidance based on Semester 1 path.
  if (profile.currentGrade === 12 && scenario.semester === "Semester2") {
    const prior = new Set([...profile.currentCourses, ...profile.currentAPs]);
    if (prior.has("THERMO")) {
      suggestions.push({
        fromCourseCode: "THERMO",
        toCourseCode: "ELECTROMAG",
        kind: "recommended",
        note: "Thermodynamics -> Electromagnetism is recommended in Semester 2; switching remains allowed.",
      });
      suggestions.push({
        fromCourseCode: "THERMO",
        toCourseCode: "BIOCHEM",
        kind: "optional",
        note: "Switching to Biochemistry is allowed if alignment improves.",
      });
    }
    if (prior.has("ORG_CHEM")) {
      suggestions.push({
        fromCourseCode: "ORG_CHEM",
        toCourseCode: "BIOCHEM",
        kind: "recommended",
        note: "Organic Chemistry -> Biochemistry is recommended in Semester 2; switching remains allowed.",
      });
      suggestions.push({
        fromCourseCode: "ORG_CHEM",
        toCourseCode: "ELECTROMAG",
        kind: "optional",
        note: "Switching to Electromagnetism is allowed if alignment improves.",
      });
    }
  }
  return suggestions;
}

function chooseOneFromEachGroup(groups: string[][]): string[][] {
  if (groups.length === 0) return [[]];
  const [head, ...tail] = groups;
  const rest = chooseOneFromEachGroup(tail);
  const out: string[][] = [];
  for (const h of head) {
    for (const r of rest) out.push([h, ...r]);
  }
  return out;
}

function candidateSelections(params: { profile: StudentProfile; catalog: CourseCatalog; scenario: RecommendationComputeInput["scenario"] }): Array<{ categorySelections: Partial<Record<PlanCategoryKey, string>>; core: string[]; set1: string[]; set2: string[] }> {
  const { profile, scenario } = params;
  const template = categoryTemplatesSeed.find((t) => t.grade === profile.currentGrade && t.semester === scenario.semester);
  if (!template) {
    // G9/G10 fallback: no elective modeling
    return [{ categorySelections: {}, core: profile.currentGrade === 9 ? ["MATH_INT_1", "VPA"] : profile.currentGrade === 10 ? ["MATH_INT_2", "VPA"] : [], set1: [], set2: [] }];
  }

  const englishOptions = template.categories.find((c) => c.key === "english_category")?.options.map((o) => o.courseCode) ?? [""];
  const scienceOptions = template.categories.find((c) => c.key === "science_category")?.options.map((o) => o.courseCode) ?? [""];
  const mathOptions = template.categories.find((c) => c.key === "math_category")?.options.map((o) => o.courseCode) ?? [""];
  const set1Options = template.categories.find((c) => c.key === "set1_elective")?.options.map((o) => o.courseCode) ?? [""];
  const set2Options = template.categories.find((c) => c.key === "set2_elective")?.options.map((o) => o.courseCode) ?? [""];

  const plans: Array<{ categorySelections: Partial<Record<PlanCategoryKey, string>>; core: string[]; set1: string[]; set2: string[] }> = [];
  for (const eng of englishOptions) {
    for (const sci of scienceOptions) {
      for (const math of mathOptions) {
        for (const s1 of set1Options) {
          for (const s2 of set2Options) {
            const core = [eng, sci, math].filter(Boolean);
            const categorySelections: Partial<Record<PlanCategoryKey, string>> = {};
            if (eng) categorySelections.english_category = eng;
            if (sci) categorySelections.science_category = sci;
            if (math) categorySelections.math_category = math;
            if (s1) categorySelections.set1_elective = s1;
            if (s2) categorySelections.set2_elective = s2;
            plans.push({ categorySelections, core, set1: s1 ? [s1] : [], set2: s2 ? [s2] : [] });
          }
        }
      }
    }
  }
  return plans;
}

function toCourses(codes: string[], catalog: CourseCatalog): Course[] {
  return codes
    .map((code) => catalog.courses.find((c) => c.code === code))
    .filter(Boolean) as Course[];
}

function courseName(code: string, catalog: CourseCatalog) {
  return catalog.courses.find((c) => c.code === code)?.name ?? code;
}

function buildPathRecommendation(params: {
  kind: PathRecommendation["kind"];
  label: PathRecommendation["label"];
  plan: CandidatePlan;
  profile: StudentProfile;
  catalog: CourseCatalog;
  scenario: RecommendationComputeInput["scenario"];
  alternatives: string[];
}): PathRecommendation {
  const { kind, label, plan, profile, alternatives } = params;
  const top = [...plan.score.factors].sort((a, b) => b.points - a.points).slice(0, 3);
  const selectedNames = [...plan.core, ...plan.set1, ...plan.set2].map((c) => courseName(c, params.catalog));
  const workloadPoints = plan.score.factors.find((f) => f.key === "workload_fit")?.points ?? 0;

  return {
    kind,
    label,
    selections: { core: plan.core, set1: plan.set1, set2: plan.set2, categorySelections: buildCategorySelections(profile, plan) },
    score: plan.score.total,
    confidence: {
      overall: Math.min(1, plan.score.total / 100),
      factors: plan.score.factors.map((f) => ({ label: f.label, value: f.points })),
    },
    rationale: {
      targetPathway: plan.score.targetPathway,
      topContributingFactors: top,
      factorBreakdown: plan.score.factors,
    },
    explanation:
      kind === "bestFit"
        ? `Best Fit balances your goals, workload tolerance, and future impact for Grade ${profile.currentGrade}.`
        : kind === "balanced"
          ? `Balanced keeps a strong overall fit while avoiding unnecessary overload.`
          : `Stretch increases rigor and challenge to improve competitiveness when appropriate.`,
    continuationSuggestions: buildContinuationSuggestions({
      selectedCodes: [...plan.core, ...plan.set1, ...plan.set2],
      catalog: params.catalog,
      profile,
      scenario: params.scenario,
    }),
    whyMayNotFit: plan.softWarnings.length > 0 ? plan.softWarnings.slice(0, 2) : ["No major fit risks detected under current inputs."],
    whyMayFeelHard:
      workloadPoints < 7
        ? ["Workload-pressure risk exists relative to your tolerance and confidence profile."]
        : ["Difficulty appears manageable for your declared workload tolerance."],
    confidenceExplanation:
      bandConfidence(Math.min(1, plan.score.total / 100)) +
      ` Confidence reflects your answers (completeness + consistency) and how strongly the plan matches your priorities.`,
    scoringWeightModel: {
      baseWeights: plan.score.weightModel.baseWeights,
      adjustedWeights: plan.score.weightModel.adjustedWeights,
      normalizedWeights: plan.score.weightModel.normalizedWeights,
      appliedAdjustments: plan.score.weightModel.appliedAdjustments,
    },
    hardRisks: [],
    softWarnings: plan.softWarnings,
    tradeOffs: [
      "Higher rigor can improve competitiveness but increase workload pressure.",
      "Country-sensitive targets (Egypt/Jordan) may require additional counselor compliance checks.",
    ],
    alternatives,
    actionSteps: [
      "Review this plan with counselor for final section placement.",
      "Confirm year-long commitments before mid-year changes.",
      "Track workload weekly and adjust study plan early.",
      ...plan.score.weightModel.appliedAdjustments.map((x) => `Scoring priority applied: ${x}`),
    ],
    futureImpactSummary: `This path supports your likely direction (${plan.score.targetPathway}) and prioritizes: ${selectedNames.join(", ")}.`,
  };
}

function bandConfidence(overall: number) {
  const pct = Math.round(overall * 100);
  if (overall >= 0.75) return `High confidence (${pct}%).`;
  if (overall >= 0.5) return `Medium confidence (${pct}%).`;
  return `Lower confidence (${pct}%).`;
}

function buildLowerGradeGuidanceRecommendation(params: {
  kind: PathRecommendation["kind"];
  profile: StudentProfile;
}): PathRecommendation {
  const { kind, profile } = params;
  const targetPathway = profile.careerGoals.length > 0 ? "undecided" : "undecided";
  return {
    kind,
    label: kind === "bestFit" ? "Optimal" : "Recommended",
    selections: { core: [], set1: [], set2: [], categorySelections: {} },
    score: 0,
    confidence: { overall: 0.75, factors: [{ label: "Guidance mode confidence", value: 75 }] },
    rationale: { targetPathway, topContributingFactors: [], factorBreakdown: [] },
    explanation: "Grade 9–10 guidance mode: no elective-set schedule is generated. This output focuses on pathway awareness and Grade 11 readiness.",
    continuationSuggestions: [],
    whyMayNotFit: [],
    whyMayFeelHard: [],
    confidenceExplanation: "Guidance mode confidence reflects profile completeness, not schedule optimization.",
    hardRisks: [],
    softWarnings: [],
    tradeOffs: ["At this stage, skill-building and exploration matter more than fixed specialization."],
    alternatives: [
      "Build stronger Math + Science base if aiming for AP Physics/AP Calculus in Grade 11/12.",
      "Track interests through projects to clarify future pathway choices by Grade 11.",
    ],
    actionSteps: [
      "Focus on foundational performance in current core subjects.",
      "Document interests and strengths this year for Grade 11 planning.",
      "Review Grade 11 category options early with counselor.",
    ],
    futureImpactSummary:
      "Current recommendations are readiness-focused. Major high-impact choices begin in Grade 11 (Math/Science/English category paths + Set 1/Set 2 electives).",
  };
}

export function generateRecommendationBundle(params: {
  profile: StudentProfile;
  catalog: CourseCatalog;
  rules: RecommendationComputeInput["rules"];
  scenario: RecommendationComputeInput["scenario"];
}): RecommendationBundle {
  const { profile, catalog, rules, scenario } = params;
  if (profile.currentGrade === 9 || profile.currentGrade === 10) {
    return {
      bestFit: buildLowerGradeGuidanceRecommendation({ kind: "bestFit", profile }),
      balanced: buildLowerGradeGuidanceRecommendation({ kind: "balanced", profile }),
      stretch: buildLowerGradeGuidanceRecommendation({ kind: "stretch", profile }),
    };
  }

  const candidates = candidateSelections({ profile, catalog, scenario });
  const accepted: CandidatePlan[] = [];

  for (const c of candidates) {
    const hard = validateHardConstraints({
      input: {
        currentGrade: profile.currentGrade,
        targetCountries: getSelectedCountries(profile),
        scenario,
        categorySelections: c.categorySelections,
        core: c.core,
        set1: c.set1,
        set2: c.set2,
        currentCourses: profile.currentCourses,
        currentAPs: profile.currentAPs,
      },
      catalog,
      rules,
    });
    if (hard.blocked) continue;

    const score = scorePathway({
      profile,
      categorySelections: c.categorySelections,
      selectedCore: c.core,
      selectedSet1: c.set1,
      selectedSet2: c.set2,
      catalog,
      scenario,
    });

    const soft = validateSoftConstraints({
      profile,
      scenario,
      scoring: score,
      selected: {
        core: toCourses(c.core, catalog),
        set1: toCourses(c.set1, catalog),
        set2: toCourses(c.set2, catalog),
        all: toCourses([...c.core, ...c.set1, ...c.set2], catalog),
      },
    });

    accepted.push({
      categorySelections: c.categorySelections,
      core: c.core,
      set1: c.set1,
      set2: c.set2,
      score,
      softWarnings: soft.softWarnings,
    });
  }

  if (accepted.length === 0) {
    const emptyPlan: CandidatePlan = {
      categorySelections: {},
      core: [],
      set1: [],
      set2: [],
      score: { total: 0, factors: [], targetPathway: "undecided", topReasons: [] },
      softWarnings: ["No valid recommendation could be generated under current hard constraints."],
    };
    return {
      bestFit: buildPathRecommendation({ kind: "bestFit", label: "Allowed", plan: emptyPlan, profile, catalog, scenario, alternatives: [] }),
      balanced: buildPathRecommendation({ kind: "balanced", label: "Allowed", plan: emptyPlan, profile, catalog, scenario, alternatives: [] }),
      stretch: buildPathRecommendation({ kind: "stretch", label: "Allowed", plan: emptyPlan, profile, catalog, scenario, alternatives: [] }),
    };
  }

  accepted.sort((a, b) => b.score.total - a.score.total);
  const best = accepted[0];
  const balanced = accepted[Math.floor(accepted.length / 2)];
  const stretch = [...accepted]
    .sort((a, b) => {
      const rigorA = a.score.factors.find((f) => f.key === "learning_stretch")?.points ?? 0;
      const rigorB = b.score.factors.find((f) => f.key === "learning_stretch")?.points ?? 0;
      return rigorB - rigorA;
    })[0];

  const alternatives = accepted
    .slice(1, 4)
    .map((p) => {
      const core = p.core.map((c) => courseName(c, catalog)).join(", ");
      const set1 = p.set1.map((c) => courseName(c, catalog)).join(", ");
      const set2 = p.set2.map((c) => courseName(c, catalog)).join(", ");
      return `Core: ${core} | Set 1: ${set1} | Set 2: ${set2}`;
    });

  return {
    bestFit: buildPathRecommendation({ kind: "bestFit", label: "Optimal", plan: best, profile, catalog, scenario, alternatives }),
    balanced: buildPathRecommendation({ kind: "balanced", label: "Recommended", plan: balanced, profile, catalog, scenario, alternatives }),
    stretch: buildPathRecommendation({ kind: "stretch", label: "Recommended", plan: stretch, profile, catalog, scenario, alternatives }),
  };
}

