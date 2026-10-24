# 0002. Dependency pins, Node 24 and the Functions package

- **Status:** Proposed
- **Date:** 2026-10-24 (revised after owner review, same day)
- **Deciders:** Owner (@rpdouglas), Lily Pad
- **Stack reference:** `docs/architecture/stack.md` §3, §5, §7

## Context

The stack asks for React 19.x, TypeScript strict, a Vite SPA and Node 24 Functions, with versions
confirmed at scaffold. Owner review found three problems with the scaffold as first merged:

1. Most pins were newer than the 14-day minimum release age that Renovate enforces for updates, so the
   scaffold broke the rule the repo applies to every later change.
2. `functions/` was an npm workspace, so its only lockfile was the root one. `firebase deploy` uploads
   only `functions/`, and Cloud Build then installs without a lockfile, so transitive versions in
   production would differ from the ones CI tested.
3. Node 24 was used by `.nvmrc`, CI, the Codespace and Functions, but the root `engines` accepted 22.12+.

## Options

**Pin age:** (a) re-pin to the newest release at least 14 days old; (b) keep newest with a one-off
exception; (c) drop the rule. **Functions install:** (a) separate package with its own lockfile;
(b) stay a workspace and generate a lockfile at predeploy; (c) bundle every dependency.
**TypeScript:** (a) 7.0 (native compiler) with a fallback rule; (b) 6.0.3.

## Decision

**1. One pin rule for everything.** Direct dependencies are exact pins (`.npmrc` `save-exact`) at the
newest release at least 14 days old (cutoff for this ADR: 2026-10-10). Renovate enforces the same
age for updates and asks before majors.

- **Security exception:** a fix for a known vulnerability may be pinned before it is 14 days old,
  choosing the oldest fixed release. Renovate's vulnerability PRs skip the age wait.
  Applied here: `zod` 4.6.6 (2026-10-11) fixes GHSA-mrhx-c7xc-m3w5 (high), which affects 4.6.5.
- **Scope:** the rule covers direct dependencies. Transitive versions are fixed by the lockfiles and
  refreshed by Renovate's weekly lock maintenance. Where a peer dependency would float to a newer
  release (`playwright-core` via `@axe-core/playwright`), it is added as a direct pin.

**2. Functions is its own package.** `functions/` has its own `package.json` and committed
`package-lock.json` and is not a workspace. Cloud Build installs from that lockfile, so production
gets the versions CI tested. Install with `npm ci && npm ci --prefix functions`. Functions code is
still bundled with esbuild (`functions/build.mjs`) to inline `shared/`; runtime dependencies stay
external. Functions typecheck and tests run from the root toolchain (`npm run typecheck`, `npm test`).
`zod` is grouped in Renovate so both packages move together.

**3. Node 24 everywhere.** Root `engines` is `>=24`. Lockfiles are generated with npm 11 (bundled with
Node 24): npm 10.9 `npm install` crashes resolving this tree (an arborist error on vitest's optional peers); `npm ci` from the committed lockfiles works on both.

**4. Install scripts are opt-in.** npm 11 blocks dependency install scripts unless allowed. Reviewed
and denied in `allowScripts`: `@firebase/util` (optional auto-init config), `protobufjs` (version
notice), `re2` (optional native build; firebase-tools works without it), and in Functions also
`esbuild` (binary comes from its platform package). Any new install script fails review until
someone approves or denies it.

**5. TypeScript 7.0.2.** Biome, Vite and Vitest don't use the TypeScript API, so the native compiler
works with this toolchain. If a tool proves incompatible, fall back to 6.0.x here, not ad hoc.

### Pins (direct dependencies, 2026-10-24)

| Package | Pin | Released | Note |
|---|---|---|---|
| react, react-dom | 19.3.0 | 2026-09-09 | |
| @types/react, @types/react-dom | 19.3.0 | 2026-09-09 | |
| vite | 8.3.4 | 2026-10-08 | Rolldown + Oxc |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 | Needs Vite 8 |
| typescript | 7.0.2 | 2026-07-08 | Native compiler |
| tailwindcss, @tailwindcss/vite | 4.3.3 | 2026-07-16 | |
| @tanstack/react-router | 1.170.42 | 2026-10-10 | `routeTree.gen.ts` is committed so `tsc` runs before `vite build` |
| @tanstack/router-plugin | 1.168.43 | 2026-10-10 | |
| @tanstack/react-query | 5.104.1 | 2026-10-02 | |
| zustand | 5.0.15 | 2026-08-13 | |
| react-hook-form | 7.89.0 | 2026-09-26 | |
| @hookform/resolvers | 5.9.1 | 2026-08-17 | 6.x fails npm peer resolution |
| zod (app and Functions) | 4.6.6 | 2026-10-11 | Security exception, see above |
| lucide-react | 1.55.0 | 2026-10-10 | |
| firebase (web) | 13.0.0 | 2026-10-07 | Carries the known `@grpc/grpc-js` advisory (backlog) |
| firebase-functions | 7.4.0 | 2026-09-15 | Functions package |
| firebase-admin | 14.5.0 | 2026-09-23 | Functions package |
| esbuild | 0.28.2 | 2026-08-08 | Functions package |
| firebase-tools | 15.33.0 | 2026-10-08 | |
| @firebase/rules-unit-testing | 6.0.0 | 2026-10-07 | |
| @biomejs/biome | 2.5.15 | 2026-09-30 | See consequences |
| vitest | 5.0.3 | 2026-09-30 | |
| jsdom | 30.1.2 | 2026-10-04 | |
| @testing-library/react / jest-dom / user-event | 16.3.3 / 7.0.1 / 14.6.7 | ≤ 2026-09-02 | |
| @playwright/test, playwright-core | 1.64.0 | 2026-10-07 | |
| @axe-core/playwright | 4.13.0 | 2026-08-11 | |
| husky / lint-staged | 9.1.7 / 17.6.0 | ≤ 2026-09-26 | |
| @commitlint/cli, config-conventional | 21.2.3 | 2026-09-19 | |
| @types/node | 24.19.2 | 2026-10-09 | |
| Functions runtime | `nodejs24` | | Supported; the deprecation and decommission dates proposed in firebase-tools are 2028. The stack's "Node 20 decommissioned 2026-10-30" was not confirmed and is no longer relied on |

The lockfiles are the source of truth; this table records the decision.

## Consequences

- **Biome 2.5.15 does not check Markdown or YAML** (that arrived in 2.6) and uses a different
  class-sort order. Until Biome 2.6.0 turns 14 days old on **2026-11-04**, docs and workflow files are
  not format-checked; CI lint still covers code, CSS and JSON. The class-sorting rule is named
  `useSortedClasses` in 2.5 (`useTailwindSortedClasses` in 2.6; `biome migrate` renames it).
- Two installs instead of one; CI's check job runs both.
- Renovate PRs may arrive in pairs (root and Functions) for shared packages; `zod` is grouped.
- The re-pin moved React, Vite, Firebase and others back a patch or minor; no code changes were needed
  beyond one class-order fix.

## Verification

Run on 2026-10-24 with the pins above: `npm run lint`, `npm run typecheck`, `npm test` (app and
Functions), `npm run build`, `npm run size` (99.5 KB gzip), `npm run build:functions`,
`npm run test:rules` and `npm run test:e2e`. `npm audit --omit=dev`: Functions clean; app only the
known `@grpc/grpc-js` advisory via `firebase`. A Node 24 deploy is confirmed when staging is created
(ADR 0001).
