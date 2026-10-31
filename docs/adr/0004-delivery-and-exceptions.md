# 0004. Delivery and exceptions: staging, WIF, GA4, Sentry, offline, Biome class sorting

- **Status:** Proposed
- **Date:** 2026-10-24
- **Stack reference:** `docs/architecture/stack.md` §2, §4, §7

## Decision (proposed)

1. **Staging** is a full project and the only deploy target for PRs (manual `deploy-staging.yml`
   for now; PR previews later). Every deploy runs `scripts/verify-firebase-alias.mjs` first.
   **Who deploys:** the owner or a coding agent may trigger the deploy workflows (owner decision,
   2026-10-28). Agents trigger them through the GitHub Actions API and never hold Firebase or GCP
   credentials. The `staging` environment has no reviewers; the `production` environment requires
   the owner's approval, so an agent can start a production deploy but not complete one.
2. **WIF** per environment: one deploy service account each, with the narrowest roles that deploy
   Hosting, Functions, rules and indexes. Deploy calls `firebase-tools` directly, so the Hosting
   preview action isn't needed for WIF.
3. **GA4:** not inside the signed-in app. Public pages only, with consent, after release.
4. **Sentry:** US or EU data location only. Scrub names, phones, emails and addresses in `beforeSend`;
   session replay off; mention cross-border processing in the privacy notice.
5. **Offline:** not promised in v1. Firestore persistence off; a visible saved or pending indicator;
   retry failed photo uploads.
6. **Biome class sorting:** tested on 2026-10-24. `useTailwindSortedClasses` (nursery) does not read
   `@theme`, so classes built from custom tokens stay unsorted at the front of the list. Proposed:
   keep the rule as a **warning** with a safe fix (consistent and good enough), and don't add Prettier.
   Revisit when Biome reads Tailwind v4 CSS config.

## Verification

Staging deploy from Actions with WIF and no stored keys; a Sentry test event with scrubbed fields;
Playwright check of the pending indicator once autosave exists.
