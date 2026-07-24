"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const LoginSchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/, "Student ID must be exactly 8 digits."),
});

type LoginValues = z.infer<typeof LoginSchema>;

const planningSteps = [
  {
    number: "01",
    title: "Describe your academic context",
    body: "Share your grade, current direction, workload preference, and planning priorities.",
  },
  {
    number: "02",
    title: "Review a rule-based plan",
    body: "See the recommended courses, strongest reasons, and important tradeoffs.",
  },
  {
    number: "03",
    title: "Prepare for a counselor conversation",
    body: "Save the plan, revise your answers, and discuss availability before deciding.",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitInFlight = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { studentId: "" },
    mode: "onTouched",
  });
  const studentIdReg = register("studentId");

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function onSubmit(values: LoginValues) {
    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as {
          ok?: boolean;
          code?: string;
          message?: string;
          error?: unknown;
        } | null;
        if (json?.code === "MISSING_SESSION_SECRET" && json?.message) {
          setError(json.message);
          return;
        }
        if (response.status === 400 && json?.error) {
          setError("Check your Student ID. It should be exactly 8 digits.");
          return;
        }
        setError(json?.message ?? "Could not open the plan. Try again.");
        return;
      }

      const statusResponse = await fetch("/api/student/session-status", { cache: "no-store" });
      const statusJson = await statusResponse.json().catch(() => null);
      if (statusResponse.ok && statusJson?.hasActiveSession) {
        router.push("/welcome-back");
      } else {
        router.push("/intake");
      }
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[100dvh]">
      <div className="apf-journey-shell flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-6xl py-4 sm:py-8">
          <header className="max-w-4xl">
            <div className="flex items-center gap-3">
              <Image src="/sais-logo.png" alt="SAIS" width={44} height={44} priority className="rounded-md" />
              <div>
                <p className="text-sm font-semibold text-slate-950">SAIS Academic Navigator</p>
                <p className="text-xs text-slate-600">School-specific planning workspace</p>
              </div>
            </div>
            <p className="apf-document-label mt-8">Student planning</p>
            <h1 className="apf-display mt-3 max-w-3xl text-4xl text-slate-950 sm:text-5xl">
              Make a complicated course decision one clear step at a time.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Build a SAIS course plan, understand the tradeoffs, and take a focused summary into your next advising conversation.
            </p>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14">
            <section className="apf-paper p-5 sm:p-7" aria-labelledby="student-entry-heading">
              <p className="apf-document-label">Student entry</p>
              <h2 id="student-entry-heading" className="apf-display mt-2 text-3xl text-slate-950">
                Open your plan
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter your eight-digit Student ID. Returning students can reopen their active plan.
              </p>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900" htmlFor="studentId">
                    Student ID
                  </label>
                  <Input
                    id="studentId"
                    inputMode="numeric"
                    placeholder="8-digit student ID"
                    autoComplete="off"
                    maxLength={8}
                    aria-describedby={
                      errors.studentId ? "student-id-error" : error ? "student-login-error" : "student-id-help"
                    }
                    aria-invalid={Boolean(errors.studentId || error)}
                    {...studentIdReg}
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, "");
                      studentIdReg.onChange(event);
                    }}
                  />
                  {errors.studentId ? (
                    <p id="student-id-error" className="text-sm font-medium text-red-700">
                      {errors.studentId.message}
                    </p>
                  ) : null}
                  <p id="student-id-help" className="text-xs leading-5 text-slate-500">
                    Digits only. No spaces.
                  </p>
                </div>

                {error ? (
                  <div
                    id="student-login-error"
                    ref={errorRef}
                    role="alert"
                    tabIndex={-1}
                    className="border-l-4 border-red-700 bg-red-50 px-3 py-3 text-sm font-medium text-red-900"
                  >
                    {error}
                  </div>
                ) : null}

                <Button type="submit" aria-busy={submitting} disabled={submitting} className="w-full text-base">
                  {submitting ? "Opening plan" : "Continue"}
                </Button>

                <p className="text-center text-sm text-slate-600">
                  Looking for the counselor workspace?{" "}
                  <a className="font-semibold text-teal-900 underline underline-offset-4" href="/counselor">
                    Counselor access
                  </a>
                </p>
              </form>
            </section>

            <section aria-labelledby="what-happens-heading">
              <p className="apf-document-label">What happens next</p>
              <h2 id="what-happens-heading" className="apf-display mt-2 text-3xl text-slate-950">
                A planning brief you can inspect and revise
              </h2>
              <ol className="mt-6 border-y border-slate-300">
                {planningSteps.map((step) => (
                  <li
                    key={step.number}
                    className="grid grid-cols-[2.75rem_1fr] gap-3 border-b border-slate-200 py-5 last:border-b-0"
                  >
                    <span className="font-semibold tabular-nums text-teal-800">{step.number}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 border-l-4 border-teal-700 bg-white/70 px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Portfolio MVP</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Recommendations are deterministic and rule-based. Student ID access demonstrates the workflow and is not production school authentication.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
