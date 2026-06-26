import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { jsonNoStore } from "@/lib/http/jsonNoStore";
import { getActiveSession } from "@/lib/persistence/studentPlanStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const studentId = await requireStudentId();
    const active = await getActiveSession(studentId);
    return jsonNoStore({ ok: true, hasActiveSession: Boolean(active) });
  } catch {
    return jsonNoStore({ ok: false }, { status: 401 });
  }
}
