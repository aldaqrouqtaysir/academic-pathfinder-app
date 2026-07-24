import Link from "next/link";

export default function StudentNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="apf-paper p-6">
        <p className="apf-document-label">Student lookup</p>
        <h1 className="apf-display mt-2 text-3xl text-slate-950">No saved plan found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This student ID does not have a completed navigator intake yet. Ask the student to finish the intake flow, then
          search again from the counselor dashboard.
        </p>
        <Link
          href="/counselor"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--apf-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--apf-primary-hover)]"
        >
          Back to student lookup
        </Link>
      </div>
    </div>
  );
}
