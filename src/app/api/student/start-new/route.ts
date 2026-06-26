import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { jsonNoStore } from "@/lib/http/jsonNoStore";
import { clearActiveSession } from "@/lib/persistence/studentPlanStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    const studentId = await requireStudentId();
    await clearActiveSession(studentId);
    return jsonNoStore({ ok: true });
  } catch {
    return jsonNoStore({ ok: false }, { status: 401 });
  }
}
