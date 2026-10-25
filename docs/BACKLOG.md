# Backlog

Ordered. Pull the top items into `ACTIVE_CYCLE.md`. Items marked §n come from the Lily Pad standard
reconciliation (`reviews/2026-10-25-standard-reconciliation.md`).

## Next (Phase 1)

- Create `joinery-staging` per `runbooks/environments.md` (ADR 0001 accepted).
- WIF pool, provider and deploy service account for staging; set repo variables (ADR 0004).
- First staging deploy: confirm the Functions build works with `pnpm-lock.yaml` (ADR 0002 amendment).
- CI PR pipeline additions (§7): Lighthouse CI, CodeQL (needs GitHub code scanning), dependency audit
  (`pnpm audit --prod`, ignoring the tracked `@grpc/grpc-js` advisory by GHSA ID).
- `@grpc/grpc-js` high-severity advisory via `firebase` → `@firebase/firestore`; no non-breaking fix.
  Track the Firebase release; do not force-upgrade.
- Identity Platform upgrade, invite collection and `beforeUserCreated` (ADR 0003).
- Owner-only `setRole` callable with audit-log entry (§4); rules tests for every role.
- Subscription adapter to the §3 contract: `useSyncExternalStore`, loading/error/empty/permission-denied,
  detach and clear caches on sign-out or account switch; listener-cleanup and account-switch tests (§5).
- Function integration tests on the Functions emulator (§5), starting with the first real Function.
- Auth emulator sign-in test in Playwright; magic-link cross-device and Google collision cases (§19.9).
- App Check with reCAPTCHA Enterprise in staging (monitor, then enforce).
- CSP: review report-only violations at staging, then enforce (§10).
- Sentry with `beforeSend` scrubbing, source-map upload, release tagging (ADR 0004, §8).
- Release ID shown in the app footer and sent to Sentry (`VITE_RELEASE_ID` is already set in CI).
- Visual regression (§5): baselines generated in the Linux CI image only.
- PR preview channels on staging; post-deploy verification job (§7).
- **2026-11-04:** merge Renovate's Biome 2.6.x PR (restores Markdown/YAML checks; run `biome migrate`
  for the `useTailwindSortedClasses` rename and accept the class-order changes). See ADR 0002.
- Remove each `minimumReleaseAgeExclude` entry once it is 14 days old (dates in ADR 0002 amendment 1):
  `zod@4.6.6` 10-25, `qs@6.16.1` 10-28, `fast-uri@3.1.9` 11-02, `body-parser@2.4.0` 11-05.

## Later

- Production project, protected `production` environment, PITR, weekly backups, dedicated backup
  identity, restore drill (§14).
- Alerts and SLOs: Function failure rate, latency, scheduled jobs, quota, cost spikes, QuickBooks token
  refresh and sync failures (§8).
- Error boundaries with a consistent failure state (§8).
- Bundle analysis step and route budgets (§13).
- Extract Joinery's `renovate.json` into a Lily Pad shared Renovate preset and extend it (§6).
- Antigravity parity: `.agents/skills/` for `new-adr`; Firebase Agent Skills; confirm current file
  formats first (§18).
- Group 5, 6 and 7 ADRs (see `adr/README.md`).
- Public website lead form (`submitLead`, App Check, rate limit, honeypot) after release.
