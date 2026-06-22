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

function profileText(profile: StudentProfile): string {
  return [
    ...profile.interests,
    ...profile.careerGoals,
    profile.futurePlans,
    ...profile.preferences,
    ...profile.preferencesToAvoid,
  ]
    .join(" ")
    .toLowerCase();
}

function safety01(level: "low" | "medium" | "high" | undefined, fallbackPoints: number): number {
  if (level === "high") return 1;
  if (level === "medium") return 0.65;
  if (level === "low") return 0.25;
  return clamp01(1 - (fallbackPoints - 1) / 4);
}

function exploration01(level: "low" | "medium" | "high" | undefined): number {
  if (level === "high") return 1;
  if (level === "medium") return 0.65;
  if (level === "low") return 0.25;
  return 0.5;
}

function wantsSaferPath(profile: StudentProfile): boolean {
  return (
    profile.workloadTolerance === "Low" ||
    profile.riskPreference === "Avoid risk" ||
    profile.priorityStyle === "safest_highest_grade" ||
    profile.optimizationTarget === "lighter_workload" ||
    profile.optimizationTarget === "higher_grades"
  );
}

function wantsCompetitivePath(profile: StudentProfile): boolean {
  return (
    profile.workloadTolerance === "High" ||
    profile.riskPreference === "Embrace stretch" ||
    profile.priorityStyle === "strongest_path" ||
    profile.optimizationTarget === "university_competitiveness"
  );
}

function hasStrongMathSignal(profile: StudentProfile, text: string): boolean {
  return (
    profile.strengths.includes("Math") ||
    profile.strengths.includes("Coding") ||
    containsAny(text, ["engineering", "physics", "computer", "coding", "software", "ai", "math", "stem"])
  );
}

function hasBusinessSignal(text: string): boolean {
  return containsAny(text, ["business", "finance", "economics", "econ", "accounting", "marketing", "management"]);
}

function hasStatsSignal(text: string): boolean {
  return containsAny(text, [
    "data",
    "statistics",
    "analytics",
    "psychology",
    "business",
    "finance",
    "economics",
    "health",
    "medicine",
    "social science",
    "research",
  ]);
}

function isStemPathway(pathway: ReturnType<typeof determineTargetPathway>): boolean {
  return pathway === "engineering" || pathway === "ai_tech" || pathway === "medicine";
}

function isAdvancedStemScience(course: Course): boolean {
  return ["THERMO", "ELECTROMAG", "ORG_CHEM", "BIOCHEM", "AP_CHEM", "AP_BIO", "AP_PHYSICS_C1"].includes(course.code);
}

