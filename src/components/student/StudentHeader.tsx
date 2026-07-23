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
    <header className="sticky top-0 z-20 border-b-2 border-teal-200/50 bg-gradient-to-r from-white/95 via-cyan-50/50 to-teal-50/40 shadow-md shadow-teal-900/10 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        <Link href="/dashboard" className="apf-soft-bounce flex items-center gap-3 rounded-xl pr-2">
          <Image src="/sais-logo.png" alt="SAIS" width={36} height={36} className="rounded-lg ring-1 ring-teal-100/80" priority />
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">SAIS Academic Navigator</div>
            <div className="text-xs font-medium text-teal-800">Your pathway journey</div>
          </div>
        </Link>
        <nav aria-label="Student navigation" className="flex shrink-0 items-center gap-1 text-sm sm:gap-4">
          <Link
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-teal-900 transition hover:bg-teal-50 hover:text-teal-950"
            href="/intake?mode=edit"
            aria-label="Update answers"
          >
            <span className="hidden sm:inline">Update answers</span>
            <span className="sm:hidden">Edit</span>
          </Link>
          <button
            className="min-h-11 whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={() => void signOut()}
            aria-label="Sign out"
            aria-busy={signingOut}
            disabled={signingOut}
            type="button"
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
