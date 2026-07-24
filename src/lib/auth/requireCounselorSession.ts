import { cookies } from "next/headers";
import { COUNSELOR_COOKIE_NAME, verifyCounselorSessionToken } from "./counselorSession";

export async function isCounselorAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COUNSELOR_COOKIE_NAME)?.value;
  if (!cookie) return false;
  return verifyCounselorSessionToken(cookie);
}
