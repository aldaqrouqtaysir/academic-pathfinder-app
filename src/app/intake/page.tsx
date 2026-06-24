"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { StudentHeader } from "@/components/student/StudentHeader";
import { Chip } from "@/components/ui/Chip";
import { ChoiceTile } from "@/components/student/ChoiceTile";
import { IntakePanel } from "@/components/student/IntakePanel";
import {
  getSemester2CurrentCoursePanels,
  hydrateCurrentSelectionsFromCodes,
  splitCurrentCoursesForApi,
} from "@/lib/student/intakeCurrentCourses";

/** Draft state — no default selections; user must choose before continuing. */
type IntakeFormDraft = {
  currentGrade?: 9 | 10 | 11 | 12;
  semester?: "Semester1" | "Semester2";
  currentSelections: Record<string, string>;
  strengths: string[];
  weaknesses: string[];
  selfReportedAcademicConfidence?: "Low" | "Medium" | "High";
  workloadTolerance?: "Low" | "Medium" | "High";
  interests: string[];
  careerGoals: string[];
  goalClarity?: "Low" | "Medium" | "High";
  mainCountry?: "UAE" | "Other" | "US" | "Egypt" | "Jordan";
  additionalCountries: string[];
  countryIntent?: "main_focus" | "keep_options_open" | "unsure";
  priorityStyle?: "strongest_path" | "balanced_path" | "safest_highest_grade" | "not_sure";
  optimizationTarget?:
    | "career_alignment"
    | "lighter_workload"
    | "university_competitiveness"
    | "keeping_options_open"
    | "higher_grades";
  preferencesToAvoid: string[];
  preferences: string[];
  futurePlans: string;
  riskPreference?: "Avoid risk" | "Balanced" | "Embrace stretch";
  scholarshipImportance?: "Low" | "Medium" | "High";
};

const initial: IntakeFormDraft = {
  currentSelections: {},
  strengths: [],
  weaknesses: [],
  interests: [],
  careerGoals: [],
  additionalCountries: [],
  preferencesToAvoid: [],
  preferences: [],
  futurePlans: "",
};

const JOURNEY_STEPS = [
  { label: "Academic context", marker: "01", blurb: "Start with grade, semester, confidence, and workload." },
  { label: "Interests & future", marker: "02", blurb: "Share what sparks curiosity and where you might be headed." },
  { label: "Decision style", marker: "03", blurb: "Choose how you want the plan to balance rigor, workload, and options." },
] as const;

const STRENGTH_OPTIONS = ["Math", "English", "Science", "Coding", "Arts", "Humanities"] as const;
const COUNTRY_OPTIONS = ["UAE", "US", "Egypt", "Jordan", "Other"] as const;

function migrateCountryCode(c: string): string {
  return c === "Qatar" ? "Other" : c;
}

function migrateStrengthWeaknessList(arr: string[]): string[] {
  return [...new Set(arr.map((s) => (s === "Writing" ? "English" : s)))];
}

function strengthChipLabel(s: string): string {
  return s === "English" ? "English & writing" : s;
}

function countryChipLabel(c: string): string {
  return c === "Other" ? "Other" : c;
}
/** What you enjoy or lean toward now — not the same as career title. */
const INTEREST_OPTIONS = [
  "STEM, coding & building things",
  "Arts, media & design",
  "People, health & how bodies work",
  "Business, leadership & organizations",
  "Writing, debate & big ideas",
  "Still exploring — lots of things sound fun",
] as const;
/** Possible fields or job families you might pursue later. */
const CAREER_OPTIONS = [
  "Medicine or healthcare careers",
  "Engineering or tech careers",
  "Business, finance, or entrepreneurship",
  "Creative industries (film, games, design)",
  "Policy, law, or social impact",
  "Not sure yet — keeping options wide",
] as const;
const AVOID_OPTIONS = ["Heavy lab load", "Too many APs", "Very math-heavy", "Very writing-heavy"];
const PREF_OPTIONS = ["Project-based", "Real-world applications", "Collaboration", "Independent work"];

type MissingField = {
  key: string;
  label: string;
  step: number;
  sectionId: string;
};

