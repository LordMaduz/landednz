# RPI Request — Web Stage 2: Layout Shell and Navigation
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 2.

---

## Stage goal

Complete app shell with sidebar navigation, responsive breakpoints, and route structure.
All pages exist as empty shells with correct layouts.
**Stage 2 is complete when navigating between all routes shows the correct layout
at every breakpoint. No content, no data fetching.**

---

## Critical layout rule

**Always two windows — sidebar | content. Nothing else.**
There is NO DetailPanel / right panel for task detail. Task detail replaces list
content within the content area (built in Stage 3). Chat is a floating overlay
(built in Stage 3). This stage only builds the sidebar + content area shell.

---

## Scope

**Builds:**
- Root layout (`app/layout.tsx`) — DM Sans + DM Serif Display fonts, metadata, providers
- Marketing layout (`app/(marketing)/layout.tsx`) — full-width, no sidebar
- App layout (`app/(app)/layout.tsx`) — sidebar + content area (TWO columns only)
- Sidebar component — full nav structure, active states, collapse/expand, responsive
- MobileNav component — hamburger for <768px
- ContentArea component — max-width container, scroll management
- All route files as empty page shells (6 routes)
- Auth middleware for protected routes (/roadmap, /chat, /settings)
- Responsive verification at 4 breakpoints (1280+, 1024-1279, 768-1023, <768)

**Does NOT build:**
- Any page content (roadmap list, task cards, chat messages)
- Any DetailPanel component (task detail is content replacement, built in Stage 3)
- Any ChatPanel component (floating overlay, built in Stage 3)
- Any data fetching or API integration
- Any business logic

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W2-01 | Root layout: DM Sans + DM Serif Display fonts, metadata, `bg-bg` background | Visual check |
| AC-W2-02 | Marketing layout at `/`: full-width, no sidebar | Navigate to `/` |
| AC-W2-03 | App layout at `/roadmap`: sidebar (256px) + content area at 1280px+ (TWO columns, not three) | Visual check |
| AC-W2-04 | Sidebar: full nav structure per mockup, active state (primary-light bg + 3px left border) | Navigate routes |
| AC-W2-05 | Sidebar collapses to 64px icon-only at 1024-1279px, hover tooltip | Resize viewport |
| AC-W2-06 | Below 768px: sidebar hidden, hamburger opens MobileNav, backdrop closes | Resize + click |
| AC-W2-07 | Content area: max-w-content (960px), centered, scrollable | Inspect at 1440px |
| AC-W2-08 | All 6 routes: `/`, `/onboarding`, `/auth/signin`, `/roadmap`, `/chat`, `/settings` | Navigate all |
| AC-W2-09 | Auth middleware: unauthenticated → `/auth/signin?redirect={path}` | Access without session |
| AC-W2-10 | Responsive at 1440/1280/1024/768/375px | Screenshots or visual |
| AC-W2-11 | Playwright E2E: all routes, correct layout at 1280 + 768 | `npx playwright test` |

---

## Known failure points

- **Three-column layout** — DO NOT build a three-column layout. Sidebar + content only. No DetailPanel.
- **Font name** — DM Sans + DM Serif Display, NOT Inter. Self-hosted in `public/fonts/`.
- **Sidebar width not respecting token** — use `w-sidebar` from Tailwind config, not hardcoded `w-64`
- **Auth middleware redirect loop** — `/auth/signin` must NOT be protected
- **Responsive breaks between defined breakpoints** — also test at 1100px and 900px

---

## Skills to load

- `web-responsive-layout` — breakpoint rules, sidebar collapse, two-column layout

---

## Stage gate

ALL 11 ACs must pass. Playwright E2E at 1280px + 768px. Visual check at all 5 breakpoints.
Verify: NO DetailPanel component exists. Layout is always sidebar + content.
Then run `/rpi:gate web-stage2`.
