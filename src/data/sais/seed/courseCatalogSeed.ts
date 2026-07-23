import type { Course } from "@/lib/domain/models/course";
import { set1Set2ElectiveCoursesSeed } from "./setElectiveCoursesSeed";
import { setElectiveEnrichmentsSeed } from "./setElectiveEnrichmentsSeed";

/**
 * SAIS-specific prototype course catalog.
 *
 * Current project inputs encoded by the prototype:
 * - Grades 9–10 do not choose electives (VPA is a core subject).
 * - Grades 11–12 choose exactly 1 elective from Set 1 + 1 from Set 2 each semester.
 * - Some APs replace core classes (examples: Physics / English / Math).
 * - AP and Environmental Science are year-long (cannot drop mid-year).
 *
 * Current structure from project context (encoded here):
 * - Grade 9: Integrated Math 1, no elective choice, Visual & Performing Arts core
 * - Grade 10: Integrated Math 2, no elective choice, Visual & Performing Arts core
 * - Progression awareness: Biology 9 -> Chemistry 10 (represented later as continuity/readiness, not hard blocks)
 * - Grade 11 core options:
 *   - Math: Integrated Math 3 OR Pre-Calculus OR Math for Business
 *   - Science: Physics OR AP Physics C1 (core replacement, year-long)
 *   - English: English 11 OR AP Language & Composition (core replacement, year-long)
 * - Grade 12 core math options (open planning): AP Calculus AB, AP Statistics, Calculus, Calculus for Business
 * - Grade 12: science is represented as a required science category in the current prototype.
 * - Grades 11–12 Set 1 / Set 2: current project lists are in `setElectiveCoursesSeed` + `confirmedSaisElectiveInventory`.
 * - Grade 12 science path (Environmental Science, Thermodynamics, Organic Chemistry, Electromagnetism,
 *   Biochemistry) uses the `science_category` template row, not Set 1/2; catalog marks them `electiveSet: Core`
 *   so mid-year continuity ties to core selections.
 * - Fundamentals Math I (11) / II (12): included in templates where SAIS offers a fundamentals track — confirm official titles with the school.
 *
 * Constraints:
 * - We do NOT encode “fake” hard prerequisites. Any readiness guidance becomes soft warnings/scoring only.
 *
 * Country logic:
 * - Egypt/Jordan logic is handled at rule/recommendation level only when selected.
 * - We do NOT attach broad per-course Egypt/Jordan warnings (avoid warning spam).
 *
 * These records and heuristic scoring fields require counselor review before
 * any controlled school pilot. They are not a complete policy publication.
 */

