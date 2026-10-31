"use client"

import { useId, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Check, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHead } from "@/components/ui/card"
import { OptionRow } from "@/components/ui/option-row"
import { updateOnboardingProfile, type GetProfileResponse } from "@/lib/api"
import { answerLabel, QUESTIONS, type Answers } from "@/lib/answers"
import { nzCalendarDate, weekdayDay } from "@/lib/nz-date"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { MemoryRow, MemorySection } from "./memory-section"
import { ROW, ROW_GO, ROW_LABEL, ROW_ON, ROW_PHONE_LABEL, ROW_TAG, ROW_VALUE } from "./settings-row"

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

// The "Your plan" card: header, then edge-to-edge rows
export function PlanCard({ children }: { children: ReactNode }) {
  return (
    <Card aria-labelledby="plan" className="gap-0 overflow-hidden p-0">
      <div className="px-5 pt-5 pb-3 max-narrow:px-4 max-narrow:pt-4 max-narrow:pb-2">
        <CardHead title="Your plan" titleId="plan" aside={<span className="text-small text-fg-muted">Builds your roadmap</span>} />
      </div>
      {children}
    </Card>
  )
}

const display = (key: Key, v: string) => (key === "arrivalDate" ? `${weekdayDay(v)} ${v.slice(0, 4)}` : answerLabel(key, v))
const isPhone = () => typeof window.matchMedia === "function" && window.matchMedia("(max-width: 560px)").matches

export function PlanForm({ profile, account }: { profile: GetProfileResponse; account: ReactNode }) {
  const router = useRouter()
  const param = useSearchParams().get("edit")
  const picked = KEYS.find(k => k === param) // no answer picked: desktop shows the calm card, not an editor
  const editing: Key = picked ?? "visaType"
  const memoryOpen = param === "memory"
  const open = picked !== undefined || memoryOpen
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
  const close = () => router.replace("/settings") // replace, so Back does not return to the editor

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
    close()
  }

  return (
    <>
      <div className={cn("flex flex-col gap-4 max-narrow:gap-3", open && "max-narrow:hidden")}>
        <PlanCard>
          <ol aria-label="Your answers" className="m-0 list-none p-0">
            {KEYS.map(k => {
              const on = k === picked
              return (
                <li key={k} className={cn(ROW, on && ROW_ON)}>
                  <span className={ROW_LABEL}>{COPY[k].label}</span>
                  <span className={ROW_VALUE}>
                    <span className={ROW_PHONE_LABEL}>{COPY[k].label}</span>
                    {display(k, saved[k])}
                  </span>
                  {on && <span className={ROW_TAG}>Changing</span>}
                  <Button type="button" variant="text" onClick={() => router.push(`/settings?edit=${k}`)} className={cn(ROW_GO, on && "narrow:hidden")}>
                    <ChevronRight aria-hidden className="size-5" />
                    <span className="sr-only">Change {COPY[k].label}</span>
                  </Button>
                </li>
              )
            })}
          </ol>
        </PlanCard>
        <Card aria-labelledby="guide-settings" className="gap-0 overflow-hidden p-0">
          <div className="px-5 pt-5 pb-3 max-narrow:px-4 max-narrow:pt-4 max-narrow:pb-2">
            <CardHead title="Guide" titleId="guide-settings" />
          </div>
          <MemoryRow open={memoryOpen} />
        </Card>
        {account}
      </div>

      {memoryOpen ? (
        <MemorySection />
      ) : !picked ? (
        <Card variant="plain" aria-labelledby="calm" className="gap-0 bg-surface-sunken px-8 py-8 max-narrow:hidden">
          <h2 id="calm" className="text-featured">Pick an answer to change it</h2>
          <p className="mt-1 max-w-lede text-fg-muted">Your roadmap is rebuilt around the new answer straight away.</p>
          <ul className="mt-5 flex list-none flex-col gap-2 p-0 text-ui text-fg-muted">
            <li className="flex items-center gap-3"><Check aria-hidden className="size-4 text-fg-accent" />Tasks you&apos;ve done stay done</li>
            <li className="flex items-center gap-3"><Check aria-hidden className="size-4 text-fg-accent" />You can undo a change right after saving</li>
          </ul>
          <Link href="/app/roadmap" className="mt-5 inline-flex min-h-6 items-center gap-1 self-start text-ui font-medium">
            Open roadmap<ArrowRight aria-hidden className="size-4" />
          </Link>
        </Card>
      ) : (
        <Card aria-labelledby={titleId} className="gap-5 p-8 max-narrow:p-4">
          <form onSubmit={save} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-small text-fg-muted">{copy.label}</span>
              <h2 id={titleId} className="text-section">{copy.ask}</h2>
              <p className="m-0 text-fg-muted">Your roadmap is rebuilt for the new {copy.noun}. Tasks you&apos;ve done stay done.</p>
            </div>
            {editQuestion ? (
              <div role="radiogroup" aria-labelledby={titleId} className="flex max-w-lede flex-col gap-2">
                {editQuestion.options.map(([value, label]) => (
                  <OptionRow
                    key={`${editing}-${value}`}
                    name={editing}
                    value={value}
                    label={label}
                    checked={draft === value}
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
            {error && <p role="alert" className="text-fg">{error}</p>}
            <div className="flex gap-3 max-narrow:[&>*]:flex-1">
              <Button type="button" variant="secondary" onClick={cancel}>Cancel</Button>
              <Button type="submit" disabled={!dirty} aria-busy={saving} className={cn(saving && "bg-surface-inverse-raised")}>
                {saving ? "Saving…" : "Save and rebuild"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}

