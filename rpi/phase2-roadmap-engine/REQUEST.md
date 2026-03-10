# RPI Request — Phase 2: Roadmap Engine
# Read this file at the start of every /rpi:research and /rpi:implement session for Phase 2.

---

## Phase goal

A user can complete onboarding and receive a personalised, correctly sequenced settlement
roadmap with priority-scored tasks. Completing tasks updates the roadmap. The top 3 tasks
are always the correct highest-priority non-blocked tasks.

**This is the thesis validation phase. If this works correctly, the core product works.**

---

## Scope

**Builds:**
- Onboarding flow (5 questions + profile persistence)
- Persona key derivation from onboarding inputs
- Roadmap engine — core functions (priority scoring, dependency resolution, task filtering)
- Roadmap generation (post-onboarding, stored per user)
- Roadmap API routes (fetch, complete task, bulk override, task detail)
- Roadmap reveal screen (top 3 + phase-collapsed list)
- Task card (7 interaction states, bottom sheet, Layer 1 + Layer 2 content)
- Task completion (status update + roadmap recomputation)
- Knowledge base seed data (full T01–T21 content, both persona variants)
- Account creation prompt (after first task view)
- Daily priority recalculation job (time-aware urgency updates)

**Does NOT build:**
- Premium gate (Phase 3)
- AI chat (Phase 4)
- RAG or embeddings (Phase 5)
- Push notifications (post-MVP)

---

## Core functions (TDD required — tests before implementation)

| File | Function | Location |
|------|----------|----------|
| `core/priority/scoring.ts` | `scoreTask()` | `apps/api/src/core/priority/` |
| `core/priority/filter.ts` | `filterApplicableTasks()`, `derivePersonaKey()` | `apps/api/src/core/priority/` |
| `core/dependencies/resolver.ts` | `resolveBlockedTasks()`, `getAffectedTasks()` | `apps/api/src/core/dependencies/` |

All core functions: pure, zero framework dependencies. No Prisma, no Fastify, no SDK imports.

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-2-01 | `scoreTask()` returns correct final_priority for all 4 golden examples | `npm test -- golden-examples/priority-scoring.ts` — all pass |
| AC-2-02 | `resolveBlockedTasks()` identifies T07 as blocking T08 when T07 incomplete | T08 in results with `isBlocked: true` |
| AC-2-03 | `resolveBlockedTasks()` unblocks T08 when T07 added to completedTaskIds | T08 `isBlocked` transitions true → false |
| AC-2-04 | `filterApplicableTasks()` excludes tasks not applicable to profile | T01 excluded for non-FAMILY_WITH_CHILDREN profiles (if restricted) |
| AC-2-05 | `POST /onboarding/profile` creates UserProfile + all UserRoadmapEntry records | Profile count + roadmap entry count match expected values per persona |
| AC-2-06 | `GET /roadmap` returns correct topThree for golden1Input scenario (Day 2, no completions) | Correct task IDs in topThree |
| AC-2-07 | `POST /roadmap/tasks/:taskId/complete` marks COMPLETE, returns updated topThree | Status updated + topThree reflects completion |
| AC-2-08 | Completing T07 results in T08 appearing in next topThree (HARD dep resolved) | T08 in topThree after T07 complete |
| AC-2-09 | `POST /roadmap/bulk-override` marks all specified tasks COMPLETE, returns correct topThree | All marked + topThree correct |
| AC-2-10 | `GET /roadmap/tasks/:taskId` for PREMIUM task with no subscription returns 403 | 403 with correct error code |
| AC-2-11 | Daily priority recalculation job updates priorityScore for time-sensitive tasks | T16 score increases when arrivalDate set to 10 months ago |
| AC-2-12 | Roadmap reveal screen shows top 3 above fold, phase headers collapsed below | Visual check |
| AC-2-13 | Task card Layer 1 visible without tap. Layer 2 opens as bottom sheet. All 7 states render. | Visual check — not_started, in_progress, complete, blocked, premium_locked, loading, error |
| AC-2-14 | Marking task complete triggers micro-animation and highlights next task | Visual check |
| AC-2-15 | `seed-knowledge-base.ts` populated with T01–T21 (both persona variants). Script runs cleanly. | `SELECT count(*) FROM "Task"` = 21, `SELECT count(*) FROM "TaskContentVariant"` ≥ 42 |

---

## Golden examples (load-bearing — must pass alongside unit tests)

```
GOLDEN 1: constrained_couple, Day 2, no completions
Expected topThree: T06 (SIM), T07 (bank), then next non-blocked non-complete task
T08 NOT in top 3 because T07 not yet complete (T07 has +30 urgency, Day 1-3)

GOLDEN 2: constrained_couple, Day 2, T06 + T07 complete
Expected: T08 first (base + 20 persona + 25 urgency = high score), T09, T10
T09 still blocked by T08 (HARD dep)

GOLDEN 3: constrained_couple, Month 11, T06–T12 complete, T16 not done
Expected: T16 in top 3 (base + 5 persona + 30 month-10-11 urgency)

GOLDEN 4: solo_aewv, Day 5, no completions
Expected: T09 NOT in top 3 (blocked by T08 — HARD dep — penalty -50)
```

---

## Known failure points

- **Scoring formula:** All 4 components must always be present. Zero is a valid value — not absence.
- **SOFT vs HARD deps:** SOFT deps do NOT set `isBlocked`. Only HARD deps trigger the -50 penalty.
- **PRE_ARRIVAL arrivalDate:** If null, all time urgency bonuses = 0. Do not crash on null.
- **Persona key:** Derived from `familySituation` only — not `visaType`. See priority-engine skill.
- **topThree definition:** Top 3 tasks where `status !== COMPLETE` AND `isBlocked === false`, ordered by priorityScore DESC.
- **Daily recalculation:** Full recomputation is expensive. `getAffectedTasks()` enables targeted recomputation on individual completions.
- **Phase gate scenario (Priya):** Must run manually — see Phase gate section below.

---

## Skills to load

- `priority-engine` — scoring formula, persona weights, time urgency bonuses, dependency graph, golden examples
- `knowledge-base-schema` — T01–T21 task list, content variant structure, seed script requirements

---

## Phase gate

ALL 15 ACs must pass. Then run the Priya scenario manually:

1. Onboard as Priya: PARTNER_OF_STUDENT, AUCKLAND, COUPLE_CONSTRAINED, FINANCE, RECENT
2. Verify topThree contains T06, T07, and a third task — NOT T08
3. Mark T06 complete. Verify T07 still in top 3, T08 still not in top 3
4. Mark T07 complete. Verify T08 now in top 3
5. Mark T08 complete. Verify T09 and T10 now appear

If this sequence works, dependency resolution and scoring are correct.
Then run `/rpi:gate phase2`.
