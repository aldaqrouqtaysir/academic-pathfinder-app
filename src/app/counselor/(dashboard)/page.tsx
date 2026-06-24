import { CounselorLookup } from "@/components/counselor/CounselorLookup";
import { Card } from "@/components/ui/Card";

export default function CounselorDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="apf-fade-up rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_22px_64px_-42px_rgba(15,23,42,0.45)] ring-1 ring-teal-200/50 sm:p-8">
        <p className="apf-kicker">Counselor Dashboard / Student Lookup</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Review saved navigator plans</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">
          Open a student&apos;s active plan, review the recommendation summary, add internal notes, and export a print-ready
          advising report when needed.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Saved plans", "Local MVP persistence"],
            ["Deterministic", "Rule-based recommendations"],
            ["Printable", "Counselor report view"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/80 p-4 ring-1 ring-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">{label}</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <CounselorLookup />
      <Card className="apf-section-card">
        <h2 className="text-sm font-semibold text-slate-900">How it works</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <li>Data reflects the student&apos;s last run through intake, stored locally for this MVP.</li>
          <li>Best fit, balanced, and stretch paths are deterministic. Use them to frame conversations.</li>
          <li>Notes are counselor-only and stored separately from student-facing screens.</li>
        </ul>
      </Card>
    </div>
  );
}
