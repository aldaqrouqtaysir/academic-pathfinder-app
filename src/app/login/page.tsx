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

const LoginSchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/, "Student ID must be exactly 8 digits."),
});

type LoginValues = z.infer<typeof LoginSchema>;

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
          setError("Login failed. Check the Student ID format (exactly 8 digits).");
          return;
        }
        setError(json?.message ?? "Login failed. Please try again.");
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
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-sm">
            <Image src="/sais-logo.png" alt="SAIS" width={64} height={64} priority />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">SAIS Academic Navigator</h1>
          <p className="mt-2 text-sm text-slate-600">
            Personalized academic pathway guidance for SAIS students.
          </p>
        </div>

        <Card className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Enter your 8-digit SAIS student ID.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="studentId">
                Student ID
              </label>
              <Input
                id="studentId"
                inputMode="numeric"
                placeholder="e.g., 12345678"
                autoComplete="off"
                maxLength={8}
                {...studentIdReg}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  studentIdReg.onChange(e);
                }}
              />
              {errors.studentId ? (
                <p className="text-sm text-red-600">{errors.studentId.message}</p>
              ) : null}
              <p className="text-xs text-slate-500">Digits only. No spaces or prefixes.</p>
            </div>

            {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in..." : "Continue"}
            </Button>
            <div className="pt-1 text-center text-xs text-slate-500">
              <a className="underline decoration-slate-300 underline-offset-4 hover:text-slate-700" href="/counselor">
                Counselor access
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

