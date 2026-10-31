# Rollback and emergency fixes

Every deploy carries a release ID (commit SHA + timestamp) in the Hosting release message, Sentry
and logs. Use it to find what to roll back to.

## Roll back

| What | How |
|---|---|
| Hosting | Firebase console → Hosting → release history → roll back, or `firebase hosting:rollback` from an authorised machine (not an agent session). |
| Functions | Re-run the deploy workflow on the previous release SHA. Functions have no one-click rollback. |
| Rules and indexes | Re-run the deploy workflow on the previous SHA. Rules history is also visible in the console. |
| Data | PITR (7 days) or the weekly backup. Follow `firestore-restore.md`. |

After any rollback: post-deploy checks (project ID, Hosting release, Functions, rules) must pass
again, then log it below and open a backlog item for the root cause.

## Escalation

1. On-call developer (Lily Pad) rolls back first, investigates second.
2. If data is affected or rollback fails within 30 minutes: escalate to the Lily Pad owner.
3. If client data may have been exposed: the owner informs the client the same day and follows the
   privacy-incident steps agreed in the client contract.

Names and contact details live in the private Lily Pad operations doc, not in this repo.

## Emergency security update

For a vulnerability that cannot wait for the normal cycle:

1. Branch `hotfix/<short-name>` from `main`.
2. Make the minimal fix. A security fix may use a dependency release younger than 14 days: add it
   to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` and name it in ADR 0002.
3. Open a PR labelled `security`; CI must pass. Review is expedited but still required.
4. Merge and deploy through the normal workflow (never from a laptop or agent session).
5. Verify, log below, and remove the age exclusion once the release is 14 days old.

## Log

| Date | Release rolled back | To | Reason | By |
|---|---|---|---|---|
