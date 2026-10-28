"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { AskPanel } from "@/components/assistant/ask-panel"
import { Stamp } from "@/components/route/stamp"
import { Button, buttonVariants } from "@/components/ui/button"
import { completeTask, getTaskDetail, reopenTask, type TaskDetailApiResponse } from "@/lib/api"
import { longDay, shortDayNZ } from "@/lib/nz-date"
import type { RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"
import { TASK_COPY } from "@/lib/task-copy"
import { stepParts } from "@/lib/task-steps"
import { cn } from "@/lib/utils"

type Source = NonNullable<TaskDetailApiResponse["sources"]>[string][number]
type Line = { text: string; source?: Source }

async function sessionToken(): Promise<string> {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? ""
}

const taskHref = (id: string) => `/app/roadmap?task=${id}`

// The open task (?task=<id>): a page in place of the route (TaskPage board). The steps read on the left; Mark as done
// and Ask stay beside them. Under 861 px it is one column: actions after the title, Ask after the content.
export function TaskSheet({
  taskId,
  route,
  onChanged,
  askFocus,
}: {
  taskId: string
  route: RouteView
  onChanged(): void
  askFocus?: number // changes each time the header's Ask asks for this page's input
}) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const askRef = useRef<HTMLInputElement>(null)
  const [shown, setShown] = useState(taskId)
  const [detail, setDetail] = useState<TaskDetailApiResponse | null>(null)
  // A mark or undo shows at once; the refetched route agrees with it after onChanged
  const [override, setOverride] = useState<{ taskId: string; doneOn: string | null } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (shown !== taskId) {
    setShown(taskId)
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

  const tasks = route.legs.flatMap(l => l.tasks)
  const at = tasks.findIndex(t => t.taskId === taskId)
  const task = tasks[at]
  const leg = route.legs.find(l => l.tasks.includes(task))
  if (!leg || !task) return null

  const previous = tasks[at - 1]
  const next = tasks[at + 1]
  const blocker = task.state === "blocked" ? tasks.find(t => t.taskId === task.blocker) : undefined
  const own = override?.taskId === taskId ? override : null
  const doneOn = own ? own.doneOn : task.state === "done" ? (task.completedAt ? shortDayNZ(task.completedAt) : "today") : null
  const steps = detail?.taskId === taskId ? detail : null
  const actionLabel = TASK_COPY[taskId]?.actionLabel
  const lines = (texts: string[] | undefined, key: string): Line[] =>
    (texts ?? []).map((text, i) => ({ text, source: steps?.sources?.[key]?.[i] }))
  const needs = lines(steps?.documentsRequired, "documents")
  const stepLines = lines(steps?.steps, "steps")
  const know = [...lines(steps?.commonMistakes, "mistakes"), ...lines(steps?.watchOuts, "watchOuts")]
  const whySource = steps?.sources?.why?.[0]
  // One number per distinct source URL, by first appearance down the page
  const cited = [whySource, ...[...needs, ...stepLines, ...know].map(l => l.source)].filter(
    (s, i, all): s is Source => !!s && all.findIndex(o => o?.url === s.url) === i,
  )
  const ref = (s: Source | undefined) =>
    s && (
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source: ${s.title}, checked ${longDay(s.checked)}`}
        className="relative ml-1 align-super text-small leading-none after:absolute after:-inset-2"
      >
        {cited.findIndex(c => c.url === s.url) + 1}
      </a>
    )
  const list = (id: string, title: string, items: Line[]) =>
    items.length > 0 && (
      <section aria-labelledby={id} className="flex flex-col gap-4">
        <h2 id={id} className="text-section">
          {title}
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          {items.map(l => (
            <li key={l.text}>
              {l.text}
              {ref(l.source)}
            </li>
          ))}
        </ul>
      </section>
    )

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
    <article aria-labelledby={titleId}>
      <nav aria-label="Tasks" className="flex min-h-14 items-center gap-2 border-b border-hairline">
        <Link href="/app/roadmap" className={cn(buttonVariants({ variant: "ghost" }), "-ml-4")}>
          <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          Roadmap
        </Link>
        <span className="text-small text-muted">
          {leg.name}, task {leg.tasks.indexOf(task) + 1} of {leg.tasks.length}
        </span>
        <div className="-mr-4 ml-auto flex">
          {previous && (
            <Link
              href={taskHref(previous.taskId)}
              aria-label={`Previous task: ${previous.title}`}
              className={cn(buttonVariants({ variant: "ghost" }), "max-split:w-11 max-split:px-0")}
            >
              <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
              <span className="max-split:hidden">{previous.title}</span>
            </Link>
          )}
          {next && (
            <Link
              href={taskHref(next.taskId)}
              aria-label={`Next task: ${next.title}`}
              className={cn(buttonVariants({ variant: "ghost" }), "max-split:w-11 max-split:px-0")}
            >
              <span className="max-split:hidden">{next.title}</span>
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </nav>

      <div className="task-layout">
        <div className="task-head flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <span className="text-small text-muted">{task.state === "blocked" ? task.meta : task.time}</span>
              <h1 id={titleId} ref={titleRef} tabIndex={-1} className="text-title focus-visible:outline-none">
                {task.title}
              </h1>
            </div>
            {doneOn && <Stamp date={doneOn} />}
          </div>
          {task.why && (
            <p className="max-w-lede">
              {task.why}
              {ref(whySource)}
            </p>
          )}
        </div>

        <div className="task-body flex flex-col gap-8">
          {list(`${titleId}-need`, "What you'll need", needs)}
          {stepLines.length > 0 && (
            <section aria-labelledby={`${titleId}-steps`} className="flex flex-col gap-4">
              <h2 id={`${titleId}-steps`} className="text-section">
                Steps
              </h2>
              <ol className="flex list-decimal flex-col gap-2 pl-6">
                {stepLines.map(l => {
                  const { lead, items } = stepParts(l.text)
                  return (
                    <li key={l.text}>
                      {lead}
                      {ref(l.source)}
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
            </section>
          )}
          {list(`${titleId}-know`, "Good to know", know)}
          {steps && cited.length > 0 && (
            <section aria-label="Sources" className="border-t pt-4 text-small text-muted">
              <ol className="flex list-decimal flex-col gap-1 pl-6">
                {cited.map(s => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    , checked {longDay(s.checked)}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {steps?.governmentSourceUrl && cited.length === 0 && (
            <p className="text-small text-muted">
              Source:{" "}
              <a href={steps.governmentSourceUrl} target="_blank" rel="noopener" className="underline">
                {new URL(steps.governmentSourceUrl).hostname.replace(/^www\./, "")}
              </a>
              {steps.lastVerified && `, checked ${longDay(steps.lastVerified)}`}
            </p>
          )}
        </div>

        <div className="task-side">
          <div className="task-acts flex flex-col gap-2">
            {error && (
              <p role="alert" className="text-small">
                {error}
              </p>
            )}
            {doneOn ? (
              <Button variant="quiet" onClick={() => reopen(taskId)}>
                Mark as not done
              </Button>
            ) : task.state !== "blocked" ? (
              <Button onClick={mark}>Mark as done</Button>
            ) : (
              blocker && (
                <p>
                  Do this first: <Link href={taskHref(blocker.taskId)}>{blocker.title}</Link>
                </p>
              )
            )}
            {steps?.governmentSourceUrl && actionLabel && !doneOn && (
              <a
                href={steps.governmentSourceUrl}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "quiet" })}
              >
                {actionLabel}{" "}
                <span className="sr-only">(opens in a new tab)</span>
                <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0" />
              </a>
            )}
          </div>
          <div className="task-ask">
            <AskPanel key={taskId} taskId={taskId} topic={task.topic} detail={steps} inputRef={askRef} />
          </div>
        </div>
      </div>
    </article>
  )
}
