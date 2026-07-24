"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  PlanningProfile,
  type PlanningProfileSection,
} from "@/components/student/PlanningProfile";
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
  { label: "Academic context", blurb: "Start with grade, semester, confidence, and workload." },
  { label: "Interests & future", blurb: "Share what sparks curiosity and where you might be headed." },
  { label: "Decision style", blurb: "Choose how you want the plan to balance rigor, workload, and options." },
] as const;

const STEP_PURPOSES = [
  "Your grade and planning point set the academic boundaries. Confidence and workload help tune the plan within them.",
  "Your direction can still change. These answers help the plan support what interests you while keeping the right options open.",
  "These choices describe the tradeoffs you want the plan to make. There is no single right planning style.",
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

const PRIORITY_LABELS: Record<NonNullable<IntakeFormDraft["priorityStyle"]>, string> = {
  strongest_path: "Strongest path",
  balanced_path: "Balanced",
  safest_highest_grade: "Safest / higher grades",
  not_sure: "Not sure",
};

const OPTIMIZATION_LABELS: Record<NonNullable<IntakeFormDraft["optimizationTarget"]>, string> = {
  career_alignment: "Career alignment",
  lighter_workload: "Lighter workload",
  university_competitiveness: "University competitiveness",
  keeping_options_open: "Keeping options open",
  higher_grades: "Higher grades",
};

const COUNTRY_INTENT_LABELS: Record<NonNullable<IntakeFormDraft["countryIntent"]>, string> = {
  main_focus: "One main destination",
  keep_options_open: "Keep options open",
  unsure: "Not sure yet",
};

function summarizeSelections(values: readonly string[], maxVisible = 2) {
  if (values.length <= maxVisible) return values.join(", ");
  return `${values.slice(0, maxVisible).join(", ")} +${values.length - maxVisible} more`;
}

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
  if (unique.length === 0) return "Please complete the required choices before building your plan.";
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

function getApiString(payload: unknown, key: "code" | "requestId") {
  if (!payload || typeof payload !== "object" || !(key in payload)) return undefined;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function formatSubmitFailureMessage(code?: string, requestId?: string) {
  const reference = requestId ? ` Reference: ${requestId.slice(0, 8)}.` : "";
  if (code === "AUTH_REQUIRED") {
    return `Your session expired. Please sign in again.${reference}`;
  }
  if (code === "PERSISTENCE_ERROR") {
    return `Your plan was generated, but the server could not save it. Please ask the site owner to check data storage settings.${reference}`;
  }
  if (code === "RECOMMENDATION_ERROR") {
    return `Could not build recommendations right now. Please try again in a moment.${reference}`;
  }
  return `Could not run recommendations. Please check the required choices and try again.${reference}`;
}

function IntakePageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeFormDraft>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedStep = useRef(false);
  const submitInFlight = useRef(false);

  useEffect(() => {
    if (!isEdit) {
      setLoadingExisting(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadExistingPlan() {
      setLoadingExisting(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/student/active-plan", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Active plan request failed.");
        const json = await res.json();
        const a = json?.activeSession?.answers;
        if (!a) {
          setLoadError("No saved answers were found. You can complete a new intake below.");
          return;
        }
        const courses = Array.isArray(a.currentCourses) ? a.currentCourses : [];
        const aps = Array.isArray(a.currentAPs) ? a.currentAPs : [];
        const merged = [...courses, ...aps];
        const { currentCourses: _c, currentAPs: _p, ...rest } = a as Record<string, unknown>;
        const rawMain = a.mainCountry != null ? migrateCountryCode(String(a.mainCountry)) : undefined;
        const validMain =
          rawMain && (COUNTRY_OPTIONS as readonly string[]).includes(rawMain)
            ? (rawMain as IntakeFormDraft["mainCountry"])
            : undefined;
        if (cancelled) return;
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
          preferencesToAvoid: Array.isArray(a.preferencesToAvoid)
            ? (a.preferencesToAvoid as string[])
            : prev.preferencesToAvoid,
          preferences: Array.isArray(a.preferences) ? (a.preferences as string[]) : prev.preferences,
          currentSelections:
            merged.length > 0 && a.currentGrade
              ? hydrateCurrentSelectionsFromCodes(a.currentGrade as 9 | 10 | 11 | 12, merged)
              : typeof (a as { currentSelections?: unknown }).currentSelections === "object" &&
                  (a as { currentSelections?: unknown }).currentSelections !== null
                ? (a as { currentSelections: Record<string, string> }).currentSelections
                : {},
        }));
      } catch (loadFailure) {
        if (!cancelled && !(loadFailure instanceof DOMException && loadFailure.name === "AbortError")) {
          setLoadError("Could not load your saved answers. You can retry by refreshing, or complete a new intake.");
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    void loadExistingPlan();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isEdit, router]);

  useEffect(() => {
    if (error) errorSummaryRef.current?.focus();
  }, [error]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (hasMountedStep.current) {
      window.requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }));
    } else {
      hasMountedStep.current = true;
    }
  }, [step]);

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
  const requiredCountsByStep = useMemo(
    () => [
      4 + semester2Panels.length,
      2 + (form.additionalCountries.length > 0 ? 1 : 0),
      4,
    ],
    [form.additionalCountries.length, semester2Panels.length],
  );
  const totalRequiredAnswers = requiredCountsByStep.reduce((sum, count) => sum + count, 0);
  const completedRequiredAnswers = Math.max(0, totalRequiredAnswers - missingFields.length);
  const completedOnCurrentStep = Math.max(
    0,
    requiredCountsByStep[step] - missingFields.filter((field) => field.step === step).length,
  );
  const progress = (completedRequiredAnswers / totalRequiredAnswers) * 100;
  const missingSectionIds = useMemo(() => new Set(missingFields.map((field) => field.sectionId)), [missingFields]);
  const missingLabelsBySection = useMemo(() => {
    const labels = new Map<string, string[]>();
    for (const field of missingFields) {
      labels.set(field.sectionId, uniqueLabels([...(labels.get(field.sectionId) ?? []), field.label]));
    }
    return labels;
  }, [missingFields]);
  const planningProfileSections = useMemo<PlanningProfileSection[]>(() => {
    const currentCourseNames = semester2Panels.flatMap((panel) => {
      const selectedCode = form.currentSelections[panel.id];
      const selected = panel.options.find((option) => option.code === selectedCode);
      return selected ? [selected.name] : [];
    });
    const destinations = form.mainCountry
      ? [
          countryChipLabel(form.mainCountry),
          ...form.additionalCountries
            .filter((country) => country !== form.mainCountry)
            .map((country) => countryChipLabel(country)),
        ]
      : [];
    const planClarity =
      form.goalClarity === "Low"
        ? "Still exploring"
        : form.goalClarity === "Medium"
          ? "Somewhat clear"
          : form.goalClarity === "High"
            ? "Fairly clear"
            : undefined;
    const riskPreference =
      form.riskPreference === "Avoid risk"
        ? "Play it safe"
        : form.riskPreference === "Embrace stretch"
          ? "Open to stretch"
          : form.riskPreference;
    const note = form.futurePlans.trim();

    const sections: PlanningProfileSection[] = [
      {
        title: "Academic context",
        step: 0,
        items: [
          ...(form.currentGrade ? [{ label: "Grade", value: `Grade ${form.currentGrade}` }] : []),
          ...(form.semester
            ? [{ label: "Planning point", value: form.semester === "Semester1" ? "Semester 1" : "Semester 2" }]
            : []),
          ...(currentCourseNames.length > 0
            ? [{ label: "Current courses", value: summarizeSelections(currentCourseNames) }]
            : []),
          ...(form.selfReportedAcademicConfidence
            ? [{ label: "Academic confidence", value: form.selfReportedAcademicConfidence }]
            : []),
          ...(form.workloadTolerance ? [{ label: "Workload preference", value: form.workloadTolerance }] : []),
          ...(form.strengths.length > 0
            ? [{ label: "Stronger in", value: summarizeSelections(form.strengths.map(strengthChipLabel)) }]
            : []),
          ...(form.weaknesses.length > 0
            ? [{ label: "Stretch areas", value: summarizeSelections(form.weaknesses.map(strengthChipLabel)) }]
            : []),
        ],
      },
      {
        title: "Direction",
        step: 1,
        items: [
          ...(form.interests.length > 0
            ? [{ label: "Interests", value: summarizeSelections(form.interests) }]
            : []),
          ...(form.careerGoals.length > 0
            ? [{ label: "Future direction", value: summarizeSelections(form.careerGoals) }]
            : []),
          ...(planClarity ? [{ label: "Plan clarity", value: planClarity }] : []),
          ...(destinations.length > 0
            ? [{ label: "University destinations", value: summarizeSelections(destinations) }]
            : []),
          ...(form.additionalCountries.length > 0 && form.countryIntent
            ? [{ label: "Destination approach", value: COUNTRY_INTENT_LABELS[form.countryIntent] }]
            : []),
        ],
      },
      {
        title: "Planning priorities",
        step: 2,
        items: [
          ...(form.priorityStyle ? [{ label: "Priority style", value: PRIORITY_LABELS[form.priorityStyle] }] : []),
          ...(form.optimizationTarget
            ? [{ label: "Optimize for", value: OPTIMIZATION_LABELS[form.optimizationTarget] }]
            : []),
          ...(riskPreference ? [{ label: "Risk preference", value: riskPreference }] : []),
          ...(form.scholarshipImportance
            ? [{ label: "Scholarship importance", value: form.scholarshipImportance }]
            : []),
          ...(form.preferences.length > 0
            ? [{ label: "Learning preferences", value: summarizeSelections(form.preferences) }]
            : []),
          ...(form.preferencesToAvoid.length > 0
            ? [{ label: "Try to avoid", value: summarizeSelections(form.preferencesToAvoid) }]
            : []),
          ...(note
            ? [{ label: "Additional context", value: note.length > 72 ? `${note.slice(0, 69)}…` : note }]
            : []),
        ],
      },
    ];

    return sections.filter((section) => section.items.length > 0);
  }, [form, semester2Panels]);

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
      const section = document.getElementById(sectionId);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      section?.focus({ preventScroll: true });
    }, 80);
  }

  function editPlanningProfileStep(targetStep: number) {
    if (targetStep === step) {
      window.scrollTo({ top: 0, behavior: "auto" });
      stepHeadingRef.current?.focus({ preventScroll: true });
      return;
    }
    setStep(targetStep);
  }

  function canProceedCurrentStep() {
    return !missingFields.some((field) => field.step === step);
  }

  async function submit() {
    if (submitInFlight.current) return;
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
    submitInFlight.current = true;
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
    try {
      const res = await fetch("/api/student/save-and-run", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const apiMissingLabels = getApiMissingLabels(body?.error);
        const apiCode = getApiString(body, "code");
        const requestId = getApiString(body, "requestId");
        setValidationAttempted(false);
        setError(
          apiMissingLabels.length > 0
            ? formatMissingLabels(apiMissingLabels)
            : formatSubmitFailureMessage(apiCode, requestId),
        );
        return;
      }
      router.push("/dashboard?fresh=1");
    } catch {
      setValidationAttempted(false);
      setError("Network error. Your answers are still here; please try building your plan again.");
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <StudentHeader />
      <main id="main-content" tabIndex={-1} className="apf-journey-shell">
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Now on step {step + 1} of {JOURNEY_STEPS.length}: {JOURNEY_STEPS[step].label}.
        </p>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                Step {step + 1} of {JOURNEY_STEPS.length}
              </p>
              <h1
                ref={stepHeadingRef}
                tabIndex={-1}
                className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 outline-none sm:text-3xl"
              >
                {JOURNEY_STEPS[step].label}
              </h1>
              <p className="mt-3 max-w-[34rem] text-sm leading-6 text-slate-600">{JOURNEY_STEPS[step].blurb}</p>
            </div>
            <ol className="mt-5 hidden flex-col gap-1.5 sm:flex">
              {JOURNEY_STEPS.map((s, i) => (
                <li
                  key={s.label}
                  aria-current={i === step ? "step" : undefined}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition duration-200",
                    i === step && "border-teal-700 bg-teal-50 font-semibold text-teal-950",
                    i < step && "border-emerald-500 text-slate-700",
                    i > step && "border-slate-200 text-slate-600",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      i === step && "border-teal-700 bg-teal-700 text-white",
                      i < step && "border-emerald-600 bg-white text-emerald-700",
                      i > step && "border-slate-300 bg-white text-slate-500",
                    )}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <div className="mb-2 flex items-end justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Required answers</span>
                <span className="tabular-nums text-slate-600">
                  {completedRequiredAnswers} of {totalRequiredAnswers}
                </span>
              </div>
              <Progress
                value={progress}
                size="lg"
                label={`Intake completion: ${completedRequiredAnswers} of ${totalRequiredAnswers} required answers`}
              />
              <p className="mt-2 text-xs leading-5 text-slate-600">
                This step: {completedOnCurrentStep} of {requiredCountsByStep[step]} required answers complete.
              </p>
            </div>
            <PlanningProfile sections={planningProfileSections} onEdit={editPlanningProfileStep} />
          </aside>

          <div className="min-w-0 lg:col-span-9 xl:col-span-9">
            <Card
              className="apf-journey-card rounded-2xl border-slate-200 bg-white p-5 shadow-sm ring-0 sm:p-8 lg:p-10"
              aria-busy={loadingExisting || submitting}
            >
              {loadingExisting ? (
                <p role="status" className="mb-5 rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-950 ring-1 ring-teal-100">
                  Loading your saved answers.
                </p>
              ) : null}
              {loadError ? (
                <p role="alert" className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 ring-1 ring-amber-200">
                  {loadError}
                </p>
              ) : null}
              <div className="mb-7 border-b border-slate-200 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">Why this matters</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{STEP_PURPOSES[step]}</p>
              </div>

              <fieldset disabled={loadingExisting} className="m-0 min-w-0 border-0 p-0">
                <legend className="sr-only">{JOURNEY_STEPS[step].label} answer controls</legend>
                <div key={step} className="apf-step-in space-y-6 sm:space-y-8">
            {step === 0 ? (
              <>
                <IntakePanel
                  id="school-context"
                  emoji="🏫"
                  title="Where are you in school?"
                  hint="Required. Your grade and semester determine which SAIS planning structure applies."
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      {semester2Panels.map((panel) => (
                        <label key={panel.id} className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-800">{panel.label}</span>
                          <select
                            value={form.currentSelections[panel.id] ?? ""}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                currentSelections: { ...prev.currentSelections, [panel.id]: event.target.value },
                              }))
                            }
                            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-900 shadow-sm transition hover:border-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-200 sm:text-sm"
                          >
                            <option value="" disabled>
                              Choose {panel.label.toLowerCase()}
                            </option>
                            {panel.options.map((option) => (
                              <option key={option.code} value={option.code}>
                                {option.name}
                                {option.isAp ? " — AP course" : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </IntakePanel>
                ) : null}

                <IntakePanel
                  id="confidence-workload"
                  emoji="⚡"
                  title="Confidence & workload"
                  hint="Required. Choose the closest fit today; you can revise these answers."
                  hasError={sectionHasMissing("confidence-workload")}
                  missingHint={sectionMissingHint("confidence-workload")}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-800">Academic confidence</legend>
                      <p className="mb-3 text-xs leading-5 text-slate-500">How ready you feel for next year’s academic work.</p>
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
                    </fieldset>
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-800">Workload tolerance</legend>
                      <p className="mb-3 text-xs leading-5 text-slate-500">How much sustained academic load feels manageable.</p>
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
                    </fieldset>
                  </div>
                </IntakePanel>

                <IntakePanel
                  emoji="💪"
                  title="Strengths & stretch areas"
                  hint="Optional. Add only what feels useful; leaving this blank is fine."
                  className="border-dashed bg-slate-50/70"
                >
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
                    <details
                      key={form.weaknesses.length > 0 ? "stretch-answered" : "stretch-empty"}
                      open={form.weaknesses.length > 0 || undefined}
                      className="group mt-5 rounded-xl border border-slate-200 bg-white"
                    >
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none">
                        <span>
                          Add stretch areas
                          <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
                        </span>
                        <span aria-hidden="true" className="text-lg text-teal-800 transition-transform duration-150 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="border-t border-slate-200 px-4 py-4">
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
                                    weaknesses: selected
                                      ? form.weaknesses.filter((v) => v !== s)
                                      : [...form.weaknesses, s],
                                  })
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  </div>
                </IntakePanel>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <IntakePanel
                  id="plans-clarity"
                  emoji="🗺️"
                  title="How clear are your plans?"
                  hint="Required. Choose the closest description; exploring is a valid answer."
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
                      ? "Required. Choose the country most relevant now; you can add other possibilities."
                      : "Required. Pick your main country first; add other possibilities only when useful."
                  }
                  hasError={sectionHasMissing("future-destination")}
                  missingHint={sectionMissingHint("future-destination")}
                >
                  <div className="space-y-4">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-800">Main focus country</legend>
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
                    </fieldset>
                    <details
                      key={form.additionalCountries.length > 0 ? "destinations-answered" : "destinations-empty"}
                      open={form.additionalCountries.length > 0 || undefined}
                      className="group rounded-xl border border-slate-200 bg-slate-50/70"
                    >
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none">
                        <span>
                          Add other destinations
                          <span className="ml-2 text-xs font-normal text-slate-500">Optional</span>
                        </span>
                        <span aria-hidden="true" className="text-lg text-teal-800 transition-transform duration-150 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="space-y-5 border-t border-slate-200 px-4 py-4">
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
                          <fieldset>
                            <legend className="mb-1 text-sm font-medium text-slate-800">How do these countries fit together?</legend>
                            <p className="mb-3 text-xs leading-5 text-slate-500">
                              Required because you selected more than one country.
                            </p>
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
                          </fieldset>
                        ) : null}
                      </div>
                    </details>
                  </div>
                </IntakePanel>

                <IntakePanel
                  emoji="✨"
                  title="Interests to explore"
                  hint="Optional. Choose any that feel relevant, or leave this section blank."
                  className="border-dashed bg-slate-50/70"
                >
                  <div className="space-y-7">
                    <fieldset>
                      <legend className="mb-3 text-sm font-semibold text-slate-900">What pulls you in?</legend>
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
                                  interests: selected
                                    ? form.interests.filter((v) => v !== opt)
                                    : [...form.interests, opt],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </fieldset>
                    <fieldset className="border-t border-slate-200 pt-6">
                      <legend className="px-1 text-sm font-semibold text-slate-900">
                        {earlyGrade ? "Future interests" : "Career direction"}
                      </legend>
                      <p className="mb-3 mt-1 text-xs leading-5 text-slate-500">
                        {earlyGrade
                          ? "Pick broad areas that sound interesting. This can change later."
                          : "Rough ideas count; these choices do not lock you into a career."}
                      </p>
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
                                  careerGoals: selected
                                    ? form.careerGoals.filter((v) => v !== opt)
                                    : [...form.careerGoals, opt],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </fieldset>
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
                  hint={
                    earlyGrade
                      ? "Required. Choose how you want this year to feel; “Not sure” is available."
                      : "Required. Choose the closest planning stance; “Not sure” is available."
                  }
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
                  hint={
                    earlyGrade
                      ? "Required. Which outcome should receive the most weight while you build readiness?"
                      : "Required. Which outcome should receive the most weight in this plan?"
                  }
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
                  hint="Required. Choose the closest current fit for both questions."
                  hasError={sectionHasMissing("risk-scholarship")}
                  missingHint={sectionMissingHint("risk-scholarship")}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-800">Risk preference</legend>
                      <p className="mb-3 text-xs leading-5 text-slate-500">How much academic stretch you want the plan to consider.</p>
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
                    </fieldset>
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-slate-800">Scholarship importance</legend>
                      <p className="mb-3 text-xs leading-5 text-slate-500">How strongly scholarship competitiveness should shape tradeoffs.</p>
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
                    </fieldset>
                  </div>
                </IntakePanel>

                <details
                  key={
                    form.preferences.length > 0 || form.preferencesToAvoid.length > 0
                      ? "preferences-answered"
                      : "preferences-empty"
                  }
                  open={form.preferences.length > 0 || form.preferencesToAvoid.length > 0 || undefined}
                  className="group rounded-xl border border-dashed border-slate-300 bg-slate-50/70"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:content-none sm:px-6">
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Fine-tune learning preferences</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Optional. Add these only if they matter to you.
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-xl text-teal-800 transition-transform duration-150 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="grid gap-6 border-t border-slate-200 px-5 py-5 sm:px-6 md:grid-cols-2">
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
                                  preferences: selected
                                    ? form.preferences.filter((v) => v !== opt)
                                    : [...form.preferences, opt],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <label htmlFor="future-plans" className="text-sm font-semibold text-slate-800">
                    Anything else? (optional)
                  </label>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Add factual context that the choices above did not capture.</p>
                  <Input
                    id="future-plans"
                    className="mt-2"
                    value={form.futurePlans}
                    onChange={(e) => setForm({ ...form, futurePlans: e.target.value })}
                    placeholder="Short note — e.g. exchange year, sport, family preference"
                  />
                </div>
              </>
            ) : null}
                </div>
              </fieldset>

          {error ? (
            <div
              id="intake-error-summary"
              ref={errorSummaryRef}
              role="alert"
              tabIndex={-1}
              className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-red-100"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <Button variant="secondary" disabled={step === 0 || submitting || loadingExisting} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <div className="sm:text-right">
              <p className="mb-2 text-xs leading-5 text-slate-500" role="status">
                {canProceedCurrentStep()
                  ? step === JOURNEY_STEPS.length - 1
                    ? "All required answers are complete. Review your profile, then build your plan."
                    : "This step’s required answers are complete."
                  : `${requiredCountsByStep[step] - completedOnCurrentStep} required ${
                      requiredCountsByStep[step] - completedOnCurrentStep === 1 ? "answer remains" : "answers remain"
                    } on this step.`}
              </p>
              {step < JOURNEY_STEPS.length - 1 ? (
                <Button
                  className="w-full sm:min-w-[220px]"
                  disabled={!canProceedCurrentStep() || submitting || loadingExisting}
                  onClick={() => setStep(step + 1)}
                >
                  Next step →
                </Button>
              ) : (
                <Button
                  className="w-full sm:min-w-[240px]"
                  aria-busy={submitting}
                  disabled={submitting || loadingExisting}
                  onClick={submit}
                >
                  {submitting ? "Building your plan" : "Build my plan"}
                </Button>
              )}
            </div>
          </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function IntakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-slate-100 text-sm text-slate-600">
          <span className="h-8 w-8 animate-pulse rounded-full border-4 border-teal-700 border-r-transparent" aria-hidden />
          <span role="status">Preparing the intake.</span>
        </div>
      }
    >
      <IntakePageInner />
    </Suspense>
  );
}
