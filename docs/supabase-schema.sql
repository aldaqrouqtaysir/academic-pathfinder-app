-- SAIS Academic Navigator optional Supabase persistence.
-- Run this in the Supabase SQL editor before setting SUPABASE_URL and
-- SUPABASE_SERVICE_ROLE_KEY in Vercel or another deployment host.

create extension if not exists pgcrypto;

create table if not exists public.student_plans (
  id uuid primary key default gen_random_uuid(),
  student_id text not null check (student_id ~ '^[0-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true,
  answers jsonb not null default '{}'::jsonb,
  scenario jsonb not null default '{}'::jsonb,
  outputs jsonb
);

create index if not exists student_plans_student_id_created_at_idx
  on public.student_plans (student_id, created_at desc);

create unique index if not exists student_plans_one_active_per_student_idx
  on public.student_plans (student_id)
  where is_active;

create table if not exists public.counselor_notes (
  id uuid primary key default gen_random_uuid(),
  student_id text not null check (student_id ~ '^[0-9]{8}$'),
  body text not null check (char_length(trim(body)) between 1 and 8000),
  created_at timestamptz not null default now()
);

create index if not exists counselor_notes_student_id_created_at_idx
  on public.counselor_notes (student_id, created_at desc);

alter table public.student_plans enable row level security;
alter table public.counselor_notes enable row level security;

-- The app writes through server-side Route Handlers with the Supabase service role key.
-- Do not add anon/authenticated policies for this MVP unless the auth model changes.
revoke all on table public.student_plans from anon, authenticated;
revoke all on table public.counselor_notes from anon, authenticated;
grant all on table public.student_plans to service_role;
grant all on table public.counselor_notes to service_role;

