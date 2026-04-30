"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { PathRecommendation, ScoringFactorKey } from "@/lib/domain/models/recommendations";
import { StudentHeader } from "@/components/student/StudentHeader";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { courseName, categoryLabel } from "@/lib/student/display";
import { pathMetricBars, pathSummaryTopRow, strengthCaption } from "@/lib/student/pathMetrics";
import {
  buildWhatYouGain,
  buildWowMessage,
  inferRiskLevel,
  quickAdjustGuide,
  riskLevelLabel,
  type QuickAdjustMode,
  type RiskLevel,
} from "@/lib/student/recommendationPolish";
import {
  IconArrowRight,
  IconBookOpen,
  IconGauge,
  IconGlobe,
  IconLayers,
  IconRoute,
  IconSparkles,
  IconTarget,
  IconTrophy,
  IconZap,
} from "@/components/icons/StudentIcons";

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

function confidenceTone(band: string): "primary" | "success" | "warning" | "neutral" {
  if (band === "High") return "success";
  if (band === "Medium") return "primary";
  return "warning";
}

function RiskPill({ level }: { level: RiskLevel }) {
  const cls =
    level === "low"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
      : level === "moderate"
        ? "bg-amber-50 text-amber-900 ring-amber-200/80"
        : "bg-rose-50 text-rose-900 ring-rose-200/80";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cls}`}
      title="How demanding this path may feel — not a grade prediction."
    >
      {riskLevelLabel(level)}
    </span>
  );
}

function futureImpactBullets(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function splitFutureImpact(summary: string): { body: string; who: string | null } {
  const marker = "Best for:";
  const i = summary.indexOf(marker);
  if (i === -1) return { body: summary, who: null };
  const body = summary.slice(0, i).trim().replace(/[.;]\s*$/, "");
  const who = summary
    .slice(i + marker.length)
    .trim()
    .replace(/\.$/, "");
  return { body, who };
}

function truncateBullet(s: string, max = 96) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function sentencesTwoMax(text: string, maxLen = 128): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.slice(0, 2).map((p) => truncateBullet(p, maxLen));
}

function quickOverviewTriples(rec: PathRecommendation) {
  const fb = rec.rationale.factorBreakdown;
  const maxPoints = Math.max(1, ...fb.map((f) => f.points));
  const row = (key: ScoringFactorKey, title: string, emoji: string, Icon: ComponentType<{ className?: string }>) => {
    const pts = fb.find((f) => f.key === key)?.points ?? 0;
    const pct = Math.round((pts / maxPoints) * 100);
    return { key, title, emoji, Icon, pct, band: strengthCaption(pct) };
  };
  return [
    row("pathway_alignment", "Goal match", "🎯", IconTarget),
    row("workload_fit", "Workload", "⚖️", IconLayers),
    row("country_alignment", "Flexibility", "🌍", IconGlobe),
  ];
}

function SectionHeading({ emoji, title, kicker }: { emoji: string; title: string; kicker?: string }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <span className="text-xl leading-none" aria-hidden>
        {emoji}
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
        {kicker ? <p className="mt-0.5 text-xs font-medium leading-snug text-slate-600">{kicker}</p> : null}
      </div>
    </div>
  );
}

function isGuidanceMode(rec: PathRecommendation) {
  return Object.keys(rec.selections.categorySelections ?? {}).length === 0;
}

const guidanceCardIcons = [IconTarget, IconGlobe, IconZap, IconBookOpen] as const;

function GuidanceHero({ rec, answers }: { rec: PathRecommendation; answers: Record<string, unknown> }) {
  const factors = rec.rationale.topContributingFactors;
  const { body, who } = splitFutureImpact(rec.futureImpactSummary);
  const futureBits = futureImpactBullets(body || rec.futureImpactSummary).map((x) => truncateBullet(x));
  const wow = buildWowMessage(answers, rec);
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);
  const gains = buildWhatYouGain(rec, answers);
  const wowLines = sentencesTwoMax(wow);
  const thingsToKnow = [
    ...rec.whyMayFeelHard.slice(0, 2).map((x) => truncateBullet(x)),
    ...rec.tradeOffs.slice(0, 2).map((x) => truncateBullet(x)),
  ].filter(Boolean);

  return (
    <div
      id="hero-best-fit"
      className="apf-fade-up relative overflow-hidden rounded-3xl border-2 border-indigo-400/55 bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/50 p-6 shadow-[0_28px_64px_-14px_rgba(79,70,229,0.18)] ring-1 ring-indigo-200/50 transition-shadow duration-300 hover:shadow-[0_32px_72px_-12px_rgba(79,70,229,0.22)] sm:p-9"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-300/35 to-teal-300/25 blur-3xl" />

      <section className="relative border-b border-indigo-100/90 pb-8 text-center sm:text-left">
        <SectionHeading emoji="🧭" title="Recommended path summary" kicker="SAIS · Grades 9–10 · guidance mode" />
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your foundation roadmap</h2>
            <div className="mx-auto mt-4 max-w-2xl space-y-2 sm:mx-0">
              {wowLines.map((line, i) => (
                <p key={`g-wow-${i}`} className="text-sm font-semibold leading-snug text-indigo-950 line-clamp-2">
                  {line}
                </p>
              ))}
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-snug text-slate-600 line-clamp-2 sm:mx-0">
          {truncateBullet(rec.confidenceExplanation, 140)}
        </p>
        <div className="mx-auto mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
          <Badge tone="primary">Guidance</Badge>
          <Badge tone="neutral">{rec.label}</Badge>
          <RiskPill level={risk} />
        </div>
        <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-indigo-200/80 bg-white/95 p-4 text-sm font-semibold leading-snug text-slate-800 shadow-sm ring-1 ring-indigo-100/60 sm:mx-0">
          {truncateBullet(rec.explanation, 320)}
        </div>
      </section>

      <section className="relative mt-8">
        <SectionHeading emoji="⚡" title="Quick overview" kicker="What to focus on now — and what comes next" />
        <div className="grid gap-3 sm:grid-cols-2">
          {factors.slice(0, 4).map((f, i) => {
            const Icon = guidanceCardIcons[i] ?? IconSparkles;
            const tones = [
              "border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50/80 ring-teal-200/60",
              "border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50/70 ring-violet-200/60",
              "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 ring-amber-200/50",
            ];
            return (
              <div
                key={f.key}
                className={`rounded-2xl border p-4 shadow-sm ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${tones[i % tones.length]}`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-teal-800 shadow-sm ring-1 ring-slate-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">{f.label}</span>
                </div>
                <p className="mt-2 text-xs leading-snug text-slate-700 line-clamp-2">{truncateBullet(f.evidence[0] ?? "", 120)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative mt-8 rounded-2xl border border-slate-200/80 bg-white/85 p-5 ring-1 ring-violet-100/80">
        <SectionHeading emoji="📚" title="Your plan" kicker="Foundations & next steps (no locked course grid yet)" />
        <CategoryGrid rec={rec} />
      </section>

      <details className="relative mt-6 group rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-sm open:bg-amber-50/60">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-amber-950 marker:content-none [&::-webkit-details-marker]:hidden">
          <span aria-hidden>💡</span>
          <span className="flex-1">Things to know</span>
          <span className="text-xs font-medium text-amber-800/80 group-open:hidden">Show</span>
          <span className="hidden text-xs font-medium text-amber-800/80 group-open:inline">Hide</span>
        </summary>
        <ul className="space-y-2 border-t border-amber-100/90 px-4 pb-4 pt-3 text-xs text-amber-950">
          {thingsToKnow.slice(0, 5).map((t, i) => (
            <li key={`g-tk-${i}`} className="flex gap-2">
              <span className="text-amber-600">▸</span>
              <span className="leading-snug line-clamp-2">{t}</span>
            </li>
          ))}
        </ul>
      </details>

      <section className="relative mt-8">
        <SectionHeading emoji="✨" title="What you gain" kicker="Skills, doors, and momentum" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {gains.slice(0, 4).map((line) => (
            <li
              key={line}
              className="flex gap-2 rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 to-white px-3 py-2.5 text-xs font-medium text-slate-800 shadow-sm ring-1 ring-teal-100/60"
            >
              <span className="text-teal-600">▸</span>
              <span className="leading-snug line-clamp-2">{truncateBullet(line, 110)}</span>
            </li>
          ))}
        </ul>
      </section>

      <details className="relative mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 shadow-sm open:bg-white/90">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          📂 More — next steps, future doors, ideas
        </summary>
        <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3 text-xs text-slate-700">
          <div>
            <p className="font-bold text-slate-800">Do next</p>
            <ul className="mt-2 space-y-1.5">
              {rec.actionSteps.map((step, i) => (
                <li key={`${i}-${step.slice(0, 16)}`} className="flex gap-2 leading-snug">
                  <span className="font-bold text-teal-700">{i + 1}.</span>
                  <span className="line-clamp-2">{truncateBullet(step, 120)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-800">Future doors</p>
            <ul className="mt-2 space-y-1">
              {futureBits.slice(0, 3).map((line) => (
                <li key={line} className="flex gap-2 leading-snug line-clamp-2">
                  <span className="text-violet-600">▸</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {who ? (
              <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600 line-clamp-2">
                <span className="font-semibold text-slate-800">Best for: </span>
                {truncateBullet(who, 100)}
              </p>
            ) : null}
          </div>
          <p className="leading-snug line-clamp-2">{truncateBullet(rec.explanation, 160)}</p>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Ideas</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {rec.alternatives.slice(0, 6).map((a) => (
                <li key={a}>
                  <Chip tone="teal" label={truncateBullet(a, 40)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}

function CategoryGrid({ rec, muted }: { rec: PathRecommendation; muted?: boolean }) {
  const entries = Object.entries(rec.selections.categorySelections ?? {});
  if (!entries.length) {
    return (
      <p className={`text-xs font-medium leading-snug ${muted ? "text-slate-500" : "text-slate-600"} line-clamp-2`}>
        Guidance mode — focus on foundations; your counselor helps lock courses next.
      </p>
    );
  }
  const palettes = muted
    ? ["border-slate-200 bg-slate-50/90 text-slate-800 ring-slate-100"]
    : [
        "border-teal-300/80 bg-gradient-to-r from-teal-50 to-cyan-50/70 text-slate-900 ring-teal-200/60",
        "border-violet-300/70 bg-gradient-to-r from-violet-50 to-indigo-50/60 text-slate-900 ring-violet-200/50",
        "border-amber-300/70 bg-gradient-to-r from-amber-50 to-orange-50/50 text-slate-900 ring-amber-200/45",
        "border-sky-300/70 bg-gradient-to-r from-sky-50 to-blue-50/50 text-slate-900 ring-sky-200/50",
      ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {entries.map(([k, v], i) => (
        <div
          key={k}
          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-sm ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
            muted ? palettes[0] : palettes[i % palettes.length]
          }`}
        >
          <span className="font-semibold text-slate-800">{categoryLabel(k as never)}</span>
          <span className="text-right text-sm font-bold text-slate-900">{courseName(v)}</span>
        </div>
      ))}
    </div>
  );
}

