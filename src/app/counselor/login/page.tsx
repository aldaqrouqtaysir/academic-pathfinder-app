"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CounselorLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submitInFlight = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/counselor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: code }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.push("/counselor");
      router.refresh();
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      submitInFlight.current = false;
      setPending(false);
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[100dvh]">
      <div className="apf-journey-shell flex min-h-[100dvh] items-center">
        <div className="mx-auto w-full max-w-5xl py-6">
          <header className="max-w-3xl">
            <p className="apf-document-label">Counselor access</p>
            <h1 className="apf-display mt-3 text-4xl text-slate-950 sm:text-5xl">Review a student plan with the important details in view.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Look up an active plan, review the recommendation and considerations, add internal notes, and prepare a printable advising summary.
            </p>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-14">
            <section className="apf-paper p-5 sm:p-7" aria-labelledby="counselor-sign-in-heading">
              <p className="apf-document-label">Staff sign-in</p>
              <h2 id="counselor-sign-in-heading" className="apf-display mt-2 text-3xl text-slate-950">
                Open the counselor workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the passcode provided by the project owner.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="code" className="text-sm font-semibold text-slate-900">
                    Access code
                  </label>
                  <Input
                    id="code"
                    type="password"
                    autoComplete="off"
                    className="mt-2"
                    placeholder="Counselor access code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    aria-describedby={error ? "counselor-login-error" : "counselor-code-help"}
                    aria-invalid={Boolean(error)}
                  />
                  <p id="counselor-code-help" className="mt-2 text-xs leading-5 text-slate-500">
                    This passcode protects an MVP counselor route; it is not production staff authentication.
                  </p>
                </div>

                {error ? (
                  <p
                    id="counselor-login-error"
                    ref={errorRef}
                    role="alert"
                    tabIndex={-1}
                    className="border-l-4 border-red-700 bg-red-50 px-3 py-3 text-sm text-red-900"
                  >
                    {error}
                  </p>
                ) : null}

                <Button type="submit" aria-busy={pending} className="w-full" disabled={pending}>
                  {pending ? "Signing in" : "Continue"}
                </Button>
              </form>

              <Link
                href="/login"
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-teal-900 underline underline-offset-4"
              >
                Back to student login
              </Link>
            </section>

            <section aria-labelledby="workspace-scope-heading">
              <p className="apf-document-label">Workspace scope</p>
              <h2 id="workspace-scope-heading" className="apf-display mt-2 text-3xl text-slate-950">
                A lookup workflow, not a student roster
              </h2>
              <div className="mt-6 border-y border-slate-300">
                {[
                  ["Find", "Open a student’s latest active plan with an eight-digit Student ID."],
                  ["Review", "Scan the recommended courses, reasoning, workload considerations, and alternatives."],
                  ["Record", "Add counselor-only notes and print a concise advising document."],
                ].map(([title, body], index) => (
                  <div key={title} className="grid grid-cols-[2.75rem_1fr] gap-3 border-b border-slate-200 py-5 last:border-b-0">
                    <span className="font-semibold tabular-nums text-teal-800">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Recommendations remain deterministic decision support. Counselors confirm course availability, prerequisites, and the final academic decision.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
