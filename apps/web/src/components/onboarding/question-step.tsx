"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { PublicFooter } from "@/components/chrome/public-footer"
import { AnswerRail } from "@/components/onboarding/answer-rail"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { OptionRow } from "@/components/ui/option-row"
import { DATE_QUESTION, QUESTIONS, type Answers } from "@/lib/answers"
import { nzCalendarDate } from "@/lib/nz-date"
import { useOnboardingStore } from "@/lib/stores/onboardingStore"
import { cn } from "@/lib/utils"

const STEPS = [...QUESTIONS, DATE_QUESTION]
const TOTAL = STEPS.length
const stepUrl = (n: number) => `/onboarding?step=${n}`

// One onboarding question per screen; the step lives in ?step=, the answers in the store
export function QuestionStep() {
  const router = useRouter()
  const params = useSearchParams()
  const step = Math.min(Math.max(Number(params.get("step")) || 1, 1), TOTAL)
  const { answers, setAnswer } = useOnboardingStore()
  const [saving, setSaving] = useState(false)
  // Next keeps this screen mounted after it navigates away, so the pending state must end with the navigation
  const [navigating, startNavigation] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [today] = useState(() => nzCalendarDate(new Date()))

  // A reload loses the in-memory answers: go back to the first one still missing
  const firstMissing = STEPS.findIndex(q => !answers[q.key]) + 1
  useEffect(() => {
    if (firstMissing > 0 && firstMissing < step) router.replace(stepUrl(firstMissing))
  }, [firstMissing, step, router])

  const q = STEPS[step - 1]
  const chosen = Boolean(answers[q.key])
  const last = step === TOTAL

  async function next() {
    if (!last) return router.push(stepUrl(step + 1))
    setSaving(true)
    setError(null)
    const res = await fetch("/api/onboarding-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    }).catch(() => null)
    setSaving(false)
    if (res?.ok) return startNavigation(() => router.push("/onboarding/preview"))
    setError("Couldn't build your roadmap. Your answers are still here; check your connection and try again.")
  }

  const back = cn(buttonVariants({ variant: "secondary", size: "lg" }), "max-narrow:hidden")

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 grid-cols-rail max-split:grid-cols-1 max-split:content-start">
        <AnswerRail title="Build my roadmap" intro="Five questions. You see your roadmap before you sign up." answers={answers} current={step} />
        <main className="flex flex-col gap-6 py-10 pr-10 pl-rail-indent max-split:px-4 max-split:py-6 max-narrow:gap-5">
          <div className="flex w-full max-w-question flex-col gap-6 max-narrow:gap-5">
            <span className="text-small font-medium text-fg-muted max-narrow:hidden">Question {step} of {TOTAL}</span>
            <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="w-full pb-6 max-narrow:pb-5">
                <h1 id="question-title" className="text-title">{q.title}</h1>
                <span className="mt-2 block font-normal text-fg-muted max-narrow:mt-2">
                  {last ? "Already here? Pick the day you arrived." : "You can change any answer later in Settings."}
                </span>
              </legend>
              {"options" in q ? (
                q.options.map(([value, label]) => (
                  <OptionRow
                    key={`${q.key}-${value}`}
                    name={q.key}
                    value={value}
                    label={label}
                    checked={answers[q.key] === value}
                    onChange={() => setAnswer(q.key, value as Answers[typeof q.key])}
                  />
                ))
              ) : (
                <Calendar value={answers.arrivalDate ?? null} onChange={v => setAnswer("arrivalDate", v)} today={today} labelledBy="question-title" />
              )}
            </fieldset>
            {error && <p role="alert" className="text-fg">{error}</p>}
            <div className="flex gap-3">
              {step === 1 ? (
                <Link href="/" className={back}>
                  <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
                  Home
                </Link>
              ) : (
                <Button variant="secondary" size="lg" className="max-narrow:hidden" onClick={() => router.push(stepUrl(step - 1))}>
                  <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
                  Back
                </Button>
              )}
              <Button size="lg" className="max-narrow:w-full" disabled={!chosen || saving || navigating} onClick={next}>
                {last ? "See my roadmap" : "Continue"}
              </Button>
            </div>
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  )
}
