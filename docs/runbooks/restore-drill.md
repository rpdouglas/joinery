# Restore drill

Quarterly, and before the pilot. Restore into **staging**, never production.

1. Pick a recent weekly export from production.
2. Import it into a new named database in staging (not the default database).
3. Run the read-only checks: document counts per collection match the export manifest; open three
   known jobs in the app pointed at the restored database.
4. Record the time taken and any problems in this file's log below. Delete the restored database.

## Log

| Date | Export | Duration | Result |
| ---- | ------ | -------- | ------ |
