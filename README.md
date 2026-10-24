# Joinery

Internal web app for a custom joinery business: leads, consultations, designs, scheduling, installs,
payments and QuickBooks sync.

**Stack:** React 19 + TypeScript (strict) + Vite 8 SPA, TanStack Router and Query, Tailwind CSS v4,
Zustand, React Hook Form + Zod 4, Firebase (Firestore, Storage, Functions v2 on Node 24,
Identity Platform) in `northamerica-northeast1`. Details: [docs/architecture/stack.md](docs/architecture/stack.md).

## Quick start

```bash
nvm use            # Node 24 (22.12+ works for the app)
npm ci
cp .env.example .env.local
npm run emulators  # terminal 1 (needs Java 21)
npm run dev        # terminal 2 → http://localhost:5173
```

Or open in a Codespace: `.devcontainer/` installs Node 24, Java 21 and Playwright.

## Checks

```bash
npm run lint && npm run typecheck && npm test   # every change
npm run test:rules                              # rules changes
npm run test:e2e                                # UI changes
npm run build && npm run size                   # 250 KB gzip initial-JS budget
```

## Working with AI agents

`AGENTS.md` holds the shared instructions for every agent. `CLAUDE.md` (Claude Code) and
`GEMINI.md` import it. Claude Code project settings, a cloud SessionStart hook and the `/new-adr`
skill are in `.claude/`.

## Docs

Everything is in [docs/](docs/README.md): ADRs, roadmap, active cycle, backlog, specs, runbooks.
