# Deployment

How LandedNZ is built, released and run. Each statement says whether it comes from configuration in this repository or was observed on the live service. Secrets are never in git; they live in each platform's settings.

## Topology

| Part | Platform | Evidence |
|---|---|---|
| Web (`apps/web`) | Vercel | Config in the Vercel project (not in this repo); `https://landednz.co.nz` answered HTTP 200 on 2026-11-02 |
| API (`apps/api`) | Railway, Docker image built from `apps/api/Dockerfile` | `.railway/railway.ts` (production service, health check `/health`, migrations before each deploy); the API's `/health` reported `status: ok, dbConnected: true` on 2026-11-02 |
| Database and auth | Supabase (PostgreSQL with pgvector, Google sign-in) | `supabase/config.toml` for local; hosted project settings are not in this repo |
| Staging API | Render | `render.yaml` (free plan, Singapore, deploys `main`) |
| Errors and analytics | Sentry, PostHog | Each is off while its key is empty |

## Environments

| | Local | CI | Staging | Production |
|---|---|---|---|---|
| `AI_MODE` | `mock` (default in the example) | `mock` | `live` | `live` |
| Model | `claude-haiku-5-5` | none | `claude-sonnet-5-5` | `claude-sonnet-5-5` |
| Sign-in | Password and Google | Password | Password and Google | Google only |
| Content | `CONTENT_ALLOW_UNVERIFIED` allowed | allowed | verified only | verified only |

## Release flow

1. Merge to `main`. CI (`.github/workflows/ci.yml`) runs on every pull request and push; the `Staging` workflow (`staging.yml`) runs on `main`.
2. When `Staging` has passed for a commit, `scripts/release.sh vX.Y.Z` fast-forwards the `production` branch to `main` and pushes an annotated SemVer tag. It refuses to run if the tree is dirty, `main` differs from `origin/main`, the tag exists, or there is no successful staging run for that commit.
3. Railway deploys the API from `production`; Vercel deploys the web app from `production`. After each content deploy, call `POST /admin/recalculate` (needs `ADMIN_API_KEY`) to reconcile existing roadmaps.
4. The `Health` workflow (`health.yml`) checks the service every six hours.

Tags so far: `v1.0.0`, `v1.1.0`, `v1.2.0`.

## Configuration

Variables are documented next to where they are read:

- API: [`apps/api/.env.example`](../apps/api/.env.example), validated at start-up by `apps/api/src/shared/config.ts` (the process exits if a required one is missing)
- Web: [`apps/web/.env.example`](../apps/web/.env.example)
- Local Supabase: [`supabase/.env.example`](../supabase/.env.example)

The Supabase keys in the examples are the Supabase CLI's local defaults, which are the same on every machine and are not secrets.

## Rollback

- **API:** redeploy the last good deployment in Railway. A rollback does not undo migrations; fix a bad schema change with a forward migration.
- **Web:** redeploy the last good deployment in Vercel.
- Then revert the bad commit on `main` so the next release does not bring it back.

## Not verified here

The Vercel production-branch setting, DNS records, and the Railway and Render dashboards are configured outside this repository and were not inspected. This page will be wrong if they changed.
