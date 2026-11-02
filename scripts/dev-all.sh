#!/usr/bin/env bash
# One-command local stack: Supabase → bootstrap if the DB is empty → API + web in the background.
set -euo pipefail
cd "$(dirname "$0")/.."

for f in apps/api/.env.local apps/web/.env.local; do
  [[ -f $f ]] || { echo "Missing $f — copy ${f%.local}.example and fill it in" >&2; exit 1; }
done
# Without it Google rejects the code exchange (invalid_client) and sign-in silently lands on /.
grep -qs '^SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=.' supabase/.env ||
  { echo "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET not set in supabase/.env, Google sign-in would fail (see supabase/.env.example)" >&2; exit 1; }

# A leftover dev server (often a Ctrl-Z'd `make dev`) holds the port and would answer nothing.
for port in 3000 3001; do
  lsof -ti tcp:$port -sTCP:LISTEN >/dev/null && { echo "Port $port already in use: run make stop first" >&2; exit 1; }
done

supabase start
npm run prisma:generate -w @landednz/api

# Fails before the first migration (no "KnowledgeBaseChunk" table) — treated as empty.
count=$(docker exec supabase_db_landednz psql -U postgres -tAc 'SELECT count(*) FROM "KnowledgeBaseChunk"' 2>/dev/null || echo 0)
if [[ $count == 0 ]]; then
  npm run db:bootstrap -w @landednz/api
fi

# Detached so the terminal comes back; `make stop` kills them by port, `make logs` follows them.
mkdir -p .dev
nohup npm run dev -w @landednz/api >.dev/api.log 2>&1 &
nohup npm run dev -w @landednz/web >.dev/web.log 2>&1 &

for target in api:http://localhost:3001/health web:http://localhost:3000; do
  name=${target%%:*} url=${target#*:}
  for _ in $(seq 120); do
    curl -m 2 -so /dev/null "$url" && break
    sleep 1
  done
  curl -m 2 -so /dev/null "$url" || { echo "$name did not start, last log lines:" >&2; tail -20 ".dev/$name.log" >&2; exit 1; }
  echo "$name up: $url"
done
echo "Logs: make logs  ·  Stop: make stop"
