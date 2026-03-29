import { cn } from '@/lib/utils/cn'

interface OptionCardProps {
  value: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  isSelected: boolean
  isCompact?: boolean
  onClick: (value: string) => void
  delay?: number
}

export function OptionCard({
  value,
  label,
  description,
  icon: Icon,
  isSelected,
  isCompact = false,
  onClick,
  delay = 0,
}: OptionCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-center gap-3.5 rounded-button border-1.5 bg-bg-card cursor-pointer transition-all duration-200 outline-none',
        'hover:border-border-hover hover:bg-primary-subtle hover:-translate-y-px',
        'focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
        isCompact ? 'p-3.5' : 'p-4',
        isSelected
          ? 'border-primary bg-primary-light hover:bg-primary-light hover:translate-y-0'
          : 'border-border',
        'fade-in-up'
      )}
      style={{ animationDelay: `${delay * 0.05}s` }}
      onClick={() => onClick(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(value)
        }
      }}
    >
      {/* Icon */}
      <Icon
        className={cn(
          'flex-shrink-0 transition-colors duration-200',
          isCompact ? 'w-6 h-6' : 'w-7 h-7',
          isSelected ? 'text-primary' : 'text-text-primary'
        )}
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-body leading-snug text-text-primary',
            isSelected ? 'font-semibold' : 'font-medium'
          )}
        >
          {label}
        </div>
        {description && (
          <div className="text-caption text-text-tertiary leading-snug mt-0.5">
            {description}
          </div>
        )}
      </div>

      {/* Checkmark */}
      {isSelected && (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 animate-[scaleIn_0.2s_ease-out]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}