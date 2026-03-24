# 15 — Web Build Specification
*Written: March 2026*
*Status: DRAFT — Pending review before Claude Code execution*
*Purpose: Complete layered build specification for LandedNZ web app (Next.js 14).
Six stages from design system foundation through production deployment. Integrates
with existing RPI workflow — same commands, same agents, same constitution, same
IMPLEMENT.md tracking. This document is the specification; CLAUDE.md is the session memory.*

*Feeds from: 13-ui-ux-research.md, 14-ui-ux-design.md, 12-build-specification.md,
07-feature-definition.md, 08-user-flows.md*

---

## HOW TO USE THIS DOCUMENT

This document plugs into the existing RPI system. No new commands. No new agents.
The same `/rpi:research`, `/rpi:plan`, `/rpi:implement`, `/rpi:gate`, `/rpi:status`
commands work — just with `web-stage1` instead of `phase1` as the first argument.

**Per-AC workflow (identical to backend):**
```
/rpi:research web-stage1 AC-W1-01   → reads spec, surfaces ambiguities, writes to rpi/web-stage1-design-system/research/AC-W1-01.md, STOPS
/rpi:plan web-stage1 AC-W1-01       → drafts plan, runs constitutional-validator, writes to rpi/web-stage1-design-system/plans/AC-W1-01.md, STOPS
/rpi:implement web-stage1 AC-W1-01  → executes plan (test-first), runs code-reviewer, commits, updates IMPLEMENT.md
```

**After all ACs in a stage:**
```
/rpi:gate web-stage1                → verifies all pass, runs documentation-analyst-writer, unlocks next stage
```

**Session start:**
```
/rpi:status                         → reads IMPLEMENT.md, reports current web stage progress
```

Decisions already made: do not re-litigate architecture. If something conflicts with
this spec, flag it — do not resolve silently.

---

## RPI INTEGRATION

### Folder structure (added to existing rpi/)

```
rpi/
├── phase1-foundation/              ← existing
├── phase2-roadmap-engine/          ← existing
├── phase3-monetisation/            ← existing
├── phase4-ai-chat-basic/          ← existing
├── phase5-rag-launch/             ← existing
├── web-stage1-design-system/      ← NEW
│   ├── REQUEST.md
│   ├── research/
│   │   └── .gitkeep
│   └── plans/
│       └── .gitkeep
├── web-stage2-layout-shell/       ← NEW
│   ├── REQUEST.md
│   ├── research/
│   └── plans/
├── web-stage3-static-screens/     ← NEW
│   ├── REQUEST.md
│   ├── research/
│   └── plans/
├── web-stage4-api-integration/    ← NEW
│   ├── REQUEST.md
│   ├── research/
│   └── plans/
├── web-stage5-interactive-polish/ ← NEW
│   ├── REQUEST.md
│   ├── research/
│   └── plans/
└── web-stage6-deployment/         ← NEW
    ├── REQUEST.md
    ├── research/
    └── plans/
```

### IMPLEMENT.md additions

Add to the Overall Progress table:

```markdown
| Web Stage | Status | AC Passed | Gate |
|-----------|--------|-----------|------|
| W1 — Design System (~20h) | NOT STARTED | 0 / 16 | — |
| W2 — Layout Shell (~15h) | BLOCKED | 0 / 13 | — |
| W3 — Static Screens (~35h) | BLOCKED | 0 / 15 | — |
| W4 — API Integration (~30h) | BLOCKED | 0 / 16 | — |
| W5 — Interactive Polish (~20h) | BLOCKED | 0 / 15 | — |
| W6 — Deployment (~10h) | BLOCKED | 0 / 10 | — |
```

Per-stage sections follow the same format as Phase 1–5:

```markdown
## Web Stage 1 — Design System

**Status:** NOT STARTED
**Research dir:** `rpi/web-stage1-design-system/research/`
**Plans dir:** `rpi/web-stage1-design-system/plans/`

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-W1-01 | Next.js 14 project scaffolding | — | |
| AC-W1-02 | Tailwind config with all design tokens | — | |
...
```

### CLAUDE.md additions

Add to the Monorepo Structure:

```
├── apps/
│   ├── api/                     ← Fastify backend — see apps/api/CLAUDE.md
│   ├── mobile/                  ← React Native CLI — see apps/mobile/CLAUDE.md
│   └── web/                     ← Next.js 14 web app — see apps/web/CLAUDE.md
```

Add to Phase Reference table:

```
| W1 | NOT STARTED | Design System — Tailwind, UI primitives, Storybook | ~20h | 16 |
| W2 | BLOCKED | Layout Shell — sidebar, panels, routes, responsive | ~15h | 13 |
| W3 | BLOCKED | Static Screens — all pages with mock data | ~35h | 15 |
| W4 | BLOCKED | API Integration — real data, auth, streaming, Stripe | ~30h | 16 |
| W5 | BLOCKED | Interactive Polish — animations, a11y, performance | ~20h | 15 |
| W6 | BLOCKED | Deployment — Vercel, production, monitoring | ~10h | 10 |
```

Add new git scope:

```
| `web` | Next.js web app: pages, components, hooks, stores |
```

### Constitution additions (append to existing constitution.md)

