# RPI Request — Web Stage 2: Layout Shell and Navigation
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 2.

---

## Stage goal

Complete app shell with sidebar navigation, two-panel layout, responsive breakpoints,
and route structure. All pages exist as empty shells with correct layouts.
**Stage 2 is complete when navigating between all routes shows the correct layout
at every breakpoint. No content, no data fetching.**

---

## Scope

**Builds:**
- Root layout (`app/layout.tsx`) — fonts, metadata, providers
- Marketing layout (`app/(marketing)/layout.tsx`) — full-width, no sidebar
- App layout (`app/(app)/layout.tsx`) — sidebar + content + detail panel
- Sidebar component — full nav structure, active states, collapse/expand, responsive
- DetailPanel component — slide-in right panel, open/close, empty state
- MobileNav component — hamburger for <768px
- ContentArea component — max-width container, scroll management
- All route files as empty page shells (6 routes)
- Auth middleware for protected routes (/roadmap, /chat, /settings)
- Responsive verification at 4 breakpoints (1280+, 1024-1279, 768-1023, <768)

**Does NOT build:**
- Any page content (roadmap list, task cards, chat messages)
- Any data fetching or API integration
- Any business logic

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W2-01 | Root layout: Inter font, metadata, `bg-bg` background | Visual check |
| AC-W2-02 | Marketing layout at `/`: full-width, no sidebar | Navigate to `/` |
| AC-W2-03 | App layout at `/roadmap`: three-column at 1280px+ | Visual check |
| AC-W2-04 | Sidebar: full nav structure, active state (primary-light bg + 3px border) | Navigate routes |
| AC-W2-05 | Sidebar collapses to 64px icon-only at 1024-1279px, hover tooltip | Resize viewport |
| AC-W2-06 | Below 768px: sidebar hidden, hamburger opens MobileNav, backdrop closes | Resize + click |
| AC-W2-07 | DetailPanel slides in (0.25s), empty state visible, X closes (0.2s) | Trigger panel |
| AC-W2-08 | 768-1023px: DetailPanel as overlay with backdrop | Resize + trigger |
| AC-W2-09 | All 6 routes: `/`, `/onboarding`, `/auth/signin`, `/roadmap`, `/chat`, `/settings` | Navigate all |
| AC-W2-10 | Auth middleware: unauthenticated → `/auth/signin?redirect={path}` | Access without session |
| AC-W2-11 | Responsive at 1440/1280/1024/768/375px | Screenshots or visual |
| AC-W2-12 | Phase sections expand/collapse, triangle rotates, height 0.2s | Click phase header |
| AC-W2-13 | Playwright E2E: all routes, correct layout at 1280 + 768 | `npx playwright test` |

---

## Known failure points

- **Sidebar width not respecting token** — use `w-sidebar` from Tailwind config, not hardcoded `w-64`
- **Detail panel z-index on tablet** — overlay must be above content, below mobile nav
- **Auth middleware redirect loop** — `/auth/signin` must NOT be protected
- **Responsive breaks between defined breakpoints** — also test at 1100px and 900px

---

## Skills to load

- `web-responsive-layout` — breakpoint rules, sidebar collapse, panel transitions

---

## Stage gate

ALL 13 ACs must pass. Playwright E2E at 1280px + 768px. Visual check at all 5 breakpoints.
Then run `/rpi:gate web-stage2`.
