@AGENTS.md

## Claude Code notes

- Project settings are in `.claude/settings.json`; personal overrides go in `.claude/settings.local.json` (git-ignored).
- In cloud sessions the SessionStart hook runs `npm ci` so tests and lint work immediately.
- `/new-adr <title>` drafts an ADR from the template and adds it to the index.
- Before saying a task is done, run the Definition of done commands above and report the results.
