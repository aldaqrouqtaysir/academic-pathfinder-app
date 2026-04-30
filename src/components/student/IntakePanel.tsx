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

export function IntakePanel({ title, emoji, hint, children, className }: Props) {
  return (
    <section
      className={clsx(
        "rounded-2xl border-2 border-teal-100/90 border-l-[6px] border-l-teal-500 bg-gradient-to-br from-white via-cyan-50/25 to-teal-50/30 p-6 shadow-lg shadow-teal-900/5 ring-1 ring-cyan-100/40 transition duration-300 hover:border-teal-200/90 hover:shadow-xl sm:p-7 lg:p-8",
        className,
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(180px,260px)_1fr] lg:gap-10 xl:grid-cols-[minmax(200px,280px)_1fr]">
        <div className="lg:pt-1">
          <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {emoji ? (
              <span className="text-2xl leading-none" aria-hidden>
                {emoji}
              </span>
            ) : null}
            <span>{title}</span>
          </h2>
          {hint ? <p className="mt-2 text-xs font-medium leading-snug text-slate-600 sm:text-sm line-clamp-3">{hint}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
