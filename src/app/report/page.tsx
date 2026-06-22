import { redirect } from "next/navigation";

/**
 * /report is not implemented for students in this MVP.
 * Redirect authenticated and unauthenticated users alike to /dashboard.
 * The counselor printable report lives at /counselor/student/[studentId]/report.
 */
export default function ReportPage() {
  redirect("/dashboard");
}
