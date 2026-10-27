# Framilton Certifications: Codex engineering rules

## Mission
Turn this fork of omn7/Vura into a reliable, independently branded, QR-verifiable college certificate service. A claimed feature is not complete until a test or recorded manual reproduction demonstrates it.

## Repository facts (audit snapshot, 2026-10-27)
- The fork's main branch matched upstream Vura commit b52339176d97f53f305bb686bb3f76dd853127d1 when reviewed.
- Existing stack: Next.js 16, React 19, NextAuth 4, Prisma 6/PostgreSQL, S3, pdf-lib, qrcode, xlsx, Resend.
- Current app code uses Neon/S3 and Vura branding. Supabase/Vercel migration and Framilton branding have NOT been implemented by this agent harness.
- Preserve the existing MIT LICENSE and original notices. Keep the license in the repository; do not create a website license page just to show it.

## Absolute working rules
1. Do not claim tests, deploys, migrations, or integrations succeeded unless execution evidence exists.
2. Do not modify production deployments, DNS, remote database schema/data, secrets, or email delivery settings without explicit authorization and a reversible plan.
3. Do not commit credentials, actual student data, or real recipient email addresses. Use synthetic samples.
4. Do not push directly to main. Create a scoped branch and PR, and report the precise file paths changed.
5. Treat authentication, authorization, tenant isolation, public verification, and certificate revocation as release-blocking concerns.
6. Preserve valid certificate links and IDs across migrations. No destructive data changes without backup, rollback, and approval.
7. No cosmetic redesign while P0 blockers remain unresolved. Design reviews follow a working end-to-end product flow.
8. Keep response style factual. Separate confirmed findings, hypotheses, reproduced defects, and untested changes.

## Orchestration
- Use the Sol coordinator for planning, integration, and adjudication when available; use Luna agents for bounded implementation and QA.
- Spawn at most three subagents at once. Use parallel agents for independent investigation, QA, and reviews; use sequential work for shared files.
- Each implementation agent owns a disjoint file set. The coordinator assigns exact files, acceptance criteria, and regression tests.
- Read-only specialists must not edit source code. Agent instructions are not a security boundary; the coordinator enforces branch permissions and review.
- Follow docs/BLACK_TABLE.md and use the custom roles in .codex/agents/.

## First run: establish evidence
- Run `npm ci`, `npm run lint`, `npx prisma generate`, `npx tsc --noEmit`, and `npm run build` (with safely mocked env where necessary).
- Record command, exit status, and first actionable error. Fix reproducible blockers, then rerun all gates.
- Do not assume the repository has a `test` script. QA should add a targeted test runner and CI once the baseline works.
- Verify this order with test data: sign in -> upload XLSX/CSV and PDF -> preview -> generate -> download -> scan QR -> public verification -> revoke -> invalid verification. Include a second tenant and a failed email case.
- Do not infer that 10,000 certificates/month is supported from a feature description. Measure batches, memory, PDF throughput, failures, and cost.

## Release contract
No public release until: clean CI; authorization and tenant-isolation tests; certificate generation/QR/revocation integration tests; error and retry recovery; synthetic 100/1,000-row batch checks; backup and rollback procedure; verified QR domain; secrets review. Label unverified items BLOCKED.

## Known review targets
See docs/BLACK_TABLE.md for current known failures. Verify each against the checked-out commit before editing. 
