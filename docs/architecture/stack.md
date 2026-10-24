<!-- Source of truth for the Joinery stack. Imported from "joinery-proposed-stack.md" on 2026-10-24.
     Changes go through an ADR; see docs/reviews/2026-10-24-stack-review.md for scaffold findings. -->

# Joinery Proposed Stack

**Status:** Proposal for review, 2026-10-24. **Base:** `lilypad-standard-stack.md`, used as written. **Inputs:** the Joinery Project Plan, `joinery-spec-lead-qualification.md`, `joinery-spec-consultation.md`. **Full reasoning and sources:** "Joinery: technology recommendation report" (Doc).

Tags: **Standard** = taken from the Lily Pad standard unchanged. **ADR** = proposed addition or exception, needs an ADR before it is introduced. **Verify** = confirm at scaffold.

---

## 1. One-way decisions (make first)

| Decision           | Proposal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data region        | **Montréal (`northamerica-northeast1`)** for Firestore, Storage and Functions. Firestore location cannot change after creation, and a Storage-triggered function must sit in the same region as its bucket. Both regions offer everything Joinery needs (Firestore, Functions gen 2, Eventarc Standard, Cloud Scheduler, Cloud Tasks, Cloud Run Tier 2 pricing). Montréal also keeps gen 1 functions available and is much closer to Cornwall (about 120 km against about 450 km, my estimate). Pick Toronto instead only if the privacy notice should say the data is hosted in Ontario. Neither region keeps Claude processing in Canada. Per-region Firestore and Storage prices were not confirmed; compare them in the pricing calculator. Create staging first to confirm the default Storage bucket can be created in the region. |
| Sign-in model      | Invite-only staff sign-in using Identity Platform blocking functions (`beforeCreate`). The upgrade is one-way; free to 50,000 monthly users on Blaze.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Restricted viewers | Rules cannot hide single fields. Installer data lives in a Function-written `visits/{id}` document with measurements and photos beneath it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Location access    | **Settled:** staff at either location can see each other's information at the role level. Role-only rules, no cross-location deny tests. Store `locationId` for filtering and reports. If this ever changes, scope with membership documents, not claims.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| QuickBooks product | Confirm Online or Desktop. Online has a REST API; Desktop needs a Web Connector.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## 2. Environments

| Environment | Firebase project                    | Notes                                                                   |
| ----------- | ----------------------------------- | ----------------------------------------------------------------------- |
| Local / CI  | Emulator Suite                      | All automated tests                                                     |
| Staging     | `joinery-staging` (alias `staging`) | Create at scaffold. PR previews, QuickBooks sandbox, post-deploy checks |
| Production  | `joinery-prod` (alias `prod`)       | Real users and data                                                     |
| Dev         | `joinery-dev`                       | Conditional, only if emulators cannot cover a service                   |

Repo `rpdouglas/joinery`, one Codespace. Aliases in `.firebaserc`; every deploy verifies the alias against the expected project ID.

## 3. Frontend

| Layer                   | Choice                                                                                                                                          | Tag                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Framework               | React 19.x (3.1 is current, 2026-10-14), TypeScript strict                                                                                      | Standard; pin in ADR |
| Build                   | Vite SPA, static `dist/` (confirm current major)                                                                                                | Standard; Verify     |
| Routing                 | TanStack Router                                                                                                                                 | Standard             |
| Styling                 | Tailwind CSS v4, `@theme` from the Joinery design-system tokens                                                                                 | Standard             |
| Icons                   | Lucide React                                                                                                                                    | Standard             |
| Fonts                   | Bitter, Karla, IBM Plex Mono, self-hosted so the CSP never allows Google Fonts                                                                  | ADR                  |
| UI primitives           | React Aria Components (alternative: Base UI) for dialog, select, combobox, tabs, date fields                                                    | ADR                  |
| Data tables             | TanStack Table; TanStack Virtual only for long lists                                                                                            | ADR                  |
| Timeline display        | Compare SVAR React Gantt free core with a custom SVG timeline. Include a list view with date fields (WCAG 2.2 criterion 2.5.7)                  | ADR                  |
| English and French text | Lingui (alternative: react-i18next). Zod `frCA` locale via `z.config()`. `Intl` for money and dates. Define French formats in the design system | ADR                  |

## 4. State, data, forms

Standard: Firestore subscription adapter for live reads, TanStack Query for mutations and one-shot calls, Zustand for UI state, React Hook Form with Zod v4, shared schemas.

Additions:

- Autosave drafts debounced to a second or two, written with an `updatedAt` precondition in a transaction.
- Money: in-house integer-cents module. 50/40/10 split in cents, remainder on the last installment. HST computed per line to match QuickBooks rounding. (ADR)
- Dates: date-fns v4 behind one `lib/dates` module; install and delivery dates stored as calendar dates; swap to Temporal later because stable Safari lacked the full API as of August 2026. (ADR)
- Duplicate detection: stored match keys (normalised phone, email, address); `libphonenumber-js` for phones. (ADR)
- Offline: no promise in v1. Firestore persistence stays off; visible saved or pending indicator; retry failed photo uploads. Revisit after the pilot. (ADR)

## 5. Backend (Firebase)

