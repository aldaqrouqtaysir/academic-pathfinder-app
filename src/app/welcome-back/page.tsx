"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StudentHeader } from "@/components/student/StudentHeader";

export default function WelcomeBackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startInFlight = useRef(false);

  async function startNew() {
    if (startInFlight.current) return;
    startInFlight.current = true;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/student/start-new", { method: "POST", cache: "no-store" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setError("Could not start a new plan. Your saved plan is unchanged. Try again.");
        return;
      }
      router.push("/intake");
    } catch {
      setError("Could not connect. Your saved plan is unchanged. Check your connection and try again.");
    } finally {
      startInFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <StudentHeader />
      <main id="main-content" tabIndex={-1} className="apf-journey-shell">
        <div className="mx-auto max-w-4xl py-4 sm:py-8">
          <header className="max-w-2xl">
            <p className="apf-document-label">Returning student</p>
            <h1 className="apf-display mt-3 text-4xl text-slate-950 sm:text-5xl">Your active plan is ready to review.</h1>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Continue with the recommendation already saved to your planning record, or begin a new set of answers.
            </p>
          </header>

          <section className="apf-paper mt-8 overflow-hidden" aria-labelledby="saved-plan-heading">
            <div className="grid lg:grid-cols-[1fr_0.9fr]">
              <div className="p-5 sm:p-8">
                <p className="apf-document-label">Active planning record</p>
                <h2 id="saved-plan-heading" className="apf-display mt-2 text-3xl text-slate-950">
                  Saved course plan
                </h2>
                <dl className="mt-6 space-y-4 border-y border-slate-200 py-5 text-sm">
                  <div className="flex items-start justify-between gap-5">
                    <dt className="text-slate-600">Status</dt>
                    <dd className="font-semibold text-emerald-800">Available to review</dd>
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <dt className="text-slate-600">Recommendation method</dt>
                    <dd className="text-right font-semibold text-slate-900">Deterministic, rule-based</dd>
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <dt className="text-slate-600">Can answers be revised?</dt>
                    <dd className="font-semibold text-slate-900">Yes</dd>
                  </div>
                </dl>
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  Opening the plan does not change it. You can review the courses, reasons, tradeoffs, and next steps before editing anything.
                </p>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-8 lg:border-l lg:border-t-0">
                <div className="space-y-3">
                  <Button className="w-full text-base" onClick={() => router.push("/dashboard")}>
                    Resume current plan
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={startNew}
                    aria-busy={loading}
                    disabled={loading}
                  >
                    {loading ? "Starting new plan" : "Start a new plan"}
                  </Button>
                </div>

                {error ? (
                  <p role="alert" className="mt-4 border-l-4 border-red-700 bg-red-50 px-3 py-3 text-sm text-red-900">
                    {error}
                  </p>
                ) : null}

                <div className="mt-6 border-t border-slate-300 pt-5">
                  <h3 className="text-sm font-semibold text-slate-950">If you start again</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Earlier plans remain in history. A new active plan appears only after you complete and save the intake again.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
