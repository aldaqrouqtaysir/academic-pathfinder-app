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
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_20px_58px_-42px_rgba(15,23,42,0.45)] ring-1 ring-teal-200/45 print:hidden sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="apf-kicker">Counselor review</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Student record</h1>
          <p className="mt-1 font-mono text-sm font-semibold text-slate-600">{studentId}</p>
        </div>
        <Link
          href={`/counselor/student/${studentId}/report`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_-24px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:bg-teal-800"
        >
          Printable report
        </Link>
        </div>
      </div>

      <CounselorSummaryDocument studentId={studentId} session={activeSession} variant="default" />

      <CounselorNotesForm studentId={studentId} initialNotes={notes} />
    </div>
  );
}
