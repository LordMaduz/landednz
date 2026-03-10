# /plan [feature]
# Ad-hoc planning command — use before implementing any feature or fix.

---

## Purpose

Produces a confirmed implementation plan before any code is written.
Use this for ad-hoc work outside the RPI workflow (bug fixes, refactors,
small features not tied to a specific AC).

For phase build work, use `/rpi:plan [phase] [ac-id]` instead.

---

## Steps

1. **Read the relevant spec**
   - Check `12-build-specification.md` for any related AC or contract
   - Check CLAUDE.md for architectural constraints and known gotchas
   - Check `.claude/constitution.md` for constraint violations

2. **Surface ambiguities**
   - List any unknowns about inputs, outputs, or edge cases
   - Do not proceed if business logic is ambiguous — ask first
   - Mechanical decisions (naming, structure within established patterns) do not need confirmation

3. **Produce the plan**
   Output a plan in this format:
   ```
   ## Plan: [feature name]

   ### What changes
   - [file path] — [what changes and why]
   - [file path] — [what changes and why]

   ### Tests first (if core/)
   - [test file] — [what the test asserts]

   ### Order of operations
   1. [step]
   2. [step]
   ...

   ### Edge cases covered
   - [edge case and how it's handled]

   ### What this does NOT change
   - [explicit scope boundary]
   ```

4. **Wait for confirmation** before writing any implementation code.

---

## Rules

- Never skip planning for anything larger than a 5-line fix
- If the plan touches `core/`, TDD is required — tests listed in the plan
- If the plan touches architectural boundaries, flag it explicitly
- If the plan requires a Prisma schema change, flag it — migration required
