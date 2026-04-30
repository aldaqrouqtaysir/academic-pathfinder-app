import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyCounselorSessionToken, COUNSELOR_COOKIE_NAME } from "@/lib/auth/counselorSession";
import { addCounselorNote } from "@/lib/persistence/counselorNotesStore";

const BodySchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/),
  body: z.string().trim().min(1).max(8000),
});

export async function POST(req: Request) {
  const cookie = cookies().get(COUNSELOR_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyCounselorSessionToken(cookie))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const note = await addCounselorNote(parsed.data.studentId, parsed.data.body);
  return NextResponse.json({ ok: true, note });
}
