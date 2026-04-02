import { avg } from "@/lib/domain/scoring/helpers";
import type { SoftValidationInput } from "./types";
import { getSelectedCountries } from "@/lib/domain/models/studentProfile";

export function checkExcessiveWorkload(input: SoftValidationInput): string[] {
  const avgWorkload = avg(input.selected.all.map((c) => c.workloadPoints));
  const tolerance = input.profile.workloadTolerance;
  if ((tolerance === "Low" && avgWorkload > 3.1) || (tolerance === "Medium" && avgWorkload > 4.1)) {
    return [`Workload appears high (${avgWorkload.toFixed(1)}/5) relative to your declared tolerance (${tolerance}).`];
  }
  return [];
}

export function checkWeakReadinessForAdvancedRigor(input: SoftValidationInput): string[] {
  const highRigorCount = input.selected.all.filter((c) => c.rigorPoints >= 5).length;
  const lowConfidence = input.profile.selfReportedAcademicConfidence === "Low";
  const hasMathWeakness = input.profile.weaknesses.map((w) => w.toLowerCase()).includes("math");
  if (highRigorCount >= 2 && (lowConfidence || hasMathWeakness)) {
    return ["Plan includes multiple high-rigor courses while readiness signals suggest potential strain."];
  }
  return [];
}

export function checkPoorInterestCareerAlignment(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "interest_alignment");
  const pathway = input.scoring.factors.find((f) => f.key === "pathway_alignment");
  if ((factor?.points ?? 0) < 6 || (pathway?.points ?? 0) < 8) {
    return ["Selected plan shows weak alignment with stated interests/career goals."];
  }
  return [];
}

export function checkScholarshipCompetitiveness(input: SoftValidationInput): string[] {
  if (input.profile.scholarshipImportance !== "High") return [];
  const factor = input.scoring.factors.find((f) => f.key === "scholarship_competitiveness");
  if ((factor?.points ?? 0) < 4.5) {
    return ["Given scholarship importance, this plan may be less competitive than stronger alternatives."];
  }
  return [];
}

export function checkCountrySensitiveChoices(input: SoftValidationInput): string[] {
  const strictCountry = getSelectedCountries(input.profile).some((c) => c === "Egypt" || c === "Jordan");
  if (!strictCountry) return [];
  return [
    "Selected countries include Egypt/Jordan: verify equivalency/compliance with counselor for final pathway approval.",
  ];
}

export function checkLowFutureRelevance(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "future_relevance");
  if ((factor?.points ?? 0) < 6) {
    return ["Future relevance is relatively low for your stated direction."];
  }
  return [];
}

export function checkLowLearningStretch(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "learning_stretch");
  if ((factor?.points ?? 0) < 4.5) {
    return ["Learning stretch appears limited; the plan may be too easy for growth goals."];
  }
  return [];
}

export function checkUnnecessaryRigor(input: SoftValidationInput): string[] {
  const avgRigor = avg(input.selected.all.map((c) => c.rigorPoints));
  const avoidRisk = input.profile.riskPreference === "Avoid risk";
  const lowGoalClarity = input.profile.goalClarity === "Low";
  if (avgRigor >= 4.3 && (avoidRisk || lowGoalClarity)) {
    return ["This plan may be more rigorous than necessary for your current goals/risk preference."];
  }
  return [];
}

export function checkLowRealWorldRelevance(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "real_world_relevance");
  if ((factor?.points ?? 0) < 5.5) {
    return ["Real-world application relevance appears modest for your chosen direction."];
  }
  return [];
}

