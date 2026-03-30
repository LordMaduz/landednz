import { cn } from '@/lib/utils/cn'

interface OnboardingProgressBarProps {
  current: number
  total: number
}

export function OnboardingProgressBar({ current, total }: OnboardingProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border px-6 py-4 pb-3">
      <div className="max-w-onboarding mx-auto">
        {/* Logo + step counter */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-primary"
                />
              </svg>
            </div>
            <span className="font-display text-h3 text-text-primary">
              LandedNZ
            </span>
          </div>
          <span className="text-caption font-medium text-text-tertiary">
            {current + 1} of {total}
          </span>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1 rounded-sm transition-all duration-300',
                i <= current ? 'bg-primary' : 'bg-border',
                i < current ? 'opacity-50' : 'opacity-100'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}