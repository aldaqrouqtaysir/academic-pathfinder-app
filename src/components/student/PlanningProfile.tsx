"use client";

export type PlanningProfileItem = {
  label: string;
  value: string;
};

export type PlanningProfileSection = {
  title: string;
  step: number;
  items: PlanningProfileItem[];
};

type Props = {
  sections: PlanningProfileSection[];
  onEdit: (step: number) => void;
};

function ProfileSections({ sections, onEdit }: Props) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{section.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              aria-label={`Edit ${section.title.toLowerCase()} answers`}
              className="min-h-11 min-w-11 rounded-lg px-2 text-xs font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 transition hover:text-teal-950"
            >
              Edit
            </button>
          </div>
          <dl className="mt-1 space-y-3">
            {section.items.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium text-slate-600">{item.label}</dt>
                <dd className="mt-0.5 break-words text-sm font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function PlanningProfile({ sections, onEdit }: Props) {
  if (sections.length === 0) return null;

  return (
    <>
      <details className="group mt-5 rounded-xl border border-slate-200 bg-white lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:content-none">
          <span>
            <span className="block text-sm font-semibold text-slate-950">Your planning profile</span>
            <span className="mt-0.5 block text-xs text-slate-600">Review the answers you have added</span>
          </span>
          <span aria-hidden="true" className="text-lg leading-none text-teal-800 transition-transform duration-150 group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="border-t border-slate-200 px-4 py-4">
          <h2 className="sr-only">Your planning profile</h2>
          <ProfileSections sections={sections} onEdit={onEdit} />
        </div>
      </details>

      <section className="mt-6 hidden border-t border-slate-200 pt-5 lg:block" aria-labelledby="planning-profile-heading">
        <div>
          <h2 id="planning-profile-heading" className="text-sm font-semibold text-slate-950">
            Your planning profile
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">Only answers you have entered appear here.</p>
        </div>
        <div className="mt-4">
          <ProfileSections sections={sections} onEdit={onEdit} />
        </div>
      </section>
    </>
  );
}
