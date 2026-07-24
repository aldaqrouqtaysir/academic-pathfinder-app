"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StudentHeader() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed.");
      router.push("/login");
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 print:hidden">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-2 px-3 py-3.5 sm:gap-4 sm:px-8 lg:px-12">
        <Link href="/dashboard" className="apf-soft-bounce flex min-w-0 flex-1 items-center gap-2 rounded-lg pr-1 sm:gap-3 sm:pr-2">
          <Image src="/sais-logo.png" alt="SAIS" width={36} height={36} className="shrink-0 rounded-md" priority />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-950">SAIS Academic Navigator</div>
            <div className="hidden truncate text-xs text-slate-600 sm:block">Student planning workspace</div>
          </div>
        </Link>
        <nav aria-label="Student navigation" className="flex shrink-0 items-center gap-1 text-sm sm:gap-4">
          <Link
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-teal-900 transition-colors hover:bg-teal-50 hover:text-teal-950"
            href="/intake?mode=edit"
            aria-label="Update answers"
          >
            <span className="hidden sm:inline">Update answers</span>
            <span className="sm:hidden">Edit</span>
          </Link>
          <button
            className="min-h-11 min-w-11 whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            onClick={() => void signOut()}
            aria-label="Sign out"
            aria-busy={signingOut}
            disabled={signingOut}
            type="button"
          >
            <span className="hidden sm:inline">{signingOut ? "Signing out" : "Sign out"}</span>
            <span className="sm:hidden">{signingOut ? "Wait" : "Exit"}</span>
          </button>
        </nav>
      </div>
      {signOutError ? (
        <p role="alert" className="mx-auto w-full max-w-screen-2xl px-3 pb-2 text-xs font-medium text-red-800 sm:px-8 lg:px-12">
          Could not sign out. Please try again.
        </p>
      ) : null}
    </header>
  );
}
