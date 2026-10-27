# Black Table: Framilton engineering council

## Mission
Build a verifiable certificate issuance product. Fictional council personas organize accountability; actual work must be performed by executable agents with commands, tests, and independent review.

## People and agents
- Jessica: final decision. Use `release_reviewer` (Sol, read-only) for release gatekeeping.
- Harvey: primary coordinator. Use the main Codex session (prefer Sol, high reasoning) to route tasks and integrate changes.
- Mike: technical implementation. Use `backend_fixer` (Luna) to fix backend defects.
- Louis: security challenge. Use `security_auditor` (Sol, read-only).
- Donna: usability challenge. Use `product_reviewer` (Luna, read-only).
- Certificate specialist: use `certificate_engineer` (Luna) for PDF, QR, Excel, and batches.
- QA: use `qa_engineer` (Luna) to write independent tests and fixtures.

## Observed issues from a code review of upstream-matching commit b52339176d97f53f305bb686bb3f76dd853127d1
These are **code observations**, not a passing/failing result from a live deployment.

P0 | Admin cookie: `lib/admin.ts` compares the cookie to `ADMIN_PASSCODE` with a hard-coded fallback; `app/admin/actions.ts` also falls back to the same value. Replace with authenticated, signed, expiring, server-validated sessions. Remove fallback. Keep secret values out of code.

P0 | Build syntax: `app/api/certificates/route.ts` has an unattached `.catch(...)` after the GET handler. Reproduce with typecheck/build before correction.

P0 | API key: `app/api/user/api-key/route.ts` bcrypt-hashes keys but `app/api/certificates/create/route.ts` looks them up with equality on the submitted plaintext key. Implement a keyed lookup design (public prefix/key id + stored hash or HMAC lookup) with rotation tests.

P0 | Template URL: `lib/url-validation.ts` passes ordinary hostnames to `isPrivateIPv4`, whose non-IP error path treats them as private. It prevents valid domain URLs. Validate IP literals separately and resolve public domain names with redirect and rebinding precautions.

P0 | Verify consistency: the API in `app/api/verify/[id]/route.ts` rejects revoked certificates, but `app/verify/[id]/page.tsx` renders a positive verified state whenever a matching record exists. Unify both through one verification policy; test revoked IDs.

P0 | Tenant integrity: in `app/api/emails/queue/route.ts` the `updateMany` status mutation filters by client-supplied certificate IDs but omits `userId` and `batchId`. Scope the mutation to certificates fetched for the authenticated user.

P1 | Readiness: `app/api/generate/route.ts` runs PDF generation, uploads, and optional emails sequentially inside one HTTP request, with a 5,000-row cap. Move large batches to resumable background jobs only after P0 passes, then measure realistic throughput for 10,000/month.

P1 | Configuration: auth and password reset code force `https://vurakit.in` in production, README shows `AWS_S3_BUCKET_NAME` while S3 client expects `AWS_BUCKET_NAME`; branding and verification links need a single trusted canonical domain.

P1 | Evidence: no dedicated tests were present in the inspected repository tree; the workflow contains a build check but cannot substitute for auth, tenant, and certificate tests.

## Delivery phases
1. **Stop the bleeding**: reproduce clean install/build, P0 security/authorization defects, test coverage. No deploy.
2. **Prove issuance**: synthetic 100-row Excel -> template -> 100 individually valid PDFs -> unique QR links -> downloadable ZIP -> successful/invalid/revoked verification -> useful error handling.
3. **Operationalize**: queue-backed 1,000-row test, idempotent retries, delivery records, storage, backups, rate limiting, metrics, backup/rollback; measure costs.
4. **Polish**: Framilton branding and accessible UI after successful workflow; preserve repository MIT attribution.
5. **Release review**: Sol release reviewer verifies reproducible evidence, permissions, and reversible deployment path. Only an explicit owner-approved deploy may follow.

## Delegation pattern
- Start 2 read-only investigators in parallel: `security_auditor` and `product_reviewer`.
- Have `qa_engineer` establish baseline and own fixture/test files.
- Wait for independent findings; coordinator orders P0 fixes, assigns one writer per overlapping source group, and requests regression tests.
- Once P0 passes, use `certificate_engineer` for issuance and QR workflows.
- Have `release_reviewer` independently check evidence before opening a merge-ready PR.
- Never run 5+ writing agents simultaneously against the same checkout. Three concurrent subagents is the starting cap.

## Evidence format
For each work item: ID | severity | reproduction | files | test command | result | remaining risk. Use `confirmed`, `hypothesis`, `tested locally`, or `tested in staging` without conflating them.

## First Codex task
```text
Convene the Black Table for Framilton. Read AGENTS.md and docs/BLACK_TABLE.md.
Use security_auditor and product_reviewer as read-only subagents. Use qa_engineer to establish install/lint/typecheck/build baseline and synthetic regression fixtures; keep source files exclusively assigned.
Wait for findings and prioritize confirmed P0 issues. Assign backend_fixer to correct one P0 failure at a time with failing test first. Coordinate file ownership.
Do not change production deployments, live databases, DNS, credentials, or send real emails. Do not redesign the homepage.
Continue until a clean build and the P0 regression tests pass, or report precise blockers with commands and file paths. Create a reviewable PR with test evidence. Have release_reviewer perform final independent review.
```
