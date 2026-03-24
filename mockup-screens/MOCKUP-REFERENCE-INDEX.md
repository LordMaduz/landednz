# LandedNZ Web UI — Mockup Reference Index
# For Claude Code implementation pipeline

*Generated: March 2026*
*Source documents: 13-ui-ux-research.md, 14-ui-ux-design.md, 16-web-layout-analysis.md*
*Reference apps: Linear (task list/detail), Notion (sidebar/home), Intercom Fin (chat overlay)*

---

## MOCKUP FILES

| Screen | File | URL Route | Description |
|--------|------|-----------|-------------|
| 1. Landing Page | `mockup-screens/landednz-screen1-landing-page.jsx` | `/` | Marketing entry point. Hero + problem statement + how it works + social proof + pricing + CTA |
| 2. Onboarding Flow | `mockup-screens/landednz-screen2-onboarding.jsx` | `/onboarding` | 5-question conversational flow + roadmap reveal transition (includes Screen 8) |
| 3. Roadmap Dashboard | `mockup-screens/landednz-screen3-roadmap-dashboard.jsx` | `/roadmap` | Core app screen. Sidebar + hero card + priority tasks + filter tabs + phase sections + task detail replacement |
| 4. Task Detail | (embedded in Screen 3) | `/roadmap` (replaces list) | Full task detail with consequence callout, steps, documents, source, tips, actions |
| 5. Chat Interface | `mockup-screens/landednz-screen5-chat-interface.jsx` | Floating overlay | Intercom Fin pattern. Entry-point-aware, structured responses, inline citations, thinking state |
| 6. Premium Gate | `mockup-screens/landednz-screen6-premium-gate.jsx` | `/roadmap` (inline) | Inline card between free and premium tasks. Three paths: upgrade, defer, decline |
| 7. Settings | `mockup-screens/landednz-screen7-settings.jsx` | `/settings` | Profile, subscription, notifications, account. Single column centered |
| 8. Roadmap Reveal | (embedded in Screen 2) | `/onboarding` → `/roadmap` | Transition animation with personalised messages. 1.5–2s psychological pause |
| 9. Auth | `mockup-screens/landednz-screen9-auth.jsx` | `/auth/signin` | Google OAuth + magic link email. "Save your progress" framing |

---

## PIPELINE INTEGRATION

### How mockups connect to the RPI build stages

| RPI Stage | Mockup relevance | What to verify against mockups |
|-----------|-----------------|-------------------------------|
| `web-stage1-design-system` | Token extraction | Colours, typography (DM Sans/Serif Display), spacing, shadows, border-radius match mockup values |
| `web-stage2-layout-shell` | Layout structure | Sidebar width/style, two-column only (no DetailPanel), content max-width |
| `web-stage3-static-screens` | **PRIMARY** — every screen | Every screen compared side-by-side with its mockup .jsx file |
| `web-stage4-api-integration` | Interaction patterns | Chat streaming matches mockup conversation flow, task state changes match mockup states |
| `web-stage5-interactive-polish` | Animations + transitions | Hover states, slide-in/out, collapse/expand, thinking dots match mockup timing |
| `web-stage6-deployment` | No direct reference | Production smoke test against user flow map below |

### How mockups connect to .claude skills

| Skill | Mockup files to reference |
|-------|--------------------------|
| `web-design-system` | All files — token values (colours, fonts, spacing) |
| `web-component-patterns` | `screen3` (task rows, hero card, phases), `screen6` (premium gate) |
| `web-responsive-layout` | `screen3` (sidebar), `screen5` (floating chat) |
| `web-chat-streaming` | `screen5` (chat panel, messages, thinking, citations) |

### Source hierarchy (for Claude Code)

When implementing any visual element, check sources in this order:
1. **This index file** — design decisions and resolved conflicts
2. **The mockup .jsx file** — visual truth, pixel-level reference
3. **The relevant .claude skill** — implementation patterns and code structure
4. **The RPI stage REQUEST.md** — acceptance criteria and scope
5. **14-ui-ux-design.md** — original spec (overridden where documented below)
6. **16-web-layout-analysis.md** — layout rules

---

