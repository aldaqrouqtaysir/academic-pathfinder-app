import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  id?: string;
  title: string;
  /** Optional emoji shown before the title (journey personality). */
  emoji?: string;
  hint?: string;
  hasError?: boolean;
  missingHint?: string;
  children: ReactNode;
  className?: string;
};

export function IntakePanel({ id, title, hint, hasError = false, missingHint, children, className }: Props) {
  const headingId = id ? `${id}-heading` : undefined;
  const errorId = id ? `${id}-error` : undefined;
  return (
    <section
      id={id}
      aria-describedby={hasError && missingHint ? errorId : undefined}
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : title}
      tabIndex={hasError ? -1 : undefined}
      className={clsx(
        "apf-section-card overflow-hidden border border-slate-200 bg-white p-5 shadow-none ring-0 sm:p-6 lg:p-7",
        hasError &&
          "border-red-400 bg-red-50/40 ring-2 ring-red-200",
        className,
      )}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(180px,230px)_1fr] lg:gap-8">
        <div>
          <h2 id={headingId} className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            {title}
          </h2>
          {hint ? <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p> : null}
          {hasError && missingHint ? (
            <p id={errorId} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold leading-5 text-red-700 ring-1 ring-red-200">
              {missingHint}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
