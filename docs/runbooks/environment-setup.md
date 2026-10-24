# Environment setup (human steps)

These steps are one-way or touch billing. Agents must not run them. Staging is created now;
production is created at the pilot (ADR 0001) by repeating these steps with the `PROD` names.

1. ADR 0001 is accepted (2026-10-24). Re-read its Decision table before starting.
2. In **Lily Pad's Google Cloud organization**, create project `joinery-staging` (if the ID is taken,
   use `artisan-joinery-staging` and update `.firebaserc`, `deploy-staging.yml` and ADR 0001 in one PR).
   Add it to Firebase. Confirm at least two Lily Pad accounts hold Owner.
3. Link Lily Pad's billing account (Blaze). Create a budget of CAD 25/month with alerts at 50%, 90%
   and 100%, sent to the Lily Pad billing contacts.
4. Create the Firestore **default** database: **Standard edition**, **production mode**, location
   `northamerica-northeast1`. This cannot change later.
5. Create the default Storage bucket and **confirm its location is `northamerica-northeast1`**. Turn
   on object versioning and add a lifecycle rule for old versions.
6. Logging: create a log bucket in `northamerica-northeast1` and update the `_Default` sink to write
   to it. (The `_Required` bucket stays global; that is expected.)
7. Register the web app; copy its config into GitHub repository variables
   (`FIREBASE_API_KEY_STAGING`, `FIREBASE_AUTH_DOMAIN_STAGING`, `FIREBASE_STORAGE_BUCKET_STAGING`,
   `FIREBASE_APP_ID_STAGING`).
8. Create the WIF pool and provider restricted to `rpdouglas/joinery`, and a deploy service account
   with the roles listed in ADR 0004. Set `GCP_WIF_PROVIDER_STAGING` and `GCP_DEPLOY_SA_STAGING`.
9. Create the GitHub environment `staging` (`production`, with required reviewers, comes at the pilot).
10. Run **Deploy staging** from Actions. Check that the alias verification passes, the site loads,
    and `ping` responds for an owner.
11. Record the checks from ADR 0001 "Verification" in the PR that adds the staging project config.
