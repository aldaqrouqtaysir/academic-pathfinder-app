# Dependency Audit

Audit date: 2026-07-24

Runtime: Node.js 20.20.2, npm 10.8.2

## Next.js 15 Maintenance LTS Result

Milestone 4 upgrades the framework to the exact patched Maintenance LTS target identified by the [July 2026 Next.js security release](https://nextjs.org/blog/july-2026-security-release):

| Package | Before | After | Reason |
| --- | --- | --- | --- |
| `next` | 14.2.35 | 15.5.21 | Patched Maintenance LTS framework target |
| `react` | 18.3.1 | 19.0.8 | Stable React 19 line required by the Next.js 15 upgrade guidance |
| `react-dom` | 18.3.1 | 19.0.8 | Matches React |
| `@types/react` | 18.3.31 | 19.0.14 | Matches the selected React 19.0 line |
| `@types/react-dom` | 18.3.7 | 19.0.6 | Matches the selected React DOM 19.0 line |
| `eslint-config-next` | 14.2.35 | 15.5.21 | Matches the framework release |

No other direct dependency was intentionally upgraded. ESLint remains on 8.57.1 because `eslint-config-next@15.5.21` officially supports ESLint 7, 8, and 9.

## Milestone 4 Audit Comparison

| Audit scope | Before | After |
| --- | ---: | ---: |
| `npm audit --omit=dev` high-severity package paths | 2 | 3 |
| Full `npm audit` high-severity package paths | 5 | 3 |
| Critical package paths | 0 | 0 |

The upgrade removes the previous direct Next.js advisory list and the development-only `eslint-config-next` / `@next/eslint-plugin-next` / `glob` paths. The current npm advisory database still reports three production high-severity paths:

- `next@15.5.21` through its bundled `postcss@8.4.31`;
- bundled `postcss@8.4.31`, with two current advisories;
- `sharp@0.34.5`, installed by Next.js, with a current inherited-libvips advisory.

npm currently suggests a forced downgrade to `next@9.3.3` for these paths. That is not a valid migration or security fix and was not applied. No `npm audit fix`, forced override, Next.js 16 upgrade, or separate transitive dependency migration was performed.

## Milestone 4 Migration Compatibility

The [Next.js 15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15) identifies React 19, asynchronous request APIs, and changed caching defaults as the main breaking areas. This repository required asynchronous `cookies()` updates. Dynamic route parameters were already asynchronous, and mutable plan/session/note APIs already used explicit dynamic and no-store behavior.

Next.js 15.5 deprecates `next lint`, so the project now invokes the ESLint CLI directly with the existing Core Web Vitals configuration. No Turbopack production build or experimental framework feature was enabled.

## Milestone 2 Historical Summary

The locked baseline reported nine high-severity npm audit package paths across production and development dependencies. The production-only audit reported four.

After the focused Milestone 2 changes:

- full audit: five high-severity package paths remain;
- production-only audit: two high-severity package paths remain;
- no critical advisories are reported;
- no forced override or major framework update was applied.

## Milestone 2 Historical Dependency Path Map

| Direct dependency | Vulnerable path | Production use | Classification | Resolution |
| --- | --- | --- | --- | --- |
| `openai@4.104.0` | `openai` → `@types/node-fetch` → `form-data@4.0.5` | No tracked runtime or build entry imported the OpenAI package or its placeholder modules. | Removable unused dependency | Removed OpenAI and the unreachable explanation scaffolding. `form-data` left the tree. |
| `openai@4.104.0` | `openai` → `ws@8.20.0` | Unused OpenAI path | Removable unused dependency | Removed with OpenAI. |
| `@supabase/supabase-js@2.101.1` | `@supabase/realtime-js@2.101.1` → `ws@8.20.0` | Yes; optional hosted persistence is implemented. | Transitive dependency requiring a compatible parent update | Updated Supabase to 2.105.4, the first reviewed stable release after Realtime removed its unused `ws` dependency. |
| `eslint@8.57.1` and transitive tooling | `js-yaml@4.2.0`; vulnerable `brace-expansion` copies | Development only | Safe transitive patch | `npm audit fix` without `--force` updated versions allowed by the existing parent ranges. |
| `next@14.2.35` | `next@14.2.35` | Yes; application framework | Major upgrade required | Next 14.2.35 is the final published 14.x version. Listed advisories require at least Next 15.5.21; no secure 14.x patch exists. Deferred. |
| `next@14.2.35` | `next` → nested `postcss@8.4.31` | Yes; framework build/runtime path | Transitive dependency requiring a parent major update | The nested copy is controlled by Next. Deferred with the Next major migration. |
| `eslint-config-next@14.2.35` | `@next/eslint-plugin-next@14.2.35` → exact `glob@10.3.10` | Development only | Major upgrade required | The parent pins the vulnerable Glob release. A coordinated Next and ESLint-config major upgrade is required. Deferred. |

## Milestone 2 Historical Direct Dependency Changes

- Removed: `openai@4.104.0`
- Updated: `@supabase/supabase-js` from installed version 2.101.1 to 2.105.4
- Renamed package metadata from `sais-ai-academic-navigator` to `sais-academic-navigator`

The [Supabase 2.105.4 release notes](https://github.com/supabase/supabase-js/releases/tag/v2.105.4) describe Auth, PostgREST, and Realtime fixes. The official comparison from 2.101.1 through 2.105.4 includes removal of unused `ws` and `@types/ws` dependencies and contains no migration instruction for the APIs used by this application.

## Milestone 2 Remaining Advisories

`npm audit --omit=dev` reports:

- `next`: multiple framework advisories whose secure path requires a Next major upgrade;
- nested `postcss`: resolved only by updating the parent Next package.

The full audit additionally reports:

- `eslint-config-next`;
- `@next/eslint-plugin-next`;
- `glob`.

npm currently proposes Next and ESLint-config 16.2.11 for an automatic forced resolution. This milestone intentionally does not use that breaking path. The listed Next advisories require at least Next 15.5.21, and the official Next 15 upgrade guide documents breaking changes including React 19 and asynchronous request APIs. That migration requires its own scoped milestone and regression plan.

## Validation Boundary

Milestone 2 dependency changes were accepted only after lint, TypeScript checking, all 31 behavior-characterization tests, and the production build passed.

The Milestone 4 migration is accepted only if lint, TypeScript checking, all 31 behavior-characterization tests, all 12 Playwright tests, axe scans, print checks, and the production build pass. Recommendation, authentication, persistence, route, and visual behavior are not intentionally changed.
