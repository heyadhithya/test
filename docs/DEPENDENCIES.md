# Dependency remediation — 27 October 2026

The initial upstream tree had 44 audit findings, including five critical package entries. The final full dependency audit reports zero advisories, including development dependencies. This is a dated tool result, not a guarantee against all vulnerabilities.

- Next.js and matching eslint-config-next: 16.4.3 ([official release](https://github.com/vercel/next.js/releases/tag/v16.4.3)). Next's exposed App Router made its denial-of-service advisories release blockers; platform-specific image/Windows reports were not treated as proven exploits of this deployment.
- NextAuth: 4.24.15; Prisma adapter: 2.11.3 with Auth core 0.41.3. Real library declarations replace upstream `any` module stubs. Exact-origin redirects are regression-tested.
- DOMPurify: 3.4.17; Zod: 4.6.7. Patched despite vulnerable feature modes not being exercised by inspected callers.
- SheetJS: pinned official 0.20.3 tarball with lockfile integrity. Its maintainer's [installation documentation](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/) identifies the official CDN as authoritative; npm's 0.18.5 is stale/vulnerable. Spreadsheet parsing is production-reachable, so this fix was required.
- SMTP implementation and unused Nodemailer dependency removed. Email/reset delivery now explicitly throws unavailable, without mocks, logs, or outbound sends. This avoids forcing a newer SMTP major into Auth's incompatible optional peer range.
- Prisma/client remain matching stable 6.19.3. No adoption of the latest 8.0 release candidate. A scoped `@prisma/config` override pins deepmerge-ts 8.0.2. [Version 8 changes Map merging](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0); the application uses the default schema configuration, not custom Map merge configuration. Prisma generation, offline schema diff, typecheck and production build validate this use. Reassess/remove the override when upstream Prisma ships the fix.
- Compatible transitive dependency updates resolved remaining Babel/ESLint/parser toolchain findings. No `npm audit fix --force`, blanket lint disabling, or security advisory suppression was used.

Run `npm ci`, `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm audit` to reproduce. Browser proof uses the environment's Playwright/Chromium installation and the production Next server. The repository's original unpublished/private projects were not inputs to remediation.
