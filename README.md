# Sairam Certify

Innovation Ecosystem Certifications. A separate adaptation of public [omn7/Vura](https://github.com/omn7/Vura), source commit `b52339176d97f53f305bb686bb3f76dd853127d1`.

MIT copyright © 2026 Om Narkhede is preserved in LICENSE. No old private project code or credentials were imported.

## Local demo

`npm ci`, `npx prisma generate`, `npm run dev`. No environment credentials are needed for guest generation. Open `/docs` for original demo PDF, XLSX and CSV fixtures; these contain fictional participants and mark outputs DEMO ONLY.

`npm test` runs security/issuance unit tests. `npm run build`, `npx tsc --noEmit`, and `npm run lint` are the full checks. Browser evidence is in `evidence/`; `scripts/browser.cjs` currently uses the environment's Playwright installation and Chromium. This is a local preparation branch, not a production release. See [release gates](docs/RELEASE.md).

## Capability boundary

Guest template positioning, spreadsheet import, preview, PDF/ZIP generation are available. Guest files have no verification QR and are not persisted.

Verified issuance is implemented behind `VERIFIED_ISSUANCE_ENABLED=true`. It requires an isolated Postgres database, private Supabase Storage, approved issuer identities and trusted origin. It reserves stable IDs, uploads privately, then marks records issued. Public lookup discloses only certificate ID, name, course and issue date; PDF download requires issuer ownership. Live integration has not been validated. Keep the gate off until release checks pass.

Legacy admin is disabled. Legacy public registration, API keys, email and other mutation routes must remain disabled (`PERSISTENCE_ENABLED` unset). They are not required for the scoped institutional issuer flow and retain known upstream defects.
