---
name: landednz-design-system
description: Use when building or changing any LandedNZ web UI in apps/web (a page, row, card, form, dialog, toast, header, route rail or assistant reply), or when unsure which colour, type size, spacing, radius or Button variant a LandedNZ element takes.
---

# LandedNZ design system (Precise)

Every visual value is a token in `apps/web/src/app/globals.css` `@theme`. Code uses only these classes; `src/cw01.test.ts` fails on raw hex, `[13px]`-style or any `utility-[value]` class and on inline colour styles. **Required first step: read `docs/design-system.md` and the nearest existing screen** before writing markup, and reuse its pattern: same roles, same kit components. Add nothing the design does not call for (no extra avatar, hint line or icon). A new screen is designed and reviewed before it is built (CW02′).

## Colour roles (palette + roles, `globals.css`)

Raw values live once in the `/* palette */` block (`--palette-<hue>-<step>`); components use roles only. A new look = new palette values. `cw01.test.ts` fails on old names (`ink`, `wash`, `teal`, `white`…), palette names and Tailwind's default colours.

| Role | Use for |
|---|---|
| `fg` / `fg-muted` / `fg-subtle` | Text: normal, secondary, quietest |
| `fg-accent` | Accent text that is not a link (stamps, chips, today label) |
| `surface` / `surface-sunken` | Page and cards / grey wells, side panels |
| `surface-selected` + `border-selected` | Chosen rows, current nav item, chosen calendar day (never hover) |
| `surface-inverse` (+ `fg-on-inverse`, `fg-on-inverse-muted`, `link-on-inverse`, `danger-on-inverse`) | Dark rail, toast, crisis card |
| `action` / `fg-on-action` | Primary button fill and its text (also white text on dark surfaces) |
| `accent` / `accent-bright` | Brand teal: done waypoints, chosen edge / decorative marks |
| `link` / `link-hover` | Links |
| `border` / `border-subtle` / `border-strong` | Control outlines / dividers / input and radio edges (3:1) |
| `track`, `focus`, `danger`, `avatar` | Progress track, focus ring, errors and delete, avatar circle |
| `.ai` / `.ai-streaming` | Aurora hairline: AI-generated replies only, never decoration |

## States: one state layer

Hover and pressed mix a layer into the element's own background: `state` (ink, light surfaces: 6 % hover, 10 % pressed) or `state-inverse` (white, dark surfaces: 8/12 %). Name the base with `state-base-<colour role>` next to `bg-<role>` (`bg-surface state state-base-surface`). Phones have no hover, so every control gets pressed feedback from the same rule. Disabled takes no layer. A control whose surface flips with width overrides at the breakpoint (`state-inverse max-narrow:state`). Links change text (`link-hover` + underline), not the layer; header/footer nav uses `link-subtle`.

## Type: roles in `globals.css`, Geist 400/600

`text-hero` 48 (landing h1 only) · `text-title` 24 (page h1) · `text-featured` 18 (the one main item in a card) · `text-section` 16 (card and section headings) · `text-body` 16 (paragraphs, form fields) · `text-ui` 14 (rows, buttons, nav; the inherited default) · `text-small` 12 (durations, dates, counts) · `text-reading` 16 with looser leading (guide answers, legal text). Same sizes at every width. No other sizes; `type-roles.test.ts` guards it.

## Space, shape, elevation

Spacing (padding, margin, gap, space, inset) on the 4 px grid only: Tailwind steps `0 0.5 1 2 3 4 5 6 8 10 12 16 24`, or a spacing role (`page-gutter`, `card-padding`, `section-gap`, `stack-gap`, `tab-bar`, `rail-indent`, `sheet-clear`); the guard fails on half steps. Radius roles: `rounded-control` (8), `rounded-card` (12), `rounded-floating` (16: ask bar, pane, sheet), `rounded-full`. Elevation: `shadow-raised` (cards), `shadow-floating` (ask bar, popovers), `shadow-overlay` / `shadow-overlay-up` (pane / phone sheet), `shadow-frame-top|bottom`; outline rings `shadow-chosen|error|today|rail|pin`. Card padding 20 (16 under 561 px), gap 16, side column 360. Every card is `Card` from `@/components/ui/card` (`variant="raised"` default, or `plain`); no wash or cream card backgrounds. Page width: `container-page` (1120 + 24 side padding). Targets are 40 px on desktop and 44 px under 561 px: `Button`, `Field`, `Select` already have `min-h-10 max-narrow:min-h-11`; give other clickable rows the same. `Button size="sm"` is 32 px on desktop, 44 on phones.

## Components (one file each: `@/components/ui/button`, `field`, `select`, `option-row`, `alert-dialog`, `toaster`; no barrel)

| Need | Use |
|---|---|
| The screen's one main action | `<Button>` (primary). Exactly one per screen |
| Secondary action, standalone or at a row's end (Ask, Edit, Cancel, Stop) | `<Button variant="secondary">` |
| In-row or toolbar action, fold toggle (Undo, Show, Hide, Copy) | `<Button variant="ghost">` |
| Delete | `variant="danger"` / `"danger-ghost"` |
| Buttons on a dark surface | `variant="inverse"` |
| Text-only action (Change, Sign out on the rail) | `variant="text"` |
| Icon-only | `size="icon"` + `aria-label` (required by the type); small drawn icons keep their size and reach 44 px on phones with an `after:` extension |
| Bigger hero CTA | `size="lg"` |
| Link styled as button | `className={buttonVariants({ variant })}` on `<Link>` |
| Text input / select | `Field` / `Select` (native, inline chevron) |
| Pick one answer | `OptionRow` |
| Destructive confirm | `AlertDialog` |
| Feedback after an action | `toast()` from sonner, naming the action again ("Marked as done", Undo) |

Every control is a kit component: a hand-written `<button>` outside `components/ui` fails `cw01.test.ts` (exceptions: the Google `.gsi` button, the `app/dev/` fixture). Merge classes with `cn` from `@/lib/utils` (it knows the role scales; register new radius/shadow/spacing roles there).

A design value with no token yet (a column width, a breakpoint such as a 760 or 1100 px container query) gets a named token in `globals.css` `@theme` (`--container-*`, `--breakpoint-*`, `--grid-template-columns-*`) and is used by name. Never write `grid-cols-[…]` or `w-[…]`; `cw01.test.ts` fails on it.

## Route waypoints (12 px dots)

done = teal fill · current = 2 px ink ring · available = 1.5 px control ring · blocked = control ring + short muted dash · locked = 1.5 px dashed control ring. Waypoints are `aria-hidden`; the leg carries sr text "Week 1: 1 of 3 done".

## Motion

CSS only, three moments: aurora flow while a reply streams (3 s), stamp in (200 ms), sheet open/close. All off under `prefers-reduced-motion`.

## Common mistakes

- Picking `border` for a divider, or a grey filled card for grouping → `hairline`, white.
- Two primaries on one screen (e.g. Save and Start) → one primary, the rest secondary.
- Aurora or teal used to decorate → teal marks state, aurora marks AI output.
- A new size like 14 or 18 px, or `mt-[13px]` → nearest scale value.
- Middle dots, ALL CAPS labels, "→" on links → plain sentence case.
