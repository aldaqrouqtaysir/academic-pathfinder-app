-- Optional cleanup for Supabase projects created before the active-plan refresh fix.
-- This keeps the newest active row per student and deactivates older active rows.
-- It does not delete any historical plans.

with ranked_active_plans as (
  select
    id,
    row_number() over (
      partition by student_id
      order by updated_at desc, created_at desc, id desc
    ) as active_rank
  from public.student_plans
  where is_active = true
)
update public.student_plans
set is_active = false
where id in (
  select id
  from ranked_active_plans
  where active_rank > 1
);

create index if not exists student_plans_active_latest_idx
  on public.student_plans (student_id, updated_at desc, created_at desc)
  where is_active;

create unique index if not exists student_plans_one_active_per_student_idx
  on public.student_plans (student_id)
  where is_active;
