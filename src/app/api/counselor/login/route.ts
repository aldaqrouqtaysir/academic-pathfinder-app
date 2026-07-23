import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCounselorSessionToken, COUNSELOR_COOKIE_NAME } from "@/lib/auth/counselorSession";

export async function POST(req: Request) {
  const expected = process.env.COUNSELOR_ACCESS_CODE?.trim();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Counselor access is not configured (COUNSELOR_ACCESS_CODE)." },
      { status: 503 },
    );
  }

  let body: { accessCode?: string };
  try {
    body = (await req.json()) as { accessCode?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const accessCode = typeof body.accessCode === "string" ? body.accessCode.trim() : "";
  if (accessCode !== expected) {
    return NextResponse.json({ ok: false, error: "Incorrect access code." }, { status: 401 });
  }

  try {
    const token = await createCounselorSessionToken();
    cookies().set(COUNSELOR_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } catch (error) {
    console.error("[counselor-login] Could not create session.", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: "Counselor sign-in is temporarily unavailable. Check the server session configuration." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
