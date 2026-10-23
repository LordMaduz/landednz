# Deploy runbook

## Local (Stage A — verified)

Everything that ships can be checked on a Mac before any cloud account is touched.

| Check | Command | Expect |
|---|---|---|
| Stack up | `make dev` | `localhost:3001/health` → `"dbConnected":true`; `localhost:3000` → 200 |
| Everything CI runs before e2e | `make check` | typecheck, lint, API + web unit tests, both builds green |
| Sign-in journey | `make test-e2e` | 1 passed |
| Production API container | `make docker-api` | `localhost:3001/health` → 200; `supabase stop` → 503 "Database unreachable" |
| Vercel build | `cd apps/web && npx vercel build` | Needs `vercel login` even for a local build; deferred to Stage C |

Database: `make db-reset` (mock embeddings) or `make db-reset-live` (real embeddings) runs `prisma migrate deploy`, seeds the knowledge base and creates the ivfflat index after the embeddings load (C05). Re-running bootstrap on a populated DB is safe: no duplicates, no second index.

## Cloud (Stage C — not started)

Owner prerequisites (spec §5.6), in order:

- [ ] Register `landednz.co.nz`
- [ ] Supabase projects `landednz-staging` and `landednz-prod` (Sydney); session-mode pooler URLs for `DATABASE_URL`
- [ ] Render account (staging API, Singapore) and Railway Hobby (production API)
- [ ] Vercel project for `apps/web` (staging + production domains)
- [ ] Google OAuth client with both Supabase callback URLs ([google-oauth.md](google-oauth.md))
- [ ] Anthropic workspaces `landednz-staging` / `landednz-prod` with keys and spend limits; OpenAI key with a spend limit
- [ ] Sentry (web + API projects) and PostHog
- [ ] `railway` and `supabase` CLI logins redone
- [ ] Set Fastify `trustProxy` for the Render/Railway proxy hop, so the per-IP rate limit sees client IPs (Task 6 note)

Deploy steps, DNS records and the health workflow are written here during Stage C.
