# Size roles + desktop density: impeccable audit (2026-11-01)

Score 16/20 (Good). P0 0 · P1 0 · P2 4 · P3 6. Implementation integrity: pass with gaps.

## Controller disposition

| Finding | Sev | Status |
|---|---|---|
| Desktop density on touch tablets (globals.css desktop block) | P2 | FIXED with critique C1 (`pointer: fine` gate) |
| Tablet control-sm 32 px (Prev/Next 40→32 via size "sm") | P2 | Logged; the size "sm" change was an owner-review fix (6/6 centred) |
| Onboarding footer removed (question-step.tsx) | P2 | No change: owner asked for this after the 1512 review; preview keeps the footer |
| Guard blind spots (size-8 etc., arbitrary values, CSS height) | P2 | Logged (= critique C6) |
| P3s (tablet comment, dead max-narrow min-h-0, calendar h-target→min-h-target, utils/globals sync test, 561–640 ask-bar overflow pre-existing, nowrap button at 200%) | P3 | Logged |

---

# Audit (full output)

# Technical audit: size roles + desktop density (feat/desktop-density, uncommitted)

Scope: `git diff` in /Users/ruchira/Development/NZ_Project/landednz-r0cloud (33 modified files + new apps/web/src/app/size-roles.test.ts). Nothing was fixed or edited.

Evidence used:
- Code read of every changed file, plus a grep of all of apps/web/src.
- A tailwind-merge run of `cn()` from apps/web/src/lib/utils.ts on 19 class pairs.
- `vitest run size-roles.test.ts button.test.tsx`: 13 of 13 pass.
- `impeccable detect --json` on the 26 changed .tsx files and globals.css: exit 0, `[]`.
- Existing pass-2 measurements (now-pass2-390/1024/1440.json).
- A new Playwright probe of 12 page states at 390/560/561/768/1023/1024/1180/1440. It checked horizontal overflow, focus rings clipped by overflow ancestors (outline 2 px + offset 2 px), content overflowing fixed-height role boxes, and nowrap overflow. It ran axe (wcag2a/aa, 21aa, 22aa) at 768/1024/1180. It also simulated 200% text-only zoom and WCAG 1.4.12 text spacing at 768/1024/1440. Raw results: /private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/01f2ed40-a3ad-4ef7-af8a-769836a7b87d/scratchpad/audit/probe.json

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | No WCAG AA failures from the change: all targets are 24 px or more, no focus ring is clipped, axe is clean at 1024/1180. Desktop density also applies on touch iPads. |
| 2 | Performance | 4 | CSS custom properties only. No JS, no new layout work. |
| 3 | Theming | 3 | Roles are consistent and the merge config is correct. Some sub-36 px interactive controls (32 to 34 px) still use raw sizes outside the roles. |
| 4 | Responsive | 3 | Breakpoint edges 560/561 and 1023/1024 are clean. 40 px horizontal overflow at 561 to about 640 (existing, not from this change). Tablet changes contradict the "tablets unchanged" comment. |
| 5 | Implementation integrity | 3 | Tests pass and detect is clean. The guard has blind spots. Dead phone resets remain. Onboarding lost its footer, an unrelated behaviour change. |
| **Total** | | **16/20** | **Good** |

## Implementation Integrity verdict: PASS (with gaps)

- `impeccable detect --json` on all 26 changed .tsx files: exit 0, zero findings. globals.css: exit 0, `[]`.
- size-roles.test.ts and button.test.tsx: 13 of 13 pass.
- tailwind-merge with the new roles resolves correctly:
  - `size-control + size-8 → size-8`
  - `min-h-control + min-h-target → min-h-target`
  - `h-control + h-9 → h-9`
  - `min-h-control-sm + min-h-control → min-h-control`
  - `size-avatar + size-18 → size-18`
  - `top-header + top-14 → top-14`
  - variant prefixes stay separate: `min-h-control` and `max-narrow:min-h-control-lg` both kept
- Namespace collisions: no `--spacing-*` role shares a name with any `--container-*`, so the ask-bar class of bug is gone. The test now guards this. `--radius-control` and `--spacing-control` live in different utility families (`rounded-*` vs `h-*`/`size-*`), and tailwind-merge keeps them in separate groups.
- Gaps (listed below as P2/P3): the guard regex covers only the 36 to 64 px numeric steps. The `cn()` spacing list is hand-copied from globals.css with nothing linking the two.

## Executive summary

Counts: P0 0, P1 0, P2 4, P3 6.