| Service              | Choice                                                                                                                                         | Tag              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Auth                 | Email link and Google, invite-only via blocking function, roles set by a Function                                                              | Standard + ADR   |
| Roles                | Custom claim `{ role }`: owner, designer, installer, trade partner (installer needs an ADR)                                                    | Standard + ADR   |
| Trade-partner access | Random token, hash stored, scoped to one task, expiring, served by a Function with App Check and rate limits. No Firestore rules path          | ADR              |
| Restricted data      | Separate documents for staff notes, design fee, budget; `derived`, `designFee`, `outcome` in Function-only documents where practical           | Spec change      |
| Database and files   | Firestore default database, Cloud Storage with versioning and lifecycle                                                                        | Standard         |
| Functions            | v2 `onCall`, region set once to `northamerica-northeast1`, Node 24 (Node 20 is decommissioned 2026-10-30); Storage triggers must be idempotent | Standard; Verify |
| Photos               | Store originals; Storage-triggered Function makes JPEG display copies and thumbnails (HEIC)                                                    | ADR              |
| PDFs                 | pdfmake in a Function after a one-day English and French spike; no Puppeteer                                                                   | ADR              |
| Email                | Provider chosen by ADR (Canadian residency, bounce webhooks, unsubscribe, SPF/DKIM/DMARC). v1 sends staff-reviewed drafts                      | ADR              |
| Scheduling engine    | In-house pure TypeScript (backward feasibility, forward replan, float, critical path), property-tested; runs in browser and Function           | ADR              |
| Reports              | Scheduled Function writes rollup documents; `count()` for simple tallies                                                                       | ADR              |
| Abuse protection     | App Check with reCAPTCHA Enterprise, register all apps before enforcing                                                                        | Standard         |
| Secrets              | Secret Manager                                                                                                                                 | Standard         |

## 6. Integrations

| Integration       | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QuickBooks Online | Thin typed client in Functions, Zod-parsed responses, no SDK. Refresh tokens serialised in a transaction; Reconnect URL set in the Intuit portal; 500 requests per minute per company, 10 concurrent; minor version 75 or later; webhooks acknowledged in 3 seconds then queued; sandbox company for dev and staging; request IDs for idempotent creates                                                                                                                                                               |
| 2020 Order Form   | Deterministic parser, real exports as fixtures, raw file kept, output Zod-validated. AI only proposes fixes for staff                                                                                                                                                                                                                                                                                                                                                                                                  |
| AI                | Claude called server-side from a Function, structured fields only, no names, phones, emails or addresses, output parsed with Zod, staff confirm. Do not assume Claude can run in Canada: Anthropic's API offers only US and global inference, and the Vertex AI pages checked list no Canadian region for Claude. Disclose processing outside Canada in the privacy notice. Choose the Anthropic API (key in Secret Manager) or Claude on Vertex AI on billing and access control, not residency. Privacy review first |
| Website leads     | Staff quick-add in v1; `submitLead` with App Check, rate limit and honeypot after release                                                                                                                                                                                                                                                                                                                                                                                                                              |

## 7. Quality, delivery, operations

Standard throughout: Biome, Husky, lint-staged, commitlint, Renovate, Vitest and Testing Library, rules tests, Function tests, Playwright with axe and visual regression, GitHub Actions, branch protection, CODEOWNERS, protected production environment, release IDs, rollback runbook, PITR and weekly backups, restore drills.

Additions and checks:

- Biome class sorting is a nursery rule documented for Tailwind v3 config. Verify it reads the v4 `@theme` block; otherwise write an ADR for the fallback.
- WIF per environment with the narrowest roles that work. Verify rules and index deploys, and whether the Hosting preview action accepts WIF credentials; otherwise call `firebase-tools` directly.
- Tests to add: Auth emulator sign-in, Storage emulator uploads, QuickBooks fixtures from the sandbox, property tests for scheduling and cent splitting, a feet-and-fraction round trip.
- Sentry: US or EU data location only, so scrub names and addresses in `beforeSend`, session replay off, state cross-border handling in the privacy notice. (ADR)
- GA4: not used inside the signed-in app. Add with consent on public pages after release. (ADR exception)
- Alerts also cover QuickBooks token-refresh and sync failures.
- Keep PDF libraries out of the 250 KB bundle; lazy-load timeline, tables and primitives per route.

## 8. ADR list, in build order

1. Region (Montréal) and project creation, staging first.
2. React 19.x, Node 24 and Vite pins.
3. Identity: invite-only sign-in, trade-partner task links, installer role and `visits` document.
4. Delivery and exceptions: staging, WIF roles, GA4, Sentry, offline, Biome class sorting.
5. Before UI work: UI primitives, English and French text, fonts, tables.
6. Before payment terms, notifications and scheduling: PDF generation, email provider, dates, timeline display, scheduling engine, money.
7. Before integrations and AI: QuickBooks client, AI hosting, 2020 parser, photo pipeline, duplicate detection, reports.

## 9. Open items that change this stack

- QuickBooks Online or Desktop.
- A real 2020 Order Form export and the estimate pricing basis.
- Who controls Artisan's DNS for email.
- Which client-facing items need French first.
- Retention for signed agreements and invoices (accountant and counsel).
- Cross-border processing and consent wording (counsel).