```markdown
## WEB-SPECIFIC CONSTRAINTS

**[CW01] Design Tokens via Tailwind Only**
No raw hex values, px values, or arbitrary Tailwind classes in component files.
All colours, font sizes, spacing, and shadows MUST use Tailwind config token classes.
Exception: the tailwind.config.ts file itself defines the token values.

**[CW02] Storybook Story Required for Every UI Primitive**
Every component in `apps/web/src/components/ui/` MUST have a corresponding `.stories.tsx`
file documenting all documented states from 14-ui-ux-design.md.
No UI primitive may be committed without its story.

**[CW03] Reduced Motion Respected**
Every animation MUST have a `prefers-reduced-motion` check.
When reduced motion is preferred, animations are replaced with instant state changes.
No exceptions.

**[CW04] API Types from packages/types/ Only**
Web app imports API contract types from `@landednz/types` — never duplicates them.
Web-specific types (component props, UI state) live in `apps/web/src/types/web.ts`.

**[CW05] Mock Data Shape Matches API Response**
All mock data in Stage 3 MUST conform to the exact TypeScript interfaces returned by
the Fastify API. Drift between mock and real data shape = rework in Stage 4.

**[CW06] No localStorage for Auth or App State**
Auth session managed by Supabase SSR helpers (cookies). App state in Zustand (memory).
URL state via `nuqs`. localStorage only for non-critical UI preferences (hint dismissal).
```

### Skills additions (new files alongside existing skills)

```
.claude/skills/
├── priority-engine/SKILL.md          ← existing
├── knowledge-base-schema/SKILL.md    ← existing
├── ai-guardrails/SKILL.md            ← existing
├── chat-system-prompt/SKILL.md       ← existing
├── web-design-system/SKILL.md        ← NEW
├── web-component-patterns/SKILL.md   ← NEW
├── web-responsive-layout/SKILL.md    ← NEW
└── web-chat-streaming/SKILL.md       ← NEW
```

**web-design-system/SKILL.md** — Tailwind config structure, token naming, component API
patterns (props → Tailwind classes), accessibility requirements (contrast ratios, touch
targets, focus rings, reduced motion), Inter font setup.

**web-component-patterns/SKILL.md** — Task card 7-state rendering logic, TaskCardState
derivation from API data, optimistic update pattern, skeleton loading, error recovery,
consequence callout pattern, premium gate inline card pattern.

**web-responsive-layout/SKILL.md** — Breakpoint rules (1280/1024/768/375), sidebar
collapse logic, detail panel → overlay → full-page transitions, two-panel vs
single-panel switching, content max-width behaviour.

**web-chat-streaming/SKILL.md** — SSE consumption via fetch + ReadableStream, token-by-token
rendering without layout jitter, citation badge extraction from stream markers, thinking
state management, entry-point-aware opening messages.

### Hook additions (append to existing hooks)

**pre-tool-use.md additions:**

```markdown
## Storybook Story Guard (Web)
Before creating or modifying any component in apps/web/src/components/ui/:
- A corresponding .stories.tsx file MUST exist or be created in the same commit.
- Constitutional constraint CW02.

## Design Token Guard (Web)
Before using any colour, font-size, spacing, or shadow value in apps/web/:
- MUST use Tailwind design token class (bg-primary, text-h2, shadow-card).
- Raw hex values or arbitrary classes are NOT permitted.
- Constitutional constraint CW01.

## Accessibility Guard (Web)
Before creating any interactive component in apps/web/:
- Must have keyboard interaction (Tab, Enter/Space, Escape).
- Must have ARIA attributes where needed.
- Must handle prefers-reduced-motion for any animation.
- Constitutional constraint CW03.
```

**post-tool-use.md additions:**

```markdown
## Visual Regression Reminder (Web)
After modifying any component with Playwright visual snapshots:
- Remind: "This component has visual regression tests. Run npx playwright test
  --update-snapshots if the visual change is intentional."

## Bundle Size Reminder (Web)
After adding any new npm dependency to apps/web/:
- Remind: "New dependency added. Verify tree-shaking. Target: /roadmap < 200KB gzipped."
```

---

## SECTION 1: ARCHITECTURE DECISIONS

### 1.1 Framework and tooling

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 App Router | SSR for landing page SEO, RSC for performance, API routes for BFF pattern |
| Language | TypeScript (strict mode) | Shared types with API via `packages/types/` |
| Styling | Tailwind CSS 3.4+ | Utility-first, design token integration via `tailwind.config.ts`, no runtime CSS-in-JS |
| Component library | None (custom components) | Full control over design tokens, no dependency bloat, exact match to 14-ui-ux-design.md |
| State management | React Server Components + `nuqs` for URL state, `zustand` for client state | Minimal client-side JS, URL-first state for shareable roadmap views |
| Auth | Supabase Auth (SSR helpers `@supabase/ssr`) | Matches existing backend, Google OAuth on web |
| Payments | Stripe Checkout (redirect mode) | No embedded payment forms — redirect to Stripe, return to `/roadmap` |
| Testing | Storybook 8 + Playwright + Vitest | Component isolation, visual regression, E2E flows |
| Deployment | Vercel | Next.js native deployment, preview deployments per PR |
| API communication | Fetch to existing Fastify API (no tRPC) | API already built and stable — simple fetch with typed responses |
| Icons | Lucide React | Consistent, tree-shakeable, matches Inter typography |
| Animation | CSS transitions + Framer Motion (minimal) | CSS for simple transitions, Framer Motion only for orchestrated sequences |

### 1.2 Project structure

