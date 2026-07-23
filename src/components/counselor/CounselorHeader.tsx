"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBookOpen } from "@/components/icons/StudentIcons";

export function CounselorHeader() {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      const response = await fetch("/api/counselor/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed.");
      window.location.href = "/counselor/login";
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-white/90 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <Link href="/counselor" className="flex min-w-0 items-center gap-2 rounded-xl pr-2 text-sm font-semibold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-100">
              <IconBookOpen className="h-4 w-4" />
            </span>
            <span className="truncate">SAIS Academic Navigator</span>
          </Link>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200 sm:inline-flex">
            Counselor
          </span>
        </div>
        <nav aria-label="Counselor navigation" className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          <Link href="/counselor" className="inline-flex min-h-11 items-center whitespace-nowrap text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center whitespace-nowrap text-slate-500 hover:text-slate-800">
            <span className="hidden sm:inline">Student login</span>
            <span className="sm:hidden">Student</span>
          </Link>
          <button
            type="button"
            className="min-h-11 whitespace-nowrap text-slate-500 hover:text-slate-800"
            aria-label="Sign out"
            aria-busy={signingOut}
            disabled={signingOut}
            onClick={() => void signOut()}
          >
            <span className="hidden sm:inline">{signingOut ? "Signing out" : "Sign out"}</span>
            <span className="sm:hidden">{signingOut ? "Wait" : "Exit"}</span>
          </button>
          {signOutError ? (
            <span role="alert" className="sr-only">
              Could not sign out. Please try again.
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
