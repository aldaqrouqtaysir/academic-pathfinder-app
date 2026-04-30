import type { PathwayId } from "./course";
import type { PlanCategoryKey } from "./course";

export type RecommendationPathKind = "bestFit" | "balanced" | "stretch";
export type RecommendationLabel = "Allowed" | "Recommended" | "Optimal";

export type ScoringFactorKey =
  | "interest_alignment"
  | "strength_match"
  | "workload_fit"
  | "country_alignment"
  | "future_relevance"
  | "learning_stretch"
  | "real_world_relevance"
  | "pathway_alignment"
  | "scholarship_competitiveness";

export interface ScoringFactorContribution {
  key: ScoringFactorKey;
  label: string;
  points: number;
  evidence: string[]; // deterministic bullets to ground later AI explanations
}

export interface RecommendationRationale {
  targetPathway: PathwayId;
  topContributingFactors: ScoringFactorContribution[]; // already sorted high->low
  factorBreakdown: ScoringFactorContribution[]; // full list
}

export interface RecommendationSelection {
  core: string[]; // selected core/core-replacement course codes in this plan context
  set1: string[]; // course codes
  set2: string[]; // course codes
  // Category-based view (new canonical form)
  categorySelections?: Partial<Record<PlanCategoryKey, string>>;
}

export interface PathRecommendation {
  kind: RecommendationPathKind;
  label: RecommendationLabel;

  selections: RecommendationSelection;

  score: number; // deterministic score
  confidence: {
    overall: number; // 0..1
    factors: Array<{ label: string; value: number }>;
  };

  rationale: RecommendationRationale;
  explanation: string;
  /** Student-facing lines tying each category pick (and path kind) to profile answers — not scoring jargon. */
  selectionBecause?: string[];
  continuationSuggestions: Array<{
    fromCourseCode: string;
    toCourseCode: string;
    kind: "recommended" | "optional" | "not_recommended" | "required";
    note?: string;
  }>;
  whyMayNotFit: string[];
  whyMayFeelHard: string[];
  confidenceExplanation: string;
  scoringWeightModel?: {
    baseWeights: Record<string, number>;
    adjustedWeights: Record<string, number>;
    normalizedWeights: Record<string, number>;
    appliedAdjustments: string[];
  };

  hardRisks: string[]; // “hard” risks should be empty if blocked options filtered out
  softWarnings: string[];
  tradeOffs: string[];
  alternatives: string[];
  actionSteps: string[];
  futureImpactSummary: string;
}

export interface RecommendationBundle {
  bestFit: PathRecommendation;
  balanced: PathRecommendation;
  stretch: PathRecommendation;
}

