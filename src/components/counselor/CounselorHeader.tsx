"use client";

import Link from "next/link";
import { useState } from "react";

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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link href="/counselor" className="min-w-0 flex-1 rounded-md pr-1 sm:pr-2">
          <span className="block truncate text-sm font-semibold text-slate-950">SAIS Academic Navigator</span>
          <span className="hidden truncate text-xs text-slate-600 sm:block">Counselor workspace</span>
        </Link>
        <nav aria-label="Counselor navigation" className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          <Link href="/counselor" className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-teal-900 hover:text-teal-950">
            Lookup
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center whitespace-nowrap text-slate-500 hover:text-slate-800">
            <span className="hidden sm:inline">Student login</span>
            <span className="sm:hidden">Student</span>
          </Link>
          <button
            type="button"
            className="min-h-11 min-w-11 whitespace-nowrap px-2 text-slate-500 hover:text-slate-800"
            aria-label="Sign out"
            aria-busy={signingOut}
            disabled={signingOut}
            onClick={() => void signOut()}
          >
            <span className="hidden sm:inline">{signingOut ? "Signing out" : "Sign out"}</span>
            <span className="sm:hidden">{signingOut ? "Wait" : "Exit"}</span>
          </button>
        </nav>
      </div>
      {signOutError ? (
        <p role="alert" className="mx-auto max-w-6xl px-3 pb-2 text-xs font-medium text-red-800 sm:px-6">
          Could not sign out. Please try again.
        </p>
      ) : null}
    </header>
  );
}
