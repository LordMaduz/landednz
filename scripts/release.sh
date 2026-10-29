#!/usr/bin/env bash
# Promote main to production and tag the release: scripts/release.sh <N>
set -euo pipefail

n="${1:-}"
[[ "$n" =~ ^[0-9]+$ ]] || { echo "usage: $0 <N> (non-negative integer, tags r<N>)" >&2; exit 1; }

git fetch origin --tags --quiet
[[ "$(git branch --show-current)" == main ]] || { echo "refusing: not on main" >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "refusing: working tree not clean" >&2; exit 1; }
sha="$(git rev-parse HEAD)"
[[ "$sha" == "$(git rev-parse origin/main)" ]] || { echo "refusing: main differs from origin/main" >&2; exit 1; }
if git rev-parse -q --verify "refs/tags/r$n" >/dev/null; then echo "refusing: tag r$n already exists" >&2; exit 1; fi

result="$(gh run list --workflow staging.yml --commit "$sha" --json status,conclusion \
  --jq '[.[] | select(.status == "completed" and .conclusion == "success")] | length')"
[[ "$result" -gt 0 ]] || { echo "refusing: no successful staging.yml run for $sha (skipped, running, failed or missing)" >&2; exit 1; }

git push origin main:production
git tag "r$n"
git push --tags
