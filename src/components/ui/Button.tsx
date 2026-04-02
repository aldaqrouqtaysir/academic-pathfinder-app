import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const classes =
    variant === "primary"
      ? "bg-gradient-to-r from-teal-600 to-sky-500 text-white hover:from-teal-700 hover:to-sky-600 shadow-sm"
      : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50";

  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          classes,
          className,
        ),
      )}
      {...props}
    />
  );
}

