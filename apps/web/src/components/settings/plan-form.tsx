"use client"

import { useId, useRef, useState, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { OptionRow } from "@/components/ui/option-row"
import { updateOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { answerLabel, QUESTIONS, type Answers } from "@/lib/answers"
import { nzCalendarDate, weekdayDay } from "@/lib/nz-date"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Key = keyof Answers
// label: the answers list; ask: the editor's h2; noun: "Your roadmap is rebuilt for the new {noun}."
const COPY: Record<Key, { label: string; ask: string; noun: string }> = {
  visaType: { label: "Visa", ask: "What visa are you on?", noun: "visa" },
  city: { label: "City", ask: "Where do you live?", noun: "city" },
  familySituation: { label: "Who's moving", ask: "Who's moving with you?", noun: "household" },
  occupation: { label: "Work", ask: "What work do you do?", noun: "work" },
  arrivalDate: { label: "Arrival date", ask: "When do you land?", noun: "arrival date" },
}
const KEYS = Object.keys(COPY) as Key[]

// The navy answers card; the account block joins it on desktop (children), stacks apart on phones
export function AnswersCard({ children, joined }: { children: ReactNode; joined?: boolean }) {
  return (
    <Card className={cn("flex-1 gap-0 border-ink bg-ink p-8 text-white max-narrow:p-4 max-narrow:pb-1", joined && "rounded-b-none max-narrow:rounded-b-surface")}>
      <h1 className="text-title">Settings</h1>
      <p className="mt-1 text-rail-text max-narrow:text-small">
        Your answers build your roadmap.<span className="max-narrow:hidden"> Change one and it&apos;s rebuilt; done tasks stay done.</span>
      </p>
      {children}
    </Card>
  )
}

const display = (key: Key, v: string) => (key === "arrivalDate" ? `${weekdayDay(v)} ${v.slice(0, 4)}` : answerLabel(key, v))
const isPhone = () => typeof window.matchMedia === "function" && window.matchMedia("(max-width: 560px)").matches

export function PlanForm({ profile, account }: { profile: GetProfileResponse; account: ReactNode }) {
  const router = useRouter()
  const param = useSearchParams().get("edit")
  const editing: Key = KEYS.find(k => k === param) ?? "visaType"
  const [saved, setSaved] = useState<Answers>({
    visaType: profile.visaType,
    city: profile.city,
    familySituation: profile.familySituation,
    occupation: profile.occupation,
    arrivalDate: profile.arrivalDate,
  })
  const [draft, setDraft] = useState<string>(saved[editing])
  const [session, setSession] = useState(0) // new Calendar mount per edit session, so it reopens on the right month
  const [error, setError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [today] = useState(() => nzCalendarDate(new Date()))
  const titleId = useId()
  const undoToast = useRef<string | number | undefined>(undefined)

  // Another answer picked (or the saved one changed): start from its saved value
  const marker = `${param}:${editing}:${saved[editing]}` // param too: leaving the editor with Back drops the draft
  const [seen, setSeen] = useState(marker)
  if (seen !== marker) {
    setSeen(marker)
    setDraft(saved[editing])
    setError(null)
    setDateError(null)
    setSession(n => n + 1)
  }

  const dirty = draft !== saved[editing]
  const copy = COPY[editing]
  const editQuestion = editing === "arrivalDate" ? null : QUESTIONS.find(q => q.key === editing)!
  // The phone editor is its own page (?edit=); desktop keeps the list beside it
  const leave = () => isPhone() && router.replace("/settings")

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
    if (saving) return
    if (await persist(previous)) setSaved(previous)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving || !dirty) return
    setDateError(null)
    // An already-passed saved date stays valid; only a newly picked past date is refused
    if (editing === "arrivalDate" && draft < nzCalendarDate(new Date())) return setDateError("Pick a date from today onwards.")
    const previous = saved
    const next = { ...saved, [editing]: draft } as Answers
    toast.dismiss(undoToast.current) // an older Undo would overwrite this newer save
    if (await persist(next)) {
      setSaved(next)
      undoToast.current = toast.success("Plan saved. Your roadmap was rebuilt.", { action: { label: "Undo", onClick: () => undo(previous) } })
      leave()
    }
  }

  function cancel() {
    setDraft(saved[editing])
    setError(null)
    setDateError(null)
    setSession(n => n + 1)
    leave()
  }

  return (
    <>
      <div className={cn("flex flex-col max-narrow:gap-2.5", param && "max-narrow:hidden")}>
        <AnswersCard joined>
          <ol aria-label="Your answers" className="m-0 mt-5 list-none p-0 max-narrow:mt-2.5">
            {KEYS.map(k => (
              <li key={k} className="flex min-h-14 items-center gap-3 border-t border-white/15 py-3 max-narrow:py-1">
                <span className="flex flex-1 flex-col leading-snug">
                  <span className={cn("text-small font-medium", k !== editing ? "text-rail-label" : param ? "text-toast-action" : "text-toast-action max-narrow:text-rail-label")}>
                    {COPY[k].label}{k === editing && <span className="max-narrow:hidden"> · changing</span>}
                  </span>
                  <span>{display(k, saved[k])}</span>
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/settings?edit=${k}`)}
                  className={cn("flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-small font-medium text-toast-action hover:text-white", k === editing && "narrow:hidden")}
                >
                  Change{" "}<span className="sr-only">{COPY[k].label}</span>
                </button>
              </li>
            ))}
          </ol>
        </AnswersCard>
        {account}
      </div>

      <Card aria-labelledby={titleId} className={cn("gap-5 p-10 px-14 max-split:px-8 max-narrow:p-4", !param && "max-narrow:hidden")}>
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-small text-muted">{copy.label}</span>
            <h2 id={titleId} className="text-section">{copy.ask}</h2>
            <p className="m-0 text-muted">Your roadmap is rebuilt for the new {copy.noun}. Tasks you&apos;ve done stay done.</p>
          </div>
          {editQuestion ? (
            <div role="radiogroup" aria-labelledby={titleId} className="flex max-w-lede flex-col gap-2.5">
              {editQuestion.options.map(([value, label]) => (
                <OptionRow
                  key={`${editing}-${value}`}
                  name={editing}
                  value={value}
                  label={label}
                  checked={draft === value}
                  className="min-h-15"
                  onChange={() => setDraft(value)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Calendar key={session} value={draft} onChange={v => { setDateError(null); setDraft(v) }} today={today} labelledBy={titleId} />
              {dateError && <p role="alert" className="text-small text-danger">{dateError}</p>}
            </div>
          )}
          {error && <p role="alert" className="text-ink">{error}</p>}
          <div className="flex gap-3 max-narrow:[&>*]:flex-1">
            <Button type="button" variant="quiet" onClick={cancel}>Cancel</Button>
            <Button type="submit" disabled={!dirty} aria-busy={saving} className={cn(saving && "bg-ink-hover")}>
              {saving ? "Saving…" : "Save and rebuild"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}