Top issues:
1. Desktop density (32 to 36 px controls) is triggered by width alone (`@media (width >= 1024px)`). iPads in landscape (1024/1180/1366) and iPad Pro portrait (1024) get desktop-sized touch targets.
2. Tablets 561 to 1023 (iPad portrait) get 32 px `control-sm` (Previous/Next task, Copy, sources, memory Edit/Delete). Both 1 and 2 pass WCAG 2.5.8 but fall below Apple HIG 44 pt and Material 48 dp.
3. `question-step.tsx` dropped `<PublicFooter />`. Onboarding steps 1 to 5 lose the "not legal or tax advice" line and the Privacy/Terms links at every width, including 390. That breaks the "phone 390 identical to main" claim and is outside a size-only change.
4. The size-roles guard misses real interactive controls under 36 px: ask-bar Send `size-8`, guide pane Close/Expand `size-8`, the sign-in "Your roadmap preview" link `h-8`, and composer Send `size-8.5`.

## Detailed findings

### P2: Desktop density applies to touch tablets at 1024 px and up
- **Location:** apps/web/src/app/globals.css:251 (`@media (width >= 1024px)`)
- **Category:** Responsive / Accessibility
- **Impact:** iPad landscape gets control 36, control-sm 32, target 36, row 36 and header 44, measured at 1024 and 1180. For example, Send 32x32, guide Close 32x32, Previous/Next 32 px tall. On a touch screen this means more mis-taps on the Send button, close buttons and calendar cells (36 px).
- **Standard:** WCAG 2.2 SC 2.5.8 (AA, 24x24) is met, so this is not a violation. It falls below Apple HIG "Buttons: at least 44x44 pt" (https://developer.apple.com/design/human-interface-guidelines/buttons) and Material 3 "48x48 dp" (https://m3.material.io/foundations/designing/structure#dab862b1-e042-4c40-b2d4-1ab17ac53b2a). WCAG 2.5.5 AAA asks for 44.
- **Recommendation:** Gate the density block with `(width >= 1024px) and (pointer: fine)`, or move the target-like roles (control, control-sm, target, row) into a nested `@media (pointer: fine)`. Keep the type and container changes width-only. globals.css already uses `(hover: hover)`, so the pattern is in place.
- **Command:** `/impeccable adapt`

### P2: Tablet `control-sm` is 32 px on touch screens (561 to 1023)
- **Location:** globals.css:239 (`--spacing-control-sm: 32px` in `@media (width >= 561px)`); users at task-sheet.tsx:296 and :306, reply.tsx:277 and :282, memory-section.tsx:103/104/121/122, focused-view.tsx:47/57/82, guide-pane.tsx:72/104, roadmap-view.tsx:57, preview-route.tsx:47
- **Category:** Responsive
- **Impact:** iPad portrait (768 to 1023) is touch-first. Previous/Next task went from 40 to 32 px (task-sheet changed `size` to `"sm"`). Before this change, small buttons were already 32 at tablet width but default buttons were 40.
- **Standard:** WCAG 2.5.8 met. Apple HIG 44 pt and Material 48 dp not met.
- **Recommendation:** Make tablet `control-sm` 40, or apply the same `pointer: coarse` floor of 44 to all target roles.
- **Command:** `/impeccable adapt`

### P2: Onboarding footer removed (behaviour change; breaks "390 identical")
- **Location:** apps/web/src/components/onboarding/question-step.tsx (import line 7 and `<PublicFooter />` near line 106 deleted)
- **Category:** Implementation integrity / content
- **Impact:** `/onboarding?step=1..5` no longer show "General information, not legal or tax advice." or the Privacy/Terms links, at any width. The other public pages still have the footer (page.tsx:52, signin/page.tsx:29, legal-page.tsx:84, preview-route.tsx:178). This is the data-entry flow (visa, city, family, work), where a privacy link matters most. It contradicts the stated goal that phone 390 is identical to main and that a UI change leaves behaviour unchanged.
- **Standard:** Project rule "UI revamp = no behaviour change". WCAG 3.2.3 Consistent Navigation applies loosely, since the legal nav is repeated on every other public page.
- **Recommendation:** Confirm with the owner whether this was intended. If not, restore the footer. If it was, record the decision and move the change to its own commit.
- **Command:** `/impeccable critique` (owner decision)

### P2: Size-roles guard misses interactive controls under 36 px and arbitrary values
- **Location:** apps/web/src/app/size-roles.test.ts:15 (`RAW` matches only steps 9 to 16) and :37 (CSS check covers only `min-height: 36–69px`)
- **Category:** Theming / integrity
- **Impact:** The test comment says icons and marks under 36 px stay raw, but these real buttons and links are sized raw and do not follow the roles:
  - ask-bar.tsx:167, Send `size-8` (32 at every width)
  - guide-pane.tsx:25, IconButton `size-8 … max-pane:size-target` (32 on desktop)
  - sign-in-form.tsx:119, link `h-8` (32 px fixed height at every width, including phones, where every other target is 44)
  - composer.tsx:122, Send `size-8.5`
  - app-header.tsx:91, Close `size-6`, extended with `after:-inset-2`
  - composer.tsx:100, `size-4.5`, extended with `after:-inset-4`

  The regex also misses `h-[44px]`, `min-h-[2.75rem]`, `h-17` and up, and `h-(--x)`. The CSS check misses `height:` declarations; for example, globals.css:464 has `.route-dot { height: 44px }`, which is unused, dead CSS.
- **Recommendation:**
  - Size these controls with `size-control-sm` (or a new `icon` role).
  - Extend `RAW` to arbitrary `[..px|rem]` values and steps 7, 8, 8.5 and 17 and up on interactive elements. Allow the `after:-inset` tap extensions as an exception.
  - Change the CSS check to cover `height|min-height` in px and rem.
- **Command:** `/impeccable harden`

### P3: The "phones and tablets unchanged" comment is wrong for tablets
- **Location:** globals.css:248 (desktop density comment)
- **Category:** Integrity / docs
- **Impact:** Tablet changes in this diff:
  - Previous/Next 40 → 32
  - Home top-task button 44 → 40
  - Calendar month nav 36 → 40
  - Roadmap rows 36 → 40
  - Task "Tasks" bar 56 → 64 tall: `pb-2` inside `min-h-14` became `mb-2` outside `min-h-header` (task-sheet.tsx:279)

  They all follow the role table, but reviewers relying on the comment will skip tablet checks.
- **Recommendation:** Reword the comment as "phones unchanged; tablets follow the role table". Run a 768 screenshot pass.
- **Command:** `/impeccable polish`

### P3: Dead phone-reset classes left over after `max-narrow:min-h-11` was removed
- **Location:**
  - composer.tsx:100 and :122 (`max-narrow:min-h-0 max-narrow:min-w-0`)
  - app-header.tsx:91 (same)
  - reply.tsx:268 (`max-narrow:min-h-0`)
  - ask-bar.tsx:64 (`max-narrow:min-h-0`)
  - button.tsx:30 (compound `max-narrow:min-h-0`)
- **Category:** Theming / cleanliness
- **Impact:** None at runtime, because the role is in the base class and `min-h-0` already overrides it. This is noise that suggests a phone override still exists.
- **Recommendation:** Delete the `max-narrow:min-h-0`/`min-w-0` duplicates.
- **Command:** `/impeccable distill`

### P3: Calendar day cells use a fixed `h-target` (36 on desktop); text overflows at 200% text-only zoom
- **Location:** apps/web/src/components/ui/calendar.tsx:72
- **Category:** Accessibility
- **Impact:** With text tokens doubled (Firefox or Safari text-only zoom), every day cell at 1024/1440 has `scrollHeight > clientHeight`. A 26 px text-ui with 1.45 leading is about 38 px, more than 36. The content stays visible because overflow is visible, so nothing is lost. Before the change the cell was a fixed 44.
- **Standard:** WCAG 1.4.4 Resize Text: passes, with minor overlap.
- **Recommendation:** Use `min-h-target` (grid rows grow) in place of `h-target`.
- **Command:** `/impeccable harden`

### P3: Nowrap button overflows at 200% text
- **Location:** task-sheet.tsx action link via `buttonVariants` (button.tsx:9 base `whitespace-nowrap`), "Open the IRD application (opens…)" at 1024/1440
- **Category:** Accessibility / responsive
- **Impact:** At 200% text the label overflows its box by 5 px (321 vs 316). This is a property of the button base class, not of this change.
- **Recommendation:** Allow wrapping (`whitespace-normal`) on full-width action links.
- **Command:** `/impeccable harden`

### P3: `cn()` spacing list is hand-synced with globals.css
- **Location:** apps/web/src/lib/utils.ts:12 to 15
- **Category:** Integrity
- **Impact:** A new role added to globals.css but not to utils.ts would merge wrongly, for example `min-h-newrole min-h-9` keeping both classes. No test links the two files. Containers are not taught either: `cn("w-ask-bar","w-control")` keeps both classes. That is existing behaviour.
- **Recommendation:** Add one assertion to size-roles.test.ts: every `--spacing-*` role parsed from globals.css appears in the utils.ts spacing list.
- **Command:** `/impeccable harden`

### P3 (existing, found in the sweep): 40 px horizontal overflow at 561 to about 640
- **Location:** ask-bar.tsx:64 to 66 (`w-ask-bar` = 640 px container; `w-full` only below 561)
- **Category:** Responsive
- **Impact:** On `/app`, `/app/roadmap` and `/app/roadmap?task=T08` at 561, the document scrolls sideways by 40 px. This also happens on a 1280 px laptop at about 200 to 228% browser zoom. This change did not cause it (those classes are unchanged), but it sits on the 561 edge this audit was asked to check.
- **Standard:** WCAG 1.4.10 Reflow (320 px) is not directly failed. This is a reflow defect at zoom.
- **Recommendation:** `w-ask-bar max-w-full`, or make `max-narrow:w-full` apply up to the bar's own width.
- **Command:** `/impeccable adapt`

## Patterns and systemic issues

1. **Width is used as a proxy for input type.** The whole density model (phone 44 / tablet 40 / desktop 36) keys on viewport width. Touch tablets of 768 to 1366 px fall into the reduced-target bands. The fix is one media-feature condition and does not need new roles.
2. **Icon-size controls sit outside the role system.** Every role starts at 32 to 36 px, so 32 to 34 px icon buttons (Send, Close, Expand) keep raw `size-8`, which the guard explicitly allows. A `control-icon` role, or reuse of `control-sm`, would bring them into the same per-breakpoint system.
3. **Leftover phone overrides.** Phone min-height moved into the roles, but the `max-narrow:min-h-0` counter-classes stayed behind in 6 places.

## Positive findings

- Focus rings: zero clipped focus rings across all 12 states at all 8 widths. The global `:focus-visible` outline 2 px + offset 2 px fits: header 44 holds a 36 px control with a 4 px ring.
- WCAG 2.5.8: the smallest standalone targets at 1024 to 1440 are 32x32 (Send, Close, control-sm), well above 24. Settings "Change …" buttons draw 20 px wide, but their `after:inset-0` covers the whole 48 px row.
- Phone 390 keeps 44 px controls/targets, crisis links stay `min-h-touch` 44 at every width, and the ask bar stays 48. Sizes at 390 match main, except for the onboarding footer removal above.
- Breakpoint edges: 560 vs 561 and 1023 vs 1024 show no overflow or clipping regressions. axe (WCAG 2.2 AA) is clean at 1024 and 1180.
- Text wrapping: almost everything uses `min-h-*`, not `h-*`. Multi-line guide follow-ups grow correctly (44 to 73 px measured). Fixed heights remain only on the header bar, calendar cells, the ask-bar wrapper and an aria-hidden figure. At 200% text and with 1.4.12 text spacing, the header and ask bar did not overflow.
- `--spacing-ask-bar-clear` and `--spacing-guide-pane` now derive from the roles (`calc(var(--spacing-ask-bar-height) + 28px)`), so scroll padding (SC 2.4.11) follows the bar height at every breakpoint.
- Test 4 in size-roles.test.ts structurally prevents the earlier `ask-bar` spacing/container collision.
- Single source of truth: 12 roles × 3 breakpoints live in one commented table in globals.css. button.tsx variants dropped 4 per-breakpoint overrides for one role each.
- No colours, motion or JS were added. Reduced-motion handling is unchanged.

## Recommended actions

1. **P2:** Decide the onboarding footer: restore it or get owner sign-off (question-step.tsx). Use `/impeccable critique`.
2. **P2:** Gate target-sized desktop and tablet roles on `(pointer: fine)`, so touch tablets keep 44 targets (globals.css:233/251). Use `/impeccable adapt`.
3. **P2:** Bring Send/Close/Expand/sign-in back link into a role and widen the guard regex to arbitrary and sub-36 values on interactive elements, plus CSS `height:` (size-roles.test.ts:15/37). Use `/impeccable harden`.
4. **P3:** Add a test that keeps the utils.ts spacing list in step with the globals.css roles. Fix the "tablets unchanged" comment. Delete the dead `max-narrow:min-h-0` classes and `.route-dot`. Use `/impeccable polish` and `/impeccable distill`.
5. **P3:** Calendar cell `h-target` → `min-h-target`. Ask bar `max-w-full` for 561 to 640. Use `/impeccable harden` and `/impeccable adapt`.
6. Then re-run `/impeccable audit`.

Not verified:
- Real iPad hardware.
- Whether iPadOS Safari auto-zooms on 15 px inputs at 1024 and up (`--text-body` is 15 at desktop; globals.css:88 says fields stay 16 to avoid the iOS zoom).
- The guide full-view and account-menu states in the new probe. Those were covered by the existing pass-2 JSON only.
- The one axe `target-size` hit at 768 on `/app` (week footer link `min-h-6`) came from the sticky ask bar covering the link, because the probe did not scroll to the bottom as e2e does. I did not count it, but it hints at an existing SC 2.4.11 gap: `scroll-pb-ask-bar-clear` applies only from 1024, while the ask bar also floats at 561 to 1023.
