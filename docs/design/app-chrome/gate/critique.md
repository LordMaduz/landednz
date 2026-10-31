# App chrome critique — 2026-10-31

Target: `apps/web/src/components/chrome/app-header.tsx`, `logo.tsx` (desktop header nav, avatar account menu, phone tab bar, temporary Guide tab).
Method: dual-agent (A: design review · B: detector + Playwright/axe), isolated. Before-screens: scratchpad chrome-before/, chrome-evidence/.

## Design health score (Assessment A)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | aria-current everywhere; phone active tab is colour-only (muted→ink, teal icon) |
| 2 | Match system / real world | 3 | "Settings" undersells visa/city/arrival answers that rebuild the roadmap |
| 3 | User control and freedom | 3 | Guide tab is a span: looks clickable, isn't |
| 4 | Consistency and standards | 2 | Settings reachable 3 ways on phone (tab, avatar menu, Settings screen has Sign out) |
| 5 | Error prevention | 3 | Sign out flush against Settings, no separator |
| 6 | Recognition rather than recall | 3 | avatar "E" from email: identity not confirmed |
| 7 | Flexibility and efficiency | 2 | no Memory shortcut; no accelerators |
| 8 | Aesthetic and minimalist | 3 | calm; menu minimal to the point of unfinished |
| 9 | Error recovery | n/a | chrome has no error states |
| 10 | Help and documentation | 2 | no route to help from chrome |
| **Total** | | **24/36** | Good band (67%) with clear gaps |

## Design specificity
LLM: mostly generic. The logo (contour lines + waypoint, `logo.tsx:3-11`) is authored and echoes the Home route line; everything else is default SaaS kit (grey-pill nav, initials circle, two-item text dropdown, three-icon bottom bar).
Detector: `impeccable detect` → `[]`, exit 0. Agrees with A that nothing is *wrong* mechanically; the gap is craft, not rule violations.
Overlay: skipped (Playwright test runner, no persistent [Human] tab).

## Cognitive load
3 failures (moderate): grouping (account vs nav overlap), minimal choices on phone (3 routes to Settings, 2 to Sign out), progressive disclosure (menu reveals nothing new).

## What's working
1. Logo is specific and ties brand to the roadmap metaphor.
2. Targets: avatar trigger 44×44, menu items 182×44, phone tabs 130×55; phone back link replaces brand on sub-screens.
3. Semantics: labelled navs, aria-current, "Account, {name}" trigger with aria-haspopup, global teal focus ring (2px, offset 2) on brand/nav/avatar, Base UI roving focus + Esc returns focus to trigger. axe (wcag2a/aa/21aa/22aa): 0 violations on header, bottom nav and open menu at 1440 and 390.

## Priority issues
- **[P1] Account menu is a placeholder** (`app-header.tsx:69-80`). B measured: 192×98 popup, `box-shadow: none` (`--shadow-pop`/`shadow-lift` exist, unused), no identity, no grouping, Sign out flush with Settings, no Memory entry. Fix: identity block (name, email muted), separator, icon items (details, Memory), separator, Sign out with icon in ink; elevation token, ~240 px; Menu.Group/Separator semantics. → shape, polish.
- **[P1] Settings IA** (`:12-16`, `:85-94`). Owner proposal: Settings out of the nav into the avatar menu; phone third tab "You". A's counterpoint: this Settings holds the roadmap-building answers (visa, city, household, work, arrival, Memory), a primary destination; removing it leaves 2 phone tabs (Material 3 nav bar = 3–5 destinations). Agreed by both: phone header avatar duplicates the tab below; third phone tab renamed "You". Open: desktop nav keeps a "Your details" tab or not. → shape (owner decision).
- **[P2] Active states default-looking, inconsistent across widths** (`:11`, `:19`). Desktop current = filled grey pill (bg-hairline, owner rejected pills); phone current = text colour + icon tint only. Fix: desktop ink text + 2 px baseline indicator, no fill; phone semibold label + teal (optionally filled) icon. → polish, typeset.
- **[P2] Guide tab is a non-interactive span styled like links** (`:54`). Screen reader hears a current item that can't be activated. Fix: keep it (owner decision 2026-10-31) but give it a distinct "mode" look with a close ×, or render as the current item with no link styling. A's alternative (drop the tab, full view = state of the page) recorded, not adopted. → clarify.
- **[P3] Phone tab bar ignores safe area** (`:85`): fixed h-14, no env(safe-area-inset-bottom); inert today (no viewport-fit=cover) but breaks as a PWA. → adapt.

## Persona red flags
- Casey (phone): avatar in the hardest thumb zone repeats the tab below it; ask bar sits right on the tab bar (mis-tap risk).
- Sam (a11y): Guide span with aria-current; menu has no groups/separator; menu item focus = background only (1.23:1 vs white; passes 2.4.7 AA, fails 2.4.13 AAA); phone active state leans on colour.
- Jordan (first-timer): "Settings" doesn't say "fix your visa/arrival date here"; "E" doesn't confirm the account.
- New skilled migrant (ESL): plain "You"/"Your details" reads better than "Settings"; easy accidental Sign out after long onboarding.

## Minor observations
- Brand `onClick={close}` sits on the wrapping span (`:45`); belongs on the Link.
- Avatar mint (`bg-avatar`) reads as a status chip; consider ink or a ring.
- Desktop nav links are 36 px high (fine for pointer; 24 px floor met).
- Mouse-opened menu highlights nothing; keyboard-opened highlights first item (Base UI default, fine).
- A flagged "phone tabs don't call close": false positive — the full view needs ≥1024 px and the phone tab bar only shows below `narrow`, so they never coexist.
- Next.js dev badge overlaps bottom-left in screenshots; hide it for board captures.

## Questions to consider
1. What does the phone header avatar earn if it repeats the tab beneath it?
2. Is the third destination "Settings" or "Your situation": the facts LandedNZ plans from, with Memory beside them?
3. Is the guide's full view a place or a state of the page you came from?

## Not checked
Tablet widths 561–1023, phone tab focus ring, menu on /app/roadmap and /settings, Guide tab rendered state (B).
