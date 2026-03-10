---
description: Implementation phase of RPI workflow — execute approved plan, run tests, run code review. Usage: /rpi:implement [phase] [ac-id]
argument-hint: [phase] [ac-id]
model: sonnet
---

# RPI Implement — $0

Executes the approved implementation plan for a specific AC.
Runs code-reviewer after implementation.
Updates IMPLEMENT.md with result.

## Pre-conditions
- Research complete: `rpi/[phase]/research/[ac-id].md` exists
- Plan approved: `rpi/[phase]/plans/[ac-id].md` exists, human approved it
- Constitutional validator PASS on the plan

## Steps

**Step 1 — Load Context**
Read `rpi/[phase]/plans/[ac-id].md` — the approved plan.
Load relevant skills from the phase REQUEST.md.

**Step 2 — Implement (TDD for core/)**

For `core/` functions:
1. Write the test first (RED)
2. Run: `npm test -- [test file]` — confirm it fails
3. Write minimal implementation to pass (GREEN)
4. Refactor if needed

For `features/` and routes:
1. Implement the function/route/service
2. Write integration test
3. Run tests — confirm passing

For UI (mobile):
1. Implement the screen/component
2. Verify all states render without crash

**Step 3 — Run AC Verification**
Run the specific verification check defined in REQUEST.md for this AC.
Do NOT mark PASS without actually running the check.

**Step 4 — Run Code Reviewer**
Use the Task tool to invoke the code-reviewer:

    Task(
      subagent_type="code-reviewer",
      description="Review implementation of [AC-N-NN]",
      prompt="Review the implementation of [AC-N-NN]. Files changed: [list files].
              Apply all standard checks plus LandedNZ domain-specific checks."
    )

Wait for reviewer verdict.

**Step 5 — Handle Review Result**

PASS or CONDITIONAL PASS: proceed to Step 6.
FAIL: fix all violations. Re-run code-reviewer. Do not proceed until PASS.

**Step 6 — Update IMPLEMENT.md**

Mark the AC in IMPLEMENT.md:
- PASS: `[x] AC-N-NN — PASS — [brief note]`
- FAIL: `[!] AC-N-NN — FAIL — [what failed]`

Update golden example status table if applicable.
Add any new learnings to Session Notes section.

**Step 7 — Commit (if PASS)**
Commit with conventional commit format:
`feat(roadmap): AC-2-01 scoreTask golden examples pass`

**Step 8 — Present to Human**
Report:
- What was built
- Test output (pass/fail counts)
- AC verification result
- Code reviewer verdict
- IMPLEMENT.md update

**STOP HERE. Human reviews output before next AC begins.**
