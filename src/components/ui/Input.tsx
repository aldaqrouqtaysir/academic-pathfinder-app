import type { InputHTMLAttributes } from "react";
import React from "react";
import clsx from "clsx";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={clsx(
        "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:border-teal-700",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
