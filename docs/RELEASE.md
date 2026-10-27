# Release status and exact gates

No fork retry, hosting creation, credential creation, migration, paid provisioning or email send occurred. All retired resources are preserved. This branch is NOT production-ready: inherited lint errors, dependency advisories, and live integration remain blockers.

## Targets

- Confirmed GitHub target `heyadhithya/test`: public fork, parent/source `omn7/Vura`, push permission true, main exactly `b52339176d97f53f305bb686bb3f76dd853127d1`. User supplied this target; no repository rename or fork retry. Changes are intended for a review branch, not a release.
- Proposed Vercel project `sairam-ecosystem-certifications`, team `team_FxxI6fQtxqPMbEDnkfdnwoBt` (`adithya-ss-projects-3d3e5750`): no existing match.
- Supabase: both connected accounts list only retired Framilton. Do not use it. A separate project named `sairam-ecosystem-certifications` and private bucket `certificates-private` are proposed, not provisioned. Parent handles pricing; no purchase authorized.

## Approval/configuration required

1. Target fork verified. Publish review branch without changing main; production release remains blocked below.
2. Approve a fresh Supabase project/account/region/plan. No existing project credentials or tables may be reused. Confirm new project reference and private bucket metadata. Test anonymous object denial.
3. Approve schema deployment from existing Prisma schema into that fresh database only, plus RLS/grant hardening. The application uses Prisma server-side and NextAuth, not Supabase client Auth. Apply reviewed SQL that enables RLS and revokes anon/authenticated access on application tables; do not expose raw certificate/user tables. No migration was applied here.
4. Approve fresh secrets and configure ONLY the new Vercel project:
   - `DATABASE_URL`: fresh Postgres pooled server connection, deployment-only.
   - `NEXTAUTH_URL`: exact final HTTPS origin; do not change casually because QR links are durable.
   - `NEXTAUTH_SECRET`: fresh auth secret.
   - `ISSUANCE_ID_SECRET`: separate stable >=32-character secret; preserve across auth-secret rotations. Loss/rotation changes retry identities.
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `SUPABASE_PRIVATE_BUCKET`.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` if approved Google OAuth is used; redirect `/api/auth/callback/google` at the exact new origin. Alternatively provision approved credential users separately, never public self-registration.
   - `ISSUER_USER_IDS`: explicit immutable approved database user IDs. Email text alone never authorizes issuance.
   - `VERIFIED_ISSUANCE_ENABLED=true` only after release/integration checks. Leave `PERSISTENCE_ENABLED` unset; legacy routes are out of release scope.
5. Email remains disabled. If later needed, separately approve sender domain/DNS/provider credentials, delivery queue and suppression policy; no SMTP insecure TLS/mock success is permitted.

## Verification required before release

- Resolve dependency audit findings and inherited lint errors; do not suppress them to claim green checks.
- Exercise real isolated Postgres + Storage with synthetic data: issue, scan/decode QR, lookup, issuer download, unauthenticated/other-user denial, revocation, upload-success/DB-failure recovery, duplicate concurrent requests, private bucket enforcement and storage cleanup. Current unit tests use adapters/mocks; they do not prove real integration.
- Confirm private storage duplicate error shape against deployed API and exact-byte retry behavior with real PDF fixtures. Blob upload occurs before activation; abandoned pending rows/objects need a reviewed cleanup job.
- Original upstream 10 MB template, 5 MB spreadsheet, 5,000-row validation limits remain unchanged. These are parser limits, NOT safe Vercel request/batch capacity. Whole multipart uploads may exceed platform request limits; synchronous generation requires timing/memory measurements and likely smaller operational batches/direct uploads or a queue before scale claims.
- Registry lookup needs platform rate limiting; existing in-memory controls are not a distributed guarantee.
- Persisted gallery/revocation UI and legacy API-key routes are not ready. Do not enable legacy routes to obtain them.

## Monthly capacity and retention assumptions (unproven)

Target: >10,000 certificates per month, not per day or one request. Example planning volume: 12,000/month, ~400/day; start synthetic measurements at 2, 10 and 25 per batch, then choose a measured limit. No participant/load tests were run.

At 200 KB/PDF, 12,000 PDFs add roughly 2.4 GB/month before templates, database and backups; 1 MB/PDF adds ~12 GB/month. Each complete download adds the same amount to egress. These are arithmetic assumptions, not provider cost commitments. Measure fixture/output sizes and scan/download rates before estimating spend.

Proposed retention for owner approval: retain minimal QR registry records while credentials must verify; retain PDFs 90 days only if the institution accepts later issuer-download expiry; delete datasets/templates immediately after processing unless explicitly retained. Never delete verification records merely because PDF retention ends. Current schema ties verification to a stored PDF reference, so retention deletion must preserve issuance evidence and must be implemented/tested before any cleanup automation. No deletion/retention job is enabled.

## Final local checks

Guest browser flow passed with two synthetic rows (desktop and mobile). Nine unit/regression tests passed. TypeScript and production build passed on the prepared source; evidence logs included. Full lint still reports 155 errors / 75 warnings, largely inherited typing/React issues. npm audit reports 44 advisories (5 critical, 36 high, 2 moderate, 1 low). These prevent production approval; no attempt was made to disguise failures or claim 10k/month capacity.

The API proxy also blocks legacy routes regardless of the legacy environment switch. Only generation, registry lookup, private downloads and NextAuth protocol endpoints are routed. Do not enable unrelated legacy functionality without separate remediation.
