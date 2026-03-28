export function LandingHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Answer 5 questions',
      description: 'Your visa, city, family, job, arrival date.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7h8M8 11h8M8 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Get your personalised plan',
      description: 'A sequenced roadmap built for your exact situation.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Complete tasks with confidence',
      description: 'Step-by-step guides with official source links.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 px-6 bg-bg-card">
      <div className="max-w-landing mx-auto">
        <p className="text-caption text-primary text-center mb-3">
          HOW IT WORKS
        </p>
        <h2 className="font-display text-h2 text-text-primary text-center mb-14">
          From questions to action in 2 minutes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center px-2">
              {/* Icon circle */}
              <div className="w-[72px] h-[72px] rounded-full bg-primary-subtle border border-primary-light flex items-center justify-center mx-auto mb-5">
                <div className="text-primary">{step.icon}</div>
              </div>

              {/* Step number */}
              <span className="text-caption text-text-tertiary block mb-2">
                Step {step.num}
              </span>

              <h3 className="text-h3 text-text-primary mb-2">
                {step.title}
              </h3>

              <p className="text-body text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}