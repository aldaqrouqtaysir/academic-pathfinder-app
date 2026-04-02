import type { PathRecommendation } from "../models/recommendations";
import { getSelectedCountries, type StudentProfile } from "../models/studentProfile";

export interface ExplanationFactsInput {
  student: {
    studentId: string;
    currentGrade: number;
    targetCountries: string[];
    strengths: string[];
    weaknesses: string[];
    interests: string[];
    careerGoals: string[];
    workloadTolerance: string;
    riskPreference: string;
    scholarshipImportance: string;
    goalClarity: string;
  };
  path: {
    kind: PathRecommendation["kind"];
    label: PathRecommendation["label"];
    selections: PathRecommendation["selections"];
    score: number;
  };
  constraints: {
    hardRisks: string[];
    softWarnings: string[];
    tradeOffs: string[];
    alternatives: string[];
  };
  rationale: {
    targetPathway: string;
    topFactors: Array<{ label: string; points: number; evidence: string[] }>;
  };
  actionSteps: string[];
  futureImpact: string;
  confidence: {
    overall: number;
    factors: Array<{ label: string; value: number }>;
  };
  scoringPriority: {
    baseWeights: Record<string, number>;
    finalWeights: Record<string, number>;
    appliedAdjustments: string[];
  };
}

/**
 * Phase 1: keeps a deterministic, structured “facts” object for the AI layer.
 * Phase 2: will include grounded prerequisite/country compliance details.
 */
export function formatExplanationFactsForAI(params: {
  profile: StudentProfile;
  path: PathRecommendation;
}): ExplanationFactsInput {
  const { profile, path } = params;

  return {
    student: {
      studentId: profile.studentId,
      currentGrade: profile.currentGrade,
      targetCountries: getSelectedCountries(profile),
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      interests: profile.interests,
      careerGoals: profile.careerGoals,
      workloadTolerance: profile.workloadTolerance,
      riskPreference: profile.riskPreference,
      scholarshipImportance: profile.scholarshipImportance,
      goalClarity: profile.goalClarity,
    },
    path: {
      kind: path.kind,
      label: path.label,
      selections: path.selections,
      score: path.score,
    },
    constraints: {
      hardRisks: path.hardRisks,
      softWarnings: path.softWarnings,
      tradeOffs: path.tradeOffs,
      alternatives: path.alternatives,
    },
    rationale: {
      targetPathway: path.rationale.targetPathway,
      topFactors: path.rationale.topContributingFactors.map((f) => ({
        label: f.label,
        points: f.points,
        evidence: f.evidence,
      })),
    },
    actionSteps: path.actionSteps,
    futureImpact: path.futureImpactSummary,
    confidence: path.confidence,
    scoringPriority: {
      baseWeights: path.scoringWeightModel?.baseWeights ?? {},
      finalWeights: path.scoringWeightModel?.normalizedWeights ?? {},
      appliedAdjustments: path.scoringWeightModel?.appliedAdjustments ?? [],
    },
  };
}

