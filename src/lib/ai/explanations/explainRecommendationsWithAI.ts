import type { ExplanationFactsInput } from "@/lib/domain/engine/explanationInputFormatter";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";

export interface ExplanationResult {
  bestFitRationaleText: string;
  balancedRationaleText: string;
  stretchRationaleText: string;
}

/**
 * Phase 1: deterministic placeholder.
 *
 * Docs require: AI is used only for explanation, summarization, and personalization of wording.
 * This function will NOT change the recommendations; it will only generate text.
 *
 * Phase 2 will integrate OpenAI using structured facts to prevent hallucination.
 */
export async function explainRecommendationsWithAI(params: {
  facts: {
    bestFit: ExplanationFactsInput;
    balanced: ExplanationFactsInput;
    stretch: ExplanationFactsInput;
  };
  _paths: {
    bestFit: PathRecommendation;
    balanced: PathRecommendation;
    stretch: PathRecommendation;
  };
}): Promise<ExplanationResult> {
  // Placeholder text until OpenAI integration.
  return {
    bestFitRationaleText:
      "Best-fit path selected using deterministic SAIS rule validation and scored alignment to your inputs. Phase 2 will replace this with grounded AI wording.",
    balancedRationaleText:
      "Balanced path chosen to match your goals while keeping workload and risk in a reasonable range. Phase 2 will replace this with grounded AI wording.",
    stretchRationaleText:
      "Stretch path emphasizes growth and academic stretch aligned to your preferences. Phase 2 will replace this with grounded AI wording and explicit trade-offs.",
  };
}

