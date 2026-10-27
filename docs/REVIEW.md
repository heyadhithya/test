# Independent review

Read-only review completed in a separate agent. Initial blockers included fallback admin authentication, wrong auth origin, public PDF exposure, invalid guest verification, cross-owner email queue updates and unsafe mail fallback.

A second review examined new issuance code and identified retry duplicate handling, issuer email authorization, private-bucket validation, ZIP error handling, digest framing/key stability and concurrent completion. All six were corrected and independently rechecked.

Final reviewer conclusion: no remaining blocker for publishing a review branch with issuance disabled. Production still requires isolated integration/configuration, real database/storage integration and operational capacity proof. This is not a production approval.

A further independent review covered the patched dependency tree, real auth typings, exact-origin redirects, disabled SMTP, conflict-safe Prisma reservation, private-download/registry tests and fresh-schema draft. Fourteen tests, clean lint, typecheck, build and zero-advisory audit are recorded. Final delta review found no new blocker for review-branch publication. The SQL draft remains unapplied and issuance disabled until approved isolated configuration and integration tests.

## Email-link review

Independent security_review inspected NextAuth internals, the new provider, auth route, login UI and tests. Fixed alternate catchall paths bypassing request admission. Reviewer confirmed signed CSRF checks, random token generation, hashed persistence, expiry/identifier checks and single-use consumption. Cleared for review-branch publication with auth disabled, not production activation. Remaining gates: distributed admission, expired token cleanup, approved credentials/sender, real delivery/session tests, synchronous timing disclosure and existing-JWT revocation policy. Browser testing additionally caught disabled-provider navigation; login now checks provider availability and displays the same generic message.

## Distributed auth guard review

Independent reviewer found no authentication bypass and confirmed admission denial exits NextAuth before link-token creation/delivery. Applied review recommendations: explicit ReadCommitted isolation, server statement timeout 2s and lock timeout 500ms, schema-qualified SQL. Reviewed nonblocking advisory lock, conservative shared budgets and cleanup limit100 with SKIP LOCKED. Proposed index remains unapplied; AUTH_GUARDS_READY must remain disabled until approved live database tests verify concurrency, rollback and query plans. No external mutation occurred in this phase.


## Real PostgreSQL validation and approved index application

Independent reviewer inspected the disposable PostgreSQL17.11 evidence and confirmed the single CREATE INDEX changes no tables, grants, policies or user records. Local tests passed before hosted application. Target identity, table columns and existing indexes were rechecked; the index migration succeeded on vvucjlhjrbsxjtdcflwf with bounded lock/statement timeouts. Post-apply metadata confirms valid/ready. No auth activation or hosted data mutation occurred.

## Integration datasource mapping review

Independent review confirms consistent DATABASE_URL/POSTGRES_PRISMA_URL precedence, server-only imports, no public-variable fallback, no direct migration URL use, no logging or environment mutation.30 tests plus lint/typecheck/build pass. Reviewer flagged automatic Git deployment risk following owner linkage; local commit retained until branch publication can avoid deployment and Preview credential exposure.


## Personal password setup and white-theme review

Independent reviewer confirmed no remaining account-creation blocker after explicit8-hour JWT expiry, shared secure setup readiness and canonical-origin fixes. Real PostgreSQL evidence covers atomic consumed-code/account creation, rollback, race/replay denial and no overwrite. Credential CSRF test now asserts actual rejection and successful valid-CSRF session creation. Setup/code/hash contract preserves emailVerified=null and separate issuer authorization. White theme has no handler/auth/license changes; inherited white-on-white headings/inputs were corrected. Release remains local pending setup configuration and authorized publication.
