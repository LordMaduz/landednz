interface PremiumGateCardProps {
  onUpgrade: () => void
  onDefer: () => void
  onDecline: () => void
}

const BENEFITS = [
  'Complete Phase 3 roadmap — weeks 3 through 8',
  'AI settlement advisor — ask any NZ question, get sourced answers',
  'Smart reminders — we\'ll alert you before deadlines pass',
]

export function PremiumGateCard({ onUpgrade, onDefer, onDecline }: PremiumGateCardProps) {
  return (
    <div className="fade-in-up rounded-xl border border-border border-t-3 border-premium-gold bg-bg-card relative overflow-hidden mb-1.5">
      {/* Subtle gold gradient overlay */}
      <div className="absolute inset-x-0 top-0 h-20 bg-premium-gradient pointer-events-none" aria-hidden="true" />

      <div className="px-6 py-8 relative">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-button bg-secondary-light flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="rgba(212, 168, 67, 0.15)"
                strokeLinejoin="round"
                className="text-premium-gold"
              />
            </svg>
          </div>
          <span className="text-caption font-semibold text-secondary-hover uppercase tracking-wider">
            Premium
          </span>
        </div>

        {/* Heading */}
        <h2 className="font-display text-h3 text-text-primary mb-2 leading-tight">
          Your first two weeks are covered.
          <br />
          Ready to keep going?
        </h2>

        {/* Subtitle */}
        <p className="text-small text-text-secondary mb-6">
          Your full 8-week settlement plan includes:
        </p>

        {/* Benefits */}
        <div className="flex flex-col gap-4 mb-8">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-start gap-4">
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
              <p className="text-small text-text-primary leading-body">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Anchor pricing */}
        <div className="bg-secondary-light rounded-xl px-4.5 py-4 mb-8 border border-secondary/15">
          <p className="text-small text-text-primary leading-body">
            One week of IRD emergency tax costs ~<strong className="font-semibold">$240</strong>.{' '}
            <span className="text-primary font-semibold">Six months of LandedNZ costs $49.</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 items-center">
          {/* 1. Upgrade */}
          <button
            onClick={onUpgrade}
            className="w-full py-3.75 px-6 rounded-xl bg-primary text-text-inverse text-small font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors duration-200"
          >
            Continue with Premium — $49 for 6 months
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

          {/* 2. Defer */}
          <button
            onClick={onDefer}
            className="w-full py-3.25 px-6 rounded-xl border-1.5 border-border bg-transparent text-primary text-small font-medium hover:bg-primary-subtle hover:border-primary transition-colors duration-150"
          >
            Remind me in 24 hours
          </button>

          {/* 3. Decline */}
          <button
            onClick={onDecline}
            className="px-4 py-2 text-caption text-text-tertiary bg-transparent hover:text-text-primary transition-colors duration-150"
          >
            Stay on the free plan
          </button>
        </div>
      </div>
    </div>
  )
}
