---
name: landednz-design-system
description: Use when building or changing any LandedNZ web UI in apps/web (a page, row, card, form, dialog, toast, header, route rail or assistant reply), or when unsure which colour, type size, spacing, radius or Button variant a LandedNZ element takes.
---

# LandedNZ design system (Precise)

Every visual value is a token in `apps/web/src/app/globals.css` `@theme`. Code uses only these classes; `src/cw01.test.ts` fails on raw hex, `[13px]`-style or any `utility-[value]` class and on inline colour styles. **Required first step: read the board.** Open the page's approved board in `docs/design/r0-boards/` before writing any markup, and build what it shows: its sections, copy and order. Add nothing it does not show (no extra avatar, hint line or icon). `ui_parts.py` holds exact values. A page with no approved board is not built (CW02′).

| Route | Board (+ `*Phone.dc.html` at 390) |
|---|---|
| `/` | `Landing.dc.html` |
| `/onboarding`, `/onboarding/preview` | `Onboarding.dc.html` (`scenario` questions / preview) |
| `/signin` | `SignIn.dc.html` |
| `/app` | `Home.dc.html` (`firstUse`) |
| `/app/roadmap` | `JourneyHome.dc.html` (`scenario` default / open / streaming / first / error) |
| `/settings` | `Settings.dc.html` (built by `build_settings_legal.py`) |
| `/privacy`, `/terms` | `Legal.dc.html` |

## Colour roles

| Class | Use for |
|---|---|
| `ink` | Text, primary button fill |
| `muted` | Secondary text, meta, explanations |
| `control` | Field and select borders, open waypoint rings (3:1 on white) |
| `border` | Quiet buttons, option rows (interactive outlines) |
| `hairline` | Dividers between rows, surfaces (`border border-hairline rounded-surface`), header and rail lines |
| `wash` | Hover, selected row, disabled fill, side panels |
| `teal` | The one accent: done waypoints, chosen option, focus ring |
| `teal-text` / `teal-hover` | Links |
| `avatar` | Avatar circle |
| `.ai` / `.ai-streaming` | Aurora hairline: AI-generated replies only, never decoration |

Rows are divided by `hairline`, never `border`. No filled cards: a surface is a hairline box on white.

## Type: five roles, Geist 400/500/600

`text-hero` 48 (landing h1 only) · `text-title` 32 (page h1) · `text-section` 20 (section, card and sheet titles) · `text-body` 15 (default) · `text-small` 13 (meta). Emphasis inside body is `font-medium`. No other sizes.

## Space, shape, elevation

Spacing only 0, 4, 8, 16, 24, 32, 48, 64, 96 (`1 2 4 6 8 12 16 24` steps). `rounded-control` (6) for controls, `rounded-surface` (10) for surfaces. `shadow-lift` only on the landing preview and toasts; everything else is a hairline. Page width: `container-page` (1120 + 24 side padding). Targets ≥ 44 px: `Button`, `Field`, `Select` already have `min-h-11`; give other clickable rows `min-h-11` too.

## Components (one file each: `@/components/ui/button`, `field`, `select`, `option-row`, `alert-dialog`, `toaster`; no barrel)

| Need | Use |
|---|---|
| The screen's one main action | `<Button>` (primary). Exactly one per screen |
| Secondary action, standalone or at a row's end (Ask, Edit, Cancel, Stop, Sign out) | `<Button variant="quiet">` |
| Action inside a toast, or a fold toggle on the route rail (Undo, Show, Hide) | `<Button variant="ghost">` |
| Bigger hero CTA | `size="lg"` |
| Link styled as button | `className={buttonVariants({ variant })}` on `<Link>` |
| Text input / select | `Field` / `Select` (native, inline chevron) |
| Pick one answer | `OptionRow` |
| Destructive confirm | `AlertDialog` |
| Feedback after an action | `toast()` from sonner, naming the action again ("Marked as done", Undo) |

Merge classes with `cn` from `@/lib/utils` (it knows the token groups).

A board value with no token yet (a column width, a breakpoint such as the board's 760 or 1100 px container query) gets a named token in `globals.css` `@theme` (`--container-*`, `--breakpoint-*`, `--grid-template-columns-*`) and is used by name. Never write `grid-cols-[…]` or `w-[…]`; `cw01.test.ts` fails on it.

## Route waypoints (12 px dots)

done = teal fill · current = 2 px ink ring · available = 1.5 px control ring · blocked = control ring + short muted dash · locked = 1.5 px dashed control ring. Waypoints are `aria-hidden`; the leg carries sr text "Week 1: 1 of 3 done".

## Motion

CSS only, three moments: aurora flow while a reply streams (3 s), stamp in (200 ms), sheet open/close. All off under `prefers-reduced-motion`.

## Common mistakes

- Picking `border` for a divider, or a grey filled card for grouping → `hairline`, white.
- Two primaries on one screen (e.g. Save and Start) → one primary, the rest quiet.
- Aurora or teal used to decorate → teal marks state, aurora marks AI output.
- A new size like 14 or 18 px, or `mt-[13px]` → nearest scale value.
- Middle dots, ALL CAPS labels, "→" on links → plain sentence case.
