# Changelog

## Unreleased

### Visual and UX

- Reduced decision fatigue by separating required choices from optional detail
- Clarified intake grouping and real required-answer progress
- Added an editable, answer-derived planning profile
- Strengthened the Best Fit recommendation hierarchy while keeping full reasoning available
- Simplified the visual system for a calmer academic-advising identity
- Improved counselor-record scanability and print presentation
- Preserved accessibility, reduced-motion, and mobile behavior

## 1.0.0 — 2026-07-24

### Product

- Full student academic-planning intake
- Deterministic rule-based pathway recommendations
- Best Fit, Balanced, and Stretch recommendation perspectives
- Saved advising plans
- Counselor lookup and notes
- Printable summaries
- Responsive student and counselor interfaces

### Engineering Quality

- 31 Vitest recommendation and catalog tests
- 12 Playwright browser tests
- 43 automated tests in total
- GitHub Actions quality checks
- Automated accessibility scans
- Synthetic isolated test data
- Node 20 reproducible builds
- Next.js 15.5.21 Maintenance LTS
- Improved loading, error, retry, and print behavior
- Deterministic counselor-note timestamps without hydration mismatches

### Documentation and Data Safety

- Accurate rule-based product positioning
- Synthetic-only repository test and demo records
- Deployment and setup documentation
- Known limitations documented clearly

### Known Limitations

- Prerequisite and sequence rules are incomplete
- Authentication is demo-grade
- The system has not been academically or statistically validated
- Browser automation currently focuses on Chromium
- Automated accessibility scans do not prove full accessibility
- Remaining framework-coupled dependency advisories are documented
