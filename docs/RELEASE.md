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

Per-process limits allow ten email requests per minute globally and three sends per hour per approved address, at least 60 seconds apart. These are bounded local defenses, not distributed abuse protection; configure platform/provider limits before production. Expired verification-token cleanup is also required for sustained operation. Integration tests must prove email receipt, successful callback/session, expiry/replay denial, non-issuer denial, sign-out, and subsequent real QR issuance. Mocked/unit tests do not establish live delivery.

Removing an address from `AUTH_EMAIL_ALLOWLIST` stops new logins but does not revoke existing JWT sessions (NextAuth default session lifetime is 30 days). Remove the immutable ID from `ISSUER_USER_IDS` to stop further issuance immediately. Explicit session revocation/shorter-session policy requires implementation before relying on allowlist removal as account revocation.

References: https://next-auth.js.org/providers/email and https://resend.com/docs/api-reference/emails/send-email . The email best-practices skill informed the transactional plain-text message and sender approval gates; it did not authorize a live send.
