# Skill: Web Responsive Layout
# Domain knowledge for implementing sidebar, panels, breakpoints, and responsive transitions.
# Preloaded by: senior-software-engineer agent

---

## What this skill covers

Breakpoint rules, sidebar collapse logic, detail panel transitions (right panel → overlay
→ full page), two-panel vs single-panel layout switching, content max-width behaviour,
and mobile navigation patterns. Reference document: 14-ui-ux-design.md (Navigation Pattern
and Responsive Breakpoints sections).

---

## Files in scope

```
apps/web/src/
├── app/(app)/layout.tsx            ← App layout: sidebar + content + detail panel
├── app/(marketing)/layout.tsx      ← Marketing layout: full-width, no sidebar
├── components/layout/
│   ├── Sidebar.tsx                 ← Full nav, collapse/expand, responsive
│   ├── DetailPanel.tsx             ← Slide-in right panel, overlay modes
│   ├── MobileNav.tsx               ← Hamburger drawer for <768px
│   └── ContentArea.tsx             ← Max-width container, scroll management
└── lib/hooks/
    └── useBreakpoint.ts            ← Current breakpoint detection hook
```

---

## Breakpoint definitions

| Name | Range | Sidebar | Detail Panel | Chat |
|------|-------|---------|-------------|------|
| desktop-wide | ≥1280px | 256px expanded | 480px right panel | Side panel or full page |
| desktop | 1024–1279px | 64px icon-only | 400px right panel | Side panel or full page |
| tablet | 768–1023px | 64px overlay on demand | Slide-over overlay with backdrop | Full page only |
| mobile | <768px | Hidden (hamburger menu) | Full page navigation | Full page only |

Tailwind breakpoint classes:
- `lg:` → ≥1024px
- `xl:` → ≥1280px
- No `md:` — 768px uses custom breakpoint or `min-[768px]:`

---

## App layout structure

```
┌──────────┬─────────────────────────────────┬────────────────────────┐
│ Sidebar  │  ContentArea                    │  DetailPanel           │
│ 256px    │  (scrollable, max-w-content)    │  480px (hidden default)│
│ (or 64px)│                                 │                        │
└──────────┴─────────────────────────────────┴────────────────────────┘
```

Implementation:

```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-6 py-12">
          {children}
        </div>
      </main>
      <DetailPanel />
    </div>
  );
}
```

---

## Sidebar component behaviour

### Expanded (≥1280px)
```
┌─────────────────────────────┐
│  🏠 LandedNZ               │  Logo + name → link to /roadmap
│                             │
│  ◉ Roadmap                  │  Primary nav items
│  💬 Chat                    │
│  ⚙ Settings                │
│                             │
│  ─── YOUR PLAN ───          │  Section divider (uppercase, caption size)
│  ▸ Phase 1: Before arrival  │  Collapsible, shows "4/8 ✓"
│  ▸ Phase 2: First 2 weeks   │
│  ▸ Phase 3: Weeks 3-8       │  Lock icon + "Premium" if locked
│                             │
│  ─── HELP ───               │
│  📖 Resources               │
│  📧 Feedback                │
│                             │
│  ─────────────────          │
│  Priya & Karthik            │  User name(s)
│  Partner of Student Visa    │  Visa badge
│  Auckland                   │  City
└─────────────────────────────┘
```

Width: `w-sidebar` (256px). Background: `bg-bg-sidebar`.

### Collapsed (1024–1279px)
- Width: `w-sidebar-collapsed` (64px)
- Only icons visible, text hidden
- Hover on icon shows Tooltip with nav item name
- Phase sections hidden when collapsed
- User section shows avatar circle only

### Overlay (768–1023px)
- Default: collapsed (64px)
- Hamburger icon click: sidebar expands to 256px as overlay
- Semi-transparent backdrop behind expanded sidebar
- Click backdrop or press Escape: sidebar collapses back

### Hidden (<768px)
- Sidebar not rendered at all
- Hamburger icon in top-left corner of ContentArea
- Click: opens MobileNav (bottom sheet or slide-in drawer)
- Full navigation options in MobileNav
- Backdrop click or swipe down: closes

---

## Active state styling

```tsx
const isActive = pathname === item.href;

<Link
  href={item.href}
  className={cn(
    'flex items-center gap-3 px-4 py-2.5 rounded-button text-body transition-colors',
    isActive
      ? 'bg-primary-light text-primary border-l-[3px] border-primary font-semibold'
      : 'text-text-secondary hover:bg-primary-subtle hover:text-text-primary'
  )}
>
```

---

## Detail panel behaviour

### Right panel (≥1024px)
- Width: `w-detail-panel` (480px) or `w-detail-panel-min` (400px) at 1024–1279px
- Slides in from right: `transform translateX(100%) → translateX(0)`, 0.25s ease-out
- Slides out on close: `translateX(0) → translateX(100%)`, 0.2s ease-in
- Shadow: `shadow-panel` on left edge
- Close button (X) in top-right corner
- Content scrolls independently of main content area

### Overlay (768–1023px)
- Same panel, but positioned over content area (not beside it)
- Semi-transparent backdrop behind panel
- Click backdrop: closes panel
- z-index above content, below mobile nav

### Full page (<768px)
- Panel not used at all
- Clicking a task navigates to `/roadmap/task/[taskId]`
- Back button ("← Back to roadmap") at top of full page detail view
- Browser back also works

---

## Focus management (constitutional constraint CW03 adjacent — accessibility)

When DetailPanel opens:
1. Focus moves to the panel close button
2. Focus is trapped within the panel (Tab cycles through panel elements only)
3. Elements behind the panel get `inert` attribute (prevents interaction)

When DetailPanel closes:
1. Focus returns to the element that triggered the panel open (the task card)
2. `inert` removed from background elements

Implementation: use `focus-trap-react` library or manual `inert` attribute management.

---

## Phase section expand/collapse

```tsx
function PhaseSection({ phase, children }: PhaseSectionProps) {
  const [isExpanded, setExpanded] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-4 py-2 text-body text-text-secondary"
        aria-expanded={isExpanded}
      >
        <ChevronRight className={cn(
          'h-4 w-4 transition-transform duration-200',
          isExpanded && 'rotate-90'
        )} />
        <span>{phase.name}</span>
        <span className="ml-auto text-caption text-text-tertiary">
          {phase.completedCount}/{phase.totalCount} ✓
        </span>
      </button>
      
      {/* Height transition for expand/collapse */}
      <div className={cn(
        'overflow-hidden transition-[max-height] duration-200 ease-out',
        isExpanded ? 'max-h-[2000px]' : 'max-h-0'
      )}>
        {children}
      </div>
    </div>
  );
}
```

Reduced motion: `transition-duration: 0s` when `prefers-reduced-motion: reduce`.
