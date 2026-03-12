# docs-phase

Systematically fills architecture documentation placeholders after phase gate completion.

## Usage

```bash
/docs:phase phase1
/docs:phase phase2
/docs:phase phase3
/docs:phase phase4
/docs:phase phase5
```

## What This Does

1. **Verifies phase gate passed** — checks IMPLEMENT.md for phase completion
2. **Fills documentation placeholders** — systematically updates docs/ files for that phase
3. **Updates architecture overview** — maintains ARCHITECTURE.md consistency
4. **Reports completion** — summary of documentation updates made

## Examples

```bash
# After completing Phase 1
/rpi:gate phase1        # ✅ All 14 ACs pass
/docs:phase phase1      # 📝 Fill auth, API, mobile architecture docs

# After completing Phase 2
/rpi:gate phase2        # ✅ All 15 ACs pass
/docs:phase phase2      # 📝 Fill AI architecture (Job A), roadmap API docs
```

## Prerequisites

- Phase gate must have passed (`/rpi:gate [phase]` completed successfully)
- All acceptance criteria for that phase must show PASS in IMPLEMENT.md
- Architecture documentation structure must exist (docs/ folder)

## Agent

This skill invokes the `docs-phase-updater` agent with the specified phase parameter.