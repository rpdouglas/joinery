# Backlog

Ordered. Pull the top items into `ACTIVE_CYCLE.md`.

## Next (Phase 1)

- Create `joinery-staging` per `runbooks/environment-setup.md` (after ADR 0001).
- WIF pool, provider and deploy service account for staging; set repo variables (ADR 0004).
- Identity Platform upgrade, invite collection and `beforeUserCreated` (ADR 0003).
- Owner-only `setRole` callable; rules tests for every role.
- Auth emulator sign-in test in Playwright.
- App Check with reCAPTCHA Enterprise in staging (monitor, then enforce).
- Sentry with `beforeSend` scrubbing (ADR 0004).
- Release ID shown in the app footer and sent to Sentry (`VITE_RELEASE_ID` is already set in CI).
- Visual regression: baselines generated in the Linux CI image only.
- `npm audit` (2026-10-24): high-severity `@grpc/grpc-js` advisory arrives via `firebase` 13.1.0 → `@firebase/firestore`; no non-breaking fix. Track the Firebase release; do not `audit fix --force`.
- PR preview channels on staging.

- **2026-11-04:** merge Renovate's Biome 2.6.x PR (restores Markdown/YAML checks; run `biome migrate` for the
  `useTailwindSortedClasses` rename and accept the class-order changes). See ADR 0002.

## Later

- Production project, protected `production` environment, PITR, weekly backups, restore drill.
- Alerts: Function errors, QuickBooks token refresh and sync failures, budget.
- Group 5, 6 and 7 ADRs (see `adr/README.md`).
- Public website lead form (`submitLead`, App Check, rate limit, honeypot) after release.
