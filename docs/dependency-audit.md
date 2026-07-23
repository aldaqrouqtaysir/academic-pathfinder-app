# Dependency Audit

Audit date: 2026-07-23

Runtime: Node.js 20.20.2, npm 10.8.2

## Summary

The locked baseline reported nine high-severity npm audit package paths across production and development dependencies. The production-only audit reported four.

After the focused Milestone 2 changes:

- full audit: five high-severity package paths remain;
- production-only audit: two high-severity package paths remain;
- no critical advisories are reported;
- no forced override or major framework update was applied.

## Dependency Path Map

| Direct dependency | Vulnerable path | Production use | Classification | Resolution |
| --- | --- | --- | --- | --- |
| `openai@4.104.0` | `openai` → `@types/node-fetch` → `form-data@4.0.5` | No tracked runtime or build entry imported the OpenAI package or its placeholder modules. | Removable unused dependency | Removed OpenAI and the unreachable explanation scaffolding. `form-data` left the tree. |
| `openai@4.104.0` | `openai` → `ws@8.20.0` | Unused OpenAI path | Removable unused dependency | Removed with OpenAI. |
| `@supabase/supabase-js@2.101.1` | `@supabase/realtime-js@2.101.1` → `ws@8.20.0` | Yes; optional hosted persistence is implemented. | Transitive dependency requiring a compatible parent update | Updated Supabase to 2.105.4, the first reviewed stable release after Realtime removed its unused `ws` dependency. |
| `eslint@8.57.1` and transitive tooling | `js-yaml@4.2.0`; vulnerable `brace-expansion` copies | Development only | Safe transitive patch | `npm audit fix` without `--force` updated versions allowed by the existing parent ranges. |
| `next@14.2.35` | `next@14.2.35` | Yes; application framework | Major upgrade required | Next 14.2.35 is the final published 14.x version. Listed advisories require at least Next 15.5.21; no secure 14.x patch exists. Deferred. |
| `next@14.2.35` | `next` → nested `postcss@8.4.31` | Yes; framework build/runtime path | Transitive dependency requiring a parent major update | The nested copy is controlled by Next. Deferred with the Next major migration. |
| `eslint-config-next@14.2.35` | `@next/eslint-plugin-next@14.2.35` → exact `glob@10.3.10` | Development only | Major upgrade required | The parent pins the vulnerable Glob release. A coordinated Next and ESLint-config major upgrade is required. Deferred. |

## Direct Dependency Changes

- Removed: `openai@4.104.0`
- Updated: `@supabase/supabase-js` from installed version 2.101.1 to 2.105.4
- Renamed package metadata from `sais-ai-academic-navigator` to `sais-academic-navigator`

The [Supabase 2.105.4 release notes](https://github.com/supabase/supabase-js/releases/tag/v2.105.4) describe Auth, PostgREST, and Realtime fixes. The official comparison from 2.101.1 through 2.105.4 includes removal of unused `ws` and `@types/ws` dependencies and contains no migration instruction for the APIs used by this application.

## Remaining Advisories

`npm audit --omit=dev` reports:

- `next`: multiple framework advisories whose secure path requires a Next major upgrade;
- nested `postcss`: resolved only by updating the parent Next package.

The full audit additionally reports:

- `eslint-config-next`;
- `@next/eslint-plugin-next`;
- `glob`.

npm currently proposes Next and ESLint-config 16.2.11 for an automatic forced resolution. This milestone intentionally does not use that breaking path. The listed Next advisories require at least Next 15.5.21, and the official Next 15 upgrade guide documents breaking changes including React 19 and asynchronous request APIs. That migration requires its own scoped milestone and regression plan.

## Validation Boundary

The dependency changes were accepted only after lint, TypeScript checking, all 31 behavior-characterization tests, and the production build passed. No recommendation, route, authentication, persistence, or UI implementation was intentionally changed.
