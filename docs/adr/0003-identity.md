# 0003. Identity: invite-only sign-in, roles, trade-partner links, installer `visits`

- **Status:** Proposed (draft; needs the owner's input on the open questions)
- **Date:** 2026-10-24
- **Stack reference:** `docs/architecture/stack.md` §1, §5

## Context

Staff only; no self-sign-up. Roles: owner, designer, installer, trade partner. Rules cannot hide single
fields. Staff at both locations see each other's data at the role level.

## Decision (proposed)

- Upgrade to **Identity Platform**; a `beforeUserCreated` blocking Function allows only emails with
  a pending invite document. One-way upgrade; free to 50,000 monthly users on Blaze.
- Sign-in with **email link** (served from the Hosting domain) and **Google**.
- `{ role }` custom claim set only by an owner-only callable Function. Schema: `shared/schemas/roles.ts`.
- **Installer:** reads only a Function-written `visits/{id}` document with `measurements` and
  `photos` beneath it; never the client or job documents.
- **Trade partners:** no Firebase account. A random token (hash stored) scoped to one task, with an
  expiry, served by an HTTPS Function with App Check and rate limits. No Firestore rules path.
- Store `locationId` on records for filtering only; rules do not check it.

## Open questions

- Which domain sends email links, and who controls its DNS?
- Token lifetime and revocation for trade-partner links.

## Verification

Auth emulator tests for invite allow/deny; rules tests for each role on `visits`; Function tests for
token expiry, wrong task and rate limit.
