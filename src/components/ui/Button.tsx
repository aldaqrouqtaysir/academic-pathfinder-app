import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const classes =
    variant === "primary"
      ? "bg-gradient-to-r from-teal-600 via-cyan-500 to-violet-600 text-white shadow-md shadow-teal-900/20 hover:brightness-110 active:scale-[0.98]"
      : "bg-white text-slate-900 ring-1 ring-slate-200/90 hover:bg-indigo-50/80 hover:ring-indigo-200 active:scale-[0.98]";

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
          classes,
          className,
        ),
      )}
      {...props}
    />
  );
}

