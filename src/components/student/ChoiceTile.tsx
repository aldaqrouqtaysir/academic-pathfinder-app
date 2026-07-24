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
      aria-pressed={selected}
      className={clsx(
        "group relative min-h-11 w-full rounded-xl border text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-[0.99]",
        size === "lg" ? "px-5 py-4" : "px-4 py-3",
        selected
          ? "border-teal-700 bg-teal-50 shadow-[inset_3px_0_0_rgb(15_118_110)]"
          : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={clsx("font-semibold text-slate-900", size === "lg" ? "text-base" : "text-sm")}>{title}</div>
          {subtitle ? <div className="mt-1 text-xs leading-snug text-slate-600">{subtitle}</div> : null}
        </div>
        <span
          aria-hidden="true"
          className={clsx(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
            selected ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-transparent",
          )}
        >
          ✓
        </span>
      </div>
    </button>
  );
}
