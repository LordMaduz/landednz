export function LandingSocialProof() {
  return (
    <section className="py-16 px-6 bg-bg">
      <div className="max-w-[720px] mx-auto text-center">
        <div className="bg-bg-card rounded-card p-8 border border-border relative">
          {/* Quote mark */}
          <div className="font-display text-h1 text-primary-light leading-none mb-[-16px] select-none">
            "
          </div>

          <p className="text-body text-text-primary italic mb-4 leading-relaxed">
            Built by a migrant, for migrants. Every feature is built from lived experience — settling
            in Auckland in 2026, navigating the same bureaucracy, making the same mistakes so you
            don&apos;t have to.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-secondary">
              R
            </div>
            <div className="text-left">
              <div className="text-small text-text-primary font-semibold">
                Ruchira
              </div>
              <div className="text-caption text-text-tertiary normal-case">
                Founder, LandedNZ
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}