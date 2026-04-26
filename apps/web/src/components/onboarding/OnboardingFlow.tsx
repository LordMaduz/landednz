'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { VisaType, City, FamilySituation, Occupation } from '@landednz/types'
import type { OnboardingState } from '@/types/web'
import {
  Briefcase, Users, FileText, Home, Compass, Building, Building2,
  Mountain, MapPin, User, Heart, Monitor, Stethoscope, GraduationCap,
  Calculator, Wrench, Search, Plane, Calendar, Clock, CalendarCheck
} from 'lucide-react'
import { ScopeScreen } from './ScopeScreen'
import { OnboardingProgressBar } from './OnboardingProgressBar'
import { QuestionView } from './QuestionView'
import { RoadmapReveal } from './RoadmapReveal'

type OnboardingPhase = 'scope' | 'questions' | 'reveal'
type AnimationState = 'entering' | 'stable' | 'exiting'

const questions = [
  {
    id: 'visa' as const,
    question: 'What brings you to New Zealand?',
    subtitle: 'This determines which tasks and deadlines apply to you.',
    options: [
      {
        value: 'AEWV' as VisaType,
        label: 'Accredited Employer Work Visa',
        desc: 'Sponsored by a NZ employer',
        icon: Briefcase,
      },
      {
        value: 'PARTNER_OF_STUDENT' as VisaType,
        label: 'Partner of a Student or Worker',
        desc: 'Your partner holds the primary visa',
        icon: Users,
      },
      {
        value: 'GREEN_LIST_WORK' as VisaType,
        label: 'Green List Work Visa',
        desc: 'Skilled role on the Green List',
        icon: FileText,
      },
      {
        value: 'GREEN_LIST_RESIDENCE' as VisaType,
        label: 'Green List - Straight to Residence',
        desc: 'Qualifying for residence on arrival',
        icon: Home,
      },
      {
        value: 'OTHER' as VisaType,
        label: 'Other or not sure yet',
        desc: "We'll give you a general plan",
        icon: Compass,
      },
    ],
  },
  {
    id: 'city' as const,
    question: 'Which city are you arriving in?',
    subtitle: 'Local details like transport, housing areas, and services vary by city.',
    options: [
      {
        value: 'AUCKLAND' as City,
        label: 'Auckland',
        desc: 'Largest city, most newcomers land here',
        icon: Building,
      },
      {
        value: 'WELLINGTON' as City,
        label: 'Wellington',
        desc: 'Capital city, compact and walkable',
        icon: Building2,
      },
      {
        value: 'CHRISTCHURCH' as City,
        label: 'Christchurch',
        desc: "South Island's largest city",
        icon: Mountain,
      },
      {
        value: 'OTHER' as City,
        label: 'Somewhere else',
        desc: "We'll cover the national essentials",
        icon: MapPin,
      },
    ],
  },
  {
    id: 'family' as const,
    question: 'Who are you settling in with?',
    subtitle: "This affects task order and what documents you'll need.",
    options: [
      {
        value: 'SOLO' as FamilySituation,
        label: 'Arriving alone',
        desc: 'Solo settlement plan',
        icon: User,
      },
      {
        value: 'COUPLE_DUAL_WORK' as FamilySituation,
        label: 'Couple - Both with work visas',
        desc: 'You each have independent visas',
        icon: Users,
      },
      {
        value: 'COUPLE_CONSTRAINED' as FamilySituation,
        label: 'Couple - One on a partner visa',
        desc: 'One primary visa holder, one dependent',
        icon: Heart,
      },
      {
        value: 'FAMILY_WITH_CHILDREN' as FamilySituation,
        label: 'Family with children',
        desc: 'Includes school enrolment and childcare tasks',
        icon: Home,
      },
    ],
  },
  {
    id: 'occupation' as const,
    question: "What's your professional background?",
    subtitle: "We'll tailor job-related guidance to your field.",
    options: [
      {
        value: 'TECHNOLOGY' as Occupation,
        label: 'Technology / Engineering',
        desc: '',
        icon: Monitor,
      },
      {
        value: 'HEALTHCARE' as Occupation,
        label: 'Healthcare',
        desc: '',
        icon: Stethoscope,
      },
      {
        value: 'EDUCATION' as Occupation,
        label: 'Education',
        desc: '',
        icon: GraduationCap,
      },
      {
        value: 'FINANCE' as Occupation,
        label: 'Finance / Accounting',
        desc: '',
        icon: Calculator,
      },
      {
        value: 'TRADES' as Occupation,
        label: 'Trades',
        desc: '',
        icon: Wrench,
      },
      {
        value: 'OTHER_PROFESSIONAL' as Occupation,
        label: 'Other professional',
        desc: '',
        icon: Briefcase,
      },
      {
        value: 'SEEKING_WORK' as Occupation,
        label: 'Still looking for work',
        desc: '',
        icon: Search,
      },
    ],
  },
  {
    id: 'arrival' as const,
    question: 'When are you arriving or when did you arrive?',
    subtitle: 'This sets your timeline and deadline urgency.',
    options: [
      {
        value: "I haven't arrived yet",
        label: "I haven't arrived yet",
        desc: "We'll start with pre-arrival tasks",
        icon: Plane,
      },
      {
        value: 'I arrived in the last 2 weeks',
        label: 'I arrived in the last 2 weeks',
        desc: "Right on time — let's catch up",
        icon: Calendar,
      },
      {
        value: 'I arrived 2–8 weeks ago',
        label: 'I arrived 2–8 weeks ago',
        desc: 'Some deadlines may be close',
        icon: Clock,
      },
      {
        value: 'More than 2 months ago',
        label: 'More than 2 months ago',
        desc: "We'll check what's still needed",
        icon: CalendarCheck,
      },
    ],
  },
]

