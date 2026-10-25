# 0005. Branch protection: solo-developer exception

- **Status:** Proposed
- **Date:** 2026-10-25
- **Deciders:** Owner (@rpdouglas), Lily Pad
- **Exception to:** Lily Pad standard §7 ("1 human approval" on PRs to `main`)
- **Review by:** 2027-01-31, or as soon as a second Lily Pad developer works on Joinery

## Context

The standard requires PRs to `main` with no direct pushes, required checks, an up-to-date branch,
**one human approval**, and CODEOWNERS review on rules, indexes, workflows and IAM config. Today one
person authors (with Claude Code) and merges every PR. GitHub does not let a PR's author approve
their own PR, so a required approval would block all work.

## Options

1. **Add a second Lily Pad reviewer.** Meets the standard; nobody is available yet.
2. **Solo exception:** keep every other protection, require zero approvals for now.
3. **No branch protection.** Rejected: direct pushes (including by agents) would bypass CI.

## Decision

Option 2, time-boxed. On `main`:

- Require a pull request; block direct pushes and force-pushes, for admins and agents too.
- Require the **"CI passed"** status check, and require branches to be up to date before merging.
- Require **0** approvals. CODEOWNERS stays in place so ownership is visible, but "require review
  from code owners" is off while there is only one owner.
- Require conversation resolution before merging.

Compensating controls while the exception lasts:

- Security-sensitive changes (rules, indexes, IAM, secrets config, workflows) are called out in the
  PR description under **"Human review"**, and the owner reviews the diff before merging; agents flag
  them (AGENTS.md guardrail 16).
- Claude Code review (`/code-review` or `/security-review`) runs on those PRs before merge.

## Consequences

- One person can merge unreviewed code; CI, the PR record and the self-review checklist are the
  safeguards. The risk is accepted for a pre-pilot internal app with no production data.
- **Ends** when a second developer joins or at the review date: set approvals to 1 and turn on
  code-owner review, then mark this ADR Superseded.

## Verification

Branch protection settings on `main` match the list above (screenshot or settings export linked in
the PR that accepts this ADR). A direct push to `main` is rejected.
