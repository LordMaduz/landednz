# LandedNZ

A personalised settlement roadmap and AI assistant for skilled migrants in their first 90 days in New Zealand.

**Status:** R0 rebuild, Stage A (local foundation). Runs locally only; nothing is deployed yet. The web app has working sign-in, with placeholder pages until the design boards are approved (Stage B).

## Run it locally

Prerequisites: Node 24 (see `.nvmrc`), Docker (running), the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) and `make`. No API keys are needed: `AI_MODE=mock` (the default in `.env.example`) gives deterministic chat replies and embeddings.

```sh
make setup        # npm ci, Prisma client, Playwright browser, .env.local files from .env.example
make dev          # Supabase → seed DB if empty → API on :3001 → web on :3000 (returns once both answer; logs in .dev/)
```

`make dev` takes about 30 seconds on a warm Docker. Check it at <http://localhost:3001/health> (`"dbConnected":true`) and <http://localhost:3000>.

To sign in, create a local user (there is no sign-up page yet), then open <http://localhost:3000/signin>:

```sh
make user EMAIL=you@example.com PASSWORD=choose-a-password
```

Local Supabase also serves Studio at <http://127.0.0.1:54323> and the email inbox at <http://127.0.0.1:54324>.

## Everyday commands

Run `make` to list every target.

| Command | What it does |
|---|---|
| `make check` | Typecheck, lint, unit tests (API + web) and builds: what CI runs before e2e |
| `make test` | API + web unit tests (Supabase must be running) |
| `make test-e2e` | Playwright sign-in journey; starts the API and web if they are not up |
| `make docker-api` | The production API container on :3001 against local Supabase |
| `make db-reset` | Wipe the local DB and seed it again |
| `make db-reset-live` | Same, with real OpenAI embeddings (needs `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in `apps/api/.env.local`) |
| `make stop` | Stop API, web and Supabase (data is kept) |

For real Claude replies, set `AI_MODE=live`, `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in `apps/api/.env.local`.

## Repository

| Path | What |
|---|---|
| `apps/api` | Fastify 5 API, Prisma 7 on Postgres + pgvector, Claude chat over SSE, RAG over the knowledge base in `content/kb-master.md` |
| `apps/web` | Next 16 app: Supabase sign-in, route guard (`src/proxy.ts`), shadcn/ui |
| `packages/types` | Types shared by the API and web |
| `supabase/` | Local stack config (Postgres, auth, Studio, email inbox) |
| `scripts/dev-all.sh` | What `make dev` runs |
| `docs/superpowers/` | Specs and implementation plans; the R0 spec is the source of truth for this rebuild |
| `.github/workflows/ci.yml` | CI: the full local stack inside the job, then typecheck, lint, tests, builds, Docker build, e2e |

Working on the code with Claude Code: start at [CLAUDE.md](CLAUDE.md).
