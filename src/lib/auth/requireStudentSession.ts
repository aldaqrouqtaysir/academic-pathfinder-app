import { cookies } from "next/headers";
import { COOKIE_NAME, verifyStudentSessionToken } from "./studentSession";

export async function requireStudentId(): Promise<string> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) {
    throw new Error("No student session cookie.");
  }

  const studentId = await verifyStudentSessionToken(cookie);
  if (!studentId) {
    throw new Error("Invalid student session.");
  }

  return studentId;
}

