"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { StudentHeader } from "@/components/student/StudentHeader";
import { Chip } from "@/components/ui/Chip";

type IntakeForm = {
  currentGrade: 9 | 10 | 11 | 12;
  semester: "Semester1" | "Semester2";
  currentCourses: string;
  currentAPs: string;
  strengths: string[];
  weaknesses: string[];
  selfReportedAcademicConfidence: "Low" | "Medium" | "High";
  workloadTolerance: "Low" | "Medium" | "High";
  interests: string[];
  careerGoals: string[];
  goalClarity: "Low" | "Medium" | "High";
  mainCountry: "UAE" | "Qatar" | "US" | "Egypt" | "Jordan";
  additionalCountries: string[];
  countryIntent: "main_focus" | "keep_options_open" | "unsure";
  priorityStyle: "strongest_path" | "balanced_path" | "safest_highest_grade" | "not_sure";
  optimizationTarget: "career_alignment" | "lighter_workload" | "university_competitiveness" | "keeping_options_open" | "higher_grades";
  preferencesToAvoid: string[];
  preferences: string[];
  futurePlans: string;
  riskPreference: "Avoid risk" | "Balanced" | "Embrace stretch";
  scholarshipImportance: "Low" | "Medium" | "High";
};

const initial: IntakeForm = {
  currentGrade: 11,
  semester: "Semester1",
  currentCourses: "",
  currentAPs: "",
  strengths: [],
  weaknesses: [],
  selfReportedAcademicConfidence: "Medium",
  workloadTolerance: "Medium",
  interests: [],
  careerGoals: [],
  goalClarity: "Medium",
  mainCountry: "UAE",
  additionalCountries: [],
  countryIntent: "main_focus",
  priorityStyle: "balanced_path",
  optimizationTarget: "career_alignment",
  preferencesToAvoid: [],
  preferences: [],
  futurePlans: "",
  riskPreference: "Balanced",
  scholarshipImportance: "Medium",
};

const STEPS = ["Academic context", "Interests and future", "Decision style"] as const;

const STRENGTH_OPTIONS = ["Math", "English", "Science", "Writing", "Coding", "Arts", "Humanities"];
const INTEREST_OPTIONS = ["AI / CS", "Engineering", "Medicine / Health", "Business / Finance", "Design / Creative", "Undecided"];
const CAREER_OPTIONS = ["Computer Science / AI", "Engineering", "Medicine / Health", "Business / Finance", "Design / Creative", "Not sure yet"];
const AVOID_OPTIONS = ["Heavy lab load", "Too many APs", "Very math-heavy", "Very writing-heavy"];
const PREF_OPTIONS = ["Project-based", "Real-world applications", "Collaboration", "Independent work"];

