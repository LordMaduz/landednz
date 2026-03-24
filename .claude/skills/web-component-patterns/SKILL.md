# Skill: Web Component Patterns
# Domain knowledge for implementing task cards, roadmap components, and UI interaction patterns.
# Preloaded by: senior-software-engineer agent

---

## What this skill covers

Task card 7-state rendering logic, TaskCardState derivation from API data, optimistic
update pattern, skeleton loading, error recovery, consequence callout, and premium gate
inline card pattern. Reference document: 14-ui-ux-design.md (Component States section).

---

## Files in scope

```
apps/web/src/
├── components/roadmap/
│   ├── TaskListCard.tsx            ← Layer 1: list card, all 7 states
│   ├── TaskDetailView.tsx          ← Layer 2: full detail in right panel
│   ├── HeroProgressCard.tsx        ← Dashboard hero with progress circle
│   ├── PhaseSection.tsx            ← Collapsible phase with task list
│   ├── FilterTabs.tsx              ← All Tasks / To Do / In Progress / Done
│   ├── ConsequenceCallout.tsx      ← Amber "Why This Matters Now" block
│   └── PremiumGateCard.tsx         ← Inline premium gate with 3 paths
├── lib/hooks/useRoadmap.ts         ← Data fetching + optimistic updates
├── lib/stores/roadmapStore.ts      ← Zustand: tasks, filter, selected task
└── types/web.ts                    ← TaskCardState, TaskListItem
```

---

## TaskCardState derivation (from API data to visual state)

The API returns `TaskStatus` (NOT_STARTED | IN_PROGRESS | COMPLETE | SKIPPED) and
task metadata. The web app derives `TaskCardState` (7 visual states) client-side:

```typescript
function deriveCardState(
  entry: UserRoadmapEntry,
  task: Task,
  userTier: 'FREE' | 'PREMIUM'
): TaskCardState {
  // Loading and error are UI-only — set by the hook, not derived from API data
  
  if (entry.status === 'COMPLETE') return 'complete';
  if (entry.status === 'IN_PROGRESS') return 'in_progress';
  
  // Premium check BEFORE blocked check — premium_locked takes visual priority
  if (task.taskType === 'PREMIUM' && userTier === 'FREE') return 'premium_locked';
  
  // Blocked: has unmet HARD dependency
  if (entry.isBlocked) return 'blocked';
  
  return 'not_started';
}
```

**Order matters:** premium_locked is checked before blocked because a free-tier user
should see the premium lock icon, not a dependency lock. The user needs to upgrade
first — blocked status is irrelevant until they have access.

Unit tests required for all derivation paths. This function lives in a utility file,
not inside a component.

---

## Task list card — 7 states visual spec

Each state is a row in the roadmap list. Same base structure, different visual treatment.

| State | Status icon | Name style | Second line | Background | Border |
|-------|-------------|-----------|-------------|-----------|--------|
| not_started | Empty circle, `text-tertiary` | `text-primary`, semibold | Consequence line (truncated) | `bg-card` | `border` |
| in_progress | Half-filled, `primary` | `text-primary`, semibold | Consequence line | `bg-card` + 2px left `primary` | `border` |
| complete | Green check, `success` | `text-secondary`, regular | "Completed Mar 15" | `bg-card` opacity 0.7 | `border` |
| blocked | Lock icon, `blocked` | `text-secondary` | "Needs: [task name]" in `text-tertiary` | `blocked-light` | `border` |
| premium_locked | Lock icon, `premium-gold` | `text-primary`, semibold | Teaser (60 chars) + Premium pill | `bg-card` + 2px bottom `premium-gold` | `border` |
| loading | Pulsing circle | Pulsing bar 60% | Pulsing bar 80% | `bg-card` | `border` |
| error | Exclamation, `error` | `text-primary` | "Something went wrong — tap to retry" in `error` | `error-light` | `error` 0.3 opacity |

