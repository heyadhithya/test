-- Applied 2026-10-27 to vvucjlhjrbsxjtdcflwf only, after disposable PostgreSQL17.11 tests.
-- Migration: sairam_auth_token_cleanup_index. Auth remains disabled.
BEGIN;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '30s';
CREATE INDEX "VerificationToken_expires_token_idx" ON public."VerificationToken" (expires, token);
COMMIT;
