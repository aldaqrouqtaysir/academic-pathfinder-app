import type { Course } from "@/lib/domain/models/course";
import { set1Set2ElectiveCoursesSeed } from "./setElectiveCoursesSeed";
import { setElectiveEnrichmentsSeed } from "./setElectiveEnrichmentsSeed";

/**
 * SAIS starter seed course catalog (Phase 2) — SAIS-specific starter.
 *
 * What is confirmed from docs (used as real rules in code):
 * - Grades 9–10 do not choose electives (VPA is a core subject).
 * - Grades 11–12 choose exactly 1 elective from Set 1 + 1 from Set 2 each semester.
 * - Some APs replace core classes (examples: Physics / English / Math).
 * - AP and Environmental Science are year-long (cannot drop mid-year).
 *
 * Confirmed/required structure from project context (encoded here):
 * - Grade 9: Integrated Math 1, no elective choice, Visual & Performing Arts core
 * - Grade 10: Integrated Math 2, no elective choice, Visual & Performing Arts core
 * - Progression awareness: Biology 9 -> Chemistry 10 (represented later as continuity/readiness, not hard blocks)
 * - Grade 11 core options:
 *   - Math: Integrated Math 3 OR Pre-Calculus OR Math for Business
 *   - Science: Physics OR AP Physics C1 (core replacement, year-long)
 *   - English: English 11 OR AP Language & Composition (core replacement, year-long)
 * - Grade 12 core math options (open planning): AP Calculus AB, AP Statistics, Calculus, Calculus for Business
 * - Grade 12: science is mandatory and selected as a science elective (enforced via rules later)
 * - Grades 11–12 Set 1 / Set 2: full confirmed lists in `setElectiveCoursesSeed` + `confirmedSaisElectiveInventory`.
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
 * This seed is intentionally structured so you can replace it later without touching engine code.
 */

export const courseCatalogSeed: Course[] = [
  // -------------------------
  // Grade 9 / 10 core structure (confirmed)
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
    tags: ["STEM"],
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
    tags: ["STEM"],
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
  // Grade 11 core options (confirmed)
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.7, ai_tech: 0.6, business_finance: 0.4, medicine: 0.5, undecided: 0.5 },
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.8, ai_tech: 0.6, business_finance: 0.5, medicine: 0.6, undecided: 0.5 },
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
    tags: ["STEM", "Business"],
    pathwayAffinity: { business_finance: 0.9, engineering: 0.3, ai_tech: 0.3, undecided: 0.6 },
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
    tags: ["STEM"],
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
    tags: ["STEM", "Lab"],
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
    tags: ["Writing", "Humanities"],
    pathwayAffinity: { business_finance: 0.5, creative: 0.6, undecided: 0.6 },
  },

  // -------------------------
  // Core-replacement APs (confirmed)
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
    tags: ["Writing", "Humanities"],
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
    tags: ["STEM", "Lab"],
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.9, ai_tech: 0.6, medicine: 0.5, business_finance: 0.4 },
  },

  // -------------------------
  // Grade 12 core math options (confirmed list)
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
    tags: ["STEM"],
    pathwayAffinity: { business_finance: 0.8, ai_tech: 0.7, engineering: 0.5, medicine: 0.4, undecided: 0.6 },
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.8, ai_tech: 0.6, medicine: 0.5, business_finance: 0.4 },
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
    tags: ["STEM", "Business"],
    pathwayAffinity: { business_finance: 0.9, ai_tech: 0.4, engineering: 0.4, undecided: 0.6 },
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
    tags: ["STEM"],
    pathwayAffinity: { undecided: 0.7, business_finance: 0.55, medicine: 0.45, engineering: 0.4, ai_tech: 0.4, creative: 0.35 },
  },

  // -------------------------
  // Grades 11–12 Set 1 + Set 2 electives (confirmed lists — see setElectiveCoursesSeed)
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
    workloadPoints: 4,
    rigorPoints: 3,
    realWorldRelevancePoints: 5,
    futureRelevancePoints: 4,
    tags: ["STEM", "Research", "Health"],
    pathwayAffinity: { medicine: 0.6, engineering: 0.4, undecided: 0.6 },
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.8, ai_tech: 0.4, undecided: 0.3 },
  },
  {
    code: "ORG_CHEM",
    name: "Organic Chemistry",
    type: "elective",
    electiveSet: "Core",
    replacesCoreSubjects: [],
    yearLong: false, // ASSUMPTION: semester elective
    prerequisites: [],
    workloadPoints: 5,
    rigorPoints: 5,
    realWorldRelevancePoints: 4,
    futureRelevancePoints: 5,
    tags: ["STEM", "Lab", "Health"],
    pathwayAffinity: { medicine: 0.9, engineering: 0.4 },
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
    tags: ["STEM"],
    pathwayAffinity: { engineering: 0.8, ai_tech: 0.4, undecided: 0.3 },
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
    pathwayAffinity: { medicine: 0.8, engineering: 0.3, undecided: 0.3 },
  },

];

