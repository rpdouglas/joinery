# Environment setup (human steps)

These steps are one-way or touch billing. Agents must not run them. Do staging first and confirm
each check before repeating for production.

1. **Accept ADR 0001.**
2. Create Firebase project `joinery-staging`; upgrade to Blaze; set a budget alert.
3. Create the Firestore **default** database in `northamerica-northeast1` (cannot change later).
4. Create the default Storage bucket; **confirm its location is `northamerica-northeast1`**. Turn on
   object versioning and set a lifecycle rule for old versions.
5. Register the web app; copy its config into GitHub repository variables
   (`FIREBASE_API_KEY_STAGING`, `FIREBASE_AUTH_DOMAIN_STAGING`, `FIREBASE_STORAGE_BUCKET_STAGING`,
   `FIREBASE_APP_ID_STAGING`).
6. Route the Cloud Logging `_Default` sink to a log bucket in the same region.
7. Create the WIF pool and provider restricted to `rpdouglas/joinery`, and a deploy service account
   with the roles listed in ADR 0004. Set `GCP_WIF_PROVIDER_STAGING` and `GCP_DEPLOY_SA_STAGING`.
8. Create the GitHub environment `staging` (and later `production` with required reviewers).
9. Run **Deploy staging** from Actions. Check that the alias verification passes, the site loads,
   and `ping` responds for an owner.
