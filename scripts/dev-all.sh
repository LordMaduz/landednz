#!/usr/bin/env bash
# One-command local stack: Supabase → bootstrap if the DB is empty → API + web. Ctrl-C stops both.
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

trap 'kill 0' EXIT
npm run dev -w @landednz/api &
npm run dev -w @landednz/web &
wait
