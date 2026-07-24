export default function CounselorLoading() {
  return (
    <div aria-busy="true" className="apf-paper mx-auto max-w-xl p-6 text-center sm:p-8">
      <span aria-hidden="true" className="mx-auto block h-8 w-8 animate-pulse rounded-full border-4 border-teal-700 border-r-transparent" />
      <p role="status" className="mt-4 text-sm text-slate-700">
        Loading the counselor workspace.
      </p>
    </div>
  );
}
