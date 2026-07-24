import Link from "next/link";
import type { StoredSession } from "@/lib/domain/models/session";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";
import type { CounselorNote } from "@/lib/persistence/counselorNotesStore";
import { categoryLabel, courseName, formatDisplayValue } from "@/lib/student/display";
import {
  buildFinalRecommendationSummary,
  buildWhatYouGain,
  inferRiskLevel,
  type RiskLevel,
} from "@/lib/student/recommendationPolish";

function pick<T>(value: unknown): T | undefined {
  return value as T | undefined;
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/three-path course recommendation/gi, "course-selection pathway")
    .replace(/\bstem\b/gi, "STEM")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function workloadDemandLabel(level: RiskLevel) {
  if (level === "low") return "Lower";
  if (level === "moderate") return "Moderate";
  return "Higher";
}

function pathTitle(kind: PathRecommendation["kind"]) {
  if (kind === "bestFit") return "Best Fit";
  if (kind === "balanced") return "Balanced";
  return "Stretch";
}

function isGuidanceRecommendation(rec: PathRecommendation) {
  return Object.keys(rec.selections.categorySelections ?? {}).length === 0;
}

function recommendationSignature(rec: PathRecommendation) {
  return JSON.stringify(rec.selections.categorySelections ?? {});
}

function uniqueAlternativePaths(bundle: {
  bestFit: PathRecommendation;
  balanced: PathRecommendation;
  stretch: PathRecommendation;
}) {
  const seen = new Set([recommendationSignature(bundle.bestFit)]);
  return [bundle.balanced, bundle.stretch].filter((rec) => {
    const signature = recommendationSignature(rec);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function uniqueLines(lines: string[], limit = 8) {
  const seen = new Set<string>();
  return lines
    .map(cleanText)
    .filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .slice(0, limit);
}

function CoursePlan({ rec }: { rec: PathRecommendation }) {
  const entries = Object.entries(rec.selections.categorySelections ?? {});
  if (!entries.length) {
    return <p className="text-sm leading-6 text-slate-600">Readiness guidance only; no course pathway is assigned yet.</p>;
  }

  return (
    <dl className="grid gap-px overflow-hidden border border-slate-300 bg-slate-300 sm:grid-cols-2">
      {entries.map(([category, code]) => (
        <div key={category} className="flex items-center justify-between gap-4 bg-white px-3 py-2.5">
          <dt className="text-xs text-slate-600">{categoryLabel(category as never)}</dt>
          <dd className="text-right text-sm font-semibold text-slate-950">{courseName(code)}</dd>
        </div>
      ))}
    </dl>
  );
}

function AlternativeSummary({
  rec,
  answers,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
}) {
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);
  const strongestReason =
    rec.rationale.topContributingFactors[0]?.evidence[0] ??
    rec.rationale.topContributingFactors[0]?.label ??
    rec.explanation;
  const tradeoff = rec.tradeOffs[0] ?? rec.whyMayFeelHard[0] ?? rec.whyMayNotFit[0];
  const reviewItems = uniqueLines(
    [...rec.hardRisks, ...rec.softWarnings, ...rec.whyMayNotFit, ...rec.whyMayFeelHard, ...rec.tradeOffs],
    rec.hardRisks.length +
      rec.softWarnings.length +
      rec.whyMayNotFit.length +
      rec.whyMayFeelHard.length +
      rec.tradeOffs.length,
  );

  return (
    <section className="apf-print-block border-t border-slate-300 pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-950">{pathTitle(rec.kind)}</h3>
        <p className="text-xs text-slate-600">Estimated workload: {workloadDemandLabel(risk)}</p>
      </div>
      <div className="mt-3">
        <CoursePlan rec={rec} />
      </div>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-slate-600">Strongest fit</dt>
          <dd className="mt-1 leading-6 text-slate-700">{cleanText(strongestReason)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-600">Main tradeoff</dt>
          <dd className="mt-1 leading-6 text-slate-700">
            {tradeoff ? cleanText(tradeoff) : "Review workload and course availability with the student."}
          </dd>
        </div>
      </dl>
      {reviewItems.length ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <h4 className="text-xs font-semibold text-slate-700">What to review</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {reviewItems.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function CounselorSummaryDocument(props: {
  studentId: string;
  session: StoredSession | null;
  notes?: CounselorNote[];
  variant?: "default" | "report";
  showNav?: boolean;
}) {
  const { studentId, session, notes = [], variant = "default", showNav = true } = props;
  const answers = (session?.answers ?? {}) as Record<string, unknown>;
  const bundle = session?.outputs?.bundle;
  const generatedAt = session?.outputs?.generatedAt;
  const isReport = variant === "report";
  const SummaryHeading = isReport ? "h1" : "h2";

  const grade = pick<number>(answers.currentGrade);
  const semester = pick<string>(answers.semester);
  const mainCountry = pick<string>(answers.mainCountry);
  const goalClarity = pick<string>(answers.goalClarity);
  const interests = answers.interests;
  const careerGoals = answers.careerGoals;
  const priorityStyle = pick<string>(answers.priorityStyle);
  const optimizationTarget = pick<string>(answers.optimizationTarget);
  const riskPreference = pick<string>(answers.riskPreference);
  const workloadTolerance = pick<string>(answers.workloadTolerance);
  const academicConfidence = pick<string>(answers.selfReportedAcademicConfidence);

  const bestFit = bundle?.bestFit as PathRecommendation | undefined;
  const guidanceMode = bestFit ? isGuidanceRecommendation(bestFit) : false;
  const alternatives = bundle ? uniqueAlternativePaths(bundle) : [];
  const finalSummary = bestFit ? buildFinalRecommendationSummary(answers, bestFit) : null;
  const considerationSource = bestFit
    ? [
        ...bestFit.hardRisks,
        ...(bestFit.softWarnings ?? []),
        ...bestFit.whyMayNotFit,
        ...bestFit.tradeOffs,
        ...bestFit.whyMayFeelHard,
      ]
    : [];
  const considerations = uniqueLines(considerationSource, considerationSource.length);
  const reasons = bestFit
    ? uniqueLines(
        [
          ...(bestFit.selectionBecause ?? []),
          ...bestFit.rationale.topContributingFactors.flatMap((factor) =>
            factor.evidence.length ? factor.evidence : [factor.label],
          ),
        ],
        6,
      )
    : [];

  const sectionClass = isReport
    ? "apf-print-section border-t border-slate-400 pt-4"
    : "apf-paper p-5 sm:p-7";

  return (
    <div className={isReport ? "counselor-report space-y-6 text-slate-950" : "space-y-6"}>
      {showNav && !isReport ? (
        <div className="print:hidden">
          <Link href="/counselor" className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-900 underline underline-offset-4">
            Back to student lookup
          </Link>
        </div>
      ) : null}

      <header className={isReport ? "border-b-2 border-slate-800 pb-5" : "apf-paper p-5 sm:p-7"}>
        <p className={isReport ? "text-xs font-semibold uppercase tracking-wide text-slate-600" : "apf-document-label"}>
          Counselor summary
        </p>
        <SummaryHeading className={isReport ? "mt-2 text-2xl font-bold tracking-tight" : "apf-display mt-2 text-3xl text-slate-950"}>
          {isReport ? "Academic pathway summary" : "Plan summary"}
        </SummaryHeading>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-600">Student ID</dt>
            <dd className="font-mono font-semibold tabular-nums text-slate-950">{studentId}</dd>
          </div>
          {generatedAt ? (
            <div className="flex gap-2">
              <dt className="text-slate-600">Generated</dt>
              <dd className="font-medium text-slate-950">{new Date(generatedAt).toLocaleString()}</dd>
            </div>
          ) : null}
        </dl>
        {finalSummary ? (
          <p className="mt-5 max-w-4xl border-l-[3px] border-teal-700 pl-4 text-sm font-medium leading-6 text-slate-800">
            {finalSummary}
          </p>
        ) : null}
      </header>

      {!bestFit ? (
        <section className={sectionClass}>
          <h2 className="text-base font-semibold text-slate-950">Recommendation unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">No recommendation output is stored for this session yet.</p>
        </section>
      ) : (
        <>
          <section className={sectionClass}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className={isReport ? "text-xs font-semibold uppercase tracking-wide text-slate-600" : "apf-document-label"}>
                  Primary recommendation
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {guidanceMode ? "Readiness plan" : "Best Fit course plan"}
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-600">
                Estimated workload: {workloadDemandLabel(inferRiskLevel(bestFit, workloadTolerance))}
              </p>
            </div>

            <div className="mt-5">
              <CoursePlan rec={bestFit} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Why it fits</h3>
                <ol className="mt-3 space-y-2">
                  {reasons.slice(0, 4).map((line, index) => (
                    <li key={line} className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm leading-6 text-slate-700">
                      <span className="font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-l-4 border-amber-700 bg-amber-50 px-4 py-4">
                <h3 className="text-sm font-semibold text-amber-950">Key considerations</h3>
                {considerations.length ? (
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-950">
                    {considerations.slice(0, 4).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-amber-950">
                    Confirm course availability, prerequisites, and workload with the student.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-base font-semibold text-slate-950">Student planning profile</h2>
            <dl className="mt-4 grid gap-x-7 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Grade", grade ? `Grade ${grade}` : "Not provided"],
                ["Semester", formatDisplayValue(semester)],
                ["Academic confidence (self-report)", formatDisplayValue(academicConfidence)],
                ["Workload tolerance", formatDisplayValue(workloadTolerance)],
                ["Main destination focus", formatDisplayValue(mainCountry)],
                ["Goal clarity", formatDisplayValue(goalClarity)],
                ["Interests", formatDisplayValue(interests)],
                ["Career direction", formatDisplayValue(careerGoals)],
                [
                  "Decision style",
                  [priorityStyle, optimizationTarget, riskPreference].filter(Boolean).map(formatDisplayValue).join(" · ") ||
                    "Not provided",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold text-slate-600">{label}</dt>
                  <dd className="mt-1 leading-6 text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {!guidanceMode ? (
            <section className={sectionClass}>
              <h2 className="text-base font-semibold text-slate-950">Alternative pathways</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Use these as comparison points; they do not replace Best Fit as the main recommendation.
              </p>
              <div className="mt-5 space-y-5">
                {alternatives.length ? (
                  alternatives.map((rec) => <AlternativeSummary key={rec.kind} rec={rec} answers={answers} />)
                ) : (
                  <p className="text-sm text-slate-600">This profile produced one distinct course plan.</p>
                )}
              </div>
            </section>
          ) : null}

          <section className={sectionClass}>
            <div className="grid gap-7 lg:grid-cols-2">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Detailed reasoning</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{cleanText(bestFit.explanation)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{cleanText(bestFit.futureImpactSummary)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{cleanText(bestFit.confidenceExplanation)}</p>
                <h3 className="mt-5 text-sm font-semibold text-slate-950">What this path supports</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                  {buildWhatYouGain(bestFit, answers)
                    .slice(0, 5)
                    .map((line) => (
                      <li key={line}>{cleanText(line)}</li>
                    ))}
                </ul>
                {considerations.length > 4 ? (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-slate-950">Additional considerations</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {considerations.slice(4).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Suggested next steps</h2>
                <ol className="mt-3 space-y-2">
                  {bestFit.actionSteps.slice(0, 8).map((step, index) => (
                    <li key={`${index}-${step}`} className="grid grid-cols-[1.75rem_1fr] gap-2 text-sm leading-6 text-slate-700">
                      <span className="font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                      <span>{cleanText(step)}</span>
                    </li>
                  ))}
                </ol>
                {bestFit.continuationSuggestions.length ? (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-slate-950">Next-semester ideas</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {bestFit.continuationSuggestions.map((suggestion) => (
                        <li key={`${suggestion.fromCourseCode}-${suggestion.toCourseCode}`}>
                          {courseName(suggestion.fromCourseCode)} → {courseName(suggestion.toCourseCode)}
                          {suggestion.note ? ` — ${cleanText(suggestion.note)}` : ""}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {bestFit.alternatives.length ? (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-slate-950">Other planning ideas considered</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {bestFit.alternatives.map((idea) => (
                        <li key={idea}>{cleanText(idea)}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </>
      )}

      {isReport ? (
        <section className="apf-print-section border-t border-slate-400 pt-4">
          <h2 className="text-base font-semibold text-slate-950">Counselor notes</h2>
          {notes.length ? (
            <ul className="mt-3 space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="apf-print-note border-l-2 border-slate-500 pl-3">
                  <p className="text-xs text-slate-600">{new Date(note.createdAt).toLocaleString()}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-900">{note.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No counselor notes on file.</p>
          )}
        </section>
      ) : null}

      {isReport ? (
        <p className="border-t border-slate-400 pt-3 text-center text-xs text-slate-600">
          SAIS Academic Navigator · Confidential counselor summary · Not an official transcript
        </p>
      ) : null}
    </div>
  );
}
