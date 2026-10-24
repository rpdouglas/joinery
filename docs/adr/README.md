# Architecture Decision Records

One decision per file, numbered in order. Copy `0000-template.md` (or run `/new-adr` in Claude Code).
Agents draft ADRs as **Proposed**; only the owner marks them Accepted. Nothing tagged ADR in
`docs/architecture/stack.md` is installed until its ADR is accepted.

## Index

| #                                       | Title                                                                         | Status           | Needed before                 |
| --------------------------------------- | ----------------------------------------------------------------------------- | ---------------- | ----------------------------- |
| [0001](0001-region-and-projects.md)     | Data region (Montréal) and project creation                                   | Proposed         | Creating any Firebase project |
| [0002](0002-runtime-pins.md)            | React, TypeScript, Vite and Node pins                                         | Proposed         | Merging the scaffold          |
| [0003](0003-identity.md)                | Identity: invite-only sign-in, roles, trade-partner links, installer `visits` | Proposed (draft) | Any sign-in or rules work     |
| [0004](0004-delivery-and-exceptions.md) | Delivery: staging, WIF, GA4, Sentry, offline, Biome class sorting             | Proposed         | First deploy                  |

## Planned (stack §8, in build order)

| Group | ADR to write                                                          | Trigger              |
| ----- | --------------------------------------------------------------------- | -------------------- |
| 5     | UI primitives (React Aria Components vs Base UI)                      | Before UI work       |
| 5     | English and French text (Lingui vs react-i18next; Zod `frCA`; `Intl`) | Before UI work       |
| 5     | Fonts (self-hosted Bitter, Karla, IBM Plex Mono)                      | Before UI work       |
| 5     | Data tables (TanStack Table v9; Virtual for long lists)               | Before UI work       |
| 6     | PDF generation (pdfmake in a Function, one-day spike)                 | Before payment terms |
| 6     | Email provider                                                        | Before notifications |
| 6     | Dates (date-fns v4 behind `lib/dates`)                                | Before scheduling    |
| 6     | Timeline display (SVAR Gantt vs custom SVG + list view)               | Before scheduling    |
| 6     | Scheduling engine (in-house, property-tested)                         | Before scheduling    |
| 6     | Money (integer cents, 50/40/10, per-line HST)                         | Before payment terms |
| 7     | QuickBooks client                                                     | Before integrations  |
| 7     | AI hosting (Anthropic API vs Claude on Vertex AI)                     | Before AI features   |
| 7     | 2020 Order Form parser                                                | Before integrations  |
| 7     | Photo pipeline (originals, HEIC to JPEG, thumbnails)                  | Before photos        |
| 7     | Duplicate detection (match keys, libphonenumber-js)                   | Before lead intake   |
| 7     | Reports (scheduled rollups, `count()`)                                | Before reports       |
