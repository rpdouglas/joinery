#!/usr/bin/env bash
# Decides whether a change touches code or only docs, for CI job gating.
# Usage: scripts/ci-changes.sh <base-sha> <head-sha>
# Prints the changed files and `code=true|false`; appends the same to $GITHUB_OUTPUT when set.
# Anything not matched below counts as code, so new kinds of files run the full suite by default.
set -euo pipefail

base="${1:-}"
head="${2:-HEAD}"
out="${GITHUB_OUTPUT:-/dev/null}"

# No usable base (first push of a branch, force-push, shallow history): run everything.
if [[ -z "$base" || "$base" =~ ^0+$ ]] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  echo "No usable base commit; treating as code."
  echo "code=true" | tee -a "$out"
  exit 0
fi

code=false
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  echo "$file"
  case "$file" in
    docs/* | *.md | .claude/* | .github/pull_request_template.md | .github/CODEOWNERS) ;;
    *) code=true ;;
  esac
done < <(git diff --name-only "${base}...${head}")

echo "code=$code" | tee -a "$out"