```
apps/web/
├── CLAUDE.md                         # Web-specific Claude Code context
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group — no sidebar
│   │   │   ├── page.tsx              # Landing page (/)
│   │   │   └── layout.tsx            # Marketing layout
│   │   ├── (app)/                    # Route group — with sidebar
│   │   │   ├── roadmap/
│   │   │   │   ├── page.tsx          # Roadmap dashboard
│   │   │   │   └── task/[taskId]/
│   │   │   │       └── page.tsx      # Task detail (mobile fallback)
│   │   │   ├── chat/page.tsx         # Full-page chat
│   │   │   ├── settings/page.tsx     # Settings
│   │   │   └── layout.tsx            # App layout (sidebar + content)
│   │   ├── onboarding/page.tsx       # Onboarding flow
│   │   ├── auth/signin/page.tsx      # Auth page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Tailwind directives + CSS custom properties
│   ├── components/
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── StatusIndicator.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Sidebar, DetailPanel, MobileNav, ContentArea
│   │   ├── roadmap/                  # HeroProgressCard, TaskListCard, TaskDetailView, etc.
│   │   ├── onboarding/              # OnboardingQuestion, OptionCard, etc.
│   │   ├── chat/                    # ChatPanel, ChatMessage, ChatInput, etc.
│   │   └── marketing/               # HeroSection, ProblemCards, etc.
│   ├── lib/
│   │   ├── api.ts                    # Typed API client (fetch wrapper)
│   │   ├── supabase/                # client.ts, server.ts, middleware.ts
│   │   ├── hooks/                   # useRoadmap, useTaskDetail, useChat, useOnboarding
│   │   ├── stores/                  # roadmapStore.ts, chatStore.ts (zustand)
│   │   └── utils/                   # cn.ts, formatters.ts
│   ├── mocks/                       # Mock data for Stage 3 (removed in Stage 4)
│   └── types/web.ts                 # Web-specific types
├── public/
│   ├── images/
│   └── fonts/                       # Inter font files (self-hosted)
├── .storybook/
├── e2e/                             # Playwright E2E tests
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

### 1.3 Shared types

Web imports from `packages/types/` for all API contract types (CW04). Web-specific
types live in `src/types/web.ts`:

```typescript
// src/types/web.ts
import type { TaskStatus, VisaType, City, FamilySituation,
  Occupation, ArrivalTiming, PersonaKey, ChatEntryPoint } from '@landednz/types';

export type TaskCardState =
  | 'not_started' | 'in_progress' | 'complete' | 'blocked'
  | 'premium_locked' | 'loading' | 'error';

export interface TaskListItem {
  taskId: string;
  taskName: string;
  consequenceLine: string;
  estimatedDuration: string;
  phase: 1 | 2 | 3;
  cardState: TaskCardState;
  completedAt?: string;
  blockedBy?: { taskId: string; taskName: string };
  isPremium: boolean;
}

export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  answers: {
    visaType?: VisaType;
    city?: City;
    familySituation?: FamilySituation;
    occupation?: Occupation;
    arrivalTiming?: ArrivalTiming;
    arrivalDate?: string;
  };
  isComplete: boolean;
}