export const courseCatalogSeed: Course[] = [
  // -------------------------
  // Grade 9 / 10 core structure used by the current prototype
  // -------------------------
  {
    code: "VPA",
    name: "Visual & Performing Arts",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false,
    prerequisites: [],
    workloadPoints: 2,
    rigorPoints: 2,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 3,
    tags: ["Arts", "ProjectBased"],
    pathwayAffinity: { creative: 0.8, undecided: 0.4 },
  },
  {
    code: "MATH_INT_1",
    name: "Integrated Math 1",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION: core math runs year-long
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 4,
    tags: ["STEM", "Quantitative"],
    pathwayAffinity: { engineering: 0.4, ai_tech: 0.3, business_finance: 0.3, medicine: 0.3, undecided: 0.4 },
  },
  {
    code: "MATH_INT_2",
    name: "Integrated Math 2",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 4,
    tags: ["STEM", "Quantitative"],
    pathwayAffinity: { engineering: 0.5, ai_tech: 0.4, business_finance: 0.3, medicine: 0.4, undecided: 0.4 },
  },
  {
    code: "BIO_9",
    name: "Biology 9",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 4,
    tags: ["STEM", "Lab", "Health"],
    pathwayAffinity: { medicine: 0.6, engineering: 0.3, undecided: 0.4 },
  },
  {
    code: "CHEM_10",
    name: "Chemistry 10",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 4,
    tags: ["STEM", "Lab", "Health"],
    pathwayAffinity: { medicine: 0.6, engineering: 0.4, undecided: 0.4 },
  },

  // -------------------------
  // Grade 11 core options used by the current prototype
  // -------------------------
  {
    code: "MATH_INT_3",
    name: "Integrated Math 3",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 5,
    tags: ["STEM", "Quantitative"],
    pathwayAffinity: { engineering: 0.65, ai_tech: 0.55, business_finance: 0.4, medicine: 0.5, undecided: 0.55 },
  },
  {
    code: "PRECALC",
    name: "Pre-Calculus",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 5,
    tags: ["STEM", "Quantitative"],
    pathwayAffinity: { engineering: 0.88, ai_tech: 0.68, business_finance: 0.42, medicine: 0.62, undecided: 0.45 },
  },
  {
    code: "MATH_BUSINESS",
    name: "Math for Business / Business Math",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 5,
    futureRelevancePoints: 4,
    tags: ["Business", "AppliedMath"],
    pathwayAffinity: { business_finance: 0.92, engineering: 0.18, ai_tech: 0.2, medicine: 0.18, undecided: 0.52 },
  },
  {
    code: "FUND_MATH_I",
    name: "Fundamentals Math I",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true,
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 2,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 3,
    tags: ["STEM", "AppliedMath"],
    pathwayAffinity: { undecided: 0.7, business_finance: 0.5, medicine: 0.4, engineering: 0.35, ai_tech: 0.35, creative: 0.3 },
  },
  {
    code: "PHYS_11",
    name: "Physics",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Lab", "Quantitative"],
    pathwayAffinity: { engineering: 0.9, ai_tech: 0.4, medicine: 0.4, undecided: 0.5 },
  },
  {
    code: "ENG_11",
    name: "English 11",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 3,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 4,
    tags: ["Writing", "Humanities", "Communication"],
    pathwayAffinity: { business_finance: 0.5, creative: 0.6, undecided: 0.6 },
  },

  // -------------------------
  // Core-replacement APs represented by the current prototype
  // -------------------------
  {
    code: "AP_LANG_COMP",
    name: "AP Language & Composition",
    type: "AP",
    electiveSet: "Core",
    replacesCoreSubjects: ["English"],
    yearLong: true, // confirmed AP year-long
    prerequisites: [],
    workloadPoints: 5,
    rigorPoints: 5,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["Writing", "Humanities", "Communication"],
    pathwayAffinity: { business_finance: 0.5, creative: 0.6, undecided: 0.6 },
  },
  {
    code: "AP_PHYSICS_C1",
    name: "AP Physics C1",
    type: "AP",
    electiveSet: "Core",
    replacesCoreSubjects: ["Physics"],
    yearLong: true, // confirmed AP year-long
    prerequisites: [],
    workloadPoints: 5,
    rigorPoints: 5,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Lab", "Quantitative"],
    pathwayAffinity: { engineering: 1.0, ai_tech: 0.5, medicine: 0.3 },
  },
  {
    code: "AP_CALC_AB",
    name: "AP Calculus AB",
    type: "AP",
    electiveSet: "Core",
    replacesCoreSubjects: ["Math"],
    yearLong: true, // confirmed AP year-long
    prerequisites: [],
    workloadPoints: 5,
    rigorPoints: 5,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Quantitative", "AppliedMath"],
    pathwayAffinity: { engineering: 1.0, ai_tech: 0.82, medicine: 0.65, business_finance: 0.35, undecided: 0.25 },
  },

  // -------------------------
  // Grade 12 core math options in the current project list
  // -------------------------
  {
    code: "AP_STATS",
    name: "AP Statistics",
    type: "AP",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // confirmed AP year-long
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 5,
    futureRelevancePoints: 5,
    tags: ["STEM", "Data", "AppliedMath", "Business", "Health", "SocialScience"],
    pathwayAffinity: { business_finance: 0.9, ai_tech: 0.75, engineering: 0.48, medicine: 0.65, undecided: 0.68 },
  },
  {
    code: "CALCULUS",
    name: "Calculus",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Quantitative", "AppliedMath"],
    pathwayAffinity: { engineering: 0.78, ai_tech: 0.58, medicine: 0.55, business_finance: 0.42, undecided: 0.52 },
  },
  {
    code: "CALC_BUSINESS",
    name: "Calculus for Business",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // ASSUMPTION
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 5,
    futureRelevancePoints: 5,
    tags: ["Business", "AppliedMath"],
    pathwayAffinity: { business_finance: 0.94, ai_tech: 0.2, engineering: 0.18, medicine: 0.18, undecided: 0.48 },
  },
  {
    code: "FUND_MATH_II",
    name: "Fundamentals Math II",
    type: "core",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true,
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 2,
    realWorldRelevancePoints: 3,
    futureRelevancePoints: 3,
    tags: ["STEM", "AppliedMath"],
    pathwayAffinity: { undecided: 0.7, business_finance: 0.55, medicine: 0.45, engineering: 0.4, ai_tech: 0.4, creative: 0.35 },
  },

  // -------------------------
  // Grades 11–12 Set 1 + Set 2 electives (current project lists; see setElectiveCoursesSeed)
  // -------------------------
  ...set1Set2ElectiveCoursesSeed,

  // Grade 12 science_category row (not Set 1 elective slot)
  {
    code: "ENV_SCI",
    name: "Environmental Science",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: true, // confirmed year-long
    prerequisites: [],
    workloadPoints: 3,
    rigorPoints: 3,
    realWorldRelevancePoints: 5,
    futureRelevancePoints: 4,
    tags: ["STEM", "Research", "Health", "Environmental", "SocialScience"],
    pathwayAffinity: { medicine: 0.45, engineering: 0.35, business_finance: 0.35, creative: 0.25, undecided: 0.72 },
  },
  {
    code: "THERMO",
    name: "Thermodynamics",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false, // ASSUMPTION: semester elective
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 4,
    tags: ["STEM", "Quantitative", "Lab"],
    pathwayAffinity: { engineering: 0.88, ai_tech: 0.45, medicine: 0.25, undecided: 0.25 },
  },
  {
    code: "ORG_CHEM",
    name: "Organic Chemistry",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false, // ASSUMPTION: semester elective
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Lab", "Health"],
    pathwayAffinity: { medicine: 0.92, engineering: 0.32, undecided: 0.2 },
  },
  {
    code: "ELECTROMAG",
    name: "Electromagnetism",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false,
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 4,
    tags: ["STEM", "Quantitative", "Lab"],
    pathwayAffinity: { engineering: 0.88, ai_tech: 0.48, medicine: 0.25, undecided: 0.25 },
  },
  {
    code: "BIOCHEM",
    name: "Biochemistry",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false,
    prerequisites: [],
    workloadPoints: 4,
    rigorPoints: 4,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Lab", "Health"],
    pathwayAffinity: { medicine: 0.88, engineering: 0.28, undecided: 0.25 },
  },

];

