import type { ScoringFactorKey } from "../models/recommendations";
import type { CountryIntent, OptimizationTarget, PriorityStyle } from "../models/studentProfile";

export const SCORING_WEIGHTS: Record<ScoringFactorKey, number> = {
  interest_alignment: 0.14,
  strength_match: 0.1,
  workload_fit: 0.12,
  pathway_alignment: 0.16,
  country_alignment: 0.08,
  future_relevance: 0.12,
  learning_stretch: 0.1,
  real_world_relevance: 0.1,
  scholarship_competitiveness: 0.08,
};

export interface DynamicWeightResult {
  baseWeights: Record<ScoringFactorKey, number>;
  adjustedWeights: Record<ScoringFactorKey, number>;
  normalizedWeights: Record<ScoringFactorKey, number>;
  appliedAdjustments: string[];
}

function applyMultiplier(
  target: Record<ScoringFactorKey, number>,
  factor: ScoringFactorKey,
  multiplier: number,
) {
  target[factor] = target[factor] * multiplier;
}

export function buildDynamicWeights(params: {
  priorityStyle?: PriorityStyle;
  optimizationTarget?: OptimizationTarget;
  countryIntent: CountryIntent;
}): DynamicWeightResult {
  const adjusted = { ...SCORING_WEIGHTS };
  const notes: string[] = [];

  const style = params.priorityStyle ?? "not_sure";
  const target = params.optimizationTarget ?? "keeping_options_open";

  // Priority style adjustments (controlled multipliers)
  if (style === "strongest_path") {
    applyMultiplier(adjusted, "future_relevance", 1.2);
    applyMultiplier(adjusted, "pathway_alignment", 1.2);
    applyMultiplier(adjusted, "learning_stretch", 1.15);
    notes.push("priorityStyle=strongest_path increased future/pathway/stretch emphasis.");
  } else if (style === "balanced_path") {
    applyMultiplier(adjusted, "workload_fit", 1.1);
    applyMultiplier(adjusted, "interest_alignment", 1.1);
    notes.push("priorityStyle=balanced_path modestly increased workload and interest fit.");
  } else if (style === "safest_highest_grade") {
    applyMultiplier(adjusted, "workload_fit", 1.25);
    applyMultiplier(adjusted, "learning_stretch", 0.9);
    applyMultiplier(adjusted, "scholarship_competitiveness", 1.1);
    notes.push("priorityStyle=safest_highest_grade increased workload/grade stability and scholarship readiness.");
  } else {
    notes.push("priorityStyle=not_sure kept near-default balance.");
  }

  // Optimization target adjustments
  if (target === "career_alignment") {
    applyMultiplier(adjusted, "pathway_alignment", 1.25);
    applyMultiplier(adjusted, "future_relevance", 1.15);
    notes.push("optimizationTarget=career_alignment increased pathway/future relevance.");
  } else if (target === "lighter_workload") {
    applyMultiplier(adjusted, "workload_fit", 1.35);
    applyMultiplier(adjusted, "learning_stretch", 0.9);
    notes.push("optimizationTarget=lighter_workload increased workload-fit and reduced stretch pressure.");
  } else if (target === "university_competitiveness") {
    applyMultiplier(adjusted, "scholarship_competitiveness", 1.35);
    applyMultiplier(adjusted, "future_relevance", 1.2);
    applyMultiplier(adjusted, "learning_stretch", 1.1);
    notes.push("optimizationTarget=university_competitiveness increased scholarship/future/stretch emphasis.");
  } else if (target === "higher_grades") {
    applyMultiplier(adjusted, "workload_fit", 1.3);
    applyMultiplier(adjusted, "real_world_relevance", 0.95);
    notes.push("optimizationTarget=higher_grades increased workload-fit to reduce overloading.");
  } else {
    applyMultiplier(adjusted, "country_alignment", 1.1);
    applyMultiplier(adjusted, "interest_alignment", 1.05);
    notes.push("optimizationTarget=keeping_options_open increased country/interest flexibility.");
  }

  // Country intent adjustment
  if (params.countryIntent === "main_focus") {
    applyMultiplier(adjusted, "country_alignment", 1.25);
    notes.push("countryIntent=main_focus increased country alignment weight.");
  } else if (params.countryIntent === "keep_options_open") {
    applyMultiplier(adjusted, "country_alignment", 1.05);
    applyMultiplier(adjusted, "future_relevance", 1.05);
    notes.push("countryIntent=keep_options_open mildly increased country/future balance.");
  } else {
    notes.push("countryIntent=unsure kept country weighting near default.");
  }

  const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
  const normalized = Object.fromEntries(
    (Object.keys(adjusted) as ScoringFactorKey[]).map((k) => [k, adjusted[k] / sum]),
  ) as Record<ScoringFactorKey, number>;

  return {
    baseWeights: { ...SCORING_WEIGHTS },
    adjustedWeights: adjusted,
    normalizedWeights: normalized,
    appliedAdjustments: notes,
  };
}

