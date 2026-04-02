import type { RecommendationBundle } from "../models/recommendations";
import type { RecommendationComputeInput } from "./types";
import { generateRecommendationBundle } from "../recommendations/generateRecommendationBundle";

export interface ComputeRecommendationsResult {
  bundle: RecommendationBundle;
}

export function computeRecommendations(input: RecommendationComputeInput): ComputeRecommendationsResult {
  const { profile, catalog, rules, scenario } = input;
  const bundle = generateRecommendationBundle({ profile, catalog, rules, scenario });
  return { bundle };
}

