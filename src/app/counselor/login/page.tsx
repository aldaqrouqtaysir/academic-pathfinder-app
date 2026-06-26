"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { IconBookOpen, IconShieldCheck } from "@/components/icons/StudentIcons";

export default function CounselorLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/counselor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: code }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        setPending(false);
        return;
      }
      router.push("/counselor");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] px-4 py-12 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
        <section className="apf-fade-up">
          <p className="apf-kicker">Staff access</p>
          <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Counselor workspace for saved student plans.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Review the latest intake output, add internal notes, and open a printable advising summary from one focused dashboard.
          </p>
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
            {[
              { icon: IconBookOpen, title: "Student lookup", body: "Open an active saved plan by Student ID." },
              { icon: IconShieldCheck, title: "Staff access", body: "Passcode-protected for faculty review." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/80 bg-white/75 p-4 ring-1 ring-slate-200/80">
                <Icon className="h-5 w-5 text-teal-700" />
                <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>
        <Card className="apf-fade-up apf-delay-1 apf-premium-surface p-3">
          <div className="rounded-[1.45rem] bg-gradient-to-br from-white via-white to-cyan-50/60 p-6 sm:p-8">
            <p className="apf-kicker">Counselor sign-in</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Enter access code</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Enter the staff access code to continue. Student login and links are unchanged.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-teal-800 ring-1 ring-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-950"
            >
              Back to student login
            </Link>
            <div className="mt-7">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="code" className="text-sm font-medium text-slate-700">
                Access code
              </label>
              <Input
                id="code"
                type="password"
                autoComplete="off"
                className="mt-1"
                placeholder="Provided by your tech lead"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in" : "Continue"}
            </Button>
          </form>
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              Use the staff access code provided by the project owner.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
