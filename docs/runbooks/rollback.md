# Rollback

**Hosting:** Firebase console → Hosting → release history → roll back to the previous release, or
`firebase hosting:rollback` from an authorised machine. Each release message carries the commit SHA.

**Functions:** redeploy the previous release tag through the deploy workflow. Functions have no
one-click rollback.

**Rules and indexes:** redeploy from the previous tag. Rules history is also visible in the console.

**Data:** use PITR (7 days) or the weekly export; see `restore-drill.md`.

After any rollback: note it in the incident log, open a backlog item for the root cause.
