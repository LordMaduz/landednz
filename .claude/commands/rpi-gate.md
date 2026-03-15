---
description: Phase gate verification — run after all ACs for a phase pass. Verifies gate, invokes documentation-analyst-writer to update CLAUDE.md files. Usage: /rpi:gate [phase]
argument-hint: [phase]
model: sonnet
---

# RPI Gate — $0

Runs final phase gate verification and updates documentation.

## Steps

**Step 1 — Verify All ACs**
Read IMPLEMENT.md. Confirm every AC for this phase is marked PASS or DEFERRED.
- PASS: AC implementation complete and tested
- DEFERRED: AC intentionally postponed with documented reason
If any AC is PENDING or FAIL: report which ones and stop. Do not proceed.

**Step 2 — Run End-to-End Scenario**
Run the manual test sequence from the phase REQUEST.md Phase Gate section.

    Phase 1: docker compose up -d + prisma migrate dev + supabase start + health check
    Phase 2: Priya scenario — onboarding → topThree → complete T06 → complete T07 → T08 unlocked
    Phase 3: sandbox purchase → webhook → isActive: true within 10s
    Phase 4: create session → stream message → CRISIS_SIGNAL test → PROMPT_INJECTION test
    Phase 5: generate-embeddings → ivfflat index → chat with IRD question grounded in T08 chunk

**Step 3 — Run Golden Examples (Phase 2 and 5 only)**

    npm test -- golden-examples/priority-scoring.ts     # Phase 2
    npm test -- golden-examples/rag-retrieval.ts        # Phase 5

All must pass before proceeding.

**Step 4 — Invoke documentation-analyst-writer**
Use the Task tool:

    Task(
      subagent_type="documentation-analyst-writer",
      description="Update CLAUDE.md files after Phase [N] gate",
      prompt="Phase [N] gate has passed. Read IMPLEMENT.md session notes and update
              the three CLAUDE.md files (root, apps/api, apps/mobile) with anything
              learned during Phase [N] implementation."
    )

Wait for completion. Read its update report.

**Step 5 — Update IMPLEMENT.md**
Mark the phase as COMPLETE:
- Change phase status table: NOT STARTED/IN PROGRESS → COMPLETE
- Set next phase from BLOCKED → IN PROGRESS

**Step 6 — Report to Human**

    PHASE [N] GATE: PASS

    AC verification: [N]/[N] passed
    End-to-end scenario: PASS
    Golden examples: PASS (if applicable)
    Documentation: Updated [list files changed]
    IMPLEMENT.md: Phase [N] marked COMPLETE, Phase [N+1] unblocked

    Ready to begin Phase [N+1].
    Next: /rpi:research phase[N+1] AC-[N+1]-01
