"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { PublicHeader } from "@/components/chrome/public-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { OptionRow } from "@/components/ui/option-row"
import { DATE_QUESTION, QUESTIONS, type Answers } from "@/lib/answers"
import { useOnboardingStore } from "@/lib/stores/onboardingStore"
import { cn } from "@/lib/utils"

const STEPS = [...QUESTIONS, DATE_QUESTION]
const TOTAL = STEPS.length
const stepUrl = (n: number) => `/onboarding?step=${n}`

// Thin teal line under the header
function StepBar({ step }: { step: number }) {
  return (
    <div role="progressbar" aria-label="Question" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step} className="h-0.5">
      <div className="h-0.5 bg-teal" style={{ width: `${(step / TOTAL) * 100}%` }} />
    </div>
  )
}

// One onboarding question per screen; the step lives in ?step=, the answers in the store
export function QuestionStep() {
  const router = useRouter()
  const params = useSearchParams()
  const step = Math.min(Math.max(Number(params.get("step")) || 1, 1), TOTAL)
  const { answers, setAnswer } = useOnboardingStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    if (res?.ok) return router.push("/onboarding/preview")
    setSaving(false)
    setError("Couldn't build your roadmap. Your answers are still here; check your connection and try again.")
  }

  const back = cn(buttonVariants({ variant: "ghost" }), "-ml-4")

  return (
    <>
      <PublicHeader right={<span className="text-small text-muted">Step {step} of {TOTAL}</span>} />
      <StepBar step={step} />
      <main className="container-page flex max-w-onboarding flex-col gap-8 pt-12 pb-24">
        <div>
          {step === 1 ? (
            <Link href="/" className={back}>
              <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
              Home
            </Link>
          ) : (
            <Button variant="ghost" className="-ml-4" onClick={() => router.push(stepUrl(step - 1))}>
              <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
              Back
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-8">
          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="pb-4">
              <h1 className="text-title">{q.title}</h1>
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
              <>
                <label htmlFor="arrival" className="font-medium">Arrival date</label>
                <Field
                  id="arrival"
                  name="arrival"
                  type="date"
                  aria-describedby="arrival-hint"
                  className="max-w-date"
                  value={answers.arrivalDate ?? ""}
                  onChange={e => setAnswer("arrivalDate", e.target.value)}
                />
                <span id="arrival-hint" className="text-small text-muted">Already here? Enter the day you arrived.</span>
              </>
            )}
          </fieldset>
          {error && <p role="alert" className="text-ink">{error}</p>}
          <Button size="lg" className="self-start" disabled={!chosen || saving} onClick={next}>
            {last ? "See my roadmap" : "Continue"}
          </Button>
        </div>
      </main>
    </>
  )
}
