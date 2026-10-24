# LandedNZ

Personalised settlement roadmap + AI assistant for skilled migrants in NZ. Monorepo: `apps/api` (Fastify), `apps/web` (Next 16), `packages/types`.
Current work: R0 rebuild — spec `docs/superpowers/specs/2026-10-24-r0-foundation-design.md`, plans in `docs/superpowers/plans/`.

## Stack

- Node 24 everywhere (`.nvmrc`), npm workspaces, TypeScript 7.
- API: Fastify 5, Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`, client generated into `apps/api/src/generated/prisma`, gitignored), Postgres + pgvector, Anthropic SDK (chat), OpenAI `text-embedding-3-small` 1536-d (RAG), Vitest 5.
- Web: Next 16.4 App Router (`src/proxy.ts`, not middleware), React 19.3, Tailwind 4, shadcn/ui, Zustand, `@supabase/ssr`, Vitest 5 + Playwright.
- Local DB + auth: Supabase CLI stack (`supabase/config.toml`). No docker-compose.

## Commands

Use `make` targets (run `make` to list): `make setup`, `make dev`, `make check`, `make test`, `make test-e2e`, `make docker-api`, `make db-reset`, `make user EMAIL=… PASSWORD=…`. They wrap the npm scripts in the root and workspace `package.json`; CI calls npm directly.

## Workflow

superpowers: spec → design board approved (minimalism validator) → plan → execute with TDD → review. A UI change needs its approved board first (CW02′).

Rules: `.claude/constitution.md` (C01–C16, CW01–CW08) is non-negotiable. Domain skills in `.claude/skills/`.

Commits: Conventional Commits with scope — `feat(chat):`, `fix(web):`, `chore(deps):`, `chore(repo):`, `test(core):`, `docs:`, `ci:`. Never commit `.env.local`.

## AI_MODE

`AI_MODE` is required (`live` | `mock`, no default). `mock` = deterministic replies and embeddings, used by tests and CI; semantic golden examples skip in mock. `live` additionally requires `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_API_KEY`. Local/test model: `claude-haiku-5-5`; staging/production: `claude-sonnet-5-5`.

## Gotchas

- **Auth is never mocked in API integration tests.** Use real local Supabase users (`apps/api/src/test-utils/supabase-user.ts`); web e2e resets its user in each spec through `DELETE /account` (`e2e/test-user.ts`).
- **Supabase JWTs are ES256** — verify via the JWKS endpoint (`/auth/v1/.well-known/jwks.json`) with `jose`; there is no shared JWT secret.
- **SSE in the browser uses `fetch` + `ReadableStream`**, not `EventSource` (it cannot send `Authorization`).
- **`app.inject()` buffers SSE** — it cannot prove progressive delivery; use `fetch` against a running server.
- **Run `npm run prisma:generate -w @landednz/api` after every install** (`make setup` does) — no postinstall hook, prod installs lack the CLI.
- **Bootstrap only embeds chunks without an embedding**: to swap mock embeddings for real ones, `make db-reset-live`.
- **Next 16 + TS 7**: `tsc` does not see Next's generated global `LayoutProps`/`PageProps` — type props explicitly. `typecheck` runs `next typegen` first.
- **`cacheComponents` is on**: server components reading per-request data (Supabase session) go inside `<Suspense>` and call `await connection()` first.
- **npm 11 skips dependency install scripts** (esbuild, prisma engines, sharp): builds, tests and the Docker image work without them.
- The web app is light-only; shadcn's `.dark` block is never toggled.
