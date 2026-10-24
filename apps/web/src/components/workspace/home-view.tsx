"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { RouteStrip } from "@/components/route/route-strip"
import { Waypoint } from "@/components/route/waypoint"
import { buttonVariants } from "@/components/ui/button"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { buildHomeView, type HomeView as Home } from "@/lib/home-view"
import { buildRouteView, type RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"

const taskHref = (taskId: string) => `/app/roadmap?task=${taskId}`

export function HomeView({ home, route }: { home: Home; route: RouteView }) {
  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="hello" className="flex flex-col gap-2">
        <h1 id="hello" className="text-title">{home.greeting}</h1>
        <p className="max-w-lede text-muted">{home.subline}</p>
      </section>

      <section aria-labelledby="journey" className="flex flex-col gap-6 rounded-surface border border-hairline p-8 max-narrow:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="journey" className="text-section">Your roadmap</h2>
          <span className="text-small text-muted">
            {route.doneCount} of {route.total} tasks done
          </span>
        </div>
        <RouteStrip legs={route.legs} />
      </section>

      <div className="grid grid-cols-home items-start gap-16 max-split:grid-cols-1 max-split:gap-12">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="week" className="flex flex-col gap-4">
            <h2 id="week" className="text-section">{home.weekTitle}</h2>
            <ol className="m-0 list-none overflow-hidden rounded-surface border border-hairline p-0">
              {home.top && (
                <li className="flex flex-wrap items-center gap-4 border-b border-hairline p-6">
                  <Waypoint state="leg-now" />
                  <div className="flex min-w-55 flex-1 flex-col gap-1">
                    <span className="font-semibold">{home.top.title}</span>
                    {home.top.why && <span className="text-muted">{home.top.why}</span>}
                  </div>
                  <span className="text-small text-muted max-narrow:hidden">{home.top.time}</span>
                  <Link href={taskHref(home.top.taskId)} className={buttonVariants({ className: "max-narrow:w-full" })}>
                    Start<span className="sr-only">: {home.top.title}</span>
                  </Link>
                </li>
              )}
              {home.week.map(t => (
                <li key={t.taskId} className="border-b border-hairline">
                  <Link
                    href={taskHref(t.taskId)}
                    className="flex items-center gap-4 px-6 py-4 text-ink no-underline hover:bg-wash hover:text-ink hover:no-underline"
                  >
                    <Waypoint state={t.state === "blocked" ? "blocked" : "available"} />
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="grow basis-55 font-medium">{t.title}</span>
                      <span className="text-small text-muted">{t.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
              {home.nextLine && <li className="bg-wash px-6 py-4 text-small text-muted">{home.nextLine}</li>}
            </ol>
          </section>

          <section aria-labelledby="done" className="flex flex-col gap-4">
            <h2 id="done" className="text-section">Recently done</h2>
            {home.recent.length === 0 ? (
              <p className="text-muted">
                Nothing yet. Tasks you finish show up here with the day you did them. Already done some? Tick them off on
                your Roadmap.
              </p>
            ) : (
              <ul className="m-0 list-none p-0">
                {home.recent.map(d => (
                  <li key={d.taskId} className="flex items-center gap-4 border-t border-hairline py-4">
                    <Waypoint state="done" />
                    <span className="min-w-0 flex-1">{d.title}</span>
                    <span className="text-small text-muted">{d.when}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside aria-labelledby="plan" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 id="plan" className="text-section">Your plan</h2>
            <Link href="/settings" aria-label="Edit your plan" className="text-small font-medium">
              Edit
            </Link>
          </div>
          <p className="text-small text-muted">Your roadmap is built from these answers.</p>
          <dl className="m-0">
            {home.plan.map(p => (
              <div key={p.label} className="flex justify-between gap-4 border-t border-hairline py-4">
                <dt className="text-muted">{p.label}</dt>
                <dd className="m-0 text-right font-medium">{p.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  )
}

type Loaded = { home: Home; route: RouteView }

// Fetches profile and roadmap with the browser session, like the Roadmap page
export function HomeScreen({ user, firstName }: { user: { name: string; initials: string }; firstName: string }) {
  const router = useRouter()
  const [state, setState] = useState<Loaded | "loading" | "down">("loading")

  const load = useCallback(async () => {
    setState("loading")
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) return router.replace("/signin?redirect=%2Fapp")
      const [profile, roadmap] = await Promise.all([getOnboardingProfile(token), getRoadmap(token)])
      const route = buildRouteView(roadmap, profile.arrivalDate)
      setState({ route, home: buildHomeView(route, profile, { firstName }, new Date()) })
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      setState("down")
    }
  }, [router, firstName])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  const current = typeof state === "object" ? state.route.current : null
  const ask = current ? () => router.push(`${taskHref(current.taskId)}&ask=1`) : undefined

  return (
    <>
      <AppHeader active="home" user={user} onAsk={ask} askDisabled={state === "down"} />
      {state === "loading" ? (
        <Loading />
      ) : (
        <main className="container-page pt-12 pb-24">
          {state === "down" ? <ApiDown onRetry={load} /> : <HomeView home={state.home} route={state.route} />}
        </main>
      )}
    </>
  )
}
