# Firestore backup and restore

## Targets (set at intake; to be confirmed with the client before the pilot)

| | Target | Status |
|---|---|---|
| RPO (max data loss) | 24 hours (weekly backup + 7-day PITR covers it) | Proposed |
| RTO (max time to restore) | 4 hours | Proposed |
| Backup retention | 6 weeks (longer if the accountant or counsel require it for agreements and invoices) | Open |
| Drill cadence | Quarterly, and before the pilot | Agreed |

## Backups

- Firestore PITR on (7-day window) and a weekly scheduled backup with 6-week retention.
- Cloud Storage object versioning with a lifecycle rule that expires old versions.
- Backup and restore permissions belong to a dedicated identity, **not** the app runtime or the
  deploy service account.

## Restore (staging first, never straight to production)

1. **Data:** restore the backup or PITR snapshot into a **new named database**; never overwrite the
   default database.
2. **Inspect:** document counts per collection against the backup manifest; open three known jobs in
   the app pointed at the restored database.
3. **Cut over** (production only, after inspection): point the app at the restored data per the
   incident plan, or copy the affected documents back.
4. **Everything else the app needs:** security rules and indexes (from git), Functions (redeploy the
   release SHA), Auth configuration (providers, authorised domains, blocking functions), Secret
   Manager references, and integrations (QuickBooks connection, email provider).
5. **Validate:** sign-in works, a staff user sees their data, a rules denial test passes against the
   restored environment, and QuickBooks sync is paused or reconciled.
6. **Decommission** the temporary database once cut-over is confirmed.

## Drill log

| Date | Backup used | Duration | Result | By |
|---|---|---|---|---|