export default function IntakePage() {
  const router = useRouter();
  const search = useSearchParams();
  const isEdit = search.get("mode") === "edit";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeForm>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const res = await fetch("/api/student/active-plan");
      if (!res.ok) return;
      const json = await res.json();
      const a = json?.activeSession?.answers;
      if (!a) return;
      setForm((prev) => ({
        ...prev,
        ...a,
        strengths: Array.isArray(a.strengths) ? a.strengths : prev.strengths,
        weaknesses: Array.isArray(a.weaknesses) ? a.weaknesses : prev.weaknesses,
        additionalCountries: Array.isArray(a.additionalCountries) ? a.additionalCountries : prev.additionalCountries,
      }));
    })();
  }, [isEdit]);

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function canProceedCurrentStep() {
    if (step === 0) return Boolean(form.currentGrade && form.semester);
    if (step === 1) return Boolean(form.mainCountry);
    return true;
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const payload = {
      ...form,
      currentCourses: form.currentCourses
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      currentAPs: form.currentAPs
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    };
    const res = await fetch("/api/student/save-and-run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Could not run recommendations. Please review required fields.");
      setSubmitting(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Guided Intake</h1>
              <p className="mt-1 text-sm text-slate-600">More answers = more personalized recommendations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STEPS.map((s, idx) => (
                <Chip key={s} label={`${idx + 1}. ${s}`} tone={idx === step ? "teal" : "slate"} />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} />
            <p className="mt-2 text-xs text-slate-500">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {step === 0 ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Academic context</p>
                  <p className="mt-1 text-xs text-slate-600">Why we ask this: it helps calibrate rigor, workload fit, and continuity advice.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="font-medium">Current Grade *</span>
                    <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.currentGrade} onChange={(e) => setForm({ ...form, currentGrade: Number(e.target.value) as 9 | 10 | 11 | 12 })}>
                    <option value={9}>Grade 9</option><option value={10}>Grade 10</option><option value={11}>Grade 11</option><option value={12}>Grade 12</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Current Semester *</span>
                    <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value as "Semester1" | "Semester2" })}>
                      <option value="Semester1">Semester 1</option>
                      <option value="Semester2">Semester 2</option>
                    </select>
                  </label>
                </div>
                {form.semester === "Semester2" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block text-sm"><span className="font-medium">Current Courses (optional)</span><Input value={form.currentCourses} onChange={(e) => setForm({ ...form, currentCourses: e.target.value })} placeholder="Comma-separated (optional)" /></label>
                    <label className="block text-sm"><span className="font-medium">Current APs (optional)</span><Input value={form.currentAPs} onChange={(e) => setForm({ ...form, currentAPs: e.target.value })} placeholder="Comma-separated (optional)" /></label>
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Strengths (choose 1–3)</p>
                    <div className="flex flex-wrap gap-2">
                      {STRENGTH_OPTIONS.map((s) => {
                        const selected = form.strengths.includes(s);
                        return (
                          <Chip
                            key={s}
                            label={s}
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
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Areas you find harder</p>
                    <div className="flex flex-wrap gap-2">
                      {STRENGTH_OPTIONS.map((s) => {
                        const selected = form.weaknesses.includes(s);
                        return (
                          <Chip
                            key={s}
                            label={s}
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block text-sm"><span className="font-medium">Academic Confidence</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.selfReportedAcademicConfidence} onChange={(e) => setForm({ ...form, selfReportedAcademicConfidence: e.target.value as IntakeForm["selfReportedAcademicConfidence"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
                  <label className="block text-sm"><span className="font-medium">Workload Tolerance</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.workloadTolerance} onChange={(e) => setForm({ ...form, workloadTolerance: e.target.value as IntakeForm["workloadTolerance"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Interests and future</p>
                  <p className="mt-1 text-xs text-slate-600">Helps align choices to goals and keep the right options open.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">What are you most interested in?</p>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((opt) => {
                        const selected = form.interests.includes(opt);
                        return (
                          <Chip
                            key={opt}
                            label={opt}
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
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Any early career ideas?</p>
                    <div className="flex flex-wrap gap-2">
                      {CAREER_OPTIONS.map((opt) => {
                        const selected = form.careerGoals.includes(opt);
                        return (
                          <Chip
                            key={opt}
                            label={opt}
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
                  </div>
                </div>
                <label className="block text-sm"><span className="font-medium">How sure are you about your future plans?</span><select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={form.goalClarity} onChange={(e) => setForm({ ...form, goalClarity: e.target.value as IntakeForm["goalClarity"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Main target country *</p>
                    <div className="flex flex-wrap gap-2">
                      {["UAE", "Qatar", "US", "Egypt", "Jordan"].map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          selected={form.mainCountry === c}
                          onClick={() => setForm({ ...form, mainCountry: c as IntakeForm["mainCountry"] })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Additional countries (optional)</p>
                    <div className="flex flex-wrap gap-2">
                      {["UAE", "Qatar", "US", "Egypt", "Jordan"].map((c) => {
                        if (c === form.mainCountry) return null;
                        const selected = form.additionalCountries.includes(c);
                        return (
                          <Chip
                            key={c}
                            label={c}
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
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Country intent</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label="Main focus"
                      selected={form.countryIntent === "main_focus"}
                      onClick={() => setForm({ ...form, countryIntent: "main_focus" })}
                    />
                    <Chip
                      label="Keep options open"
                      selected={form.countryIntent === "keep_options_open"}
                      onClick={() => setForm({ ...form, countryIntent: "keep_options_open" })}
                    />
                    <Chip
                      label="Unsure"
                      selected={form.countryIntent === "unsure"}
                      onClick={() => setForm({ ...form, countryIntent: "unsure" })}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Decision style</p>
                  <p className="mt-1 text-xs text-slate-600">Why we ask this: it adjusts what the engine prioritizes (without ignoring other factors).</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Priority style</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        label="Strongest path"
                        selected={form.priorityStyle === "strongest_path"}
                        onClick={() => setForm({ ...form, priorityStyle: "strongest_path" })}
                      />
                      <Chip
                        label="Balanced"
                        selected={form.priorityStyle === "balanced_path"}
                        onClick={() => setForm({ ...form, priorityStyle: "balanced_path" })}
                      />
                      <Chip
                        label="Safest / higher grades"
                        selected={form.priorityStyle === "safest_highest_grade"}
                        onClick={() => setForm({ ...form, priorityStyle: "safest_highest_grade" })}
                      />
                      <Chip
                        label="Not sure"
                        selected={form.priorityStyle === "not_sure"}
                        onClick={() => setForm({ ...form, priorityStyle: "not_sure" })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">What should we optimize most for?</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        label="Career alignment"
                        selected={form.optimizationTarget === "career_alignment"}
                        onClick={() => setForm({ ...form, optimizationTarget: "career_alignment" })}
                      />
                      <Chip
                        label="Lighter workload"
                        selected={form.optimizationTarget === "lighter_workload"}
                        onClick={() => setForm({ ...form, optimizationTarget: "lighter_workload" })}
                      />
                      <Chip
                        label="University competitiveness"
                        selected={form.optimizationTarget === "university_competitiveness"}
                        onClick={() => setForm({ ...form, optimizationTarget: "university_competitiveness" })}
                      />
                      <Chip
                        label="Keep options open"
                        selected={form.optimizationTarget === "keeping_options_open"}
                        onClick={() => setForm({ ...form, optimizationTarget: "keeping_options_open" })}
                      />
                      <Chip
                        label="Higher grades"
                        selected={form.optimizationTarget === "higher_grades"}
                        onClick={() => setForm({ ...form, optimizationTarget: "higher_grades" })}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Risk preference</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        label="Avoid risk"
                        selected={form.riskPreference === "Avoid risk"}
                        onClick={() => setForm({ ...form, riskPreference: "Avoid risk" })}
                      />
                      <Chip
                        label="Balanced"
                        selected={form.riskPreference === "Balanced"}
                        onClick={() => setForm({ ...form, riskPreference: "Balanced" })}
                      />
                      <Chip
                        label="Embrace stretch"
                        selected={form.riskPreference === "Embrace stretch"}
                        onClick={() => setForm({ ...form, riskPreference: "Embrace stretch" })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Scholarship importance</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        label="Low"
                        selected={form.scholarshipImportance === "Low"}
                        onClick={() => setForm({ ...form, scholarshipImportance: "Low" })}
                      />
                      <Chip
                        label="Medium"
                        selected={form.scholarshipImportance === "Medium"}
                        onClick={() => setForm({ ...form, scholarshipImportance: "Medium" })}
                      />
                      <Chip
                        label="High"
                        selected={form.scholarshipImportance === "High"}
                        onClick={() => setForm({ ...form, scholarshipImportance: "High" })}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Things you want to avoid</p>
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
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">What you usually prefer</p>
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
                <label className="block text-sm"><span className="font-medium">Future Plans (optional)</span><Input value={form.futurePlans} onChange={(e) => setForm({ ...form, futurePlans: e.target.value })} placeholder="Any extra context you want us to consider" /></label>
              </>
            ) : null}
          </div>

          {error ? <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="secondary" disabled={step === 0 || submitting} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canProceedCurrentStep() || submitting} onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button disabled={submitting} onClick={submit}>
                {submitting ? "Generating..." : "See Recommendations"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

