"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { updateOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { DATE_QUESTION, QUESTIONS, type Answers } from "@/lib/answers"
import { createClient } from "@/lib/supabase/client"
import { SettingsSection } from "./settings-section"

// Settings labels for the onboarding questions (the board's short forms)
const LABELS = { visaType: "Visa", city: "City", familySituation: "Who's moving with you", occupation: "Work" } as const

export function PlanForm({ profile }: { profile: GetProfileResponse }) {
  const [answers, setAnswers] = useState<Answers>({
    visaType: profile.visaType,
    city: profile.city,
    familySituation: profile.familySituation,
    occupation: profile.occupation,
    arrivalDate: profile.arrivalDate,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!answers.arrivalDate) return setError("Enter the day you land.")
    setSaving(true)
    try {
      const { data } = await createClient().auth.getSession()
      const result = await updateOnboardingProfile(answers, data.session?.access_token ?? "")
      if (result.success) toast("Changes saved")
      else setError(result.message ?? "Couldn't save your changes. Try again.")
    } catch {
      setError("Couldn't save your changes. Check your connection, then try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection
      title="Your plan"
      lede="Your roadmap is built from these answers. Change one and it's rebuilt; tasks you've done stay done."
    >
      <form onSubmit={save} className="flex flex-col gap-6" noValidate>
        {QUESTIONS.map(q => (
          <div key={q.key} className="flex flex-col gap-2">
            <label htmlFor={`plan-${q.key}`} className="font-medium">{LABELS[q.key]}</label>
            <Select
              id={`plan-${q.key}`}
              name={q.key}
              value={answers[q.key]}
              onChange={e => setAnswers(a => ({ ...a, [q.key]: e.target.value }))}
            >
              {q.options.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <label htmlFor="plan-arrival" className="font-medium">Arrival date</label>
          <Field
            id="plan-arrival"
            name={DATE_QUESTION.key}
            type="date"
            className="max-w-date"
            value={answers.arrivalDate}
            onChange={e => setAnswers(a => ({ ...a, arrivalDate: e.target.value }))}
          />
        </div>
        {error && <p role="alert" className="text-ink">{error}</p>}
        <Button type="submit" disabled={saving} className="self-start">Save changes</Button>
      </form>
    </SettingsSection>
  )
}
