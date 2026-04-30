"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ID_RE = /^[0-9]{8}$/;

export function CounselorLookup() {
  const [id, setId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function go() {
    setError(null);
    const trimmed = id.trim();
    if (!ID_RE.test(trimmed)) {
      setError("Enter a valid 8-digit student ID.");
      return;
    }
    router.push(`/counselor/student/${trimmed}`);
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Student lookup</h2>
      <p className="mt-1 text-sm text-slate-600">
        Open the latest saved plan and recommendations for a student who has completed the navigator intake.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="sid" className="text-xs font-medium text-slate-500">
            Student ID
          </label>
          <Input
            id="sid"
            className="mt-1 font-mono"
            inputMode="numeric"
            maxLength={8}
            placeholder="12345678"
            value={id}
            onChange={(e) => setId(e.target.value.replace(/\D/g, "").slice(0, 8))}
            onKeyDown={(e) => e.key === "Enter" && go()}
          />
        </div>
        <Button type="button" onClick={go}>
          View student
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