const API_FIELD_LABELS: Record<string, string> = {
  currentGrade: "Grade level",
  semester: "semester",
  selfReportedAcademicConfidence: "academic confidence",
  workloadTolerance: "workload preference",
  goalClarity: "goal clarity",
  mainCountry: "main focus country",
  countryIntent: "how to balance countries",
  priorityStyle: "priority style",
  optimizationTarget: "optimization target",
  riskPreference: "risk preference",
  scholarshipImportance: "scholarship importance",
};

function getMissingSemester2Selections(f: IntakeFormDraft) {
  if (f.semester !== "Semester2") return [];
  if (f.currentGrade !== 11 && f.currentGrade !== 12) return [];
  return getSemester2CurrentCoursePanels(f.currentGrade).filter((panel) => !f.currentSelections[panel.id]);
}

function getMissingFields(f: IntakeFormDraft): MissingField[] {
  const missing: MissingField[] = [];
  const add = (key: string, label: string, step: number, sectionId: string) => {
    missing.push({ key, label, step, sectionId });
  };

  if (!f.currentGrade) add("currentGrade", "Grade level", 0, "school-context");
  if (!f.semester) add("semester", "semester", 0, "school-context");
  for (const panel of getMissingSemester2Selections(f)) {
    add(`currentSelections.${panel.id}`, panel.label, 0, "current-courses");
  }
  if (!f.selfReportedAcademicConfidence) {
    add("selfReportedAcademicConfidence", "academic confidence", 0, "confidence-workload");
  }
  if (!f.workloadTolerance) add("workloadTolerance", "workload preference", 0, "confidence-workload");
  if (!f.goalClarity) add("goalClarity", "goal clarity", 1, "plans-clarity");
  if (!f.mainCountry) add("mainCountry", "main focus country", 1, "future-destination");
  if (f.additionalCountries.length > 0 && !f.countryIntent) {
    add("countryIntent", "how to balance countries", 1, "future-destination");
  }
  if (!f.priorityStyle) add("priorityStyle", "priority style", 2, "priority-style");
  if (!f.optimizationTarget) add("optimizationTarget", "optimization target", 2, "optimization-target");
  if (!f.riskPreference) add("riskPreference", "risk preference", 2, "risk-scholarship");
  if (!f.scholarshipImportance) add("scholarshipImportance", "scholarship importance", 2, "risk-scholarship");

  return missing;
}

function uniqueLabels(labels: string[]) {
  return [...new Set(labels)];
}

function formatMissingLabels(labels: string[]) {
  const unique = uniqueLabels(labels);
  if (unique.length === 0) return "Please complete the required choices before unlocking your plan.";
  const visible = unique.slice(0, 6).join(", ");
  const extra = unique.length > 6 ? `, and ${unique.length - 6} more` : "";
  return `Please complete: ${visible}${extra}.`;
}

function formatMissingMessage(fields: MissingField[]) {
  return formatMissingLabels(fields.map((field) => field.label));
}

function getApiMissingLabels(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("fieldErrors" in payload)) return [];
  const fieldErrors = (payload as { fieldErrors?: Record<string, unknown> }).fieldErrors;
  if (!fieldErrors) return [];
  return uniqueLabels(
    Object.entries(fieldErrors)
      .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
      .map(([field]) => API_FIELD_LABELS[field] ?? field),
  );
}

function IntakePageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeFormDraft>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const res = await fetch("/api/student/active-plan");
      if (!res.ok) return;
      const json = await res.json();
      const a = json?.activeSession?.answers;
      if (!a) return;
      const courses = Array.isArray(a.currentCourses) ? a.currentCourses : [];
      const aps = Array.isArray(a.currentAPs) ? a.currentAPs : [];
      const merged = [...courses, ...aps];
      const { currentCourses: _c, currentAPs: _p, ...rest } = a as Record<string, unknown>;
      const rawMain = a.mainCountry != null ? migrateCountryCode(String(a.mainCountry)) : undefined;
      const validMain =
        rawMain && (COUNTRY_OPTIONS as readonly string[]).includes(rawMain)
          ? (rawMain as IntakeFormDraft["mainCountry"])
          : undefined;
      setForm((prev) => ({
        ...prev,
        ...(rest as Partial<IntakeFormDraft>),
        mainCountry: validMain ?? prev.mainCountry,
        strengths: Array.isArray(a.strengths) ? migrateStrengthWeaknessList(a.strengths as string[]) : prev.strengths,
        weaknesses: Array.isArray(a.weaknesses) ? migrateStrengthWeaknessList(a.weaknesses as string[]) : prev.weaknesses,
        additionalCountries: Array.isArray(a.additionalCountries)
          ? [
              ...new Set(
                (a.additionalCountries as string[])
                  .map((c) => migrateCountryCode(c))
                  .filter(
                    (c) =>
                      (COUNTRY_OPTIONS as readonly string[]).includes(c) && c !== (validMain ?? prev.mainCountry),
                  ),
              ),
            ]
          : prev.additionalCountries,
        interests: Array.isArray(a.interests) ? (a.interests as string[]) : prev.interests,
        careerGoals: Array.isArray(a.careerGoals) ? (a.careerGoals as string[]) : prev.careerGoals,
        preferencesToAvoid: Array.isArray(a.preferencesToAvoid) ? (a.preferencesToAvoid as string[]) : prev.preferencesToAvoid,
        preferences: Array.isArray(a.preferences) ? (a.preferences as string[]) : prev.preferences,
        currentSelections:
          merged.length > 0 && a.currentGrade
            ? hydrateCurrentSelectionsFromCodes(a.currentGrade as 9 | 10 | 11 | 12, merged)
            : typeof (a as { currentSelections?: unknown }).currentSelections === "object" &&
                (a as { currentSelections?: unknown }).currentSelections !== null
              ? ((a as { currentSelections: Record<string, string> }).currentSelections)
              : {},
      }));
    })();
  }, [isEdit]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const progress = useMemo(() => ((step + 1) / JOURNEY_STEPS.length) * 100, [step]);
  const semester2Panels = useMemo(
    () =>
      form.semester === "Semester2" &&
      (form.currentGrade === 11 || form.currentGrade === 12) &&
      form.currentGrade != null
        ? getSemester2CurrentCoursePanels(form.currentGrade)
        : [],
    [form.semester, form.currentGrade],
  );
  const earlyGrade = form.currentGrade === 9 || form.currentGrade === 10;
  const missingFields = useMemo(() => getMissingFields(form), [form]);
  const missingSectionIds = useMemo(() => new Set(missingFields.map((field) => field.sectionId)), [missingFields]);
  const missingLabelsBySection = useMemo(() => {
    const labels = new Map<string, string[]>();
    for (const field of missingFields) {
      labels.set(field.sectionId, uniqueLabels([...(labels.get(field.sectionId) ?? []), field.label]));
    }
    return labels;
  }, [missingFields]);

  useEffect(() => {
    if (!validationAttempted || !error?.startsWith("Please complete:")) return;
    const nextError = missingFields.length > 0 ? formatMissingMessage(missingFields) : null;
    if (nextError !== error) setError(nextError);
  }, [error, missingFields, validationAttempted]);

  function sectionHasMissing(sectionId: string) {
    return validationAttempted && missingSectionIds.has(sectionId);
  }

  function sectionMissingHint(sectionId: string) {
    if (!validationAttempted) return undefined;
    const labels = missingLabelsBySection.get(sectionId);
    return labels?.length ? formatMissingLabels(labels) : undefined;
  }

  function scrollToMissingSection(sectionId: string) {
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function canProceedCurrentStep() {
    return !missingFields.some((field) => field.step === step);
  }

  async function submit() {
    const currentMissingFields = getMissingFields(form);
    if (currentMissingFields.length > 0) {
      setValidationAttempted(true);
      setError(formatMissingMessage(currentMissingFields));
      const firstMissing = currentMissingFields[0];
      if (firstMissing.step !== step) setStep(firstMissing.step);
      scrollToMissingSection(firstMissing.sectionId);
      return;
    }
    setError(null);
    setValidationAttempted(false);
    setSubmitting(true);
    const { currentCourses, currentAPs } =
      form.semester === "Semester2" ? splitCurrentCoursesForApi(form.currentSelections) : { currentCourses: [], currentAPs: [] };
    const { currentSelections: _omit, ...rest } = form;
    const payload = {
      ...rest,
      currentGrade: form.currentGrade!,
      semester: form.semester!,
      selfReportedAcademicConfidence: form.selfReportedAcademicConfidence!,
      workloadTolerance: form.workloadTolerance!,
      goalClarity: form.goalClarity!,
      mainCountry: form.mainCountry!,
      countryIntent: form.additionalCountries.length > 0 ? form.countryIntent! : "main_focus",
      priorityStyle: form.priorityStyle!,
      optimizationTarget: form.optimizationTarget!,
      riskPreference: form.riskPreference!,
      scholarshipImportance: form.scholarshipImportance!,
      currentCourses,
      currentAPs,
    };
    const res = await fetch("/api/student/save-and-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const apiMissingLabels = getApiMissingLabels(body?.error);
      setValidationAttempted(false);
      setError(
        apiMissingLabels.length > 0
          ? formatMissingLabels(apiMissingLabels)
          : "Could not run recommendations. Please check the required choices and try again.",
      );
      setSubmitting(false);
      return;
    }
    router.push("/dashboard?fresh=1");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_130%_90%_at_50%_-25%,rgba(34,211,238,0.2),transparent)]">
      <StudentHeader />
      <div className="apf-journey-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-b from-teal-50/80 to-white/90 p-4 shadow-md ring-1 ring-teal-100/50 lg:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-800">
                Step {step + 1} of {JOURNEY_STEPS.length}
              </p>
              <h1 className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-xs font-black text-white shadow-lg shadow-teal-900/20">
                  {JOURNEY_STEPS[step].marker}
                </span>
                <span>{JOURNEY_STEPS[step].label}</span>
              </h1>
              <p className="mt-3 text-sm font-medium leading-snug text-slate-600">{JOURNEY_STEPS[step].blurb}</p>
            </div>
            <ol className="mt-5 hidden flex-col gap-2 sm:flex">
              {JOURNEY_STEPS.map((s, i) => (
                <li
                  key={s.label}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-300",
                    i === step && "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-950 ring-2 ring-teal-400/60 shadow-md",
                    i < step && "bg-emerald-50/95 text-emerald-900 ring-1 ring-emerald-200/80",
                    i > step && "bg-slate-100/70 text-slate-500",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      i === step && "bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow",
                      i < step && "bg-emerald-600 text-white",
                      i > step && "bg-slate-300 text-white",
                    )}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 hidden sm:block">
              <p className="mb-2 text-xs font-bold text-slate-700">Your progress</p>
              <Progress value={progress} size="lg" />
              <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span>Start</span>
                <span>Almost there</span>
                <span>Done</span>
              </div>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9 xl:col-span-9">
            <Card className="apf-journey-card p-6 sm:p-8 lg:p-10">
              <div className="apf-journey-hero mb-6 sm:mb-8">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-900">You’re on the path</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {step === JOURNEY_STEPS.length - 1
                    ? "Final stretch: lock in how you like to decide."
                    : `Nice. Step ${step + 1} builds the next layer of your story.`}
                </p>
              </div>
              <div className="mb-6 sm:hidden">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>
                    Step {step + 1}/{JOURNEY_STEPS.length}
                  </span>
                  <span className="text-teal-800">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} size="lg" />
              </div>

              <div key={step} className="apf-step-in space-y-8 sm:space-y-10 lg:space-y-12">
            {step === 0 ? (
              <>
                <IntakePanel
                  id="school-context"
                  emoji="🏫"
                  title="Where are you in school?"
                  hint="Required: grade, semester, academic confidence, and workload tolerance."
                  hasError={sectionHasMissing("school-context")}
                  missingHint={sectionMissingHint("school-context")}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([9, 10, 11, 12] as const).map((g) => (
                      <ChoiceTile
                        key={g}
                        size="lg"
                        title={`Grade ${g}`}
                        selected={form.currentGrade === g}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            currentGrade: g,
                            currentSelections: prev.currentGrade === g ? prev.currentSelections : {},
                          }))
                        }
                      />
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ChoiceTile
                      title="Semester 1"
                      subtitle="Start of year planning"
                      selected={form.semester === "Semester1"}
                      onClick={() => setForm((prev) => ({ ...prev, semester: "Semester1", currentSelections: {} }))}
                    />
                    <ChoiceTile
                      title="Semester 2"
                      subtitle="Mid-year — tell us what you’re taking now"
                      selected={form.semester === "Semester2"}
                      onClick={() => setForm((prev) => ({ ...prev, semester: "Semester2" }))}
                    />
                  </div>
                </IntakePanel>

                {form.semester === "Semester2" && semester2Panels.length > 0 ? (
                  <IntakePanel
                    id="current-courses"
                    emoji="📚"
                    title="Your courses this semester"
                    hint="One pick per row. APs live in the same row as their subject."
                    hasError={sectionHasMissing("current-courses")}
                    missingHint={sectionMissingHint("current-courses")}
                  >
                    <div className="space-y-6">
                      {semester2Panels.map((panel) => (
                        <div key={panel.id}>
                          <p className="mb-2 text-sm font-medium text-slate-800">{panel.label}</p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {panel.options.map((o) => (
                              <ChoiceTile
                                key={o.code}
                                title={o.name}
                                subtitle={o.isAp ? "AP course" : undefined}
                                selected={form.currentSelections[panel.id] === o.code}
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    currentSelections: { ...prev.currentSelections, [panel.id]: o.code },
                                  }))
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </IntakePanel>
                ) : null}

                <IntakePanel emoji="💪" title="Strengths & stretch areas" hint="Optional — tap what feels true.">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Stronger in</p>
                      <div className="flex flex-wrap gap-2">
                        {STRENGTH_OPTIONS.map((s) => {
                          const selected = form.strengths.includes(s);
                          return (
                            <Chip
                              key={s}
                              label={strengthChipLabel(s)}
                              selected={selected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  strengths: selected ? form.strengths.filter((v) => v !== s) : [...form.strengths, s],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">More challenging</p>
                      <div className="flex flex-wrap gap-2">
                        {STRENGTH_OPTIONS.map((s) => {
                          const selected = form.weaknesses.includes(s);
                          return (
                            <Chip
                              key={s}
                              label={strengthChipLabel(s)}
                              selected={selected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  weaknesses: selected ? form.weaknesses.filter((v) => v !== s) : [...form.weaknesses, s],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </IntakePanel>

                <IntakePanel
                  id="confidence-workload"
                  emoji="⚡"
                  title="Confidence & workload"
                  hint="Required — helps us tune the feel of your plan."
                  hasError={sectionHasMissing("confidence-workload")}
                  missingHint={sectionMissingHint("confidence-workload")}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Academic confidence</p>
                      <div className="flex flex-wrap gap-2">
                        {(["Low", "Medium", "High"] as const).map((lvl) => (
                          <Chip
                            key={lvl}
                            label={lvl}
                            selected={form.selfReportedAcademicConfidence === lvl}
                            onClick={() => setForm({ ...form, selfReportedAcademicConfidence: lvl })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Workload tolerance</p>
                      <div className="flex flex-wrap gap-2">
                        {(["Low", "Medium", "High"] as const).map((lvl) => (
                          <Chip
                            key={lvl}
                            label={lvl}
                            selected={form.workloadTolerance === lvl}
                            onClick={() => setForm({ ...form, workloadTolerance: lvl })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </IntakePanel>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <IntakePanel emoji="✨" title="What pulls you in?" hint="Pick anything that sparks curiosity — multi-select.">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {INTEREST_OPTIONS.map((opt) => {
                      const selected = form.interests.includes(opt);
                      return (
                        <ChoiceTile
                          key={opt}
                          title={opt}
                          selected={selected}
                          onClick={() =>
                            setForm({
                              ...form,
                              interests: selected ? form.interests.filter((v) => v !== opt) : [...form.interests, opt],
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </IntakePanel>

                <IntakePanel
                  emoji="🧭"
                  title={earlyGrade ? "Future interests" : "Career direction"}
                  hint={earlyGrade ? "Pick broad areas that sound interesting. This can change later." : "Rough ideas count — you’re not signing a contract."}
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CAREER_OPTIONS.map((opt) => {
                      const selected = form.careerGoals.includes(opt);
                      return (
                        <ChoiceTile
                          key={opt}
                          title={opt}
                          selected={selected}
                          onClick={() =>
                            setForm({
                              ...form,
                              careerGoals: selected ? form.careerGoals.filter((v) => v !== opt) : [...form.careerGoals, opt],
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </IntakePanel>

                <IntakePanel
                  id="plans-clarity"
                  emoji="🗺️"
                  title="How clear are your plans?"
                  hint="Required — honest beats perfect."
                  hasError={sectionHasMissing("plans-clarity")}
                  missingHint={sectionMissingHint("plans-clarity")}
                >
                  <div className="flex flex-wrap gap-2">
                    {(["Low", "Medium", "High"] as const).map((lvl) => (
                      <Chip
                        key={lvl}
                        label={lvl === "Low" ? "Still exploring" : lvl === "Medium" ? "Somewhat clear" : "Fairly clear"}
                        selected={form.goalClarity === lvl}
                        onClick={() => setForm({ ...form, goalClarity: lvl })}
                      />
                    ))}
                  </div>
                </IntakePanel>

                <IntakePanel
                  id="future-destination"
                  emoji="🌍"
                  title={earlyGrade ? "Future options" : "Future destination"}
                  hint={
                    earlyGrade
                      ? "Share what is on your radar. This helps the plan stay flexible."
                      : "Pick your main country first. If you add more countries below, we’ll ask how you want to balance them."
                  }
                  hasError={sectionHasMissing("future-destination")}
                  missingHint={sectionMissingHint("future-destination")}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Main focus country</p>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRY_OPTIONS.map((c) => (
                          <Chip
                            key={c}
                            label={countryChipLabel(c)}
                            selected={form.mainCountry === c}
                            onClick={() => setForm({ ...form, mainCountry: c })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Also considering (optional)</p>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRY_OPTIONS.map((c) => {
                          if (c === form.mainCountry) return null;
                          const selected = form.additionalCountries.includes(c);
                          return (
                            <Chip
                              key={c}
                              label={countryChipLabel(c)}
                              selected={selected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  additionalCountries: selected
                                    ? form.additionalCountries.filter((v) => v !== c)
                                    : [...form.additionalCountries, c],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                    {form.additionalCountries.length > 0 ? (
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-800">How do these countries fit together?</p>
                        <p className="mb-2 text-xs font-medium text-slate-500">Required because you picked more than one country.</p>
                        <div className="flex flex-wrap gap-2">
                          <Chip
                            label="One main destination"
                            selected={form.countryIntent === "main_focus"}
                            onClick={() => setForm({ ...form, countryIntent: "main_focus" })}
                          />
                          <Chip
                            label="Keep options open"
                            selected={form.countryIntent === "keep_options_open"}
                            onClick={() => setForm({ ...form, countryIntent: "keep_options_open" })}
                          />
                          <Chip
                            label="Not sure yet"
                            selected={form.countryIntent === "unsure"}
                            onClick={() => setForm({ ...form, countryIntent: "unsure" })}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </IntakePanel>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <IntakePanel
                  id="priority-style"
                  emoji="🎚️"
                  title="Priority style"
                  hint={earlyGrade ? "Required: how you want this year to feel." : "Required — how you want to steer this year."}
                  hasError={sectionHasMissing("priority-style")}
                  missingHint={sectionMissingHint("priority-style")}
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <ChoiceTile
                      title="Strongest path"
                      subtitle="Maximize fit to your direction"
                      selected={form.priorityStyle === "strongest_path"}
                      onClick={() => setForm({ ...form, priorityStyle: "strongest_path" })}
                    />
                    <ChoiceTile
                      title="Balanced"
                      subtitle="Solid mix of fit and sustainability"
                      selected={form.priorityStyle === "balanced_path"}
                      onClick={() => setForm({ ...form, priorityStyle: "balanced_path" })}
                    />
                    <ChoiceTile
                      title="Safest / higher grades"
                      subtitle="Reduce unnecessary risk"
                      selected={form.priorityStyle === "safest_highest_grade"}
                      onClick={() => setForm({ ...form, priorityStyle: "safest_highest_grade" })}
                    />
                    <ChoiceTile
                      title="Not sure"
                      subtitle="We’ll keep recommendations flexible"
                      selected={form.priorityStyle === "not_sure"}
                      onClick={() => setForm({ ...form, priorityStyle: "not_sure" })}
                    />
                  </div>
                </IntakePanel>

                <IntakePanel
                  id="optimization-target"
                  emoji="🚀"
                  title="Optimize for"
                  hint={earlyGrade ? "Required: what matters most while you build readiness." : "Required — what matters most right now."}
                  hasError={sectionHasMissing("optimization-target")}
                  missingHint={sectionMissingHint("optimization-target")}
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["career_alignment", "Career alignment"],
                        ["lighter_workload", "Lighter workload"],
                        ["university_competitiveness", "University competitiveness"],
                        ["keeping_options_open", "Keeping options open"],
                        ["higher_grades", "Higher grades"],
                      ] as const
                    ).map(([k, label]) => (
                      <ChoiceTile
                        key={k}
                        title={label}
                        selected={form.optimizationTarget === k}
                        onClick={() => setForm({ ...form, optimizationTarget: k })}
                      />
                    ))}
                  </div>
                </IntakePanel>

                <IntakePanel
                  id="risk-scholarship"
                  emoji="🛡️"
                  title="Risk & scholarships"
                  hint="Required — both chips."
                  hasError={sectionHasMissing("risk-scholarship")}
                  missingHint={sectionMissingHint("risk-scholarship")}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Risk preference</p>
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          label="Play it safe"
                          selected={form.riskPreference === "Avoid risk"}
                          onClick={() => setForm({ ...form, riskPreference: "Avoid risk" })}
                        />
                        <Chip
                          label="Balanced"
                          selected={form.riskPreference === "Balanced"}
                          onClick={() => setForm({ ...form, riskPreference: "Balanced" })}
                        />
                        <Chip
                          label="Open to stretch"
                          selected={form.riskPreference === "Embrace stretch"}
                          onClick={() => setForm({ ...form, riskPreference: "Embrace stretch" })}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Scholarship importance</p>
                      <div className="flex flex-wrap gap-2">
                        {(["Low", "Medium", "High"] as const).map((lvl) => (
                          <Chip
                            key={lvl}
                            label={lvl}
                            selected={form.scholarshipImportance === lvl}
                            onClick={() => setForm({ ...form, scholarshipImportance: lvl })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </IntakePanel>

                <IntakePanel emoji="🎨" title="Preferences" hint="Optional — fine-tune the vibe.">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">Try to avoid</p>
                      <div className="flex flex-wrap gap-2">
                        {AVOID_OPTIONS.map((opt) => {
                          const selected = form.preferencesToAvoid.includes(opt);
                          return (
                            <Chip
                              key={opt}
                              label={opt}
                              selected={selected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  preferencesToAvoid: selected
                                    ? form.preferencesToAvoid.filter((v) => v !== opt)
                                    : [...form.preferencesToAvoid, opt],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-800">You usually prefer</p>
                      <div className="flex flex-wrap gap-2">
                        {PREF_OPTIONS.map((opt) => {
                          const selected = form.preferences.includes(opt);
                          return (
                            <Chip
                              key={opt}
                              label={opt}
                              selected={selected}
                              onClick={() =>
                                setForm({
                                  ...form,
                                  preferences: selected ? form.preferences.filter((v) => v !== opt) : [...form.preferences, opt],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </IntakePanel>

                <div className="rounded-2xl border-2 border-dashed border-cyan-200/70 bg-gradient-to-br from-cyan-50/50 to-white p-4 ring-1 ring-cyan-100/40">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" aria-hidden />
                    Anything else? (optional)
                  </label>
                  <Input
                    className="mt-2"
                    value={form.futurePlans}
                    onChange={(e) => setForm({ ...form, futurePlans: e.target.value })}
                    placeholder="Short note — e.g. exchange year, sport, family preference"
                  />
                </div>
              </>
            ) : null}
          </div>

          {error ? (
            <div role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-red-100">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="secondary" disabled={step === 0 || submitting} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            {step < JOURNEY_STEPS.length - 1 ? (
              <Button className="sm:min-w-[220px]" disabled={!canProceedCurrentStep() || submitting} onClick={() => setStep(step + 1)}>
                Next step →
              </Button>
            ) : (
              <Button className="sm:min-w-[240px]" disabled={submitting} onClick={submit}>
                {submitting ? "Building your plan" : "Unlock my plan"}
              </Button>
            )}
          </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.18),transparent)] text-sm font-semibold text-slate-600">
          <span className="h-10 w-10 animate-pulse rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md" />
          <span>Setting up your journey.</span>
        </div>
      }
    >
      <IntakePageInner />
    </Suspense>
  );
}