type Enrichment = Pick<
  Course,
  | "categoryKeys"
  | "gradeAvailability"
  | "semesterAvailability"
  | "continuations"
  | "rigorLevel"
  | "perceivedDifficulty"
  | "workloadLevel"
  | "gradeSafetyLevel"
  | "explorationValue"
>;

const enrichmentByCode: Record<string, Enrichment> = {
  ...setElectiveEnrichmentsSeed,
  // Grade 11 categories
  ENG_11: {
    categoryKeys: ["english_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "medium",
    explorationValue: "medium",
  },
  AP_LANG_COMP: {
    categoryKeys: ["english_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_LANG_COMP", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "very_high",
    rigorLevel: "very_high",
    perceivedDifficulty: "very_high",
    gradeSafetyLevel: "low",
    explorationValue: "medium",
  },
  PHYS_11: {
    categoryKeys: ["science_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "medium",
    explorationValue: "medium",
  },
  AP_PHYSICS_C1: {
    categoryKeys: ["science_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_PHYSICS_C1", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "very_high",
    rigorLevel: "very_high",
    perceivedDifficulty: "very_high",
    gradeSafetyLevel: "low",
    explorationValue: "low",
  },
  MATH_INT_3: {
    categoryKeys: ["math_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "medium",
    explorationValue: "medium",
  },
  PRECALC: {
    categoryKeys: ["math_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "medium",
    explorationValue: "low",
  },
  MATH_BUSINESS: {
    categoryKeys: ["math_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "high",
    explorationValue: "medium",
  },
  FUND_MATH_I: {
    categoryKeys: ["math_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "high",
    explorationValue: "low",
  },

  // Grade 12 categories
  AP_CALC_AB: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_CALC_AB", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "very_high",
    rigorLevel: "very_high",
    perceivedDifficulty: "very_high",
    gradeSafetyLevel: "low",
    explorationValue: "low",
  },
  AP_STATS: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_STATS", kind: "recommended", note: "Typically year-long when offered." }],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "high",
  },
  CALCULUS: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "medium",
    explorationValue: "medium",
  },
  CALC_BUSINESS: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    workloadLevel: "medium",
    rigorLevel: "medium",
    perceivedDifficulty: "medium",
    gradeSafetyLevel: "high",
    explorationValue: "medium",
  },
  FUND_MATH_II: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [],
    gradeSafetyLevel: "high",
    explorationValue: "low",
  },
  ENV_SCI: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "ENV_SCI", kind: "recommended", note: "Recommended continuation into Semester 2 unless switching improves fit." }],
    workloadLevel: "medium",
    rigorLevel: "medium",
    perceivedDifficulty: "medium",
    gradeSafetyLevel: "high",
    explorationValue: "high",
  },
  THERMO: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [
      { toCourseCode: "ELECTROMAG", kind: "recommended", note: "Common Semester 2 continuation after Thermodynamics." },
      { toCourseCode: "BIOCHEM", kind: "optional", note: "Switching track is allowed when alignment improves." },
    ],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "low",
  },
  ORG_CHEM: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [
      { toCourseCode: "BIOCHEM", kind: "recommended", note: "Common Semester 2 continuation after Organic Chemistry." },
      { toCourseCode: "ELECTROMAG", kind: "optional", note: "Switching track is allowed when alignment improves." },
    ],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "low",
  },
  ELECTROMAG: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester2"],
    continuations: [],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "low",
  },
  BIOCHEM: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester2"],
    continuations: [],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "low",
  },
};

