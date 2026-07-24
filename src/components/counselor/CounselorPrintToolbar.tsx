"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CounselorPrintToolbar(props: { studentId: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-4 print:hidden">
      <Link
        href={`/counselor/student/${props.studentId}`}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-700 hover:text-teal-900"
      >
        Back to student
      </Link>
      <Button type="button" variant="secondary" onClick={() => window.print()}>
        Print / Save as PDF
      </Button>
    </div>
  );
}
