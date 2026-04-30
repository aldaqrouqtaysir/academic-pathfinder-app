import Link from "next/link";
import type { StoredSession } from "@/lib/domain/models/session";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";
import type { CounselorNote } from "@/lib/persistence/counselorNotesStore";
import { Card } from "@/components/ui/Card";
import { courseName } from "@/lib/student/display";
import { pathMetricBars, pathSummaryTopRow } from "@/lib/student/pathMetrics";
import {
  buildFinalRecommendationSummary,
  buildWhatYouGain,
  inferRiskLevel,
  riskLevelLabel,
} from "@/lib/student/recommendationPolish";

function pick<T>(v: unknown): T | undefined {
  return v as T | undefined;
}

function formatList(v: unknown): string {
  if (Array.isArray(v)) return v.map(String).join(", ");
  if (v == null) return "—";
  return String(v);
}

function confidenceBand(value: number) {
  if (value >= 0.75) return "High";
  if (value >= 0.5) return "Medium";
  return "Low";
}

function pathTitle(kind: PathRecommendation["kind"]) {
  if (kind === "bestFit") return "Best fit";
  if (kind === "balanced") return "Balanced";
  return "Stretch";
}

function selectionLine(rec: PathRecommendation) {
  const core = rec.selections.core.map(courseName).join(" · ");
  const s1 = rec.selections.set1.map(courseName).join(" · ");
  const s2 = rec.selections.set2.map(courseName).join(" · ");
  const parts = [core && `Core: ${core}`, s1 && `Set 1: ${s1}`, s2 && `Set 2: ${s2}`].filter(Boolean);
  return parts.length ? parts.join(" | ") : "—";
}

