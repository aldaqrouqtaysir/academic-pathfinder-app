import { NextResponse } from "next/server";
import { requireStudentId } from "@/lib/auth/requireStudentSession";
import { getActiveSession } from "@/lib/persistence/studentPlanStore";

export async function GET() {
  try {
    const studentId = await requireStudentId();
    const active = await getActiveSession(studentId);
    return NextResponse.json({ ok: true, activeSession: active });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

