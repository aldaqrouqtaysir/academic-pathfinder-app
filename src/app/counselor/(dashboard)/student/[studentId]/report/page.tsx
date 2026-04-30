import { notFound, redirect } from "next/navigation";
import { isCounselorAuthenticated } from "@/lib/auth/requireCounselorSession";
import { getStudentRecordForCounselor } from "@/lib/persistence/studentPlanStore";
import { listNotesForStudent } from "@/lib/persistence/counselorNotesStore";
import { CounselorSummaryDocument } from "@/components/counselor/CounselorSummaryDocument";
import { CounselorPrintToolbar } from "@/components/counselor/CounselorPrintToolbar";

const ID_RE = /^[0-9]{8}$/;

export default async function CounselorReportPage({ params }: { params: Promise<{ studentId: string }> }) {
  if (!(await isCounselorAuthenticated())) {
    redirect("/counselor/login");
  }

  const { studentId } = await params;
  if (!ID_RE.test(studentId)) {
    notFound();
  }

  const record = await getStudentRecordForCounselor(studentId);
  if (!record) {
    notFound();
  }

  const activeSession = record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
  const notes = await listNotesForStudent(studentId);

  return (
    <div className="counselor-print-root mx-auto max-w-3xl">
      <CounselorPrintToolbar studentId={studentId} />
      <CounselorSummaryDocument
        studentId={studentId}
        session={activeSession}
        notes={notes}
        variant="report"
        showNav={false}
      />
    </div>
  );
}
