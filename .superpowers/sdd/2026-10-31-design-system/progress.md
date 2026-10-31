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
Task 3: complete (commits 1197b00..f56ede5, tests: npx playwright test -c /private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/bfe98454-0a47-4629-98aa-923a220290ac/scratchpad/pw.config.ts --reporter=line design-states →   2 passed (2.3s))
Task 4: Ruling: render test asserts the `href` on the rendered `<a>`, not role "link" — Base UI gives a non-native button role="button" (unchanged behaviour) — cost if wrong: none.
Task 4: Ruling: `text` variant gets its phone tap area from `after:absolute after:-inset-3` (Tailwind 4 sets content on after:), and drops size min-h/padding via a compound variant; disabled `text` stays text (muted), other disabled variants keep today's wash look — cost if wrong: one class string.
Task 4: Ruling: `landing.test.tsx:12` and `roadmap-view.test.tsx:108` count the one primary by `bg-action` instead of `bg-ink` (class-name tests updated with the change, §7.3).
Task 4: complete (commits f56ede5..5688c82, tests: npm test -w apps/web → 423 passed, typecheck clean)
Task 4 (found in Task 5): typecheck failed on `buttonVariants({ variant: "quiet" })` call sites (page.tsx, legal-page, question-step, home-view, roadmap-view, task-sheet); the Task 4 "tc=0" run was wrong. Fixed in Task 5: `quiet` stays in the cva map as the `secondary` string until Task 8.
Task 5: TDD order slip: the component edits were written before the updated class tests (tests then run green); the tap-area e2e was written first and failed (footer Privacy/Terms 40×36, 33×36) before the fix.
Task 5: Ruling: new roles for today's values with their own meaning: `border-strong` (slate-500, input/radio edges, 3:1 vs white, WCAG 1.4.11; the board's field used the light `border` colour, which would fail 3:1, so today's edge stays), `fg-accent` (teal-700 text that is not a link: stamps, chips, today label), `surface-inverse-raised` (ink-700 logo tile on the rail) — cost if wrong: three roles to fold.
Task 5: Ruling: the avatar and its account menu (app-header avatar span, Menu.Popup, menuItem) are left on old names: owner deferred decision 3 and the other session is redesigning that menu; Task 8 sorts them after that work lands — cost if wrong: the Task 8 guard flags them until then.
Task 5: Ruling: toast text uses `fg-on-action` (white) on `surface-inverse` — `fg-on-inverse` is the muted rail grey and would dim the toast; the toast action keeps its text look with `state-inverse` instead of becoming a primary Button (an ink-filled button on an ink toast would vanish) — cost if wrong: one class each.
Task 5: Ruling: Calendar chosen day moves from an ink fill to the selected look (surface-selected + shadow-chosen), per spec §5/§7.2 and the plan's test; header current link from hairline grey to surface-selected (board panel "Selected rows, nav"); footer Privacy/Terms become `link-subtle` (muted, ink + underline on hover). Visible; for Task 9 screenshots.
Task 5: Ruling: footer links' phone tap area comes from an `::after` reaching 8 px up and 8 px sideways (not down: it grew the page height, footer.spec 37→41).
Task 5: Ruling: tap-area e2e skips inline links inside p/li (WCAG 2.5.8 inline exception) and radios (the whole label row is the target).
Task 5: complete (commits 5688c82..ae79949, tests: npm test -w apps/web → 424 passed; e2e footer/design-states/a11y/guide-widths green except pre-existing 390 roadmap target-size)
Task 6: Ruling: list-like guide controls (opening starters, focused-view starters and task rows, reply follow-ups) use `<Button variant="ghost">` with row overrides (`h-auto justify-start whitespace-normal rounded-none border-0 border-t …`) — no list-row kit component exists and the plan names Button — cost if wrong: one Row component later (piece 3).
Task 6: Ruling: small icon controls keep their drawn size by overriding `size="icon"` (`size-8.5`/`size-8`/`size-4.5` + `max-narrow:min-h-0 max-narrow:min-w-0`) with their existing `after:` tap extension; disabled Send keeps today's track/border fill via `disabled:` classes over the Button's disabled variant.
Task 6: Ruling: citation chip (decision 4): state layer on surface-selected; open popup = `shadow-chosen` (selected look) instead of a solid teal fill. Crisis-card tel links are links on a translucent white tile: kept as links with alpha hover plus a new `active:` press (no state-base role for a translucent tile); distress mechanics untouched.
Task 6: e2e guide, guide-widths, a11y, design-states: 11 passed; only the pre-existing 390 roadmap target-size. Screenshots of guide at 1440/390 checked by eye: no drift beyond the state layer.
Task 6: complete (commits ae79949..495b5ca, tests: npm test -w apps/web → 424 passed; e2e guide suites green)
Task 7: delete-trigger e2e written first and failed (rail hover rest = hover). Ruling: trigger is `Button variant="danger-ghost"` with `state-inverse` at desktop and `max-narrow:state` on phones (role-variable override, spec §5); sign out and plan "Change" use `variant="text"` with `link-on-inverse` text on the rail (sign out keeps its phone bordered look). Owner 2026-10-31: e2e runs once after all tasks, so Task 7 is closed on unit 424 + typecheck; its e2e runs in the final pass. Roadmap 390 target-size (`Show` -ml-3) left as pre-existing.
Task 7: complete (unit 424 passed, typecheck clean; e2e deferred to final run)
Task 8: guard tests written first; failed with 214 colour, 21 radius, 8 shadow, 84 off-grid spacing, 7 <button>, 1 globals.css hex. Fixed; aliases, `quiet` and old cn names deleted. Unit 428, typecheck, web lint, web build green. `make check` API tests fail only on environment (an API test listens on 3001, held by the owner's dev API); no apps/api changes on this branch.
Task 8: Ruling: colour sorting by utility, not search-replace of one name: `bg-ink`→`surface-inverse`, `border/ring-ink`→`fg`, `text-white`/`stroke-white`/translucent `bg-white/N`→`fg-on-action`, `bg-white`→`surface`, `ring-white`→`surface`, `text-teal-text`→`fg-accent`; all same values as before (no visible change). Avatar/account menu classes renamed too (same values), so the other session's merge is renames only.
Task 8: Ruling: off-grid spacing moved to the nearest step, ties up (101 shifts, listed in docs/design/system/gate/spacing-shifts.txt for the Task 9 review); structural offsets got spacing roles instead: `tab-bar` 56, `rail-indent` 120, `sheet-clear` 160. Positions (top/left/bottom/right) and sizes are not guarded. The state fixture page (`app/dev/`) and the `.gsi` Google button are exempt from the <button> rule.
Task 8: complete (unit 428 passed, typecheck, lint, build green)
