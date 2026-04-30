"use client";

import clsx from "clsx";

type Props = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
  size?: "md" | "lg";
};

export function ChoiceTile({ title, subtitle, selected, onClick, size = "md" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full rounded-2xl border text-left transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98]",
        size === "lg" ? "px-5 py-4" : "px-4 py-3",
        selected
          ? "border-teal-500 bg-gradient-to-br from-teal-100/90 via-cyan-50 to-violet-100/70 shadow-lg shadow-teal-900/15 ring-2 ring-teal-400/50 ring-offset-2 ring-offset-white"
          : "border-slate-200/90 bg-white hover:border-indigo-300 hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 hover:shadow-md",
      )}
    >
      <div className={clsx("font-semibold text-slate-900", size === "lg" ? "text-base" : "text-sm")}>{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-600">{subtitle}</div> : null}
    </button>
  );
}