function adjustedPathwayAffinity(params: {
  course: Course;
  key: PlanCategoryKey;
  base: number;
  profile: StudentProfile;
  targetPathway: ReturnType<typeof determineTargetPathway>;
  text: string;
}): number {
  const { course, key, profile, targetPathway, text } = params;
  const safer = wantsSaferPath(profile);
  const competitive = wantsCompetitivePath(profile);
  const strongMath = hasStrongMathSignal(profile, text);
  const business = hasBusinessSignal(text) || targetPathway === "business_finance";
  const stats = hasStatsSignal(text);
  const safety = safety01(course.gradeSafetyLevel, course.workloadPoints);
  const exploration = exploration01(course.explorationValue);
  let base = params.base;

  if (key === "math_category") {
    if (course.code === "AP_CALC_AB") {
      if (isStemPathway(targetPathway) && strongMath && competitive) base += 0.2;
      if (safer && !strongMath) base -= 0.14;
    } else if (course.code === "AP_STATS") {
      if (stats || targetPathway === "business_finance" || targetPathway === "medicine") base += 0.16;
      if (targetPathway === "undecided" || profile.goalClarity === "Low") base += 0.12;
      if (targetPathway === "engineering" && competitive && strongMath && !stats) base -= 0.08;
    } else if (course.code === "CALCULUS") {
      base += targetPathway === "undecided" ? 0.08 : 0.04;
      if (isStemPathway(targetPathway) && !safer) base += 0.08;
    } else if (course.code === "CALC_BUSINESS" || course.code === "MATH_BUSINESS") {
      if (business) base += 0.18;
      if (safer) base += business ? 0.1 : 0.03;
      if (isStemPathway(targetPathway) && competitive) base -= 0.28;
      if (!business && (targetPathway === "undecided" || profile.goalClarity === "Low")) base -= 0.12;
    } else if (course.code === "PRECALC") {
      if (isStemPathway(targetPathway) && strongMath) base += 0.12;
    }
  }

  if (key === "science_category") {
    if (course.code === "ENV_SCI") {
      if (safer) base += 0.22;
      if (targetPathway === "undecided" || profile.goalClarity === "Low") base += 0.1;
      if (isStemPathway(targetPathway) && competitive && !safer) base -= 0.2;
    } else if (["THERMO", "ELECTROMAG"].includes(course.code)) {
      if (targetPathway === "engineering" || containsAny(text, ["engineering", "physics", "mechanical", "electrical"])) base += 0.2;
      if (!isStemPathway(targetPathway) || safer) base -= 0.2;
    } else if (["ORG_CHEM", "BIOCHEM"].includes(course.code)) {
      if (targetPathway === "medicine" || containsAny(text, ["medicine", "doctor", "health", "biology", "chemistry", "pre-med"])) base += 0.2;
      if (!isStemPathway(targetPathway) || safer) base -= 0.18;
    } else if (isAdvancedStemScience(course) && (!isStemPathway(targetPathway) || safer)) {
      base -= 0.16;
    }
  }

  if ((targetPathway === "undecided" || profile.goalClarity === "Low" || profile.optimizationTarget === "keeping_options_open") && key !== "science_category") {
    base = base * 0.82 + exploration * 0.18;
  }

  if (safer) {
    base = base * 0.88 + safety * 0.12;
  }

  return clamp01(base);
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
  const allProfileText = profileText(profile);
  const interestText = profile.interests.join(" ").toLowerCase();
  const goalText = profile.careerGoals.join(" ").toLowerCase();

  const avgWorkload = avg(selectedCourses.map((c) => c.workloadPoints));
  const avgRigor = avg(selectedCourses.map((c) => c.rigorPoints));
  const avgSafety = avg(selectedCourses.map((c) => safety01(c.gradeSafetyLevel, c.workloadPoints)));
  const avgExploration = avg(selectedCourses.map((c) => exploration01(c.explorationValue)));
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
  const baseWorkloadNorm = clamp01(1 - Math.abs(avgWorkload - desiredWorkload) / 3);
  const workloadNorm = wantsSaferPath(profile) ? clamp01(baseWorkloadNorm * 0.6 + avgSafety * 0.4) : baseWorkloadNorm;

  // Pathway/career alignment with category-role impact
  const pathwayNorm = avg(
    (categoryCourses.length > 0 ? categoryCourses : selectedCourses.map((course) => ({ key: "set1_elective" as PlanCategoryKey, course }))).map(({ key, course }) => {
      const base = course.pathwayAffinity[targetPathway] ?? 0;
      const roleWeight = key === "math_category" || key === "science_category" || key === "english_category" ? 1.15 : 1;
      return adjustedPathwayAffinity({ course, key, base: Math.min(1, base * roleWeight), profile, targetPathway, text: allProfileText });
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
  const apRigorNorm = avg(
    selectedCourses.map((c) => (c.type === "AP" ? (c.rigorPoints >= 5 ? 1 : 0.82) : c.rigorPoints >= 4 ? 0.65 : 0.35)),
  );
  const scholarshipBase = clamp01((avgRigor / 5 + avgFuture + apRigorNorm) / 3);
  const scholarshipNorm = profile.scholarshipImportance === "High" ? scholarshipBase : 0.8 * scholarshipBase + 0.2;

  const interestLine =
    profile.interests.length > 0
      ? `Several of your picks connect to interests you mentioned (${profile.interests.slice(0, 3).join(", ")}).`
      : "We looked at how well this mix lines up with what students usually enjoy in each subject area.";
  const strengthLine =
    profile.strengths.length > 0
      ? `Your stated strengths (${profile.strengths.slice(0, 4).join(", ")}) show up in useful places in this schedule.`
      : "This path doesn’t assume a specific strength profile — it stays balanced across subjects.";

  const factors: ScoringFactorContribution[] = [
    contribution(weightModel.normalizedWeights, "interest_alignment", "Interest alignment", interestNorm, [
      interestNorm >= 0.55
        ? "This combination lines up well with the subjects and themes you said you care about."
        : "Some courses match your interests more closely than others — worth a second look if something feels off.",
      interestLine,
    ]),
    contribution(weightModel.normalizedWeights, "strength_match", "Strength match", strengthNorm, [
      strengthNorm >= 0.55
        ? "The plan leans on areas where you’re more likely to feel confident."
        : "You may want extra support in a few spots where the load doesn’t match your strongest subjects.",
      strengthLine,
    ]),
    contribution(weightModel.normalizedWeights, "workload_fit", "Workload fit", workloadNorm, [
      workloadNorm >= 0.55
        ? "Overall intensity feels aligned with how much you said you want on your plate."
        : "This may feel a bit heavier or lighter than your comfort zone — adjust with your counselor if needed.",
      profile.workloadTolerance === "Low"
        ? "You indicated you prefer a lighter load; we weighted safer, lower-workload choices accordingly."
        : profile.workloadTolerance === "High"
          ? "You said you can handle more; this path can include more demanding combinations."
          : "You chose a middle-ground workload preference.",
    ]),
    contribution(weightModel.normalizedWeights, "pathway_alignment", "Career/pathway alignment", pathwayNorm, [
      pathwayNorm >= 0.55
        ? `Course choices support the direction we’re seeing (${String(targetPathway).replace(/_/g, " ")}).`
        : "If your career ideas shift, a few swaps could sharpen the fit — that’s normal.",
      profile.careerGoals.length > 0
        ? `Your career ideas (${profile.careerGoals.slice(0, 2).join(", ")}) helped guide this mix.`
        : avgExploration >= 0.65
          ? "Because you’re still exploring careers, we favored choices that keep useful doors open."
          : "Because you’re still exploring careers, we kept the path flexible where we could.",
    ]),
    contribution(weightModel.normalizedWeights, "country_alignment", "Country alignment", countryNorm, [
      hasStrictCountries
        ? "For Egypt/Jordan goals, this leans toward broadly recognized, rigorous options counselors often highlight."
        : "For UAE, US, or similar destinations, you have more flexibility — this path keeps doors open.",
      selectedCountries.length > 0 ? `Destination focus: ${selectedCountries.join(", ")}.` : "",
    ].filter(Boolean)),
    contribution(weightModel.normalizedWeights, "future_relevance", "Future relevance", avgFuture, [
      avgFuture >= 0.55
        ? "These courses tend to keep future university and career options open."
        : "Some choices are more specialized — great if you’re sure, less so if you want maximum flexibility.",
      goalText ? "We considered how your stated goals show up in subject choices." : "",
    ].filter(Boolean)),
    contribution(weightModel.normalizedWeights, "learning_stretch", "Learning stretch", stretchNorm, [
      stretchNorm >= 0.55
        ? "Challenge level looks reasonable compared with how confident you said you feel academically."
        : "This may feel like a stretch — or softer than you want — depending on how school feels this year.",
      profile.riskPreference === "Embrace stretch"
        ? "You said you’re open to stretch; this path can include tougher combinations."
        : profile.riskPreference === "Avoid risk"
          ? "You preferred playing it safe; we avoided unnecessary extra risk where possible."
          : "You wanted a balanced risk level between comfort and growth.",
    ]),
    contribution(weightModel.normalizedWeights, "real_world_relevance", "Real-world application relevance", avgRealWorld, [
      avgRealWorld >= 0.55
        ? "Several courses connect clearly to real-world skills and projects."
        : "If you love hands-on work, ask your counselor where you can add more applied courses later.",
    ]),
    contribution(weightModel.normalizedWeights, "scholarship_competitiveness", "Scholarship competitiveness", scholarshipNorm, [
      profile.scholarshipImportance === "High"
        ? "Because scholarships matter to you, we favored a profile that stays competitive without guessing aid outcomes."
        : "Scholarships are one factor among many here — not the only driver of this plan.",
      scholarshipNorm >= 0.55
        ? "This mix still looks solid if you’re thinking about competitive applications later."
        : "If scholarships become a top priority later, you may want to revisit rigor with your counselor.",
    ]),
  ];

  const total = Math.round(factors.reduce((sum, f) => sum + f.points, 0) * 10) / 10;
  const topReasons = [...factors]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .flatMap((f) => f.evidence.slice(0, 1));

  return { total, factors, topReasons, targetPathway, weightModel };
}
