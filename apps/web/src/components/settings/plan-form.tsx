"use client"

import { useId, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardHead } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { updateOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { DATE_QUESTION, QUESTIONS, type Answers } from "@/lib/answers"
import { nzCalendarDate } from "@/lib/nz-date"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Settings labels for the onboarding questions (the board's short forms)
const LABELS = { visaType: "Visa", city: "City", familySituation: "Who's moving with you", occupation: "Work" } as const
const KEYS = [...QUESTIONS.map(q => q.key), DATE_QUESTION.key] as (keyof Answers)[]
const label = "text-small font-medium"

export function PlanForm({ profile }: { profile: GetProfileResponse }) {
  const [saved, setSaved] = useState<Answers>({
    visaType: profile.visaType,
    city: profile.city,
    familySituation: profile.familySituation,
    occupation: profile.occupation,
    arrivalDate: profile.arrivalDate,
  })
  const [answers, setAnswers] = useState<Answers>(saved)
  const [error, setError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const titleId = useId()
  const dateErrorId = useId()

  // Dirty is "different from the saved values", so changing a value back clears it
  const dirty = KEYS.some(k => answers[k] !== saved[k])

  async function persist(next: Answers): Promise<boolean> {
    setError(null)
    setSaving(true)
    try {
      const { data } = await createClient().auth.getSession()
      const result = await updateOnboardingProfile(next, data.session?.access_token ?? "")
      if (result.success) return true
      setError(result.message ?? "Couldn't save your changes. Try again.")
    } catch {
      setError("Couldn't save your changes. Check your connection, then try again.")
    } finally {
      setSaving(false)
    }
    return false
  }

  async function undo(previous: Answers) {
    setAnswers(previous)
    if (await persist(previous)) setSaved(previous)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving || !dirty) return
    setDateError(null)
    if (!answers.arrivalDate) return setDateError("Enter the day you land.")
    // An already-passed saved date stays valid; only a newly picked past date is refused
    if (answers.arrivalDate !== saved.arrivalDate && answers.arrivalDate < nzCalendarDate(new Date())) {
      return setDateError("Pick a date from today onwards.")
    }
    const previous = saved
    if (await persist(answers)) {
      setSaved(answers)
      toast.success("Plan saved. Your roadmap was rebuilt.", { action: { label: "Undo", onClick: () => undo(previous) } })
    }
  }

  return (
    <Card aria-labelledby={titleId} className="row-span-2 gap-5 max-split:row-auto">
      <div className="flex flex-col gap-1">
        <CardHead title="Your plan" titleId={titleId} />
        <p className="max-w-lede text-small text-muted">
          Your roadmap is built from these answers. Change one and it&apos;s rebuilt; tasks you&apos;ve done stay done.
        </p>
      </div>
      <form onSubmit={save} className="flex flex-1 flex-col gap-5" noValidate>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-narrow:grid-cols-1">
          {QUESTIONS.map(q => (
            <div key={q.key} className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`plan-${q.key}`} className={label}>{LABELS[q.key]}</label>
              <Select
                id={`plan-${q.key}`}
                name={q.key}
                value={answers[q.key]}
                onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
              >
                {q.options.map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </Select>
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor="plan-arrival" className={label}>Arrival date</label>
            <Field
              id="plan-arrival"
              name={DATE_QUESTION.key}
              type="date"
              className={cn(dateError && "border-danger shadow-field-error")}
              value={answers.arrivalDate}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? dateErrorId : undefined}
              onChange={e => {
                setDateError(null)
                setAnswers(a => ({ ...a, arrivalDate: e.target.value }))
              }}
            />
            {dateError && <p id={dateErrorId} className="text-small text-danger">{dateError}</p>}
          </div>
        </div>
        {error && <p role="alert" className="text-ink">{error}</p>}
        <div className="-mx-5 mt-auto -mb-1 flex items-center justify-end gap-3 border-t border-hairline px-5 pt-4 max-narrow:-mx-4 max-narrow:px-4">
          {!dirty && <span className="text-small text-muted">No unsaved changes</span>}
          <Button
            type="submit"
            disabled={!dirty}
            aria-busy={saving}
            className={cn("min-w-36", saving && "bg-ink-hover")}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
