import { redirect } from "next/navigation";
import { isCounselorAuthenticated } from "@/lib/auth/requireCounselorSession";
import { CounselorHeader } from "@/components/counselor/CounselorHeader";

export default async function CounselorDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isCounselorAuthenticated())) {
    redirect("/counselor/login");
  }
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eefdfa_44%,#f7f5ff_100%)]">
      <CounselorHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
