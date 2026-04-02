import clsx from "clsx";

type Props = {
  children: string;
  tone?: "primary" | "success" | "warning" | "neutral";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const classes =
    tone === "primary"
      ? "bg-teal-600 text-white"
      : tone === "success"
        ? "bg-emerald-600 text-white"
        : tone === "warning"
          ? "bg-amber-500 text-white"
          : "bg-slate-100 text-slate-700";

  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", classes)}>{children}</span>;
}

