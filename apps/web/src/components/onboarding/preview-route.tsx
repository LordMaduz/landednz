"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { OnboardingPreviewResponse } from "@landednz/types"
import { ApiDown } from "@/components/chrome/api-down"
import { AnswerRail } from "@/components/onboarding/answer-rail"
import { PublicFooter } from "@/components/chrome/public-footer"
import { Waypoint } from "@/components/route/waypoint"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getRoadmapPreview } from "@/lib/api"
import { answersSummary, type Answers } from "@/lib/answers"
import { legForPhase, type LegId } from "@/lib/legs"
import { useOnboardingStore } from "@/lib/stores/onboardingStore"
import { TASK_COPY, taskTitle } from "@/lib/task-copy"
import { cn } from "@/lib/utils"

// The preview's when-lines, as the Onboarding board words them
export const PREVIEW_META: Record<string, string> = {
  T01: "First, 4 to 6 weeks before you leave",
  T02: "After you choose where to live",
  T06: "Day 1",
  T07: "Day 1 or 2, in a branch",
  T08: "Before your first payday",
  T09: "After your IRD number",
  T10: "With your IR330",
}

// Before arrival the first leg reads forward ("Before you fly"); Month 1 and Later fold into one row
const SHOWN: { id: LegId; name: string }[] = [
  { id: "before", name: "Before you fly" },
  { id: "arrival", name: "Arrival" },
  { id: "week1", name: "Week 1" },
]

const count = (n: number) => `${n} ${n === 1 ? "task" : "tasks"}`

export const previewTitle = taskTitle

type Tasks = OnboardingPreviewResponse["tasks"]
type Task = Tasks[number]

const NEXT_SHOWN = 3
const ROW = "grid grid-cols-itin items-baseline gap-3 border-t border-hairline py-2.5"
const ShowBtn = ({ open, label, name, controls, onClick }: { open: boolean; label: string; name: string; controls: string; onClick(): void }) => (
  <Button variant="ghost" size="sm" className="-mr-3 font-semibold text-teal-text" aria-expanded={open} aria-controls={controls} aria-label={`${open ? "Hide" : "Show"} ${name}`} onClick={onClick}>
    {open ? "Hide" : "Show"}{label && ` ${label}`}
  </Button>
)

function TaskRows({ tasks }: { tasks: Task[] }) {
  return tasks.map(t => (
    <li key={t.taskId} className={ROW}>
      <span aria-hidden="true" className="size-2.5 justify-self-center rounded-full border-2 border-control" />
      <span>{previewTitle(t.taskId, t.name)}</span>
      <span className="text-small text-muted max-narrow:hidden">{PREVIEW_META[t.taskId]}</span>
    </li>
  ))
}

// shortcut: the preview carries no dependencies, so "waits on this one" is read from the next tasks' when-lines, upgrade when the API returns them
const hasDependants = (first: Task, tasks: Tasks) =>
  tasks.some(t => PREVIEW_META[t.taskId]?.startsWith("After ") && PREVIEW_META[t.taskId].endsWith(TASK_COPY[first.taskId]?.topic ?? "\0"))

