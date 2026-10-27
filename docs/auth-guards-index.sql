-- PROPOSED ONLY. Not applied. Required before AUTH_GUARDS_READY=true.
-- One index on existing table, no new tables/grants/policies or user records.
CREATE INDEX "VerificationToken_expires_token_idx" ON public."VerificationToken" (expires, token);
