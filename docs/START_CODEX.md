# Start the Framilton Codex council

1. Check out the branch containing this harness, then start Codex at the repository root.
2. Read `AGENTS.md` and `docs/BLACK_TABLE.md`.
3. In Codex, paste the "First Codex task" block from `docs/BLACK_TABLE.md`.
4. Use `/subagents` to inspect individual agent threads. Review changes before merging or deploying.

Example commands (with this branch installed locally):

```bash
git clone https://github.com/heyadhithya/test.git
cd test
git fetch origin chore/black-table-agent-harness
git checkout -b chore/black-table-agent-harness origin/chore/black-table-agent-harness
codex
```

Codex may ignore repository-level `.codex/config.toml` until you mark the repository trusted. Agent models depend on account availability. If GPT-6.1 Sol is unavailable, use a supported available model and keep independent security/release review. Never add API keys to Git.

This branch only installs instructions and agent-role configuration. It does not repair application defects, run tests, connect Supabase, or deploy to Vercel.
