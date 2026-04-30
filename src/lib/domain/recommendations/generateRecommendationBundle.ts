import { categoryTemplatesSeed } from "@/data/sais";
import { getSelectedCountries, type StudentProfile } from "../models/studentProfile";
import type { CourseCatalog, RecommendationComputeInput } from "../engine/types";
import type { PathRecommendation, RecommendationBundle, ScoringFactorContribution } from "../models/recommendations";
import type { Course, PlanCategoryKey } from "../models/course";
import { scorePathway } from "../scoring/scorePathway";
import { determineTargetPathway } from "../scoring/helpers";
import { buildDynamicWeights } from "../scoring/weights";
import { validateHardConstraints } from "../validators/validateHardConstraints";
import { validateSoftConstraints } from "../validators/validateSoftConstraints";
import { buildSelectionBecauseBullets } from "./selectionBecause";

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
    if (["PHYS_11", "AP_PHYSICS_C1", "ENV_SCI", "THERMO", "ORG_CHEM", "ELECTROMAG", "BIOCHEM"].includes(code))
      map.science_category = code;
    if (
      [
        "MATH_INT_3",
        "PRECALC",
        "MATH_BUSINESS",
        "FUND_MATH_I",
        "AP_CALC_AB",
        "AP_STATS",
        "CALCULUS",
        "CALC_BUSINESS",
        "FUND_MATH_II",
      ].includes(code)
    ) {
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

function pathwayStudentPhrase(pathway: string): string {
  const map: Record<string, string> = {
    undecided: "students who are still exploring directions",
    engineering: "a STEM / engineering-leaning direction",
    ai_tech: "technology and computer science interests",
    medicine: "medicine and health sciences",
    business_finance: "business and finance",
    creative: "creative and design-heavy paths",
  };
  return map[pathway] ?? "your mix of goals";
}

function studentTrustNarrative(overall: number): string {
  if (overall >= 0.75) {
    return "This recommendation lines up strongly with what you told us — use it as a confident starting point with your counselor.";
  }
  if (overall >= 0.5) {
    return "This is a solid match to your answers; a few details are worth double-checking with your counselor.";
  }
  return "Treat this as a draft plan: your profile left some open questions, so counselor input matters a bit more here.";
}

function friendlyPriorityNote(raw: string): string {
  if (raw.includes("strongest_path")) return "We emphasized courses that push your stated direction forward.";
  if (raw.includes("balanced_path")) return "We balanced sustainability with fit so the year feels doable.";
  if (raw.includes("safest_highest_grade")) return "We leaned toward safer choices that usually support strong grades.";
  if (raw.includes("not_sure")) return "You weren’t sure how to prioritize — we kept the plan flexible.";
  if (raw.includes("lighter_workload")) return "We avoided the heaviest combinations where SAIS rules allow.";
  if (raw.includes("university_competitiveness")) return "We favored options that keep competitive university paths realistic.";
  if (raw.includes("keeping_options_open")) return "We kept electives broad so you can change mind next term.";
  if (raw.includes("higher_grades")) return "We weighted choices that often pair well with strong outcomes.";
  if (raw.includes("career_alignment")) return "We prioritized the career themes you mentioned.";
  return "We tuned this plan using how you answered the SAIS planning questions.";
}

function whoIsThisPathFor(kind: PathRecommendation["kind"], profile: StudentProfile): string {
  if (kind === "bestFit") {
    return `Students in Grade ${profile.currentGrade} who want a schedule that matches their answers without leaning extremely safe or extremely intense.`;
  }
  if (kind === "balanced") {
    return `Students who want a strong SAIS schedule with a bit more breathing room than the most demanding mix.`;
  }
  return `Students who are ready to take on more challenge for stronger preparation or more competitive applications.`;
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
  const conf = Math.min(1, plan.score.total / 100);
  const pathwayPhrase = pathwayStudentPhrase(plan.score.targetPathway);
  const categorySelectionsForBecause = buildCategorySelections(profile, plan);
  const selectionBecause = buildSelectionBecauseBullets({
    profile,
    categorySelections: categorySelectionsForBecause,
    catalog: params.catalog,
    semester: params.scenario.semester,
    kind,
  });

  const courseList =
    selectedNames.length > 0
      ? `This schedule centers ${selectedNames.slice(0, 4).join(", ")}${selectedNames.length > 4 ? ", and more" : ""}. `
      : "";
  const explanation =
    kind === "bestFit"
      ? `${courseList}Your Best Fit is the strongest match to how you answered about interests, workload, and priorities — walk through it with your counselor to confirm sections and prerequisites.`
      : kind === "balanced"
        ? `${courseList}Balanced keeps a strong SAIS year with a little more room than the toughest mix — good when you want credibility without running at max intensity every week.`
        : `${courseList}Stretch raises rigor and prep versus Balanced — use it if you want sharper readiness for competitive next steps and said you can handle the pace.`;

  const whyMayFeelHard =
    kind === "stretch"
      ? [
          "Expect a faster pace and more independent work than the lightest path at SAIS.",
          "Labs and AP-style courses often spike around exams — plan study time early.",
        ]
      : kind === "balanced"
        ? ["Some weeks will still feel full; that’s normal with Physics, English, and electives in play.", "If one subject drains you, ask early about tutoring or section support."]
        : [
            "You may still hit crunch weeks even on Best Fit — especially before major assessments.",
            "If something feels off after a few weeks, one elective swap can change the whole feel of the term.",
          ];

  const priorityNotes = plan.score.weightModel.appliedAdjustments.map(friendlyPriorityNote);

  return {
    kind,
    label,
    selections: { core: plan.core, set1: plan.set1, set2: plan.set2, categorySelections: categorySelectionsForBecause },
    score: plan.score.total,
    confidence: {
      overall: conf,
      factors: plan.score.factors.map((f) => ({ label: f.label, value: f.points })),
    },
    rationale: {
      targetPathway: plan.score.targetPathway,
      topContributingFactors: top,
      factorBreakdown: plan.score.factors,
    },
    explanation,
    selectionBecause,
    continuationSuggestions: buildContinuationSuggestions({
      selectedCodes: [...plan.core, ...plan.set1, ...plan.set2],
      catalog: params.catalog,
      profile,
      scenario: params.scenario,
    }),
    whyMayNotFit:
      plan.softWarnings.length > 0
        ? plan.softWarnings.slice(0, 3)
        : ["No major red flags from your answers — SAIS rules and your counselor still have the final say on placement."],
    whyMayFeelHard,
    confidenceExplanation: studentTrustNarrative(conf),
    scoringWeightModel: {
      baseWeights: plan.score.weightModel.baseWeights,
      adjustedWeights: plan.score.weightModel.adjustedWeights,
      normalizedWeights: plan.score.weightModel.normalizedWeights,
      appliedAdjustments: plan.score.weightModel.appliedAdjustments,
    },
    hardRisks: [],
    softWarnings: plan.softWarnings,
    tradeOffs: [
      "More APs and lab science usually mean stronger preparation — and less free time after school.",
      "If Egypt or Jordan is a main destination, your counselor should confirm equivalency for any AP-heavy mix.",
      "Year-long APs at SAIS can’t be dropped mid-year without a formal process — commit before you sign.",
    ],
    alternatives,
    actionSteps: [
      "Book a short check-in with your counselor to confirm section availability and prerequisites.",
      "If you chose a year-long AP, confirm you’re ready to stay with it through Semester 2.",
      "Try a two-week study rhythm now so you know how this load feels before midterms.",
      ...priorityNotes,
    ],
    futureImpactSummary: `Centers on ${selectedNames.slice(0, 5).join(", ")} — a mix that supports ${pathwayPhrase} while staying within typical SAIS Grade ${profile.currentGrade} structure. Best for: ${whoIsThisPathFor(kind, profile)}.`,
  };
}

function buildLowerGradeGuidanceRecommendation(params: {
  kind: PathRecommendation["kind"];
  profile: StudentProfile;
}): PathRecommendation {
  const { kind, profile } = params;
  const targetPathway = determineTargetPathway(profile);
  const g = profile.currentGrade;
  const yr = g === 9 ? "Grade 9" : "Grade 10";
  const interestHint =
    profile.interests.length > 0
      ? `You mentioned ${profile.interests.slice(0, 3).join(", ")} — notice which classes make time fly vs. drag.`
      : "Notice which classes feel energizing vs. draining; that signal matters when you pick tracks later.";
  const strengthHint =
    profile.strengths.length > 0
      ? `You said you’re stronger in ${profile.strengths.slice(0, 3).join(", ")} — protect those with steady habits so they stay assets in Grade 11.`
      : "Build one reliable study habit (short daily review beats cramming) so Grade 11 choices aren’t a panic move.";
  const careerHint =
    profile.careerGoals.length > 0
      ? `Your early career ideas (${profile.careerGoals.slice(0, 2).join(", ")}) don’t lock you in — use ${yr} to sample related clubs or projects so Grade 11 picks feel grounded.`
      : "It’s fine not to know a career yet — use this year to try one new activity so you have real examples when you plan Grade 11.";

  const guidanceStory: ScoringFactorContribution[] = [
    {
      key: "interest_alignment",
      label: "Focus for this year",
      points: 10,
      evidence: [
        `${yr}: keep core grades healthy and pay attention to what you actually enjoy. ${interestHint}`,
      ],
    },
    {
      key: "pathway_alignment",
      label: "What changes in Grade 11",
      points: 9,
      evidence: [
        "At SAIS, the big forks — English, Science, and Math categories plus Set 1 and Set 2 electives — start in Grade 11. You’re not choosing those yet; you’re building the skills and self-knowledge that make those choices sane.",
      ],
    },
    {
      key: "strength_match",
      label: "Strengths & habits",
      points: 8,
      evidence: [strengthHint],
    },
    {
      key: "future_relevance",
      label: "Future you (without pressure)",
      points: 7,
      evidence: [careerHint],
    },
  ];

  return {
    kind,
    label: kind === "bestFit" ? "Optimal" : "Recommended",
    selections: { core: [], set1: [], set2: [], categorySelections: {} },
    score: 0,
    confidence: { overall: 0.82, factors: [] },
    rationale: {
      targetPathway,
      topContributingFactors: [...guidanceStory],
      factorBreakdown: [],
    },
    explanation: `You’re in ${yr}: SAIS still runs a shared core for everyone — the app isn’t picking electives for you yet. The useful part is knowing what to focus on now so Grade 11 (when English, Science, Math, and elective slots open up) doesn’t feel like a blind guess.`,
    selectionBecause: [],
    continuationSuggestions: [],
    whyMayNotFit: [],
    whyMayFeelHard: [
      "It’s normal to feel unsure in Grades 9–10 — that’s why we keep advice simple: habits, curiosity, and one honest counselor chat.",
      "If a subject feels constantly overwhelming, ask for help early; fixing it now is easier than digging out in Grade 11.",
    ],
    confidenceExplanation:
      "This page is guidance for Grades 9–10, not a generated schedule. Your counselor still places courses; we’re highlighting what actually matters before selection season.",
    hardRisks: [],
    softWarnings: [],
    tradeOffs: [
      "Locking into one “identity” too early can backfire; ignoring what you’re good at makes later picks feel random.",
      "Core math and science confidence still matter even when you’re not choosing APs yet.",
    ],
    alternatives: [
      "Curious about STEM later: keep math questions answered weekly and stay engaged in lab science.",
      "Thinking about many countries for university: stay flexible — you’ll map equivalency details closer to applications.",
      "Try one concrete project or club this year so you have stories when you plan Grade 11.",
    ],
    actionSteps: [
      "Book a short counselor chat — ask what Grade 11 category choices look like at SAIS.",
      "Pick one subject for a small upgrade (office hours, study buddy, weekly review).",
      "List two subjects you like and one that worries you; bring it to your next planning meeting.",
      "In Grade 11, run this planner again when you’re actually choosing categories and electives.",
    ],
    futureImpactSummary: `${yr} is about steady cores, honest interests, and habits — that combo makes Grade 11 decisions feel doable instead of overwhelming. Best for: SAIS students who want realistic prep, not fake precision.`,
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
    const weightModel = buildDynamicWeights({
      priorityStyle: profile.priorityStyle,
      optimizationTarget: profile.optimizationTarget,
      countryIntent: profile.countryIntent,
    });
    const emptyPlan: CandidatePlan = {
      categorySelections: {},
      core: [],
      set1: [],
      set2: [],
      score: {
        total: 0,
        factors: [],
        targetPathway: "undecided",
        topReasons: [],
        weightModel,
      },
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

