# Release Checklist

Use this checklist for the SAIS Academic Navigator v1.0.0 Portfolio MVP release. Automated checks are marked complete only after they pass; manual assistive-technology review remains explicitly separate.

## Repository and configuration

- [x] Main branch was clean and synchronized before release preparation.
- [x] Node.js remains on 20.x.
- [x] Next.js resolves to exact 15.5.21.
- [x] React and React DOM resolve to exact 19.0.8.
- [x] Environment variables are documented in `.env.example` and the README.
- [x] No secret or production credential is tracked in the current tree.
- [x] No `.data` file is tracked.
- [x] Repository fixtures and screenshots are synthetic.
- [x] Playwright output, `.tmp/e2e-data`, build output, archives, and generated PDFs are ignored.

## Product acceptance

- [x] The public Vercel URL responds over HTTPS.
- [x] Student login validation and valid synthetic login pass.
- [x] Intake progress, validation, recommendation generation, and save flow pass.
- [x] Returning-student and start-new flows pass.
- [x] Counselor routes remain protected.
- [x] Counselor login validation, student lookup, missing-student handling, notes, and note persistence pass with synthetic local data.
- [x] Counselor note reloads complete without hydration or console errors.
- [x] Printable counselor output passes automated checks and visual A4 and Letter review.
- [x] Representative student and counselor screens have no horizontal overflow at 320px, 375px, 768px, 1024px, or 1440px.
- [x] Keyboard selection and focus movement pass in the automated browser suite.
- [ ] Manual screen-reader and assistive-technology testing is not complete.

## Quality gate

- [x] ESLint passes with zero warnings.
- [x] TypeScript checking passes.
- [x] All 31 Vitest tests pass.
- [x] All 12 Playwright tests pass.
- [x] Automated Axe scans pass on six representative pages.
- [x] The optimized production build passes.
- [x] Current `main` GitHub Actions passes.
- [x] Known framework-coupled dependency advisories are documented accurately.

## Publication

- [ ] Release pull request checks pass.
- [ ] Vercel release preview passes.
- [ ] Production deployment passes after merge.
- [ ] Annotated `v1.0.0` tag points to the final release commit.
- [ ] Non-draft, non-prerelease GitHub release is published.

Release publication evidence is recorded in the GitHub pull request and GitHub release rather than retroactively changing the tagged source.
