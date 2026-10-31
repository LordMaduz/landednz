# SDD ledger — plan: docs/superpowers/plans/2026-10-31-design-system.md

Design system: progress ledger

Spec: docs/superpowers/specs/2026-10-31-design-system-design.md
Plan: docs/superpowers/plans/2026-10-31-design-system.md
Worktree: landednz-ds on feat/design-system (from feat/type-system 0787212)
Execution: Native (owner, 2026-10-31)

## Task 0: Worktree (done 2026-10-31)

- `make setup` ok.
- Baseline `npm test -w apps/web`: 416 passed (416).

## Task 1: Board owner decisions (2026-10-31)

Board: https://claude.ai/artifact/JDm4bkdqbTXmXjhnxsqjNv

1. State strength: **A 6/10 %** (owner picked recommended).
2. Floating radius: **16** (owner picked recommended).
3. Avatar → surface-selected merge: **deferred**. Owner: "Avatart has it's own redesign going on in another session. so can we skip 1 for now." Keep `avatar` as its own role/alias; don't touch the avatar in Tasks 2+.
4. Citation chip: **state layer** (owner picked recommended).
5. Pressed feedback on all phone controls: **yes** (owner picked recommended).

Spacing role values and renames: no changes requested, so the board values stand.

Task 0: complete (worktree, baseline 416/416)
Task 1: complete (commit 9de09de, owner decisions above)

Pre-flight: Task 2 produces role classes + aliases consumed by Tasks 3–8; Task 3 `state` consumed by Task 4 Button, Task 4 variants by Tasks 6–7; Task 8 removes aliases after 5–7. No conflicts found.

E2E setup: owner dev servers own 3000/3001, so e2e runs on a ds web 3100 + ds API 3101 (`PORT=3101 CORS_ORIGIN=http://localhost:3100`, env only; AI_MODE=mock) with a scratchpad Playwright config.
Pre-existing (not caused by Task 2: target size depends on layout, Task 2 changed only colour/radius/shadow values; the baseline swap run is NOT proof, the dev server later turned out to serve stale CSS after edits): a11y at 390 fails `/app/roadmap: target-size (.-ml-3)` (roadmap-view "N more" Show button). Fix lands with Task 7 (roadmap-view → Button, tap area). A one-off `/app` guide-ask color-contrast hit in one full run did not reproduce (2 reruns clean).

Task 2: Ruling: outline effects are `shadow-*` roles (`shadow-chosen`, `shadow-error`, `shadow-today`, `shadow-rail`, `shadow-pin`), not `ring-*` — `ring-focus` etc. would collide with Tailwind's ring-colour utilities for the `focus` colour role; focus stays the base `outline` from `--color-focus` — cost if wrong: a rename.
Task 2: Ruling: spacing role values (board gave none): page-gutter 16/24 (container-page), card-padding 16/20 (Card p-4/p-5), section-gap 24/32 (gap-6/gap-8), stack-gap 12/16 (gap-3/gap-4); desktop from 561 px (narrow breakpoint). Unused until piece 3, which checks them — cost if wrong: four values.
Task 2: Ruling: elevation merges as on the board: lift→raised, frame-top=raised, bar+pop→floating, pane→overlay, sheet→overlay-up; radius pane 18 + bar 16 → floating 16 (decision 2). Visible: pane radius 18→16, source-preview popover takes the ask-bar shadow — cost if wrong: re-point two aliases.
Task 2: Ruling: palette lives in a plain `:root` block (not @theme) so no `bg-palette-*` utilities exist; `ink-hover` keeps a palette value until the state layer replaces it (Task 8 removes it); `avatar` kept as its own role (decision 3 deferred).
Task 2: Ruling: cn registers roles through `extend.theme` (radius, shadow, spacing scales) instead of per-group lists, so `rounded-t-card`, `px-page-gutter` etc. merge too; colour roles need no registration (tested) — cost if wrong: one config line.
Task 2: complete (commits 9de09de..1197b00, tests: npm test -w apps/web → 418 passed; e2e 19 passed + a11y pre-existing 390 roadmap target-size only)

E2E gotcha: Next dev on 3100 did not pick up globals.css edits (stale CSS chunk); restart the 3100 server after every globals.css change before e2e.
Task 3: Ruling: `state`/`state-inverse` set only the hover/pressed background, not the rest background — the plan's `background-color: var(--state-base)` at rest would fight `bg-*` classes (Task 4 expects `bg-action … state-inverse`), so elements pair `bg-<role>` with `state-base-<role>` — cost if wrong: one extra class per control.
Task 3: Ruling: `state-base-*` takes any colour role via `--value(--color-*)` (`state-base-surface-sunken`, `state-base-surface-inverse`), not short names (`state-base-sunken`) — one rule, no second naming scheme — cost if wrong: a rename.
Task 3: Ruling: layer percentages live in a plain `:root` block beside the utilities (`--state-hover` 6 %, `--state-press` 10 %, inverse 8/12 %: decision 1). Disabled = `:not(:disabled,[data-disabled])` on the layer rules.
