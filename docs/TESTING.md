# Testing SAIS Academic Navigator

## Test layers

The repository has two deliberately separate quality layers:

- `npm run quality` runs lint, TypeScript, 31 Vitest tests, and a production build.
- `npm run test:e2e` runs browser workflows in Chromium with Playwright Test.

Keeping the browser suite separate makes the fast quality gate useful during development while still requiring E2E in GitHub Actions.

On Next.js 15.5, `npm run lint` calls `eslint . --max-warnings 0` directly because the `next lint` wrapper is deprecated. The existing Next.js Core Web Vitals rules remain active.

## Local setup

Use Node.js 20.x and the committed lockfile:

```bash
npm ci
npx playwright install chromium
```

Run the browser suite:

```bash
npm run test:e2e
```

Useful local modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:report
```

The Playwright configuration starts the Next.js development server at `http://127.0.0.1:3100` locally and in CI. CI still validates a separate production build before E2E. The HTTP test server deliberately does not simulate production HTTPS cookie transport; authentication behavior is otherwise exercised without adding a test-only override to the application.

## Data isolation

All browser records are synthetic. Playwright sets `DATA_DIR` to the exact repository-local path `.tmp/e2e-data` and explicitly clears optional Supabase variables for its server process. Global setup removes and recreates only that validated E2E directory; global teardown removes the same directory.

The safety check rejects cleanup if the resolved target is not exactly `.tmp/e2e-data`. The browser suite never reads from or writes to the normal `.data` directory.

## Covered workflows

The E2E suite covers:

- unauthenticated student and counselor route protection;
- student login validation, session routing, and network failure;
- required intake choices, keyboard selection, selected-state semantics, submission, and duplicate prevention;
- deterministic visibility and ordering of the characterized synthetic Grade 12 STEM recommendation;
- dashboard loading, missing-plan, expired-session, server-error, and retry behavior;
- returning-student routing and retained history after starting a new journey;
- a complete 375 by 812 student journey with horizontal-overflow detection;
- counselor login errors, lookup validation, missing records, record loading, notes, reload, and logout;
- note and lookup failures with controls restored after failure;
- printable report media rules and in-memory A4 PDF generation;
- axe WCAG A/AA scans on student login, intake, dashboard, counselor login, student record, and printable report.

## Artifacts and retries

Playwright uses one worker in CI and one retry. A trace is collected on the first retry; screenshots and videos are retained on failure. Reports and test output live under `output/playwright/`, which is ignored by Git. GitHub Actions uploads those directories only when the job fails and retains them for seven days.

## Full local validation

Before publication, run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run test:run
npm run build
npm run test:e2e
npm run test:e2e
npm run quality
```

Automated browser checks complement, but do not replace, manual review at 320, 375, 768, 1024, and 1440 CSS pixels.
