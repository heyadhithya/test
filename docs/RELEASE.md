## Verified QR defaults and ten-participant demo

The generator now obtains server-side readiness from the authenticated immutable issuer ID, issuance configuration, database owner existence, and a live private-bucket metadata check. Only a ready signed-in issuer defaults to saved certificates with QR enabled. Local-only export is explicit; guests and unavailable storage cannot enable saved mode. QR and save controls stay coupled, and existing results retain their successful request mode when controls change. Email delivery is explicitly off.

New original assets: `/demo/sairam-participation-template.pdf`, `/demo/participants-10.xlsx`, `/demo/participants-10.csv`. Ten fictional adults; no email column, no messages, no institutional seal/signature; DEMO ONLY / NOT OFFICIAL template. Original two-row files remain intact.

Validation: 38 tests, clean lint/type/build, audit zero, independent review cleared. `scripts/qr-local-e2e.cjs` exercised real NextAuth password/CSRF/session and disposable PostgreSQL17.11: owner defaults, opt-out/QR re-enable/reload, 10-row Excel and CSV generation, private PDF reads, 10-file ZIP, all ten rendered PDF QR codes independently decoded to exact record URLs, unchanged result status after mode changes, guest401 and unavailable bucket. Storage HTTP responses were a local fixture; this is not a hosted owner-session test. Test script uses fixed loopback database and requires external test-only Playwright, jsqr1.4.0, pngjs7.0.0 and pdftoppm. Never run it against production.

Read-only hosted evidence at this update: 500 owner records issued/nonrevoked with private PDF references; one public registry lookup returned verified200 with no owner/private URL fields. Hosted private PDFs were not retrieved without an owner session, so their embedded QR content was not inspected. No production writes or participant generation occurred through these tests. No monthly capacity claim.

## White dashboard and owner analytics update

The dashboard now uses white drawer/card surfaces with dark text, a restrained backdrop, native modal keyboard containment, Escape dismissal, and visible input focus. Existing layout is retained; no new client dependency or tracking service was added. Original owner screenshot is private and excluded from the repository. Synthetic visual checks cover 360/390/768/1280 widths, focus, error and loading states without horizontal overflow.

Owner-only server aggregates show saved, issued/active, pending, failed, revoked, and issued records created this UTC month. Every read filters the authenticated immutable user ID. Recent records are bounded to 30; verification scans are explicitly untracked. Cards render safely on the server and only expose PDF/verification actions for issued, nonrevoked records with a PDF. Downloads use the owner-authorized private endpoint. Unavailable deletion is removed.

Validation: 37 tests; clean lint/type/build; npm audit zero; independent review cleared after fixing nonempty card server rendering. Browser editor regression passed template edit, XLSX/CSV import, preview, two synthetic guest PDFs, and PDF/ZIP downloads. No live owner session was accessed, no authenticated issuance was simulated, and monthly capacity remains unproven. Existing sample dataset contains TWO fictional rows.

# Current personal password pilot release

This section supersedes historical email-link activation instructions below. Resend is OFF: the active NextAuth provider is Credentials only. No sending key or mail is required. Existing database mapping commit04cf482 is retained. White primary surfaces and the exact unlinked footer “Built from Adhithya.com” preserve existing layout/handlers and MIT notices.

## Secure owner setup contract

The configured Production `AUTH_EMAIL_ALLOWLIST` must contain exactly one manually authorized pilot owner. Source never hardcodes that private address. A read-only hosted check found zero matching accounts; no live account has been created or password reset.

Required Production configuration: `AUTH_MODE=password`, `AUTH_GUARDS_READY=true`, canonical `NEXTAUTH_URL`, existing `NEXTAUTH_SECRET` (do not rotate), and verified integration `POSTGRES_PRISMA_URL`. Set `AUTH_ENABLED=true` to allow password sign-in. Setup is separately gated by `OWNER_SETUP_ENABLED=true`, `OWNER_SETUP_EXPIRES_AT` (ISO UTC,15 minutes from creation; implementation rejects more than24 hours), and `OWNER_SETUP_TOKEN_SHA256`.

Generate48 random bytes with a cryptographic RNG, encode base64url without padding as CODE. Compute lowercase hex SHA-256 of UTF-8 NORMALIZED_OWNER_EMAIL + one NUL byte + CODE. Store only that hash in `OWNER_SETUP_TOKEN_SHA256`, Production sensitive. Do not save CODE/password in source, notes, evidence or logs. Parent delivers the one-use invitation privately to the authenticated owner: `https://sairam-ecosystem-certifications.vercel.app/owner-setup#setup=CODE`. The form reads the fragment into a masked input and immediately removes it from browser history; it serves `Referrer-Policy: no-referrer`. A separate private code entered on the same form also works. No invitation has been generated here.

