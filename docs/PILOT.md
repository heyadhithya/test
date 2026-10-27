# Sairam certificate pilot

## Operating target
- Public URL: https://sairam-ecosystem-certifications.vercel.app
- Vercel project: sairam-ecosystem-certifications
- Database: isolated Supabase project vvucjlhjrbsxjtdcflwf (Mumbai)
- Repository: heyadhithya/test, release source rebrand/sairam-ecosystem
- Design: white background, deep slate-blue actions (#163F57), warm brass accent (#B88743), restrained typography; no fake customer claims.
- Guest mode: upload PDF + spreadsheet, preview, download PDFs/ZIP, no QR or credential record.
- Issuer mode: password-protected pilot account, private Supabase bucket, database-backed QR and public verification. Disabled until authenticated live tests pass.
- Original feature-rich editor remains at /app/advanced.

## Secrets and configuration
Production Vercel environment variables:
- NEXTAUTH_URL: fixed HTTPS production domain
- NEXTAUTH_SECRET: randomly generated, 32+ characters, keep stable
- AUTH_EMAIL_ALLOWLIST: approved owner's email (existing)
- AUTH_GUARDS_READY=true: only after indexed Postgres auth admission check passes
- PILOT_PASSWORD_SHA256: SHA-256 hex of a randomly generated **30+ character** pilot passphrase; no plaintext password in source, database, or Vercel
- PILOT_ENABLED=true: enables one owner-only credentials provider
- POSTGRES_PRISMA_URL: Supabase integration-managed pooled connection string (fallback if DATABASE_URL absent)
- SUPABASE_URL: project HTTPS URL
- SUPABASE_SERVICE_ROLE_KEY: secret server-only storage key
- SUPABASE_PRIVATE_BUCKET=certificates-private: private PDF-only bucket
- ISSUANCE_ID_SECRET: stable random 32+ character secret (changing it changes deterministic IDs)
- VERIFIED_ISSUANCE_ENABLED=true and PILOT_ISSUANCE_ENABLED=true: set only after live issuer, PDF upload, QR verification, revocation and access-denial tests pass

The old APIs remain disabled by proxy.ts. Do NOT set PERSISTENCE_ENABLED=true to bypass them.
Store all secrets in Vercel environment variables, never NEXT_PUBLIC.
As soon as verified institutional email authentication is ready, remove pilot access and rotate the pilot passphrase.

## Manual release gates (real service tests)
1. Confirm Vercel project and Supabase ID match the above. Avoid other Sairam/Framilton projects.
2. Run npm ci, npm run lint, npm test, npx tsc --noEmit, npm run build. Preview deployment must be READY.
3. Sign in with allowlisted email and private pilot passphrase. Confirm wrong passwords do not authenticate, and signout terminates session.
4. Issue one synthetic record using the provided template and spreadsheet. Download PDF with issuer session. Scan QR and confirm correct person, event, date, and active status in the public registry. Test 404 invalid ID and 403 revoked ID.
5. Confirm unauthenticated users cannot download a private PDF. Test guest flow separately: preview, PDF, ZIP, and no verification QR. Check on mobile.
6. Check Supabase storage bucket stays private, no client service-role key leaks, storage/DB failures remain unverified, and Vercel production logs show no server exceptions.

This pilot assumes light personal usage, not thousands of simultaneous certificate issues. Uploads over Vercel's request size limit and synchronous large batches require an architecture change. Do not claim a full 5,000-row batch works in one request.
