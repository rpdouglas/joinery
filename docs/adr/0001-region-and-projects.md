# 0001. Data region (Montréal) and Firebase project creation

- **Status:** Accepted (2026-10-24)
- **Date:** 2026-10-24 (revised after owner review, same day)
- **Deciders:** Owner (@rpdouglas), Lily Pad
- **Stack reference:** `docs/architecture/stack.md` §1, §2

## Context

Firestore location cannot change after creation, and a Storage-triggered Function must be in the
same region as its bucket. The business is near Cornwall, Ontario, on the Quebec border, and
**serves some clients who live in Quebec**. Claude, Sentry, Firebase Auth and App Check process data
outside Canada whichever region is picked. There is no Canadian multi-region location; the nearest
(`nam5`) is in the United States.

## Options

1. **`northamerica-northeast1` (Montréal):** ~120 km from Cornwall; has Firestore, Functions gen 2,
   Eventarc, Scheduler, Tasks. Quebec clients' data stays in Quebec for the core store.
2. **`northamerica-northeast2` (Toronto):** same services; privacy notice could say "hosted in
   Ontario". Quebec clients' data would leave Quebec for the core store.
3. **`nam5` (US multi-region):** higher availability SLA, but moves the core store out of Canada.
   Rejected.

## Decision

**Region.** `northamerica-northeast1` for the Firestore default database, the default Storage
bucket, all Functions, Cloud Scheduler and Cloud Tasks. Set once in `shared/config.ts`
(`FUNCTIONS_REGION`).

**Firestore.** Default database, **Standard edition**, created in production mode (deny-all rules
until our rules deploy).

**Ownership and billing.** Projects sit in **Lily Pad's Google Cloud organization** on Lily Pad's
billing account; usage is invoiced to the client. The client contract must include a transfer plan:
how projects move to the client's own organization and billing account on request or at the end of
the engagement, and who holds owner access in the meantime. At least two Lily Pad people hold the
Owner role; no personal Gmail accounts as owners.

**Projects.**

| Environment | Project ID        | Fallback if taken         | When                                                                                |
| ----------- | ----------------- | ------------------------- | ----------------------------------------------------------------------------------- |
| Staging     | `joinery-staging` | `artisan-joinery-staging` | Now                                                                                 |
| Production  | `joinery-prod`    | `artisan-joinery-prod`    | At the pilot (Phase 6), after backups, rollback and the restore drill are rehearsed |
| Dev         | `joinery-dev`     | `artisan-joinery-dev`     | Only if the emulators cannot cover a service                                        |

Project IDs are global and permanent. Whatever ID is created, update `.firebaserc`, the deploy
workflow's `verify:alias` arguments and this table in the same PR.

**Billing guardrails.** Blaze plan with a budget per project and alerts at 50%, 90% and 100%.
Starting budgets: staging CAD 25/month, production set at the pilot. Budgets alert; they do not cap.

**Logging.** Create a log bucket in `northamerica-northeast1` and point the `_Default` sink at it.
The `_Required` bucket (admin-activity audit logs) is global and cannot be moved; name it in the
privacy notice with the other non-regional services.

## Consequences

- **Quebec Law 25.** Because the business collects personal information from Quebec residents,
  Law 25 likely applies regardless of hosting region. Montréal keeps the core store in Quebec, but
  the services processing outside Canada (Claude, Sentry, Auth, App Check, `_Required` logs) likely
  need a privacy impact assessment before data goes to them. This is a question for counsel, not a
  conclusion; it is added to the open items below.
- **Cost.** New default Storage buckets require Blaze, and the no-cost Storage tier applies only to
  some US regions, so Montréal Storage is billed from the first byte. Expected to be a few dollars a
  month at pilot scale; confirm per-region Firestore and Storage prices in the pricing calculator.
- **Availability.** A regional Firestore database has a 99.99% SLA against 99.999% for
  multi-region. Accepted for an internal staff app; PITR and weekly exports cover data loss.
- **Not region-bound:** Auth / Identity Platform user records, App Check, the Hosting CDN and the
  `_Required` log bucket. List them in the privacy notice.
- **Ownership.** Lily Pad holding the projects makes setup simpler but makes Lily Pad the
  custodian of client data until transfer; the contract and privacy notice must say so.
- Changing region later means a new project and a data migration.

## Open items (owner and counsel)

- Privacy impact assessment under Law 25 for processing outside Quebec and outside Canada.
- Client contract: project transfer plan and data-custodian wording.
- Privacy notice: hosting location (Montréal) and the list of non-regional services.

## Verification

Follow `docs/runbooks/environments.md` for staging. Confirm: Firestore shows
`northamerica-northeast1` and Standard edition; the default bucket is in `northamerica-northeast1`;
`_Default` routes to the regional log bucket; the budget alert exists; `ping` deploys and answers
the staging app.