function MetricRow({
  label,
  caption,
  hint,
  pct,
  icon: Icon,
}: {
  label: string;
  caption: string;
  hint?: string;
  pct: number;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-violet-600" /> : null}
          {label}
        </span>
        <span className="shrink-0 rounded-full bg-gradient-to-r from-teal-50 to-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-900 ring-1 ring-teal-200/60">
          {caption}
        </span>
      </div>
      {hint ? <p className="text-[11px] leading-snug text-slate-500">{hint}</p> : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const metricIcons: Record<string, ComponentType<{ className?: string }>> = {
  "How the load feels": IconLayers,
  "Challenge level": IconGauge,
  "Your direction": IconRoute,
  "Future doors": IconSparkles,
  "Competitive edge": IconTrophy,
};

function RecommendationHero({ rec, answers }: { rec: PathRecommendation; answers: Record<string, unknown> }) {
  if (isGuidanceMode(rec)) return <GuidanceHero rec={rec} answers={answers} />;

  const band = confidenceBand(rec.confidence.overall);
  const metrics = pathMetricBars(rec);
  const topFactors = rec.rationale.topContributingFactors.slice(0, 3);
  const { body: impactBody, who: whoLine } = splitFutureImpact(rec.futureImpactSummary);
  const impactLines = futureImpactBullets(impactBody || rec.futureImpactSummary).slice(0, 3);
  const wow = buildWowMessage(answers, rec);
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);
  const gains = buildWhatYouGain(rec, answers);
  const wowLines = sentencesTwoMax(wow);
  const overview = quickOverviewTriples(rec);
  const thingsToKnow = [
    ...rec.whyMayFeelHard.slice(0, 3).map((x) => truncateBullet(x)),
    ...rec.tradeOffs.slice(0, 2).map((x) => truncateBullet(x)),
    ...(rec.whyMayNotFit[0] ? [truncateBullet(`Heads-up: ${rec.whyMayNotFit[0]}`, 100)] : []),
  ].filter(Boolean);

  const overviewCardTone = [
    "border-teal-300/80 bg-gradient-to-br from-teal-50 via-white to-cyan-50/70 ring-teal-200/55",
    "border-violet-300/75 bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 ring-violet-200/50",
    "border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 ring-amber-200/45",
  ];

  return (
    <div
      id="hero-best-fit"
      className="apf-fade-up relative overflow-hidden rounded-3xl border-2 border-teal-500/55 bg-gradient-to-br from-white via-teal-50/50 to-violet-100/35 p-6 shadow-[0_28px_64px_-14px_rgba(15,118,110,0.22)] ring-1 ring-teal-300/40 transition-shadow duration-300 hover:shadow-[0_32px_72px_-12px_rgba(15,118,110,0.26)] sm:p-9"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400/25 to-violet-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

      <section className="relative border-b border-teal-100/80 pb-8 text-center sm:text-left">
        <SectionHeading emoji="🎯" title="Recommended path summary" kicker="Your best fit — built from your answers" />
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-violet-600 text-white shadow-lg ring-4 ring-white/90 transition duration-300 hover:scale-[1.03]">
            <IconSparkles className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">This is your recommended SAIS path</h2>
            <div className="mx-auto mt-4 max-w-2xl space-y-2 sm:mx-0">
              {wowLines.map((line, i) => (
                <p key={`wow-${i}`} className="text-sm font-semibold leading-snug text-teal-950 line-clamp-2">
                  {line}
                </p>
              ))}
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-snug text-slate-600 line-clamp-2 sm:mx-0">
              {truncateBullet(rec.confidenceExplanation, 140)}
            </p>
            <div className="mx-auto mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge tone="primary">Primary pick</Badge>
              <Badge tone="neutral">{rec.label}</Badge>
              <RiskPill level={risk} />
              <Badge tone={confidenceTone(band)}>
                {band === "High" ? "Strong fit" : band === "Medium" ? "Solid fit" : "Room to grow"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-8">
        <SectionHeading emoji="⚡" title="Quick overview" kicker="Goal match · workload · flexibility" />
        <div className="grid gap-3 sm:grid-cols-3">
          {overview.map((row, idx) => (
            <div
              key={row.key}
              style={{ animationDelay: `${idx * 60}ms` }}
              className={`apf-fade-up rounded-2xl border p-4 shadow-md ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${overviewCardTone[idx % overviewCardTone.length]}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg" aria-hidden>
                  {row.emoji}
                </span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-900 ring-1 ring-teal-200/60">
                  {row.band}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <row.Icon className="h-4 w-4 text-violet-700" />
                <span className="text-sm font-bold text-slate-900">{row.title}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-violet-500 transition-all duration-700"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-8 rounded-2xl border border-teal-200/70 bg-gradient-to-br from-white/95 to-teal-50/30 p-5 ring-1 ring-teal-100/80">
        <SectionHeading emoji="📚" title="Your plan" kicker="Courses by category" />
        <CategoryGrid rec={rec} />
      </section>

      {rec.selectionBecause && rec.selectionBecause.length > 0 ? (
        <details className="relative mt-6 group rounded-2xl border-2 border-cyan-200/70 bg-gradient-to-br from-cyan-50/40 to-white shadow-md open:shadow-lg" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <span aria-hidden>💬</span>
            <span className="flex-1">Why these picks — for you</span>
            <span className="text-xs font-medium text-cyan-800/80 group-open:hidden">Show</span>
            <span className="hidden text-xs font-medium text-cyan-800/80 group-open:inline">Hide</span>
          </summary>
          <ul className="space-y-2.5 border-t border-cyan-100/80 px-4 pb-4 pt-3 text-xs font-medium leading-snug text-slate-800">
            {rec.selectionBecause.map((line, i) => (
              <li key={`sb-${i}`} className="flex gap-2">
                <span className="shrink-0 text-cyan-600">▸</span>
                <span className="line-clamp-4">{line}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <details className="relative mt-6 group rounded-2xl border border-amber-200/75 bg-amber-50/45 shadow-sm open:bg-amber-50/65">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-amber-950 marker:content-none [&::-webkit-details-marker]:hidden">
          <span aria-hidden>💡</span>
          <span className="flex-1">Things to know</span>
          <span className="text-xs font-medium text-amber-900/70 group-open:hidden">Show</span>
          <span className="hidden text-xs font-medium text-amber-900/70 group-open:inline">Hide</span>
        </summary>
        <ul className="space-y-2 border-t border-amber-100/90 px-4 pb-4 pt-3 text-xs text-amber-950">
          {thingsToKnow.slice(0, 6).map((t, i) => (
            <li key={`tk-${i}`} className="flex gap-2">
              <span className="text-amber-600">▸</span>
              <span className="leading-snug line-clamp-2">{t}</span>
            </li>
          ))}
        </ul>
      </details>

      <section className="relative mt-8">
        <SectionHeading emoji="✨" title="What you gain" kicker="Outcomes that match your goals" />
        <ul className="grid gap-2 sm:grid-cols-2">
          {gains.map((line) => (
            <li
              key={line}
              className="flex gap-2 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/90 to-white px-3 py-2.5 text-xs font-medium text-slate-800 shadow-sm ring-1 ring-violet-100/70 transition duration-200 hover:shadow-md"
            >
              <span className="text-violet-600">▸</span>
              <span className="leading-snug line-clamp-2">{truncateBullet(line, 120)}</span>
            </li>
          ))}
        </ul>
      </section>

      <details className="relative mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/60 shadow-sm open:bg-white/95">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          <IconBookOpen className="h-4 w-4 text-teal-700" />
          <span className="flex-1">More — why it fits, next steps, fit bars & ideas</span>
          <span className="text-xs font-medium text-slate-500">Optional</span>
        </summary>
        <div className="space-y-5 border-t border-slate-100 px-4 pb-5 pt-4 text-xs text-slate-700">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-900">
              <IconTarget className="h-3.5 w-3.5" />
              Why this fits
            </p>
            <ul className="mt-2 space-y-1.5">
              {topFactors.map((f) => (
                <li key={f.key} className="flex gap-2 leading-snug">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span className="line-clamp-2">{truncateBullet(f.evidence[0] ?? f.label, 130)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-900">
              <IconArrowRight className="h-3.5 w-3.5" />
              Do this next
            </p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {rec.actionSteps.slice(0, 4).map((step, i) => (
                <li key={`${i}-${step.slice(0, 16)}`} className="flex gap-2 rounded-lg bg-teal-50/60 px-2 py-1.5 ring-1 ring-teal-100/60">
                  <span className="font-bold text-teal-700">{i + 1}.</span>
                  <span className="line-clamp-2">{truncateBullet(step, 110)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-violet-900">
              <IconGlobe className="h-3.5 w-3.5" />
              Where it leads
            </p>
            <ul className="mt-2 space-y-1">
              {impactLines.map((line) => (
                <li key={line} className="flex gap-2 leading-snug line-clamp-2">
                  <span className="text-violet-600">▸</span>
                  <span>{truncateBullet(line, 120)}</span>
                </li>
              ))}
            </ul>
            {whoLine ? (
              <p className="mt-2 border-t border-violet-100 pt-2 text-xs text-slate-600 line-clamp-2">
                <span className="font-semibold text-slate-800">Best for: </span>
                {truncateBullet(whoLine, 100)}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-violet-100 bg-white/90 p-4 ring-1 ring-violet-50">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-800">
              <IconGauge className="h-3.5 w-3.5 text-violet-600" />
              Fit snapshot
            </p>
            <p className="mt-1 text-[10px] text-slate-500">From your answers — not grades.</p>
            <div className="mt-3 grid gap-3">
              {metrics.slice(0, 5).map((m) => (
                <MetricRow
                  key={m.label}
                  label={m.label}
                  hint={m.hint}
                  caption={m.caption}
                  pct={m.pct}
                  icon={metricIcons[m.label]}
                />
              ))}
            </div>
          </div>
          <p className="leading-snug line-clamp-3">{truncateBullet(rec.explanation, 220)}</p>
          {rec.continuationSuggestions.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Next-semester ideas</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {rec.continuationSuggestions.slice(0, 8).map((c) => (
                  <li key={`${c.fromCourseCode}-${c.toCourseCode}`}>
                    <Chip tone="teal" label={`${courseName(c.fromCourseCode)} → ${courseName(c.toCourseCode)}`} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function SecondaryPathCard({
  rec,
  answers,
  anchorId,
}: {
  rec: PathRecommendation;
  answers: Record<string, unknown>;
  anchorId: string;
}) {
  const [open, setOpen] = useState(false);
  const band = confidenceBand(rec.confidence.overall);
  const metrics = pathMetricBars(rec);
  const summaryRow = pathSummaryTopRow(rec);
  const risk = inferRiskLevel(rec, answers.workloadTolerance as string | undefined);
  const gains = buildWhatYouGain(rec, answers);

  return (
    <div id={anchorId} className="scroll-mt-28">
      <Card className="rounded-2xl border-2 border-indigo-100/90 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 p-5 shadow-md transition duration-300 hover:border-violet-200/80 hover:shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base" aria-hidden>
                {rec.kind === "balanced" ? "⚖️" : "🚀"}
              </span>
              <h3 className="text-base font-bold text-slate-900">{prettyKind(rec.kind)}</h3>
              <Badge tone="neutral">{rec.label}</Badge>
              <RiskPill level={risk} />
              <Badge tone={confidenceTone(band)}>
                {band === "High" ? "Strong fit" : band === "Medium" ? "Solid fit" : "Room to grow"}
              </Badge>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {rec.rationale.topContributingFactors.slice(0, 2).map((f) => (
                <li key={f.key} className="flex gap-2 leading-snug line-clamp-2">
                  <span className="text-teal-500">▸</span>
                  <span>{truncateBullet(f.evidence[0] ?? f.label, 110)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {summaryRow.map((row) => (
                <span
                  key={row.key}
                  className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900"
                >
                  {row.label}: {row.band}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 rounded-xl border-violet-200 bg-white font-semibold shadow-sm transition duration-200 hover:scale-[1.02]"
            onClick={() => setOpen(!open)}
          >
            {open ? "Less" : "Full detail"}
          </Button>
        </div>
        {open ? (
          <div className="mt-4 space-y-4 border-t border-slate-200/80 pt-4 text-xs text-slate-700">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">What you gain</p>
              <ul className="mt-2 space-y-1">
                {gains.slice(0, 4).map((g, i) => (
                  <li key={`${i}-${g.slice(0, 12)}`} className="flex gap-2 leading-snug line-clamp-2">
                    <span className="text-indigo-500">▸</span>
                    <span>{truncateBullet(g, 100)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-3">
                {metrics.slice(0, 3).map((m) => (
                  <MetricRow
                    key={m.label}
                    label={m.label}
                    hint={m.hint}
                    caption={m.caption}
                    pct={m.pct}
                    icon={metricIcons[m.label]}
                  />
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Course picks</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(rec.selections.categorySelections ?? {}).length ? (
                    Object.entries(rec.selections.categorySelections ?? {}).map(([k, v]) => (
                      <Chip key={k} tone="teal" label={truncateBullet(`${categoryLabel(k as never)}: ${courseName(v)}`, 48)} />
                    ))
                  ) : (
                    <span className="text-xs text-slate-600">Guidance mode</span>
                  )}
                </div>
              </div>
            </div>
            {rec.selectionBecause && rec.selectionBecause.length > 0 ? (
              <div className="rounded-xl border border-cyan-200/70 bg-cyan-50/40 p-3 ring-1 ring-cyan-100/50">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-900">Why these picks</p>
                <ul className="mt-2 space-y-1.5">
                  {rec.selectionBecause.slice(0, 5).map((line, i) => (
                    <li key={`alt-sb-${i}`} className="flex gap-2 leading-snug text-slate-800">
                      <span className="text-cyan-600">▸</span>
                      <span className="line-clamp-3">{truncateBullet(line, 140)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="leading-snug line-clamp-3 text-slate-600">{truncateBullet(rec.explanation, 200)}</p>
            <p className="leading-snug line-clamp-2 text-slate-500">{truncateBullet(rec.futureImpactSummary, 160)}</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

type ActiveSession = {
  answers?: Record<string, unknown>;
  outputs?: { bundle?: unknown };
};

function QuickExploreBar(props: {
  enabled: boolean;
  onAdjust: (mode: QuickAdjustMode) => void;
  banner: string | null;
  onDismissBanner: () => void;
}) {
  if (!props.enabled) return null;
  return (
    <div className="apf-fade-up mt-10 rounded-2xl border-2 border-violet-300/50 bg-gradient-to-r from-violet-50/95 via-white to-teal-50/80 p-5 shadow-lg shadow-violet-200/25 ring-1 ring-violet-200/40 backdrop-blur-sm transition duration-300 hover:shadow-xl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg" aria-hidden>
          🔭
        </span>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-900">Quick explore</p>
      </div>
      <p className="mt-2 max-w-xl text-xs font-medium leading-snug text-slate-600 line-clamp-2">
        Jump to a path we already computed — no redo needed.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 font-semibold text-teal-900 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-md"
          onClick={() => props.onAdjust("easier")}
        >
          Easier ride
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 font-semibold text-violet-900 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-md"
          onClick={() => props.onAdjust("competitive")}
        >
          More competitive
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 font-semibold text-amber-950 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-md"
          onClick={() => props.onAdjust("flexible")}
        >
          Stay flexible
        </Button>
      </div>
      {props.banner ? (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-teal-200/80 bg-teal-50/95 px-4 py-3 text-xs text-teal-950 ring-1 ring-teal-200/70">
          <p className="leading-snug line-clamp-3">{props.banner}</p>
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-teal-800 underline decoration-teal-400 hover:text-teal-950"
            onClick={props.onDismissBanner}
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [compareWith, setCompareWith] = useState<"balanced" | "stretch">("balanced");
  const [adjustBanner, setAdjustBanner] = useState<string | null>(null);
  const [freshCelebration, setFreshCelebration] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    if (u.searchParams.get("fresh") === "1") {
      setFreshCelebration(true);
      u.searchParams.delete("fresh");
      const next = u.pathname + (u.search ? u.search : "");
      router.replace(next || "/dashboard", { scroll: false });
    }
  }, [router]);

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

  const bundle = session?.outputs?.bundle as
    | { bestFit: PathRecommendation; balanced: PathRecommendation; stretch: PathRecommendation }
    | undefined;
  const compareTarget = useMemo(() => {
    if (!bundle) return null;
    return compareWith === "balanced" ? bundle.balanced : bundle.stretch;
  }, [bundle, compareWith]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-50 via-cyan-50/50 to-teal-100/40 text-sm font-semibold text-slate-700">
        <span className="h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-teal-500 via-sky-500 to-violet-500 opacity-90 shadow-lg shadow-teal-900/20" />
        <span>Hang tight — your pathway is loading…</span>
      </div>
    );
  }

  if (!bundle) return null;

  const answers = session?.answers ?? {};
  const showQuickExplore = !isGuidanceMode(bundle.bestFit);

  function runQuickAdjust(mode: QuickAdjustMode) {
    const { scrollId, message } = quickAdjustGuide(mode);
    setAdjustBanner(message);
    requestAnimationFrame(() => {
      document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_55%_at_50%_-12%,rgba(34,211,238,0.2),transparent)]">
      <StudentHeader />
      <div className="apf-journey-shell">
        {freshCelebration ? (
          <div
            className="apf-fade-up mb-8 flex flex-col gap-3 rounded-2xl border-2 border-teal-300/60 bg-gradient-to-r from-teal-50 via-cyan-50 to-violet-50 px-5 py-4 shadow-lg ring-1 ring-teal-200/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            role="status"
          >
            <div>
              <p className="text-base font-bold text-teal-950">Your plan is ready 🎉</p>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-snug text-slate-700">
                Here&apos;s your personalized pathway — scroll to explore Best Fit first.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border-teal-200 bg-white font-semibold shadow-sm"
              onClick={() => setFreshCelebration(false)}
            >
              Let&apos;s go
            </Button>
          </div>
        ) : null}

        <header className="apf-fade-up mb-8 lg:mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl leading-none" aria-hidden>
              🎯
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">SAIS · Your pathway</p>
          </div>
          <h1 className="mt-2 bg-gradient-to-r from-slate-900 via-teal-800 to-cyan-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Your recommended path
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-snug text-slate-600 line-clamp-2">
            You made it — Best Fit is your home base. Peek at Balanced & Stretch when you want to compare.
          </p>
        </header>

        <RecommendationHero rec={bundle.bestFit} answers={answers} />

        <QuickExploreBar
          enabled={showQuickExplore}
          onAdjust={runQuickAdjust}
          banner={adjustBanner}
          onDismissBanner={() => setAdjustBanner(null)}
        />

        <details className="apf-fade-up group mt-10 rounded-2xl border-2 border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/40 shadow-md open:shadow-lg">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-sm font-bold text-indigo-950 marker:content-none [&::-webkit-details-marker]:hidden sm:px-5">
            <span aria-hidden>🔁</span>
            <span className="flex-1">Other paths — Balanced & Stretch</span>
            <span className="text-xs font-medium text-indigo-800/70 group-open:hidden">Show</span>
            <span className="hidden text-xs font-medium text-indigo-800/70 group-open:inline">Hide</span>
          </summary>
          <div className="border-t border-indigo-100/80 p-4 pt-3 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <SecondaryPathCard rec={bundle.balanced} answers={answers} anchorId="path-balanced" />
              <SecondaryPathCard rec={bundle.stretch} answers={answers} anchorId="path-stretch" />
            </div>
          </div>
        </details>

        <details className="apf-fade-up group mt-8 rounded-3xl border-2 border-slate-200/85 bg-white/95 shadow-lg shadow-slate-200/30 open:border-teal-200/55 sm:mt-10">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden sm:px-8 sm:py-5">
            <span className="text-xl" aria-hidden>
              ⚖️
            </span>
            <div className="min-w-0 flex-1 text-left">
              <h2 className="text-base font-bold text-slate-900">Side-by-side compare</h2>
              <p className="mt-0.5 text-xs font-medium leading-snug text-slate-600 line-clamp-2">
                Best Fit vs one alternative — open when you want the grid next to each other.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-teal-700 group-open:hidden">Open</span>
            <span className="hidden shrink-0 text-xs font-bold text-teal-700 group-open:inline">Close</span>
          </summary>
          <div className="border-t border-slate-200/80 px-5 pb-6 pt-4 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Compare with</span>
              <select
                className="rounded-xl border-2 border-teal-200/70 bg-teal-50/50 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:border-teal-300"
                value={compareWith}
                onChange={(e) => setCompareWith(e.target.value as "balanced" | "stretch")}
              >
                <option value="balanced">Balanced</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
            {compareTarget ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border-2 border-teal-300/60 bg-gradient-to-b from-teal-50/70 to-white p-5 shadow-sm ring-1 ring-teal-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Best Fit</span>
                    <Badge tone="primary">Primary</Badge>
                  </div>
                  <div className="mt-3">
                    <CategoryGrid rec={bundle.bestFit} />
                  </div>
                  <dl className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Fit</dt>
                      <dd className="font-bold text-slate-800">{confidenceBand(bundle.bestFit.confidence.overall)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Snapshot</dt>
                      <dd className="mt-1 text-slate-800">
                        <ul className="space-y-1">
                          {futureImpactBullets(splitFutureImpact(bundle.bestFit.futureImpactSummary).body)
                            .slice(0, 3)
                            .map((line, i) => (
                              <li key={`bf-${i}`} className="flex gap-2 leading-snug line-clamp-2">
                                <span className="text-teal-600">▸</span>
                                <span>{truncateBullet(line, 100)}</span>
                              </li>
                            ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-2xl border-2 border-violet-200/50 bg-gradient-to-b from-violet-50/40 to-slate-50/80 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{compareWith === "balanced" ? "Balanced" : "Stretch"}</span>
                    <Badge tone="neutral">Alt</Badge>
                  </div>
                  <div className="mt-3">
                    <CategoryGrid rec={compareTarget} muted />
                  </div>
                  <dl className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Fit</dt>
                      <dd className="font-bold text-slate-800">{confidenceBand(compareTarget.confidence.overall)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Snapshot</dt>
                      <dd className="mt-1 text-slate-700">
                        <ul className="space-y-1">
                          {futureImpactBullets(splitFutureImpact(compareTarget.futureImpactSummary).body)
                            .slice(0, 3)
                            .map((line, i) => (
                              <li key={`alt-${i}`} className="flex gap-2 leading-snug line-clamp-2">
                                <span className="text-violet-600">▸</span>
                                <span>{truncateBullet(line, 100)}</span>
                              </li>
                            ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </div>
  );
}
