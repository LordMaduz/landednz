# Research: AC-W2-04 + AC-W2-05 + AC-W2-06 — Complete Sidebar (Sidebar Shell Batch)

## Understanding

Build the complete Sidebar component with full nav structure and all responsive behaviours
in a single implementation pass. The three ACs are tightly coupled — nav content (W2-04),
icon-only collapse (W2-05), and mobile hamburger (W2-06) are all one component.

**Existing stub** (`components/layout/Sidebar.tsx`): just an `<aside>` with width/background.
This batch replaces it entirely.

### What each AC adds

| AC | What it adds |
|----|-------------|
| W2-04 | Full nav: logo, 3 nav items (Roadmap/Chat/Settings), "YOUR PLAN" section with 3 collapsible phase headers, "HELP" section (Resources/Feedback), user footer. Active state: bg-primary-light + text-primary + 3px left border. |
| W2-05 | Responsive collapse at 1024-1279px (lg): 64px wide, icons only, text hidden, Tooltip on hover for each nav item. |
| W2-06 | Mobile (<768px): sidebar hidden entirely. Hamburger button renders in app layout. Opens MobileNav drawer from left. Backdrop click or Escape closes. |

---

## Responsive Behaviour Matrix

| Viewport | Sidebar | Width | Text | Trigger |
|----------|---------|-------|------|---------|
| ≥1280px (xl) | Rendered, expanded | `w-sidebar` (256px) | Visible | — |
| 1024–1279px (lg) | Rendered, collapsed | `w-sidebar-collapsed` (64px) | Hidden | Tooltip on hover |
| 768–1023px (md) | Rendered, collapsed | 64px default → 256px overlay | Hidden → visible | Hamburger in sidebar top |
| <768px | Not rendered | — | — | Hamburger in layout → MobileNav drawer |

---

## Files Involved

**Modify:**
- `apps/web/src/components/layout/Sidebar.tsx` — replace stub with full implementation
- `apps/web/src/app/(app)/layout.tsx` — add MobileNav alongside Sidebar
- `apps/web/tailwind.config.ts` — add `borderWidth: { '3': '3px' }` for `border-l-3` token

**Create:**
- `apps/web/src/components/layout/MobileNav.tsx` — hamburger + slide-in drawer for <768px

**Install:**
- `lucide-react` — icon library (CLAUDE.md: "Lucide React (icons — Stage 2)")

---

## Implementation Details

### CW01 Issue: Active border needs a token

The skill shows `border-l-[3px]` — an **arbitrary value**, prohibited by CW01.
Fix: add `borderWidth: { '3': '3px' }` to `tailwind.config.ts`, use `border-l-3`.

### Sidebar component structure ('use client')

Requires client-side APIs:
- `usePathname()` — from `next/navigation`, for active state detection
- `useState` — phase expand/collapse state, tablet overlay state

```tsx
'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Map, MessageSquare, Settings, BookOpen, Mail, ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Tooltip } from '@/components/ui/Tooltip'
```

### Nav items (from mockup)
```ts
const navItems = [
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/chat',    label: 'Chat',    icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]
```

### Active state (per skill — with CW01-compliant border token)
```tsx
cn(
  'flex items-center gap-2.5 px-3 py-2 rounded-button transition-colors',
  'border-l-3',  // always present; colour toggles
  isActive
    ? 'bg-primary-light text-primary border-primary font-semibold'
    : 'text-text-secondary hover:bg-primary-subtle border-transparent'
)
```

### Phase sections (static mock for Stage 2)
```ts
const PHASES = [
  { num: 1, name: 'Before you start working', timeline: 'Week 1' },
  { num: 2, name: 'First 2 weeks', timeline: 'Weeks 1–2' },
  { num: 3, name: 'Settling in', timeline: 'Weeks 3–8', premium: true },
]
```
Phase 1 expanded by default. Phase 3 shows Premium badge (lock icon). No task items inside
(those are Stage 3 data). Triangle (ChevronRight) rotates 90° when expanded.

### Responsive classes
```tsx
// Sidebar element:
className="hidden md:flex"      // hidden <768px, shown 768+
// Width:
'xl:w-sidebar'                  // 256px at xl
'w-sidebar-collapsed xl:w-sidebar'  // 64px at md-lg, 256px at xl+
// Text labels:
'hidden xl:block'               // text hidden below xl
// Icons stay always visible
```

### Tablet overlay (768–1023px)
A small hamburger button at the top of the collapsed sidebar (shown only at `md:flex xl:hidden`).
When clicked: `isTabletExpanded = true` → sidebar switches to `absolute left-0 inset-y-0 z-30 w-sidebar`.
A backdrop div `fixed inset-0 bg-black/20 z-20 md:block xl:hidden` covers content. Backdrop
click sets `isTabletExpanded = false`.

### MobileNav component (<768px)
```tsx
// Rendered in (app)/layout.tsx, visible only on mobile
<MobileNav />  // contains hamburger button (shown md:hidden)
              // when open: drawer slides in from left, backdrop covers rest
```

The MobileNav drawer contains the same nav items as the Sidebar. It's a separate component
with its own open/close state. `position: fixed`, full height, `w-sidebar`, `bg-bg-sidebar`,
`z-40` (above everything).

### User footer (static placeholder)
Avatar circle (initials), name "Priya & Karthik", "Partner of Student Visa · Auckland".
Stage 4 replaces with real user data.

---

## Functions / Routes / Tests

- `Sidebar.tsx` — client component, usePathname + useState
- `MobileNav.tsx` — client component, useState (isOpen)
- No new routes
- No unit tests for this AC — verification is visual + navigation

---

## Constraints That Apply

- **CW01:** All classes must be tokens. Fix `border-l-[3px]` → add `borderWidth.3` to tailwind.config.ts, use `border-l-3`
- **CW03:** Reduced motion — phase expand/collapse and MobileNav slide animation must respect `prefers-reduced-motion` (use `motion-reduce:transition-none`)
- **CW04:** No @landednz/types needed for sidebar (layout only, no API types)
- **Two-column rule:** Sidebar + content only; the overlay is positioned absolutely, not a third flex column

---

## Skills Loaded

- `web-responsive-layout` — breakpoint matrix, sidebar collapse logic, active state pattern, MobileNav pattern
- `web-design-system` — tokens (w-sidebar, bg-bg-sidebar, primary-light, etc.), Tooltip usage

---

## Ambiguities / Questions

**One minor question resolved by analysis:**

Q: What icons to use since mockup uses emoji?
A: Lucide icons (the CLAUDE.md specifies "Lucide React — icons — Stage 2"). Use:
   - Roadmap → `Map`, Chat → `MessageSquare`, Settings → `Settings`
   - Resources → `BookOpen`, Feedback → `Mail`
   - Logo → inline SVG (same layers icon from mockup)
   - Phase chevron → `ChevronRight`
   - Premium lock → `Lock`

**No blocking ambiguities.** These are implementation decisions, not gaps in the spec.

## Ready to Plan

YES — no ambiguities.
