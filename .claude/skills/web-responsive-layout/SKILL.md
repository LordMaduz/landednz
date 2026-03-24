# Skill: Web Responsive Layout
# Domain knowledge for implementing sidebar, responsive breakpoints, and layout transitions.
# Preloaded by: senior-software-engineer agent
# Visual truth: mockup-screens/*.jsx

---

## What this skill covers

Breakpoint rules, sidebar collapse logic, content replacement for task detail (NOT side
panel), floating chat overlay, content max-width behaviour, and mobile navigation patterns.

**Core layout rule (from 16-web-layout-analysis.md):**
Always two windows — sidebar | content. Nothing else. No three-column layout ever.
Task detail replaces list content. Chat floats as an overlay. Settings is single column.

---

## Files in scope

```
apps/web/src/
├── app/(app)/layout.tsx            ← App layout: sidebar + content area (TWO columns only)
├── app/(marketing)/layout.tsx      ← Marketing layout: full-width, no sidebar
├── components/layout/
│   ├── Sidebar.tsx                 ← Full nav, collapse/expand, responsive
│   ├── MobileNav.tsx               ← Hamburger drawer for <768px
│   └── ContentArea.tsx             ← Max-width container, scroll management
├── components/chat/
│   ├── ChatPanel.tsx               ← FLOATING OVERLAY (bottom-right), not a layout column
│   └── ChatFAB.tsx                 ← Floating action button to open chat
└── lib/hooks/
    └── useBreakpoint.ts            ← Current breakpoint detection hook
```

**NOTE:** There is NO `DetailPanel.tsx` for task detail. Task detail renders within
ContentArea as a content replacement. See `web-component-patterns` skill.

---

## Breakpoint definitions

| Name | Range | Sidebar | Task detail | Chat |
|------|-------|---------|-------------|------|
| desktop-wide | ≥1280px | 256px expanded | Replaces list in content area | Floating overlay 420×600px |
| desktop | 1024–1279px | 64px icon-only | Replaces list in content area | Floating overlay 420×600px |
| tablet | 768–1023px | 64px overlay on demand | Full page navigation | Floating overlay (may reduce height) |
| mobile | <768px | Hidden (hamburger menu) | Full page navigation (`/roadmap/task/[id]`) | Full page (`/chat`) |

