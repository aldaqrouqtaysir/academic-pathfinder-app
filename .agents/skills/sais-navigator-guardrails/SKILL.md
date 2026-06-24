---
name: sais-navigator-guardrails
description: Use for any change to SAIS Academic Navigator. Preserves school-specific rules, MVP honesty, recommendation-engine constraints, and portfolio-ready quality.
---

# SAIS Academic Navigator Guardrails

Use this skill whenever editing this repository.

## Product identity

SAIS Academic Navigator is a school-specific academic advising MVP for SAIS Dubai. It is a portfolio/demo-ready MVP, not production school infrastructure.

## Non-negotiables

- Do not claim production-grade security.
- Do not claim trained AI/ML if the engine is deterministic/rule-based.
- Do not remove counselor features.
- Do not change Node engine from "20.x".
- Keep `npm ci` and `npm run build` passing.
- Do not add features unless explicitly requested.
- Do not expose raw internal course codes in student-facing UI.
- Do not introduce placeholder text, unfinished copy, or sentences ending with incomplete ellipses.

## Current architecture

- Next.js 14 App Router
- TypeScript
- Tailwind CSS v3
- Deterministic recommendation engine
- JSON/file-based persistence
- MVP-grade student ID login
- Passcode-protected counselor portal
- Counselor notes and printable counselor report

## Recommendation rules

- Grade 9/10: one simple readiness plan, not three recommendation paths.
- Grade 11/12: recommendation paths may include Best Fit, Balanced, and Stretch.
- AP Calculus AB: strong STEM, engineering, CS, physics, pre-med, high-rigor, math-heavy path.
- AP Statistics: data, interpretation, business, psychology, health, social sciences, real-world reasoning.
- Regular Calculus: standard solid Grade 12 math path.
- Calculus for Business: business/economics/lighter workload/safe-grade path, not the default for strong STEM students.
- Environmental Science: lighter-workload/safe science option; can fit STEM only when the student strongly prioritizes grades or lower workload.
- Thermodynamics, Electromagnetism, Organic Chemistry, Biochemistry: strong STEM/medicine-prep sciences, difficult but not AP-level hard.
- AP CSP: AP/rigorous, but lighter than AP Physics, AP Chemistry, AP Biology, or AP Calculus.

## Documentation honesty

README and demo copy must accurately describe the app as:
- MVP-grade authentication
- rule-based / deterministic recommendation engine
- passcode-protected counselor portal
- file-based persistence
- school-specific decision-support platform

Avoid overclaims such as:
- production-grade security
- trained AI model
- official school deployment
- mathematically validated pathway
- counselor override if no override feature exists

## Before finishing any task

- Preserve or run `npm run build`.
- Report files changed.
- Report remaining risks.
- Keep the app stable and portfolio-ready.
