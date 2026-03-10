---
description: Current implementation state — read IMPLEMENT.md and report phase progress, AC status, golden example status, and next action.
model: haiku
---

# RPI Status

Read `IMPLEMENT.md` and report the current state.

## Output Format

    ═══ LANDEDNZ IMPLEMENTATION STATUS ═══

    Current Phase: Phase [N] — [Name]
    Overall: [N]/5 phases complete

    Phase [N] Progress: [X]/[total] ACs complete

    PENDING ACs:
      AC-N-XX: [description]
      AC-N-XX: [description]

    PASSED ACs:
      [x] AC-N-XX: [description]

    Golden Examples:
      Priority GOLDEN 1: [PASS/FAIL/—]
      Priority GOLDEN 2: [PASS/FAIL/—]
      Priority GOLDEN 3: [PASS/FAIL/—]
      Priority GOLDEN 4: [PASS/FAIL/—]

    Session Notes (latest):
      [last 3 entries from session notes]

    Next Action:
      /rpi:research phase[N] AC-N-[next pending]
