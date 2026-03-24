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
- Tailwind CSS configuration with ALL design tokens from 14-ui-ux-design.md
- CSS custom properties in `globals.css` (fallback)
- Inter font self-hosted in `public/fonts/` (not Google Fonts CDN)
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
| AC-W1-02 | Tailwind config has ALL tokens from 14-ui-ux-design.md | Test component with `bg-primary text-h2 shadow-card` renders correctly |
| AC-W1-03 | `globals.css` CSS custom properties + Inter self-hosted | Font renders, no Google Fonts network request |
| AC-W1-04 | `cn()` utility at `src/lib/utils/cn.ts` | Unit test: `cn('px-4 py-2', 'px-8')` returns `'px-8 py-2'` |
| AC-W1-05 | Button: 5 variants × 3 sizes × 4 states, loading shows spinner | Storybook story, all combos render |
| AC-W1-06 | Card: default/hover/selected/error + padding variants | Storybook story, shadow transition 0.15s |
| AC-W1-07 | Badge: 5 variants, correct colour mappings, premium lock icon | Storybook story |
| AC-W1-08 | ProgressBar: deterministic (0.4s fill) + indeterminate (pulse) | Storybook story with interactive % |
| AC-W1-09 | Skeleton: 3 variants, pulse animation, disabled on reduced motion | Storybook story + reduced motion toggle |
| AC-W1-10 | StatusIndicator: all 7 TaskCardState × 2 sizes (sm/md) | Storybook story, 14 combinations |
| AC-W1-11 | Input: text + textarea, label/placeholder/error/disabled | Storybook story |
| AC-W1-12 | Tooltip: 4 positions, hover/focus trigger, click-outside dismiss | Storybook story with interactive control |
| AC-W1-13 | Storybook 8 running, all primitives documented, zero console errors | `npm run storybook` |
| AC-W1-14 | Vitest configured, all primitives tested, all passing | `npm run test` |
| AC-W1-15 | All components respect `prefers-reduced-motion` | Toggle in Storybook, visual verify |
| AC-W1-16 | Colour contrast ≥ 4.5:1 for text-primary/bg, text-secondary/bg, text-inverse/primary | axe-core or manual checker |

---

## Known failure points

- **Inter font FOUT/FOIT** — verify `font-display: swap` in `@font-face` declaration
- **Tailwind `extend` not merging** — test `bg-primary` class in a component, inspect computed style
- **StatusIndicator icons wrong** — verify each against 14-ui-ux-design.md Component States exactly
- **Reduced motion not tested** — toggle via DevTools → Rendering → Emulate `prefers-reduced-motion`
- **Contrast failure on warning-light** — text-primary (#1A1A2E) on warning-light (#FDF6E7) may be close to 4.5:1
- **Storybook + Tailwind config** — Storybook needs `tailwind.config.ts` path in its config for styles to apply

---

## Skills to load

- `web-design-system` — token naming, component API patterns, accessibility requirements

---

## Stage gate

ALL 16 ACs must pass. Verify:
1. `npx tsc --noEmit` — zero errors
2. `npm run test` — all Vitest tests pass
3. `npm run storybook` — starts, all stories render, zero console errors
4. Manual visual check of each Storybook story against 14-ui-ux-design.md
5. Contrast ratio spot-check on primary text combinations

Then run `/rpi:gate web-stage1`.
