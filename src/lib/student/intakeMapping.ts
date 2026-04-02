import type { StudentProfile } from "@/lib/domain/models/studentProfile";
import type { ScenarioAdjustments, Semester } from "@/lib/domain/models/session";
import type { StudentGrade } from "@/lib/domain/models/common";

export interface IntakePayload {
  currentGrade: StudentGrade;
  semester: Semester;
  currentCourses: string[];
  currentAPs: string[];
  strengths: StudentProfile["strengths"];
  weaknesses: StudentProfile["weaknesses"];
  selfReportedAcademicConfidence: StudentProfile["selfReportedAcademicConfidence"];
  workloadTolerance: StudentProfile["workloadTolerance"];
  interests: string[];
  careerGoals: string[];
  goalClarity: StudentProfile["goalClarity"];
  mainCountry: StudentProfile["mainCountry"];
  additionalCountries: StudentProfile["additionalCountries"];
  countryIntent: StudentProfile["countryIntent"];
  priorityStyle?: StudentProfile["priorityStyle"];
  optimizationTarget?: StudentProfile["optimizationTarget"];
  preferencesToAvoid: string[];
  preferences: string[];
  futurePlans: string;
  riskPreference: StudentProfile["riskPreference"];
  scholarshipImportance: StudentProfile["scholarshipImportance"];
}

export function mapIntakeToProfile(studentId: string, intake: IntakePayload): StudentProfile {
  return {
    studentId,
    currentGrade: intake.currentGrade,
    currentCourses: intake.currentCourses,
    currentAPs: intake.currentAPs,
    mainCountry: intake.mainCountry,
    additionalCountries: intake.additionalCountries,
    countryIntent: intake.countryIntent,
    targetCountries: [intake.mainCountry, ...intake.additionalCountries],
    strengths: intake.strengths,
    weaknesses: intake.weaknesses,
    interests: intake.interests,
    careerGoals: intake.careerGoals,
    goalClarity: intake.goalClarity,
    workloadTolerance: intake.workloadTolerance,
    riskPreference: intake.riskPreference,
    scholarshipImportance: intake.scholarshipImportance,
    futurePlans: intake.futurePlans,
    preferencesToAvoid: intake.preferencesToAvoid,
    preferences: intake.preferences,
    selfReportedAcademicConfidence: intake.selfReportedAcademicConfidence,
    desiredCourseYear: intake.semester === "Semester1" ? "Now" : "Next",
    priorityStyle: intake.priorityStyle,
    optimizationTarget: intake.optimizationTarget,
  };
}

export function mapIntakeToScenario(intake: IntakePayload): ScenarioAdjustments {
  return {
    semester: intake.semester,
    isMidYear: intake.semester === "Semester2",
    preferLowerWorkload: intake.optimizationTarget === "lighter_workload",
  };
}