function toLevel(points: 1 | 2 | 3 | 4 | 5): "low" | "medium" | "high" | "very_high" {
  if (points <= 2) return "low";
  if (points === 3) return "medium";
  if (points === 4) return "high";
  return "very_high";
}

function toGradeSafety(course: Course): "low" | "medium" | "high" {
  const intensity = (course.workloadPoints + course.rigorPoints) / 2;
  if (intensity <= 3) return "high";
  if (intensity <= 4) return "medium";
  return "low";
}

function toExplorationValue(course: Course): "low" | "medium" | "high" {
  if ((course.pathwayAffinity.undecided ?? 0) >= 0.65) return "high";
  if (course.tags.some((tag) => ["Data", "SocialScience", "Communication", "ProjectBased", "Environmental"].includes(tag))) {
    return "high";
  }
  if ((course.pathwayAffinity.undecided ?? 0) >= 0.45) return "medium";
  if (course.type === "AP" && course.rigorPoints >= 5) return "low";
  return "medium";
}

export const categoryBasedCourseCatalogSeed: Course[] = courseCatalogSeed.map((course) => {
  const extra = enrichmentByCode[course.code] ?? {};
  return {
    ...course,
    ...extra,
    rigorLevel: extra.rigorLevel ?? toLevel(course.rigorPoints),
    perceivedDifficulty: extra.perceivedDifficulty ?? toLevel(course.rigorPoints),
    workloadLevel: extra.workloadLevel ?? toLevel(course.workloadPoints),
    gradeSafetyLevel: extra.gradeSafetyLevel ?? toGradeSafety(course),
    explorationValue: extra.explorationValue ?? toExplorationValue(course),
  };
});
