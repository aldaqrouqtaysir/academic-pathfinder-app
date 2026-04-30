import type { PathRecommendation, ScoringFactorKey } from "@/lib/domain/models/recommendations";

const METRICS: { key: ScoringFactorKey; label: string; hint: string }[] = [
  { key: "workload_fit", label: "How the load feels", hint: "Versus how much you said you want on your plate" },
  { key: "learning_stretch", label: "Challenge level", hint: "Compared with how confident you feel in school" },
  { key: "pathway_alignment", label: "Your direction", hint: "Career and interest fit" },
  { key: "future_relevance", label: "Future doors", hint: "How well this keeps options open" },
  { key: "scholarship_competitiveness", label: "Competitive edge", hint: "For applications and scholarships you care about" },
];

const SUMMARY_ROW: { key: ScoringFactorKey; shortLabel: string }[] = [
  { key: "workload_fit", shortLabel: "Workload" },
  { key: "learning_stretch", shortLabel: "Rigor" },
  { key: "country_alignment", shortLabel: "Flexibility" },
  { key: "scholarship_competitiveness", shortLabel: "Competitiveness" },
];

function pctForFactor(fb: PathRecommendation["rationale"]["factorBreakdown"], key: ScoringFactorKey, maxPoints: number) {
  const pts = fb.find((f) => f.key === key)?.points ?? 0;
  return Math.round((pts / maxPoints) * 100);
}

/** Student-facing strength — no raw scores. */
export function strengthCaption(pct: number): string {
  if (pct >= 66) return "Strong fit";
  if (pct >= 33) return "Solid";
  return "Light";
}

/** Top summary chips: workload, rigor, flexibility, competitiveness — UI only. */
export function pathSummaryTopRow(rec: PathRecommendation) {
  const fb = rec.rationale.factorBreakdown;
  const maxPoints = Math.max(1, ...fb.map((f) => f.points));
  return SUMMARY_ROW.map(({ key, shortLabel }) => {
    const pct = pctForFactor(fb, key, maxPoints);
    return { key, label: shortLabel, pct, band: strengthCaption(pct) };
  });
}

/** UI-only bars + human labels (engine unchanged). */
export function pathMetricBars(rec: PathRecommendation) {
  const fb = rec.rationale.factorBreakdown;
  const maxPoints = Math.max(1, ...fb.map((f) => f.points));
  return METRICS.map(({ key, label, hint }) => {
    const pts = fb.find((f) => f.key === key)?.points ?? 0;
    const pct = Math.round((pts / maxPoints) * 100);
    return {
      label,
      hint,
      pct,
      caption: strengthCaption(pct),
      raw: pts,
    };
  });
}
