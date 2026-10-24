"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { AskPanel } from "@/components/assistant/ask-panel"
import { Stamp } from "@/components/route/stamp"
import { Button } from "@/components/ui/button"
import { completeTask, getTaskDetail, reopenTask, type TaskDetailApiResponse } from "@/lib/api"
import { longDay, shortDayNZ } from "@/lib/nz-date"
import type { RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"
import { TASK_COPY } from "@/lib/task-copy"
import { stepParts } from "@/lib/task-steps"

async function sessionToken(): Promise<string> {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? ""
}

// The open task (?task=<id>): docked beside the route at ≥ 1100 px, a full page under a wash band below.
// Opening another task stacks this one; Back pops the browser history to it.
export function TaskSheet({
  taskId,
  route,
  onClose,
  onChanged,
  askFocus,
}: {
  taskId: string
  route: RouteView
  onClose(): void
  onChanged(): void
  askFocus?: number // changes each time the header's Ask asks for this sheet's input
}) {
  const router = useRouter()
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const askRef = useRef<HTMLInputElement>(null)
  const [shown, setShown] = useState(taskId)
  const [history, setHistory] = useState<string[]>([])
  const [detail, setDetail] = useState<TaskDetailApiResponse | null>(null)
  // A mark or undo shows at once; the refetched route agrees with it after onChanged
  const [override, setOverride] = useState<{ taskId: string; doneOn: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (shown !== taskId) {
    setShown(taskId)
    setHistory(h => (h.at(-1) === taskId ? h.slice(0, -1) : [...h, shown]))
    setError(null)
  }

  useEffect(() => {
    let live = true
    sessionToken()
      .then(token => getTaskDetail(taskId, token))
      .then(d => live && setDetail(d))
      .catch(() => live && setDetail(null))
    titleRef.current?.focus()
    return () => {
      live = false
    }
  }, [taskId])

  useEffect(() => {
    if (askFocus) askRef.current?.focus()
  }, [askFocus])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const leg = route.legs.find(l => l.tasks.some(t => t.taskId === taskId))
  const task = leg?.tasks.find(t => t.taskId === taskId)
  if (!leg || !task) return null

  const own = override?.taskId === taskId ? override : null
  const doneOn = own ? own.doneOn : task.state === "done" ? (task.completedAt ? shortDayNZ(task.completedAt) : "today") : null
  const steps = detail?.taskId === taskId ? detail : null
  const actionLabel = TASK_COPY[taskId]?.actionLabel
  const previous = history.at(-1)
  const previousTitle = previous && route.legs.flatMap(l => l.tasks).find(t => t.taskId === previous)?.title

  async function reopen(id: string) {
    try {
      await reopenTask(id, await sessionToken())
    } catch {
      setError("Couldn't mark it as not done. Check your connection, then try again.")
      return
    }
    setOverride({ taskId: id, doneOn: null })
    onChanged()
  }

  async function mark() {
    setError(null)
    try {
      await completeTask(taskId, await sessionToken())
    } catch {
      setError("Couldn't mark it as done. Check your connection, then try again.")
      return
    }
    setOverride({ taskId, doneOn: shortDayNZ(new Date()) })
    onChanged()
    toast("Marked as done", { action: { label: "Undo", onClick: () => reopen(taskId) } })
  }

  return (
    <div className="sheet-wrap">
      <aside className="sheet" aria-labelledby={titleId}>
        {previous && previousTitle && (
          <div className="-mt-2 -mr-2 -mb-2 -ml-4 flex">
            <Button variant="ghost" onClick={() => router.back()} aria-label={`Back to ${previousTitle}`}>
              <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
              <span>{previousTitle}</span>
            </Button>
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-small text-muted">
              {leg.name}, {task.state === "blocked" ? task.meta : task.time}
            </span>
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-section focus-visible:outline-none">
              {task.title}
            </h2>
          </div>
          {doneOn && <Stamp date={doneOn} />}
          <Button variant="ghost" onClick={onClose} aria-label="Close task" className="-mt-2 -mr-2 w-11 px-0">
            <X aria-hidden="true" size={16} strokeWidth={1.5} />
          </Button>
        </div>

        {task.why && <p>{task.why}</p>}
        {steps && steps.steps.length > 0 && (
          <ol className="flex list-decimal flex-col gap-2 pl-6">
            {steps.steps.map(s => {
              const { lead, items } = stepParts(s)
              return (
                <li key={s}>
                  {lead}
                  {items.length > 0 && (
                    <ul className="mt-1 flex list-disc flex-col gap-1 pl-6">
                      {items.map(i => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        )}
        {steps && actionLabel && !doneOn && (
          <a
            href={steps.governmentSourceUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 self-start font-medium"
          >
            <span>
              {actionLabel}{" "}
              <span className="sr-only">(opens in a new tab)</span>
            </span>
            <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0" />
          </a>
        )}
        {steps && (
          <p className="text-small text-muted">
            Source:{" "}
            <a href={steps.governmentSourceUrl} target="_blank" rel="noopener" className="underline">
              {new URL(steps.governmentSourceUrl).hostname.replace(/^www\./, "")}
            </a>
            {steps.lastVerified && `, checked ${longDay(steps.lastVerified)}`}
          </p>
        )}

        {error && (
          <p role="alert" className="text-small">
            {error}
          </p>
        )}
        {(doneOn || task.state !== "blocked") && (
          <div className="flex flex-wrap gap-2">
            {doneOn ? (
              <Button variant="quiet" onClick={() => reopen(taskId)}>
                Mark as not done
              </Button>
            ) : (
              <Button onClick={mark}>Mark as done</Button>
            )}
          </div>
        )}

        <AskPanel key={taskId} taskId={taskId} topic={task.topic} detail={steps} inputRef={askRef} />
      </aside>
    </div>
  )
}
