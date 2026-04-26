'use client'

import { useRouter } from 'next/navigation'

export function LandingFinalCTA() {
  const router = useRouter()

  const handleBuildPlan = () => {
    router.push('/onboarding')
  }

  return (
    <section className="relative bg-cta-gradient py-20 px-6 text-center overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute top-[-30%] left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-secondary/[0.06] pointer-events-none" />

      <div className="relative z-10">
        <h2 className="font-display text-h1 text-text-inverse mb-3 leading-tight">
          Your settlement plan is 2 minutes away
        </h2>
        <p className="text-body text-text-inverse/70 mb-8">
          5 questions. No account required.
        </p>
        <button
          onClick={handleBuildPlan}
          className="bg-secondary text-text-primary px-12 py-4 rounded-button text-body font-semibold tracking-wide hover:scale-105 active:scale-100 transition-transform"
        >
          Build my plan
        </button>
      </div>
    </section>
  )
}