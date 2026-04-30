"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { IconGraduationCap, IconRoute, IconShieldCheck } from "@/components/icons/StudentIcons";

const LoginSchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/, "Student ID must be exactly 8 digits."),
});

type LoginValues = z.infer<typeof LoginSchema>;

const highlights = [
  {
    icon: IconGraduationCap,
    emoji: "🎯",
    title: "A path that feels like you",
    body: "Goals + strengths + SAIS rules — woven into one guided flow.",
  },
  {
    icon: IconRoute,
    emoji: "🚀",
    title: "Clear next steps",
    body: "Less wall of text — more “here’s what to do next.”",
  },
  {
    icon: IconShieldCheck,
    emoji: "🛡️",
    title: "Built on real structure",
    body: "Sequences and pathways checked against how SAIS is set up.",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function onSubmit(values: LoginValues) {
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
          setError("Hmm — check your Student ID (exactly 8 digits).");
          return;
        }
        setError(json?.message ?? "Something went wrong. Try again?");
        return;
      }

      const statusRes = await fetch("/api/student/session-status");
      const statusJson = await statusRes.json().catch(() => null);
      if (statusRes.ok && statusJson?.hasActiveSession) {
        router.push("/welcome-back");
      } else {
        router.push("/intake");
      }
    } catch {
      setError("Network hiccup — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_130%_85%_at_50%_-22%,rgba(34,211,238,0.22),transparent)]">
      <div className="apf-journey-shell flex flex-col gap-12 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16">
        <div className="apf-fade-up flex max-w-2xl flex-1 flex-col justify-center lg:max-w-none lg:pr-4 xl:pr-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md ring-2 ring-teal-100/80">
              <Image src="/sais-logo.png" alt="SAIS" width={48} height={48} priority />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-800">SAIS Academic Navigator</p>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.08]">
            Plan your year with confidence
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-snug text-slate-600 sm:text-lg line-clamp-3">
            A friendly, guided workspace — not a boring form. Tap through a few steps and see a path that fits.
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-1 lg:max-w-xl">
            {highlights.map(({ icon: Icon, emoji, title, body }) => (
              <li
                key={title}
                className="apf-soft-bounce flex gap-4 rounded-2xl border border-teal-100/80 bg-white/80 p-4 shadow-sm ring-1 ring-cyan-100/40"
              >
                <span className="mt-0.5 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-lg ring-1 ring-teal-100">
                  <Icon className="h-5 w-5 text-teal-700" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    <span className="mr-1.5" aria-hidden>
                      {emoji}
                    </span>
                    {title}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug text-slate-600 line-clamp-2">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="apf-fade-up apf-delay-2 flex w-full flex-1 flex-col justify-center lg:max-w-md xl:max-w-lg">
          <Card className="apf-journey-card border-teal-200/60 p-7 sm:p-8">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span aria-hidden>👋</span>
                Sign in
              </h2>
              <p className="text-sm font-medium text-slate-600">Your 8-digit SAIS student ID is your key.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                  className="text-base"
                  {...studentIdReg}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                    studentIdReg.onChange(e);
                  }}
                />
                {errors.studentId ? (
                  <p className="text-sm font-medium text-red-600">{errors.studentId.message}</p>
                ) : null}
                <p className="text-xs font-medium text-slate-500">Digits only — no spaces.</p>
              </div>

              {error ? (
                <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800 ring-1 ring-red-100">{error}</div>
              ) : null}

              <Button type="submit" disabled={submitting} className="w-full py-3 text-base font-bold shadow-lg shadow-teal-900/15">
                {submitting ? "Opening…" : "Continue your journey →"}
              </Button>
              <div className="pt-1 text-center text-xs font-medium text-slate-500">
                <a className="underline decoration-teal-300 underline-offset-4 hover:text-teal-900" href="/counselor">
                  Counselor access
                </a>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
