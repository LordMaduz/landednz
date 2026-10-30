"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { Tabs } from "@base-ui/react/tabs"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Stamp } from "@/components/route/stamp"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GuideColumn } from "@/components/guide/guide-column"
import { completeTask, getTaskDetail, reopenTask, type TaskDetailApiResponse } from "@/lib/api"
import { longDay, shortDate, shortDayNZ, weekdayDay } from "@/lib/nz-date"
import type { RouteView } from "@/lib/route-view"
import { useGuideStore } from "@/lib/stores/guideStore"
import { createClient } from "@/lib/supabase/client"
import { TASK_COPY } from "@/lib/task-copy"
import { stepParts } from "@/lib/task-steps"
import { linkPhones } from "@/lib/tel-links"
import { cn } from "@/lib/utils"

type Source = NonNullable<TaskDetailApiResponse["sources"]>[string][number]
type Line = { text: string; source?: Source }

async function sessionToken(): Promise<string> {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? ""
}

const SOURCES_SHOWN = 5
const tabClass =
  "min-h-11 cursor-pointer border-b-2 border-transparent bg-transparent px-0 font-medium text-muted data-active:border-ink data-active:text-ink"

// The visible one of two copies of an element (desktop and phone layouts); the first when none is laid out
const visible = <T extends HTMLElement>(...els: (T | null)[]) => els.find(e => e?.offsetParent) ?? els[0]

const taskHref = (id: string) => `/app/roadmap?task=${id}`

const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, "")

// Freephone numbers in a line become tel: links
const phones = (text: string) =>
  linkPhones(text).map((p, i) =>
    typeof p === "string" ? (
      p
    ) : (
      <a key={i} href={`tel:${p.tel}`} className="whitespace-nowrap underline">
        {p.text}
      </a>
    ),
  )

