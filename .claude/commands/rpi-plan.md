---
description: Planning phase of RPI workflow — produce implementation plan and run constitutional validation before any code. Usage: /rpi:plan [phase] [ac-id]
argument-hint: [phase] [ac-id]
model: sonnet
---

# RPI Plan — $0

Produces an implementation plan for a specific AC.
Runs constitutional-validator before finalising.
Human must approve the plan before /rpi:implement proceeds.

## Pre-conditions
- Research for this AC must be complete (`rpi/[phase]/research/[ac-id].md` exists)
- Human must have confirmed research is complete and no ambiguities remain

## Steps

**Step 1 — Read Research**
Read `rpi/[phase]/research/[ac-id].md` to load the research context.

**Step 2 — Draft Implementation Plan**
Produce a concrete implementation plan using this format:

    # Implementation Plan: [AC-N-NN]

    ## Approach
    [Chosen implementation approach — one paragraph]

    ## File Changes
    [Exact list: create X at path Y / modify Z]

    ## Implementation Order
    1. [First thing — usually the test for TDD work]
    2. [Second thing]
    ...

    ## Test Strategy
    [How this AC will be verified — the exact check from REQUEST.md]

    ## Golden Examples Affected
    [Which golden examples (if any) will run after this implementation]

**Step 3 — Run Constitutional Validator**
Use the Task tool to invoke the constitutional-validator:

    Task(
      subagent_type="constitutional-validator",
      description="Validate implementation plan for [AC-N-NN]",
      prompt="Validate this implementation approach against the constitution:\n\n[paste full implementation plan]"
    )

Wait for the validator to complete. Read its verdict.

**Step 4 — Handle Validator Result**

If PASS: proceed to Step 5.

If FAIL: revise the plan to address all violations. Re-run constitutional-validator.
Do NOT proceed to Step 5 until validator returns PASS.

**Step 5 — Save Plan**
Save final approved plan to: `rpi/[phase]/plans/[ac-id].md`

**Step 6 — Present to Human**
Show the plan and validator result. State:
- Approach chosen and why
- Constitutional validator: PASS
- What you will build
- How it will be tested

**STOP HERE. Do not write any code. Wait for explicit human approval.**
Human says "proceed" or "approved" → then run /rpi:implement [phase] [ac-id]
