import { cookies } from "next/headers";
import { COUNSELOR_COOKIE_NAME, verifyCounselorSessionToken } from "./counselorSession";

export async function isCounselorAuthenticated(): Promise<boolean> {
  const cookie = cookies().get(COUNSELOR_COOKIE_NAME)?.value;
  if (!cookie) return false;
  return verifyCounselorSessionToken(cookie);
}