function PathBlock({ rec, answers }: { rec: PathRecommendation; answers: Record<string, unknown> }) {
  const summary = pathSummaryTopRow(rec);
  const bars = pathMetricBars(rec);
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{pathTitle(rec.kind)}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
            {riskLevelLabel(risk)}
          </span>
          <span className="text-xs text-slate-500">{rec.label}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700">{selectionLine(rec)}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{rec.explanation}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {summary.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
          >
            {s.label}: {s.band}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-slate-600">
        {bars.slice(0, 4).map((b) => (
          <li key={b.label}>
            <span className="font-medium text-slate-700">{b.label}:</span> {b.caption}
          </li>
        ))}
      </ul>
    </div>
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
  const answers = session?.answers ?? {};
  const bundle = session?.outputs?.bundle;
  const generatedAt = session?.outputs?.generatedAt;

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
  const selfReportedAcademicConfidence = pick<string>(answers.selfReportedAcademicConfidence);

  const isReport = variant === "report";
  const finalSummaryLine =
    bundle?.bestFit != null ? buildFinalRecommendationSummary(answers, bundle.bestFit as PathRecommendation) : null;

  return (
    <div className={isReport ? "counselor-report space-y-8 text-slate-900" : "space-y-6"}>
      {showNav && !isReport && (
        <div className="print:hidden">
          <Link href="/counselor" className="text-sm font-medium text-teal-700 hover:text-teal-900">
            ← Dashboard
          </Link>
        </div>
      )}

      <div className={isReport ? "border-b border-slate-300 pb-6" : ""}>
        <h1 className={isReport ? "text-2xl font-bold tracking-tight" : "text-xl font-bold tracking-tight text-slate-900"}>
          {isReport ? "Academic pathway summary" : "Student summary"}
        </h1>
        <p className={`mt-1 ${isReport ? "text-sm text-slate-600" : "text-sm text-slate-600"}`}>
          Student ID: <span className="font-mono font-semibold">{studentId}</span>
          {generatedAt ? (
            <>
              {" "}
              · Generated {new Date(generatedAt).toLocaleString()}
            </>
          ) : null}
        </p>
        {finalSummaryLine ? (
          <p
            className={`mt-4 text-sm font-medium leading-relaxed text-slate-800 ${
              isReport ? "rounded-lg border border-slate-200 bg-white px-4 py-3" : "rounded-xl bg-slate-50/90 px-4 py-3 ring-1 ring-slate-200/80"
            }`}
          >
            {finalSummaryLine}
          </p>
        ) : null}
      </div>

      <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Academic context</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Grade</dt>
            <dd className="text-sm text-slate-900">{grade ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Semester</dt>
            <dd className="text-sm text-slate-900">{semester ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Confidence (self-report)</dt>
            <dd className="text-sm text-slate-900">{selfReportedAcademicConfidence ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Workload tolerance</dt>
            <dd className="text-sm text-slate-900">{workloadTolerance ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Main destination focus</dt>
            <dd className="text-sm text-slate-900">{mainCountry ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500">Goal clarity</dt>
            <dd className="text-sm text-slate-900">{goalClarity ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Goals & interests</h2>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Interests</dt>
            <dd className="text-sm text-slate-900">{formatList(interests)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Career goals</dt>
            <dd className="text-sm text-slate-900">{formatList(careerGoals)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Decision style</dt>
            <dd className="text-sm text-slate-900">
              {[priorityStyle, optimizationTarget, riskPreference].filter(Boolean).join(" · ") || "—"}
            </dd>
          </div>
        </dl>
      </Card>

      {!bundle ? (
        <Card>
          <p className="text-sm text-slate-600">No recommendation output is stored for this session yet.</p>
        </Card>
      ) : (
        <>
          <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recommendation overview</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-500">Best fit</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                    Fit signal: {confidenceBand(bundle.bestFit.confidence.overall)}
                  </span>
                  <span className="text-xs text-slate-500">{bundle.bestFit.confidenceExplanation}</span>
                </div>
                <PathBlock rec={bundle.bestFit} answers={answers} />
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this path offers</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {buildWhatYouGain(bundle.bestFit as PathRecommendation, answers)
                      .slice(0, 4)
                      .map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                  </ul>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500">Balanced alternative</h3>
                  <div className="mt-2">
                    <PathBlock rec={bundle.balanced} answers={answers} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-500">Stretch alternative</h3>
                  <div className="mt-2">
                    <PathBlock rec={bundle.stretch} answers={answers} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Why this path can work</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{bundle.bestFit.explanation}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{bundle.bestFit.futureImpactSummary}</p>
          </Card>

          <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cautions & trade-offs</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {bundle.bestFit.softWarnings?.length
                ? bundle.bestFit.softWarnings.map((w, i) => <li key={i}>{w}</li>)
                : bundle.bestFit.tradeOffs.slice(0, 4).map((w, i) => <li key={i}>{w}</li>)}
            </ul>
            {bundle.bestFit.whyMayFeelHard?.length ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-amber-800">Workload / pace</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {bundle.bestFit.whyMayFeelHard.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <Card className={isReport ? "rounded-lg border border-slate-200 shadow-none ring-0" : ""}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Suggested next steps</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {bundle.bestFit.actionSteps.slice(0, 8).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            {bundle.bestFit.alternatives?.length ? (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">Other mixes considered</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {bundle.bestFit.alternatives.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </>
      )}

      {isReport ? (
        notes.length > 0 ? (
          <Card className="rounded-lg border border-slate-200 shadow-none ring-0">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Counselor notes</h2>
            <ul className="mt-3 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="border-l-2 border-teal-400 pl-3">
                  <p className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{n.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="rounded-lg border border-dashed border-slate-200 shadow-none ring-0">
            <p className="text-sm text-slate-500">No counselor notes on file.</p>
          </Card>
        )
      ) : null}

      {isReport ? (
        <p className="text-center text-xs text-slate-500">
          SAIS Academic Navigator · Confidential counselor summary · Not an official transcript
        </p>
      ) : null}
    </div>
  );
}
