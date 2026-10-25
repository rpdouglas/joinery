# Lily Pad Standard Stack

**Purpose:** The technology standard for every Lily Pad build. Planning, specs, and agent-generated code must use what is listed here. Anything not listed needs an explicit decision (ADR) before it is introduced.

**Project shape this doc assumes:** one project = one GitHub repo = one Codespace, deploying to a small fixed set of Firebase projects (prod, staging, optional dev). No shared monorepo, no shared Firebase project between clients. Edit in VS Code, locally or in Codespaces.

**Status tags used throughout**

- **Mandatory**: required on every applicable project.
- **Conditional**: required only when the documented trigger applies (trigger stated).
- **Deferred**: not in the default stack; reconsider when a concrete need appears.

"Applicable" matters: a Hosting-only static site skips Firestore, Functions, and rules items by definition.

---

## 1. Project topology and environments

| Item | Standard |
|---|---|
| Source control | GitHub, one repo per project |
| Dev environment | GitHub Codespaces from `.devcontainer/devcontainer.json`; same config works in local VS Code |
| Editor | Stock VS Code + official Anthropic Claude Code extension |
| AI agents | Claude Code (CLI, extension, mobile) and Antigravity CLI |
| Package manager | pnpm (single package, no workspaces) |
| Hosting | Firebase Hosting, static files only |
| Firestore | Default database in each Firebase project |
| Billing | Blaze plan on prod and staging |

### Environment model (Mandatory for production apps)

| Environment | Firebase project | Purpose |
|---|---|---|
| Local / CI | Emulator Suite, no real project | Routine development and all automated tests |
| Dev | `<project>-dev` | **Conditional**: only when integration testing needs real Firebase services the emulators can't cover |
| Staging | `<project>-staging` | Pre-production verification, PR preview channels, smoke tests |
| Production | `<project>-prod` | Real users and real data |

Rules:

- One repo deploys to several Firebase projects. Project IDs are defined once in `.firebaserc` aliases (`dev`, `staging`, `prod`); scripts and workflows use aliases, never raw IDs typed ad hoc.
- Config, secrets, service identities, and third-party integrations (Sentry DSN/environment, GA4 stream, email provider keys) are separate per environment.
- Production data is never used as a development dataset. Seed data comes from deterministic fixtures.
- **PR previews deploy to the staging project** (Hosting preview channel + staging backend), never to prod. They must not hold prod config.
- Every deploy script and workflow verifies the target alias and project ID against an expected value *before* deploying, and fails on mismatch.
- Adding or removing an environment is documented in `docs/runbooks/environments.md` (project creation, alias, secrets, identities, CI wiring, teardown).
- **Hosting-only static sites** (no Auth/Firestore/Functions): a single prod project is enough; preview channels on it are acceptable because there is no data to leak.

## 2. Frontend

| Layer | Standard | Status |
|---|---|---|
| Framework | React + TypeScript, **strict mode** | Mandatory |
| Build tool | Vite, SPA; output is static `dist/` | Mandatory |
| Routing | TanStack Router (typed routes and search params) | Mandatory |
| Styling | Tailwind CSS **v4**, CSS-first `@theme`; tokens from the project's design-system doc | Mandatory |
| Icons | Lucide React, one icon library only | Mandatory |
| Content-first / static sites | Astro (islands), still Tailwind v4 | Conditional (chosen at intake) |
| **Not used** | Next.js, React Router, CSS Modules, inline styles, Formik | Next.js only via ADR showing a need for SSR that Hosting + Functions can't meet |

**Version policy:** pin the React major at scaffold (record it in `docs/adr/`), commit the lockfile, never use `latest` or unbounded ranges. Upgrades are deliberate PRs (see Renovate rules in §6).

**TypeScript baseline** (shared `tsconfig` settings in the starter template):

- `strict: true`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.
- `noUncheckedIndexedAccess: true` (Mandatory; low friction, catches real bugs).
- `exactOptionalPropertyTypes`: **Conditional / off by default.** It is known to clash with some library typings (form libraries, Firebase types). Enable only if the starter's typecheck passes cleanly with it; record the result in an ADR.
- `typecheck` (`tsc --noEmit`) and `build` are separate commands and separate CI steps.
- No `any`, no unsafe `as` casts, no unvalidated external data: anything from a network, Firestore, URL, or storage boundary is parsed with a Zod schema or a typed converter first. Exceptions need a comment explaining why.