type Enrichment = Pick<
  Course,
  "categoryKeys" | "gradeAvailability" | "semesterAvailability" | "continuations" | "rigorLevel" | "perceivedDifficulty" | "workloadLevel"
>;

const enrichmentByCode: Record<string, Enrichment> = {
  ...setElectiveEnrichmentsSeed,
  // Grade 11 categories
  ENG_11: { categoryKeys: ["english_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  AP_LANG_COMP: {
    categoryKeys: ["english_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_LANG_COMP", kind: "required", note: "Year-long AP continuation." }],
  },
  PHYS_11: { categoryKeys: ["science_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  AP_PHYSICS_C1: {
    categoryKeys: ["science_category"],
    gradeAvailability: [11],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_PHYSICS_C1", kind: "required", note: "Year-long AP continuation." }],
  },
  MATH_INT_3: { categoryKeys: ["math_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  PRECALC: { categoryKeys: ["math_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  MATH_BUSINESS: { categoryKeys: ["math_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  FUND_MATH_I: { categoryKeys: ["math_category"], gradeAvailability: [11], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },

  // Grade 12 categories
  AP_CALC_AB: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_CALC_AB", kind: "required", note: "Year-long AP continuation." }],
  },
  AP_STATS: {
    categoryKeys: ["math_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "AP_STATS", kind: "recommended", note: "Typically year-long when offered." }],
  },
  CALCULUS: { categoryKeys: ["math_category"], gradeAvailability: [12], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  CALC_BUSINESS: { categoryKeys: ["math_category"], gradeAvailability: [12], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  FUND_MATH_II: { categoryKeys: ["math_category"], gradeAvailability: [12], semesterAvailability: ["Semester1", "Semester2"], continuations: [] },
  ENV_SCI: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [{ toCourseCode: "ENV_SCI", kind: "recommended", note: "Recommended continuation into Semester 2 unless switching improves fit." }],
  },
  THERMO: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [
      { toCourseCode: "ELECTROMAG", kind: "recommended", note: "Common Semester 2 continuation after Thermodynamics." },
      { toCourseCode: "BIOCHEM", kind: "optional", note: "Switching track is allowed when alignment improves." },
    ],
  },
  ORG_CHEM: {
    categoryKeys: ["science_category"],
    gradeAvailability: [12],
    semesterAvailability: ["Semester1", "Semester2"],
    continuations: [
      { toCourseCode: "BIOCHEM", kind: "recommended", note: "Common Semester 2 continuation after Organic Chemistry." },
      { toCourseCode: "ELECTROMAG", kind: "optional", note: "Switching track is allowed when alignment improves." },
    ],
  },
  ELECTROMAG: { categoryKeys: ["science_category"], gradeAvailability: [12], semesterAvailability: ["Semester2"], continuations: [] },
  BIOCHEM: { categoryKeys: ["science_category"], gradeAvailability: [12], semesterAvailability: ["Semester2"], continuations: [] },
};

function toLevel(points: 1 | 2 | 3 | 4 | 5): "low" | "medium" | "high" | "very_high" {
  if (points <= 2) return "low";
  if (points === 3) return "medium";
  if (points === 4) return "high";
  return "very_high";
}

export const categoryBasedCourseCatalogSeed: Course[] = courseCatalogSeed.map((course) => {
  const extra = enrichmentByCode[course.code] ?? {};
  return {
    ...course,
    ...extra,
    rigorLevel: extra.rigorLevel ?? toLevel(course.rigorPoints),
    perceivedDifficulty: extra.perceivedDifficulty ?? toLevel(course.rigorPoints),
    workloadLevel: extra.workloadLevel ?? toLevel(course.workloadPoints),
  };
});

