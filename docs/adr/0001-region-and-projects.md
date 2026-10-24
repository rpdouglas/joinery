# 0001. Data region (Montréal) and Firebase project creation

- **Status:** Proposed
- **Date:** 2026-10-24
- **Stack reference:** `docs/architecture/stack.md` §1, §2

## Context

Firestore location cannot change after creation, and a Storage-triggered Function must be in the
same region as its bucket. The business is near Cornwall, Ontario. Claude processing does not stay
in Canada whichever region is picked.

## Options

1. **`northamerica-northeast1` (Montréal):** ~120 km from Cornwall; has Firestore, Functions gen 2,
   Eventarc, Scheduler, Tasks.
2. **`northamerica-northeast2` (Toronto):** same services; choose only if the privacy notice should say
   "hosted in Ontario".

## Decision

Montréal for Firestore (default database), the default Storage bucket and all Functions. Set once in
`shared/config.ts` (`FUNCTIONS_REGION`). Projects: `joinery-staging` first, then `joinery-prod`;
`joinery-dev` only if the emulators can't cover a service. Both on Blaze with budget alerts.
Route the Cloud Logging `_Default` sink to a log bucket in the same region.

## Consequences

- Firestore and Storage prices for this region still need checking in the pricing calculator.
- Auth / Identity Platform user records, App Check and the Hosting CDN are **not** region-bound;
  name them in the privacy notice.
- Changing region later means a new project and a data migration.

## Verification

Follow `docs/runbooks/environment-setup.md` for staging. Confirm the default bucket is created in
`northamerica-northeast1`, deploy `ping`, and call it from the staging app.
