'use client'

import { useState, useRef, useEffect } from 'react'
import type { VisaType, City, FamilySituation, Occupation } from '@landednz/types'
import type { OnboardingState } from '@/types/web'
import { ScopeScreen } from './ScopeScreen'
import { OnboardingProgressBar } from './OnboardingProgressBar'
import { QuestionView } from './QuestionView'

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
        icon: '💼',
      },
      {
        value: 'PARTNER_OF_STUDENT' as VisaType,
        label: 'Partner of a Student or Worker',
        desc: 'Your partner holds the primary visa',
        icon: '👫',
      },
      {
        value: 'GREEN_LIST_WORK' as VisaType,
        label: 'Green List Work Visa',
        desc: 'Skilled role on the Green List',
        icon: '📋',
      },
      {
        value: 'GREEN_LIST_RESIDENCE' as VisaType,
        label: 'Green List - Straight to Residence',
        desc: 'Qualifying for residence on arrival',
        icon: '🏡',
      },
      {
        value: 'OTHER' as VisaType,
        label: 'Other or not sure yet',
        desc: "We'll give you a general plan",
        icon: '🧭',
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
        icon: '🌊',
      },
      {
        value: 'WELLINGTON' as City,
        label: 'Wellington',
        desc: 'Capital city, compact and walkable',
        icon: '🏛️',
      },
      {
        value: 'CHRISTCHURCH' as City,
        label: 'Christchurch',
        desc: "South Island's largest city",
        icon: '⛰️',
      },
      {
        value: 'OTHER' as City,
        label: 'Somewhere else',
        desc: "We'll cover the national essentials",
        icon: '📍',
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
        icon: '🧑',
      },
      {
        value: 'COUPLE_DUAL_WORK' as FamilySituation,
        label: 'Couple - Both with work visas',
        desc: 'You each have independent visas',
        icon: '👥',
      },
      {
        value: 'COUPLE_CONSTRAINED' as FamilySituation,
        label: 'Couple - One on a partner visa',
        desc: 'One primary visa holder, one dependent',
        icon: '👫',
      },
      {
        value: 'FAMILY_WITH_CHILDREN' as FamilySituation,
        label: 'Family with children',
        desc: 'Includes school enrolment and childcare tasks',
        icon: '👨‍👩‍👧',
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
        icon: '💻',
      },
      {
        value: 'HEALTHCARE' as Occupation,
        label: 'Healthcare',
        desc: '',
        icon: '🏥',
      },
      {
        value: 'EDUCATION' as Occupation,
        label: 'Education',
        desc: '',
        icon: '📚',
      },
      {
        value: 'FINANCE' as Occupation,
        label: 'Finance / Accounting',
        desc: '',
        icon: '📊',
      },
      {
        value: 'TRADES' as Occupation,
        label: 'Trades',
        desc: '',
        icon: '🔧',
      },
      {
        value: 'OTHER_PROFESSIONAL' as Occupation,
        label: 'Other professional',
        desc: '',
        icon: '👔',
      },
      {
        value: 'SEEKING_WORK' as Occupation,
        label: 'Still looking for work',
        desc: '',
        icon: '🔍',
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
        icon: '✈️',
      },
      {
        value: 'I arrived in the last 2 weeks',
        label: 'I arrived in the last 2 weeks',
        desc: "Right on time — let's catch up",
        icon: '📅',
      },
      {
        value: 'I arrived 2–8 weeks ago',
        label: 'I arrived 2–8 weeks ago',
        desc: 'Some deadlines may be close',
        icon: '⏰',
      },
      {
        value: 'More than 2 months ago',
        label: 'More than 2 months ago',
        desc: "We'll check what's still needed",
        icon: '📆',
      },
    ],
  },
]

export function OnboardingFlow() {
  const [phase, setPhase] = useState<OnboardingPhase>('scope')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<OnboardingState['answers']>({})
  const [animState, setAnimState] = useState<AnimationState>('entering')
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null)

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
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-onboarding-scope">
            <div className="text-body text-text-secondary">
              Building your plan...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}