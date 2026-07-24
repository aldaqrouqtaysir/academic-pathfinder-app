"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StudentHeader } from "@/components/student/StudentHeader";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";
import { categoryLabel, courseName } from "@/lib/student/display";
import {
  buildWhatYouGain,
  buildWowMessage,
  inferRiskLevel,
  type RiskLevel,
} from "@/lib/student/recommendationPolish";

type DashboardBundle = {
  bestFit: PathRecommendation;
  balanced: PathRecommendation;
  stretch: PathRecommendation;
};

type ActiveSession = {
  answers?: Record<string, unknown>;
  outputs?: { bundle?: unknown };
};

function prettyKind(kind: PathRecommendation["kind"]) {
  if (kind === "bestFit") return "Best Fit";
  if (kind === "balanced") return "Balanced";
  return "Stretch";
}

function isGuidanceMode(rec: PathRecommendation) {
  return Object.keys(rec.selections.categorySelections ?? {}).length === 0;
}

function pathSignature(rec: PathRecommendation) {
  return JSON.stringify(rec.selections.categorySelections ?? {});
}

function uniqueAlternativePaths(bundle: DashboardBundle) {
  const seen = new Set([pathSignature(bundle.bestFit)]);
  return [bundle.balanced, bundle.stretch].filter((rec) => {
    const signature = pathSignature(rec);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function cleanDisplayText(text: string) {
  return text
    .replace(/three-path course recommendation/gi, "course-selection pathway")
    .replace(/\bstem\b/gi, "STEM")
    .trim();
}

function workloadDemandLabel(level: RiskLevel) {
  if (level === "low") return "Lower";
  if (level === "moderate") return "Moderate";
  return "Higher";
}

function sentenceList(text: string, limit = 5) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => cleanDisplayText(item))
    .filter(Boolean)
    .slice(0, limit);
}

function firstSentences(text: string, limit = 2) {
  return sentenceList(text, limit);
}

function uniqueText(lines: string[], limit: number) {
  const seen = new Set<string>();
  return lines
    .map((line) => cleanDisplayText(line))
    .filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .slice(0, limit);
}

function recommendationReasons(rec: PathRecommendation) {
  const selectionReasons = rec.selectionBecause ?? [];
  const factorReasons = rec.rationale.topContributingFactors.flatMap((factor) =>
    factor.evidence.length ? [factor.evidence[0]] : [factor.label],
  );
  return uniqueText([...selectionReasons, ...factorReasons], 3);
}

function recommendationConsiderations(rec: PathRecommendation) {
  const softWarningText = new Set(rec.softWarnings.map(cleanDisplayText));
  const lines = [
    ...rec.hardRisks.map((line) => `Confirm before proceeding: ${line}`),
    ...rec.softWarnings,
    ...rec.whyMayFeelHard,
    ...rec.tradeOffs,
    ...rec.whyMayNotFit
      .filter((line) => !softWarningText.has(cleanDisplayText(line)))
      .map((line) => `Check with your counselor: ${line}`),
  ];
  return uniqueText(lines, lines.length);
}

function RecommendationSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header>
      {eyebrow ? <p className="apf-document-label">{eyebrow}</p> : null}
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </header>
  );
}

function CategoryGrid({ rec, muted = false }: { rec: PathRecommendation; muted?: boolean }) {
  const entries = Object.entries(rec.selections.categorySelections ?? {});
  if (!entries.length) {
    return (
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        This readiness plan focuses on preparation before course pathways open in Grade 11.
      </p>
    );
  }

  return (
    <dl className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
      {entries.map(([category, code]) => (
        <div
          key={category}
          className={`flex min-h-16 items-center justify-between gap-4 px-4 py-3 ${
            muted ? "bg-slate-50" : "bg-white"
          }`}
        >
          <dt className="text-sm text-slate-600">{categoryLabel(category as never)}</dt>
          <dd className="text-right text-sm font-semibold text-slate-950">{courseName(code)}</dd>
        </div>
      ))}
    </dl>
  );
}

function RecommendationActions({
  detailsId,
  onEdit,
}: {
  detailsId: string;
  onEdit: () => void;
}) {
  function openNextSteps() {
    const details = document.getElementById(detailsId) as HTMLDetailsElement | null;
    if (!details) return;
    details.open = true;
    const summary = details.querySelector("summary");
    summary?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    details.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="border-t border-slate-200 pt-5 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={openNextSteps}>
          Review next steps
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Print summary
        </Button>
        <Button type="button" variant="secondary" onClick={onEdit}>
          Edit preferences
        </Button>
      </div>
      <div className="mt-4 flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-emerald-800">Plan saved.</span> Your latest answers and recommendation are active.
        </p>
        <p>Review course availability and tradeoffs with your counselor.</p>
      </div>
    </div>
  );
}

