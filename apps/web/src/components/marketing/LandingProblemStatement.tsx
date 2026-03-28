export function LandingProblemStatement() {
  const problems = [
    {
      stat: '45%',
      label: 'emergency tax',
      description: 'Miss your IRD number in week one and every paycheck loses $300–400.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      stat: '$3,000',
      label: 'wrong suburb',
      description: 'Sign a lease before understanding school zones and you\'re moving again.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      stat: '$600/yr',
      label: 'in fees',
      description: 'Send money home through a bank instead of Wise and it costs $300–600 extra per year.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 px-6 bg-bg">
      <div className="max-w-landing mx-auto">
        <p className="text-caption text-primary text-center mb-3">
          The cost of not knowing
        </p>
        <h2 className="font-display text-[1.875rem] text-text-primary text-center mb-12">
          These mistakes happen every week
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="bg-bg-card rounded-card p-7 border border-border relative overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-error to-warning opacity-70" />

              <div className="text-error mb-4">{problem.icon}</div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-[2rem] text-text-primary">
                  {problem.stat}
                </span>
                <span className="text-secondary text-text-secondary">{problem.label}</span>
              </div>

              <p className="text-body text-text-secondary">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-body text-text-primary text-center max-w-[600px] mx-auto text-[1.0625rem] font-medium">
          These mistakes happen because nobody tells you the order.{' '}
          <span className="text-primary font-semibold">LandedNZ tells you the order.</span>
        </p>
      </div>
    </section>
  )
}