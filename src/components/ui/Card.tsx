import type { HTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type CardProps = { children: ReactNode } & HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={twMerge(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(20,34,31,0.5)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
