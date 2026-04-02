import { NextResponse } from "next/server";
import { z } from "zod";
import { createStudentSessionToken, COOKIE_NAME } from "@/lib/auth/studentSession";

const BodySchema = z.object({
  studentId: z.string().regex(/^[0-9]{8}$/, "Student ID must be exactly 8 digits."),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  let token: string;
  try {
    token = await createStudentSessionToken(parsed.data.studentId);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("STUDENT_SESSION_SECRET")) {
      return NextResponse.json(
        {
          ok: false,
          code: "MISSING_SESSION_SECRET",
          message:
            "Server is missing STUDENT_SESSION_SECRET. Add it to .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, code: "SESSION_ERROR", message: "Could not create session." }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

