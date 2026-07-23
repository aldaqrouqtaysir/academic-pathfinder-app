/**
 * Current project course groupings used by the prototype.
 * They require counselor review before use as school policy.
 * Sustainability I/II omitted per stakeholder note (no Sustainability I; II ambiguous).
 */

/** Grade 11–12 math options for open planning/recommendations (not school-assigned fundamentals). */
export const G11_MATH_PLANNING_CODES = ["MATH_INT_3", "PRECALC", "MATH_BUSINESS"] as const;

/** Fundamentals Math I — intake / current-course only; excluded from open recommendation enumeration. */
export const G11_MATH_INTAKE_ONLY_CODES = ["FUND_MATH_I"] as const;

/** Grade 12 math for open planning (prompt list; no Calculus Foundation). */
export const G12_MATH_PLANNING_CODES = ["AP_CALC_AB", "AP_STATS", "CALCULUS", "CALC_BUSINESS"] as const;

export const G12_MATH_INTAKE_ONLY_CODES = ["FUND_MATH_II"] as const;

/** Set 1 — Semester 1 options (starts + year-long). */
export const SET1_SEMESTER1_CODES = [
  "AP_CHEM",
  "PSYCH_I",
  "GRAPHIC_DESIGN_I",
  "PUBLIC_SPEAKING_DEBATE",
  "ARABIC_DRAMA",
  "FORENSIC_SCI",
  "MICROECON",
  "DATA_SCIENCE",
  "INTL_LAW",
  "INTERIOR_DESIGN_I",
  "SOCIOLOGY_I",
  "AI_I",
] as const;

/** Set 1 — Semester 2 options (continuations + year-long + standalones). */
export const SET1_SEMESTER2_CODES = [
  "AP_CHEM",
  "PSYCH_II",
  "GRAPHIC_DESIGN_II",
  "PUBLIC_SPEAKING_DEBATE",
  "ARABIC_DRAMA",
  "FORENSIC_SCI",
  "MACROECON",
  "DATA_SCIENCE",
  "AI_II",
  "INTL_LAW",
  "INTERIOR_DESIGN_II",
  "SOCIOLOGY_II",
] as const;

/** Set 2 — Semester 1. */
export const SET2_SEMESTER1_CODES = [
  "AP_BIO",
  "AP_CSP",
  "DIGITAL_ART_I",
  "IAJJAZ_EL_AALMI",
  "GENETICS",
  "HUMAN_ANATOMY_I",
  "ETHICAL_BUSINESS_LEADERSHIP",
  "PYTHON_PROG",
  "PAINTING_SKETCHING_I",
  "ACCOUNTING",
] as const;

/** Set 2 — Semester 2. */
export const SET2_SEMESTER2_CODES = [
  "AP_BIO",
  "AP_CSP",
  "DIGITAL_ART_II",
  "IAJJAZ_EL_AALMI",
  "BIOMED_SCI",
  "HUMAN_ANATOMY_II",
  "ETHICAL_BUSINESS_LEADERSHIP",
  "PYTHON_PROG",
  "BLOCKCHAIN_CRYPTO",
  "PAINTING_SKETCHING_II",
  "ACCOUNTING",
  "MARKETING",
] as const;

/** Union of all Set 1 / Set 2 codes (catalog traceability). */
export const CONFIRMED_SET1_ELECTIVE_CODES = [
  ...new Set([...SET1_SEMESTER1_CODES, ...SET1_SEMESTER2_CODES]),
] as readonly string[];

export const CONFIRMED_SET2_ELECTIVE_CODES = [
  ...new Set([...SET2_SEMESTER1_CODES, ...SET2_SEMESTER2_CODES]),
] as readonly string[];

/** Grade 12 science row — Semester 1. */
export const G12_SCIENCE_CATEGORY_SEMESTER1_CODES = ["ENV_SCI", "THERMO", "ORG_CHEM"] as const;

/** Grade 12 science row — Semester 2. */
export const G12_SCIENCE_CATEGORY_SEMESTER2_CODES = ["ENV_SCI", "ELECTROMAG", "BIOCHEM"] as const;
