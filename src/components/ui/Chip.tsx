import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = {
  label: string;
  tone?: "teal" | "slate";
  selected?: boolean;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">;

export function Chip({ label, tone = "slate", selected, onClick, type }: Props) {
  const baseTone = tone === "teal" ? "border-teal-300 bg-teal-50 text-teal-950" : "border-slate-300 bg-white text-slate-700";
  const active = selected
    ? "border-teal-800 bg-teal-100 text-teal-950"
    : "";

  if (onClick) {
    return (
      <button
        type={type ?? "button"}
        onClick={onClick}
        aria-pressed={Boolean(selected)}
        className={clsx(
          "inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-950",
          baseTone,
          active,
        )}
      >
        {selected ? <span aria-hidden>✓</span> : null}
        {label}
      </button>
    );
  }

  return (
    <span className={clsx("inline-flex items-center rounded-md border px-2.5 py-1 text-xs", baseTone, active)}>
      {label}
    </span>
  );
}
