import { CounselorLookup } from "@/components/counselor/CounselorLookup";

export default function CounselorDashboardPage() {
  return (
    <div className="space-y-7">
      <header className="max-w-3xl">
        <p className="apf-document-label">Counselor workspace</p>
        <h1 className="apf-display mt-2 text-4xl text-slate-950">Find a saved student plan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter a Student ID to open the latest active plan. This workspace does not display a complete student roster.
        </p>
      </header>

      <CounselorLookup />

      <section className="border-t border-slate-300 pt-6" aria-labelledby="review-scope-heading">
        <h2 id="review-scope-heading" className="text-sm font-semibold text-slate-950">
          Review scope
        </h2>
        <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-900">Plan source</dt>
            <dd className="mt-1 leading-6 text-slate-600">The student&apos;s latest completed intake and active saved plan.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Recommendation</dt>
            <dd className="mt-1 leading-6 text-slate-600">Deterministic Best Fit, Balanced, and Stretch decision support.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Counselor record</dt>
            <dd className="mt-1 leading-6 text-slate-600">Internal notes and a printable advising summary.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
