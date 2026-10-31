"use client"

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { GuideShell } from "@/components/guide/guide-shell"
import { RouteTrack } from "@/components/route/route-track"
import { Waypoint } from "@/components/route/waypoint"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { homeSubline } from "@/lib/home-view"
import { buildItinerary, type Itinerary as ItineraryData } from "@/lib/roadmap-itinerary"
import { buildRouteView, taskTitles, waitsOn, type RouteTask, type RouteView } from "@/lib/route-view"
import { useGuideStore } from "@/lib/stores/guideStore"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TaskSheet } from "./task-sheet"

const PHONE_ROWS = 2
const DESKTOP_ROWS = 3
const taskHref = (taskId: string) => `/app/roadmap?task=${taskId}`
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`

// Desktop: one itinerary card, rows ruled. Phone: each row is its own card (the board's stack).
const ROW = "itin py-2.5 max-narrow:rounded-surface max-narrow:border max-narrow:border-hairline max-narrow:bg-white max-narrow:p-4 max-narrow:shadow-lift"
const RULED = "border-t border-hairline max-narrow:border-t-0"
const WHEN = "m-0 text-small text-muted max-narrow:hidden"
const DOT = "flex items-center max-narrow:hidden"
const BODY = "min-w-0"
const Wide = ({ children }: { children: ReactNode }) => <span className="max-narrow:hidden">{children}</span>
const Phone = ({ children }: { children: ReactNode }) => <span className="hidden max-narrow:inline">{children}</span>

// Each window on its own line, so "25–26 Oct" never breaks mid-window
const WhenParts = ({ when }: { when: string }) => (
  <p className={WHEN}>{when.split(" · ").map(w => <span key={w} className="block whitespace-nowrap">{w}</span>)}</p>
)

// Phone width, read once the page is loaded (this view only renders client side)
function usePhone() {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia?.("(width < 561px)")
      mq?.addEventListener("change", cb)
      return () => mq?.removeEventListener("change", cb)
    },
    () => window.matchMedia?.("(width < 561px)").matches ?? false,
    () => false,
  )
}

function Show({ open, onClick, label, hidden, className }: { open: boolean; onClick(): void; label: ReactNode; hidden: string; className?: string }) {
  return (
    <Button variant="ghost" size="sm" className={cn("-mr-3 font-semibold text-teal-text", className)} aria-expanded={open} onClick={onClick}>
      {open ? "Hide" : "Show"} {label}
      <span className="sr-only"> {hidden}</span>
    </Button>
  )
}

function TaskList({ label, tasks, meta }: { label: string; tasks: RouteTask[]; meta(t: RouteTask): string }) {
  return (
    <ul aria-label={label} className="m-0 list-none p-0">
      {tasks.map(t => (
        <li key={t.taskId} className="flex min-h-9 items-baseline gap-3 border-t border-hairline py-1.5 max-narrow:min-h-11 max-narrow:items-center">
          <Link href={taskHref(t.taskId)} className="min-h-6 min-w-0 flex-1 text-ink hover:text-ink">{t.title}</Link>
          <span className="flex-none text-small text-muted">{meta(t)}</span>
        </li>
      ))}
    </ul>
  )
}

function Itinerary({ it, startOpen }: { it: ItineraryData; startOpen: boolean }) {
  const [doneOpen, setDoneOpen] = useState(startOpen)
  const [moreOpen, setMoreOpen] = useState(false)
  const [laterOpen, setLaterOpen] = useState<string | null>(null)
  const { done, today, current, later } = it
  const phone = usePhone()
  const stageTasks = current ? [...current.rows.map(r => r.task), ...current.more] : []
  const shown = moreOpen ? stageTasks : stageTasks.slice(0, phone ? PHONE_ROWS : DESKTOP_ROWS)
  return (
    <Card aria-label="Itinerary" className="gap-0 max-narrow:contents">
      <ol className="m-0 flex list-none flex-col p-0 max-narrow:gap-2.5">
        {done && (
          <li className={cn(ROW, "pt-0 max-narrow:pt-4")}>
            <WhenParts when={done.when} />
            <span className={DOT}><Waypoint state="done" /></span>
            <div className={cn(BODY, "text-muted")}>
              <h2 className="inline text-ui font-semibold text-ink">Done so far</h2> ·{" "}
              <Wide>{done.summary}{done.topics && `: ${done.topics}`}</Wide>
              <Phone>{plural(done.count, "task")}</Phone>
            </div>
            <Show open={doneOpen} onClick={() => setDoneOpen(o => !o)} label="" hidden="done tasks" />
            {doneOpen && <div className="itin-wide"><TaskList label="Done tasks" tasks={done.tasks} meta={t => t.meta} /></div>}
          </li>
        )}

        {today && (
          <li className="itin -mx-4 rounded-surface border border-avatar bg-wash px-4 py-4 max-narrow:mx-0 max-narrow:gap-y-1.5">
            <p className="m-0 text-small font-semibold text-teal-text max-narrow:hidden">
              Today<br />{today.date}
              {today.day !== null && <><br /><span className="font-normal text-muted">day {today.day}</span></>}
            </p>
            <span className={cn(DOT, "self-start pt-1")}><Waypoint state="current" /></span>
            <div className="itin-wide flex min-w-0 flex-col gap-1">
              <p className="m-0 text-small font-semibold text-teal-text">
                <Wide>{today.meta}</Wide>
                <Phone>Today · {today.meta.replace("You're here · ", "").replace(/^Up next/, "up next")}</Phone>
              </p>
              <h2 className="text-featured">{today.task.title}</h2>
              {today.task.why && <p className="max-w-lede text-muted max-narrow:hidden">{today.task.why}</p>}
              {today.unlocks.length > 0 && (
                <p className="text-small text-muted">
                  <b className="font-semibold">Unlocks {plural(today.unlocks.length, "task")}:</b>{" "}
                  <Wide>{today.unlocks.map(u => `${u.title} (${u.stage})`).join(" · ")}</Wide>
                  <Phone>{today.unlocks.map(u => u.topic).join(", ")}</Phone>
                </p>
              )}
              <div className="flex gap-2 pt-2 max-narrow:flex-col">
                <Link href={taskHref(today.task.taskId)} className={buttonVariants({ className: "max-narrow:w-full" })}>
                  Start task<span className="sr-only">: {today.task.title}</span>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => useGuideStore.getState().openPane({ kind: "task", taskKey: today.task.taskId })}
                  className="max-narrow:w-full"
                >
                  Ask about this
                </Button>
              </div>
            </div>
          </li>
        )}

        {current && (
          <li className={cn(ROW, "pt-4 max-narrow:pt-4")}>
            <p className={WHEN}>
              {current.when}
              {current.daysLeft !== null && <><br />{plural(current.daysLeft, "day")} left</>}
            </p>
            <span className={cn(DOT, "self-start pt-1.5")}><Waypoint state="leg-now" /></span>
            <div className={cn(BODY, "itin-wide")}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-section">
                  {current.name} · {plural(current.count, "task")}
                  {current.carried.map(c => <span key={c.stage} className="text-small font-normal text-muted max-narrow:block"><span className="max-narrow:hidden">,</span> {c.count} still open from {c.stage}</span>)}
                </h2>
                <span className="hidden text-small text-muted max-narrow:inline">{current.when}</span>
              </div>
              <TaskList label={`${current.name} tasks`} tasks={shown} meta={t => [current.carriedFrom[t.taskId], t.state === "blocked" ? waitsOn(t) : t.time].filter(Boolean).join(" · ")} />
              {stageTasks.length > shown.length || moreOpen ? (
                <Show open={moreOpen} onClick={() => setMoreOpen(o => !o)} label={`${stageTasks.length - (phone ? PHONE_ROWS : DESKTOP_ROWS)} more`} hidden="" className="-ml-3 -mr-0" />
              ) : null}
            </div>
          </li>
        )}

        {later.map(l => (
          <li key={l.name} className={cn(ROW, RULED, "max-narrow:hidden")}>
            <span className={WHEN}>{l.when}</span>
            <span className={DOT}><Waypoint state="available" /></span>
            <div className={cn(BODY, "text-muted")}>
              <h2 className="inline text-ui font-semibold text-ink">{l.name}</h2> · {plural(l.count, "task")}{l.wait}
            </div>
            <Show open={laterOpen === l.name} onClick={() => setLaterOpen(o => (o === l.name ? null : l.name))} label="" hidden={`${l.name} tasks`} />
            {laterOpen === l.name && (
              <div className="itin-wide">
                <TaskList label={`${l.name} tasks`} tasks={l.tasks} meta={t => (t.state === "blocked" ? waitsOn(t) : t.time)} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Card>
  )
}

export function RoadmapView({
  view,
  arrivalDate,
  now,
  firstUse,
}: {
  view: RouteView
  arrivalDate: string
  now: Date
  firstUse: boolean
}) {
  const startOpen = !!useSearchParams().get("done")
  const it = buildItinerary(view, arrivalDate, now)
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section aria-labelledby="rm-title" className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 id="rm-title" className="text-title">Your roadmap</h1>
        <p className="text-muted max-narrow:w-full">
          <Phone>{homeSubline(view, arrivalDate, now, true)}</Phone>
          <Wide>{homeSubline(view, arrivalDate, now, false)}</Wide>
        </p>
        {firstUse && <p className="basis-full text-muted">Done some already? Open a task and mark it done.</p>}
      </section>
      <Card aria-label="Where you are" className="max-narrow:gap-1.5">
        <RouteTrack route={view} arrivalDate={arrivalDate} now={now} variant="tall" />
      </Card>
      <Itinerary it={it} startOpen={startOpen} />
    </div>
  )
}

type Loaded = { view: RouteView; arrivalDate: string; now: Date; firstUse: boolean }

// Fetches the roadmap with the browser session; ?task=<id> is the open task, shown as a page in place of the route
export function RoadmapScreen({ user }: { user: { name: string; initials: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTaskId = searchParams.get("task") ?? undefined
  const [state, setState] = useState<Loaded | "loading" | "down">("loading")
  // A refetch after marking a task keeps the page (and the sheet) up; a failed one keeps what is shown
  const load = useCallback(async (refetch = false) => {
    if (!refetch) setState("loading")
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) return router.replace("/signin?redirect=%2Fapp%2Froadmap")
      const [profile, roadmap] = await Promise.all([getOnboardingProfile(token), getRoadmap(token)])
      const now = new Date()
      const view = buildRouteView(roadmap, profile.arrivalDate, now)
      setState({ view, arrivalDate: profile.arrivalDate, now, firstUse: view.doneCount === 0 })
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      if (!refetch) setState("down")
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  const refetch = useCallback(() => load(true), [load])

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="roadmap" back={selectedTaskId ? { href: "/app/roadmap", label: "Roadmap" } : undefined} user={user} />
      {state === "loading" ? (
        <Loading />
      ) : (
        <>
          {state === "down" ? (
            <main className="container-page container-app py-6">
              <ApiDown onRetry={() => load()} />
            </main>
          ) : (
            <GuideShell
              page={selectedTaskId ? { kind: "task", taskKey: selectedTaskId } : { kind: "roadmap" }}
              titles={taskTitles(state.view)}
              className={cn("container-page container-app", selectedTaskId ? "max-narrow:pb-40" : "pt-6")}
            >
              {selectedTaskId ? <TaskSheet taskId={selectedTaskId} route={state.view} onChanged={refetch} /> : <RoadmapView {...state} />}
            </GuideShell>
          )}
          <div className={cn("mt-auto", selectedTaskId && "max-narrow:hidden")}>
            <PublicFooter app />
          </div>
        </>
      )}
    </div>
  )
}
