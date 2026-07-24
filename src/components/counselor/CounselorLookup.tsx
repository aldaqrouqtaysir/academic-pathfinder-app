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
    <section className="apf-paper p-5 sm:p-7" aria-labelledby="student-lookup-heading">
      <p className="apf-document-label">Lookup</p>
      <h2 id="student-lookup-heading" className="mt-2 text-xl font-semibold text-slate-950">
        Find a student record
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Open the latest saved plan for a student who has completed the navigator intake.
      </p>
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void go();
        }}
      >
        <div className="flex-1">
          <label htmlFor="sid" className="text-sm font-semibold text-slate-900">
            Student ID
          </label>
          <Input
            id="sid"
            className="mt-2 font-mono tabular-nums"
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
          className="mt-4 border-l-4 border-red-700 bg-red-50 px-3 py-3 text-sm font-medium text-red-900"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
