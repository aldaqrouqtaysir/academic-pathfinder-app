"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CounselorNote } from "@/lib/persistence/counselorNotesStore";
import { Button } from "@/components/ui/Button";

export function CounselorNotesForm(props: { studentId: string; initialNotes: CounselorNote[] }) {
  const { studentId, initialNotes } = props;
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    setError(null);
    const body = text.trim();
    if (!body) {
      setError("Enter a note before saving.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/counselor/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, body }),
      });
      if (!res.ok) {
        setError("Could not save note. Try again.");
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:hidden">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Counselor notes</h2>
      <p className="mt-1 text-sm text-slate-600">Visible only in the counselor workspace. Stored with this student ID.</p>

      {initialNotes.length > 0 ? (
        <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto border-y border-slate-100 py-3">
          {initialNotes.map((n) => (
            <li key={n.id} className="text-sm">
              <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
              <p className="mt-0.5 whitespace-pre-wrap text-slate-800">{n.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No notes yet.</p>
      )}

      <label className="mt-4 block">
        <span className="sr-only">New note</span>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          placeholder="Add a brief note for the file (placement discussion, follow-ups, etc.)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-3">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </section>
  );
}
