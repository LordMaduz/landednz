import { cn } from '@/lib/utils/cn'

interface FirstUseHintProps {
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  onDismiss: () => void
  className?: string
}

// Arrow points TOWARD the anchor — opposite of where the hint bubble sits
const arrowClasses: Record<NonNullable<FirstUseHintProps['position']>, string> = {
  bottom: 'absolute -top-1.5 left-6 w-3 h-3 bg-text-primary rotate-45',
  top:    'absolute -bottom-1.5 left-6 w-3 h-3 bg-text-primary rotate-45',
  right:  'absolute -left-1.5 top-4 w-3 h-3 bg-text-primary rotate-45',
  left:   'absolute -right-1.5 top-4 w-3 h-3 bg-text-primary rotate-45',
}

export function FirstUseHint({
  message,
  position = 'bottom',
  onDismiss,
  className,
}: FirstUseHintProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative bg-text-primary text-text-inverse rounded-card shadow-dropdown p-4 max-w-[260px]',
        'animate-[fadeIn_0.2s_ease-out] motion-reduce:animate-none',
        className,
      )}
    >
      <div className={arrowClasses[position]} aria-hidden="true" />
      <p className="text-small leading-snug mb-3">{message}</p>
      <button
        onClick={onDismiss}
        className="text-small font-semibold text-secondary hover:text-text-inverse/75 transition-colors duration-150"
      >
        Got it
      </button>
    </div>
  )
}
