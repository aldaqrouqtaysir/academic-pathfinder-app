import { NextResponse } from "next/server";
import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { clearActiveSession } from "@/lib/persistence/studentPlanStore";

export async function POST() {
  try {
    const studentId = await requireStudentId();
    await clearActiveSession(studentId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

