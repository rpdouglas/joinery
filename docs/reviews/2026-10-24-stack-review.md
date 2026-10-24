# Review: Joinery proposed stack

**Date:** 2026-10-24 · **Reviewed:** `docs/architecture/stack.md` (proposal dated 2026-10-24)
**Method:** read the proposal, scaffolded the Standard layer, installed the current packages, and
ran every check (lint, typecheck, unit, Functions, rules on the emulator, build, bundle budget,
Playwright + axe). Firebase projects were **not** created and nothing was deployed.

**Verdict:** sound and buildable. The one-way decisions are the right ones to make first and the
ADR discipline is good. Fix the items under "Corrections" in the document, take the "Gaps" into the
listed ADRs, and confirm the "Open" items before ADR 0001 is accepted.

## Verify items: results

| Item                         | Result                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React version                | The text says "React 19.x (3.1 is current…)". npm `latest` is **19.3.1**. Pinned.                                                                                                                                                                                                                                                     |
| Vite current major           | **8.3.5** (Rolldown + Oxc). `@vitejs/plugin-react` 6.x requires Vite 8. Pinned.                                                                                                                                                                                                                                                       |
| TypeScript                   | **7.0.2** (native compiler) is `latest`. `tsc -b` with project references works with this setup. Pinned; note for ADR 0002.                                                                                                                                                                                                           |
| Node 24 for Functions        | `firebase.json` sets `runtime: nodejs24`; `firebase-functions` 7.4.0 accepts it and the bundle builds for `node24`. **Not verified by deploy** (no project yet). The 2026-10-30 Node 20 decommission date was not independently checked.                                                                                              |
| Biome class sorting          | The rule is now **`useTailwindSortedClasses`** (Biome 2.6.3; `biome migrate` renames it). **Tested: it does not read the v4 `@theme` block.** Classes built from custom tokens (`bg-brand`, `text-brand-contrast`) are treated as unknown and left unsorted at the front; built-in classes sort correctly. Fallback goes in ADR 0004. |
| WIF + Hosting preview action | Not testable without projects. `deploy-staging.yml` calls `firebase-tools` directly after `google-github-actions/auth`, which avoids depending on the preview action. Verify in ADR 0004.                                                                                                                                             |
| Storage bucket in region     | Not testable without projects. Keep "create staging first".                                                                                                                                                                                                                                                                           |

## Corrections to the document

1. **§3 Framework:** "React 19.x (3.1 is current, 2026-10-14)" reads as a typo. Write "React 19.3.1".
2. **§1 Data region:** the argument that "Montréal keeps gen 1 functions available" doesn't matter, since §5
   uses v2 only. Drop it so the region choice rests on distance and services.
3. **§5 Restricted data** is tagged "Spec change", but that tag isn't in the legend at the top. Add it.
4. **§7 Biome class sorting:** rename to `useTailwindSortedClasses` and record the tested result above.
5. **§7 Bundle:** "250 KB bundle" should say what is measured. The scaffold enforces **250 KB gzip of
   JS loaded on first paint** (`npm run size`). Today: ~100 KB with React, Router and Query.

## Gaps the document does not cover

1. **Residency beyond Firestore, Storage and Functions.** Firebase Auth / Identity Platform user
   records, Cloud Logging's default `_Default` bucket, App Check / reCAPTCHA and Hosting's CDN are not
   pinned to Montréal by the region choice. Staff names and emails in Auth are personal data. Add
   them to the privacy-notice item in §9, and set the log bucket region in ADR 0001.
2. **Shared code in Functions.** `firebase deploy` uploads only `functions/`, so `shared/` schemas
   cannot be imported at runtime. The scaffold bundles Functions with esbuild (`functions/build.mjs`)
   so `shared/` is inlined. Record this in ADR 0002.
3. **Package manager and layout.** Not stated. The scaffold uses **npm workspaces** (root app +
   `functions/`), because Cloud Build installs Functions dependencies with npm.
4. **Email-link sign-in.** Since Firebase Dynamic Links shut down, email links are served from the
   Hosting domain. ADR 0003 should name the domain and confirm it is in the authorised domains list.
5. **Lingui on Vite 8 needs Babel.** `@lingui/vite-plugin` needs `@rolldown/plugin-babel` and
   `@babel/core` for the macro, which puts Babel back into an Oxc pipeline. react-i18next needs no
   compile step. Weigh this in the English and French text ADR (group 5).
6. **TanStack Table is now v9** (9.3.1). Most examples online are v8. Weigh this in the tables ADR.
7. **`@hookform/resolvers` 6.0.0 fails npm peer resolution** (optional `effect` peer conflict).
   Pinned to **5.9.2**, which supports Zod 4. Renovate will propose 6.x once it resolves.
8. **Visual regression** is listed as Standard but screenshots are platform-specific. Generate and
   compare baselines only in the Linux CI image. Not scaffolded yet; it's in the backlog.
9. **The Lily Pad standard file is not in this repo.** "Standard" items were scaffolded from the
   names in this document. Add `lilypad-standard-stack.md` to `docs/architecture/` and reconcile.
10. **CSP.** A starting CSP is in `firebase.json`. It must be re-checked when Google sign-in
    (auth-domain frame), reCAPTCHA Enterprise and Sentry are added.

## Open before ADR 0001 is accepted

The §9 items stand. In order of how much they change the scaffold: QuickBooks Online or Desktop,
who controls Artisan's DNS (affects email and the Hosting custom domain), and the privacy-notice
wording on cross-border processing (affects Auth, Sentry and Claude).
