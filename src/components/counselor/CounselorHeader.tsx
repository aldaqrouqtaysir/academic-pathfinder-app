"use client";

import Link from "next/link";

export function CounselorHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/counselor" className="text-sm font-semibold tracking-tight text-slate-900">
            SAIS Academic Navigator
          </Link>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
            Counselor
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/counselor" className="text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-800"
            onClick={async () => {
              await fetch("/api/counselor/logout", { method: "POST" });
              window.location.href = "/counselor/login";
            }}
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
