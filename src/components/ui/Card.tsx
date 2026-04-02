import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className ?? "rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"}>
      {children}
    </div>
  );
}