**Key difference from original spec:** There is no "right panel" column at any
breakpoint. Task detail always replaces the list. Chat is always a floating overlay
(except mobile where it's a full page).

---

## App layout structure

```
┌──────────┬─────────────────────────────────────────┐
│ Sidebar  │  ContentArea                            │
│ 256px    │  (scrollable, max-w-content)            │
│ (or 64px)│                                         │
│          │  Shows EITHER:                          │
│          │  • RoadmapList (default)                │
│          │  • TaskDetail (when task selected)      │
│          │  • SettingsPage                         │
│          │  • ChatPage (mobile only)               │
└──────────┴─────────────────────────────────────────┘
                              ┌────────────────────┐
                              │ ChatPanel (overlay) │
                              │ 420×600px          │
                              │ bottom-right fixed │
                              └────────────────────┘
```

Implementation:

```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-6 lg:px-10 py-7">
          {children}
        </div>
      </main>
      {/* Chat overlay rendered at app root — NOT inside content flow */}
      <ChatOverlayPortal />
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
│  ─── YOUR PLAN ───          │  Section divider
│  ▸ Phase 1: Before work     │  Collapsible, shows "4/8 ✓"
│  ▸ Phase 2: First 2 weeks   │
│  ▸ Phase 3: Settling in     │  Lock icon + "Premium" if locked
│                             │
│  ─── HELP ───               │
│  📖 Resources               │
│  📧 Feedback                │
│                             │
│  ─────────────────          │
│  Priya & Karthik            │  User name(s), avatar circle
│  Partner of Student Visa    │  Visa badge
│  Auckland                   │  City
└─────────────────────────────┘
```

Width: `w-sidebar` (256px). Background: `bg-bg-sidebar`.

**Visual reference:** `mockup-screens/landednz-screen-roadmap-dashboard.jsx`

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
- Click backdrop or Escape: sidebar collapses back

### Hidden (<768px)
- Sidebar not rendered
- Hamburger icon in top-left corner of ContentArea
- Click: opens MobileNav (slide-in drawer)
- Full navigation options in MobileNav
- Backdrop click or swipe: closes

---

## Active state styling

```tsx
const isActive = pathname === item.href;

<Link
  href={item.href}
  className={cn(
    'flex items-center gap-2.5 px-3 py-2 rounded-button text-secondary transition-colors',
    isActive
      ? 'bg-primary-light text-primary border-l-[3px] border-primary font-semibold'
      : 'text-text-secondary hover:bg-primary-subtle border-l-[3px] border-transparent'
  )}
>
```

---

## Chat overlay (Intercom Fin pattern)

Chat is a FLOATING PANEL overlaid on the page — not embedded in the layout.

```tsx
// components/chat/ChatPanel.tsx — rendered via React Portal at app root
function ChatPanel({ onClose }) {
  return createPortal(
    <div className="fixed bottom-6 right-6 w-chat-panel h-chat-panel
                    bg-bg-card rounded-chat-panel border border-border
                    shadow-chat-panel flex flex-col overflow-hidden z-50">
      <ChatHeader onClose={onClose} />
      <ChatMessages />
      <ChatInput />
    </div>,
    document.body
  );
}
```

Key rules:
- Position: `fixed bottom-6 right-6` (24px from edges)
- Size: 420×600px (`w-chat-panel h-chat-panel`)
- z-index: above all content, above sidebar overlay
- Background content: dims slightly when chat is open (optional, not blur)
- Close button: top-right of panel header
- When closed: ChatFAB button appears (56px circle, bottom-right)

**Mobile (<768px):** Chat is a full page at `/chat`, not a floating panel.

**Visual reference:** `mockup-screens/landednz-screen-chat-interface.jsx`

---

## Content replacement for task detail

When a task is clicked on desktop/tablet:

```tsx
// In the roadmap page component
function RoadmapPage() {
  const { selectedTask, selectTask, clearSelection } = useRoadmapStore();

  return selectedTask ? (
    <TaskDetail
      task={selectedTask}
      onBack={clearSelection}
      className="animate-slide-in-right"
    />
  ) : (
    <RoadmapList onTaskClick={selectTask} />
  );
}
```

On mobile (<768px): clicking a task navigates to `/roadmap/task/[taskId]` as a
separate route. Back button and browser back both work.

**There is no DetailPanel component.** The original spec's `DetailPanel.tsx` is removed.

---

## Phase section expand/collapse

```tsx
function PhaseSection({ phase, children }: PhaseSectionProps) {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-2 py-2.5 text-secondary
                   text-text-secondary hover:bg-black/[0.02] rounded-md"
        aria-expanded={isExpanded}
      >
        <ChevronRight className={cn(
          'h-3 w-3 text-text-tertiary transition-transform duration-150',
          isExpanded && 'rotate-90'
        )} />
        <span className="font-semibold text-text-primary">Phase {phase.num}: {phase.name}</span>
        <span className="text-caption text-text-tertiary ml-1">· {phase.timeline}</span>
        {phase.premium && (
          <Badge variant="premium" size="sm">Premium</Badge>
        )}
        <span className="ml-auto text-caption text-text-tertiary">
          {phase.completedCount}/{phase.totalCount}
        </span>
      </button>

      {isExpanded && (
        <div className="pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
```

Reduced motion: instant expand/collapse, no transition.

---

## Focus management

When task detail is shown (content replacement):
1. Focus moves to the "← Back to roadmap" button
2. No focus trap needed (it's not a panel/overlay — it's just page content)

When chat overlay opens:
1. Focus moves to the chat close button
2. Focus is trapped within the chat panel
3. Escape key closes the chat panel
4. Focus returns to the element that opened the chat

Implementation: use `focus-trap-react` for chat overlay only.
