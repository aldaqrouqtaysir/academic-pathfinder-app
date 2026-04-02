import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "sais_student_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing STUDENT_SESSION_SECRET env var.");
  }
  return secret;
}

export async function createStudentSessionToken(studentId: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const secret = getSessionSecret();
  const jwt = await new SignJWT({ studentId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(new TextEncoder().encode(secret));
  return jwt;
}

export async function verifyStudentSessionToken(token: string) {
  const secret = getSessionSecret();
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  const studentId = payload.studentId;
  if (typeof studentId !== "string" || !/^[0-9]{8}$/.test(studentId)) {
    return null;
  }
  return studentId;
}

export { COOKIE_NAME };

