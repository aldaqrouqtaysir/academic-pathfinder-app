"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PathRecommendation } from "@/lib/domain/models/recommendations";
import { StudentHeader } from "@/components/student/StudentHeader";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { courseName, categoryLabel } from "@/lib/student/display";

function confidenceBand(value: number) {
  if (value >= 0.75) return "High";
  if (value >= 0.5) return "Medium";
  return "Low";
}

function prettyKind(kind: PathRecommendation["kind"]) {
  if (kind === "bestFit") return "Best Fit";
  if (kind === "balanced") return "Balanced";
  return "Stretch";
}

function confidenceTone(band: string) {
  if (band === "High") return "success";
  if (band === "Medium") return "primary";
  return "warning";
}

function CategorySelectionChips({ rec }: { rec: PathRecommendation }) {
  const entries = Object.entries(rec.selections.categorySelections ?? {});
  if (!entries.length) return <Chip label="Guidance mode (Grades 9–10)" tone="teal" />;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([k, v]) => (
        <Chip key={k} label={`${categoryLabel(k as any)}: ${courseName(v)}`} tone="slate" />
      ))}
    </div>
  );
}

function RecommendationCard({ rec, defaultOpen = false }: { rec: PathRecommendation; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const band = confidenceBand(rec.confidence.overall);
  return (
    <Card
      className={
        rec.kind === "bestFit"
          ? "rounded-2xl bg-white p-6 shadow-sm ring-2 ring-teal-200"
          : "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{prettyKind(rec.kind)}</h3>
            {rec.kind === "bestFit" ? <Badge tone="primary">Recommended</Badge> : null}
            <Badge tone="neutral">{rec.label}</Badge>
            <Badge tone={confidenceTone(band) as any}>Confidence: {band}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-700">{rec.explanation}</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(!open)}>{open ? "Collapse" : "Expand"}</Button>
      </div>

      <div className="mt-4">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Selected category options</p>
          <div className="mt-2">
            <CategorySelectionChips rec={rec} />
          </div>
        </div>
      </div>

      {open ? (
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">What this path prioritizes</p>
              <p className="mt-1 text-slate-700">
                {rec.rationale.topContributingFactors.map((f) => f.label).slice(0, 3).join(" · ") || "Balanced profile fit"}
              </p>
            </div>

            {rec.whyMayNotFit.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Why it may not fit</p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {rec.whyMayNotFit.slice(0, 4).map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ) : null}

            {rec.whyMayFeelHard.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Why it may feel hard</p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {rec.whyMayFeelHard.slice(0, 4).map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ) : null}

            {rec.tradeOffs.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Trade-offs</p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {rec.tradeOffs.slice(0, 4).map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Future impact</p>
              <p className="mt-1 text-slate-700">{rec.futureImpactSummary}</p>
            </div>

            {rec.continuationSuggestions.length ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Continuation suggestions</p>
                <ul className="mt-1 list-disc pl-5 text-slate-700">
                  {rec.continuationSuggestions.slice(0, 4).map((c) => (
                    <li key={`${c.fromCourseCode}-${c.toCourseCode}`}>
                      {courseName(c.fromCourseCode)} → {courseName(c.toCourseCode)} ({c.kind})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Confidence</p>
              <p className="mt-1 text-slate-700">{band} ({Math.round(rec.confidence.overall * 100)}%)</p>
              <p className="mt-1 text-slate-600">{rec.confidenceExplanation}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [compareWith, setCompareWith] = useState<"balanced" | "stretch">("balanced");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/student/active-plan");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!json?.activeSession?.outputs?.bundle) {
        router.push("/intake");
        return;
      }
      setSession(json.activeSession);
      setLoading(false);
    })();
  }, [router]);

  const bundle = session?.outputs?.bundle;
  const compareTarget = useMemo(() => {
    if (!bundle) return null;
    return compareWith === "balanced" ? bundle.balanced : bundle.stretch;
  }, [bundle, compareWith]);

  if (loading) {
    return <div className="min-h-screen px-4 py-12 text-center text-sm text-slate-500">Loading your results...</div>;
  }

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Your recommendation results</h1>
          <p className="mt-1 text-sm text-slate-600">
            This is a common general path — consider whether it aligns with your long-term plans.
          </p>
        </div>

        <RecommendationCard rec={bundle.bestFit} defaultOpen />

        <div className="mt-4 grid gap-4">
          <RecommendationCard rec={bundle.balanced} />
          <RecommendationCard rec={bundle.stretch} />
        </div>

        <div className="mt-6">
          <Card className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold">Path comparison</h3>
            <p className="mt-1 text-sm text-slate-600">Compare Best Fit side-by-side with one alternative path.</p>
            <div className="mt-3">
              <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={compareWith} onChange={(e) => setCompareWith(e.target.value as "balanced" | "stretch")}>
                <option value="balanced">Balanced</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
            {compareTarget ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Best Fit</p>
                    <Badge tone="primary">Recommended</Badge>
                  </div>
                  <div className="mt-2"><CategorySelectionChips rec={bundle.bestFit} /></div>
                  <p className="mt-3 text-slate-700"><span className="font-medium">Confidence:</span> {confidenceBand(bundle.bestFit.confidence.overall)}</p>
                  <p className="mt-1 text-slate-700"><span className="font-medium">Future impact:</span> {bundle.bestFit.futureImpactSummary}</p>
                  <p className="mt-1 text-slate-700"><span className="font-medium">Trade-offs:</span> {bundle.bestFit.tradeOffs.join(" ") || "None noted."}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{compareWith === "balanced" ? "Balanced" : "Stretch"}</p>
                    <Badge tone="neutral">Alternative</Badge>
                  </div>
                  <div className="mt-2"><CategorySelectionChips rec={compareTarget} /></div>
                  <p className="mt-3 text-slate-700"><span className="font-medium">Confidence:</span> {confidenceBand(compareTarget.confidence.overall)}</p>
                  <p className="mt-1 text-slate-700"><span className="font-medium">Future impact:</span> {compareTarget.futureImpactSummary}</p>
                  <p className="mt-1 text-slate-700"><span className="font-medium">Trade-offs:</span> {compareTarget.tradeOffs.join(" ") || "None noted."}</p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

