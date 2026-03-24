# Skill: Web Component Patterns
# Domain knowledge for implementing task cards, roadmap components, and UI interaction patterns.
# Preloaded by: senior-software-engineer agent
# Visual truth: mockup-screens/landednz-screen-roadmap-dashboard.jsx

---

## What this skill covers

Task card 7-state rendering logic, TaskCardState derivation from API data, optimistic
update pattern, skeleton loading, error recovery, consequence callout, premium gate
inline card pattern, and **task detail as content replacement** (not side panel).

**Critical design decision (from mockup session):**
Task detail REPLACES the roadmap list view within the content area — it does NOT open
in a right panel. The sidebar stays mounted. Only the content area swaps between
`<RoadmapList />` and `<TaskDetail />`. This is the Linear pattern from
16-web-layout-analysis.md, confirmed during the mockup review.

See: `mockup-screens/landednz-screen-roadmap-dashboard.jsx` — click any task to see
the replacement behaviour.

---

## Files in scope

```
apps/web/src/
├── components/roadmap/
│   ├── TaskRow.tsx                 ← Hybrid-density list row, all 7 states
│   ├── TaskDetail.tsx              ← Full detail, REPLACES list view in content area
│   ├── HeroProgressCard.tsx        ← Teal gradient hero with circular progress ring
│   ├── PhaseSection.tsx            ← Collapsible phase with task rows
│   ├── FilterTabs.tsx              ← All Tasks / To Do / In Progress / Done
│   ├── PrioritySection.tsx         ← "Do these first" — top 3 uncompleted tasks
│   ├── ConsequenceCallout.tsx      ← Amber "Why This Matters Now" block
│   ├── StepList.tsx                ← Numbered steps with connector lines
│   ├── DocumentList.tsx            ← Required/optional document rows
│   ├── SourceCard.tsx              ← Official source with external link button
│   ├── TipsCollapsible.tsx         ← Expandable helpful tips section
│   └── PremiumGateCard.tsx         ← Inline premium gate with 3 paths
├── lib/hooks/useRoadmap.ts         ← Data fetching + optimistic updates
├── lib/stores/roadmapStore.ts      ← Zustand: tasks, filter, selected task
└── types/web.ts                    ← TaskCardState, TaskListItem
```

---

## Layout: Content replacement pattern (NOT side panel)

The roadmap page has ONE content area. It renders either the list or the detail:

```tsx
// app/(app)/roadmap/page.tsx
export default function RoadmapPage() {
  const { selectedTask, clearSelection } = useRoadmapStore();

  return (
    <div className="max-w-content mx-auto px-6 lg:px-10 py-7">
      {selectedTask ? (
        <TaskDetail task={selectedTask} onBack={clearSelection} />
      ) : (
        <RoadmapList onTaskClick={(task) => selectTask(task)} />
      )}
    </div>
  );
}
```

**Why not a side panel:** The Linear pattern keeps the layout simple (sidebar + content,
never three columns), gives the task detail full content width for consequence callouts
and step lists, and avoids complex responsive panel logic.

**Back navigation:** "← Back to roadmap" button at top of TaskDetail. Also
set browser history so the back button works.

**Animation:** TaskDetail enters with `slideInRight` (translateX 20px → 0, 0.3s ease-out).
List view has no exit animation (instant unmount).

---

## TaskCardState derivation (from API data to visual state)

```typescript
function deriveCardState(
  entry: UserRoadmapEntry,
  task: Task,
  userTier: 'FREE' | 'PREMIUM'
): TaskCardState {
  if (entry.status === 'COMPLETE') return 'complete';
  if (entry.status === 'IN_PROGRESS') return 'in_progress';
  if (task.taskType === 'PREMIUM' && userTier === 'FREE') return 'premium_locked';
  if (entry.isBlocked) return 'blocked';
  return 'not_started';
}
```

**Order matters:** premium_locked before blocked — free-tier user sees the premium
lock, not a dependency lock.

---

## Task row — hybrid density (from mockup decision)

Each row is card-like but minimal: single border, tight padding (~44px height),
consequence line visible, no heavy shadows at rest.

| State | Status icon | Name style | Second line | Left border | Background |
|-------|-------------|-----------|-------------|-------------|-----------|
| not_started | Empty circle | semibold, text-primary | Consequence (truncated) | none | bg-card |
| in_progress | Half-filled circle | semibold, text-primary | Consequence | 3px primary | bg-card |
| complete | Green check | regular, text-secondary | "Completed Mar 15" | none | bg-card, opacity 0.7 |
| blocked | Lock icon, blocked grey | text-secondary | "Needs: [task name]" | none | blocked-light |
| premium_locked | Lock icon, gold | semibold, text-primary | Teaser 60 chars + Premium pill | 3px premium-gold | bg-card |
| loading | Pulsing circle | Pulsing bar 60% | Pulsing bar 80% | none | bg-card |
| error | Exclamation, error | text-primary | "Something went wrong — tap to retry" | none | error-light |

