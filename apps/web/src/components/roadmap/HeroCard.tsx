import type { TaskListItem } from '@/types/web'

interface HeroCardProps {
  tasks: TaskListItem[]
  userName?: string
}

export function HeroCard({ tasks, userName = 'Priya' }: HeroCardProps) {
  const completed = tasks.filter((t) => t.cardState === 'complete').length
  const inProgress = tasks.filter((t) => t.cardState === 'in_progress').length
  const remaining = tasks.length - completed - inProgress
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

  const r = 30
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-card p-6 flex items-center justify-between mb-6">
      <div>
        <p className="font-display text-h3 text-text-inverse mb-1">
          Hi {userName}
        </p>
        <p className="text-small text-text-inverse/75 mb-2">
          Your First 90 Days in New Zealand
        </p>
        <p className="text-caption text-text-inverse/50">
          {completed} completed · {inProgress} in progress · {remaining} remaining
        </p>
      </div>

      <div className="relative w-18 h-18 flex-shrink-0" aria-label={`${pct}% complete`}>
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          {/* Track */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth="5"
          />
          {/* Progress ring */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-secondary progress-ring-circle"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-h3 font-semibold text-text-inverse">{pct}%</span>
        </div>
      </div>
    </div>
  )
}