## DESIGN DECISIONS LOG (Conflicts Resolved)

These decisions override 14-ui-ux-design.md where they conflict:

### 1. Task Detail Navigation
- **Decision**: Content REPLACES list view (Linear pattern)
- **Source**: 16-web-layout-analysis.md, confirmed during mockup session
- **Overrides**: 14-ui-ux-design.md specified side-by-side two-panel layout
- **Implementation**: When task is clicked, roadmap list unmounts, task detail mounts in same content area. Back button returns to list. No right panel needed.
- **Affected files**: `web-component-patterns` skill, `web-responsive-layout` skill, `web-stage2` REQUEST, `web-stage3` REQUEST

### 2. Hero Progress Area
- **Decision**: Teal hero card with circular progress indicator (Option B)
- **Source**: 14-ui-ux-design.md, confirmed by user during mockup session
- **Implementation**: `linear-gradient(135deg, #1B6B6D, #145254)`, 72px SVG circular progress ring with `#D4A843` stroke, stats row below greeting

### 3. Task Row Density
- **Decision**: Hybrid — card-like but minimal
- **Source**: Compromise between Linear tight rows (16) and full cards (14)
- **Implementation**: Single border, ~44px row height, status icon + name + consequence line (truncated) + time/difficulty metadata. No heavy padding, no card shadows at rest.

### 4. Chat Interface
- **Decision**: Floating overlay panel (Intercom Fin pattern)
- **Source**: 16-web-layout-analysis.md, confirmed during mockup session
- **Overrides**: 14-ui-ux-design.md specified 480px side panel or full page
- **Implementation**: Fixed position, bottom-right, 420×600px, rounded corners, shadow overlay. Portal-rendered. FAB button when closed.
- **Affected files**: `web-chat-streaming` skill, `web-responsive-layout` skill

### 5. Layout Rule
- **Decision**: Always two windows — sidebar | content. Nothing else.
- **Source**: 16-web-layout-analysis.md (CORE RULE)
- **Implementation**: No three-column layout ever. Task detail replaces list. Chat floats as overlay.
- **Affected files**: `web-responsive-layout` skill, `web-stage2` REQUEST

### 6. Typography
- **Decision**: DM Serif Display (headings) + DM Sans (body) instead of Inter
- **Source**: Mockup session — chosen for "warm authority" tone
- **Overrides**: 14-ui-ux-design.md specified Inter
- **Additional**: Body text at 0.9375rem (15px), not 1rem (16px)
- **Affected files**: `web-design-system` skill, `web-stage1` REQUEST

---

## DESIGN TOKENS (For Implementation)

### Colours
```css
--color-primary:          #1B6B6D;
--color-primary-hover:    #15585A;
--color-primary-light:    #E8F4F4;
--color-primary-subtle:   #F0F8F8;
--color-secondary:        #D4A843;
--color-secondary-light:  #FDF6E7;
--color-secondary-hover:  #C09338;
--color-bg:               #F8F6F3;
--color-bg-card:          #FFFFFF;
--color-bg-sidebar:       #F2F0ED;
--color-text-primary:     #1A1A2E;
--color-text-secondary:   #5A5A6E;
--color-text-tertiary:    #8E8E9A;
--color-text-inverse:     #FFFFFF;
--color-success:          #2D8A5E;
--color-success-light:    #E8F5EE;
--color-warning:          #D4A843;
--color-warning-light:    #FDF6E7;
--color-error:            #C75B4A;
--color-error-light:      #FDF0EE;
--color-blocked:          #8E8E9A;
--color-blocked-light:    #F2F2F4;
--color-premium-gold:     #D4A843;
--color-border:           #E5E3E0;
--color-border-hover:     #D0CEC8;
--color-border-focus:     #1B6B6D;
```

### Typography
```css
--font-display:   'DM Serif Display', serif;
--font-body:      'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

--text-display:   2.25rem / 400 (DM Serif Display);
--text-h1:        1.5rem / 400 (DM Serif Display);
--text-h2:        1.375rem / 400 (DM Serif Display);
--text-h3:        1.125rem / 600 (DM Sans);
--text-body:      0.9375rem / 400 (DM Sans);    /* 15px — NOT 16px */
--text-secondary: 0.8125rem / 400 (DM Sans);
--text-caption:   0.6875rem / 500 (DM Sans);
```