User enters a fresh unique password directly in the HTTPS form (minimum12 characters, maximum72 UTF-8 bytes). Do not use any password exposed in chat. POST requires exact canonical Origin, JSON and a bounded2KB body. Invalid/expired code fails closed. bcrypt cost12 hashes the password. A transaction creates the consumed-code hash marker and new User together; conflict, expiry, contention or account-write failure rolls back. Existing accounts are never overwritten. `emailVerified` stays null: manual pilot ownership authorization is not mailbox verification. No unrestricted registration, password recovery, OAuth grant or automatic issuer grant exists.

Setup and login share a conservative budget: three admitted attempts/hour per owner with a60-second cooldown (including success), plus global quotas. Wait one minute after setup before signing in. A party who knows the owner email can exhaust that login budget; distributed admission prevents guessing bursts but not targeted lockout. This pilot limitation is explicit, not a general-user authentication maturity claim. JWT and cookie/session expiry are both8 hours.

After verified password sign-in, identify the actual immutable User ID and explicitly set `ISSUER_USER_IDS` for this personal showcase. For QR issuance also set `SUPABASE_PRIVATE_BUCKET=certificates-private`; retain the verified integration’s `SUPABASE_URL` and server-only service key and existing `ISSUANCE_ID_SECRET`. Only then enable `VERIFIED_ISSUANCE_ENABLED` and run synthetic persisted QR/owner-download tests. Remove setup enablement after successful provisioning; consumed markers already prevent invitation replay.

## Release evidence and boundary

35 tests pass, including actual NextAuth CSRF rejection/positive control, JWT expiry, owner binding, expiry during hashing, password checks and setup-origin/body limits. Disposable PostgreSQL17.11 proves atomic provisioning/rollback/racing/replay and no password overwrite. Browser checks cover password/setup screens on390/1440px, fragment clearing/no-referrer, disabled-state failure, and the unchanged template/Excel/PDF/ZIP flow. No hosted account, password, invitation, issuer grant or mail was created. Primary text contrast exceeds4.5:1; historical nonprimary inactive screens received readable heading/input colors.

Do not push until the intended setup-ready release is authorized: the repo is linked to Vercel and pushes can deploy. Remote main remained b523391; our remote rebrand branch remained7dee1c0 during inspection. Concurrent fix/framilton-clean-landing-p0 branch work and its failed previews are unrelated and preserved.

---

# Release status and exact gates

Dependency audit, full lint, typecheck, production build and fourteen regression tests pass. This is a developer-ready demonstration, not a completed verified-issuance production release. No retired resources were modified. No paid activation, OAuth grant, email send or fork retry occurred.

## Approved isolated setup (2026-10-27)

- GitHub `heyadhithya/test` is the user-selected public fork of `omn7/Vura`; work is published on `rebrand/sairam-ecosystem`, preserving main and upstream MIT attribution.
- New Vercel project `sairam-ecosystem-certifications`: `prj_uVCEbVhur5ATVwmfTbxSFKz7N1sD`, team `team_FxxI6fQtxqPMbEDnkfdnwoBt`. The existing `sairam-certify` project is unrelated and preserved.
- Supabase `vvucjlhjrbsxjtdcflwf`, same project name, approved organization `vercel_icfg_qplYVHnMC1pGiRrOOgNlaDHf`, Mumbai `ap-south-1`. Parent obtained a zero monthly provisioning quote and explicit setup approval. Before migration, public relations/functions, auth users, buckets, objects and migration history were empty.
- Applied `docs/fresh-schema.sql` as `sairam_initial_isolated_schema`: ten tables, indexes/FKs, RLS on every application table, anon/authenticated/PUBLIC table grants revoked. Created private PDF-only `certificates-private` bucket. Security advisor reports ten INFO notices for RLS without policies, intentional for server-only access. No client table policies should be added merely to silence these notices.
- The inherited Prisma initial migration is behind the schema. Reconcile/baseline migration history before any future `prisma migrate deploy`; builds only generate the client and do not migrate.

## Remaining secure configuration

The connected Supabase tools do not provide a secure server-key/database-password transfer to Vercel. No secrets were retrieved, generated, printed or stored. The owner must use the dashboards directly; do not send values in chat or commit them.

