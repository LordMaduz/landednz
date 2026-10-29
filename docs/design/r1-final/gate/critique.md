# Impeccable critique and audit, final screens (P7 Step 4)

WARNING: DEGRADED: single-context. The critique prescribes two isolated sub-agents (design review, detector). This agent has no sub-agent tool, so both ran inline in one context, design review first, then detector. Run date 2026-10-29, target apps/web (all pages in the gate screenshots in this folder plus source). Context: PRODUCT.md (Operate mode for signed-in pages, Persuade for landing).

## Assessment A: design review (from the gate screenshots and code)
Specificity: the road/rail, "You're here" pill, unlock arcs, Today line and the dark answers panel are specific to a dependency-aware settlement roadmap; not interchangeable with another product.
Heuristics (0-4): visibility of status 4 (day count, done count, Today line); match to real world 3 (task names are plain English); user control 4 (undo, Cancel, Back); consistency 3 (every section a Card; one page-width difference vs boards, below); error prevention 3; recognition 4; flexibility 3 (Ask `/` shortcut); minimalism 3; error recovery 3 (ApiDown retry); help 3 (sources beside steps).
Cognitive load: Home shows one next move plus three rows; Roadmap collapses stages ("Show n more"); Settings shows one question at a time. No decision point over 4 options except the visa list (8 radios, a single question).
Strengths: one obvious next step per page; calm type scale (e2e enforced); cited sources visible.
Findings:
- P0: none.
- P1: none.
- P2: signed-in content column is 1072 px at 1440 (--container-page 1120 minus 24 px padding) against the boards' 1200 px, and the phone side gutter is 24 px against the boards' 16 px. Not fixed: owner decision (shared by public pages and the road geometry).
- P2: Home phone "Roadmap" link (59x19 px) and Roadmap task row links (23 px tall) under the 24 px target size (WCAG 2.2 SC 2.5.8). FIXED (min-h-6 on both).
- P3: Roadmap shows a subtitle "Done some already? Open a task and mark it done." not on the board.
- P3: Task page scrolls as a whole; the board scrolls inside the card. Content-driven.
- P3: dev-only Next.js badge in screenshots.

## Assessment B: detector and measured evidence
- `impeccable detect --json src`: `[]` (0 findings), before and after the fixes.
- Measured at 390x844 (signed-in, six routes: /, /signin, /app, /app/roadmap, /app/roadmap?task=T08, /settings): no horizontal overflow; before the fix 2 targets under 24 px (Home "Roadmap" link 59x19, task row link 236x23); after the fix 0.
- axe (wcag2a/2aa/21aa/22aa) via e2e a11y at 1440 and 390 on all pages including the Save screen and the date step: 0 violations.
- Type scale via e2e type-scale on public and signed-in pages: 0 offenders.
- Reduced motion: respected (useReducedMotion hook, globals.css rule).

## Audit scores (0-4)
Accessibility 4, Performance 3 (not profiled; no layout thrash seen), Theming 4 (tokens in @theme, light only), Responsive 3 (one gutter difference vs boards), Implementation integrity 4 (detector clean).

## Outcome
No P0/P1. P2/P3 target-size items fixed; width/gutter handed to the owner.
