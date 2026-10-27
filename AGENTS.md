# Sairam Certify agent working rules

This repository is the user's Sairam Innovation Ecosystem certificate pilot, not the separate Framilton platform. The release branch is rebrand/sairam-ecosystem; the target Vercel project and Supabase IDs are in docs/PILOT.md. Do not write to other projects.

## Convert normal speech into actionable specifications
For each casual request, silently draft: objective, user workflow, acceptance criteria, affected files, risks, test evidence and rollback. Resolve obvious details from the repository; ask only a blocker the tools cannot answer. Never respond with a prompt alone when implementation is authorized and tools are present.

## Engineering sequence
1. Read relevant source and current deployment logs. Confirm current branch, project and active environment.
2. Reproduce a defect with a failing test or clear trace. Distinguish observed faults from hypotheses.
3. Make the smallest safe fix. Preserve existing functionality, keep a feature branch and use PRs.
4. Run npm run lint, npm test, npx tsc --noEmit and npm run build. Provide exact output; never invent green checks.
5. For user-facing flows, test browser on desktop and mobile. Never claim sign-in, QR, delivery or storage works without live integration evidence.

## Security and deployment
- No hardcoded credentials, test passwords or NEXT_PUBLIC service secrets.
- Guest PDFs must remain unverified and carry no authenticity QR.
- Only approved signed-in issuers may create verified certificates; storage must be private, verification read-only and revocation honored.
- Keep email delivery and legacy APIs disabled until reviewed.
- Do not reset databases, delete storage, change paid plans, deploy to production or run destructive migrations as a side effect of fixing UI.
- Use preview deployments, then promote only after verified production gates. Never merge broken builds.
- Maintain upstream attribution for the original MIT-licensed Vura project.

## Design rules
White (#FFF), deep blue (#163F57) for contrast, warm brass (#B88743) as restrained accent, warm ivory (#F8F5EE) for background sections. Consistent spacing, semantic headings, accessible contrast, keyboard navigation, mobile layout. No fake testimonials, unverified claims, noisy gradients, gratuitous motion, or 3D stock art. The first screen should explain Excel + PDF -> generated certificates within seconds of reading.

## Communication
Apply Stop Slop and ADHD-friendly formatting: lead with result or next action, at most five numbered actionable steps per group, no filler, evidence first. State current task status and one blocker if relevant.