export type DetailPanelMode = 'empty' | 'task' | 'chat';
```

### 1.4 API client

```typescript
// src/lib/api.ts — typed fetch wrapper for existing Fastify API
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const { token, ...fetchOptions } = options ?? {};
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'UNKNOWN', message: 'Request failed' }));
    throw new ApiError(error.error, error.message, res.status);
  }
  return res.json();
}
```

---

## SECTION 2: STAGE SPECIFICATIONS

Each stage below has the same structure as the backend phase specs: Scope, Functional
Contracts (where applicable), Acceptance Criteria, Known Failure Points, Skills to Load,
and Stage Gate. Each stage also has a corresponding `REQUEST.md` in the `rpi/` folder
that Claude Code reads via `/rpi:research`.

---

## WEB STAGE 1 — DESIGN SYSTEM FOUNDATION

**Duration:** ~20 hours
**Goal:** Complete design system as Tailwind config + reusable UI primitives, all in
Storybook. No pages, no layouts, no API calls. Pure component library.
**Stage 1 is complete when every UI primitive renders correctly in Storybook with all
documented states. Nothing more.**

### W1 Scope

**Builds:**
1. Next.js 14 App Router project scaffolding (`apps/web/`)
2. Tailwind CSS configuration with all design tokens from 14-ui-ux-design.md
3. CSS custom properties in `globals.css`
4. Inter font self-hosted in `public/fonts/`
5. `cn()` utility (clsx + tailwind-merge)
6. UI primitives: Button, Card, Badge, ProgressBar, Skeleton, StatusIndicator, Input, Tooltip
7. Storybook 8 with all primitives documented
8. Vitest unit tests for component rendering

**Does NOT build:**
- Any page or route
- Any layout component (sidebar, panels)
- Any API integration or business logic

### W1 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W1-01 | Next.js 14 project at `apps/web/`, App Router, TS strict mode | `npx tsc --noEmit` returns 0 |
| AC-W1-02 | Tailwind config has ALL tokens from 14-ui-ux-design.md (colours, type, spacing, shadows, radii, widths) | Test component using `bg-primary text-h2 shadow-card` renders correctly |
| AC-W1-03 | `globals.css` has CSS custom properties fallback. Inter self-hosted in `public/fonts/` | Font renders in browser, no Google Fonts network request |
| AC-W1-04 | `cn()` utility at `src/lib/utils/cn.ts` | Unit test: `cn('px-4 py-2', 'px-8')` returns `'px-8 py-2'` |
| AC-W1-05 | Button: 5 variants × 3 sizes × 4 states (default/hover/disabled/loading). Loading shows spinner + disables click. | Storybook story, all combos render |
| AC-W1-06 | Card: default/hover/selected/error states. Padding variants (compact/default/spacious). Hover shadow transition 0.15s. | Storybook story, all states render |
| AC-W1-07 | Badge: 5 variants (status/phase/premium/difficulty/source) with correct colour mappings. Premium shows lock icon. | Storybook story, all variants render |
| AC-W1-08 | ProgressBar: deterministic (0–100%, 0.4s fill transition) + indeterminate (pulse). | Storybook story with interactive % control |
| AC-W1-09 | Skeleton: text-line/card/circle variants with pulse (0.4→0.7→0.4 opacity, 1.5s). Pulse disabled when `prefers-reduced-motion`. | Storybook story, reduced motion toggle test |
| AC-W1-10 | StatusIndicator: all 7 TaskCardState values with correct icon+colour per 14-ui-ux-design.md. sm (16px) + md (24px). | Storybook story, all 7 × 2 sizes render |
| AC-W1-11 | Input: text + textarea, with label/placeholder/error/disabled states. Error shows `--color-error` border + message. | Storybook story, all states render |
| AC-W1-12 | Tooltip: configurable position (top/bottom/left/right), shows on hover/focus, dismisses on click-outside, has arrow. | Storybook story with interactive position control |
| AC-W1-13 | Storybook 8 running. All primitives documented. `npm run storybook` starts, zero console errors. | Run Storybook, inspect all stories |
| AC-W1-14 | Vitest configured. Unit tests exist for every primitive (mount + state-specific). `npm run test` all passing. | Run tests |
| AC-W1-15 | All components respect `prefers-reduced-motion`. ProgressBar instant, Skeleton static, Card hover instant. | Toggle in Storybook, visual verify |
| AC-W1-16 | Colour contrast: text-primary on bg ≥ 4.5:1, text-secondary on bg ≥ 4.5:1, text-inverse on primary ≥ 4.5:1. | axe-core or manual contrast checker |

### W1 Known Failure Points

- **Inter font FOUT/FOIT** — verify `font-display: swap` set in `@font-face` declaration
- **Tailwind `extend` not merging** — test with `bg-primary` class in a component, inspect computed style
- **StatusIndicator icons wrong** — verify each icon matches 14-ui-ux-design.md Component States section exactly
- **Reduced motion not tested** — toggle via browser DevTools → Rendering → Emulate CSS media `prefers-reduced-motion`
- **Contrast ratio failure on warning-light** — text-primary (#1A1A2E) on warning-light (#FDF6E7) may be close to 4.5:1 threshold

### W1 Skills to Load

- `web-design-system` — token naming, component API patterns, accessibility requirements

### W1 Stage Gate

ALL 16 ACs must pass. Verify: `npx tsc --noEmit`, `npm run test`, `npm run storybook` (all stories, zero errors), manual contrast spot-check.
Then run `/rpi:gate web-stage1`.

---

## WEB STAGE 2 — LAYOUT SHELL AND NAVIGATION

**Duration:** ~15 hours
**Goal:** Complete app shell with sidebar, two-panel layout, responsive breakpoints,
and route structure. All pages exist as empty shells with correct layouts.
**Stage 2 is complete when navigating between all routes shows the correct layout
at every breakpoint. No content, no data fetching.**

### W2 Scope

**Builds:**
1. Root layout (fonts, metadata, providers)
2. Marketing layout (full-width, no sidebar)
3. App layout (sidebar + content + detail panel)
4. Sidebar component (full nav structure, active states, collapse/expand, responsive)
5. DetailPanel component (slide-in right, open/close, empty state)
6. MobileNav component (hamburger for <768px)
7. ContentArea component (max-width, scroll management)
8. All route files as empty page shells
9. Auth middleware for protected routes
10. Responsive verification at 4 breakpoints (1280+, 1024-1279, 768-1023, <768)

**Does NOT build:**
- Any page content, data fetching, business logic

### W2 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W2-01 | Root layout: Inter font, metadata (title: "LandedNZ"), `--color-bg` page background | Visual check |
| AC-W2-02 | Marketing layout at `/`: full-width, no sidebar, placeholder text visible | Navigate to `/` |
| AC-W2-03 | App layout at `/roadmap`: three-column (sidebar 256px + content + detail panel 480px hidden) | Visual check at 1280px |
| AC-W2-04 | Sidebar: full nav structure per 14-ui-ux-design.md. Active state: primary-light bg + primary text + 3px left border | Navigate between routes, check active state |
| AC-W2-05 | Sidebar collapses to 64px icon-only at 1024-1279px. Hover shows tooltip. | Resize viewport |
| AC-W2-06 | Below 768px: sidebar hidden. Hamburger opens MobileNav drawer. Backdrop click closes. | Resize viewport, click hamburger |
| AC-W2-07 | DetailPanel slides in from right (0.25s ease-out). Empty state: illustration + "Select a task". Close button (X) slides out (0.2s ease-in). | Click trigger, click close |
| AC-W2-08 | 768-1023px: DetailPanel as overlay with backdrop. Backdrop click closes. | Resize + trigger panel |
| AC-W2-09 | All 6 routes exist with correct layout: `/` (marketing), `/onboarding` (centered), `/auth/signin` (centered card), `/roadmap` (app), `/chat` (app), `/settings` (app) | Navigate all routes |
| AC-W2-10 | Auth middleware redirects unauthenticated from `/roadmap`, `/chat`, `/settings` to `/auth/signin?redirect={path}` | Access protected route without session |
| AC-W2-11 | Responsive verified at 1440px, 1280px, 1024px, 768px, 375px widths | Playwright screenshots or visual check |
| AC-W2-12 | Phase sections in sidebar expand/collapse on click. Triangle rotates. Height transition 0.2s. | Click phase header |
| AC-W2-13 | Playwright E2E: navigate all 6 routes, verify correct layout at 1280px and 768px | `npx playwright test` |

### W2 Known Failure Points

- **Sidebar width not respecting token** — use `w-sidebar` (256px) from Tailwind config, not hardcoded
- **Detail panel z-index on tablet** — panel overlay must be above content but below mobile nav
- **Auth middleware redirect loop** — `/auth/signin` must NOT be protected, or infinite redirect
- **Responsive breakpoints break between defined values** — test at 1100px and 900px too

### W2 Skills to Load

- `web-responsive-layout` — breakpoint rules, sidebar collapse logic, panel transitions

### W2 Stage Gate

ALL 13 ACs must pass. Playwright E2E test passes at 1280px and 768px. Visual check at all 5 breakpoints.
Then run `/rpi:gate web-stage2`.

---

## WEB STAGE 3 — STATIC SCREENS (Mock Data)

**Duration:** ~35 hours
**Goal:** All screens rendered with hardcoded/mock data. Full visual fidelity matching
14-ui-ux-design.md. No API calls, no auth integration, no streaming.
**Stage 3 is complete when every screen matches the design spec with mock data.**

### W3 Scope

**Builds:**
1. Landing page — all 6 sections, Auckland hero image
2. Onboarding flow — 5 questions, progress bar, option cards, roadmap reveal transition
3. Roadmap dashboard — hero progress card, "Do these first", filter tabs, phase sections
4. Task list cards — all 7 states with mock data
5. Task detail view — full Layer 2 (consequence callout, steps, documents, source links)
6. Chat interface — mock conversation, input, thinking indicator, citation badges
7. Premium gate card — inline in roadmap, 3 paths
8. Settings page — profile, subscription, notifications
9. Auth page — Google OAuth button, email input
10. Storybook stories for all feature components
11. Playwright visual regression snapshots at 1280px and 768px

**Does NOT build:**
- API integration (all mock/hardcoded — CW05: mock shape matches API response)
- Real auth, streaming, or payment

### W3 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W3-01 | Landing page: all 6 sections per 14-ui-ux-design.md. Copy matches spec. | Visual check |
| AC-W3-02 | Onboarding: 5 questions with option cards. Selection highlights (primary-light bg, checkmark). Progress bar fills. | Click through flow |
| AC-W3-03 | Roadmap reveal transition: fade out → "Building your plan..." + pulsing dots → context lines → fade to roadmap. `prefers-reduced-motion`: instant. | Visual check + reduced motion toggle |
| AC-W3-04 | Roadmap dashboard: hero progress card (15%, 3/2/16). "Do these first" 3 cards. Filter tabs (All active). | Visual check |
| AC-W3-05 | Task list cards: all 7 states render correctly per 14-ui-ux-design.md. Storybook story shows all 7 side by side. | Storybook + visual check |
| AC-W3-06 | Task detail: right panel with header, consequence callout (amber), numbered steps, documents, source link, "Ask a question", action footer. | Click task in roadmap |
| AC-W3-07 | Chat: mock conversation with opening message, user message, AI response (numbered steps + citation badges), source footer, thinking indicator. | Visual check |
| AC-W3-08 | Premium gate: inline between Phase 2 and Phase 3. Heading, benefits, anchor copy, 3 paths. Decline collapses to banner. | Click decline, verify collapse |
| AC-W3-09 | Settings: profile, subscription (mock free), notifications toggle, sign out, delete account. | Visual check |
| AC-W3-10 | Auth: Google button, divider, email input, "Continue", terms text. | Visual check |
| AC-W3-11 | Sidebar phase sections expand to show task list with status indicators. Phase 3 shows lock + "Premium" badge. | Click phase headers |
| AC-W3-12 | Responsive: all screens correct at 1440px, 1280px, 1024px, 768px, 375px. Detail panel switches from panel → overlay → full page. | Playwright screenshots |
| AC-W3-13 | Playwright visual regression baselines captured for every screen at 1280px and 768px. | `npx playwright test` |
| AC-W3-14 | All feature components in Storybook: HeroProgressCard, TaskListCard (7 states), TaskDetailView, ConsequenceCallout, PremiumGateCard, ChatMessage, ChatInput, ThinkingIndicator, CitationBadge, SourceFooter, OnboardingQuestion, OptionCard. Zero console errors. | `npm run storybook` |
| AC-W3-15 | First-use hints: 3 sequential tooltips on roadmap. Dismiss reveals next. Stored in state (mock). | Visual check |

### W3 Known Failure Points

- **Mock data shape drift** — validate mock types against `packages/types/` before committing (CW05)
- **Responsive breaks between breakpoints** — test at 1100px, 900px too
- **Consequence callout contrast** — text-primary on warning-light may be close to WCAG threshold
- **Auckland hero image** — needs dark overlay for text legibility, test on multiple screens

### W3 Skills to Load

- `web-component-patterns` — 7-state rendering, consequence callout, premium gate pattern
- `web-design-system` — token reference for all visual properties

### W3 Stage Gate

ALL 15 ACs must pass. Storybook: all stories, zero errors. Playwright snapshots captured.
Manual walkthrough of every screen at 1280px and 768px compared to 14-ui-ux-design.md.
Then run `/rpi:gate web-stage3`.

---

## WEB STAGE 4 — API INTEGRATION AND DATA FLOW

**Duration:** ~30 hours
**Goal:** All screens connected to real Fastify API. Mock data replaced with live data.
Auth end-to-end. Onboarding persists. Roadmap fetched. Task completion updates server.
Chat streaming connected.
**Stage 4 is complete when all features work with real data from the existing API.**

### W4 Scope

**Builds:**
1. Supabase Auth SSR — Google OAuth, session management, token refresh
2. Auth page functional — sign in, redirect after auth
3. API client connected to real Fastify endpoints
4. Onboarding → `POST /onboarding/profile` → redirect to roadmap
5. Roadmap dashboard → `GET /roadmap` → real task data
6. Task completion → `POST /roadmap/tasks/:taskId/complete` → optimistic update
7. Bulk override → `POST /roadmap/bulk-override`
8. Chat streaming → `POST /chat/sessions/:id/messages` → SSE → progressive render
9. Stripe Checkout → upgrade button → redirect → return
10. Zustand stores (roadmap, chat)
11. Custom hooks (useRoadmap, useTaskDetail, useChat, useOnboarding)
12. Error handling for all API failures
13. Loading states (skeleton components from Stage 1)

**Does NOT build:**
- New UI components (all from S1–S3)
- Visual polish or animation refinements

### W4 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W4-01 | Google OAuth end-to-end: button → consent → redirect → session → `/roadmap`. Session persists on refresh. | Complete flow in browser |
| AC-W4-02 | Auth middleware redirects unauthenticated to `/auth/signin?redirect={path}`. After sign-in, returns to original path. | Access `/roadmap` without session |
| AC-W4-03 | Sign out: clears session, redirects to `/`. Subsequent `/roadmap` access → redirect to sign in. | Click sign out in settings |
| AC-W4-04 | Onboarding submits to `POST /onboarding/profile`. Profile persisted. `GET /roadmap` returns personalised roadmap. | Complete onboarding, check roadmap |
| AC-W4-05 | Roadmap fetches from `GET /roadmap`. Hero card correct counts. "Do these first" shows correct top 3 from API. | Visual check after real onboarding |
| AC-W4-06 | TaskCardState derived correctly from API data. Vitest unit tests for all derivation paths (NOT_STARTED→not_started, blocked, premium_locked, etc). | `npm run test` |
| AC-W4-07 | Click task → DetailPanel populated from `GET /roadmap/tasks/:taskId`. All Layer 2 sections with real content. | Click task, inspect panel |
| AC-W4-08 | "Mark as done" → `POST /roadmap/tasks/:taskId/complete`. Optimistic update. Revert on API failure + error toast. Roadmap re-fetches. | Mark task, verify update |
| AC-W4-09 | Chat streams via `POST /chat/sessions/:id/messages` SSE. Tokens appear progressively. Citations render. Source footer after stream completes. | Send message, watch stream |
| AC-W4-10 | Chat entry-point-aware: TASK_CARD sends taskId. ROADMAP sends completion context. Opening message differs. | Open chat from task vs roadmap |
| AC-W4-11 | Premium gate "Upgrade" → Stripe Checkout redirect. After payment → `/roadmap?upgrade=success`. Phase 3 unlocked. | Click upgrade (Stripe test mode) |
| AC-W4-12 | Premium gate "Remind me" stores deferral. "Stay free" collapses to banner. Both work without errors. | Click both paths |
| AC-W4-13 | All loading states use skeleton components. Roadmap skeleton while fetching. Detail skeleton while loading. | Throttle network, observe |
| AC-W4-14 | Error handling: network error → retry card. 401 → redirect to sign in. 500 → inline error. Chat failure → system message. No raw errors. | Disable API, test each |
| AC-W4-15 | Zustand stores: roadmapStore (tasks, filter, selected, optimistic), chatStore (messages, streaming, entry point). Persist across nav. Reset on sign out. | Navigate between pages, sign out |
| AC-W4-16 | Playwright E2E: sign in → onboard → roadmap → open task → mark complete → verify update. Test runs against local API. | `npx playwright test` |

### W4 Known Failure Points

- **Supabase SSR cookie handling** — `@supabase/ssr` requires specific cookie configuration for Next.js App Router middleware
- **SSE consumption in browser** — use `fetch` + `ReadableStream` + `TextDecoder`, not `EventSource` (need auth headers)
- **Optimistic update race condition** — roadmap re-fetch after completion may arrive before server processes update
- **Stripe redirect URL** — must include full URL with protocol for production

### W4 Skills to Load

- `web-chat-streaming` — SSE consumption, token rendering, citation extraction
- `web-component-patterns` — optimistic update, error recovery

### W4 Stage Gate

ALL 16 ACs must pass. Playwright E2E full journey passes. Manual walkthrough: sign in → onboard → browse → complete task → chat → sign out. Network tab check: no failed API calls on happy path.
Then run `/rpi:gate web-stage4`.

---

## WEB STAGE 5 — INTERACTIVE STATES AND ANIMATION POLISH

**Duration:** ~20 hours
**Goal:** All micro-interactions, transitions, and animation polish. Accessibility verified.
Performance optimised. **Stage 5 is complete when the product feels polished and professional.**

### W5 Scope

**Builds:**
1. Task completion micro-animation (checkmark draw-in, card mute)
2. Onboarding question transitions (fade-in + slide-up)
3. Roadmap reveal animated sequence
4. Chat streaming polish (no layout jitter, auto-scroll)
5. Premium gate decline animation (collapse to banner)
6. Phase section expand/collapse animation
7. First-use hints persistence (localStorage)
8. Keyboard navigation for all interactive elements
9. Focus management (panel focus trap, return focus on close)
10. Screen reader testing (semantic HTML, ARIA, live regions)
11. `prefers-reduced-motion` verification across ALL animations
12. Lighthouse audit (Performance ≥ 90, Accessibility ≥ 95)
13. Bundle analysis (<200KB gzipped for /roadmap)
14. Cross-browser verification (Chrome, Firefox, Safari)
15. Playwright visual regression re-capture

**Does NOT build:**
- New features, screens, or API changes

### W5 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W5-01 | Task completion: checkmark draws in (0.3s), card mutes (0.2s), next task highlights (0.3s pulse). Reduced motion: instant. | Visual check + toggle |
| AC-W5-02 | Onboarding: each question fades in + slides up 16px (0.3s). Progress bar smooth (0.4s). Reduced motion: instant. | Visual check + toggle |
| AC-W5-03 | Roadmap reveal: full sequence per 14-ui-ux-design.md (fade out → loading → context lines → fade to roadmap). ~2s total. Reduced motion: skip to roadmap. | Visual check + toggle |
| AC-W5-04 | Chat streaming: no layout jitter as tokens append. Auto-scroll to bottom. Citations appear inline. | Send real message, observe |
| AC-W5-05 | Premium gate decline: card height-transitions to banner (0.3s). Banner dismissible (fade 0.2s). Reduced motion: instant. | Click decline, observe |
| AC-W5-06 | Phase expand/collapse: height 0.2s. Triangle rotates 90°. No clip/overflow during transition. | Click phase headers |
| AC-W5-07 | Keyboard nav: Tab order follows visual order. Enter/Space activates. Escape closes panels/nav. | Full keyboard walkthrough |
| AC-W5-08 | Focus management: panel open → focus to close button. Panel close → focus returns to trigger. Focus trap active in panel. | Open/close panel with keyboard |
| AC-W5-09 | Screen reader: all images have alt text, icons have aria-label/aria-hidden, inputs labelled, chat uses aria-live="polite", status changes use aria-live="assertive". | VoiceOver walkthrough |
| AC-W5-10 | `prefers-reduced-motion` verified for ALL animations: onboarding, reveal, completion, panel, skeleton, progress, phase, chat. All become instant. | Toggle, full walkthrough |
| AC-W5-11 | Lighthouse on `/roadmap` at 1280px: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90. LCP < 2.5s, CLS < 0.1. | Run Lighthouse |
| AC-W5-12 | Bundle: total JS for `/roadmap` < 200KB gzipped. Tree-shaking verified (only imported Lucide icons in bundle). | `npx next build` + analyze |
| AC-W5-13 | First-use hints persist in localStorage. Refresh → hints gone. Clear storage → hints return. | Manual check |
| AC-W5-14 | Playwright visual regression snapshots re-captured. Updated baselines. | `npx playwright test --update-snapshots` |
| AC-W5-15 | Cross-browser: Chrome, Firefox, Safari on macOS. All screens render. Animations play (or disabled for reduced motion). | Manual check in each browser |

### W5 Known Failure Points

- **Chat jitter** — container height must be fixed, messages scroll within. Do not let container resize.
- **Focus trap implementation** — use `focus-trap-react` or manual implementation with `inert` attribute on background
- **Lighthouse Performance on SSE route** — ensure chat page doesn't tank performance metrics
- **Bundle size creep** — Framer Motion can add 30KB+ if not tree-shaken correctly

### W5 Skills to Load

- `web-design-system` — animation durations, reduced motion rules
- `web-component-patterns` — focus management pattern

### W5 Stage Gate

ALL 15 ACs must pass. Lighthouse scores meet thresholds. Keyboard-only full walkthrough.
Screen reader test (VoiceOver). Reduced motion full walkthrough.
Then run `/rpi:gate web-stage5`.

---

## WEB STAGE 6 — DEPLOYMENT AND PRODUCTION READINESS

**Duration:** ~10 hours
**Goal:** Web app live on Vercel, connected to production API, all features working
end-to-end in production.
**Stage 6 is complete when the app is live and the full user journey works in production.**

### W6 Scope

**Builds:**
1. Vercel project configuration
2. Environment variables in Vercel dashboard
3. Production Supabase OAuth redirect URIs
4. Production Stripe Checkout configuration
5. Custom domain (if ready)
6. Preview deployments verification
7. Error monitoring (Vercel Analytics or Sentry)
8. SEO (meta tags, OG images, sitemap for marketing pages)
9. Production smoke test
10. Documentation update (IMPLEMENT.md, CLAUDE.md)

**Does NOT build:**
- New features, CDN/caching optimisation, A/B testing

### W6 Acceptance Criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W6-01 | Vercel deployment succeeds from main. Production URL accessible. Landing page renders. | Access URL |
| AC-W6-02 | All env vars in Vercel: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_BIANNUAL. No secrets in NEXT_PUBLIC_. | Inspect Vercel dashboard |
| AC-W6-03 | Google OAuth works in production: sign in → consent → redirect → session → `/roadmap`. | Complete flow |
| AC-W6-04 | Full production smoke test: sign in → onboard → roadmap → open task → mark complete → chat (streaming works) → premium gate → settings → sign out. | Full manual walkthrough |
| AC-W6-05 | Stripe Checkout in production (test mode): upgrade → Stripe → test card → return with `?upgrade=success` → Phase 3 unlocked. | Complete payment flow |
| AC-W6-06 | Preview deployments: create PR → Vercel preview → preview URL works. | Create test PR |
| AC-W6-07 | SEO: correct meta title, description, OG image on landing page. robots.txt allows `/`. Sitemap for marketing only. | Inspect source + social preview |
| AC-W6-08 | Error monitoring: unhandled errors reported. Test: trigger error, verify in dashboard. | Force error, check monitoring |
| AC-W6-09 | IMPLEMENT.md updated with web stages completion. CLAUDE.md updated with web context. | Inspect files |
| AC-W6-10 | Lighthouse on production: Performance ≥ 85, Accessibility ≥ 95. LCP < 3.0s on 3G throttle. | Run Lighthouse on production URL |

### W6 Known Failure Points

- **Supabase redirect URI** — production domain must be added to Supabase Auth → URL Configuration → Redirect URLs
- **Stripe success URL** — must use production domain, not localhost
- **Vercel serverless function timeout** — default 10s, chat streaming may need longer for slow Claude responses
- **OG image not rendering** — must be absolute URL with protocol in meta tags

### W6 Skills to Load

None required — deployment and configuration only.

### W6 Stage Gate

ALL 10 ACs must pass. Full user journey completed on production by Ruchira.
Lighthouse scores meet thresholds. IMPLEMENT.md and CLAUDE.md updated.
Then run `/rpi:gate web-stage6`. **Web build complete.**

---

## SECTION 3: CROSS-CUTTING CONCERNS

### 3.1 Testing strategy

| Layer | Tool | What | When |
|-------|------|------|------|
| Unit | Vitest | Component render, state derivation, utilities | Every commit (pre-push) |
| Component | Storybook | Visual docs, isolated rendering | Development |
| Visual regression | Playwright screenshots | Pixel comparison vs baselines | Every PR (CI) |
| E2E | Playwright | Full user journeys | Every PR (CI) |
| Accessibility | axe-core + manual | WCAG 2.1 AA | Stage 5 + every PR |
| Performance | Lighthouse CI | Core Web Vitals, bundle size | Every PR to main |

### 3.2 CI pipeline

```yaml
# .github/workflows/web-ci.yml
name: Web CI
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx tsc --noEmit --project apps/web/tsconfig.json
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: cd apps/web && npm run test -- --run
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: cd apps/web && npm run build
      - run: cd apps/web && npx playwright test
  lighthouse:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: cd apps/web && npm run build
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: apps/web/lighthouserc.json
```

### 3.3 Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Client | Fastify API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anonymous key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe publishable key |
| `STRIPE_PRICE_ID_MONTHLY` | Server | Stripe monthly price ID |
| `STRIPE_PRICE_ID_BIANNUAL` | Server | Stripe 6-month price ID |
| `STRIPE_SECRET_KEY` | Server | Stripe secret (NEVER in NEXT_PUBLIC_) |
| `STRIPE_WEBHOOK_SECRET` | Server | Stripe webhook verification |

---

## STAGE DEPENDENCY MAP

```
WEB STAGE 1 — Design System Foundation
    ↓ (all primitives in Storybook)
