# RPI Request — Web Stage 1: Design System Foundation
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 1.

---

## Stage goal

Complete design system implemented as Tailwind config + reusable UI primitives,
all documented in Storybook. No pages, no layouts, no API calls. Pure component library.
**Stage 1 is complete when every UI primitive renders correctly in Storybook with all
documented states. Nothing more.**

---

## Scope

**Builds:**
- Next.js 14 App Router project scaffolding (`apps/web/`)
- Tailwind CSS configuration with ALL design tokens from `web-design-system` skill
- CSS custom properties in `globals.css` (fallback)
- DM Sans (variable, 300–700) + DM Serif Display (400) self-hosted in `public/fonts/`
- `cn()` utility (clsx + tailwind-merge)
- UI primitives in `components/ui/`: Button, Card, Badge, ProgressBar, Skeleton, StatusIndicator, Input, Tooltip
- Storybook 8 configuration with all primitives documented
- Vitest unit tests for component rendering

**Does NOT build:**
- Any page or route
- Any layout component (sidebar, panels)
- Any API integration or business logic
- Any feature-specific components (task cards, chat messages)

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W1-01 | Next.js 14 project at `apps/web/`, App Router, TS strict | `npx tsc --noEmit` returns 0 |
| AC-W1-02 | Tailwind config has ALL tokens from `web-design-system` skill | Test component with `bg-primary text-h2 shadow-card` renders correctly |
| AC-W1-03 | `globals.css` CSS custom properties + DM Sans & DM Serif Display self-hosted | Both fonts render, no Google Fonts network request |
| AC-W1-04 | `cn()` utility at `src/lib/utils/cn.ts` | Unit test: `cn('px-4 py-2', 'px-8')` returns `'px-8 py-2'` |
| AC-W1-05 | Button: 5 variants × 3 sizes × 4 states, loading shows spinner | Storybook story, all combos render |
| AC-W1-06 | Card: default/hover/selected/error + padding variants | Storybook story, shadow transition 0.15s |
| AC-W1-07 | Badge: 5 variants (phase, difficulty-easy, difficulty-medium, difficulty-hard, premium), correct colours | Storybook story |
| AC-W1-08 | ProgressBar: deterministic (0.4s fill) + indeterminate (pulse) | Storybook story with interactive % |
| AC-W1-09 | Skeleton: 3 variants (circle, text, rect), pulse animation, disabled on reduced motion | Storybook story + reduced motion toggle |
| AC-W1-10 | StatusIndicator: all 7 TaskCardState × 2 sizes (sm/md) | Storybook story, 14 combinations |
| AC-W1-11 | Input: text + textarea, label/placeholder/error/disabled, rounded-input (10px) | Storybook story |
| AC-W1-12 | Tooltip: 4 positions, hover/focus trigger, click-outside dismiss | Storybook story with interactive control |
| AC-W1-13 | Storybook 8 running, all primitives documented, zero console errors | `npm run storybook` |
| AC-W1-14 | Vitest configured, all primitives tested, all passing | `npm run test` |
| AC-W1-15 | All components respect `prefers-reduced-motion` | Toggle in Storybook, visual verify |
| AC-W1-16 | Colour contrast ≥ 4.5:1 for text-primary/bg, text-secondary/bg, text-inverse/primary | axe-core or manual checker |
| AC-W1-17 | `font-display` Tailwind class maps to DM Serif Display, `font-body` to DM Sans | Apply both in test component |

---

## Known failure points

- **Font loading** — DM Sans is a variable font (single woff2 file); DM Serif Display is a static font (single weight 400). Both need separate @font-face declarations with `font-display: swap`.
- **Font name confusion** — DM Sans, NOT Inter. The original spec said Inter but the mockup session changed it. If you see "Inter" anywhere in the codebase, it's wrong.
- **Tailwind `extend` not merging** — test `bg-primary` class in a component, inspect computed style
- **StatusIndicator icons wrong** — verify each against mockup `mockup-screens/landednz-screen3-roadmap-dashboard.jsx`
- **Reduced motion not tested** — toggle via DevTools → Rendering → Emulate `prefers-reduced-motion`
- **Contrast failure on warning-light** — text-primary (#1A1A2E) on warning-light (#FDF6E7) may be close to 4.5:1
- **Storybook + Tailwind config** — Storybook needs `tailwind.config.ts` path in its config for styles to apply
- **Body text size** — 0.9375rem (15px), not 1rem (16px). Match the mockups.

---

## Skills to load

- `web-design-system` — token naming, component API patterns, font setup, accessibility

---

## Stage gate

ALL 17 ACs must pass. Verify:
1. `npx tsc --noEmit` — zero errors
2. `npm run test` — all Vitest tests pass
3. `npm run storybook` — starts, all stories render, zero console errors
4. Manual visual check: DM Serif Display renders for headings, DM Sans for body
5. Contrast ratio spot-check on primary text combinations

Then run `/rpi:gate web-stage1`.