Right-side metadata: time estimate (clock icon + text) and difficulty badge
(Easy=green, Medium=amber, Hard=coral). Chevron at far right.

Hover: `border-hover` + `bg-primary-subtle`. No shadow on hover — keep it flat.

**Visual reference:** `mockup-screens/landednz-screen-roadmap-dashboard.jsx`

---

## Hero progress card

Teal gradient card at the top of the roadmap list:

```tsx
function HeroProgressCard({ name, completed, inProgress, remaining, percentage }) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#145254] rounded-card p-6
                    flex items-center justify-between mb-6">
      <div>
        <p className="text-h3 font-display text-text-inverse mb-1">Hi {name}</p>
        <p className="text-secondary text-text-inverse/75 mb-2.5">
          Your First 90 Days in New Zealand
        </p>
        <p className="text-secondary text-text-inverse/50">
          {completed} completed · {inProgress} in progress · {remaining} remaining
        </p>
      </div>
      <CircularProgress percentage={percentage} size={72} />
    </div>
  );
}
```

Circular progress: 72px SVG, amber (#D4A843) stroke on white/12% track.
Percentage centered inside in text-inverse.

**Visual reference:** `mockup-screens/landednz-screen-roadmap-dashboard.jsx`

---

## Consequence callout

Amber "Why This Matters Now" box — FIRST element in task detail:

```tsx
function ConsequenceCallout({ text }: { text: string }) {
  return (
    <div className="bg-warning-light border-l-[3px] border-warning
                    rounded-r-[10px] px-5 py-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-secondary-hover" />
        <span className="text-secondary font-semibold text-secondary-hover">
          Why this matters now
        </span>
      </div>
      <p className="text-body leading-relaxed text-text-primary">{text}</p>
    </div>
  );
}
```

---

## Step list with connector lines

```tsx
function StepList({ steps }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 relative">
          {i < steps.length - 1 && (
            <div className="absolute left-[13px] top-7 bottom-[-4px]
                          w-px bg-border" />
          )}
          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center
                        justify-center text-caption font-semibold text-primary
                        flex-shrink-0 z-10">
            {i + 1}
          </div>
          <p className="text-body text-text-primary pt-0.5 pb-4">{step.text}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Optimistic update pattern

When a user clicks "Mark as done":

```typescript
async function completeTask(taskId: string) {
  const previousTasks = get().tasks;

  // Optimistic: card immediately shows 'complete'
  set(state => ({
    tasks: state.tasks.map(t =>
      t.taskId === taskId
        ? { ...t, cardState: 'complete', completedAt: new Date().toISOString() }
        : t
    )
  }));

  try {
    await api.roadmap.completeTask(token, taskId);
    const updatedRoadmap = await api.roadmap.get(token);
    set({ tasks: deriveTaskList(updatedRoadmap) });
  } catch (error) {
    set({ tasks: previousTasks });
    toast.error('Something went wrong. Your progress was not saved.');
  }
}
```

After completion, navigate back to list view (content replacement pattern).

---

## Premium gate inline card

Appears within the roadmap list between Phase 2 (free) and Phase 3 (premium) tasks.
NOT a modal, NOT a page redirect, NOT a popup.

Three equal paths — no dark patterns:
1. **Upgrade** → Stripe Checkout
2. **Defer** → "Remind me in 24 hours" → stores deferral, triggers email
3. **Decline** → gate collapses to amber banner via height transition (0.3s)

After decline, persistent banner: "Premium unlocks your full roadmap — $49 for 6 months"
with "Learn more" and dismissible X. Dismissed = not shown for 7 days (localStorage).

**Visual reference:** `mockup-screens/landednz-screen-premium-gate.jsx`

---

## Skeleton loading

```tsx
function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-bg-card rounded-card
                    border border-border">
      <Skeleton variant="circle" size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
      </div>
      <Skeleton variant="text" width="15%" />
    </div>
  );
}
```

Pulse: opacity 0.4 → 0.7 → 0.4, 1.5s cycle.
Reduced motion: static 0.5 opacity.

---

## Error recovery

```tsx
function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-error-light border border-error/30 rounded-card p-6 text-center">
      <AlertCircle className="h-6 w-6 text-error mx-auto mb-2" />
      <p className="text-body text-text-primary mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
    </div>
  );
}
```

Error messages: human-readable, actionable, specific when possible.
