# Typography audit — LandedNZ web (all pages)

Date: 2026-10-30 · Skill: impeccable `typeset` (typographic assessment + mechanical scan)
Scope: `apps/web` — landing, sign-in, onboarding (questions + preview), home, roadmap, task sheet, settings, privacy/terms, guide.
Evidence: `src/app/globals.css` tokens, every `text-*` / `font-*` class in `src/**/*.tsx`, owner screenshots of the deployed staging app at 9 zoom levels.

## Mechanical scan

`impeccable detect --scope type src` → **0 findings**. The detector sees tokens, not roles; it cannot tell that
the same 18px/600 does two different jobs. A clean scan is the floor, not the verdict.

## Inventory (what ships today)

| Token | Size / line-height / weight / tracking | Uses |
|---|---|---|
| `text-hero` | 48 / 1.05 / 600 / -0.03em | 1 (landing h1) |
| `text-title` | 24 / 1.25 / 600 / -0.015em | 13 (page h1s, guide opening) |
| `text-section` | 18 / 1.35 / 600 / -0.01em | 18 (card labels **and** content titles **and** landing lede at 400) |
| `text-reading-focus` | 17 / 1.65 | guide focused view |
| `text-reading` | 16 / 1.65 | guide answers |
| `text-body` | 15 / 1.5 / 400 | body default + 24 explicit |
| `text-small` | 13 / 1.45 | 80 |
| `text-citation` | 12 | 17 |
| raw px in CSS | 13/600 (stamp), 15/500 (Google button, allowed) | 2 |

**8 sizes** (12, 13, 15, 16, 17, 18, 24, 48). Weights 400/500/600 (32× medium, 43× semibold, 9× `font-normal` overrides).
Colours: `text-muted` 111×, `text-ink` 53×, `text-teal-text` 18×, plus white/85, rail-text, rail-label, toast-action, danger.
Contrast passes AA everywhere (ink 14.9, muted 6.5, teal-text 7.0 on white). `--color-control` (3.4:1) is not used for text. Good.

## Findings

### F1 · Containers are as loud as content (the "odd big headings") — P0
`CardHead` (`ui/card.tsx:17`) renders every card label at `text-section` 18/600: "Your 90 days", "Then this week",
"Recently done", Settings "Your plan"/"Memory", task sheet "Sources". The task title inside the card
("Book temporary accommodation", `home-view.tsx:75`) is also 18/600. A box's name and its content have the same
voice, so the eye has nowhere to land. Premium UIs make labels *quieter* than content, never equal.

### F2 · One job, four treatments — P0
Card/section labels today:
- 18/600 ink — `CardHead`, settings h2, task-sheet h2
- 13/600 teal — "Your next move" (`home-view.tsx:70`), roadmap "now" (`roadmap-view.tsx:105,111`), preview (`preview-route.tsx:89`)
- 15/600 ink — roadmap phase names (`roadmap-view.tsx:94,149,168`), task-sheet status, landing h2
- 12/600 muted — guide focused-view list label (`focused-view.tsx:48`)

Same role, four looks. The reader feels the inconsistency without naming it.

### F3 · Too many sizes, steps too small to read as intent — P1
12 → 13 → 15 → 16 → 17 → 18 → 24. Ratios 1.08, 1.15, 1.07, 1.06, 1.06, 1.33. Anything under ~1.2 reads as a
mistake, not a decision. The page title (24) is only one step above the card label (18), so no page has a clear top.

### F4 · Two body sizes — P1
App body is 15px; guide answers are 16px (17 focused). The same user reads both on one screen (Home + guide pane).
15px is also under the 16px web body floor, and our users are phone-first and often reading in a second language.

### F5 · Roles are assembled in components, so they drift — P1
Components compose style from parts: `text-small font-semibold text-teal-text`, `text-body font-semibold max-narrow:text-section`,
`text-section leading-normal font-normal tracking-normal text-muted`. 9 `font-normal` overrides undo a token's weight.
Phone behaviour is patched per component (`max-narrow:text-small`, `max-narrow:text-section`, `max-compact:text-title`, `max-narrow:text-body`).
Nothing stops a new page from inventing a fifth label style. This is the maintenance root cause.

### F6 · Grey everywhere — P1
`text-muted` appears 2× as often as `text-ink`. Durations, dates, counts, asides, footers, subtitles all go grey, so
pages read washed-out and flat. Teal-text is spread across eyebrows, links, stage names, chips, stamps, and stops
signalling "this is now".

### F7 · Numbers set as prose — P2
"32 days", "1–2 hours", "1 of 10 done", "3m", dates: only 4 `tabular-nums` in the app. Figures jitter in lists and
columns. (Render's lesson: data gets its own texture. For us that is tabular figures, not a mono face — a mono
face reads "developer tool", which is not our calm-expert voice.)

### F8 · Line breaks left to chance — P2
Only one `text-balance` (guide opening). Page titles, card titles and task titles wrap unevenly at phone widths and
zoom; body has no `text-wrap: pretty`.

### F9 · Layout bug surfaced by type — P1 (behaviour, separate fix)
Home "Then this week" row (`home-view.tsx:124–125`): the duration is `flex-none`, so a long duration
("2–4 hours (gathering documents), then NZQA's processing time") pushes the task title to zero width at mid zoom.
Third row truncates to "Check your public health eligibility and c…".

## Kept as is
- **Geist** 400/500/600, loaded once via `next/font`, with a fallback stack. A good fit: neutral, precise, has tabular figures. No second family.
- Roboto on sign-in only (Google button branding rule).
- Colour tokens and contrast.
- Guide reading line-height 1.65.

## Proposed system → see `../type-board.html` (sections 3–4)
