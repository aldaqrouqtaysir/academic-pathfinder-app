# SAIS Academic Navigator QA Checklist

Use this checklist before sharing a new demo link or taking final screenshots. Prefer a fresh 8-digit student ID for each full pass.

## Build And Repository Safety
- [ ] Run `npm ci`.
- [ ] Run `npm run build`.
- [ ] Confirm `package.json` still declares Node `"20.x"`.
- [ ] Confirm `.data/student-plans.json` is not staged or committed.
- [ ] Confirm Supabase secrets are only server env vars: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.

## Student Login And Protection
- [ ] `/login` loads on desktop and mobile.
- [ ] Invalid Student ID input shows a helpful validation message.
- [ ] Valid 8-digit Student ID reaches `/intake` or `/welcome-back`.
- [ ] Unauthenticated `/dashboard`, `/intake`, and `/welcome-back` redirect to `/login`.

## Intake And Recommendations
- [ ] Grade 9 or Grade 10 readiness intake reaches `/dashboard`.
- [ ] Grade 12 STEM/high-rigor intake reaches `/dashboard`.
- [ ] Grade 12 business/lighter-workload intake reaches `/dashboard`.
- [ ] Student with an existing plan can start a new journey.
- [ ] New journey creates a genuinely updated active plan.
- [ ] Dashboard reflects the newest active plan, not the older recommendation.
- [ ] Visible student UI does not show raw internal course codes.
- [ ] Visible student UI has no broken copy, placeholder text, or incomplete ellipses.

## Counselor Flow
- [ ] `/counselor/login` works with `COUNSELOR_ACCESS_CODE`.
- [ ] `/counselor/login` has a visible route back to student login.
- [ ] Unauthenticated `/counselor` redirects to `/counselor/login`.
- [ ] Counselor dashboard has a student-login route in the header.
- [ ] Counselor lookup finds the latest active student plan.
- [ ] Missing student lookup shows a friendly message.
- [ ] Counselor note save works.
- [ ] Printable counselor report loads.
- [ ] Visible counselor UI does not show raw internal course codes.
- [ ] Visible counselor UI has no broken copy, placeholder text, or incomplete ellipses.

## Vercel Supabase Retest
- [ ] Use a fresh student ID.
- [ ] Create Plan A with Grade 12 STEM/high-rigor answers.
- [ ] Start a new journey.
- [ ] Create Plan B with Grade 12 business/lighter-workload answers.
- [ ] Confirm dashboard now shows Plan B.
- [ ] Confirm counselor lookup shows Plan B.
- [ ] Confirm counselor notes still save.
- [ ] Confirm printable report still loads.
- [ ] Confirm the old stale Plan A is not shown as active.
