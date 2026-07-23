import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COUNSELOR_COOKIE_NAME } from "@/lib/auth/counselorSession";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(COUNSELOR_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
