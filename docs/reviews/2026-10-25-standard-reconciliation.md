# Review: scaffold vs Lily Pad standard

**Date:** 2026-10-25 · **Standard:** `docs/architecture/lilypad-standard-stack.md` (added today)
**Compared against:** `main` after PR #4 (ADRs 0001 and 0002 accepted).

**Verdict:** the scaffold already matched most of the standard (framework, routing, styling, state,
forms, Firebase services, environments, alias verification, Biome/Husky/commitlint/Renovate,
Vitest + rules tests + Playwright + axe, deny-by-default rules, 250 KB budget). The gaps below were
either fixed in this PR, recorded as exceptions, or moved to the backlog with a trigger.

Owner decisions taken for this review: switch to **pnpm**; **solo exception** for PR approvals;
no shared Renovate preset **yet**; keep the root **`shared/`** folder.

## Fixed in this PR

| § | Standard | Was | Now |
|---|---|---|---|
| 1 | pnpm, single package, no workspaces | npm, two packages | pnpm 12.12.1 via Corepack; root and `functions/` each single-package with `pnpm-lock.yaml` (ADR 0002 amendment) |
| 1 | `docs/runbooks/environments.md` incl. aliases, secrets, identities, CI, teardown | `environment-setup.md`, creation only | Renamed and extended |
| 2 | `noImplicitOverride` | Missing | On in all three tsconfigs |
| 2 | `exactOptionalPropertyTypes` recorded in an ADR | On, unrecorded | Recorded in ADR 0002 amendment |
| 2 | `typecheck` and `build` separate | `build` ran `tsc -b` | `build` is `vite build`; typecheck is its own CI step |
| 4 | Function checklist (validated input, error contract, limits, structured logs, tests) | `ping` partial | `ping` follows it: shared request/response schemas, `HttpsError` contract, explicit `timeoutSeconds`/`memory`/`maxInstances`, structured logs, unauthorized + invalid-input + success tests |
| 4 | Firebase MCP server for agents | Missing | `.mcp.json` runs the pinned `firebase-tools mcp` (emulators and staging only) |
| 5 | Critical tests state the failure they catch | No | Comments on rules and Function tests |
| 6 | `.editorconfig` | Missing | Added |
| 7 | CODEOWNERS on `firestore.indexes.json` | Missing | Added |
| 7 | Actions pinned to full commit SHAs | Tags (`@v5`) | SHAs, with version comments, in CI and deploy workflows |
| 7 | Per-job timeouts | None | `timeout-minutes` on every job |
| 8 | Source maps not served from Hosting | `sourcemap: true`, deployed | `sourcemap: 'hidden'` and `**/*.map` ignored by Hosting |
| 10 | CSP report-only first | Enforced | `Content-Security-Policy-Report-Only` until verified at staging |
| 14 | `docs/runbooks/firestore-restore.md` with RPO/RTO and full scope | `restore-drill.md`, data only | Renamed; RPO/RTO (proposed), backup identity, rules/indexes/Functions/Auth/secrets/integrations, validation |
| 7 | Rollback runbook escalation path and emergency security path | Missing | Added to `rollback.md` |
| 16 | `docs/GOVERNANCE.md`, `personas/`, `design/` | Missing | Added |
| 18 | One source of truth; tool-supported instruction files only | `CLAUDE.md` + `GEMINI.md` both importing `AGENTS.md` | `GEMINI.md` removed (Antigravity reads `AGENTS.md`, `GEMINI.md` is legacy); `AGENTS.md` points to the standard |
| 19 | Agent guardrails in `CLAUDE.md` | Partly | All 16 in `AGENTS.md`, which `CLAUDE.md` imports |

## Exceptions (ADRs)

| § | Standard | Decision |
|---|---|---|
| 7 | 1 human approval on PRs | ADR 0005 (Proposed): 0 approvals while solo, every other protection on, review by 2027-01-31 |
| 9/16 | Shared schemas in `src/features/*/schemas` or `functions/shared` | ADR 0002 amendment: root `shared/` kept |
| 8 | GA4 by default | Already planned as an exception in ADR 0004 (no GA4 in the signed-in app) |
| 6 | Renovate extends the Lily Pad shared preset | Preset doesn't exist yet; Joinery's own config stays (backlog) |

## Backlog (not yet applicable, or its own PR)

| § | Standard | Trigger |
|---|---|---|
| 3 | Subscription adapter contract (`useSyncExternalStore`, permission-denied, auth-change, cleanup on sign-out) | Before the first live-Firestore screen (with ADR 0003 sign-in) |
| 5 | Listener-cleanup and account-switch tests | With the adapter rewrite |
| 5 | Function integration tests on the Functions emulator | With the first real Function |
| 5 | Visual regression (`toHaveScreenshot`) | Before UI work (baselines from CI's Linux image) |
| 7 | PR pipeline: Lighthouse CI, CodeQL, dependency audit | Next CI PR (audit needs an ignore for the `@grpc/grpc-js` advisory; CodeQL needs GitHub code scanning on this repo) |
| 7 | PR preview channels on staging; production deploy from a protected environment; post-deploy verification; release record | After staging exists and ADR 0004 is accepted |
| 6, 10 | Dependabot alerts, secret scanning + push protection | Owner: GitHub settings |
| 8 | Sentry (client + Functions), source-map upload, error boundaries, alerts, SLOs | ADR 0004, before the pilot |
| 10 | App Check (monitor, then enforce); CSP enforced after report-only review | Staging, before the pilot |
| 13 | Bundle analysis step; route budgets; `font-display: swap` | With the first heavy route; with the fonts ADR |
| 14 | PITR, weekly backups, dedicated backup identity, restore drill | Production project (pilot) |
| 4 | Audit log for role changes, deletes, exports | ADR 0003 (first admin action) |
| 18 | Antigravity skills parity (`.agents/skills/` for `new-adr`), Firebase Agent Skills | When agy is used on this repo; confirm current file formats first |
| 20 | Intake answers: legacy browsers (Tailwind v4 needs Safari 16.4+), SLOs, cost thresholds, retention | Owner, with the client |

## Notes on the standard itself

- §18's last bullet ends mid-thought ("The source recommendation was cut off…"); it needs finishing
  in the Lily Pad source.
- §3 asks for `@hookform/resolvers` "v4+"; Joinery pins 5.9.1 (6.x fails peer resolution), which satisfies it.
- §1 says "pnpm (single package)": with pnpm 12, settings live in `pnpm-workspace.yaml` even for a
  single package. Worth a sentence in the standard so it isn't mistaken for a workspace.
