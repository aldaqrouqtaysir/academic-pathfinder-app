import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-white/80 bg-white/90 p-6 shadow-[0_18px_54px_-36px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80",
        className,
      )}
    >
      {children}
    </div>
  );
}
