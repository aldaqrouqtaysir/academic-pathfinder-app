"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CounselorNote } from "@/lib/persistence/counselorNotesStore";
import { Button } from "@/components/ui/Button";

const noteDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dubai",
});

export function CounselorNotesForm(props: { studentId: string; initialNotes: CounselorNote[] }) {
  const { studentId, initialNotes } = props;
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const saveInFlight = useRef(false);
  const router = useRouter();

  async function submit() {
    if (saveInFlight.current) return;
    setError(null);
    setSavedMessage(null);
    const body = text.trim();
    if (!body) {
      setError("Enter a note before saving.");
      return;
    }
    saveInFlight.current = true;
    setPending(true);
    try {
      const res = await fetch("/api/counselor/notes", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, body }),
      });
      if (!res.ok) {
        setError("Could not save note. Try again.");
        return;
      }
      setText("");
      setSavedMessage("Note saved.");
      router.refresh();
    } catch {
      setError("Network error. The note was not saved; please try again.");
    } finally {
      saveInFlight.current = false;
      setPending(false);
    }
  }

  return (
    <section className="apf-paper p-5 print:hidden sm:p-7">
      <p className="apf-document-label">Counselor notes</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Internal advising notes</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Visible only in the counselor workspace and stored separately from student-facing screens.</p>

      {initialNotes.length > 0 ? (
        <ul className="mt-5 max-h-64 divide-y divide-slate-200 overflow-y-auto border-y border-slate-200">
          {initialNotes.map((n) => (
            <li key={n.id} className="py-3 text-sm">
              <time dateTime={n.createdAt} className="text-xs text-slate-500">
                {noteDateTimeFormatter.format(new Date(n.createdAt))} GST
              </time>
              <p className="mt-1 whitespace-pre-wrap break-words leading-6 text-slate-800 [overflow-wrap:anywhere]">{n.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 border-y border-dashed border-slate-300 py-4 text-sm text-slate-500">No notes yet.</p>
      )}

      <label htmlFor="counselor-note" className="mt-4 block">
        <span className="text-sm font-semibold text-slate-700">New note</span>
        <textarea
          id="counselor-note"
          className="mt-2 min-h-[112px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-teal-700"
          placeholder="Add a brief note for the file (placement discussion, follow-ups, etc.)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
          aria-describedby={error ? "counselor-note-error" : savedMessage ? "counselor-note-status" : undefined}
          aria-invalid={Boolean(error)}
        />
      </label>
      {error ? (
        <p id="counselor-note-error" role="alert" className="mt-3 border-l-4 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      {savedMessage ? (
        <p id="counselor-note-status" role="status" className="mt-2 text-sm font-medium text-emerald-700">
          {savedMessage}
        </p>
      ) : null}
      <div className="mt-3">
        <Button type="button" aria-busy={pending} onClick={() => void submit()} disabled={pending}>
          {pending ? "Saving" : "Save note"}
        </Button>
      </div>
    </section>
  );
}
