# Governance

How work moves through this repo. Standards: `architecture/lilypad-standard-stack.md` (Lily Pad,
all projects) and `architecture/stack.md` (Joinery). Where they differ, an ADR says why.

## Flow: plan → execute → close

1. **Plan.** Items start in `BACKLOG.md`. Before a cycle, pull items into `ACTIVE_CYCLE.md` with an
   owner. Feature work needs a spec in `projects/`; anything not in the standards needs an ADR in
   `adr/` (status Proposed) first.
2. **Execute.** Work on a feature branch, one concern per PR. Agents may change code and tests on
   branches; security-sensitive changes (rules, IAM, secrets, workflows) are flagged for human review
   and covered by CODEOWNERS.
3. **Close.** The PR passes "CI passed", updates the spec and docs it affects, and ticks its item in
   `ACTIVE_CYCLE.md`. Anything learned that differs from the plan (drift) is written down: in the
   spec, an ADR amendment, or a backlog item. Nothing stays only in a chat log.

## Decisions

- Only the owner marks an ADR Accepted. Agents draft ADRs as Proposed.
- Exceptions to the Lily Pad standard are ADRs, named as exceptions, with an end date where possible.
- Reviews (`reviews/`) are dated snapshots; they are not updated after the fact.

## Rules every change follows

- Every collection ships with an access rule and a test proving denial.
- UI and rules agree on role boundaries; `personas/` records what each role may read and write.
- UI changes are checked against `design/`.
- Definition of done: see `AGENTS.md`.
