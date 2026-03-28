export function LandingHero() {
  return (
    <section className="relative bg-hero-gradient min-h-screen flex items-center justify-center px-6 pt-20 pb-20 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[15%] right-[-5%] w-[500px] h-[500px] rounded-full border border-secondary/[0.08] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-8%] w-[400px] h-[400px] rounded-full border border-text-inverse/[0.04] pointer-events-none" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 text-center max-w-[800px]">
        {/* Eyebrow */}
        <div className="fade-in-up delay-1 mb-6">
          <span className="text-caption text-secondary bg-secondary/[0.12] px-4 py-1.5 rounded-full inline-block">
            For skilled migrants arriving in New Zealand
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-in-up delay-2 font-display text-hero-heading text-text-inverse mb-5 leading-tight tracking-tight">
          You&apos;ve just arrived in{' '}
          <span className="text-secondary">New Zealand.</span>
          <br />
          We&apos;ll tell you what to do first.
        </h1>

        {/* Sub */}
        <p className="fade-in-up delay-3 text-body text-text-inverse/[0.78] max-w-[560px] mx-auto mb-10 text-[1.125rem]">
          LandedNZ builds a personalised settlement plan based on your visa, your city, and your
          family. In 2 minutes.
        </p>

        {/* CTA */}
        <div className="fade-in-up delay-4 mb-5">
          <button className="bg-secondary text-text-primary px-12 py-4 rounded-button text-[1.0625rem] font-semibold tracking-wide hover:scale-105 active:scale-100 transition-transform">
            Build my plan — free
          </button>
        </div>

        {/* Secondary link */}
        <div className="fade-in-up delay-5 mb-12">
          <button className="text-secondary text-text-inverse/[0.55] underline underline-offset-4 hover:text-text-inverse/75 transition-colors">
            See how it works ↓
          </button>
        </div>

        {/* Trust signal */}
        <p className="fade-in delay-6 text-caption text-text-inverse/[0.4] tracking-wide">
          No account needed · No payment required · Your plan in 2 minutes
        </p>
      </div>
    </section>
  )
}