import { CounselorLookup } from "@/components/counselor/CounselorLookup";
import { Card } from "@/components/ui/Card";

export default function CounselorDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Counselor dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Review navigator outputs students already saved. Use student lookup to open the active plan, recommendations,
          cautions, and your notes. Export a print-ready summary from the student view when needed.
        </p>
      </div>
      <CounselorLookup />
      <Card>
        <h2 className="text-sm font-semibold text-slate-900">How it works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Data reflects the student&apos;s last run through intake (stored locally for this MVP).</li>
          <li>Best fit, balanced, and stretch paths are deterministic — use them to frame conversations.</li>
          <li>Notes are counselor-only and stored separately from student-facing screens.</li>
        </ul>
      </Card>
    </div>
  );
}
