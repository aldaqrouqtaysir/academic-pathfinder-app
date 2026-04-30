import { SignJWT, jwtVerify } from "jose";

export const COUNSELOR_COOKIE_NAME = "sais_counselor_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function counselorSecret(): string {
  const s = process.env.COUNSELOR_SESSION_SECRET ?? process.env.STUDENT_SESSION_SECRET;
  if (!s) {
    throw new Error("Set COUNSELOR_SESSION_SECRET or STUDENT_SESSION_SECRET for counselor sessions.");
  }
  return s;
}

export async function createCounselorSessionToken(ttlSeconds = DEFAULT_TTL_SECONDS) {
  const secret = counselorSecret();
  const jwt = await new SignJWT({ role: "counselor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(new TextEncoder().encode(secret));
  return jwt;
}

export async function verifyCounselorSessionToken(token: string): Promise<boolean> {
  try {
    const secret = counselorSecret();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "counselor";
  } catch {
    return false;
  }
}
