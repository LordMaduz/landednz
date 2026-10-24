"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { OnboardingPreviewResponse } from "@landednz/types"
import { ApiDown } from "@/components/chrome/api-down"
import { Waypoint } from "@/components/route/waypoint"
import { buttonVariants } from "@/components/ui/button"
import { getRoadmapPreview } from "@/lib/api"
import { answersSummary, QUESTIONS, type Answers } from "@/lib/answers"
import { legForTask, type LegId } from "@/lib/legs"
import { useOnboardingStore } from "@/lib/stores/onboardingStore"
import { taskTitle } from "@/lib/task-copy"
import { cn } from "@/lib/utils"

// The preview's when-lines, as the Onboarding board words them
const PREVIEW_META: Record<string, string> = {
  T01: "First, 4 to 6 weeks before you leave",
  T02: "After your suburb research",
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

function title(taskId: string, name: string, city: Answers["city"]) {
  if (taskId !== "T01") return taskTitle(taskId, name)
  const label = QUESTIONS[1].options.find(([v]) => v === city)?.[1]
  return city === "OTHER" || !label ? "Research suburbs where you will live" : `Research ${label} suburbs`
}

type Tasks = OnboardingPreviewResponse["tasks"]

function Legs({ tasks, city }: { tasks: Tasks; city: Answers["city"] }) {
  const firstId = tasks[0]?.taskId
  const legs = SHOWN.map(leg => ({ ...leg, tasks: tasks.filter(t => legForTask(t.taskId) === leg.id) })).filter(l => l.tasks.length)
  const folded = tasks.filter(t => ["month1", "later"].includes(legForTask(t.taskId))).length

  return (
    <ol className="route-legs m-0 list-none p-0" aria-label="Your roadmap">
      {legs.map(leg => (
        <li key={leg.id}>
          <div className="route-step">
            <span className="route-dot" aria-hidden="true">
              <Waypoint state="available" />
            </span>
            <div className="flex min-h-11 flex-wrap items-center gap-x-4">
              <h2 className="text-body font-semibold">{leg.name}</h2>
              <span className="text-small text-muted">{count(leg.tasks.length)}</span>
            </div>
          </div>
          <ol className="m-0 list-none p-0">
            {leg.tasks.map(t => {
              const first = t.taskId === firstId
              return (
                <li key={t.taskId} className="route-step">
                  <span className="route-dot" aria-hidden="true">
                    <Waypoint state={first ? "current" : "available"} />
                  </span>
                  <div className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-4 p-2">
                    <span className={cn("grow basis-60", first && "font-semibold")}>{title(t.taskId, t.name, city)}</span>
                    {PREVIEW_META[t.taskId] && <span className="text-small text-muted">{PREVIEW_META[t.taskId]}</span>}
                  </div>
                </li>
              )
            })}
          </ol>
        </li>
      ))}
      {folded > 0 && (
        <li className="is-folded">
          <div className="route-step">
            <span className="route-dot" aria-hidden="true">
              <Waypoint state="locked" />
            </span>
            <div className="flex min-h-11 flex-wrap items-center gap-x-4">
              <h2 className="text-body font-semibold">Month 1 and later</h2>
              <span className="text-small text-muted">{count(folded)}: renting, a GP, ACC, your rights as a tenant and more</span>
            </div>
          </div>
        </li>
      )}
    </ol>
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
    <>
      <main className="container-page flex max-w-preview flex-col gap-8 pt-12 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-title">Your roadmap is ready</h1>
          <p className="text-muted">
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
          <Legs tasks={tasks} city={answers.city} />
        ) : (
          <p className="text-muted" aria-live="polite">Building your roadmap…</p>
        )}
      </main>
      <div className="sticky bottom-0 border-t border-hairline bg-white">
        <div className="container-page flex min-h-20 max-w-preview flex-wrap items-center justify-between gap-4 py-4">
          <span>Save it to tick tasks off and ask questions.</span>
          {/* A full navigation: /auth/complete is a route handler */}
          <a href="/auth/complete?redirect=%2Fapp" className={cn(buttonVariants({ size: "lg" }), "max-narrow:w-full")}>
            Save my roadmap
          </a>
        </div>
      </div>
    </>
  )
}