WEB STAGE 2 — Layout Shell and Navigation
    ↓ (all routes navigable with correct layouts)
WEB STAGE 3 — Static Screens (Mock Data)
    ↓ (all screens pixel-perfect with hardcoded data)
WEB STAGE 4 — API Integration and Data Flow
    ↓ (all screens working with real data)
WEB STAGE 5 — Interactive States and Animation Polish
    ↓ (all micro-interactions, a11y, performance)
WEB STAGE 6 — Deployment and Production Readiness
    ↓ (live on production)
WEB BUILD COMPLETE
```

Each stage builds exclusively on the output of the previous stage.
No stage may begin until the previous stage gate passes.
Each acceptance criterion gets one git commit.
`IMPLEMENT.md` updated after every stage completion.

---

## DECISIONS LOG — WEB BUILD

| Decision | What | Why |
|----------|------|-----|
| RPI integration | Same commands, same agents, same pipeline | No parallel system — web plugs into existing infrastructure |
| Stage approach | Layer-based (6 stages) | Matches backend pattern; each layer independently testable |
| AC naming | AC-W{stage}-{number} | Distinguishes from backend AC-{phase}-{number}, no collision |
| Framework | Next.js 14 App Router | SSR for landing SEO, RSC for performance, Vercel deployment |
| Styling | Tailwind (no component lib) | Full token control, exact spec match, no bloat |
| State | Zustand + URL state | Minimal client JS, shareable URLs |
| Testing | Storybook + Playwright + Vitest | Component isolation + visual regression + E2E |
| Auth | Supabase SSR helpers | Matches backend, handles server-side sessions |
| Payments | Stripe Checkout redirect | No embedded forms, PCI handled by Stripe |
| Deploy | Vercel | Native Next.js, preview per PR |
| Mock first (S3) | All screens hardcoded before API | Decouples visual from API stability |
| Design system first (S1) | Primitives before pages | Foundation-first prevents inconsistency |
| Constitution additions | CW01-CW06 appended | Web-specific constraints, same validator |
| New skills | 4 web skills alongside existing 4 | Domain knowledge for web patterns |
| Hook additions | Storybook/token/a11y guards | Same hook system, web-specific checks |

---

*This document is the single source of truth for the LandedNZ web build.
It integrates with the existing RPI pipeline — no new commands, no new agents,
no parallel infrastructure. Claude Code reads the relevant stage section via
`/rpi:research web-stage{N} AC-W{N}-{NN}` and follows the same three-step cycle
that built the entire backend.*