1. Open the new Supabase project: https://supabase.com/dashboard/project/vvucjlhjrbsxjtdcflwf . In Connect, obtain the transaction-pooler Prisma connection string with this project's password. Use the recommended Prisma pooling parameters. In API settings, obtain this project's server-only legacy service-role JWT for the current storage adapter, never an anon/publishable key.
2. Open the new Vercel project's Settings → Environment Variables. Add Production-only sensitive variables `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, fresh independent random `NEXTAUTH_SECRET` and stable `ISSUANCE_ID_SECRET` (at least 32 characters). Never use `NEXT_PUBLIC` prefixes. Do not copy credentials from another project.
3. Set `SUPABASE_URL=https://vvucjlhjrbsxjtdcflwf.supabase.co`, `SUPABASE_PRIVATE_BUCKET=certificates-private`, and `NEXTAUTH_URL` to the confirmed final HTTPS origin. QR links depend on this durable origin; don't change it casually.
4. Configure email-link authentication as detailed below; no issuer identity or provider sender has been created. After verified sign-in, separately approve its immutable database ID in `ISSUER_USER_IDS`. No password or Google provider is enabled.
5. Leave `VERIFIED_ISSUANCE_ENABLED` unset until the live checks below pass. Leave `PERSISTENCE_ENABLED` unset: unrelated legacy routes remain blocked. Enable verified issuance only on the reviewed release after real integration testing.
6. Email is disabled. Sender domain/DNS/provider credentials and delivery policy remain a separate approval/setup.

## Verification required before release

- Dependency audit and lint are now clean; repeat all checks on the actual release commit. See `DEPENDENCIES.md`.
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

Guest browser flow passed on the production Next server with two synthetic rows (desktop and mobile). Fourteen unit/regression tests pass, including handler authorization/privacy, redirects, registry states, duplicate uploads, database-completion failure recovery, revocation during upload, and mock concurrent adapter calls. TypeScript, full lint (zero errors/warnings), production build and full npm audit (zero advisories) pass. Evidence logs are included. These tests do not establish live Postgres/Supabase behavior or 10k/month capacity.

The API proxy also blocks legacy routes regardless of the legacy environment switch. Only generation, registry lookup, private downloads and NextAuth protocol endpoints are routed. Do not enable unrelated legacy functionality without separate remediation.


## Resource preservation

The already-existing Vercel `sairam-certify` project is not this target and must not be overwritten. The new Vercel name is `sairam-ecosystem-certifications`. Parent handles any old-hosting retirement separately; this code task has changed no old infrastructure.

## Email-link implementation (configuration still pending)

NextAuth now uses a single email-link provider; inactive legacy password/Google options are removed from the login UI/provider list. This retains the Prisma adapter and JWT session architecture. It does not configure Supabase Auth or add OAuth permissions.

