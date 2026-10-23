#!/usr/bin/env bash
# One-command local stack: Supabase → bootstrap if the DB is empty → API + web in the background.
# Logs and pids live in .dev/; `make stop` (scripts/dev-stop.sh) stops everything.
set -euo pipefail
cd "$(dirname "$0")/.."

for f in apps/api/.env.local apps/web/.env.local; do
  [[ -f $f ]] || { echo "Missing $f — copy ${f%.local}.example and fill it in" >&2; exit 1; }
done

supabase start
npm run prisma:generate -w @landednz/api

# Fails before the first migration (no "Task" table) — treated as empty.
count=$(docker exec supabase_db_landednz psql -U postgres -tAc 'SELECT count(*) FROM "Task"' 2>/dev/null || echo 0)
if [[ $count == 0 ]]; then
  npm run db:bootstrap -w @landednz/api
fi

mkdir -p .dev
set -m # each background job gets its own process group, so dev-stop.sh can kill npm and its children together
for app in api web; do
  if [[ -f .dev/$app.pid ]] && kill -0 "$(cat .dev/$app.pid)" 2>/dev/null; then
    echo "$app already running (pid $(cat .dev/$app.pid))"
    continue
  fi
  nohup npm run dev -w @landednz/$app > .dev/$app.log 2>&1 < /dev/null &
  echo $! > .dev/$app.pid
done

wait_for() { # name url
  for _ in $(seq 120); do
    curl -sf -o /dev/null "$2" && { echo "$1 up: $2"; return; }
    kill -0 "$(cat .dev/$1.pid)" 2>/dev/null || break
    sleep 1
  done
  echo "$1 did not come up — last log lines:" >&2
  tail -20 .dev/$1.log >&2
  exit 1
}
wait_for api http://localhost:3001/health
wait_for web http://localhost:3000
echo "Logs: tail -f .dev/api.log .dev/web.log   Stop: make stop"
