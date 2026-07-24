import { redirect } from "next/navigation";
import Link from "next/link";
import { isCounselorAuthenticated } from "@/lib/auth/requireCounselorSession";
import { getStudentRecordForCounselor } from "@/lib/persistence/studentPlanStore";
import { listNotesForStudent } from "@/lib/persistence/counselorNotesStore";
import { CounselorSummaryDocument } from "@/components/counselor/CounselorSummaryDocument";
import { CounselorNotesForm } from "@/components/counselor/CounselorNotesForm";
import StudentNotFound from "./not-found";

const ID_RE = /^[0-9]{8}$/;

export default async function CounselorStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  if (!(await isCounselorAuthenticated())) {
    redirect("/counselor/login");
  }

  const { studentId } = await params;
  if (!ID_RE.test(studentId)) {
    return <StudentNotFound />;
  }

  const record = await getStudentRecordForCounselor(studentId);
  if (!record) {
    return <StudentNotFound />;
  }

  const activeSession = record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
  const notes = await listNotesForStudent(studentId);

  return (
    <div className="space-y-6">
      <header className="apf-paper p-5 print:hidden sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="apf-document-label">Counselor review</p>
            <h1 className="apf-display mt-2 text-3xl text-slate-950">Student record</h1>
            <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-slate-600">{studentId}</p>
          </div>
          <Link
            href={`/counselor/student/${studentId}/report`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--apf-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--apf-primary-hover)]"
          >
            Printable report
          </Link>
        </div>
      </header>

      <CounselorSummaryDocument studentId={studentId} session={activeSession} variant="default" />

      <CounselorNotesForm studentId={studentId} initialNotes={notes} />
    </div>
  );
}