### Layout
```css
--sidebar-width:       256px;
--sidebar-collapsed:   64px;
--content-max-width:   960px;
--card-border-radius:  12px;
--button-border-radius: 10px;
--input-border-radius:  10px;
--badge-border-radius:  100px;
--chat-panel-width:    420px;
--chat-panel-height:   600px;
--chat-panel-radius:   16px;
```

### Shadows
```css
--shadow-card:         0 1px 3px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04);
--shadow-card-hover:   0 4px 12px rgba(26,26,46,0.08), 0 2px 4px rgba(26,26,46,0.04);
--shadow-chat-panel:   0 12px 48px rgba(26,26,46,0.15), 0 4px 16px rgba(26,26,46,0.08);
--shadow-modal:        0 16px 48px rgba(26,26,46,0.15);
```

---

## COMPONENT INVENTORY

Components Claude Code should extract from the mockups and build as reusable React components:

### Layout
- `<AppShell />` — Sidebar + content area wrapper (TWO columns only)
- `<Sidebar />` — Navigation, phase sections, user footer
- `<ContentArea />` — Scrollable content with max-width constraint

### Navigation
- `<SidebarNavItem />` — Icon + label + active state
- `<SidebarPhaseSection />` — Collapsible phase with task list
- `<FilterTabs />` — All / To do / In progress / Done
- `<BackButton />` — "← Back to roadmap" for task detail

### Task System
- `<HeroProgressCard />` — Teal gradient card with circular progress
- `<TaskRow />` — Hybrid density row with 7 states
- `<TaskDetail />` — Full detail view (REPLACES list, not side panel)
- `<StatusIcon />` — Circle indicator for each task state
- `<ConsequenceCallout />` — Amber "Why this matters now" block
- `<StepList />` — Numbered steps with connector lines
- `<DocumentList />` — Required/optional document rows
- `<SourceCard />` — Official source with external link
- `<TipsCollapsible />` — Expandable tips section

### Chat
- `<ChatPanel />` — Floating overlay (420×600px, bottom-right, Portal-rendered)
- `<ChatFAB />` — Floating action button to open chat
- `<AIMessage />` — Left-aligned message with avatar, content, sources, attribution
- `<UserMessage />` — Right-aligned message bubble
- `<ThinkingIndicator />` — Animated dots + status text
- `<CitationBadge />` — Inline source pill
- `<SuggestedQuestion />` — Tappable question chip

### Premium
- `<PremiumGateCard />` — Full upgrade card with three paths
- `<PremiumBanner />` — Collapsed persistent banner
- `<PremiumTaskRow />` — Gold-accented locked task row

### Onboarding
- `<OnboardingProgressBar />` — Segmented progress indicator
- `<QuestionView />` — Single question with card options
- `<OptionCard />` — Selectable option with icon, label, description
- `<RoadmapReveal />` — Transition animation with personalised messages
- `<ScopeDeclaration />` — "5 questions, 2 minutes" entry screen

### Settings
- `<SectionCard />` — White card with icon + title header
- `<FieldRow />` — Label + value + optional edit link
- `<Toggle />` — On/off switch
- `<RadioOption />` — Card-style radio selector
- `<DeleteModal />` — Destructive confirmation dialog

### Auth
- `<AuthCard />` — Centered card with OAuth + email flows
- `<GoogleButton />` — Google OAuth with loading state
- `<MagicLinkSent />` — Email confirmation state

### Shared
- `<Badge />` — Pill badge (phase, difficulty, premium, status)
- `<DifficultyBadge />` — Easy (green) / Medium (amber) / Hard (coral)
- `<Spinner />` — Loading spinner SVG
- `<CircularProgress />` — SVG ring for hero card

---

