import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = {
  label: string;
  tone?: "teal" | "slate";
  selected?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">;

export function Chip({ label, tone = "slate", selected, onClick, type }: Props) {
  const baseTone = tone === "teal" ? "bg-teal-50 text-teal-800 ring-teal-100" : "bg-slate-50 text-slate-700 ring-slate-200";
  const active = selected
    ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-white bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-900 shadow-md"
    : "";

  if (onClick) {
    return (
      <button
        type={type ?? "button"}
        onClick={onClick}
        className={clsx(
          "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all duration-300 hover:bg-teal-50/90 hover:text-teal-900 active:scale-95",
          baseTone,
          active,
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1", baseTone, active)}>
      {label}
    </span>
  );
}

