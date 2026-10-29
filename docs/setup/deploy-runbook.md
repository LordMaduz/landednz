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

## Cloud (Stage C — staging live, production not started)

Spec: `docs/superpowers/specs/2026-10-28-r0-polish-and-stage-c-design.md` §4. Plan: `docs/superpowers/plans/2026-10-28-r0-polish-and-stage-c.md`.

### Owner prerequisites (do these first, in order)

Tick each box and paste the value named in **Send back** into a private note for the agent (never into git).
The agent verifies every ticked item from the CLIs before it builds on it.

- [ ] **Domain**: register `landednz.co.nz`, with DNS at the registrar or Cloudflare. **Send back:** the DNS provider and its login method.
- [ ] **Supabase projects** `landednz-staging` and `landednz-prod`, region Sydney (ap-southeast-2), free plan. In each: Settings → Database → Connection pooling → **Session mode** URL.
  **Send back:** per project the session pooler `DATABASE_URL`, project URL, publishable key and secret key.
- [ ] **Render** account (free web service for the staging API, Singapore). Connect the GitHub repo. **Send back:** nothing; the agent adds `render.yaml`.
- [ ] **Railway** Hobby plan (~US$5/mo) for the production API. **Send back:** nothing; run `railway login` (below).
- [ ] **Vercel** account; import the repo with root `apps/web`; set Settings → Git → Production Branch to `production` (the default `main` would put every merge live). **Send back:** the project name.
- [ ] **Google OAuth client** ([google-oauth.md](google-oauth.md)) with both callbacks: `https://<staging-ref>.supabase.co/auth/v1/callback` and `https://<prod-ref>.supabase.co/auth/v1/callback`; Google provider enabled in both Supabase projects.
- [ ] **Anthropic** workspaces `landednz-staging` and `landednz-prod`, one key each, a monthly spend limit on each (suggest US$20 staging, US$50 production). **Send back:** both keys.
- [ ] **OpenAI** key with a monthly spend limit (suggest US$10). **Send back:** the key.
- [ ] **Sentry**: projects `landednz-web` (Next.js) and `landednz-api` (Node). **Send back:** both DSNs and an auth token with `project:releases`.
- [ ] **PostHog** project (US or EU cloud). **Send back:** the project key and host.
- [ ] **GitHub** (Settings → Secrets and variables → Actions), values from the staging Supabase project and the platform URLs:
  secret `STAGING_SUPABASE_SECRET_KEY`; variables `STAGING_WEB_URL`, `STAGING_API_URL`, `PROD_API_URL`, `STAGING_SUPABASE_URL`,
  `STAGING_SUPABASE_ANON_KEY` (the publishable key). The URLs can be added once Task C3 creates the services.
- [ ] **CLI logins** redone on the Mac: `! railway login`, `! supabase login`, `! vercel login`, `! gh auth status`.

### Code already needed (agent)

- [x] Fastify `trustProxy` for the Render/Railway proxy hop, so the per-IP rate limit sees client IPs (plan Task C1). Set `TRUST_PROXY=true` on the API service.

Every env var per platform: [env-staging.md](env-staging.md).

Production deploy steps, DNS records, rollback and the health workflow are written here as Stage C runs.

## Staging (verified 2026-10-29)

| Part | Where | URL |
|---|---|---|
| API | Render free web service `landednz-api-staging` (Singapore, `render.yaml`) | https://landednz-api-staging.onrender.com |
| Web | Vercel project `landednz`, branch alias of `main` (Preview scope) | https://landednz-git-main-lordmaduzs-projects.vercel.app |
| DB + auth | Supabase `landednz-staging` (ref `caksnoejabxbakjijyjz`, Sydney) | `https://caksnoejabxbakjijyjz.supabase.co` |

**Deploy.** Merge to `main`. Render rebuilds the API image and runs `npm run start:deploy` (migrations on start; the free plan has no pre-deploy step).
Vercel builds the web app. Then the `Staging` workflow wakes the API and runs `a11y.spec.ts` and `auth.spec.ts` against the deployed pair.

**Env.** Every variable per platform: [env-staging.md](env-staging.md). Secrets live only in Render, Vercel and GitHub, never in git.

**DNS.** None for staging: it uses the `onrender.com` and `vercel.app` URLs. The custom domain comes with production.

**Cold start.** The free Render service sleeps after 15 min idle; the first request takes up to ~1 min. Hit `/health` first.

**Web access.** The Vercel URL sits behind Deployment Protection: sign in to Vercel in the browser, or send `x-vercel-protection-bypass` (GitHub secret `VERCEL_AUTOMATION_BYPASS_SECRET`) from scripts.

**Full e2e locally against staging.** Export the variables the `Staging` workflow sets (`BASE_URL`, `NEXT_PUBLIC_*`, `SUPABASE_SECRET_KEY`, `VERCEL_AUTOMATION_BYPASS_SECRET`) in the shell, never in a file, then `cd apps/web && npx playwright test`.
`supabase projects api-keys` masks the secret key unless you pass `--reveal`.

**Rollback.**
- API: Render dashboard → `landednz-api-staging` → Events → pick the last good deploy → **Rollback**. A rollback does not undo migrations; a schema change needs a forward migration.
- Web: Vercel dashboard → Deployments → the last good `main` deployment → **Redeploy**.
- Then `git revert` the bad commit on `main`, so the next push does not bring it back.
