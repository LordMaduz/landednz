# RPI Request — Web Stage 3: Static Screens (Mock Data)
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 3.

---

## Stage goal

All screens rendered with hardcoded/mock data. Full visual fidelity matching
14-ui-ux-design.md. No API calls, no auth integration, no streaming.
**Stage 3 is complete when every screen matches the design spec with mock data.**

---

## Scope

**Builds:**
- Landing page — all 6 sections, Auckland hero image, all copy
- Onboarding flow — 5 questions, progress bar, option cards, roadmap reveal transition
- Roadmap dashboard — hero progress card, "Do these first", filter tabs, phase sections
- Task list cards — all 7 states rendered with mock data
- Task detail view — full Layer 2 (consequence callout, steps, documents, source links)
- Chat interface — mock conversation, input, thinking indicator, citation badges, source footer
- Premium gate card — inline in roadmap, 3 paths
- Settings page — profile, subscription, notifications, account
- Auth page — Google OAuth button, email input, terms
- Storybook stories for all feature-specific components
- Playwright visual regression snapshots at 1280px and 768px

**Does NOT build:**
- API integration (all data is mock/hardcoded)
- Real auth (mock user, always "logged in")
- Real streaming (mock chat responses)
- Payment flow (mock upgrade button)

**Critical constraint (CW05):** Mock data in `src/mocks/` MUST conform to the exact
TypeScript interfaces from `@landednz/types` and `src/types/web.ts`. Drift = rework in Stage 4.

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W3-01 | Landing page: 6 sections per 14-ui-ux-design.md, copy matches | Visual check |
| AC-W3-02 | Onboarding: 5 questions, option cards highlight on select, progress bar | Click through |
| AC-W3-03 | Roadmap reveal transition, reduced motion = instant | Visual + toggle |
| AC-W3-04 | Roadmap dashboard: hero card (15%), "Do these first" 3 cards, filter tabs | Visual check |
| AC-W3-05 | Task list cards: all 7 states per 14-ui-ux-design.md, Storybook all 7 | Storybook + visual |
| AC-W3-06 | Task detail: right panel, amber callout, steps, documents, source, actions | Click task |
| AC-W3-07 | Chat: opening message, user msg, AI response + citations, thinking dots | Visual check |
| AC-W3-08 | Premium gate: inline, heading, benefits, anchor, 3 paths, decline → banner | Click decline |
| AC-W3-09 | Settings: profile, subscription (free), notifications, sign out, delete | Visual check |
| AC-W3-10 | Auth: Google button, divider, email input, Continue, terms | Visual check |
| AC-W3-11 | Sidebar phases expand with task status indicators, Phase 3 lock + Premium | Click headers |
| AC-W3-12 | Responsive: all screens at 1440/1280/1024/768/375px | Playwright screenshots |
| AC-W3-13 | Playwright visual regression baselines captured at 1280 + 768 | `npx playwright test` |
| AC-W3-14 | All feature components in Storybook, zero console errors | `npm run storybook` |
| AC-W3-15 | First-use hints: 3 sequential tooltips, dismiss reveals next | Visual check |

---

## Known failure points

- **Mock data shape drift** — validate mock types against `packages/types/` before committing (CW05)
- **Responsive breaks between breakpoints** — also test at 1100px and 900px
- **Consequence callout contrast** — text-primary on warning-light may be close to WCAG threshold
- **Auckland hero image** — dark overlay must be 55% opacity for text legibility
- **Roadmap reveal Framer Motion** — import only what's needed, check bundle impact

---

## Skills to load

- `web-component-patterns` — 7-state rendering, consequence callout, premium gate pattern
- `web-design-system` — token reference for all visual properties

---

## Stage gate

ALL 15 ACs must pass. Storybook: all stories, zero errors. Playwright baselines captured.
Manual walkthrough at 1280px + 768px vs 14-ui-ux-design.md.
Then run `/rpi:gate web-stage3`.
