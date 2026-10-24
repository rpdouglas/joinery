---

name: new-adr
description: Draft a new Architecture Decision Record for Joinery. Use when a task needs a new dependency, Firebase service, integration, or an exception to docs/architecture/stack.md, or when the user asks for an ADR.
---

# Draft an ADR

1. Read `docs/adr/README.md` for the index and the next free number. Check the "Planned" table:
   if the decision is already listed there, use that title and group.
2. Copy `docs/adr/0000-template.md` to `docs/adr/NNNN-kebab-title.md` (four-digit number).
3. Fill it in:
   - **Status:** `Proposed`. Never mark an ADR Accepted yourself; the owner does that.
   - **Context:** the forces, quoting the relevant line of `docs/architecture/stack.md` and specs.
   - **Options:** at least two real options, including "do nothing / defer" where it is viable.
   - **Decision:** the recommendation and the exact versions to pin (check `npm view <pkg> version`).
   - **Consequences:** bundle-size impact, data residency, security rules, tests to add, rollback.
   - **Verification:** the commands or spikes that will prove it before acceptance.
4. Add a row to the index table in `docs/adr/README.md` and remove it from "Planned" if listed.
5. Do not install the dependency or write the feature in the same change. Stop and ask for review.
