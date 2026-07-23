"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ID_RE = /^[0-9]{8}$/;

export function CounselorLookup() {
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const requestInFlight = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function go() {
    if (requestInFlight.current) return;
    setError(null);
    const trimmed = id.trim();
    if (!ID_RE.test(trimmed)) {
      setError("Enter a valid 8-digit student ID.");
      return;
    }

    requestInFlight.current = true;
    setChecking(true);
    try {
      const res = await fetch(`/api/counselor/student/${trimmed}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; code?: string } | null;

      if (res.status === 401) {
        router.push("/counselor/login");
        return;
      }

      if (res.status === 404 || data?.code === "NO_SAVED_PLAN") {
        setError("No saved plan found for this student yet. Ask the student to complete intake before opening counselor review.");
        return;
      }

      if (!res.ok) {
        setError("Could not open this student record. Check the ID and try again.");
        return;
      }

      router.push(`/counselor/student/${trimmed}`);
    } catch {
      setError("Network error. The student record was not changed; please try again.");
    } finally {
      requestInFlight.current = false;
      setChecking(false);
    }
  }

  return (
    <div className="apf-section-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="apf-kicker">Lookup</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Find a student plan</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
            Open the latest saved plan and recommendations for a student who has completed the navigator intake.
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900 ring-1 ring-teal-200">
          8-digit ID
        </span>
      </div>
      <form
        className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/75 p-4 ring-1 ring-white/80 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void go();
        }}
      >
        <div className="flex-1">
          <label htmlFor="sid" className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Student ID
          </label>
          <Input
            id="sid"
            className="mt-1 font-mono"
            inputMode="numeric"
            maxLength={8}
            placeholder="8-digit student ID"
            value={id}
            onChange={(e) => setId(e.target.value.replace(/\D/g, "").slice(0, 8))}
            aria-describedby={error ? "counselor-lookup-error" : undefined}
            aria-invalid={Boolean(error)}
          />
        </div>
        <Button type="submit" aria-busy={checking} disabled={checking}>
          {checking ? "Checking" : "View student"}
        </Button>
      </form>
      {error ? (
        <p
          id="counselor-lookup-error"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-100"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
