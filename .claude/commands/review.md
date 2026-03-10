# /review
# Code review command — runs after implementation, before marking an AC as PASS.

---

## Purpose

Reviews recently written or modified code against LandedNZ architectural
constraints, coding standards, and AC requirements. Invoked by the
`senior-software-engineer` agent at the end of each `/rpi:implement` run,
or manually at any time.

---

## Steps

1. **Identify files changed in this session**
   List all files created or modified since the last commit.

2. **Run standard checks**

   | Check | What to look for |
   |-------|-----------------|
   | Architecture boundaries | No cross-imports between `features/roadmap/` and `features/chat/` |
   | `core/` purity | No Fastify, Prisma, or `@anthropic-ai/sdk` imports in `core/` |
   | SDK isolation | `@anthropic-ai/sdk` imported only in `shared/ai/claude.client.ts` |
   | Prompt registry | No prompt strings outside `core/prompts/registry.ts` |
   | Error handling | `AppError` used for business failures, `AIFailureError` for Claude failures |
   | No `console.log` | `logger` used everywhere |
   | No secrets | No hardcoded keys, credentials, or connection strings |
   | TypeScript | No `any` without inline comment explaining why |
   | Async routes | All Fastify route handlers are `async` |
   | Test coverage | `core/` files have corresponding `.test.ts` files |

3. **Run domain-specific checks**

   If `features/chat/` touched:
   - SSE pipeline uses `reply.raw` — not `reply.send()`
   - Stream errors caught and emitted as SSE error event — not unhandled rejections
   - `AIFailureError` caught inside chat service — not propagated to global handler

   If `features/roadmap/` touched:
   - Premium gate returns 403 with `PremiumGateResponse` body
   - HMAC verification runs before DB access in webhook handler

   If `core/priority/` touched:
   - Golden examples still pass: `npm test -- golden-examples/priority-scoring.ts`

   If pgvector or RAG touched:
   - Cosine operator is `<=>` — not `<->` (L2)
   - ivfflat index creation is NOT inside any script — manual only

   If RevenueCat webhook touched:
   - HMAC verified before any data is written
   - `EXPIRATION` revokes access — not `CANCELLATION`

4. **Output review result**

   ```
   ## Review result: PASS / FAIL

   ### Passed checks
   - [check name]

   ### Failed checks (if any)
   - [check name] — [file] — [what the violation is and how to fix it]

   ### Recommendation
   [PASS — safe to commit] or [FAIL — fix before committing]
   ```

5. **On PASS** — confirm safe to commit and suggest commit message
6. **On FAIL** — list violations, fix them, re-run review before committing
