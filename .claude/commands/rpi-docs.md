# rpi-docs

Systematically fills architecture documentation placeholders after phase gate completion.
**Part of RPI workflow** — runs after `/rpi:gate` to complete phase deliverables.

## Usage

```bash
/rpi:docs phase1
/rpi:docs phase2
/rpi:docs phase3
/rpi:docs phase4
/rpi:docs phase5
```

## What This Does

1. **Verifies phase gate passed** — checks IMPLEMENT.md for phase completion
2. **Fills documentation placeholders** — systematically updates docs/ files for that phase
3. **Updates architecture overview** — maintains ARCHITECTURE.md consistency
4. **Reports completion** — summary of documentation updates made

## RPI Workflow Integration

```bash
# Complete RPI workflow for a phase:
/rpi:research phase1 AC-1-03   # Step 1: Research
/rpi:plan phase1 AC-1-03       # Step 2: Plan
/rpi:implement phase1 AC-1-03  # Step 3: Implement
# ... (repeat for all ACs)
/rpi:gate phase1               # Step 4: Verify phase completion
/rpi:docs phase1               # Step 5: Document phase architecture
```

## Examples

```bash
# After completing Phase 1
/rpi:gate phase1        # ✅ All 14 ACs pass
/rpi:docs phase1        # 📝 Fill auth, API, mobile architecture docs

# After completing Phase 2
/rpi:gate phase2        # ✅ All 15 ACs pass
/rpi:docs phase2        # 📝 Fill AI architecture (Job A), roadmap API docs
```

## Prerequisites

- Phase gate must have passed (`/rpi:gate [phase]` completed successfully)
- All acceptance criteria for that phase must show PASS in IMPLEMENT.md
- Architecture documentation structure must exist (docs/ folder)

## Agent

This command invokes the `docs-phase-updater` agent with the specified phase parameter.