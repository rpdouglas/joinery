# 0002. React, TypeScript, Vite and Node pins

- **Status:** Proposed
- **Date:** 2026-10-24
- **Stack reference:** `docs/architecture/stack.md` §3, §5

## Context

The stack asks for React 19.x, TypeScript strict, a Vite SPA and Node 24 Functions, with versions
confirmed at scaffold. Versions below were installed and checked on 2026-10-24.

## Decision

| Package                                | Pin                 | Note                                                              |
| -------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| react, react-dom                       | 19.3.1              |                                                                   |
| vite                                   | 8.3.5               | Rolldown + Oxc; `@vitejs/plugin-react` 6.1.2 needs Vite 8         |
| typescript                             | 7.0.2               | Native compiler; `tsc -b` works with the project references used  |
| tailwindcss, @tailwindcss/vite         | 4.3.3               |                                                                   |
| @tanstack/react-router / router-plugin | 1.170.46 / 1.168.48 | `routeTree.gen.ts` is committed so `tsc` runs before `vite build` |
| firebase (web)                         | 13.1.0              |                                                                   |
| firebase-functions / firebase-admin    | 7.4.0 / 14.5.0      |                                                                   |
| Functions runtime                      | `nodejs24`          | `.nvmrc`, devcontainer and CI also use Node 24                    |
| zod                                    | 4.6.7               | Shared app and Functions                                          |
| @hookform/resolvers                    | 5.9.2               | 6.0.0 fails npm peer resolution                                   |

All versions are exact (`.npmrc` `save-exact`). Renovate waits 14 days after a release and asks
before majors.

**Functions bundling:** `firebase deploy` uploads only `functions/`, so it is bundled with esbuild
(`functions/build.mjs`) to inline `shared/`. Runtime dependencies stay external.

## Consequences

If a tool proves incompatible with TypeScript 7, fall back to 6.0.x in this ADR, not ad hoc.

## Verification

`npm run typecheck && npm test && npm run build && npm run size` (passing on 2026-10-24). A Node 24
deploy is confirmed under ADR 0001.
