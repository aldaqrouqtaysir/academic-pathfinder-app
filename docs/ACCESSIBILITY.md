# Accessibility Scope

SAIS Academic Navigator targets clear keyboard and assistive-technology behavior for its current portfolio/demo workflows. This work improves the MVP; it is not a claim of complete WCAG conformance or a substitute for testing with disabled users.

## Implemented safeguards

- A keyboard-visible skip link targets the primary content region.
- Student and counselor navigation regions have accessible names.
- Pages retain a clear primary heading and structured section headings.
- Intake choice buttons expose `aria-pressed`; their visual checkmark is decorative.
- Intake progress exposes progressbar name, value, minimum, and maximum semantics.
- Login, lookup, intake, and counselor-note errors use live alert semantics and are associated with the relevant control or section.
- Intake validation moves focus to the first incomplete section.
- Loading and successful-save messages use status semantics; pending controls expose busy and disabled states.
- Shared buttons, inputs, choice tiles, chips, and primary navigation actions meet a practical touch target and have visible focus indicators.
- Reduced-motion preferences suppress decorative animations, smooth scrolling, and long transitions.
- Counselor print styles remove interactive chrome, use readable black text, prevent avoidable card and note splitting, and wrap long notes.

## Automated checks

Playwright runs axe-core WCAG A/AA rules on:

- student login;
- intake;
- recommendation dashboard;
- counselor login;
- counselor student record;
- printable report.

The suite currently uses no broad axe exclusions or disabled rules. Results are attached to the Playwright report for each scanned page.

Automated scanning detects only a subset of accessibility barriers. Passing axe does not prove that a workflow is usable with a screen reader, voice control, magnification, switch access, or reduced dexterity.

## Manual review checklist

Before a release, verify:

1. Use Tab and Shift+Tab from the browser chrome through every interactive control.
2. Activate intake choices with Space and Enter; confirm the selected state is announced.
3. Submit incomplete forms; confirm the alert is announced and focus reaches the first affected section.
4. Zoom to 200% and review 320, 375, 768, 1024, and 1440 CSS-pixel widths without horizontal content loss.
5. Enable reduced motion and confirm content remains understandable without animation.
6. Review student and counselor workflows with a screen reader, including headings, landmarks, progress, errors, pending states, and logout.
7. Print or save the counselor report as both A4 and Letter; confirm headings, notes, and cards do not clip or become unreadable.

Document any accepted limitation narrowly with its page, rule, user impact, and follow-up owner. Do not add a global suppression merely to make the automated suite green.
