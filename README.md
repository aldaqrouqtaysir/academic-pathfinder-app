# SAIS Academic Navigator

> A guided academic planning and recommendation workspace for high school students.

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

## Student Flow
1. **Login:** Students enter an 8-digit Student ID for MVP/demo access.
2. **Intake Journey:** A multi-step form captures their current academic standing, career interests, preferred destinations, and workload tolerance.
3. **Dashboard:** The engine processes the intake data and presents a customized academic plan.
4. **Iterate:** Students can refine their preferences and immediately see updated recommendations.

## Counselor Flow
1. **Login:** Faculty/demo reviewers log in via a hidden route (`/counselor/login`) using a shared access code.
2. **Dashboard:** Counselors view a roster of active student plans.
3. **Review & Annotate:** Counselors can review the exact inputs a student provided, append internal notes, and flag plans for discussion.
4. **Export:** Generate clean, printable summaries for advising conversations or portfolio demos.

## Recommendation Engine Overview
The recommendation logic is **deterministic and rule-based**, not a trained Machine Learning model. It evaluates a student's responses against an array of hard constraints (graduation requirements, prerequisites) and soft constraints (interests, workload tolerance). The engine scores potential course combinations and selects the path that maximizes the student's personal optimization target (e.g., "University competitiveness" vs. "Lighter workload").

## Recommended Demo IDs
- Student demo ID: `20120164`
- Counselor access depends on `COUNSELOR_ACCESS_CODE` in `.env.local`.

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
- `DATA_DIR` (Optional): The directory path where JSON storage will reside. Default is `.data/`.

## Demo & Testing
For a comprehensive guide on how to test the application, including suggested scripts and workflows, please refer to [DEMO.md](./DEMO.md).

## Deployment Notes (Render)
When deploying this MVP to a service like [Render](https://render.com), you must account for the file-based persistence:
1. **Required Environment Variables:** Set `STUDENT_SESSION_SECRET` and `COUNSELOR_ACCESS_CODE` in the Render dashboard. `COUNSELOR_SESSION_SECRET` is optional and falls back to `STUDENT_SESSION_SECRET`.
2. **Persistent Disk:** Attach a Render Persistent Disk to your Web Service to ensure JSON data survives deploys and restarts.
3. **Mount Path:** Mount the disk to a directory (e.g., `/var/data`).
4. **Data Directory:** Set `DATA_DIR=/var/data` in the Render dashboard so the app writes its JSON files to the persistent volume. If `DATA_DIR` is omitted and the default `.data/` path is not writable, the app falls back to temporary storage so demos can still run, but saved plans may disappear after restarts or deploys.
5. **Node Version:** Ensure Render is configured to use Node `20.x`.
6. **Build Command:** Use `npm ci --include=dev && npm run build`.
7. **Start Command:** Use `npm start`.
8. **Troubleshooting:** If `Unlock my plan` reports that the server could not save the plan, check Render logs for `PERSISTENCE_ERROR` or `[studentPlanStore]` and verify the disk mount plus `DATA_DIR`.

## MVP Limitations
- **Authentication:** Auth is currently MVP/demo-grade. Students log in via an ID with no secondary password, and counselors use a shared access code. A real school launch should use school SSO/login, invite codes, student PINs, or database-backed auth tied to verified student records.
- **Database:** Uses local JSON files instead of a scalable relational database.
- **Domain Data:** Hardcoded to specific SAIS academic rules and course catalogs.

## Future Improvements
- **Database Migration:** Transition to PostgreSQL (e.g., via Prisma or Supabase) for robust data integrity and querying.
- **SSO Integration:** Integrate with school-wide SSO (e.g., Google Workspace, Microsoft Entra) for secure, passwordless authentication.
- **Dynamic Rules Engine:** Move course catalog and graduation requirements to the database, allowing administrators to modify rules via a CMS rather than code updates.
- **Optional Analytics:** Consider future analytics only after school-approved data governance and privacy review.

---
**Project Impact Statement (Resume Ready)**
*Architected and engineered a full-stack academic planning MVP using Next.js 14 and Tailwind CSS. Developed a custom, deterministic recommendation engine to map school-specific planning rules against student preferences. Delivered a demo-ready decision-support platform with MVP-grade session handling, an interactive multi-step intake flow, and a passcode-protected counselor portal for reviewing student plans and reducing manual planning friction.*
