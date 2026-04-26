'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { VisaType, City, FamilySituation } from '@landednz/types'
import type { OnboardingState } from '@/types/web'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { createClient } from '@/lib/supabase/client'
import { submitOnboardingProfile } from '@/lib/api'
import { toast } from 'sonner'

// Maps human-readable arrival options to approximate ISO dates for the API
function arrivalToISODate(arrival: string): string {
  const today = new Date()
  const d = (days: number) =>
    new Date(today.getTime() + days * 86_400_000).toISOString().split('T')[0]
  if (arrival === "I haven't arrived yet") return d(30)
  if (arrival === 'I arrived in the last 2 weeks') return d(-7)
  if (arrival === 'I arrived 2–8 weeks ago') return d(-35)
  return d(-90) // "More than 2 months ago" + fallback
}

interface RoadmapRevealProps {
  answers: OnboardingState['answers']
}

function getVisaLabel(visaType?: VisaType): string {
  switch (visaType) {
    case 'AEWV': return 'Accredited Employer Work Visa'
    case 'PARTNER_OF_STUDENT': return 'Partner visa'
    case 'GREEN_LIST_WORK': return 'Green List Work Visa'
    case 'GREEN_LIST_RESIDENCE': return 'Green List Residence'
    default: return 'your visa type'
  }
}

function getCityLabel(city?: City): string {
  switch (city) {
    case 'AUCKLAND': return 'Auckland'
    case 'WELLINGTON': return 'Wellington'
    case 'CHRISTCHURCH': return 'Christchurch'
    default: return 'your city'
  }
}

function getFamilyLabel(familySituation?: FamilySituation): string {
  switch (familySituation) {
    case 'SOLO': return 'Solo plan'
    case 'COUPLE_DUAL_WORK': return 'Dual visa couple adjustments'
    case 'COUPLE_CONSTRAINED': return 'Partner visa couple adjustments'
    case 'FAMILY_WITH_CHILDREN': return 'Family plan adjustments'
    default: return 'Your situation'
  }
}

export function RoadmapReveal({ answers }: RoadmapRevealProps) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const { revealComplete, setRevealComplete } = useOnboardingStore()

  const visaLabel = getVisaLabel(answers.visaType)
  const cityLabel = getCityLabel(answers.city)
  const familyLabel = getFamilyLabel(answers.familySituation)

  const messages = [
    `Checking requirements for ${visaLabel}...`,
    `Sequencing tasks for ${cityLabel}...`,
    `${familyLabel} applied...`,
    'Building your personalised plan...',
  ]

  const [messageIndex, setMessageIndex] = useState(0)
  const [showFinal, setShowFinal] = useState(revealComplete || reducedMotion)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSeeRoadmap = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setSubmitting(false)
        router.push('/auth/signin')
        return
      }

      const result = await submitOnboardingProfile(
        {
          visaType: answers.visaType!,
          city: answers.city!,
          familySituation: answers.familySituation!,
          occupation: answers.occupation!,
          arrivalDate: arrivalToISODate(answers.arrivalDate ?? ''),
        },
        session.access_token,
      )

      if (result.success) {
        router.push('/roadmap')
      } else if (result.isExisting) {
        // Show message for existing profile
        setSubmitError(result.message || 'Profile already exists')
        toast.warning('You already have a settlement plan. Redirecting to your roadmap...', {
          duration: 3000
        })
        // Still redirect after delay
        setTimeout(() => router.push('/roadmap'), 3000)
      }
    } catch {
      setSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    // Already complete or reduced motion — show success instantly
    if (revealComplete || reducedMotion) {
      setShowFinal(true)
      return
    }

    const timers: NodeJS.Timeout[] = []

    messages.forEach((_, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setMessageIndex(i), i * 600))
      }
    })

    timers.push(
      setTimeout(() => {
        setShowFinal(true)
        setRevealComplete()
      }, messages.length * 600 + 400)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="text-center max-w-onboarding-scope">
        {!showFinal ? (
          <>
            {/* Pulsing dots */}
            <div className="flex gap-2 justify-center mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-primary animate-[pulseGlow_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {/* Progressive messages */}
            <div className="min-h-20">
              {messages.slice(0, messageIndex + 1).map((msg, i) => (
                <p
                  key={i}
                  className={`text-body mb-2 animate-[revealTextIn_0.35s_ease-out] transition-colors duration-300 ${
                    i === messageIndex ? 'text-text-secondary' : 'text-text-tertiary'
                  }`}
                >
                  {msg}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-[scaleIn_0.5s_ease-out]">
            {/* Success circle */}
            <div className="w-[72px] h-[72px] rounded-full bg-success-light border-2 border-success flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-label="Plan ready">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="24"
                  strokeDashoffset="0"
                  className="text-success animate-[checkDraw_0.5s_ease-out_0.1s_both]"
                  style={{ strokeDashoffset: reducedMotion ? 0 : undefined }}
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="font-display text-h1 text-text-primary mb-2">
              Your plan is ready
            </h2>

            {/* Personalised summary */}
            <p className="text-body text-text-secondary mb-8">
              {cityLabel !== 'your city' ? cityLabel : 'Your city'}{' · '}
              {visaLabel !== 'your visa type' ? visaLabel : 'Your visa'}{' · '}
              {answers.familySituation === 'SOLO' ? 'Solo' : 'Couple / Family'}
            </p>

            {/* CTA */}
            <button
              onClick={handleSeeRoadmap}
              disabled={submitting}
              className="bg-primary text-text-inverse px-12 py-4 rounded-button text-body font-semibold transition-all duration-200 hover:bg-primary-hover hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                    <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Building your roadmap...
                </span>
              ) : (
                'See my roadmap →'
              )}
            </button>
            {submitError && (
              <p className="text-caption text-error mt-3">{submitError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