## 3. State and data

| Concern | Standard |
|---|---|
| Live Firestore reads | One canonical subscription adapter (`useSyncExternalStore`-based; ReactFire if maintained at scaffold time, otherwise a small internal layer). Keep it small; it is not a new state framework. |
| Mutations, one-shot reads, Cloud Function calls | TanStack Query |
| Client-only UI state | Zustand |
| Forms | React Hook Form + Zod v4 via `@hookform/resolvers` v4+ (pin exact versions) |
| Validation | Zod schemas shared between form and Cloud Function |

**Subscription adapter contract** (Mandatory when the project uses live Firestore):

- Defines loading, error, empty, permission-denied, and auth-change behavior.
- Unsubscribes on unmount and on sign-out or user switch.
- **Cache ownership:** Firestore's SDK cache owns live-collection data; TanStack Query owns only mutation and one-shot/callable results. Nothing is copied between them.
- After a mutation, either the live listener updates the UI, or the relevant Query keys are invalidated. The feature spec says which.
- On sign-out or account switch, clear the Query cache and Zustand user state and detach all listeners.
- **Offline:** default is Firestore's normal behavior. If the product promises offline use, the UI must distinguish cached/pending data from server-confirmed data (`metadata.fromCache`, `hasPendingWrites`) and the spec defines conflict behavior.
- Listener lifetime and scope are explicit: query only what the screen shows, bounded with `limit`.

