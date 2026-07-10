# SAIS Academic Navigator

> A guided academic planning and recommendation workspace for high school students.

## Live Demo
[Open the live demo on Render](https://academic-pathfinder-app.vercel.app/login)

## Problem Statement
High school academic planning is often a confusing maze of PDFs, prerequisites, and competing graduation requirements. Students struggle to build cohesive schedules that align with their career aspirations, workload tolerance, and university goals, while counselors are overwhelmed manually validating graduation paths.

## What the App Does
**SAIS Academic Navigator** transforms course selection from a bureaucratic form into an engaging, interactive journey. It collects a student's interests, strengths, academic confidence, and destination goals to generate a personalized, rule-based course pathway. It also provides a passcode-protected counselor dashboard for faculty to review student submissions, leave notes, and print counselor-facing summaries.

## Project Status
- **Stable MVP:** The core student intake, recommendation dashboard, and counselor review flows are implemented.
- **Build Passing:** The app currently passes clean install and production build checks.
- **Portfolio/Demo Ready:** Designed for portfolio review, resume screenshots, and stakeholder demos using sample student IDs.
- **Not Production School Infrastructure:** A real school pilot would require database-backed persistence, stronger authentication, and school-approved privacy/security review.

## Key Features
- **Interactive Intake Flow:** A modern, guided UI that captures nuanced student context (e.g., workload tolerance, risk preference, target universities).
- **Rule-Based Recommendation Engine:** Deterministically maps student preferences against school-specific academic rules to output a tailored course schedule.
- **Dedicated Counselor Portal:** A passcode-protected dashboard where counselors can review student plans, leave notes, and generate printable summaries.
- **Responsive & Accessible UI:** Designed with modern aesthetics, subtle micro-animations, and a mobile-friendly layout.
- **MVP Session Handling:** Lightweight JWT-based sessions for demo use, with student-ID login and counselor access-code login.

## Screenshots
### Student Login
![Student login page](docs/images/student-login.png)

### Guided Intake
![Student intake flow](docs/images/intake-flow.png)

### Grade 12 Recommendation Dashboard
![Grade 12 recommendation dashboard](docs/images/grade-12-dashboard.png)

### Grade 10 Readiness Mode
![Grade 10 readiness dashboard](docs/images/grade-10-readiness-dashboard.png)

### Counselor Dashboard
![Counselor dashboard and student lookup](docs/images/counselor-dashboard.png)

### Counselor Student Summary
![Counselor student summary](docs/images/counselor-student-summary.png)

### Printable Counselor Report
![Printable counselor report](docs/images/counselor-printable-report.png)

## Tech Stack
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (for custom micro-animations and gradients)
- **Forms & Validation:** React Hook Form + Zod
- **Authentication:** `jose` for lightweight MVP session cookies/JWTs
- **Persistence:** JSON/File-based storage (MVP grade)

## Architecture Overview
The application follows a standard Next.js App Router architecture with a clear separation of concerns:
- `src/app/`: Contains the route definitions and page components (e.g., `/intake`, `/dashboard`, `/counselor`).
- `src/components/`: Reusable UI components and domain-specific widgets.
- `src/lib/`: Core business logic, including the recommendation engine, authentication helpers, and file-based data persistence.
- `src/data/`: Static domain data such as course catalogs, prerequisites, and SAIS-specific rules.

### MVP Note on Data Persistence
Currently, the app relies on a local JSON file-based store to quickly iterate and validate the user experience without the overhead of a full database. Production deployments will require migrating this to a real database (e.g., PostgreSQL).

## Demo Flow
### Student Experience
1. **Login:** Students enter an 8-digit Student ID for MVP/demo access.
2. **Intake Journey:** A multi-step form captures their current academic standing, career interests, preferred destinations, and workload tolerance.
3. **Dashboard:** The deterministic rule-based engine processes the intake data and presents a customized academic plan.
4. **Iterate:** Students can refine their preferences and immediately see updated recommendations.

### Counselor Experience
1. **Login:** Faculty/demo reviewers log in via a hidden route (`/counselor/login`) using a shared access code.
2. **Dashboard:** Counselors view a roster of active student plans.
3. **Review & Annotate:** Counselors can review the exact inputs a student provided, append internal notes, and flag plans for discussion.
4. **Export:** Generate clean, printable summaries for advising conversations and demos.

## Recommendation Engine Overview
The recommendation logic is **deterministic and rule-based**, not a trained Machine Learning model. It evaluates a student's responses against an array of hard constraints (graduation requirements, prerequisites) and soft constraints (interests, workload tolerance). The engine scores potential course combinations and selects the path that maximizes the student's personal optimization target (e.g., "University competitiveness" vs. "Lighter workload").

## Recommended Demo IDs
- Student demo IDs: `20120164`, `20120167`, `20120168`, `20120169`
- Counselor access depends on `COUNSELOR_ACCESS_CODE` in `.env.local` or the deployment environment.

## Local Setup Instructions

### Prerequisites
- Node.js 20.x
- npm 10.x+

### Installation
1. Clone the repository.
2. Run `npm ci` to install dependencies cleanly.
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Required Environment Variables
See `.env.example` for details. You must configure the following in your `.env.local` for the app to function:
- `STUDENT_SESSION_SECRET`: A secure random string for signing student session cookies.
- `COUNSELOR_ACCESS_CODE`: The passcode faculty/demo reviewers use to access the counselor portal.
- `COUNSELOR_SESSION_SECRET` (Optional): For counselor JWTs. Falls back to `STUDENT_SESSION_SECRET` if missing.
- `SUPABASE_URL` (Optional): Supabase project URL for durable hosted persistence.
- `SUPABASE_SERVICE_ROLE_KEY` (Optional): Server-side Supabase service role key. Required with `SUPABASE_URL`; never expose this as a `NEXT_PUBLIC_*` variable.
- `DATA_DIR` (Optional): The directory path where JSON storage will reside when Supabase is not configured. Default is `.data/`. Serverless demo hosts can use a writable temporary path such as `/tmp/sais-academic-navigator`, but data will not be durable.

## Demo & Testing
For a comprehensive guide on how to test the application, including suggested scripts and workflows, please refer to [DEMO.md](./DEMO.md).

## Optional Supabase Persistence
The app supports optional Supabase-backed persistence for student plans and counselor notes. This is recommended for Vercel because serverless filesystem storage is temporary and not reliable across separate requests, cold starts, or deploys.

How it works:
1. If both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured, the server-side persistence layer uses Supabase.
2. If either Supabase variable is missing, the app falls back to the existing JSON/file store.
3. The rest of the app uses the same persistence functions either way; recommendation logic and UI behavior are unchanged.

Supabase setup:
1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run the schema in [docs/supabase-schema.sql](./docs/supabase-schema.sql).
4. In Vercel or Render, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables.
5. Redeploy the app.

If an older Supabase demo project ever shows a stale active plan after a student reruns intake, run [docs/supabase-active-plan-cleanup.sql](./docs/supabase-active-plan-cleanup.sql) once. It keeps the newest active plan for each student, deactivates older active rows, and recreates the active-plan indexes without deleting history.

Security notes:
- `SUPABASE_SERVICE_ROLE_KEY` is used only by server-side Route Handlers and server-rendered counselor pages.
- Do not prefix the service role key with `NEXT_PUBLIC_`.
- The included schema enables Row Level Security and does not grant direct browser-role table access.
- This remains MVP-grade persistence and session handling, not full production student data governance.

## Deployment Notes (Render)
When deploying this MVP to a service like [Render](https://render.com), choose one persistence option:
1. **Required Environment Variables:** Set `STUDENT_SESSION_SECRET` and `COUNSELOR_ACCESS_CODE` in the Render dashboard. `COUNSELOR_SESSION_SECRET` is optional and falls back to `STUDENT_SESSION_SECRET`.
2. **Persistence Option A - Supabase:** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to use hosted Supabase persistence.
3. **Persistence Option B - Render Disk:** If Supabase is not configured, attach a Render Persistent Disk to your Web Service to ensure JSON data survives deploys and restarts.
4. **Mount Path:** Mount the disk to a directory (e.g., `/var/data`).
5. **Data Directory:** Set `DATA_DIR=/var/data` in the Render dashboard so the app writes JSON files to the persistent volume when Supabase is not configured. If `DATA_DIR` is omitted and the default `.data/` path is not writable, the app falls back to temporary storage so demos can still run, but saved plans may disappear after restarts or deploys.
6. **Node Version:** Ensure Render is configured to use Node `20.x`.
7. **Build Command:** Use `npm ci --include=dev && npm run build`.
8. **Start Command:** Use `npm start`.
9. **Troubleshooting:** If `Unlock my plan` reports that the server could not save the plan, check Render logs for `PERSISTENCE_ERROR` or `[studentPlanStore]` and verify either Supabase env vars or the disk mount plus `DATA_DIR`.

## Deployment Notes (Vercel Demo Copy)
Vercel can host a second demo deployment without replacing the working Render deployment. The app uses standard Next.js App Router pages and Route Handlers. For reliable counselor lookup, notes, and printable reports on Vercel, configure Supabase persistence.

Recommended Vercel settings:
1. **Framework Preset:** Next.js.
2. **Root Directory:** Repository root.
3. **Install Command:** `npm ci`.
4. **Build Command:** `npm run build`.
5. **Output Directory:** Leave as the Vercel default for Next.js.
6. **Node.js Version:** Use Node `20.x`; this is also declared in `package.json`.
7. **Required Environment Variables:** `STUDENT_SESSION_SECRET` and `COUNSELOR_ACCESS_CODE`.
8. **Recommended Persistence Environment Variables:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
9. **Optional Environment Variables:** `COUNSELOR_SESSION_SECRET` for a separate counselor token secret. `DATA_DIR=/tmp/sais-academic-navigator` can be used only as temporary fallback storage when Supabase is not configured.

Known Vercel limitation: Vercel Functions have a read-only filesystem except for writable `/tmp` scratch space. If Supabase is not configured, saved student plans and counselor notes may disappear across deployments, cold starts, or function instance changes. Use Supabase for a reliable Vercel demo, keep Render with a Persistent Disk for file-backed demos, or move to a fuller database/auth model before any real school pilot.

## MVP Limitations
- **Authentication:** Auth is currently MVP/demo-grade. Students log in via an ID with no secondary password, and counselors use a shared access code. A real school launch should use school SSO/login, invite codes, student PINs, or database-backed auth tied to verified student records.
- **Persistence:** Local development and Render can still use JSON/file storage. Supabase is available as an optional hosted persistence layer for demos, but a real school pilot still needs a fuller data governance, backup, retention, and access-control plan.
- **Domain Data:** Hardcoded to specific SAIS academic rules and course catalogs.

## Future Improvements
- **Production Data Model:** Move beyond MVP JSON payload storage toward a normalized, audited data model with retention rules and tested backups.
- **Stronger School Authentication:** Add school-approved SSO, invite codes, or student PINs tied to verified student records.
- **Dynamic Rules Engine:** Move course catalog and graduation requirements to the database, allowing administrators to modify rules via a CMS rather than code updates.
- **Counselor-Supervised AI Explanation Assistant:** Add a carefully scoped assistant that answers follow-up questions about a generated plan using the deterministic recommendation facts, with counselor oversight and clear guardrails.
- **Optional Analytics:** Consider future analytics only after school-approved data governance and privacy review.

---
**Project Impact Statement (Resume Ready)**
*Architected and engineered a full-stack academic planning MVP using Next.js 14 and Tailwind CSS. Developed a custom, deterministic recommendation engine to map school-specific planning rules against student preferences. Delivered a demo-ready decision-support platform with MVP-grade session handling, an interactive multi-step intake flow, and a passcode-protected counselor portal for reviewing student plans and reducing manual planning friction.*
