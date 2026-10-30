# Guide UI — impeccable shape record (Plan B Task 8)

Date: 2026-10-30. Skill: impeccable `shape` (+ frontend-design). Target: the settlement guide (chat) only; whole app read-only context.

## Setup
- `impeccable context --target apps/web/src/components/assistant/ask-panel.tsx` → NO_PRODUCT_MD, BUILD_INIT_REQUIRED, EXISTING_VISUAL_SYSTEM (incumbent r1-final in code), MANUAL_DETECTOR_REQUIRED (run `impeccable detect` at build, Task 9).
- init: owner answered voice = calm checked expert; first proof = answers are checked; entry/aurora = directions may rethink (owner, 2026-10-30). Written to `apps/web/PRODUCT.md`, scoped to the guide.
- Mode: Operate. Path: "Create a whole surface inside an established world" — visual system fixed (r1-final tokens: ink #0F2A3A, teal #0E7C7B, tint #F3F9F8, hairlines, Geist, 8/12 radii, `--shadow-lift`). Code-led (Operate surface; no image generation).

## Grounded structures (ranked by resonance)
1. Push-aside panel — 440 px guide panel on the right; the page reflows beside it; phone = full-screen view with Back.
2. Docked column — guide permanently docked on wide screens, collapsible.
3. Guide room — its own page with a context column (where you came from, history by task) and a reading column.
4. Threads in place — task questions live as a section inside the task page.
5. Margin notes — answers pinned beside the step they concern.
6. Ask line + rising sheet — one ask field on every workspace screen; answers rise in a sheet over the page.
7. 50/50 split peek — page and guide share the screen equally.

## concept-seed (surface, operate)
Key 47daec4af15ad1aede7ffd724fa8396f. DEALT INDICES 3, 6, 1 (3 leads).
→ A (THE ROLL) Guide room · B Ask line + rising sheet · C Push-aside panel.
Docked (spec variant) is shown inside C at 1440 on the task screen. No pick card: my top candidate (1) was dealt.

## Challengers (catalog) — verdicts
| Source ID | Verdict | Kept |
|---|---|---|
| vernacular-ephemera-boarding-pass-and-gate-board | declined (identification ✓ travel, clarity ✗ — guide changes nothing to rerank) | "A change stays lit until noticed": Remembered and unverified notes hold their tint until the user acts. |
| aww2-zoo-gardens-guide-map | declined (both) | — (colour world conflicts with fixed tokens) |
| pop-culture-shelf-vertical-video-feed-surface | declined (both) | One item owns the view: the newest answer is anchored at top of the reading column. |
| design-annual-s-plate-section | declined (both) | Registration discipline: every source shown with its domain and checked date. |
| crouwel-grid-specimen | declined (both) | — |
| variable-font-specimen | declined (both) | — |

## Shared signature move
The checked band: each answer opens with its origin line ("From LandedNZ's checked guide" / "From official sites, checked today") and closes with numbered sources in the task page's Sources style (superscripts → numbered list with domain). Aurora hairline kept only while an answer streams (owner allowed rethink; it now means "being written").

## Recommendation
C (push-aside panel): it keeps the user on the task they asked from (PRODUCT principle 2) and adds no new route. A is strongest for long reading but leaves the task; B is fastest to reach but covers the page being asked about.

## Boards (claude.ai artifacts, owner only)
- A Guide room: https://claude.ai/artifact/4QLVkxdWCk63JCHvRt5r1Z (`docs/design/guide/direction-a.html`)
- B Ask line: https://claude.ai/artifact/Tsm6E1YTsLbqNViJ6Ty3uC (`direction-b.html`)
- C Side panel (recommended): https://claude.ai/artifact/2h6YHMRBoHsRe8KdjaWYqJ (`direction-c.html`)
Each covers spec §8.2: placement home/roadmap/task at 1440 and 390, opening, conversation + edge states, memory (in-chat + Settings → Memory), task-screen columns. One Playwright look per board; fixed: composer/ask-line Send stretching, meta wrapping, eyebrow on Memory, per-direction header in Settings.

## Round 2 (owner steer, 2026-10-30)
Owner: A–C "not very premium"; asked for a modern premium assistant approach, "forget existing designs". Treated as a user-pinned direction (impeccable new-work: a pinned direction beats the roll), so no concept-seed re-roll. A, B, C retired.
- D · Assistant pane: https://claude.ai/artifact/M2JkS6ebyZ6BrGzwishjYN (`docs/design/guide/direction-d.html`, generator `docs/design/guide/src/gen2.py`)
- Inset floating pane (push-aside), header Ask + `/` quick ask (**superseded**: quick ask removed in critique-d; header Ask replaced by the ask bar in Round 3), expand to a focused reading view, phone sheet.
- Question set as heading, answer as 16–17 px reading text, inline numbered citations with preview, crafted composer (context chip, daily count, Send→Stop), aurora on the composer edge only while writing, sentence settle-in (off under reduced motion).
- No shared chrome changed (**superseded** by Round 3: header Ask removed). Host pages stay r1-final.
- Checks: one Playwright look per section at 1320; fixed class collisions (.note/.next with r1 base), list citations wrapping, section notes, "1 sources".

## Round 3 (owner, 2026-10-30): where you can ask
Owner: no Ask in Settings; header Ask is old-fashioned; show the guide only on Home, Roadmap and Task in a modern way.
- Header Ask removed (shared chrome change, owner-approved). Settings has no entry; Settings → Memory stays.
- Entry = a floating ask bar, bottom centre of the page area, contextual text ("Ask about your IRD number"), `/` shortcut; grows into the pane, settles back on close; teal dot when an answer arrived while closed; pages reserve bottom space so it never covers the last item.
- Phone: bar above the tabs on Home/Roadmap; Task keeps the approved bottom bar (Mark as done + Ask).
- Width rules: Settings rows dropped (pane never opens there); navigating to Settings closes the pane, conversation kept.
