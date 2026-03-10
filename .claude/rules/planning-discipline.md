# Planning Discipline Rules
# LandedNZ — Claude Code enforcement document

---

## Core principle

**Plan before code. Always.**

No implementation begins without a confirmed plan. This is not optional.
A 10-minute clarification prevents a 2-hour rewrite. A 2-hour rewrite
wastes a session. A wasted session delays a phase gate.

---

## Plan-before-code rule

Before writing any implementation code:

1. Read the relevant AC from `12-build-specification.md`
2. Surface any ambiguities — do not assume, do not resolve silently
3. Produce a plan: what files change, what functions are written, what tests are written first
4. Confirm the plan before typing any implementation

Use `/rpi:plan [phase] [ac-id]` to trigger the full plan workflow for RPI tasks.
Use `/plan [feature]` for ad-hoc planning outside the RPI workflow.

---

## Ambiguity handling

**Stop and ask. Never assume.**

If facing ambiguity about:
- Business logic or product behaviour → stop, surface it, wait for answer
- Architecture decision not covered by `12-build-specification.md` → stop, surface it
- Whether something belongs in `core/` or `features/` → check CLAUDE.md boundaries first, then ask if still unclear

The correct answer to ambiguity is always: flag it with a specific question.
The wrong answer is: make a reasonable guess and proceed.

**Exception:** purely mechanical decisions (variable naming, file structure within an established pattern)
do not need confirmation. Use judgment for these.

---

## Phase gate discipline

Phase gates are binary — pass or fail. No partial credit.

- Do not begin Phase N+1 until ALL acceptance criteria for Phase N pass
- Do not mark an AC as passing if it has not been verified
- Verification means running the exact check described in the AC — not "it looks right"
- Use `/rpi:gate [phase]` to run the full gate verification workflow

---

## Challenge the implementation

After producing any solution, ask:

> *"Knowing everything now, what is the elegant solution?"*

A working solution that violates architectural constraints or accumulates
technical debt is not a passing solution. If a fix feels like a workaround,
it probably is. Surface it and build the right thing.

---

## Specs before auto-mode

Before running Claude Code autonomously on any multi-step task:

1. Reduce ambiguity to zero — every input, output, and edge case defined
2. Confirm the approach matches `12-build-specification.md`
3. Verify constitutional constraints (`/rpi:plan` does this automatically)

Autonomous mode with ambiguity = unpredictable output.
Autonomous mode with full spec = fast, correct output.

---

## Compounding discipline

Every correction made during the build must be encoded:

1. Run `/learn [what was learned]` immediately after any correction
2. Do not silently fix and continue — the next session must inherit the knowledge
3. CLAUDE.md is a living document — treat it as the team's institutional memory

A stale CLAUDE.md is worse than no CLAUDE.md. The compounding effect
of disciplined learning over 16 weeks is the difference between a
smooth build and one that repeats the same mistakes.

---

## RPI workflow (Research → Plan → Implement)

For all phase build work, use the RPI command sequence:

```
/rpi:research [phase] [ac-id]    — read spec, surface ambiguities
/rpi:plan [phase] [ac-id]        — produce plan, validate against constitution
/rpi:implement [phase] [ac-id]   — execute plan with TDD, commit on PASS
/rpi:gate [phase]                — verify all ACs, update docs, mark phase COMPLETE
/rpi:status                      — check current build state at any time
```

Never skip research. Never skip planning. Never implement without a validated plan.
