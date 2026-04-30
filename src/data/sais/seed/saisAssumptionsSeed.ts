/**
 * SAIS MVP Starter Assumptions (explicit)
 *
 * Confirmed inputs come from:
 * - PRD/Implementation/TechStack docs (MVP scope and rule shapes)
 * - The corrections you provided in this chat (grade-level structures + AP set placements)
 *
 * Set 1 / Set 2 + Grade 12 science inventories: see `confirmedSaisElectiveInventory.ts`,
 * `setElectiveCoursesSeed.ts`, and `categoryTemplatesSeed.ts`.
 *
 * Everything labeled ASSUMPTION is:
 * - a reasonable default for a pilot-grade deterministic engine
 * - designed to be easy to edit later
 * - NOT enforced as a hard prerequisite block unless it is explicitly confirmed
 */

export const saisAssumptionsSeed = {
  confirmed: [
    "Grades 9–10: no elective choice; Visual & Performing Arts is core",
    "Grades 11–12: each semester choose exactly 1 from Set 1 and 1 from Set 2",
    "Some APs replace core (Physics / English / Math examples)",
    "AP and Environmental Science are year-long (cannot drop mid-year)",
    "Grade 9: Integrated Math 1",
    "Grade 10: Integrated Math 2",
    "Biology 9 / Chemistry 10 progression awareness should exist in logic (as continuity/readiness signals)",
    "Grade 11 math options: Integrated Math 3, Pre-Calculus, Math for Business",
    "Grade 11 science options: Physics, AP Physics C1 (core replacement, year-long)",
    "Grade 11 English options: English 11, AP Language & Composition (core replacement, year-long)",
    "Grade 12 math (open planning): AP Calculus AB, AP Statistics, Calculus, Calculus for Business",
    "Grade 12: science is mandatory via science_category row (separate from Set 1/2)",
    "Fundamentals Math I/II: school-assigned; in intake/current-course only; not open recommendation paths",
    "Full Set 1 / Set 2 inventories: confirmed SAIS prompt (see seed files)",
    "Core replacement APs: AP Lang & Comp replaces English; AP Physics C1 replaces Physics; AP Calc AB replaces Math where relevant"
  ],
  assumptions: [
    "Core courses (math/science/english) are year-long unless otherwise indicated",
    "Thermodynamics and Organic Chemistry are semester electives (until SAIS confirms duration)",
    "Workload/rigor/relevance points are heuristics (1–5) for scoring transparency; adjust later to match SAIS reality"
  ],
  non_goals: [
    "No per-course Egypt/Jordan warning spam; country logic is evaluated only when selected, at rule/recommendation level",
    "No fake hard prerequisite blocks; readiness becomes soft warnings + scoring factors"
  ]
} as const;

