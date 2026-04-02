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
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <h1 className="text-xl font-semibold">Report (Phase 1 placeholder)</h1>
          <p className="mt-2 text-sm text-slate-600">
            Phase 2 will generate a shareable/downloadable report (deterministic + AI explanation wording).
          </p>
        </Card>
      </div>
    </div>
  );
}

