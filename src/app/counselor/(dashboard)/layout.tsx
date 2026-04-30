import { redirect } from "next/navigation";
import { isCounselorAuthenticated } from "@/lib/auth/requireCounselorSession";
import { CounselorHeader } from "@/components/counselor/CounselorHeader";

export default async function CounselorDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isCounselorAuthenticated())) {
    redirect("/counselor/login");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 to-slate-50">
      <CounselorHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
