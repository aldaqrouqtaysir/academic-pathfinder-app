import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifyStudentSessionToken } from "@/lib/auth/studentSession";

export default async function WelcomeBackLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) {
    redirect("/login");
  }
  
  const studentId = await verifyStudentSessionToken(cookie);
  if (!studentId) {
    redirect("/login");
  }
  
  return <>{children}</>;
}
