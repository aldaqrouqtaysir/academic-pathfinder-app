import { cookies } from "next/headers";
import { verifyCounselorSessionToken, COUNSELOR_COOKIE_NAME } from "@/lib/auth/counselorSession";
import { jsonNoStore } from "@/lib/http/jsonNoStore";
import { getStudentRecordForCounselor } from "@/lib/persistence/studentPlanStore";
import { listNotesForStudent } from "@/lib/persistence/counselorNotesStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ID_RE = /^[0-9]{8}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ studentId: string }> }) {
  const cookie = cookies().get(COUNSELOR_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyCounselorSessionToken(cookie))) {
    return jsonNoStore({ ok: false }, { status: 401 });
  }

  const { studentId } = await ctx.params;
  if (!ID_RE.test(studentId)) {
    return jsonNoStore({ ok: false, error: "Invalid student ID format." }, { status: 400 });
  }

  const record = await getStudentRecordForCounselor(studentId);
  if (!record) {
    return jsonNoStore({ ok: false, code: "NO_SAVED_PLAN", error: "No saved plan data for this student ID." });
  }

  const activeSession = record.sessions.find((s) => s.id === record.activeSessionId) ?? null;
  const notes = await listNotesForStudent(studentId);

  return jsonNoStore({
    ok: true,
    studentId,
    activeSessionId: record.activeSessionId,
    sessionCount: record.sessions.length,
    activeSession,
    notes,
  });
}
