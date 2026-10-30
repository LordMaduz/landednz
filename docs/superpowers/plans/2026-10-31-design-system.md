# App-wide Design System (pieces 1–2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every colour, state, radius, shadow and spacing decision in `apps/web` lives once in `globals.css` as palette + roles, every control is a kit component, and guards stop drift — with no behaviour change.

**Architecture:** `globals.css` gets a palette block (raw values) and role tokens in `@theme` that point at it. Hover/pressed use one state-layer utility (`color-mix` against `--state-base`). Old token names stay as aliases until every use is sorted onto a role, then the aliases and the hand-written buttons go and `cw01.test.ts` locks it.

**Tech Stack:** Next 16, React 19, Tailwind 4 (`@theme`, `@utility`), Base UI Button, `cn` (cn/config tailwind-merge), Vitest 5, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-design-system-design.md` — read it before any task.

## Global Constraints

- Appearance only: no API, logic, copy, flow, prop, handler or ARIA change. Behaviour tests pass unchanged; class-name and board-compare tests are updated with the change, never loosened.
- Components and pages use roles only; palette values appear only in the `globals.css` palette block.
- Light theme only (CW08); reduced motion respected (CW03).
- Phone tap area ≥ 44 × 44 px for every control; drawn size may be smaller via `::after` extension.
- Spacing (padding, margin, gap, space, inset) steps only: Tailwind `0 0.5 1 2 3 4 5 6 8 10 12 16 24` (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96 px) or a spacing role. Sizes (`size-*`, `w-*`, `h-*`) are not guarded.
- Exceptions: `.gsi` (Google branding), `app/opengraph-image.tsx`, `favicon.ico`.
- Work in a new worktree `landednz-ds` on branch `feat/design-system` cut from `feat/type-system` HEAD. Do not touch the uncommitted work in `landednz-r0cloud`.
- Commits: Conventional Commits with scope (`feat(web):`, `test(web):`, `docs(web):`), no co-author trailer.
- Run unit tests with `npm test -w apps/web`; e2e with `npm run test:e2e -w apps/web` (owner dev servers own 3000/3001 — never kill them; use the scratchpad Playwright config on 3100/3101 if they are up).

## Role names (pinned here; the board may rename, then rename everywhere)

| Kind | Names |
|---|---|
| Text colour | `fg`, `fg-muted`, `fg-subtle`, `fg-on-action`, `fg-on-inverse`, `fg-on-inverse-muted`, `link`, `link-hover`, `link-on-inverse`, `danger`, `danger-on-inverse` |
| Surfaces | `surface`, `surface-sunken`, `surface-selected`, `surface-inverse`, `action`, `accent`, `accent-bright` |
| Lines | `border`, `border-subtle`, `border-selected`, `track`, `focus` |
| State | `--state-hover`, `--state-press` (ink-based), `--state-hover-inverse`, `--state-press-inverse` (white-based) — percentages from the board |
| Radius | `rounded-control`, `rounded-card` (was `surface`), `rounded-floating`, `rounded-full` |
| Elevation | `shadow-raised`, `shadow-floating`, `shadow-overlay`, `shadow-overlay-up` (sheet), `shadow-frame-top`, `shadow-frame-bottom`; rings `ring-focus`, `ring-chosen`, `ring-error`, `ring-today`, `ring-rail`, `ring-pin` |
| Spacing roles | `page-gutter`, `card-padding`, `section-gap`, `stack-gap` (phone + desktop values from the board) |
| Font | `--font-sans` points at `--palette-font` |

`fg` avoids the `text-text` class; `rounded-card` avoids clashing with the `surface` colour.

## Review Focus

1. Ghost/text controls on the dark rail at desktop that flip to white on phones (`delete-account.tsx`): hover and pressed must be visible on both surfaces — pinned in Task 6.
2. Disabled controls after the swap to `<Button>`: still not clickable, no state layer, same `disabled` attribute — pinned in Task 4.
3. Small icon controls (composer remove 18 px, send 34 px, ask-bar open): drawn size unchanged, tap area ≥ 44 on phones — pinned in Task 5.
4. Class merging: `cn("bg-surface", className)` with a new role class must keep both groups — pinned in Task 2.
5. Pressed feedback on a real iPhone (Playwright can't prove `:active` on iOS) — owner check in Task 9.

---

### Task 0: Worktree

- [ ] **Step 1:** `git worktree add ../landednz-ds -b feat/design-system feat/type-system` (from `landednz-r0cloud`), then `make setup` in it.
- [ ] **Step 2:** `npm test -w apps/web` → all pass (baseline). Record the count in the ledger `.superpowers/sdd/2026-10-31-design-system/progress.md`.

### Task 1: Board (owner gate — no code before approval)

**Files:** Create `docs/design/system/board.html`, `docs/design/system/standards.md`, `docs/design/system/gate/critique.md`.

- [ ] **Step 1:** Run impeccable (critique + shape) with the spec as brief, whole app as context. Board shows on composite screens (Home, Roadmap, Task, Settings, Onboarding, guide pane) at 1440 and 390: palette; every role; state layer at two candidate strengths (6/10 and 8/12 %) on white, wash and the ink rail; Button variants × rest/hover/pressed/focus/disabled; inputs (rest/focus/error); cards plain/raised; selected rows and nav; `floating` radius 16 vs 18; merged elevations; `avatar`→`surface-selected` merge; citation chip with state layer vs solid teal; spacing roles at 390 and 1440.
- [ ] **Step 2:** Save full impeccable output to `gate/critique.md`; every number cites a source in `standards.md` with a URL that was opened and checked (spec §12). No P0/P1 left.
- [ ] **Step 3:** Owner picks: state strength, floating radius, avatar merge, citation chip, spacing role values, any renames. Record each decision with the owner's words in the ledger.
- [ ] **Step 4:** Commit `docs(web): design system board (owner-approved)`.

### Task 2: Palette, roles, aliases

**Files:** Modify `apps/web/src/app/globals.css` (`@theme` top block, `@utility ai`, shadows), `apps/web/src/lib/utils.ts`. Test: `apps/web/src/app/design-roles.test.ts` (new).

**Interfaces — Produces:** every role class in the table above; old names (`ink`, `muted`, `control`, `hairline`, `wash`, `teal`, `teal-text`, `teal-hover`, `ink-hover`, `avatar`, `tint`, `tint-border`, `mark`, `white`, `toast-action`, `rail-text`, `rail-label`, `danger-on-ink`, `rounded-surface`, `shadow-lift`, `shadow-chosen`, …) still work as aliases.

- [ ] **Step 1: Failing tests** in `design-roles.test.ts`:
  - `it('roles point at the palette')`: parse `globals.css`; every `--color-*`, `--shadow-*`, `--radius-*` declaration outside the `/* palette */ … /* end palette */` block contains no hex/`rgb(`/`rgba(` literal (`.gsi` rule excepted).
  - `it('cn keeps role classes from different groups')`: `cn('bg-surface text-fg rounded-card shadow-raised', 'text-section')` contains all five classes; `cn('rounded-card', 'rounded-control')` → `'rounded-control'`; `cn('shadow-raised', 'shadow-floating')` → `'shadow-floating'`.
- [ ] **Step 2:** `npm test -w apps/web -- design-roles` → FAIL.
- [ ] **Step 3:** Add `:root` palette block (`--palette-<hue>-<step>`, rgba alphas as `--palette-ink-a04` etc.); roles in `@theme` reference `var(--palette-…)`; old names become `--color-ink: var(--color-fg)`-style aliases; rebuild every shadow and the aurora gradient from palette vars; add spacing roles as `--spacing-page-gutter` / `-card-padding` / `-section-gap` / `-stack-gap` (phone values in `@theme`, desktop overrides in a `:root` media query at the board's width); `--font-sans` reads `--palette-font`; register `card`, `floating`, every `shadow-*`/`ring-*` role and colour roles in `cn` classGroups. Values exactly today's (look unchanged) except board decisions from Task 1.
- [ ] **Step 4:** `npm test -w apps/web` → PASS; `npm run typecheck -w apps/web` clean; `e2e/board-compare.spec.ts` still passes (aliases keep the look).
- [ ] **Step 5:** Commit `feat(web): palette and role tokens`.

### Task 3: State layer utility

**Files:** Modify `globals.css` (new `@utility state`, `@utility state-inverse`). Test: `apps/web/e2e/design-states.spec.ts` (new) against a fixture page `apps/web/src/app/dev/states/page.tsx` that renders only in `NODE_ENV !== 'production'` (returns `notFound()` otherwise).

**Interfaces — Produces:** class `state` (ink layer) and `state-inverse` (white layer). The element names its base colour with a `state-base-<role>` utility (`state-base-surface`, `state-base-sunken`, `state-base-action`, `state-base-inverse`, `state-base-danger`), which sets `--state-base`; default `transparent`. No arbitrary values. `background-color: var(--state-base)`; `@media (hover:hover){ &:hover { background-color: color-mix(in oklab, var(--state-base), var(--state-hover-colour) var(--state-hover-pct)) } }`; `&:active` same with press values; `&:disabled, &[data-disabled]` no layer.

- [ ] **Step 1: Failing e2e** `design-states.spec.ts` at 1440 and 390 on `/dev/states`: for each fixture (`state` on surface, on sunken, transparent; `state-inverse` on action and on surface-inverse): computed `background-color` on hover ≠ rest and darker on light / lighter on dark (compare luminance); `page.mouse.down()` pressed ≠ hover; disabled fixture unchanged on hover.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement utilities + fixture page. **Step 4:** Run → PASS; `cw01`/`type-roles` green.
- [ ] **Step 5:** Commit `feat(web): state layer`.

### Task 4: Button

**Files:** Modify `apps/web/src/components/ui/button.tsx`, `button.test.tsx`.

**Interfaces — Produces:** `Button` props unchanged plus `variant: "primary" | "secondary" | "ghost" | "danger" | "danger-ghost" | "inverse" | "text"` and `size: "sm" | "default" | "lg" | "icon"`. `quiet` stays as a deprecated alias of `secondary` until Task 8 removes it. `icon` requires `aria-label` (TS: discriminated prop type). Every size: `max-narrow:min-h-11`, `icon` also `max-narrow:min-w-11`. `text`: no padding/background/border, hover `text-link-hover underline`, pressed `text-link-hover`.

- [ ] **Step 1: Update tests** in `button.test.tsx`: primary has `bg-action text-fg-on-action state-inverse`; secondary `bg-surface border-border state`; danger `bg-danger state-inverse`; `text` has no `state` class; disabled → `disabled` attribute set, `onClick` not called on click, no `state`/`state-inverse` class; `size="icon"` with `aria-label` renders `max-narrow:min-w-11`; `render={<a href="/x" />}` keeps the `href`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement in the existing cva. **Step 4:** Run → PASS. **Step 5:** Commit `feat(web): Button variants on the state layer`.

### Task 5: Kit components

**Files:** Modify `components/ui/{card,field,select,option-row,calendar,alert-dialog,skeleton,toaster}.tsx`, `chrome/{app-header,public-header,public-footer,logo}.tsx`, `globals.css` base `a`, `:focus-visible`, `@layer components` (`.radio`, `.wp*`, `.route-*`, `.stamp`, `.progress`, `.track*`, `.ask-q`, `.or-rule`, `.preview-row`, `.skeleton`, sheet grab handle) — colours/radii/shadows → roles; drawn px sizes stay. Tests: `card.test.tsx`, `skeleton.test.tsx`, `calendar.test.tsx`, `app-header.test.tsx`.

- [ ] **Step 1: Update tests**: Card `plain` → `rounded-card border-border-subtle bg-surface`, `raised` adds `shadow-raised` (default variant = today's look: `raised`); skeleton uses `bg-surface-sunken`; calendar selected day has `bg-surface-selected` and day buttons have `state`; header current link has `bg-surface-selected` and other links `state`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; links via base `a` (`text-link`, hover `text-link-hover underline`) plus `.link-subtle` utility for header/footer nav; inputs: one input recipe (`border-border bg-surface rounded-control`, focus `ring-focus`, error `ring-error`, `text-body` on phones). **Step 4:** Run unit tests → PASS.
- [ ] **Step 5: Tap-area test** (Review Focus 3) in `design-states.spec.ts` at 390: on `/app` with the guide open, every visible `button, a, [role=button], input` has a bounding box (incl. its `::after` via `elementFromPoint` at box edge +12 px for known small controls) ≥ 44 × 44; drawn size of composer remove stays 18 and send 34.
- [ ] **Step 6:** Commit `feat(web): kit components on roles`.

### Task 6: Hand-written buttons → `<Button>` (guide)

**Files:** `components/guide/{ask-bar,composer,reply,focused-view,opening,guide-pane,citation,crisis-card}.tsx`.

- [ ] **Step 1:** For each `<button>`: pick variant/size by spec §7.1; keep `type`, `onClick`, `aria-*`, `title`, `ref`, children and layout classes; drop its own colour/hover classes. Small icon controls keep drawn size via `className` and their `after:` tap extension. Citation chip per Task 1 decision. Crisis card buttons `inverse`.
- [ ] **Step 2:** `npm test -w apps/web` and `npx playwright test guide guide-widths a11y` → PASS unchanged.
- [ ] **Step 3:** Commit `refactor(web): guide controls use Button`.

### Task 7: Hand-written buttons → `<Button>` (rest of the app)

**Files:** `app/signin/sign-in-form.tsx`, `components/settings/{delete-account,account-section,memory-section,plan-form}.tsx`, `components/workspace/{home-view,roadmap-view}.tsx`, `components/onboarding/answer-rail.tsx`.

- [ ] **Step 1: Failing e2e** (Review Focus 1) in `design-states.spec.ts`: Settings → delete-account trigger at 1440 (on rail) hover background lighter than rest; at 390 (on white) pressed background darker than rest.
- [ ] **Step 2:** Swap as in Task 6; `delete-account.tsx` `render={<button>}` → `render={<Button variant="danger-ghost" … />}` with a `max-narrow:` override of its role variables for the white surface; `plan-form`/`account-section` `p-0` buttons → `variant="text"`; Google button stays `.gsi`.
- [ ] **Step 3:** `npm test -w apps/web`, `npx playwright test` → PASS (`settings.test.tsx:282` updated to the role class).
- [ ] **Step 4:** Commit `refactor(web): app controls use Button`.

### Task 8: Sort every use onto roles, spacing grid, remove aliases, guards

**Files:** all of `apps/web/src/**/*.tsx`, `globals.css`, `utils.ts`, `src/cw01.test.ts`.

- [ ] **Step 1: Failing guard tests** in `cw01.test.ts` (unit cases first, then the repo scan):
  - flags alias/palette colour classes: `bg-ink`, `text-wash`, `border-hairline`, `bg-palette-teal-600`, Tailwind defaults `bg-gray-100`, `text-slate-500`;
  - flags off-grid spacing: `p-1.5`, `gap-3.5`, `mt-0.75`, `px-7`, `space-y-9`; allows `p-4`, `gap-0.5`, `px-page-gutter`; does not flag `size-4.5`;
  - flags `rounded-md`, `rounded-surface`, `shadow-lift`, `shadow-sm`;
  - flags `<button` in a file outside `components/ui/`; allows it inside;
  - `globals.css` has no hex/`rgb(` outside the palette block except the `.gsi` rule.
- [ ] **Step 2:** Run → FAIL with the current violation list. Save the list to the ledger.
- [ ] **Step 3:** Fix every violation by meaning, not by search-replace: each `ink` use → `fg` / `surface-inverse` / `action`; each `white` → `surface` / `fg-on-action` / `fg-on-inverse`; off-grid spacing → nearest allowed step or a spacing role (record each visible shift for Task 9 screenshots); `rounded-md` → `rounded-control`.
- [ ] **Step 4:** Delete aliases from `globals.css`, `quiet` from Button, `lift`/`chosen`/`surface` from `utils.ts`.
- [ ] **Step 5:** `make check` → PASS (typecheck, lint, unit, build).
- [ ] **Step 6:** Commit `refactor(web): roles everywhere; guards on`.

### Task 9: Verify, docs, owner review

**Files:** `e2e/board-compare.spec.ts`, `.claude/constitution.md` (CW01), `.claude/skills/landednz-design-system/SKILL.md`, `docs/design/system/gate/build/`.

- [ ] **Step 1:** Re-baseline `board-compare.spec.ts` on the new board values (colours by role, `floating` radius, grid spacing); every changed expectation cites the board decision in a comment.
- [ ] **Step 2:** `npm run test:e2e -w apps/web` → all PASS (incl. `design-states`, `type-scale`, `a11y`).
- [ ] **Step 3:** Before/after screenshots of every page at 1440 and 390 (before = `feat/type-system` HEAD) into `docs/design/system/gate/build/`; a one-page index lists each visible change and its board decision.
- [ ] **Step 4:** Update CW01 text (roles, not raw tokens; guards listed) and the design-system skill (role names, state layer, Button variants, exceptions).
- [ ] **Step 5:** Commit `docs(web): design system rules and build gate`.
- [ ] **Step 6:** Owner: review screenshots; check pressed feedback on a real phone (Review Focus 5). Then Plan B Tasks 10–11 continue on top.