---

## Consequence callout pattern

The amber "Why This Matters Now" box appears as the first element in task detail (Layer 2):

```tsx
function ConsequenceCallout({ text }: { text: string }) {
  return (
    <div className={cn(
      'bg-secondary-light border-l-[3px] border-secondary',
      'p-6 rounded-card flex gap-3'
    )}>
      <AlertCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
      <p className="text-body text-text-primary">{text}</p>
    </div>
  );
}
```

This is the highest-priority visual element on any task detail. It answers "why should
I care?" before the user reads how to do it.

---

## Optimistic update pattern

When a user clicks "Mark as done":

```typescript
// In useRoadmap hook or roadmapStore
async function completeTask(taskId: string) {
  // 1. Capture previous state (for rollback)
  const previousTasks = get().tasks;
  
  // 2. Optimistic update — card immediately shows 'complete'
  set(state => ({
    tasks: state.tasks.map(t =>
      t.taskId === taskId
        ? { ...t, cardState: 'complete', completedAt: new Date().toISOString() }
        : t
    )
  }));
  
  try {
    // 3. Server call
    await api.roadmap.completeTask(token, taskId);
    
    // 4. Re-fetch roadmap to get updated blocked states and topThree
    const updatedRoadmap = await api.roadmap.get(token);
    set({ tasks: deriveTaskList(updatedRoadmap) });
    
  } catch (error) {
    // 5. Rollback on failure
    set({ tasks: previousTasks });
    
    // 6. Show error toast
    toast.error('Something went wrong. Your progress was not saved.');
  }
}
```

Key rules:
- Always capture previous state before optimistic update
- Always re-fetch full roadmap after server success (blocked tasks may have changed)
- Always rollback + show toast on failure
- Never leave the UI in an inconsistent state

---

## Premium gate inline card pattern

The premium gate appears as a card within the roadmap task list — NOT a modal, NOT a
page redirect, NOT a full-screen block:

```
┌──────────────────────────────────────────────────┐
│  [premium_locked task cards — teaser visible]     │
├──────────────────────────────────────────────────┤
│  "Your first two weeks are covered.               │
│   Ready to keep going?"                           │
│                                                   │
│  ✓ Complete Phase 3 roadmap                       │
│  ✓ AI settlement advisor                          │
│  ✓ Smart reminders                                │
│                                                   │
│  "One week of IRD emergency tax = ~$240.          │
│   Six months of LandedNZ = $49."                  │
│                                                   │
│  [ Continue with Premium — $49/6mo ]  ← primary   │
│  [ Remind me in 24 hours ]            ← secondary │
│    Stay on the free plan              ← text link  │
└──────────────────────────────────────────────────┘
```

Three paths are equally accessible — no dark patterns:
- **Upgrade:** links to Stripe Checkout (redirect mode)
- **Defer:** stores deferral, triggers email in 24 hours with specific task + consequence
- **Decline:** gate card collapses to minimal banner via height transition (0.3s)

After decline, persistent banner at top of Phase 3 section:
"Premium unlocks your full roadmap — $49 for 6 months [Learn more]"
Banner is dismissible (X button). Once dismissed, does not reappear for 7 days
(stored in localStorage — this is an acceptable non-critical UI preference per CW06).

---

## Skeleton loading pattern

Every data-dependent component has a skeleton state:

```tsx
function TaskListCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 bg-bg-card rounded-card border border-border">
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

Skeleton pulse: opacity 0.4 → 0.7 → 0.4 on a 1.5s cycle.
When `prefers-reduced-motion: reduce`: static at 0.5 opacity, no animation (CW03).

---

## Error recovery pattern

Every component that fetches data has an error state:

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

Error messages are always:
- Human-readable (never raw error codes or stack traces)
- Actionable ("Try again" button, not just "Error occurred")
- Specific when possible ("We couldn't load your roadmap" not "Something went wrong")
