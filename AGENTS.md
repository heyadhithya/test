# Sairam Certify instructions for coding agents

Project: Sairam Innovation Ecosystem Certifications. GitHub heyadhithya/test. Active production branch rebrand/sairam-ecosystem. Vercel project sairam-ecosystem-certifications. Supabase project vvucjlhjrbsxjtdcflwf. Do not touch other project variants or Framilton.

## Self-prompting
Turn casual user requests into an internal implementation spec before coding: objective, impacted user journey, acceptance criteria, repo files to inspect, threat model, tests and rollback. Infer routine answers from the code and evidence. Clarify only an actual blocker. Implement when requested; avoid returning only a grand prompt.

## Release process
1. Inspect latest production branch and deployment logs. Someone else may be committing concurrently. Never overwrite a newer branch head; use expected SHA.
2. Reproduce bugs in tests or logs. Name assumptions and distinguish confirmed issues from potential risk.
3. Work on a feature branch. Keep production and database untouched until review. Preserve working advanced editor and owner-setup/login.
4. Run npm ci, npm run lint, npm test, npx tsc --noEmit, npm run build. Obtain independent review and browser smoke test on mobile and desktop.
5. Deploy preview and test the actual owner auth, guest PDF preview/ZIP, persisted QR, revocation and issuer private download before promoting production.

## Security
- The current password pilot uses one-time owner setup. Do not replace it with a hard-coded password or a second auth system.
- Do not infer the owner address, reveal env secrets, or auto-approve a User ID from email alone.
- Guest PDFs must contain no verification QR; only persisted issued nonrevoked records may verify.
- Keep issuance behind VERIFIED_ISSUANCE_ENABLED and immutable ISSUER_USER_IDS.
- Do not enable legacy APIs or email delivery. No credentials in NEXT_PUBLIC variables.
- Do not modify paid plans, drop/alter tables, delete storage or migrate production without explicit approval.
- Preserve MIT attribution to omn7/Vura.

## Visual language
Default to white (#fff), deep navy (#163F57), restrained warm brass (#B88743), ivory (#F8F5EE), high-contrast text, natural spacing. No stock hero photos, glowing effects, fake numbers, invented testimonials or unnecessary animation. Landing should lead to /app/simple; keep advanced workflow at /app.

## Response format
Follow Stop Slop and ADHD-friendly style: next action first, concise numbered steps, progress visible, no fake scores or motivational filler. Report tested outcomes and blockers.