function Itinerary({ tasks }: { tasks: Tasks }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [open, setOpen] = useState<string[]>([])
  const legs = SHOWN.map(leg => ({ ...leg, tasks: tasks.filter(t => legForPhase(t.phase) === leg.id) })).filter(l => l.tasks.length)
  const foldedTasks = tasks.filter(t => ["month1", "later"].includes(legForPhase(t.phase)))
  const [lead, ...rest] = legs
  const folds = [...rest, ...(foldedTasks.length ? [{ id: "month1" as LegId, name: "Month 1 and later", tasks: foldedTasks }] : [])]
  if (!lead) return null
  const [first, ...others] = lead.tasks
  const shown = moreOpen ? others : others.slice(0, NEXT_SHOWN)
  const toggle = (id: string) => setOpen(o => (o.includes(id) ? o.filter(x => x !== id) : [...o, id]))

  return (
    <Card aria-label="Your roadmap" className="gap-0 px-5 pt-2 pb-1">
      <ol className="m-0 list-none p-0">
        <li className="grid min-h-11 grid-cols-itin items-center gap-3">
          <Waypoint state="available" />
          <h2 className="text-body"><b className="font-semibold">{lead.name}</b> <span className="text-small font-normal text-muted">· {count(lead.tasks.length)}</span></h2>
        </li>
        <li className="my-1 mb-2">
          <section className="grid grid-cols-itin gap-3 rounded-surface border border-avatar bg-wash py-4 pr-4">
            <span className="mt-1 justify-self-center"><Waypoint state="current" /></span>
            <div className="flex flex-col gap-1">
              <p className="m-0 text-small font-semibold text-teal-text">Start here{PREVIEW_META[first.taskId] && ` · ${PREVIEW_META[first.taskId].replace(/^./, c => c.toLowerCase())}`}</p>
              <p className="m-0 text-section">{previewTitle(first.taskId, first.name)}</p>
              {hasDependants(first, tasks) && <p className="m-0 text-small text-muted">The next task waits on this one.</p>}
            </div>
          </section>
        </li>
        <li><ul id="next-tasks" className="m-0 list-none p-0"><TaskRows tasks={shown} /></ul></li>
        {others.length > NEXT_SHOWN && (
          <li className="grid grid-cols-itin gap-3 border-t border-hairline">
            <span />
            <span className="-ml-3"><ShowBtn open={moreOpen} label={moreOpen ? "" : `${others.length - NEXT_SHOWN} more`} name={`${others.length - NEXT_SHOWN} more ${lead.name} tasks`} controls="next-tasks" onClick={() => setMoreOpen(o => !o)} /></span>
          </li>
        )}
        {folds.map(f => {
          const topics = f.tasks.flatMap(t => TASK_COPY[t.taskId]?.topic ?? [])
          const isOpen = open.includes(f.name)
          return (
            <li key={f.name} className="border-t border-hairline">
              <div className="grid min-h-15 grid-cols-itin items-center gap-3">
                <span aria-hidden="true" className="size-3 justify-self-center rounded-full border-2 border-control" />
                <div className="leading-snug">
                  <h2 className="text-body"><b className="font-semibold">{f.name}</b> <span className="text-small font-normal text-muted">· {count(f.tasks.length)}</span></h2>
                  <p className="m-0 text-small text-muted">{topics.slice(0, 3).join(", ")}{topics.length > 3 && " and more"}</p>
                </div>
                <ShowBtn open={isOpen} label="" name={f.name} controls={`fold-${f.id}`} onClick={() => toggle(f.name)} />
              </div>
              <ul id={`fold-${f.id}`} hidden={!isOpen} className="m-0 list-none p-0 pb-1">{isOpen && <TaskRows tasks={f.tasks} />}</ul>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

// The roadmap the answers would build, before sign-up; Save carries the answers through sign-in
export function PreviewRoute({ answers, saveFailed }: { answers: Answers; saveFailed: boolean }) {
  const setAnswers = useOnboardingStore(s => s.setAnswers)
  const [tasks, setTasks] = useState<Tasks | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(() => {
    getRoadmapPreview(answers).then(r => setTasks(r.tasks), () => setFailed(true))
  }, [answers])

  useEffect(() => {
    setAnswers(answers) // "Change my answers" starts from these
    load()
  }, [answers, setAnswers, load])

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 grid-cols-rail max-split:grid-cols-1 max-split:content-start">
        <AnswerRail title="Your answers" intro="All five answered. Change any of them and the roadmap updates." answers={answers} current={null} />
        <main className="py-8 pr-10 pl-30 max-split:px-4 max-split:py-6">
          <div className="flex w-full max-w-preview flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-title">Your roadmap is ready</h1>
              <p className="m-0 text-muted">
                {answersSummary(answers)}.{" "}
                <Link href="/onboarding?step=1" className="font-medium underline">Change my answers</Link>
              </p>
            </div>
            {saveFailed && (
              <p role="alert" className="rounded-surface border border-ink p-4">
                Your roadmap wasn&apos;t saved. Your answers are kept, so try Save my roadmap again.
              </p>
            )}
            {failed ? (
              <ApiDown onRetry={() => { setFailed(false); load() }} heading="h2" />
            ) : tasks ? (
              <Itinerary tasks={tasks} />
            ) : (
              <p className="text-muted" aria-live="polite">Building your roadmap…</p>
            )}
            <Card className="flex-row flex-wrap items-center justify-between gap-4 max-narrow:flex-col max-narrow:items-stretch">
              <span>
                <b className="font-semibold">Save it to tick tasks off and ask questions.</b>
                <br />
                <span className="text-small text-muted">Sign in with Google or email on the next screen.</span>
              </span>
              {/* A full navigation: /auth/complete is a route handler */}
              <a href="/auth/complete?redirect=%2Fapp" className={cn(buttonVariants({ size: "lg" }), "max-narrow:w-full")}>
                Save my roadmap
              </a>
            </Card>
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  )
}
