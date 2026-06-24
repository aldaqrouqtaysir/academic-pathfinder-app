import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  /** Optional emoji shown before the title (journey personality). */
  emoji?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function IntakePanel({ title, hint, children, className }: Props) {
  return (
    <section
      className={clsx(
        "apf-section-card overflow-hidden border-l-[6px] border-l-teal-600 p-5 transition duration-300 hover:border-teal-200/90 hover:shadow-[0_22px_64px_-36px_rgba(15,118,110,0.5)] sm:p-6 lg:p-7",
        className,
      )}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(180px,250px)_1fr] lg:gap-8 xl:grid-cols-[minmax(200px,270px)_1fr]">
        <div className="lg:pt-1">
          <h2 className="flex flex-wrap items-center gap-3 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-600 text-sm font-black text-white shadow-md shadow-teal-900/20">
              {title.slice(0, 1)}
            </span>
            <span>{title}</span>
          </h2>
          {hint ? <p className="mt-3 text-xs font-medium leading-5 text-slate-600 sm:text-sm">{hint}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
