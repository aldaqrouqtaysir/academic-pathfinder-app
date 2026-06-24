import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCounselorSessionToken, COUNSELOR_COOKIE_NAME } from "@/lib/auth/counselorSession";
import { getStudentRecordForCounselor } from "@/lib/persistence/studentPlanStore";
import { listNotesForStudent } from "@/lib/persistence/counselorNotesStore";

const ID_RE = /^[0-9]{8}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ studentId: string }> }) {
  const cookie = cookies().get(COUNSELOR_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyCounselorSessionToken(cookie))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { studentId } = await ctx.params;
  if (!ID_RE.test(studentId)) {
    return NextResponse.json({ ok: false, error: "Invalid student ID format." }, { status: 400 });
  }

  const record = await getStudentRecordForCounselor(studentId);
  if (!record) {
    return NextResponse.json({ ok: false, code: "NO_SAVED_PLAN", error: "No saved plan data for this student ID." });
  }

  const activeSession = record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
  const notes = await listNotesForStudent(studentId);

  return NextResponse.json({
    ok: true,
    studentId,
    activeSessionId: record.activeSessionId,
    sessionCount: record.sessions.length,
    activeSession,
    notes,
  });
}
