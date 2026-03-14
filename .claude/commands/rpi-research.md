---
description: Research phase of RPI workflow — read spec, surface ambiguities, confirm understanding before planning. Usage: /rpi:research [phase] [ac-id] e.g. /rpi:research phase2 AC-2-01
argument-hint: [phase] [ac-id]
model: sonnet
---

# RPI Research — $0

## What This Command Does

Deep-reads the spec for a specific AC before any planning begins.
Output: a research summary that confirms understanding and surfaces any ambiguities.
Human must review and confirm before /rpi:plan proceeds.

## Steps

**Step 1 — Orient**
Read in this order:
1. `rpi/[phase]/research/pre-analysis.md` — if exists, read FIRST for pre-resolved ambiguities and canonical values
2. `IMPLEMENT.md` — current state, any prior notes on this phase
3. `rpi/$0/REQUEST.md` — scope, AC list, failure points, skills to load
4. The relevant AC definition from REQUEST.md for the specific AC being researched
5. Referenced sections of `12-build-specification.md` (the functional contract for this AC)
6. Relevant sections of `apps/api/CLAUDE.md` or `apps/mobile/CLAUDE.md`

**Step 2 — Research**
For the specific AC:
- What exactly must be built?
- What files are created or modified?
- What functions/routes/tests are involved?
- What spec constraints apply? (check `.claude/constitution.md`)
- What are the known failure points for this AC?
- What skills are relevant? (load them now)
- Are there any ambiguities or gaps in the spec?

**Step 3 — Write Research Summary**
Save to: `rpi/[phase]/research/[ac-id].md`

Format:

    # Research: [AC-N-NN] — [AC description]

    ## Understanding
    [What must be built — in your own words, showing comprehension not just copy-paste]

    ## Files Involved
    [New files to create / existing files to modify]

    ## Functions / Routes / Tests
    [Specific items to implement]

    ## Constraints That Apply
    [Relevant constitution.md constraints for this AC]
    [Pre-analysis.md findings that apply to this AC, if any]

    ## Skills Loaded
    [Which skills are relevant and loaded]

    ## Ambiguities / Questions
    [Any gaps — if none, state explicitly "None identified"]

    ## Ready to Plan
    [YES — no ambiguities] / [NO — awaiting clarification on: X]

**Step 4 — Present to Human**
Show the research summary. State explicitly:
- What you understood
- Any ambiguities needing clarification
- Whether you are ready to proceed to /rpi:plan

**STOP HERE. Do not plan. Do not implement. Wait for human confirmation.**
