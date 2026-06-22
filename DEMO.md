# SAIS Academic Navigator - Demo Guide

This document provides a step-by-step script for demonstrating the SAIS Academic Navigator to stakeholders or showcasing it in a portfolio/resume.

## Demo Scope
This demo uses sample/student-entered IDs and MVP-grade authentication. It does not represent a production school deployment, trained AI model, or large-scale student data protection system. A real pilot would require school-approved authentication, database-backed storage, and privacy/security review.

## Recommended Demo IDs
- Student demo ID: `20120164`
- Counselor access depends on `COUNSELOR_ACCESS_CODE` in `.env.local`.

## Recommended Screenshots for GitHub & Resumes
To create a compelling portfolio piece, capture high-quality screenshots of the following states:
1. **Student Login Page:** Showcases the modern, gradient-rich aesthetic and value proposition.
2. **Intake Flow (Step 2 - Interests & Future):** Highlights the interactive chip UI and multi-select capabilities.
3. **Student Dashboard:** The core value delivery, displaying the recommended path, course choices, tradeoffs, and actionable next steps.
4. **Counselor Dashboard / Student Lookup:** Shows the tabular data presentation of all active student plans.
5. **Counselor Detailed Summary:** Demonstrates the detailed breakdown and printable format of a student's submission.

---

## Suggested Demo Script

### 1. Student Onboarding & MVP Login

**Goal:** Show the demo-friendly entry into the platform.

**Action:** Navigate to `/login`.

**Talking Point:**
"SAIS Academic Navigator replaces scattered course-selection documents with a guided academic planning experience. For this MVP demo, students enter an 8-digit Student ID. A real school pilot would require school-approved authentication."

**Test:**
Enter the recommended demo ID: `20120164`.

---

### 2. Full Recommendation Demo: Grade 12

**Goal:** Show the main recommendation engine.

**Action:** Complete the intake as a Grade 12 student.

Suggested profile:
- Grade: Grade 12
- Semester: Semester 1
- Interests: STEM / coding / AI
- Career direction: Computer Science, Engineering, or AI
- Workload tolerance: High
- Priority style: Strongest path
- Optimization target: University competitiveness

**Talking Point:**
"The app does not simply ask which course a student wants. It asks about goals, workload, confidence, and future direction, then generates a rule-based recommendation using SAIS-specific course structures."

**Action:** Click `Unlock my plan`.

---

### 3. Student Dashboard

**Goal:** Show the result and explainability.

**Action:** Review the recommendation dashboard.

Show:
- Best Fit recommendation
- Balanced / Stretch alternatives
- course selections
- why choices were recommended
- workload and tradeoff explanations

**Talking Point:**
"The dashboard explains the reasoning behind each pathway, including why a student might choose a more rigorous path, a safer workload, or a more flexible option."

---

### 4. Optional: Grade 9/10 Readiness Mode

**Goal:** Show grade-aware behavior.

**Action:** Start a new plan and choose Grade 9 or Grade 10.

**Talking Point:**
"Because Grade 9 and 10 students do not choose electives yet, the system gives them a simpler readiness plan instead of pretending they need a full course-selection pathway."

---

### 5. Counselor Perspective

**Goal:** Show how faculty can review student plans.

**Action:** Go to `/counselor/login`.

**Test:** Enter the passcode from `COUNSELOR_ACCESS_CODE`.

**Action:** Search for the demo student ID: `20120164`.

**Talking Point:**
"Counselors can review student inputs, see the recommendation summary, add internal notes, and open a printable advising report."

---

### 6. Printable Counselor Report

**Goal:** Show the final counselor-facing output.

**Action:** Open the report page and use browser print / save as PDF.

**Talking Point:**
"The report turns the student's planning session into a clean advising summary that can support counselor conversations, parent discussions, or portfolio demos."
