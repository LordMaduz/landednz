# Design system

The visual rules the shipped web app follows. The single source of truth is [`apps/web/src/app/globals.css`](../apps/web/src/app/globals.css); this page explains it. Where they differ, the CSS is right.

**References.** Token layering follows [Primer Primitives](https://github.com/primer/primitives) (a base layer of raw values and a functional layer of named roles). Token categories use the vocabulary of the [W3C Design Tokens Community Group format 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) (color, dimension, typography, shadow). Touch-target and contrast minimums come from [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (1.4.11, 2.5.8) and Apple's Human Interface Guidelines; desktop control sizes were measured from apple.com on 2026-11-01.

## Principles

- **Calm and checked.** Plain, short, precise copy; no exclamation marks; a quiet, light interface that lets sources and steps lead.
- **Mobile first.** Most people use a phone. Phone targets are 44 px; the desktop layout is denser, not larger.
- **Light theme only.** No dark mode or theme switching.
- **Roles, never raw values.** Components use named roles. Raw hex, pixel and arbitrary Tailwind values are not allowed in component files (§Enforcement).

## Token layers

| Layer | What | Where |
|---|---|---|
| Base (palette) | Raw values named by hue and step, e.g. `--palette-teal-600` | `:root` block under `/* palette */` |
| Functional (roles) | What a value is for, e.g. `--color-accent`, `--text-title`, `--radius-card` | `@theme` block |

A new look changes the palette block only. Roles refer to palette values.

## Colour

Palette: ink (`#0F2A3A` family), slate neutrals, teal accent, one red for errors, and a green-blue-violet "aurora" hairline reserved for AI-generated elements.

| Role | Use |
|---|---|
| `fg`, `fg-muted`, `fg-subtle` | Text, strongest to quietest |
| `fg-accent`, `link`, `link-hover` | Accent text and links |
| `fg-on-action`, `fg-on-inverse` | Text on dark action and inverse surfaces |
| `surface`, `surface-sunken`, `surface-selected`, `surface-inverse` | Backgrounds |
| `action` | Primary button fill |
| `accent`, `accent-bright` | Brand teal and its bright variant |
| `border`, `border-subtle`, `border-selected`, `border-strong` | Edges; `border-strong` meets 3:1 on white for inputs (WCAG 1.4.11) |
| `focus` | Focus ring |
| `danger` | Errors |

## Typography

Font: Geist Sans, self-hosted. Sizes are the same at every width.

| Role | Size | Weight | Use |
|---|---|---|---|
| `hero` | 48 | 600 | Landing hero only |
| `title` | 24 | 600 | One per page |
| `featured` | 18 | 600 | The one main item in a card |
| `section` | 16 | 600 | Card and section headings |
| `body` | 16 | 400 | Paragraphs and form fields (below 16 px, iOS zooms on focus) |
| `ui` | 14 | 400 | List rows, buttons, navigation: the default |
| `small` | 12 | 400 | Durations, dates, counts, fine print |
| `reading` | 16, looser leading | 400 | Guide answers and legal text |

## Spacing and size

Spacing sits on a 4 px grid. Layout roles: `page-gutter` 16, `card-padding` 16, `section-gap` 24, `stack-gap` 12 (desktop values are set in media queries).

Control sizes are roles with three values (phone, tablet from 561 px, desktop from 1024 px with a fine pointer):

| Role | Phone | Tablet | Desktop |
|---|---|---|---|
| `control` (buttons, inputs, menu items) | 44 | 40 | 36 |
| `control-lg` (large buttons, onboarding options) | 48 | 48 | 44 |
| `row` (list rows) | 44 | 40 | 36 |
| `header` | 56 | 56 | 44 |
| `touch` (crisis help links) | 44 | 44 | 44 |

Container widths are roles too (`--container-app` 1248, `--container-page` 1168, `--container-auth` 460, `--container-reading` 720 and others).

## Shape and elevation

Radius: `control` 8, `card` 12, `floating` 16, `full`. Elevation: `raised` (cards), `floating` (ask bar, popovers), `overlay` (guide pane; an upward variant for the phone sheet). Selection and error use outline rings built from colour roles, not elevation.

## Layout and responsiveness

Phone first, with tablet at 561 px and desktop at 1024 px. Named breakpoints for specific layouts: `narrow` 561, `compact` 761, `split` 861, `stack` 961, `wide` 1100, and `pane` 1024, below which the guide is a bottom sheet instead of a side pane. Several screens use container queries so a component adapts to its column, not the window.

## Components

Every control is a kit component in `apps/web/src/components/ui` (button, card, field, option-row, select, alert dialog, calendar, toaster, skeleton), built on shadcn/ui and Base UI. Hover and pressed states come from a shared state layer, not per-component colours.

## Motion and accessibility

- Every transition and animation respects `prefers-reduced-motion`; when set, changes are instant.
- Forced-colours mode is handled.
- Axe checks run in the Playwright suite (`apps/web/e2e/a11y.spec.ts`); Lighthouse CI runs on three pages.

## Screens

Captured 2026-11-02 from a production build (`next build` and `next start`) against a local API in mock AI mode, signed in as a throwaway user landing on the capture day (visa AEWV, Auckland, just them, another profession). Desktop is 1440 x 900 at 2x, phone is 390 x 844 at 3x, reduced motion on. The guide's replies are deterministic in mock mode, so no reply is shown.

| File | State |
|---|---|
| `docs/screens/landing.png` | Landing, desktop |
| `docs/screens/preview.png` | Roadmap preview after onboarding, before sign-in, desktop |
| `docs/screens/home.png` | Home, day one, desktop |
| `docs/screens/task.png` | Task page with steps and sources, desktop |
| `docs/screens/home-phone.png` | Home, phone |
| `docs/screens/task-phone.png` | Task page, phone |

## Enforcement

The rules are tests, so they cannot drift:

- `apps/web/src/cw01.test.ts` fails on raw hex, arbitrary pixel values, default Tailwind colours, off-grid spacing, non-role radius or shadow, and hand-written buttons outside `components/ui`.
- `apps/web/src/app/type-roles.test.ts`, `size-roles.test.ts` and `design-roles.test.ts` guard the type, size and colour roles.
- The project skill [`landednz-design-system`](../.claude/skills/landednz-design-system/SKILL.md) tells coding agents which role to use.

## Known gaps

Spacing roles are only partly adopted: some components still use raw spacing values, a few gap roles are unused, one breakpoint is read in JavaScript, and z-index values are not tokenised. These are tracked for a later release and do not affect behaviour.
