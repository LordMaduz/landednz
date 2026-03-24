# RPI Request — Web Stage 3: Static Screens (Mock Data)
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 3.

---

## Stage goal

All screens rendered with hardcoded/mock data. Full visual fidelity matching
the mockup-screens/*.jsx files (interactive React mockups are the visual truth).
No API calls, no auth integration, no streaming.
**Stage 3 is complete when every screen matches its mockup file with mock data.**

---

## Visual reference (MANDATORY)

Before implementing any screen, open and interact with the corresponding mockup:

| Screen | Mockup file | Key visual elements |
|--------|-------------|-------------------|
| Landing page | `mockup-screens/landednz-screen-landing-page.jsx` | Hero, problem cards, how it works, pricing |
| Onboarding | `mockup-screens/landednz-screen-onboarding.jsx` | 5 questions, progress bar, roadmap reveal |
| Roadmap dashboard | `mockup-screens/landednz-screen-roadmap-dashboard.jsx` | Hero card, priority tasks, filter tabs, phases, task detail REPLACEMENT |
| Chat interface | `mockup-screens/landednz-screen-chat-interface.jsx` | Floating overlay, thinking state, citations |
| Premium gate | `mockup-screens/landednz-screen-premium-gate.jsx` | Inline card, 3 paths, banner collapse |
| Settings | `mockup-screens/landednz-screen-settings.jsx` | Profile, subscription, notifications, delete modal |
| Auth | `mockup-screens/landednz-screen-auth.jsx` | Google OAuth, magic link, confirmation |

Also read `mockup-screens/MOCKUP-REFERENCE-INDEX.md` for design decisions, token
values, and the component inventory.

---

## Critical design decisions (from mockup session — overrides 14-ui-ux-design.md)

1. **Task detail REPLACES list** — clicking a task swaps content area to task detail view. No right panel. Back button returns to list. (Linear pattern)
2. **Hero progress card** — teal gradient with circular progress ring (not plain text)
3. **Task row density** — hybrid: single border, ~44px, consequence line visible, no heavy shadows
4. **Chat is a floating overlay** — 420×600px, bottom-right, Intercom Fin pattern. Not a sidebar panel or third column.
5. **Two windows always** — sidebar + content. No three-column layout at any breakpoint.
6. **Typography** — DM Serif Display for headings, DM Sans for body. Body text at 15px (0.9375rem), not 16px.

---

## Scope

**Builds:**
- Landing page — all 6 sections, teal hero (Auckland photo added later), all copy
- Onboarding flow — 5 questions, progress bar, option cards, roadmap reveal transition
- Roadmap dashboard — hero progress card, "Do these first", filter tabs, phase sections
- Task rows — all 7 states rendered with mock data (hybrid density)
- Task detail view — content replacement (consequence callout, steps, documents, source, tips, actions)
- Chat interface — floating overlay with mock conversation, thinking indicator, citations
- Premium gate card — inline in roadmap, 3 paths, banner collapse on decline
- Settings page — profile, subscription, notifications, account, delete modal
- Auth page — Google OAuth button, email magic link, sent confirmation
- Storybook stories for all feature-specific components
- Playwright visual regression snapshots at 1280px and 768px

**Does NOT build:**
- API integration (all data is mock/hardcoded)
- Real auth (mock user, always "logged in")
- Real streaming (mock chat responses)
- Payment flow (mock upgrade button)

**Critical constraint (CW05):** Mock data in `src/mocks/` MUST conform to the exact
TypeScript interfaces from `@landednz/types` and `src/types/web.ts`.

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W3-01 | Landing page: 6 sections, matches `mockup-screens/landednz-screen-landing-page.jsx` | Side-by-side visual comparison |
| AC-W3-02 | Onboarding: 5 questions, option cards highlight on select, progress bar fills | Click through flow |
| AC-W3-03 | Roadmap reveal transition: personalised messages, reduced motion = instant | Visual + toggle |
| AC-W3-04 | Roadmap dashboard: teal hero card with circular progress, "Do these first" 3 cards, filter tabs | Visual comparison with mockup |
| AC-W3-05 | Task rows: all 7 states per mockup — hybrid density, consequence visible, correct status icons | Storybook all 7 + visual |
| AC-W3-06 | Task detail: REPLACES list view (NOT right panel), back button returns to list, amber callout, steps with connectors, documents, source card, tips, action buttons | Click task in roadmap |
| AC-W3-07 | Chat: floating overlay 420×600px bottom-right, opening message, user msg, AI response + citations, thinking dots, FAB when closed | Visual comparison with mockup |
| AC-W3-08 | Premium gate: inline in roadmap, heading, benefits, anchor copy, 3 equal paths, decline → banner | Click decline |
| AC-W3-09 | Settings: profile with onboarding answers, subscription (free state), notifications toggle + radio, sign out, delete modal | Visual comparison with mockup |
| AC-W3-10 | Auth: Google button with logo, divider, email expand, Continue, magic link sent state, terms | Click through states |
| AC-W3-11 | Sidebar: phases expand with task status indicators, Phase 3 lock + Premium badge, user footer | Click headers |
| AC-W3-12 | Responsive: all screens at 1440/1280/1024/768/375px | Playwright screenshots |
| AC-W3-13 | Playwright visual regression baselines captured at 1280 + 768 | `npx playwright test` |
| AC-W3-14 | All feature components in Storybook, zero console errors | `npm run storybook` |
| AC-W3-15 | First-use hints: 3 sequential tooltips, dismiss reveals next | Visual check |

---

## Known failure points

- **Mock data shape drift** — validate mock types against `packages/types/` before committing (CW05)
- **Task detail as right panel** — DO NOT build a DetailPanel. Content replaces list. Read decision #1 above.
- **Chat as sidebar panel** — DO NOT embed chat in the layout. It's a floating overlay via React Portal. Read decision #4 above.
- **Font mismatch** — use DM Sans + DM Serif Display, NOT Inter. Read decision #6 above.
- **Body text size** — 0.9375rem (15px), NOT 1rem (16px). Match the mockups.
- **Responsive breaks between breakpoints** — also test at 1100px and 900px
- **Consequence callout contrast** — text-primary on warning-light, verify ≥ 4.5:1
- **Roadmap reveal animation** — import only needed Framer Motion exports, check bundle

---

## Skills to load

- `web-component-patterns` — 7-state rendering, content replacement, consequence callout, premium gate
- `web-design-system` — token reference for all visual properties, font setup

---

## Stage gate

ALL 15 ACs must pass. Storybook: all stories, zero errors. Playwright baselines captured.

**Mockup comparison walkthrough (MANDATORY before gate):**
Open each mockup .jsx file side-by-side with the built screen. Verify:
1. Typography — DM Serif Display headings, DM Sans body, 15px body size
2. Colours — exact token match (especially primary, secondary, border)
3. Spacing — card padding, row height, section gaps
4. Task detail — content replacement, NOT side panel
5. Chat — floating overlay, NOT embedded
6. Interactions — hover states, transitions, collapse/expand

Then run `/rpi:gate web-stage3`.
