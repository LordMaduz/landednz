import type { TaskListItem, TaskCardState } from '@/types/web'
import { cn } from '@/lib/utils/cn'

// ── Status icon ─────────────────────────────────────────────────────────────

function StatusIcon({ state, size = 18 }: { state: TaskCardState; size?: number }) {
  const s = size
  const iconSize = Math.round(s * 0.55)

  if (state === 'complete') {
    return (
      <div
        className="rounded-full bg-success flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={Math.round(s * 0.6)} height={Math.round(s * 0.6)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )
  }

  if (state === 'in_progress') {
    return (
      <div
        className="rounded-full border-2 border-primary flex-shrink-0 status-in-progress"
        style={{ width: s, height: s }}
      />
    )
  }

  if (state === 'blocked') {
    return (
      <div
        className="rounded-full bg-blocked-light border-1.5 border-blocked flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" className="text-blocked" strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" className="text-blocked" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (state === 'premium_locked') {
    return (
      <div
        className="rounded-full bg-secondary-light border-1.5 border-premium-gold flex items-center justify-center flex-shrink-0"
        style={{ width: s, height: s }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" className="text-premium-gold" strokeWidth="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" className="text-premium-gold" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // not_started (default)
  return (
    <div
      className="rounded-full border-2 border-border flex-shrink-0"
      style={{ width: s, height: s }}
    />
  )
}

// ── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const styles = {
    Easy: 'bg-success-light text-success',
    Medium: 'bg-warning-light text-warning',
    Hard: 'bg-error-light text-error',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-badge', styles[difficulty])}>
      {difficulty}
    </span>
  )
}

// ── Task Row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: TaskListItem
  priority?: boolean
  onClick?: () => void
}

export function TaskRow({ task, priority = false, onClick }: TaskRowProps) {
  const isComplete = task.cardState === 'complete'
  const isBlocked = task.cardState === 'blocked'
  const isPremium = task.cardState === 'premium_locked'
  const isMuted = isComplete || isBlocked

  const subText = isComplete
    ? `Completed ${task.completedAt}`
    : isBlocked
      ? `Needs: ${task.blockedBy?.taskName}`
      : task.consequenceLine

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={cn(
        'flex items-center gap-3 rounded-button border bg-bg-card mb-1.5',
        'transition-shadow duration-150',
        priority ? 'px-4 py-3.5' : 'px-4 py-2.5',
        // Left accent border
        task.cardState === 'in_progress' && 'border-l-3 border-l-primary border-t-border border-r-border border-b-border',
        isPremium && 'border-l-3 border-l-premium-gold border-t-border border-r-border border-b-border',
        !['in_progress', 'premium_locked'].includes(task.cardState) && 'border-border',
        isComplete && 'opacity-70',
        onClick && 'cursor-pointer hover:shadow-card-hover'
      )}
    >
      <StatusIcon state={task.cardState} size={18} />

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs leading-tight mb-0.5',
          isMuted ? 'font-normal text-text-secondary' : 'font-semibold text-text-primary'
        )}>
          {task.taskName}
        </p>
        <p className={cn(
          'text-xs text-text-tertiary',
          priority ? 'whitespace-normal' : 'truncate'
        )}>
          {subText}
        </p>
      </div>

      {/* Right metadata */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isComplete && !isBlocked && !isPremium && task.estimatedDuration && (
          <span className="text-caption text-text-tertiary flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {task.estimatedDuration}
          </span>
        )}
        {isPremium && (
          <span className="text-caption font-medium bg-secondary-light text-secondary-hover px-2.5 py-0.5 rounded-badge flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Premium
          </span>
        )}
        {!isComplete && !isPremium && task.difficulty && (
          <DifficultyBadge difficulty={task.difficulty} />
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-30" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
