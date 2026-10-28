"use client"

import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { RouteTrack } from "@/components/route/route-track"
import { StageList } from "@/components/route/stage-list"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardHead } from "@/components/ui/card"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { journeyDay } from "@/lib/journey-day"
import { addDays, longDay, shortDay } from "@/lib/nz-date"
import { buildRouteView, type RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { TaskSheet } from "./task-sheet"

export function RoadmapView({
  view,
  arrivalDate,
  now,
  firstUse,
  onOpen,
}: {
  view: RouteView
  arrivalDate: string
  now: Date
  firstUse: boolean
  onOpen(taskId: string): void
}) {
  const { current } = view
  const landed = journeyDay(arrivalDate, now) >= 1
  const dates = [
    { date: arrivalDate, what: landed ? "You landed" : "Arriving" },
    { date: addDays(arrivalDate, 7), what: "Week 1 ends" },
    { date: addDays(arrivalDate, 30), what: "Month 1 ends" },
  ]
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section aria-labelledby="rm-title" className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 id="rm-title" className="text-title">Your roadmap</h1>
        <p className="text-muted">
          {view.doneCount} of {view.total} done · {landed ? "landed" : "arriving"} {longDay(arrivalDate)}
        </p>
        {firstUse && <p className="basis-full text-muted">Done some already? Open a task and mark it done.</p>}
      </section>
      <Card aria-label="Where you are">
        <RouteTrack route={view} arrivalDate={arrivalDate} now={now} height={120} />
      </Card>
      <div className="grid grid-cols-home gap-4 max-split:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-4">
          <StageList legs={view.legs} onOpen={onOpen} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card aria-labelledby="rm-next">
            <CardHead title="Up next" titleId="rm-next" aside={current && <span className="text-small text-muted">About {current.time}</span>} />
            {current ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-section">{current.title}</h3>
                  {current.why && <p className="max-w-lede text-muted">{current.why}</p>}
                </div>
                <Link href={`/app/roadmap?task=${current.taskId}`} className={buttonVariants({ className: "self-start" })}>
                  Start task<span className="sr-only">: {current.title}</span>
                </Link>
              </>
            ) : (
              <p className="text-muted">You have finished every task on your roadmap.</p>
            )}
          </Card>
          <Card aria-labelledby="rm-dates">
            <CardHead title="Key dates" titleId="rm-dates" />
            <dl className="m-0 grid grid-cols-plan items-baseline gap-x-3 gap-y-2">
              {dates.map(d => (
                <Fragment key={d.what}>
                  <dt className="text-small text-muted">{shortDay(d.date)}</dt>
                  <dd className="m-0 font-medium">{d.what}</dd>
                </Fragment>
              ))}
            </dl>
            <Link href="/settings" className="mt-auto inline-flex min-h-6 items-center self-start text-small font-medium">
              Change your arrival date
            </Link>
          </Card>
        </div>
      </div>
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
  // The header's Ask: which sheet's input to focus, and a count so a repeat press focuses again.
  // Home's Ask lands here with ?ask=1.
  const [askFor, setAskFor] = useState<{ taskId: string; n: number } | null>(() =>
    selectedTaskId && searchParams.get("ask") ? { taskId: selectedTaskId, n: 1 } : null,
  )
  // Ask from a page with no task in view (Settings) opens the current task once the route loads
  const askOnLoad = useRef(!selectedTaskId && !!searchParams.get("ask"))

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
      if (askOnLoad.current && view.current) {
        askOnLoad.current = false
        setAskFor({ taskId: view.current.taskId, n: 1 })
        router.replace(`/app/roadmap?task=${view.current.taskId}&ask=1`, { scroll: false })
      }
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      if (!refetch) setState("down")
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  const open = (taskId: string) => router.push(`/app/roadmap?task=${taskId}`)
  const askTaskId = typeof state === "object" ? (selectedTaskId ?? state.view.current?.taskId) : undefined
  const ask = () => {
    if (!askTaskId) return
    setAskFor(a => ({ taskId: askTaskId, n: (a?.n ?? 0) + 1 }))
    if (askTaskId !== selectedTaskId) open(askTaskId)
  }
  const refetch = useCallback(() => load(true), [load])

  return (
    <>
      <AppHeader active="roadmap" user={user} onAsk={askTaskId ? ask : undefined} askDisabled={state === "down"} />
      {state === "loading" ? (
        <Loading />
      ) : (
        <>
          <main className={cn("container-page", selectedTaskId ? "pb-24" : "py-6")}>
            {state === "down" ? (
              <ApiDown onRetry={() => load()} />
            ) : selectedTaskId ? (
              <TaskSheet
                taskId={selectedTaskId}
                route={state.view}
                onChanged={refetch}
                askFocus={askFor?.taskId === selectedTaskId ? askFor.n : undefined}
              />
            ) : (
              <RoadmapView {...state} onOpen={open} />
            )}
          </main>
          <PublicFooter />
        </>
      )}
    </>
  )
}
