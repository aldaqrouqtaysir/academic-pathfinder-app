import { redirect } from "next/navigation";
import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { Card } from "@/components/ui/Card";

export default async function ReportPage() {
  try {
    await requireStudentId();
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_70%_at_50%_-15%,rgba(34,211,238,0.16),transparent)]">
      <div className="apf-journey-shell">
        <div className="apf-journey-hero mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-900">Coming soon</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">📄 Shareable report — next phase of the journey.</p>
        </div>
        <Card className="apf-journey-card max-w-3xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900">Report (placeholder)</h1>
          <p className="mt-3 text-sm font-medium leading-snug text-slate-600 line-clamp-3">
            Phase 2 will add a clean, downloadable summary you can share — same rules-aware engine, nicer packaging.
          </p>
        </Card>
      </div>
    </div>
  );
}
