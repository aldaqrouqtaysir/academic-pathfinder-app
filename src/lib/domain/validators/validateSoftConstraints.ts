import type { RuleKey } from "../models/rules";
import type { SoftValidationInput } from "./soft/types";
import {
  checkCountrySensitiveChoices,
  checkExcessiveWorkload,
  checkLowFutureRelevance,
  checkLowLearningStretch,
  checkLowRealWorldRelevance,
  checkPoorInterestCareerAlignment,
  checkScholarshipCompetitiveness,
  checkUnnecessaryRigor,
  checkWeakReadinessForAdvancedRigor,
} from "./soft/checks";

export interface SoftValidationResult {
  softWarnings: string[];
  triggeredRuleKeys: RuleKey[];
}

/**
 * Deterministic soft constraints (warnings only, no blocking).
 */
export function validateSoftConstraints(input: SoftValidationInput): SoftValidationResult {
  const softWarnings: string[] = [];
  const triggeredRuleKeys: RuleKey[] = [];

  const warningGroups = [
    checkExcessiveWorkload(input),
    checkWeakReadinessForAdvancedRigor(input),
    checkPoorInterestCareerAlignment(input),
    checkScholarshipCompetitiveness(input),
    checkCountrySensitiveChoices(input),
    checkLowFutureRelevance(input),
    checkLowLearningStretch(input),
    checkUnnecessaryRigor(input),
    checkLowRealWorldRelevance(input),
  ];
  for (const warnings of warningGroups) {
    for (const w of warnings) softWarnings.push(w);
  }

  if (softWarnings.length > 0) triggeredRuleKeys.push("country_alignment");

  return { softWarnings, triggeredRuleKeys };
}

