type Props = {
  value: number; // 0..100
  /** `lg` — taller bar for primary journey progress (e.g. intake). */
  size?: "md" | "lg";
  label?: string;
};

export function Progress({ value, size = "md", label = "Journey progress" }: Props) {
  const w = Math.min(100, Math.max(0, value));
  const h = size === "lg" ? "h-4 sm:h-5" : "h-3";
  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(w)}
      className={`w-full overflow-hidden rounded-full bg-slate-200/90 shadow-inner ring-1 ring-slate-200/60 ${h}`}
      role="progressbar"
    >
      <div
        aria-hidden="true"
        className={`apf-progress-shimmer rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-violet-500 transition-[width] duration-700 ease-out ${h}`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

