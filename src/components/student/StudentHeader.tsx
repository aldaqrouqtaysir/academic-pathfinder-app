"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StudentHeader() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/sais-logo.png" alt="SAIS" width={36} height={36} className="rounded" priority />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">SAIS Academic Navigator</div>
            <div className="text-xs text-slate-600">Student planning</div>
          </div>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" href="/intake?mode=edit">
            Edit answers
          </Link>
          <button
            className="text-slate-600 hover:text-slate-900"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            type="button"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}

