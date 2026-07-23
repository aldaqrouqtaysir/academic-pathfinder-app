"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  IconArrowRight,
  IconBookOpen,
  IconGraduationCap,
  IconLayers,
  IconRoute,
  IconShieldCheck,
} from "@/components/icons/StudentIcons";

const LoginSchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/, "Student ID must be exactly 8 digits."),
});

type LoginValues = z.infer<typeof LoginSchema>;

const highlights = [
  {
    icon: IconGraduationCap,
    title: "Student goals",
    body: "Interests, confidence, workload, and future direction in one calm intake.",
  },
  {
    icon: IconRoute,
    title: "Course reasoning",
    body: "Rule-based recommendations explained in language students can discuss.",
  },
  {
    icon: IconShieldCheck,
    title: "Counselor-ready",
    body: "Saved plans turn into concise summaries for advising conversations.",
  },
] as const;

const assuranceCards = [
  { icon: IconLayers, text: "Uses saved SAIS course structure" },
  { icon: IconShieldCheck, text: "Student ID access" },
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
    mode: "onChange",
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          ok?: boolean;
          code?: string;
          message?: string;
          error?: unknown;
        } | null;
        if (json?.code === "MISSING_SESSION_SECRET" && json?.message) {
          setError(json.message);
          return;
        }
        if (res.status === 400 && json?.error) {
          setError("Check your Student ID. It should be exactly 8 digits.");
          return;
        }
        setError(json?.message ?? "Something went wrong. Try again.");
        return;
      }

      const statusRes = await fetch("/api/student/session-status", { cache: "no-store" });
      const statusJson = await statusRes.json().catch(() => null);
      if (statusRes.ok && statusJson?.hasActiveSession) {
        router.push("/welcome-back");
      } else {
        router.push("/intake");
      }
    } catch {
      setError("Network hiccup. Try again in a moment.");
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[100dvh] overflow-hidden">
      <div className="apf-journey-shell grid min-h-[100dvh] items-start gap-5 !py-5 sm:gap-8 sm:!py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:!py-12 xl:gap-16">
        <section className="apf-fade-up">
          <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/80 bg-white/80 p-2 pr-3 shadow-[0_18px_42px_-30px_rgba(15,118,110,0.7)] ring-1 ring-teal-200/60 sm:gap-3 sm:pr-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-teal-100 sm:h-12 sm:w-12">
              <Image src="/sais-logo.png" alt="SAIS" width={36} height={36} priority className="sm:h-[42px] sm:w-[42px]" />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800 sm:text-xs sm:tracking-[0.18em]">SAIS Academic Navigator</span>
              <span className="block text-[11px] font-semibold leading-snug text-slate-500 sm:text-xs">School-specific planning workspace</span>
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:mt-8 sm:text-5xl lg:text-6xl lg:leading-[1.02]">
            Academic planning that feels personal.
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7">
            A school-specific workspace that helps SAIS students understand course choices, tradeoffs, and next steps.
          </p>

          <div className="mt-8 hidden max-w-3xl gap-3 sm:grid sm:grid-cols-3">
            {[
              ["Rule-based", "Deterministic guidance"],
              ["Grade-aware", "Readiness or course paths"],
              ["Counselor view", "Printable advising summary"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/70"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">{label}</p>
                <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 hidden max-w-3xl rounded-[2rem] border border-white/90 bg-white/55 p-2 shadow-[0_26px_70px_-42px_rgba(15,23,42,0.45)] ring-1 ring-teal-200/60 sm:block">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-white via-cyan-50/70 to-indigo-50/55 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Planning brief</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">From answers to an advising conversation</p>
                </div>
                <span className="rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">Advising-ready</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {highlights.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-2xl border border-white/80 bg-white/85 p-4 ring-1 ring-slate-200/70">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="apf-fade-up apf-delay-2 w-full">
          <Card className="apf-premium-surface p-2 sm:p-3">
            <div className="rounded-[1.35rem] bg-gradient-to-br from-white via-white to-cyan-50/65 p-5 sm:rounded-[1.45rem] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Student entry</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Open your plan</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Enter your 8-digit Student ID to continue.</p>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.9)] sm:flex">
                  <IconBookOpen className="h-5 w-5" />
                </span>
              </div>

              <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800" htmlFor="studentId">
                    Student ID
                  </label>
                  <Input
                    id="studentId"
                    inputMode="numeric"
                    placeholder="e.g. 12345678"
                    autoComplete="off"
                    maxLength={8}
                    aria-describedby={
                      errors.studentId ? "student-id-error" : error ? "student-login-error" : "student-id-help"
                    }
                    aria-invalid={Boolean(errors.studentId || error)}
                    className="text-base"
                    {...studentIdReg}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "");
                      studentIdReg.onChange(e);
                    }}
                  />
                  {errors.studentId ? (
                    <p id="student-id-error" className="text-sm font-medium text-red-600">
                      {errors.studentId.message}
                    </p>
                  ) : null}
                  <p id="student-id-help" className="text-xs font-medium text-slate-500">
                    Digits only. No spaces.
                  </p>
                </div>

                {error ? (
                  <div
                    id="student-login-error"
                    ref={errorRef}
                    role="alert"
                    tabIndex={-1}
                    className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800 ring-1 ring-red-100"
                  >
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  aria-busy={submitting}
                  disabled={submitting}
                  className="group w-full justify-between py-3 pl-5 pr-3 text-base font-bold"
                >
                  <span>{submitting ? "Opening" : "Continue"}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 transition-transform duration-300 group-hover:translate-x-0.5">
                    <IconArrowRight className="h-4 w-4" />
                  </span>
                </Button>
                <div className="pt-1 text-center text-xs font-medium text-slate-500">
                  <a className="underline decoration-teal-300 underline-offset-4 hover:text-teal-900" href="/counselor">
                    Counselor access
                  </a>
                </div>
              </form>
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {assuranceCards.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="rounded-2xl border border-white/80 bg-white/70 p-4 text-xs font-semibold leading-5 text-slate-600 ring-1 ring-slate-200/80"
              >
                <Icon className="mb-2 h-4 w-4 text-teal-700" />
                {text}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
