"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { RouteRail } from "@/components/route/route-rail"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { buildRouteView, type RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { NextTaskCard } from "./next-task-card"
import { TaskSheet } from "./task-sheet"

export function RoadmapView({
  view,
  firstUse,
  selectedTaskId,
  onOpen,
}: {
  view: RouteView
  firstUse: boolean
  selectedTaskId?: string
  onOpen(taskId: string): void
}) {
  return (
    // Below 1100 px the open task takes the page; the route comes back when it closes
    <div className={cn("flex min-w-0 flex-col gap-8", selectedTaskId && "max-wide:hidden")}>
      <section aria-labelledby="rm-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 id="rm-title" className="text-title">Your roadmap</h1>
          <span className="text-small text-muted">
            {view.doneCount} of {view.total} tasks done
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Tasks done"
          aria-valuemin={0}
          aria-valuemax={view.total}
          aria-valuenow={view.doneCount}
        >
          <span style={{ width: `${view.total ? Math.round((view.doneCount / view.total) * 100) : 0}%` }} />
        </div>
        {firstUse && <p className="text-muted">Done some already? Open a task and mark it done.</p>}
      </section>
      <RouteRail
        legs={view.legs}
        selectedTaskId={selectedTaskId}
        onOpen={onOpen}
        // An open task takes the focus, so the card folds back into its row
        renderCurrent={selectedTaskId ? undefined : task => <NextTaskCard task={task} onOpen={onOpen} />}
      />
    </div>
  )
}

type Loaded = { view: RouteView; firstUse: boolean }

// Fetches the roadmap with the browser session; ?task=<id> is the open task, shown in the sheet
export function RoadmapScreen({ user }: { user: { name: string; initials: string } }) {
  const router = useRouter()
  const selectedTaskId = useSearchParams().get("task") ?? undefined
  const [state, setState] = useState<Loaded | "loading" | "down">("loading")
  // The header's Ask: which sheet's input to focus, and a count so a repeat press focuses again
  const [askFor, setAskFor] = useState<{ taskId: string; n: number } | null>(null)

  // A refetch after marking a task keeps the page (and the sheet) up; a failed one keeps what is shown
  const load = useCallback(async (refetch = false) => {
    if (!refetch) setState("loading")
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) return router.replace("/signin?redirect=%2Fapp%2Froadmap")
      const [profile, roadmap] = await Promise.all([getOnboardingProfile(token), getRoadmap(token)])
      const view = buildRouteView(roadmap, profile.arrivalDate)
      setState({ view, firstUse: view.doneCount === 0 })
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      if (!refetch) setState("down")
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  const open = (taskId: string) => router.push(`/app/roadmap?task=${taskId}`, { scroll: false })
  const close = useCallback(() => {
    setAskFor(null)
    router.push("/app/roadmap", { scroll: false })
  }, [router])
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
        <main className="container-page pt-12 pb-24">
          {state === "down" ? (
            <ApiDown onRetry={() => load()} />
          ) : (
            <div className={cn("sheet-layout", selectedTaskId && "has-sheet")}>
              <RoadmapView view={state.view} firstUse={state.firstUse} selectedTaskId={selectedTaskId} onOpen={open} />
              {selectedTaskId && (
                <TaskSheet
                  taskId={selectedTaskId}
                  route={state.view}
                  onClose={close}
                  onChanged={refetch}
                  askFocus={askFor?.taskId === selectedTaskId ? askFor.n : undefined}
                />
              )}
            </div>
          )}
        </main>
      )}
    </>
  )
}
