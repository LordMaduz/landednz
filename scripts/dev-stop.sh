#!/usr/bin/env bash
# Stops what dev-all.sh started: API + web process groups, then Supabase (data kept).
set -uo pipefail
cd "$(dirname "$0")/.."

for app in api web; do
  f=.dev/$app.pid
  [[ -f $f ]] || continue
  kill -- -"$(cat "$f")" 2>/dev/null && echo "stopped $app"
  rm -f "$f"
done
supabase stop
