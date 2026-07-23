import type { InputHTMLAttributes } from "react";
import React from "react";
import clsx from "clsx";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "min-h-11 w-full rounded-xl border border-white/80 bg-white/95 px-3.5 py-2.5 text-sm shadow-inner shadow-slate-200/40 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
