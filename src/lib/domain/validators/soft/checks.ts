import { avg } from "@/lib/domain/scoring/helpers";
import type { SoftValidationInput } from "./types";
import { getSelectedCountries } from "@/lib/domain/models/studentProfile";

export function checkExcessiveWorkload(input: SoftValidationInput): string[] {
  const avgWorkload = avg(input.selected.all.map((c) => c.workloadPoints));
  const tolerance = input.profile.workloadTolerance;
  if ((tolerance === "Low" && avgWorkload > 3.1) || (tolerance === "Medium" && avgWorkload > 4.1)) {
    return [
      "This mix may feel heavier week-to-week than the workload level you said you want — talk it through with your counselor.",
    ];
  }
  return [];
}

export function checkWeakReadinessForAdvancedRigor(input: SoftValidationInput): string[] {
  const highRigorCount = input.selected.all.filter((c) => c.rigorPoints >= 5).length;
  const lowConfidence = input.profile.selfReportedAcademicConfidence === "Low";
  const hasMathWeakness = input.profile.weaknesses.map((w) => w.toLowerCase()).includes("math");
  if (highRigorCount >= 2 && (lowConfidence || hasMathWeakness)) {
    return [
      "You picked several demanding courses while also signaling lower confidence or math as a stretch area — pacing and support matter here.",
    ];
  }
  return [];
}

export function checkPoorInterestCareerAlignment(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "interest_alignment");
  const pathway = input.scoring.factors.find((f) => f.key === "pathway_alignment");
  if ((factor?.points ?? 0) < 6 || (pathway?.points ?? 0) < 8) {
    return ["A few choices don’t line up as tightly with the interests or career ideas you shared — you might swap one elective after talking with your counselor."];
  }
  return [];
}

export function checkScholarshipCompetitiveness(input: SoftValidationInput): string[] {
  if (input.profile.scholarshipImportance !== "High") return [];
  const factor = input.scoring.factors.find((f) => f.key === "scholarship_competitiveness");
  if ((factor?.points ?? 0) < 4.5) {
    return [
      "Because scholarships are important to you, you may want to compare this path with a slightly more rigorous alternative your counselor suggests.",
    ];
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
    return ["If you stay on this exact mix, some doors for your stated direction stay narrower — ask what one swap could open up."];
  }
  return [];
}

export function checkLowLearningStretch(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "learning_stretch");
  if ((factor?.points ?? 0) < 4.5) {
    return ["This path may feel a bit easy if you’re trying to grow — consider where one step-up course could help."];
  }
  return [];
}

export function checkUnnecessaryRigor(input: SoftValidationInput): string[] {
  const avgRigor = avg(input.selected.all.map((c) => c.rigorPoints));
  const avoidRisk = input.profile.riskPreference === "Avoid risk";
  const lowGoalClarity = input.profile.goalClarity === "Low";
  if (avgRigor >= 4.3 && (avoidRisk || lowGoalClarity)) {
    return ["Given how you said you like to take risks and how clear your goals are, this might be more intense than you need right now."];
  }
  return [];
}

export function checkLowRealWorldRelevance(input: SoftValidationInput): string[] {
  const factor = input.scoring.factors.find((f) => f.key === "real_world_relevance");
  if ((factor?.points ?? 0) < 5.5) {
    return ["If you love hands-on or applied learning, ask your counselor where a more project-based elective could fit later."];
  }
  return [];
}

