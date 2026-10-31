#!/usr/bin/env bash
# Promote main to production and tag the release: scripts/release.sh vX.Y.Z (SemVer)
set -euo pipefail

v="${1:-}"
[[ "$v" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "usage: $0 vX.Y.Z (e.g. v1.0.1)" >&2; exit 1; }

git fetch origin --tags --quiet
[[ "$(git branch --show-current)" == main ]] || { echo "refusing: not on main" >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "refusing: working tree not clean" >&2; exit 1; }
sha="$(git rev-parse HEAD)"
[[ "$sha" == "$(git rev-parse origin/main)" ]] || { echo "refusing: main differs from origin/main" >&2; exit 1; }
if git rev-parse -q --verify "refs/tags/$v" >/dev/null; then echo "refusing: tag $v already exists" >&2; exit 1; fi

result="$(gh run list --workflow staging.yml --commit "$sha" --json status,conclusion \
  --jq '[.[] | select(.status == "completed" and .conclusion == "success")] | length')"
[[ "$result" -gt 0 ]] || { echo "refusing: no successful staging.yml run for $sha (skipped, running, failed or missing)" >&2; exit 1; }

git push origin main:production
git tag -a "$v" -m "LandedNZ $v"
git push origin "$v"
