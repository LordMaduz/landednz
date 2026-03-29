interface ScopeScreenProps {
  onStart: () => void
}

export function ScopeScreen({ onStart }: ScopeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 fade-in-up">
      <div className="text-center max-w-onboarding-scope">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary-light border border-primary-subtle flex items-center justify-center mx-auto mb-7">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary"
            />
            <rect
              x="9"
              y="3"
              width="6"
              height="4"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-display text-display text-text-primary mb-3">
          5 quick questions to build
          <br />
          your settlement plan
        </h1>

        {/* Subtext */}
        <p className="text-body leading-relaxed text-text-secondary mb-10">
          Takes about 2 minutes. No account needed.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="bg-primary text-text-inverse border-none px-12 py-4 rounded-button text-body font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 tracking-wide"
        >
          Let's go →
        </button>
      </div>
    </div>
  )
}