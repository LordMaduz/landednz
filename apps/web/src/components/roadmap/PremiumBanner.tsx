interface PremiumBannerProps {
  onUpgrade: () => void
  onDismiss: () => void
}

export function PremiumBanner({ onUpgrade, onDismiss }: PremiumBannerProps) {
  return (
    <div className="fade-in flex items-center justify-between px-4 py-2.5 rounded-lg mb-2.5 bg-secondary-light border border-secondary-light">
      <div className="flex items-center gap-2">
        {/* Star icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="rgba(212, 168, 67, 0.2)"
            strokeLinejoin="round"
            className="text-premium-gold"
          />
        </svg>
        <span className="text-caption text-text-primary">
          Premium unlocks your full roadmap — $49 for 6 months
        </span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        <button
          onClick={onUpgrade}
          className="text-caption font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
        >
          Learn more
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss premium banner"
          className="text-text-tertiary hover:text-text-primary transition-colors duration-150 p-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
