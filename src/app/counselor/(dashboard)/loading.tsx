export default function CounselorLoading() {
  return (
    <div aria-busy="true" className="apf-section-card mx-auto max-w-xl p-6 text-center sm:p-8">
      <span aria-hidden="true" className="mx-auto block h-10 w-10 animate-pulse rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500" />
      <p role="status" className="mt-4 text-sm font-semibold text-slate-700">
        Loading the counselor workspace.
      </p>
    </div>
  );
}
