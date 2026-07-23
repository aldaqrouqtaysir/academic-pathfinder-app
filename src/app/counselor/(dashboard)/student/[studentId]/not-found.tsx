import Link from "next/link";

export default function StudentNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Student lookup</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">No saved plan found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This student ID does not have a completed navigator intake yet. Ask the student to finish the intake flow, then
          search again from the counselor dashboard.
        </p>
        <Link
          href="/counselor"
          className="mt-5 inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Back to student lookup
        </Link>
      </div>
    </div>
  );
}
