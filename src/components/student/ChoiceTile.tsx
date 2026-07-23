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
        "group relative min-h-11 w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98]",
        size === "lg" ? "px-5 py-4" : "px-4 py-3",
        selected
          ? "border-teal-500 bg-gradient-to-br from-teal-100/95 via-white to-cyan-50 shadow-[0_18px_38px_-26px_rgba(15,118,110,0.9)] ring-2 ring-teal-400/50 ring-offset-2 ring-offset-white"
          : "border-white/80 bg-white/90 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-[0_18px_38px_-28px_rgba(15,118,110,0.55)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={clsx("font-semibold text-slate-900", size === "lg" ? "text-base" : "text-sm")}>{title}</div>
          {subtitle ? <div className="mt-1 text-xs leading-snug text-slate-600">{subtitle}</div> : null}
        </div>
        {selected ? (
          <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
            ✓
          </span>
        ) : null}
      </div>
    </button>
  );
}
