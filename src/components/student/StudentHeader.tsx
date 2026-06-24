"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StudentHeader() {
  const router = useRouter();
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
        <nav className="flex shrink-0 items-center gap-1 text-sm sm:gap-4">
          <Link
            className="whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-teal-900 transition hover:bg-teal-50 hover:text-teal-950"
            href="/intake?mode=edit"
            aria-label="Update answers"
          >
            <span className="hidden sm:inline">Update answers</span>
            <span className="sm:hidden">Edit</span>
          </Link>
          <button
            className="whitespace-nowrap rounded-lg px-2 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            aria-label="Sign out"
            type="button"
          >
            <span className="hidden sm:inline">Sign out</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
