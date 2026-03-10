# RPI Request — Phase 1: Foundation
# Read this file at the start of every /rpi:research and /rpi:implement session for Phase 1.

---

## Phase goal

Working local development environment. Complete schema migrated. Auth working.
Empty screens navigable. No product features.
**Phase 1 is complete when a user can create an account and see an empty screen. Nothing more.**

---

## Scope

**Builds:**
- Monorepo structure (npm workspaces)
- Docker Compose (PostgreSQL 16 + pgvector)
- Prisma schema migration (full schema — Section 1 of 12-build-specification.md)
- Supabase Auth (Google + Apple OAuth)
- Fastify API server (empty routes + health check)
- React Native app shell (Expo, navigation, empty screens)
- Shared TypeScript types (`packages/types/index.ts`)
- Seed script scaffolding (structure only — content in Phase 2)
- Environment variable wiring (local dev only)

**Does NOT build:**
- Any product feature (roadmap, onboarding, task cards)
- AI integration
- Payment integration
- Knowledge base content

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-1-01 | `docker compose up -d` starts PostgreSQL 16 with pgvector | `SELECT extname FROM pg_extension WHERE extname = 'vector'` returns one row |
| AC-1-02 | `npx prisma migrate dev` runs cleanly on fresh DB. All Section 1 tables exist. | Run migrate + inspect tables |
| AC-1-03 | `GET /health` returns 200 `{ status: "ok", dbConnected: true }` when DB reachable | Hit endpoint |
| AC-1-04 | `GET /health` returns 503 `{ status: "error" }` when DB unreachable | Stop Docker, hit endpoint |
| AC-1-05 | Supabase Auth local instance starts via `supabase start` with no errors | `supabase status` shows all services running |
| AC-1-06 | Google OAuth login completes end-to-end on Expo Go. User record created in Supabase + app DB. | Complete login flow |
| AC-1-07 | Apple Sign-In configured in app.json and app delegate. Config present for EAS build. | Inspect app.json |
| AC-1-08 | `POST /auth/verify` with valid JWT returns 200 with correct `isNewUser` and `hasProfile`. Second call returns `isNewUser: false`. | Two sequential calls |
| AC-1-09 | `POST /auth/verify` with invalid/expired JWT returns 401 | Send bad token |
| AC-1-10 | React Native app shell launches on Expo Go with placeholder screen + bottom tab navigation | Launch app |
| AC-1-11 | TypeScript compiles with zero errors in both `apps/api` and `apps/mobile` | `npx tsc --noEmit` in each workspace |
| AC-1-12 | `packages/types/index.ts` imported successfully by both workspaces without type errors | `npx tsc --noEmit` in each workspace |
| AC-1-13 | `.env.example` contains all required env vars. `.env.local` in `.gitignore`. No secrets committed. | Inspect files |
| AC-1-14 | `npx ts-node scripts/seed-knowledge-base.ts` runs without error (placeholder content only) | Run script |

---

## Known failure points

- **pgvector extension:** Use `pgvector/pgvector:pg16` Docker image — not vanilla `postgres:16`. The extension must be enabled before migrate runs.
- **Supabase JWT mismatch:** Get JWT secret from `supabase status` → copy to `.env.local` as `SUPABASE_JWT_SECRET`. Mismatch causes all auth to silently fail with 401.
- **Apple Sign-In config:** Must be in `app.json` from the start. Adding late = painful. AC-1-07 is configuration only — not functional test.
- **packages/types workspace link:** Must be declared in root `package.json` workspaces array before npm install. Missing link = type errors in both workspaces.
- **pgvector column syntax:** The `embedding vector(1536)` column on `KnowledgeBaseChunk` is added via raw SQL in a migration — NOT Prisma schema syntax. Prisma schema uses a comment to document this.

---

## Skills to load

None required for Phase 1 — infrastructure only, no domain logic.

---

## Phase gate

ALL 14 ACs must pass. Run `GET /health` and full auth flow before marking gate complete.
Then run `/rpi:gate phase1`.
