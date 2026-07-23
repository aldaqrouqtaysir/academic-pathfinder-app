import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const classes =
    variant === "primary"
      ? "bg-gradient-to-r from-teal-700 via-cyan-600 to-indigo-600 text-white shadow-[0_18px_34px_-22px_rgba(15,118,110,0.9)] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-24px_rgba(79,70,229,0.75)] active:translate-y-0 active:scale-[0.98]"
      : "border border-white/80 bg-white/90 text-slate-900 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.5)] ring-1 ring-slate-200/90 hover:-translate-y-0.5 hover:bg-teal-50/70 hover:ring-teal-200 active:translate-y-0 active:scale-[0.98]";

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100",
          classes,
          className,
        ),
      )}
      {...props}
    />
  );
}
