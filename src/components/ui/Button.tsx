import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const classes =
    variant === "primary"
      ? "border border-transparent bg-[var(--apf-primary)] text-white hover:bg-[var(--apf-primary-hover)] active:bg-[var(--apf-primary-hover)]"
      : "border border-slate-300 bg-white text-slate-800 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-950 active:bg-teal-100";

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55",
          classes,
          className,
        ),
      )}
      {...props}
    />
  );
}