Set `AUTH_ENABLED=true` only after approved secure configuration and tests. Required Production-only settings: `DATABASE_URL`, `NEXTAUTH_URL` (exact HTTPS origin), fresh `NEXTAUTH_SECRET` (32+ characters), `AUTH_EMAIL_ALLOWLIST` (comma-separated approved addresses, maximum 100), `AUTH_EMAIL_FROM` (approved verified sender) and sensitive `AUTH_RESEND_API_KEY` (new app's approved sending credential). No recipient address is hardcoded in source. The HTTP transport is implemented for Resend but no Resend account, domain, key, permission or sender has been configured or reused. Sender/provider approval remains a gate.

Auth readiness is independent of `VERIFIED_ISSUANCE_ENABLED`. Successful email verification permits a session, never automatic issuance: `ISSUER_USER_IDS` separately controls issuance by immutable database ID. No identity has been provisioned. To activate an issuer, first verify sign-in, then explicitly authorize the resulting ID. Tokens use NextAuth's random generation, hashed database persistence, atomic consumption and 15-minute expiry; CSRF handling remains in NextAuth. The login request status/body is generic, including provider failures. Synchronous transport timing may still reveal address eligibility; strict timing indistinguishability is not claimed. A durable asynchronous admission/delivery path is required if allowlist membership must be confidential. Server logs omit email/token/provider diagnostics.

Database-backed admission now allows at most ten requests per rolling minute and sixty per rolling hour globally, and three per rolling hour per approved address with a 60-second cooldown. Admission occurs in NextAuth’s sign-in callback after its CSRF check and before token creation/delivery. Nonblocking advisory transaction locking serializes instances; database failure/contention denies admission. Platform-level protection is still required against raw HTTP/connection flooding. Integration tests must prove email receipt, successful callback/session, expiry/replay denial, non-issuer denial, sign-out, and subsequent real QR issuance. Mocked/unit tests do not establish live delivery.

Removing an address from `AUTH_EMAIL_ALLOWLIST` stops new logins but does not revoke existing JWT sessions (NextAuth default session lifetime is 30 days). Remove the immutable ID from `ISSUER_USER_IDS` to stop further issuance immediately. Explicit session revocation/shorter-session policy requires implementation before relying on allowlist removal as account revocation.

References: https://next-auth.js.org/providers/email and https://resend.com/docs/api-reference/emails/send-email . The email best-practices skill informed the transactional plain-text message and sender approval gates; it did not authorize a live send.


## Applied distributed auth guard migration

`docs/auth-guards-index.sql` creates exactly one index: `VerificationToken_expires_token_idx` on existing `public."VerificationToken" (expires, token)`. It adds no tables, grants, policies, credentials or identities. The approved index was applied on 2026-10-27 to `vvucjlhjrbsxjtdcflwf` as `sairam_auth_token_cleanup_index`, after local PostgreSQL tests and independent review. Hosted metadata confirms `indisvalid=true` and `indisready=true`. The table columns and absence of this index were inspected first. No hosted rows were inserted or deleted. Do not use the old migration baseline automatically.

Admission uses the existing verification table for one global and one HMAC recipient marker per admitted attempt, each expiring after one hour. Markers have non-email identifiers and independent random keys, never actual email links. At most 60 admissions/hour create 120 such rows, plus up to 60 normal NextAuth token rows. Failures consume budget conservatively. Requests denied by the allowlist do not create markers or tokens. Rotating the auth secret resets recipient HMAC identity but does not reset the global quota.

Cleanup takes at most 100 expired rows per approved request attempt, ordered by the proposed index, with `FOR UPDATE SKIP LOCKED`. It runs transactionally before quota counting; unexpired links are excluded and normal token consumption remains Prisma’s atomic delete. Both cleanup and quotas use database time. Idle systems may retain expired rows until the next approved request; there is no scheduled job or indefinite background worker. Transaction acquisition and work have 1s/3s bounds. No claim is made that this bounds upstream HTTP flood costs.

Keep `AUTH_GUARDS_READY` unset pending secure application configuration and live authentication integration checks. Real disposable PostgreSQL17.11 tests now confirm natural index usage, lock contention, concurrent admissions, rollback, quota expiry, bounded cleanup, locked-row skipping and atomic token consumption. See `evidence/auth-postgres.txt` and `scripts/auth-postgres-test.mjs`. These do not establish hosted app connectivity or live email delivery. `AUTH_ENABLED=true` alone cannot activate authentication. Actual mail delivery/session/QR tests and sender credentials remain pending. Generic status/body does not imply timing equalization.


Local test provenance: official Docker `postgres:17`, digest `sha256:b8faeff7712663c2773a190181e1246e37e364b887611c04658c28b44e2408fe`, PostgreSQL17.11. Test database `sairam_auth_guards` used tmpfs storage and loopback port55432 only. The script has a fixed disposable local connection and cannot accept a hosted URL. Synthetic rows were local only; container and temporary database were removed after tests. Hosted migration used a 2s lock timeout and 30s statement timeout, creating only the index.

## Verified integration runtime mapping

Vercel store `store_J6E3PfSjxPMCbWc3` maps to new Supabase `vvucjlhjrbsxjtdcflwf`; its sole connected project is `prj_uVCEbVhur5ATVwmfTbxSFKz7N1sD`. All16 integration variables were metadata-verified sensitive, but the binding mistakenly covers Preview and Production. Correct the resource connection to Production only before any automatic Git deployment. Individual env target edits would not establish a durable binding correction; the connected tools lack the Marketplace connection-update endpoint, and no normal authenticated CLI/API session is available locally.

The runtime Prisma client now selects server-only `DATABASE_URL` if explicitly set, otherwise `POSTGRES_PRISMA_URL`, using Prisma6's documented datasource override. Auth readiness uses the same selector. No secret value is copied, decrypted, logged, embedded in client bundles or placed in a public env variable. Direct connection strings remain unused: application startup/build does not run migrations. Future CLI migrations require explicit reviewed configuration, not runtime aliasing. Reference: https://www.prisma.io/docs/orm/v6/reference/prisma-client-reference#datasources .

Stable canonical domain `sairam-ecosystem-certifications.vercel.app` is verified on the new project. Homepage and disabled callback return200 without redirect. `NEXTAUTH_URL=https://sairam-ecosystem-certifications.vercel.app` is set Production-only. Deployment-specific hostname uses Vercel SSO; protection was not changed. This does not prove active authentication callback success.

Fresh NEXTAUTH_SECRET/ISSUANCE_ID_SECRET are still absent: the orchestrator has no cryptographic random generator, and the env tool requires a supplied value. Local Node can generate secrets but there is no authenticated local Vercel destination; bridging through command output would expose secrets. No secrets were generated or emitted. Sender key/from/allowlist and issuer grants remain unconfigured.

Repository linkage is now active. Available metadata cannot establish a branch with Git deployments disabled, so runtime-mapping changes are retained locally pending safe publication; publishing must not trigger the previously prohibited deployment or Preview credential exposure.
