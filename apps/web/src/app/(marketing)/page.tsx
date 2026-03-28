import { LandingNav } from '@/components/marketing/LandingNav'
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblemStatement } from '@/components/marketing/LandingProblemStatement'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingSocialProof } from '@/components/marketing/LandingSocialProof'
import { LandingPricing } from '@/components/marketing/LandingPricing'
import { LandingFinalCTA } from '@/components/marketing/LandingFinalCTA'
import { LandingFooter } from '@/components/marketing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="bg-bg min-h-screen">
      <LandingNav />
      <LandingHero />
      <LandingProblemStatement />
      <LandingHowItWorks />
      <LandingSocialProof />
      <LandingPricing />
      <LandingFinalCTA />
      <LandingFooter />
    </div>
  )
}