function DetailedReasoning({
  rec,
  answers,
  detailsId,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
  detailsId: string;
}) {
  const gains = buildWhatYouGain(rec, answers);
  const future = sentenceList(rec.futureImpactSummary, 4);
  const considerations = recommendationConsiderations(rec);
  const planningIdeas = uniqueText(rec.alternatives, rec.alternatives.length);
  const fullReasons = uniqueText(
    [
      ...(rec.selectionBecause ?? []),
      ...rec.rationale.topContributingFactors.flatMap((factor) =>
        factor.evidence.length ? factor.evidence : [factor.label],
      ),
    ],
    8,
  );

  return (
    <details id={detailsId} className="group scroll-mt-24 border-t border-slate-200 pt-1">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-teal-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span>View detailed reasoning and next steps</span>
        <span aria-hidden className="text-lg leading-none transition-transform duration-150 group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="grid gap-8 border-t border-slate-200 py-6 lg:grid-cols-2">
        <section>
          <RecommendationSectionHeading title="Detailed reasoning" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {fullReasons.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-l-2 border-slate-300 pl-4 text-sm leading-6 text-slate-600">
            {cleanDisplayText(rec.explanation)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{cleanDisplayText(rec.confidenceExplanation)}</p>
          {considerations.length ? (
            <section className="mt-7 border-t border-slate-200 pt-5">
              <h4 className="text-sm font-semibold text-slate-950">Full considerations</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {considerations.map((line) => (
                  <li key={line} className="border-l-2 border-amber-500 pl-3">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>

        <div className="space-y-8">
          <section id="next-steps" className="scroll-mt-24">
            <RecommendationSectionHeading title="Next steps" />
            <ol className="mt-4 space-y-3">
              {rec.actionSteps.map((step, index) => (
                <li key={`${index}-${step}`} className="grid grid-cols-[2rem_1fr] gap-2 text-sm leading-6 text-slate-700">
                  <span className="font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                  <span>{cleanDisplayText(step)}</span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <RecommendationSectionHeading title="What this path supports" />
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {uniqueText([...gains, ...future], 6).map((line) => (
                <li key={line} className="border-l-2 border-teal-200 pl-3">
                  {line}
                </li>
              ))}
            </ul>
          </section>
          {rec.continuationSuggestions.length ? (
            <section>
              <RecommendationSectionHeading title="Next-semester ideas" />
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                {rec.continuationSuggestions.map((suggestion) => (
                  <li key={`${suggestion.fromCourseCode}-${suggestion.toCourseCode}`}>
                    <span className="font-medium text-slate-900">
                      {courseName(suggestion.fromCourseCode)} → {courseName(suggestion.toCourseCode)}
                    </span>
                    {suggestion.note ? ` — ${cleanDisplayText(suggestion.note)}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {planningIdeas.length ? (
            <section>
              <RecommendationSectionHeading title="Other planning ideas considered" />
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {planningIdeas.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function GuidancePlan({
  rec,
  answers,
  onEdit,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
  onEdit: () => void;
}) {
  const summary = firstSentences(buildWowMessage(answers, rec), 1)[0] ?? cleanDisplayText(rec.explanation);
  const factors = rec.rationale.topContributingFactors.slice(0, 4);
  const considerations = recommendationConsiderations(rec);
  const considerationPreview = considerations.slice(0, 3);

  return (
    <article id="hero-best-fit" className="apf-paper space-y-8 p-5 sm:p-8 lg:p-10">
      <header className="max-w-3xl">
        <p className="apf-document-label">Grades 9–10 readiness plan</p>
        <h2 className="apf-display mt-3 text-3xl text-slate-950 sm:text-4xl">Build the foundation for later course choices</h2>
        <p className="mt-4 text-base leading-7 text-slate-700">{summary}</p>
      </header>

      <section className="border-t border-slate-200 pt-7">
        <RecommendationSectionHeading
          eyebrow="Focus now"
          title="Preparation priorities"
          description="These points come from the answers already in your planning profile."
        />
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
          {factors.map((factor, index) => (
            <div key={factor.key} className="bg-white p-4">
              <p className="text-xs font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</p>
              <h4 className="mt-2 text-sm font-semibold text-slate-950">{factor.label}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">{cleanDisplayText(factor.evidence[0] ?? "")}</p>
            </div>
          ))}
        </div>
      </section>

      {considerationPreview.length ? (
        <section className="border-l-4 border-amber-600 bg-amber-50 px-4 py-4">
          <h3 className="text-sm font-semibold text-amber-950">Important considerations</h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-950">
            {considerationPreview.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {considerations.length > considerationPreview.length ? (
            <p className="mt-2 text-xs font-medium text-amber-950">
              {considerations.length - considerationPreview.length} more item
              {considerations.length - considerationPreview.length === 1 ? "" : "s"} in detailed reasoning.
            </p>
          ) : null}
        </section>
      ) : null}

      <DetailedReasoning rec={rec} answers={answers} detailsId="recommendation-details" />
      <RecommendationActions detailsId="recommendation-details" onEdit={onEdit} />
    </article>
  );
}

function RecommendationPlan({
  rec,
  answers,
  onEdit,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
  onEdit: () => void;
}) {
  const summary = firstSentences(buildWowMessage(answers, rec), 1)[0] ?? cleanDisplayText(rec.explanation);
  const reasons = recommendationReasons(rec);
  const considerations = recommendationConsiderations(rec);
  const considerationPreview = considerations.slice(0, 3);
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);

  return (
    <article id="hero-best-fit" className="apf-paper space-y-8 p-5 sm:p-8 lg:p-10">
      <header className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="apf-document-label">Best Fit · active plan</p>
          <span
            className="text-xs font-medium text-slate-600"
            title="A qualitative workload description, not a grade prediction."
          >
            Estimated workload: {workloadDemandLabel(risk)}
          </span>
        </div>
        <h2 className="apf-display mt-3 text-3xl text-slate-950 sm:text-4xl">Best Fit course plan</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{summary}</p>
      </header>

      <section className="border-t border-slate-200 pt-7">
        <RecommendationSectionHeading
          eyebrow="Recommended courses"
          title="Your course plan"
          description="Course availability and prerequisites still require counselor confirmation."
        />
        <div className="mt-5">
          <CategoryGrid rec={rec} />
        </div>
      </section>

      <div className="grid gap-7 border-t border-slate-200 pt-7 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <RecommendationSectionHeading
            eyebrow="Why it fits"
            title="The three strongest reasons"
          />
          <ol className="mt-5 space-y-4">
            {reasons.map((line, index) => (
              <li key={line} className="grid grid-cols-[2rem_1fr] gap-2 text-sm leading-6 text-slate-700">
                <span className="font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-l-4 border-amber-600 bg-amber-50 px-4 py-4 sm:px-5">
          <RecommendationSectionHeading
            eyebrow="Before you decide"
            title="Important considerations"
          />
          {considerationPreview.length ? (
            <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950">
              {considerationPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-amber-950">
              Confirm course availability, continuation requirements, and workload with your counselor.
            </p>
          )}
          {considerations.length > considerationPreview.length ? (
            <p className="mt-3 text-xs font-medium text-amber-950">
              {considerations.length - considerationPreview.length} more item
              {considerations.length - considerationPreview.length === 1 ? "" : "s"} in detailed reasoning.
            </p>
          ) : null}
        </section>
      </div>

      <DetailedReasoning rec={rec} answers={answers} detailsId="recommendation-details" />
      <RecommendationActions detailsId="recommendation-details" onEdit={onEdit} />
    </article>
  );
}

function AlternativePath({
  rec,
  answers,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
}) {
  const reasons = recommendationReasons(rec);
  const considerations = recommendationConsiderations(rec);
  const gains = buildWhatYouGain(rec, answers);
  const future = sentenceList(rec.futureImpactSummary, 4);
  const planningIdeas = uniqueText(rec.alternatives, rec.alternatives.length);
  const summary =
    firstSentences(rec.futureImpactSummary, 1)[0] ??
    firstSentences(rec.explanation, 1)[0] ??
    `${prettyKind(rec.kind)} offers a different balance of courses and tradeoffs.`;
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);

  return (
    <article id={`path-${rec.kind}`} className="scroll-mt-24 border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="apf-document-label">Alternative pathway</p>
          <h3 className="apf-display mt-1 text-2xl text-slate-950">{prettyKind(rec.kind)}</h3>
        </div>
        <span className="text-xs font-medium text-slate-600">Estimated workload: {workloadDemandLabel(risk)}</span>
      </header>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{summary}</p>

      <dl className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-600">Strongest fit</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-800">{reasons[0] ?? cleanDisplayText(rec.explanation)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Main tradeoff</dt>
          <dd className="mt-1 text-sm leading-6 text-slate-800">
            {considerations[0] ?? "Confirm course availability and workload with your counselor."}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <CategoryGrid rec={rec} muted />
      </div>

      <details className="mt-4 border-t border-slate-200">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-teal-900 marker:content-none [&::-webkit-details-marker]:hidden">
          <span>View {prettyKind(rec.kind)} details</span>
          <span aria-hidden className="apf-disclosure-mark text-lg leading-none">
            +
          </span>
        </summary>
        <div className="grid gap-6 border-t border-slate-200 py-5 sm:grid-cols-2">
          <section>
            <h4 className="text-sm font-semibold text-slate-950">Why it may fit</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {reasons.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-slate-950">What to review</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {(considerations.length
                ? considerations
                : ["Confirm course availability and workload with your counselor."]
              ).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
          <section className="border-t border-slate-200 pt-5 sm:col-span-2">
            <h4 className="text-sm font-semibold text-slate-950">What this path supports</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {uniqueText([...gains, ...future], 8).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-6 text-slate-700">{cleanDisplayText(rec.explanation)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{cleanDisplayText(rec.confidenceExplanation)}</p>
          </section>
          {rec.actionSteps.length ? (
            <section>
              <h4 className="text-sm font-semibold text-slate-950">Suggested next steps</h4>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {rec.actionSteps.map((step, index) => (
                  <li key={`${index}-${step}`} className="grid grid-cols-[1.75rem_1fr] gap-2">
                    <span className="font-semibold tabular-nums text-teal-800">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{cleanDisplayText(step)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          {rec.continuationSuggestions.length || planningIdeas.length ? (
            <section>
              <h4 className="text-sm font-semibold text-slate-950">Planning ideas</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {rec.continuationSuggestions.map((suggestion) => (
                  <li key={`${suggestion.fromCourseCode}-${suggestion.toCourseCode}`}>
                    {courseName(suggestion.fromCourseCode)} → {courseName(suggestion.toCourseCode)}
                    {suggestion.note ? ` — ${cleanDisplayText(suggestion.note)}` : ""}
                  </li>
                ))}
                {planningIdeas.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </details>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [freshNotice, setFreshNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("fresh") === "1") {
      setFreshNotice(true);
      url.searchParams.delete("fresh");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
    }
  }, [router]);

  const loadPlan = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch("/api/student/active-plan", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Active plan request failed.");
      const json = await response.json().catch(() => null);
      if (!json?.activeSession?.outputs?.bundle) {
        setSession(null);
        setLoadState("empty");
        return;
      }
      setSession(json.activeSession);
      setLoadState("ready");
    } catch {
      setSession(null);
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    if (loadState !== "ready") return;
    const details = document.getElementById("recommendation-details") as HTMLDetailsElement | null;
    if (!details) return;
    const printableDetails = details;

    const printMedia = window.matchMedia("print");
    let printActive = false;
    let restoreOpen = printableDetails.open;

    function enterPrint() {
      if (!printActive) {
        restoreOpen = printableDetails.open;
        printActive = true;
      }
      printableDetails.open = true;
    }

    function leavePrint() {
      if (!printActive) return;
      printableDetails.open = restoreOpen;
      printActive = false;
    }

    function syncPrintState() {
      if (printMedia.matches) enterPrint();
      else leavePrint();
    }

    syncPrintState();
    printMedia.addEventListener("change", syncPrintState);
    window.addEventListener("beforeprint", enterPrint);
    window.addEventListener("afterprint", leavePrint);
    return () => {
      printMedia.removeEventListener("change", syncPrintState);
      window.removeEventListener("beforeprint", enterPrint);
      window.removeEventListener("afterprint", leavePrint);
    };
  }, [loadState]);

  const bundle = session?.outputs?.bundle as DashboardBundle | undefined;
  const visibleAlternatives = useMemo(() => (bundle ? uniqueAlternativePaths(bundle) : []), [bundle]);

  if (loadState === "loading") {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        aria-busy="true"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-sm text-slate-700"
      >
        <span className="h-8 w-8 animate-pulse rounded-full border-4 border-teal-700 border-r-transparent" aria-hidden />
        <span role="status">Loading your saved plan.</span>
      </main>
    );
  }

  if (loadState === "empty" || loadState === "error" || !bundle) {
    const isError = loadState === "error";
    return (
      <div className="min-h-[100dvh]">
        <StudentHeader />
        <main id="main-content" tabIndex={-1} className="apf-journey-shell">
          <Card className="mx-auto max-w-2xl">
            <p className="apf-document-label">{isError ? "Plan unavailable" : "No active plan"}</p>
            <h1 className="apf-display mt-3 text-3xl text-slate-950">
              {isError ? "We could not load your plan." : "You do not have an active plan yet."}
            </h1>
            <p
              id="dashboard-load-message"
              role={isError ? "alert" : "status"}
              className="mt-3 max-w-xl text-sm leading-6 text-slate-600"
            >
              {isError
                ? "Your saved work has not changed. Check your connection and try again."
                : "Complete the intake to build a recommendation, or start a new plan if you cleared an older active plan."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {isError ? (
                <Button type="button" onClick={() => void loadPlan()}>
                  Try again
                </Button>
              ) : null}
              <Button
                type="button"
                variant={isError ? "secondary" : "primary"}
                onClick={() => router.push("/intake")}
              >
                Go to intake
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const answers = session?.answers ?? {};
  const guidanceMode = isGuidanceMode(bundle.bestFit);

  return (
    <div className="dashboard-print-root min-h-[100dvh] bg-slate-100">
      <StudentHeader />
      <main id="main-content" tabIndex={-1} className="apf-journey-shell">
        <div className="mx-auto max-w-6xl">
          {freshNotice ? (
            <div
              className="mb-6 flex flex-col gap-3 border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 print:hidden sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <div>
                <p className="font-semibold text-emerald-950">Your plan is ready and saved.</p>
                <p className="mt-1 text-sm text-emerald-900">Start with the course plan, then review the reasons and tradeoffs.</p>
              </div>
              <button
                type="button"
                className="inline-flex min-h-11 items-center self-start px-2 text-sm font-semibold text-emerald-900 underline underline-offset-4 sm:self-auto"
                onClick={() => setFreshNotice(false)}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <header className="mb-6 print:mb-4">
            <p className="apf-document-label">SAIS Academic Navigator</p>
            <h1 className="apf-display mt-2 text-3xl text-slate-950 sm:text-4xl">
              {guidanceMode ? "Your readiness plan" : "Your recommended path"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {guidanceMode
                ? "A focused preparation brief for the choices ahead."
                : "Your main recommendation appears first. Alternatives remain available for a deliberate comparison."}
            </p>
          </header>

          {guidanceMode ? (
            <GuidancePlan
              rec={bundle.bestFit}
              answers={answers}
              onEdit={() => router.push("/intake?mode=edit")}
            />
          ) : (
            <RecommendationPlan
              rec={bundle.bestFit}
              answers={answers}
              onEdit={() => router.push("/intake?mode=edit")}
            />
          )}

          {!guidanceMode ? (
            <section className="mt-8 print:hidden" aria-labelledby="alternative-pathways-heading">
              <div className="apf-paper">
                <header className="p-5 pb-0 sm:p-7 sm:pb-0">
                  <p className="apf-document-label">Alternatives</p>
                  <h2 id="alternative-pathways-heading" className="apf-display mt-1 text-2xl text-slate-950">
                    Compare other pathways
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Balanced and Stretch remain available without competing with Best Fit above the fold.
                  </p>
                </header>
                <details className="px-5 pb-5 sm:px-7 sm:pb-7">
                  <summary className="mt-4 flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 border-t border-slate-200 py-3 text-sm font-semibold text-teal-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="apf-disclosure-closed">Compare pathways</span>
                    <span className="apf-disclosure-open hidden">Close comparison</span>
                    <span aria-hidden className="apf-disclosure-mark text-lg leading-none">
                      +
                    </span>
                </summary>
                <div className="space-y-7 border-t border-slate-200 pt-5">
                  {visibleAlternatives.length ? (
                    visibleAlternatives.map((rec) => (
                      <AlternativePath key={rec.kind} rec={rec} answers={answers} />
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-slate-600">
                      This profile produced one distinct course plan. Review the detailed reasoning with your counselor.
                    </p>
                  )}
                </div>
                </details>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
