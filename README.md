# Joinery

Internal web app for a custom joinery business: leads, consultations, designs, scheduling, installs,
payments and QuickBooks sync.

**Stack:** React 19 + TypeScript (strict) + Vite 8 SPA, TanStack Router and Query, Tailwind CSS v4,
Zustand, React Hook Form + Zod 4, Firebase (Firestore, Storage, Functions v2 on Node 24,
Identity Platform) in `northamerica-northeast1`. Built to the
[Lily Pad standard](docs/architecture/lilypad-standard-stack.md); Joinery specifics in
[docs/architecture/stack.md](docs/architecture/stack.md).

## Quick start

```bash
nvm use            # Node 24
corepack enable    # provides the pinned pnpm from package.json
pnpm install --frozen-lockfile && pnpm --dir functions install --frozen-lockfile
cp .env.example .env.local
pnpm run emulators # terminal 1 (needs Java 21)
pnpm run dev       # terminal 2 → http://localhost:5173
```

Or open in a Codespace: `.devcontainer/` installs Node 24, Java 21 and Playwright.

## Checks

```bash
pnpm run lint && pnpm run typecheck && pnpm test   # every change
pnpm run test:rules                                # rules changes
pnpm run test:e2e                                  # UI changes
pnpm run build && pnpm run size                    # 250 KB gzip initial-JS budget
```

## Working with AI agents

`AGENTS.md` holds the instructions for every agent: Claude Code (via `CLAUDE.md`) and Antigravity
CLI read it. Claude Code project settings, a cloud SessionStart hook and the `/new-adr` skill are in
`.claude/`; `.mcp.json` adds the Firebase MCP server (emulators and staging only).

## Docs

Everything is in [docs/](docs/README.md): governance, ADRs, roadmap, active cycle, backlog, specs,
personas, design and runbooks.