## ANIMATION SPECS

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Task row hover | Background + border colour | 0.15s | ease |
| Task detail enter | slideInRight (translateX 20px → 0) | 0.3s | ease-out |
| Chat panel open | slideUpPanel (translateY 20px + scale 0.97 → normal) | 0.3s | ease-out |
| Chat message (AI) | fadeInUp (translateY 12px → 0) | 0.25s | ease-out |
| Chat thinking dots | typing (translateY bounce) | 1s | ease-in-out, infinite |
| Onboarding question enter | fadeInUp (translateY 20px → 0) | 0.5s | ease-out |
| Onboarding question exit | fadeOutUp (translateY 0 → -20px) | 0.35s | ease-in |
| Option card stagger | fadeInUp with 0.05s × index delay | 0.4s | ease-out |
| Selected checkmark | scaleIn (scale 0.95 → 1) | 0.2s | ease-out |
| Phase collapse/expand | height transition | 0.2s | ease-out |
| Modal overlay | fadeIn | 0.15s | ease-out |
| Modal card | scaleIn | 0.2s | ease-out |
| Progress ring | stroke-dashoffset transition | 0.6s | ease-out |
| Premium gate card | fadeInUp | 0.4s | ease-out |
| Premium banner | fadeIn | 0.3s | ease-out |

### Reduced Motion
When `prefers-reduced-motion: reduce`: all animations instant, dots static, progress ring no transition.

---

## USER FLOW MAP

```
Landing Page (/)
    ↓ "Build my plan — free"
Onboarding (/onboarding)
    ↓ 5 questions → Roadmap Reveal
Roadmap Dashboard (/roadmap)
    ├── Click task → Task Detail (REPLACES list in content area)
    │       ├── "Ask a question" → Chat Overlay (floating)
    │       ├── "Mark as done" → Returns to list
    │       └── "← Back to roadmap" → Returns to list
    ├── Scroll to Phase 3 → Premium Gate (inline card)
    │       ├── Upgrade → Stripe → /roadmap (premium)
    │       ├── Defer → Banner state
    │       └── Decline → Banner state
    ├── Sidebar: Chat → Chat Overlay (floating)
    ├── Sidebar: Settings → Settings (/settings)
    └── First interaction → Auth prompt (/auth/signin)
            ├── Google OAuth → /roadmap
            └── Magic link → email → /roadmap

Chat Overlay (floating, any screen)
    ├── Entry from task → "You're looking at [task]..."
    ├── Entry from roadmap → "Hi Priya, you've completed X tasks..."
    └── Close → FAB button remains
```

---

## IMPLEMENTATION NOTES FOR CLAUDE CODE

1. **Font loading**: Self-host DM Sans (variable) and DM Serif Display (400) in `public/fonts/`. Add `@font-face` in `globals.css` with `font-display: swap`. Do NOT use Google Fonts CDN.

2. **CSS approach**: Extract mockup inline styles to Tailwind utility classes. Design tokens map to `tailwind.config.ts` `extend`. See `web-design-system` skill for exact class names.

3. **State management**: Task state, onboarding answers, chat, and user profile via Zustand stores. Mockups use `useState` for demo — production uses Zustand.

4. **Chat panel**: Render via React Portal at app root, NOT inside the content area layout. This ensures it floats above all content at all breakpoints.

5. **Task detail**: Content replacement pattern — sidebar stays mounted, content area swaps between `<RoadmapList />` and `<TaskDetail />`. Use Zustand `selectedTask` state, not React Router for desktop. Mobile (<768px) uses route navigation to `/roadmap/task/[id]`.

6. **Responsive breakpoints**:
   - 1280px+: Sidebar 256px expanded, content fills remainder
   - 1024–1279px: Sidebar 64px icon-only, content fills remainder
   - 768–1023px: Sidebar as overlay on demand, content full-width
   - <768px: Hamburger menu, full-page task detail, full-page chat

7. **Accessibility**: WCAG 2.1 AA. Focus trap only on chat overlay. `prefers-reduced-motion` disables all animations. All interactive elements 32px+ desktop, 44px+ mobile.

8. **Dark mode**: Not supported at MVP. Light theme only.

---

*This document + the mockup .jsx files are the definitive visual reference for Claude Code.
Cross-reference with the .claude skills for implementation patterns and RPI REQUEST files
for acceptance criteria.*