// The open task (?task=<id>): a page in place of the route (Task and TaskPhone boards). Desktop: the steps read on the
// left; Status and Sources stay beside them (one column under 861 px, or in a page area under 720 px while the guide is
// open). Phone: one card with tabs and an action bar whose Ask opens the guide sheet.
// Both layouts render from the same data; CSS hides one.
export function TaskSheet({
  taskId,
  route,
  onChanged,
}: {
  taskId: string
  route: RouteView
  onChanged(): void
}) {
  const titleId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const phoneTitleRef = useRef<HTMLHeadingElement>(null)
  const [allSources, setAllSources] = useState(false)
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
    visible(titleRef.current, phoneTitleRef.current)?.focus()
    return () => {
      live = false
    }
  }, [taskId])

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
      <>
        {"\u00a0"}
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Source: ${s.title}, checked ${longDay(s.checked)}`}
          className="-mx-2 px-2.5 py-1.5 align-super text-small leading-none font-medium text-teal-text"
        >
          {cited.findIndex(c => c.url === s.url) + 1}
        </a>
      </>
    )
  const list = (id: string, title: string, items: Line[]) =>
    items.length > 0 && (
      <section aria-labelledby={id} className="flex flex-col gap-4">
        <h2 id={id} className="text-section">
          {title}
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-6 text-body">
          {items.map(l => (
            <li key={l.text}>
              {phones(l.text)}
              {ref(l.source)}
            </li>
          ))}
        </ul>
      </section>
    )
  const sources = cited.length > 0 ? cited.map(s => ({ title: s.title, url: s.url, checked: s.checked })) : []
  if (steps?.governmentSourceUrl && cited.length === 0)
    sources.push({ title: "Official page", url: steps.governmentSourceUrl, checked: steps.lastVerified ?? "" })
  const latest = sources.map(s => s.checked).filter(Boolean).sort().at(-1)

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
    toast.success("Marked as done", { action: { label: "Undo", onClick: () => reopen(taskId) } })
  }

  const moreCount = sources.length - SOURCES_SHOWN
  const sourcesShown = allSources ? sources : sources.slice(0, SOURCES_SHOWN)
  const checkedLabel = latest ? `checked ${shortDate(latest)}` : "Links open in a new tab"
  const stepsSection = (id: string, headClass = "text-section") =>
    stepLines.length > 0 && (
      <section aria-labelledby={id} className="flex flex-col gap-3">
        <h2 id={id} className={headClass}>
          Steps
        </h2>
        <ol role="list" className="m-0 flex list-none flex-col gap-2.5 p-0 text-body tabular-nums">
          {stepLines.map((l, n) => {
            const { lead, items } = stepParts(l.text)
            return (
              <li key={l.text} className="flex gap-3">
                <span aria-hidden="true" className="w-6 flex-none font-semibold text-teal-text">
                  {n + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {phones(lead)}
                  {ref(l.source)}
                  {items.length > 0 && (
                    <ul className="mt-1 flex list-disc flex-col gap-1 pl-6">
                      {items.map(i => (
                        <li key={i}>{phones(i)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    )
  const sourcesList = (
    <>
      <ol role="list" className="m-0 flex list-none flex-col p-0 text-small tabular-nums">
        {sourcesShown.map((s, n) => (
          <li key={s.url} className="flex gap-2.5 border-t border-hairline py-2 first:border-t-0 first:pt-0">
            <span aria-hidden="true" className="w-3.5 flex-none py-0.5 text-muted max-narrow:py-3">{n + 1}</span>
            <span className="flex flex-col">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="py-0.5 font-medium max-narrow:py-3">
                {s.title} <span className="sr-only">(opens in a new tab)</span>
                <ExternalLink aria-hidden="true" size={12} strokeWidth={1.5} className="ml-1 inline" />
              </a>
              <span className="text-muted">{domainOf(s.url)}</span>
            </span>
          </li>
        ))}
      </ol>
      {moreCount > 0 && (
        <Button variant="ghost" size="sm" aria-expanded={allSources} onClick={() => setAllSources(v => !v)} className="self-start px-0 font-semibold text-teal-text">
          {allSources ? "Show fewer sources" : `${moreCount} more sources`}
        </Button>
      )}
    </>
  )
  const actionLink = steps?.governmentSourceUrl && actionLabel && !doneOn && (
    <a href={steps.governmentSourceUrl} target="_blank" rel="noopener" className={buttonVariants({ variant: "quiet" })}>
      {actionLabel} <span className="sr-only">(opens in a new tab)</span>
      <ExternalLink aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0" />
    </a>
  )
  const doneControls = doneOn ? (
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
  )
  const bestBy = !doneOn && task.bestBy ? `best done by ${weekdayDay(task.bestBy)}` : null
  const errorNote = error && (
    <p role="alert" className="text-small">
      {error}
    </p>
  )
  const stamp = doneOn && <Stamp date={doneOn} />
  const status = doneOn ? "Done" : task.state === "blocked" ? "Blocked" : "Not started"
  const undoNote = task.state !== "blocked" && !doneOn && <p className="text-small text-muted">You can undo this.</p>
  // The same actions as the column, flat at the top of the open guide (chat-window D6): same handlers
  const strip = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ui font-semibold">{status}</span>
        {bestBy && <span className="text-small font-semibold text-teal">Best done by {weekdayDay(task.bestBy!)}</span>}
      </div>
      <div className="flex gap-2 *:min-h-9 *:flex-1 *:px-3 *:text-ui">
        {doneControls}
        {actionLink}
      </div>
      {errorNote}
      {undoNote}
    </>
  )

  return (
    <article aria-labelledby={titleId}>
      <div data-testid="task-desktop" className="max-narrow:hidden">
        <nav aria-label="Tasks" className="flex min-h-14 items-center gap-2 pb-2">
          <Link href="/app/roadmap" className={cn(buttonVariants({ variant: "ghost" }), "-ml-4")}>
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
            Roadmap
          </Link>
          <span aria-hidden="true" className="text-small text-muted">
            /
          </span>
          <span className="text-small text-muted">
            {leg.name} · task {leg.tasks.indexOf(task) + 1} of {leg.tasks.length}
          </span>
          <div className="ml-auto flex gap-2">
            {previous && (
              <Link
                href={taskHref(previous.taskId)}
                aria-label={`Previous task: ${previous.title}`}
                className={buttonVariants({ variant: "quiet" })}
              >
                <ChevronLeft aria-hidden="true" size={14} strokeWidth={1.5} />
                Previous
              </Link>
            )}
            {next && (
              <Link
                href={taskHref(next.taskId)}
                aria-label={`Next task: ${next.title}`}
                className={buttonVariants({ variant: "quiet" })}
              >
                Next task
                <ChevronRight aria-hidden="true" size={14} strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </nav>

        <div className="grid grid-cols-task items-start gap-4 max-split:grid-cols-1 @max-guide-task/page:grid-cols-1">
          <Card as="div" className="gap-8 px-10 py-9">
            <div className="flex max-w-prose flex-col gap-3">
              <div className="flex items-start gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-small text-muted">
                    {leg.name} · {task.state === "blocked" ? task.meta : task.time}
                  </span>
                  <h1 id={titleId} ref={titleRef} tabIndex={-1} className="text-title focus-visible:outline-none">
                    {task.title}
                  </h1>
                </div>
                {stamp}
              </div>
              {task.why && (
                <p className="text-muted">
                  {task.why}
                  {ref(whySource)}
                </p>
              )}
            </div>
            <div className="flex max-w-prose flex-col gap-8">
              {stepsSection(`${titleId}-steps`)}
              {list(`${titleId}-need`, "Have ready", needs)}
              {list(`${titleId}-know`, "Good to know", know)}
            </div>
          </Card>

          {/* In a page area under 561 px the status card joins the grid and sticks to its bottom (D14) */}
          <GuideColumn strip={strip}>
            <aside aria-label="Task actions" className="flex flex-col gap-4 @max-guide-narrow/page:contents">
              <Card aria-labelledby={`${titleId}-status`} className="@max-guide-narrow/page:sticky @max-guide-narrow/page:bottom-0 @max-guide-narrow/page:z-10">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`${titleId}-status`} className="text-section">
                    {status}
                  </h2>
                  {bestBy && <span className="text-small font-semibold text-teal">Best done by {weekdayDay(task.bestBy!)}</span>}
                </div>
                {errorNote}
                {doneControls}
                {undoNote}
                {actionLink}
              </Card>
              {steps && sources.length > 0 && (
                <Card aria-labelledby={`${titleId}-sources`} className="gap-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 id={`${titleId}-sources`} className="text-section">
                      Sources
                    </h2>
                    <p className="text-small text-muted">{checkedLabel}</p>
                  </div>
                  {sourcesList}
                </Card>
              )}
            </aside>
          </GuideColumn>
        </div>
      </div>

      <div data-testid="task-phone" className="mt-4 hidden flex-col gap-4 max-narrow:flex">
        <Card as="div" className="gap-2">
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-small text-muted">
                {leg.name} · {task.state === "blocked" ? task.meta : task.time}
                {bestBy && ` · ${bestBy}`}
              </span>
              <h1 ref={phoneTitleRef} tabIndex={-1} className="text-title focus-visible:outline-none">
                {task.title}
              </h1>
            </div>
            {stamp}
          </div>
          {task.why && (
            <p className="text-muted">
              {task.why}
              {ref(whySource)}
            </p>
          )}
          <Tabs.Root defaultValue="steps">
            <Tabs.List aria-label="Task sections" className="flex gap-4 border-b border-hairline">
              <Tabs.Tab value="steps" className={tabClass}>
                Steps
              </Tabs.Tab>
              <Tabs.Tab value="know" className={tabClass}>
                Good to know
              </Tabs.Tab>
              {sources.length > 0 && (
                <Tabs.Tab value="sources" className={tabClass}>
                  Sources {sources.length}
                </Tabs.Tab>
              )}
            </Tabs.List>
            <Tabs.Panel value="steps" className="flex flex-col gap-6 pt-3">
              {stepsSection(`${titleId}-p-steps`, "sr-only")}
              {list(`${titleId}-p-need`, "Have ready", needs)}
              {actionLink}
            </Tabs.Panel>
            <Tabs.Panel value="know" className="flex flex-col gap-6 pt-3">
              {list(`${titleId}-p-know`, "Good to know", know) || <p className="text-muted">Nothing extra to know for this task.</p>}
            </Tabs.Panel>
            {sources.length > 0 && (
              <Tabs.Panel value="sources" className="flex flex-col gap-3 pt-3">
                <p className="text-small text-muted">{checkedLabel}</p>
                {sourcesList}
              </Tabs.Panel>
            )}
          </Tabs.Root>
        </Card>
        <div
          role="group"
          aria-label="Task actions"
          className="fixed inset-x-0 bottom-14 z-30 flex items-center gap-2 border-t border-hairline bg-white px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 flex-col [&>button]:w-full">
            {errorNote}
            {doneControls}
          </div>
          <Button variant="quiet" onClick={() => useGuideStore.getState().openPane({ kind: "task", taskKey: taskId })}>
            Ask
          </Button>
        </div>
      </div>
    </article>
  )
}
