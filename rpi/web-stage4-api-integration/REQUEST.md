# RPI Request — Web Stage 4: API Integration and Data Flow
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 4.

---

## Stage goal

All screens connected to the real Fastify API. Mock data replaced with live data.
Auth flow working end-to-end. Onboarding persists. Roadmap fetched. Task completion
updates server. Chat streaming connected.
**Stage 4 is complete when all features work with real data from the existing API.**

---

## Scope

**Builds:**
- Supabase Auth SSR integration (Google OAuth, session management, token refresh)
- Auth page functionality (sign in, redirect after auth, session persistence)
- API client (`src/lib/api.ts`) connected to real Fastify endpoints
- Onboarding → POST /onboarding/profile → persist → redirect to roadmap
- Roadmap dashboard → GET /roadmap → render real task data
- Task completion → POST /roadmap/tasks/:taskId/complete → optimistic update + server sync
- Bulk override → POST /roadmap/bulk-override
- Chat streaming → POST /chat/sessions/:id/messages → SSE → progressive render
- Stripe Checkout → upgrade → redirect → return to /roadmap
- Zustand stores (roadmapStore, chatStore)
- Custom hooks (useRoadmap, useTaskDetail, useChat, useOnboarding)
- Error handling for all API failure modes
- Loading states using skeleton components from Stage 1

**Does NOT build:**
- New UI components (all built in W1–W3)
- Visual polish or animation refinements
- Performance optimisation

---

## Key API endpoints (from 12-build-specification.md)

```
POST /auth/verify                                  ← verify Supabase JWT
POST /onboarding/profile                           ← save 5 onboarding answers
GET  /roadmap                                      ← personalised roadmap with topThree
GET  /roadmap/tasks/:taskId                        ← task detail (Layer 2 content)
POST /roadmap/tasks/:taskId/complete               ← mark task complete
POST /roadmap/bulk-override                        ← mark multiple tasks complete
POST /chat/sessions                                ← create chat session (entry-point-aware)
POST /chat/sessions/:sessionId/messages            ← send message (SSE streaming)
```

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W4-01 | Google OAuth end-to-end on web, session persists on refresh | Complete flow |
| AC-W4-02 | Auth middleware: unauthenticated → signin, after auth → original path | Access /roadmap without session |
| AC-W4-03 | Sign out: session cleared, redirect to /, /roadmap → signin | Settings → sign out |
| AC-W4-04 | Onboarding → POST /onboarding/profile, profile persisted, GET /roadmap works | Complete onboarding |
| AC-W4-05 | Roadmap from API: hero card correct counts, topThree correct | Visual check after onboarding |
| AC-W4-06 | TaskCardState derivation correct, Vitest unit tests for all paths | `npm run test` |
| AC-W4-07 | Task detail from GET /roadmap/tasks/:taskId, all Layer 2 sections | Click task |
| AC-W4-08 | Mark as done: optimistic → API → re-fetch. Rollback + toast on failure. | Mark task, kill API, retry |
| AC-W4-09 | Chat SSE streaming: tokens progressive, citations render, source footer | Send message |
| AC-W4-10 | Chat entry-point: TASK_CARD sends taskId, ROADMAP sends context | Open from task vs roadmap |
| AC-W4-11 | Upgrade → Stripe Checkout → return with ?upgrade=success → Phase 3 unlocked | Stripe test mode |
| AC-W4-12 | Premium gate defer + decline paths functional | Click both |
| AC-W4-13 | Loading states: skeleton on roadmap, task detail, chat | Throttle network |
| AC-W4-14 | Errors: network → retry, 401 → signin, 500 → inline error, chat → system msg | Disable API |
| AC-W4-15 | Zustand: roadmapStore + chatStore, persist across nav, reset on signout | Navigate, sign out |
| AC-W4-16 | Playwright E2E: signin → onboard → roadmap → task → complete → verify | `npx playwright test` |

---

## Known failure points

- **Supabase SSR cookie handling** — `@supabase/ssr` needs specific cookie config for App Router middleware
- **SSE consumption** — use `fetch` + `ReadableStream`, NOT `EventSource` (needs auth headers)
- **Optimistic update race** — re-fetch may arrive before server processes; use a short delay or invalidation key
- **Stripe redirect URL** — must include full URL with protocol for production
- **Mock data removal** — delete `src/mocks/` once all screens use real data. Do not leave orphaned mock files.

---

## Skills to load

- `web-chat-streaming` — SSE consumption, token rendering, citation extraction
- `web-component-patterns` — optimistic update, error recovery

---

## Stage gate

ALL 16 ACs must pass. Playwright E2E full journey. Manual walkthrough: sign in → onboard
→ browse → complete task → chat → sign out. Network tab: no failed API calls on happy path.
Then run `/rpi:gate web-stage4`.
