interface BetaAccessCardProps {
  onDismiss: () => void
}

const BETA_FEATURES = [
  'Complete Phase 3 roadmap — weeks 3 through 8',
  'AI settlement advisor — ask any NZ question, get sourced answers',
  'Smart reminders — we\'ll alert you before deadlines pass',
]

export function BetaAccessCard({ onDismiss }: BetaAccessCardProps) {
  return (
    <div className="fade-in-up rounded-xl border border-border border-t-3 border-secondary bg-bg-card relative overflow-hidden mb-1.5">
      {/* Subtle secondary gradient overlay */}
      <div className="absolute inset-x-0 top-0 h-20 bg-secondary/5 pointer-events-none" aria-hidden="true" />

      <div className="px-6 py-8 relative">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-button bg-secondary-light flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-secondary"
              />
            </svg>
          </div>
          <span className="text-caption font-semibold text-secondary uppercase tracking-wider">
            Beta Access
          </span>
        </div>

        {/* Heading */}
        <h2 className="font-display text-h3 text-text-primary mb-2 leading-tight">
          You're using LandedNZ Beta!
          <br />
          All premium features unlocked.
        </h2>

        {/* Subtitle */}
        <p className="text-small text-text-secondary mb-6">
          Everything is free while we're in beta. Your access includes:
        </p>

        {/* Features */}
        <div className="flex flex-col gap-4 mb-8">
          {BETA_FEATURES.map((feature) => (
            <div key={feature} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-success-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-success"
                  />
                </svg>
              </div>
              <p className="text-small text-text-primary leading-body">{feature}</p>
            </div>
          ))}
        </div>

        {/* Beta notice */}
        <div className="bg-secondary-light rounded-xl px-4.5 py-4 mb-8 border border-secondary/15">
          <p className="text-small text-text-primary leading-body">
            <strong className="font-semibold text-secondary">Beta users get lifetime discount!</strong>{' '}
            When we launch billing, you'll get 50% off for helping us improve the platform.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={onDismiss}
            className="w-full py-3.75 px-6 rounded-xl bg-secondary text-text-primary text-small font-semibold flex items-center justify-center gap-2 hover:bg-secondary-hover transition-colors duration-200"
          >
            Got it — Continue with full access
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <p className="text-caption text-text-tertiary text-center mt-2 max-w-sm">
            We'll give you 30 days notice before introducing any billing
          </p>
        </div>
      </div>
    </div>
  )
}