export function OnboardingFlow() {
  const router = useRouter()
  const [phase, setPhase] = useState<OnboardingPhase>('scope')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<OnboardingState['answers']>({})
  const [animState, setAnimState] = useState<AnimationState>('entering')
  const [checkingProfile, setCheckingProfile] = useState(true)
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Check if user already has a profile on mount
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setCheckingProfile(false)
          return
        }

        // Try to get roadmap - if it exists, user has completed onboarding
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roadmap`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })

        if (response.ok) {
          // Profile exists - redirect with message
          toast.info('You already have a settlement plan. Redirecting to your roadmap...', {
            duration: 3000
          })
          setTimeout(() => router.push('/roadmap'), 2000)
          return
        }
      } catch {
        // No profile or error - continue with onboarding
      }

      setCheckingProfile(false)
    }

    checkExistingProfile()
  }, [router])

  const handleStart = () => {
    setPhase('questions')
    setCurrentQ(0)
    setAnimState('entering')
  }

  const handleSelect = (value: string) => {
    const question = questions[currentQ]

    // Store answer with correct typing
    setAnswers((prev) => {
      const newAnswers = { ...prev }

      if (question.id === 'visa') {
        newAnswers.visaType = value as VisaType
      } else if (question.id === 'city') {
        newAnswers.city = value as City
      } else if (question.id === 'family') {
        newAnswers.familySituation = value as FamilySituation
      } else if (question.id === 'occupation') {
        newAnswers.occupation = value as Occupation
      } else if (question.id === 'arrival') {
        newAnswers.arrivalDate = value
      }

      return newAnswers
    })

    // Auto-advance after 400ms
    transitionTimeout.current = setTimeout(() => {
      if (currentQ < questions.length - 1) {
        // Next question
        setAnimState('exiting')
        setTimeout(() => {
          setCurrentQ((prev) => prev + 1)
          setAnimState('entering')
        }, 350)
      } else {
        // Last question — go to reveal
        setAnimState('exiting')
        setTimeout(() => {
          setPhase('reveal')
        }, 350)
      }
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current)
      }
    }
  }, [])

  const getSelectedValue = () => {
    const question = questions[currentQ]
    if (question.id === 'visa') return answers.visaType
    if (question.id === 'city') return answers.city
    if (question.id === 'family') return answers.familySituation
    if (question.id === 'occupation') return answers.occupation
    if (question.id === 'arrival') return answers.arrivalDate
    return undefined
  }

  // Show loading while checking for existing profile
  if (checkingProfile) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body text-text-secondary">Checking your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg min-h-screen">
      {phase === 'scope' && <ScopeScreen onStart={handleStart} />}

      {phase === 'questions' && (
        <>
          <OnboardingProgressBar current={currentQ} total={questions.length} />
          <QuestionView
            key={currentQ}
            question={questions[currentQ].question}
            subtitle={questions[currentQ].subtitle}
            options={questions[currentQ].options}
            selectedValue={getSelectedValue()}
            onSelect={handleSelect}
            animState={animState}
          />
        </>
      )}

      {phase === 'reveal' && (
        <RoadmapReveal answers={answers} />
      )}
    </div>
  )
}