**Four separate concepts, never conflated:** input validation (Zod, usability), business rules (Functions), authorization (rules + trusted backend), output shaping (don't return fields the caller may not see). A Zod schema is not a security boundary.

## 4. Backend (Firebase)

| Service | Standard | Status |
|---|---|---|
| Auth | Email link (magic link) **and** Sign in with Google, both on by default | Mandatory when Auth is used |
| Session model | Client-side ID tokens via the Web SDK (no session cookies) | Mandatory |
| Authorization | Coarse custom claim `{ role }`, enforced in `firestore.rules` and `storage.rules` first, UI second | Mandatory |
| Resource membership | Per-resource access (e.g. `members/{uid}` docs checked in rules) | **Conditional**: multi-tenant or shared-resource projects |
| Database / Files | Firestore (default DB); Cloud Storage with versioning | Mandatory when used |
| Functions | Cloud Functions v2, `onCall` by default; `onRequest` only for third-party webhooks and external HTTP | Mandatory when used |
| Abuse protection | App Check | Mandatory (see §10) |
| Secrets | Secret Manager (`firebase functions:secrets:set`) | Mandatory |
| Agent tooling | Firebase MCP server + Agent Skills for Claude Code and Antigravity | Mandatory |

**Identity, role, membership are three concepts.** Identity = who (Firebase UID). Role = small, stable, global attribute in a custom claim. Membership = access to a specific resource, stored in data and checked in rules. Don't put per-resource lists in claims.

Authorization requirements:

- Rules deny by default. Every trusted backend operation re-checks authorization itself; it does not trust the client.
- Role-restricted fields are not returned to unauthorized callers.
- Sensitive admin actions (role changes, deletes, exports) write an audit log entry (who, what, when, target) to a Functions-only-writable collection.
- Clients that need updated claims call `getIdToken(true)` after the change.

### Cloud Function checklist (every function; Mandatory)

1. Input validated with the shared Zod schema (`safeParse` → `HttpsError('invalid-argument')`).
2. Authentication and authorization stated in the function spec and enforced in code.
3. Defined error contract: intentional `HttpsError` codes are preserved; unexpected errors are logged and translated to `internal` at the boundary; no internal details leak to callers.
4. `timeoutSeconds`, `memory`, and `maxInstances` set deliberately.
5. Structured logging (see §9); no secrets or unneeded personal data.
6. Retry/failure behavior defined. Idempotency for anything retryable or with external side effects (email, payments).
7. Rate limit or quota for abuse-prone operations (flag at planning).
8. Tests: success, unauthorized, and failure paths.

**Sync vs async:** do the work inside the `onCall` if it finishes quickly and the user needs the result. Otherwise use the Conditional patterns below.

| Pattern | Use when | Status |
|---|---|---|
| Task queue functions / Cloud Tasks | Retryable, rate-limited, or long-running work | Conditional |
| Scheduled functions | Recurring maintenance, reconciliation | Conditional |
| Outbox (write intent in same transaction, worker delivers) | A DB change must reliably trigger an external side effect | Conditional |

## 5. Testing

| Layer | Standard | Status |
|---|---|---|
| Unit / component | Vitest + React Testing Library | Mandatory |
| Security rules | `@firebase/rules-unit-testing` on the Emulator Suite; each collection/path has allow and deny tests; cover reads, queries, creates, updates, deletes, and field constraints | Mandatory |
| Function integration | Functions emulator: authorized, unauthorized, and failing callers; duplicate-request test where idempotency matters | Mandatory when Functions exist |
| Cross-user / cross-tenant | Denial tests between users (and tenants) | Mandatory where roles or memberships exist; include role change, stale claim, and revoked membership |
| E2E | Playwright for critical journeys and auth flows; deterministic fixtures and isolated test accounts | Mandatory |
| Accessibility | `@axe-core/playwright` on every visited page (any violation fails) **plus** manual keyboard/screen-reader review of critical journeys | Mandatory |
| Visual regression | Playwright `toHaveScreenshot()`; a human reviews every baseline change | Mandatory |
| Offline / reconnect / account switch | Listener cleanup, reconnect, and account-switch tests | Conditional: when the app promises offline behavior; listener-cleanup and account-switch tests are Mandatory for any live-Firestore app |
| API mocking | MSW for third-party REST only (it can't intercept Firebase SDK traffic) | Conditional |

Risk-based rule: authorization, billing, data transformation, and irreversible operations need tests, and each critical test states in a comment what failure it is meant to catch. Coverage floor on pure business logic only; no blanket percentage; no snapshot or prop-type tests.

## 6. Code quality and developer experience

| Tool | Standard |
|---|---|
| Lint + format + import sort | Biome (`--save-exact`), including a11y rules and Tailwind class sorting |
| Git hooks | Husky + lint-staged (`biome check --write` on staged files) |
| Commits | commitlint, Conventional Commits |
| Editor config | `.editorconfig` |
| Dependency updates | Renovate (`renovate.json` extending the Lily Pad shared preset); major bumps on React, Tailwind, Zod, Biome, and Firebase SDK need manual review, never auto-merge |
| Vulnerability alerts | GitHub Dependabot alerts (alerts only) |
| Secret scanning | GitHub secret scanning + push protection on |
| **Not used** | ESLint, Prettier, Jest, Cypress. **Terraform is Deferred** (reconsider when provisioning many environments by hand becomes the bottleneck). |

## 7. CI/CD (GitHub Actions)

**Pipelines**

| Stage | Standard |
|---|---|
| Branch protection on `main` | PR required, no direct pushes (agents included), required checks, branch up to date, 1 human approval; `CODEOWNERS` on `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `.github/workflows/`, IAM/service-account config |
| PR pipeline (no deploy credentials) | `pnpm install --frozen-lockfile` → Biome → typecheck → Vitest → rules + Function tests (emulators) → build → Playwright (incl. axe) → bundle-size check → Lighthouse CI → CodeQL (block on critical/high) → dependency audit |
| Preview | Hosting preview channel on the **staging** project per PR (separate deploy job) |
| Production | Deploy on merge to `main`, from a protected GitHub Environment with required reviewers |
| Post-deploy verification | Confirm expected project ID, Hosting release, Functions, and deployed rules/indexes; run smoke tests of critical workflows against the deployed site |
| Release record | Each deploy has a release ID (git SHA + timestamp) used for the Sentry release, logs, and a structured deploy summary |
| Rollback | Hosting release rollback; Functions redeploy of the previous SHA; rules redeploy from git. Written in `docs/runbooks/rollback.md` with an escalation path |
| Hygiene | `concurrency` with cancel-in-progress (never for prod deploy), per-job timeouts, `permissions:` set to minimum per job |

**Credentials and supply chain (Mandatory)**

- Prefer **Workload Identity Federation** (GitHub OIDC) over service-account JSON keys. Use `google-github-actions/auth`; one deploy identity per environment, each limited to what its job needs, restricted to the repo and protected branch/environment.
  *Verify at scaffold:* confirm the Firebase CLI / hosting-deploy action works with the WIF credentials file in the chosen workflow. If not, a scoped service-account key is an **approved exception** that must be documented with a rotation and revocation procedure.
- Build and test jobs never receive deploy credentials.
- Third-party Actions are pinned to reviewed full commit SHAs (Renovate keeps them current via PR); workflow `permissions` are reviewed on every workflow change.
- Emergency security-update path (hotfix branch, expedited review, deploy) is written in the rollback runbook.
- Release inventory: generate an SBOM or dependency list on release **only if** a client or compliance requirement asks (otherwise Deferred).

## 8. Observability

| Need | Standard | Status |
|---|---|---|
| Errors + performance (real-user Web Vitals) | Sentry, client and Functions, tagged with environment and release | Mandatory for prod apps |
| Source maps | Uploaded to Sentry during release; not publicly served from Hosting | Mandatory |
| Analytics | GA4 by default | Mandatory (consent per §12) |
| Product analytics / session replay | PostHog | Conditional: real user behavior to optimize, with privacy controls |
| Server logs | Cloud Logging via `functions.logger` | Mandatory |
| Not used | Crashlytics (mobile-only), Firebase Performance Monitoring (Sentry covers it) | |

**Structured log fields:** `environment`, `service`, `function`, `release`, `operation`, `correlationId`, `outcome` (plus `uid` only where needed). Never log tokens, secrets, or unneeded personal data.

**Operational basics (Mandatory for prod):** React error boundaries with a consistent user-facing failure state; alerts (via Sentry/Cloud Monitoring) on function failure rate, latency, scheduled-job failure, quota consumption, and unusual usage or cost spikes, each with severity and an owner; lightweight SLOs for critical workflows (e.g. "sign-in succeeds", "form submit succeeds") defined at intake.

## 9. API contracts and integrations

Mandatory baseline for projects with Functions or third-party integrations:

- Callable functions are the default API; each has a shared request/response Zod schema in `src/features/<feature>/schemas` (or `functions/shared`).
- Standard error shape: `HttpsError` code + safe message + optional machine-readable `details.code`.
- List endpoints paginate (cursor-based); bulk operations are bounded and batched.
- **Webhooks:** verify signatures, respond fast, process idempotently by event ID.
- **Third-party calls:** explicit timeout, bounded retries with backoff, defined failure behavior, secrets from Secret Manager.
- Contract tests for important integrations (MSW or recorded fixtures).
- OpenAPI/API docs: **Conditional**, only for external consumers or complex HTTP APIs. Not required for internal callables.

## 10. Security baseline

- Firestore and Storage rules deny by default; every rule has tests. UI checks and Zod are usability, not security.
- **App Check:** enabled before launch and **enforced** on Firestore, Storage, and Functions in production. Rollout: monitor in unenforced mode, confirm legitimate traffic is verified, then enforce. App Check does not replace auth, authorization, or rate limiting.
- **CSP and headers via `firebase.json` `hosting.headers`:** restrictive CSP built from the integrations the project actually uses (no copy-paste universal policy); ship **report-only first**, then enforce; after any CSP change re-verify auth, external API calls, analytics, and Sentry. Also set `X-Content-Type-Options: nosniff`, a `Referrer-Policy` (`strict-origin-when-cross-origin` default), and CSP `frame-ancestors`.
- Secrets in Secret Manager only; never in committed files or `.env`; **no production credentials in AI agent sessions**.
- Cloud Billing budget alerts on every Blaze project, plus per-function rate limits for abuse targets.
- DOMPurify required if the app renders admin- or user-entered rich text as HTML.
- **Human review required** for changes to security rules, IAM, secrets configuration, and workflows (enforced via CODEOWNERS).
- Data minimization: collect only what the feature needs; no unnecessary personal data, tokens, or secrets in logs, analytics, or AI prompts.
- SBOM, OWASP ASVS, Trusted Types: only on a specific compliance requirement (Deferred).

## 11. Accessibility

WCAG 2.2 AA on every project, including static sites. Acceptance criteria for every UI feature:

- Full keyboard navigation with visible focus.
- Focus managed in dialogs, menus, and route changes.
- Accessible form errors (associated with fields, announced).
- `prefers-reduced-motion` respected.
- Semantic markup and accessible names.
- Manual review of critical journeys; axe in Playwright is the automated gate.
- Role-denied fields are omitted from the DOM, never hidden with CSS.

## 12. Privacy and consent

- Analytics, session replay, and any AI integration get a privacy review at intake (what data, where it goes, retention).
- Consent mechanism (banner / Consent Mode) where the audience or jurisdiction requires it; GA4 and PostHog respect it.
- Retention and deletion rules are stated per data type at intake.
- Session replay (PostHog) masks inputs by default and is off unless a product need is documented.

## 13. Performance and cost

| Track | Initial JS | LCP | CLS | INP |
|---|---|---|---|---|
| Vite + React SPA | ~250 KB (gzip/brotli) | < 2.5s | < 0.1 | < 200ms |
| Astro / static | ~50 KB | < 2.0s | < 0.1 | < 200ms |

These are initial targets. Lighthouse CI is the lab gate; Sentry real-user data is the actual signal (p75, 28 days). Lab and field numbers are tracked separately.

Mandatory additions:

- Route-level code splitting (lazy routes) and a bundle analysis step; route budgets where one route is heavy.
- Check both mobile and desktop profiles.
- Explicit dimensions on images, video, and iframes; `font-display: swap`.
- Firestore: queries designed against indexes (`firestore.indexes.json` reviewed in PRs), always bounded with `limit`/pagination; listener scope reviewed.
- Per-feature note of expected read/write volume in the spec.
- Function timeout/memory/concurrency tuned, not left at defaults.
- Storage versioning paired with a lifecycle rule that expires old versions.
- Cost estimate for Firebase usage and key third-party services at intake. **Cost thresholds are set per project at intake** from expected workload; there is no universal number.

## 14. Backup and recovery

Mandatory for production data:

- Firestore PITR (7-day window); weekly scheduled backup with 6-week retention (longer if the client requires).
- Cloud Storage versioning with lifecycle cleanup.
- Code rollback via Hosting release rollback (see §7).
- Backup/restore permissions held by a different identity than the app runtime.
- **RPO and RTO stated per project at intake** and recorded in `docs/runbooks/firestore-restore.md`.
- Restore runbook covers data (restore to a new database, inspect, cut over, decommission), rules, indexes, functions, auth configuration, secret references, and integrations; includes post-restore validation.
- **Restore drill at least quarterly** for critical data (a documented lower cadence is acceptable for low-risk projects). The runbook records the date and result of the last successful drill.

## 15. Conditional modules

Documented patterns, no default dependencies.

| Module | Trigger | Preferred approach |
|---|---|---|
| Feature flags | Risky features that need a kill switch | Firebase Remote Config; a dedicated flag service only if Remote Config can't meet the need |
| Transactional email / notifications | The product sends them | Choose provider at intake; credentials server-side only; retries, delivery-failure tracking, idempotency; unsubscribe and consent where required |
| Search | Firestore queries can't serve the use case | Firestore queries first; dedicated search service only when full-text is truly required |
| Bulk jobs, large exports, long reports | Work exceeds a callable's practical limits | Async pattern from §4 |
| Infrastructure as code | Many environments or repeated provisioning pain | Terraform is Deferred; needs an ADR |

## 16. Folder structure

```
src/
  features/<feature>/     components/, hooks/, schemas/, store.ts, types.ts, index.ts
  components/             shared, generic UI
  hooks/                  Firestore subscription adapter and shared hooks
  lib/firebase/           SDK init, auth helpers, env selection
  routes/
  styles/                 Tailwind @theme block
  types/
functions/                Cloud Functions
docs/                     GOVERNANCE, ROADMAP, BACKLOG, ACTIVE_CYCLE,
                          projects/, personas/, adr/, design/, runbooks/
.devcontainer/
.github/workflows/
.firebaserc               dev / staging / prod aliases
CLAUDE.md                 short; points to this doc
```

Code used by one feature lives in that feature's folder. Promote it to shared only when a second feature needs it.

## 17. Governance

- Docs-as-code: Planning → Autonomous execution → Ticket close, with drift written down.
- Architecturally significant decisions get an ADR before implementation (React major baseline, `exactOptionalPropertyTypes` result, any Conditional module adopted, any WIF exception).
- Every collection ships with an access rule and a test proving denial.
- UI and rules agree on role boundaries; personas document the `role` claim and what each role may read and write.
- Design-system adherence checked on every UI change.

## 18. AI-assisted development operating model

- **One source of truth:** this doc plus `docs/` hold the standards. `CLAUDE.md` and Antigravity's instruction files are short and *reference* them rather than copying them. Use only the instruction/workflow file formats each tool actually supports; check the tool's current docs when scaffolding rather than assuming parity.
- **Separate workflows** for planning, implementation, review, security review, and release preparation.
- **Least privilege by default.** Agents work on feature branches and may make routine code and test changes there. Security-sensitive changes (rules, IAM, secrets, workflows) always get explicit human review.
- **No autonomous production deploys, and no production credentials in agent sessions.** Deploys run only through the protected CI environment.
- Agents inspect existing architecture before proposing changes, run the relevant tests, and give a concise diff summary. They write an ADR when governance calls for one.
- MCP servers and external tools: only vetted, least-privilege, non-production-scoped ones (Firebase MCP pointed at dev/staging). *The source recommendation was cut off at this point; the rest of this item still needs to be reviewed.*

## 19. Agent guardrails (put these in `CLAUDE.md`)

1. **Tailwind v4 only.** No `tailwind.config.js`, no `@tailwind` directives, no v3 utilities like `bg-opacity-*`.
2. **Zod v4 syntax.** `z.email()`, `z.url()`, unified `error` parameter, `z.enum()`. Not `z.string().email()`, `required_error`, or `z.nativeEnum()`.
3. **Never wrap `onSnapshot` in a TanStack Query `queryFn`**, and never prefetch live Firestore in a route loader. Use the subscription adapter.
4. **Never mirror Firestore data into Zustand.**
5. **After changing a custom claim, force `getIdToken(true)`.**
6. **Every `onCall` has explicit try/catch and `HttpsError`**; keep intentional codes, translate unexpected errors, leak no internals.
7. **Secrets go in Secret Manager.** No `.env` or committed secrets, and never ask for or use production credentials.
8. **No low-value tests** (snapshots, prop-type checks, library internals).
9. **Magic link:** never take the sign-in email from the redirect URL; handle cross-device; resolve Google/magic-link collisions with `linkWithCredential`.
10. **Zod and UI checks are not security boundaries.** Rules and trusted backend checks are.
11. **"Lighthouse CI passed" is not "Core Web Vitals pass."**
12. **Pin and review major bumps** on React, Tailwind, Zod, Biome, and Firebase packages. No `latest`.
13. **Verify the target Firebase alias/project before any deploy or emulator-vs-real operation.** Never point local code at prod.
14. **Pin GitHub Actions to full commit SHAs** and keep workflow `permissions` minimal.
15. **No `any`, unsafe casts, or unvalidated external data.**
16. **Don't change rules, IAM, secrets config, or workflows without flagging it for human review.**

## 20. Decide at intake for each new project

- Starter: Vite + React (default) or Astro (static/content-only, no roles).
- Which Firebase services: Auth, Firestore, Storage, Functions? (Static site = Hosting only, single prod project.)
- Environments: prod + staging (default for production apps); dev project needed?
- Roles: which `role` values, who gets which. Multi-tenant or shared resources (resource membership)?
- Offline promise? Live Firestore data?
- Async/background work (queues, scheduled jobs, outbox)?
- Rich text rendered as HTML? (DOMPurify)
- Third-party REST, webhooks, email/notifications, search, feature flags?
- Legacy-browser requirement? (Tailwind v4 needs Safari 16.4+, Chrome 111+, Firefox 128+; otherwise scope to v3.4.)
- RPO/RTO, retention beyond 6 weeks, restore-drill cadence?
- Consent/privacy requirements; PostHog justified?
- Expected read/write volume, cost thresholds, SLOs for critical workflows?
- Compliance driver (SBOM, ASVS, etc.)?
