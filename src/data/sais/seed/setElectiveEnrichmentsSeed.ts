import type { Course } from "@/lib/domain/models/course";
import {
  SET1_SEMESTER1_CODES,
  SET1_SEMESTER2_CODES,
  SET2_SEMESTER1_CODES,
  SET2_SEMESTER2_CODES,
} from "./confirmedSaisElectiveInventory";

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

function inS1(code: string) {
  return (
    (SET1_SEMESTER1_CODES as readonly string[]).includes(code) ||
    (SET2_SEMESTER1_CODES as readonly string[]).includes(code)
  );
}
function inS2(code: string) {
  return (
    (SET1_SEMESTER2_CODES as readonly string[]).includes(code) ||
    (SET2_SEMESTER2_CODES as readonly string[]).includes(code)
  );
}

function semesterAvailabilityFor(code: string): ("Semester1" | "Semester2")[] {
  const a = inS1(code);
  const b = inS2(code);
  if (a && b) return ["Semester1", "Semester2"];
  if (a) return ["Semester1"];
  return ["Semester2"];
}

const cont = (to: string, kind: "recommended" | "optional" | "required", note: string) => [
  { toCourseCode: to, kind, note },
];

export const setElectiveEnrichmentsSeed: Record<string, Enrichment> = {
  AP_CHEM: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("AP_CHEM"),
    continuations: [{ toCourseCode: "AP_CHEM", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "very_high",
    rigorLevel: "very_high",
    perceivedDifficulty: "very_high",
    gradeSafetyLevel: "low",
    explorationValue: "medium",
  },
  PSYCH_I: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PSYCH_I"),
    continuations: cont("PSYCH_II", "recommended", "Natural Semester 2 continuation in Psychology."),
  },
  PSYCH_II: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PSYCH_II"),
    continuations: [],
  },
  GRAPHIC_DESIGN_I: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("GRAPHIC_DESIGN_I"),
    continuations: cont("GRAPHIC_DESIGN_II", "recommended", "Natural Semester 2 continuation in Graphic Design."),
  },
  GRAPHIC_DESIGN_II: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("GRAPHIC_DESIGN_II"),
    continuations: [],
  },
  PUBLIC_SPEAKING_DEBATE: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PUBLIC_SPEAKING_DEBATE"),
    continuations: [],
  },
  ARABIC_DRAMA: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("ARABIC_DRAMA"),
    continuations: [],
  },
  FORENSIC_SCI: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("FORENSIC_SCI"),
    continuations: [],
  },
  MICROECON: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("MICROECON"),
    continuations: cont("MACROECON", "recommended", "Macroeconomics is the natural Semester 2 follow-on."),
  },
  MACROECON: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("MACROECON"),
    continuations: [],
  },
  DATA_SCIENCE: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("DATA_SCIENCE"),
    continuations: [],
  },
  AI_I: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("AI_I"),
    continuations: cont("AI_II", "recommended", "Artificial Intelligence II in Semester 2 continues this track."),
  },
  AI_II: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("AI_II"),
    continuations: [],
  },
  INTL_LAW: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("INTL_LAW"),
    continuations: [],
  },
  INTERIOR_DESIGN_I: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("INTERIOR_DESIGN_I"),
    continuations: cont("INTERIOR_DESIGN_II", "recommended", "Natural Semester 2 continuation in Interior Design."),
  },
  INTERIOR_DESIGN_II: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("INTERIOR_DESIGN_II"),
    continuations: [],
  },
  SOCIOLOGY_I: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("SOCIOLOGY_I"),
    continuations: cont("SOCIOLOGY_II", "recommended", "Natural Semester 2 continuation in Sociology."),
  },
  SOCIOLOGY_II: {
    categoryKeys: ["set1_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("SOCIOLOGY_II"),
    continuations: [],
  },

  AP_BIO: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("AP_BIO"),
    continuations: [{ toCourseCode: "AP_BIO", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "very_high",
    rigorLevel: "very_high",
    perceivedDifficulty: "very_high",
    gradeSafetyLevel: "low",
    explorationValue: "medium",
  },
  AP_CSP: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("AP_CSP"),
    continuations: [{ toCourseCode: "AP_CSP", kind: "required", note: "Year-long AP continuation." }],
    workloadLevel: "high",
    rigorLevel: "high",
    perceivedDifficulty: "high",
    gradeSafetyLevel: "medium",
    explorationValue: "high",
  },
  DIGITAL_ART_I: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("DIGITAL_ART_I"),
    continuations: cont("DIGITAL_ART_II", "recommended", "Natural Semester 2 continuation in Digital Art."),
  },
  DIGITAL_ART_II: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("DIGITAL_ART_II"),
    continuations: [],
  },
  IAJJAZ_EL_AALMI: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("IAJJAZ_EL_AALMI"),
    continuations: [],
  },
  GENETICS: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("GENETICS"),
    continuations: cont("BIOMED_SCI", "recommended", "Biomedical Science is a natural Semester 2 continuation."),
  },
  BIOMED_SCI: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("BIOMED_SCI"),
    continuations: [],
  },
  HUMAN_ANATOMY_I: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("HUMAN_ANATOMY_I"),
    continuations: cont("HUMAN_ANATOMY_II", "recommended", "Natural Semester 2 continuation in Human Anatomy."),
  },
  HUMAN_ANATOMY_II: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("HUMAN_ANATOMY_II"),
    continuations: [],
  },
  ETHICAL_BUSINESS_LEADERSHIP: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("ETHICAL_BUSINESS_LEADERSHIP"),
    continuations: [],
  },
  PYTHON_PROG: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PYTHON_PROG"),
    continuations: [
      ...cont("BLOCKCHAIN_CRYPTO", "recommended", "Blockchain & Cryptocurrency is a common Semester 2 follow-on."),
    ],
  },
  BLOCKCHAIN_CRYPTO: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("BLOCKCHAIN_CRYPTO"),
    continuations: [],
  },
  PAINTING_SKETCHING_I: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PAINTING_SKETCHING_I"),
    continuations: cont("PAINTING_SKETCHING_II", "recommended", "Natural Semester 2 continuation in Painting & Sketching."),
  },
  PAINTING_SKETCHING_II: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("PAINTING_SKETCHING_II"),
    continuations: [],
  },
  ACCOUNTING: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("ACCOUNTING"),
    continuations: cont("MARKETING", "recommended", "Marketing is a natural Semester 2 continuation from Accounting."),
  },
  MARKETING: {
    categoryKeys: ["set2_elective"],
    gradeAvailability: [11, 12],
    semesterAvailability: semesterAvailabilityFor("MARKETING"),
    continuations: [],
  },
};
