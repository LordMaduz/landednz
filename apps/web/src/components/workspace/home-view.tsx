"use client"

import { Fragment, useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { RouteTrack } from "@/components/route/route-track"
import { Waypoint } from "@/components/route/waypoint"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardFoot, CardHead } from "@/components/ui/card"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { buildHomeView, type HomeView as Home } from "@/lib/home-view"
import { buildRouteView, type RouteView } from "@/lib/route-view"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const taskHref = (taskId: string) => `/app/roadmap?task=${taskId}`

const ROW =
  "flex min-h-10 items-center gap-3 px-5 py-2 text-ink no-underline hover:bg-wash hover:text-ink hover:no-underline max-narrow:min-h-11 max-narrow:px-4"
const LINK = "inline-flex min-h-6 items-center text-small font-medium"

// Rows run edge to edge inside a card: the li cancels the card padding
function Rows({ children }: { children: ReactNode }) {
  return <ol className="m-0 list-none p-0 [&>li]:-mx-5 [&>li]:border-t [&>li]:border-hairline max-narrow:[&>li]:-mx-4">{children}</ol>
}

function Tick() {
  return (
    <span aria-hidden="true" className="flex size-4 flex-none items-center justify-center rounded-full bg-avatar text-teal-text">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.2 5.2 4.2 7.1 7.8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function HomeView({ home, route, arrivalDate, now }: { home: Home; route: RouteView; arrivalDate: string; now: Date }) {
  const { top } = home
  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="hello" className="flex flex-col gap-1">
        <h1 id="hello" className="text-title">{home.greeting}</h1>
        <p className="text-muted">{home.subline}</p>
      </section>

      <Card aria-labelledby="route">
        <CardHead
          title="Your roadmap"
          titleId="route"
          aside={<Link href="/app/roadmap" className={LINK}>{route.doneCount} of {route.total} done · Open roadmap</Link>}
        />
        <RouteTrack route={route} arrivalDate={arrivalDate} now={now} height={96} />
      </Card>

      <div className="grid grid-cols-home gap-4 max-split:grid-cols-1">
        <Card aria-labelledby="next">
          <CardHead title="Up next" titleId="next" aside={<span className="text-small text-muted">{home.nextMeta}</span>} />
          {top ? (
            <>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-section">{top.title}</h3>
                {top.why && <p className="max-w-lede text-muted">{top.why}</p>}
              </div>
              <CardFoot className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-small text-muted">About {top.time}</span>
                <div className="flex gap-2 max-narrow:w-full max-narrow:flex-col-reverse">
                  <Link href={`${taskHref(top.taskId)}&ask=1`} className={buttonVariants({ variant: "quiet" })}>
                    Ask about this
                  </Link>
                  <Link href={taskHref(top.taskId)} className={buttonVariants()}>
                    Start task<span className="sr-only">: {top.title}</span>
                  </Link>
                </div>
              </CardFoot>
            </>
          ) : (
            <p className="text-muted">You have finished every task on your roadmap.</p>
          )}
        </Card>

        <Card as="aside" aria-labelledby="plan">
          <CardHead
            title="Your plan"
            titleId="plan"
            aside={<Link href="/settings" aria-label="Edit your plan" className={LINK}>Edit</Link>}
          />
          <dl className="m-0 grid grid-cols-plan items-baseline gap-x-3 gap-y-2">
            {home.plan.map(p => (
              <Fragment key={p.label}>
                <dt className="text-small text-muted">{p.label}</dt>
                <dd className="m-0 font-medium">{p.value}</dd>
              </Fragment>
            ))}
          </dl>
        </Card>

        <Card aria-labelledby="week">
          <CardHead title="Also this week" titleId="week" aside={<span className="text-small text-muted">{home.weekCount}</span>} />
          {home.week.length > 0 && (
            <Rows>
              {home.week.map(t => (
                <li key={t.taskId}>
                  <Link href={taskHref(t.taskId)} className={ROW}>
                    <Waypoint state={t.state === "blocked" ? "blocked" : "available"} />
                    <span title={t.title} className="min-w-0 flex-1 truncate font-medium max-narrow:whitespace-normal">{t.title}</span>
                    <span className={cn("max-w-1/3 truncate text-small text-muted", t.state !== "blocked" && "max-narrow:hidden")}>{t.meta}</span>
                  </Link>
                </li>
              ))}
            </Rows>
          )}
          {home.weekEmpty && <p className="text-muted">{home.weekEmpty}</p>}
          {home.nextLine ? (
            <p className="mt-auto text-small text-muted">{home.nextLine}</p>
          ) : (
            home.weekMore > 0 && (
              <Link href="/app/roadmap" className={cn(LINK, "mt-auto self-start")}>{home.weekMore} more this week · Open roadmap</Link>
            )
          )}
        </Card>

        <Card aria-labelledby="done">
          <CardHead
            title="Recently done"
            titleId="done"
            aside={home.recentTotal > 0 && <span className="text-small text-muted">{home.recentTotal} done</span>}
          />
          {home.recent.length > 0 ? (
            <>
              <Rows>
                {home.recent.map(d => (
                  <li key={d.taskId}>
                    <Link href={taskHref(d.taskId)} className={ROW}>
                      <Tick />
                      <span title={d.title} className="min-w-0 flex-1 truncate max-narrow:whitespace-normal">{d.title}</span>
                      <span className="text-small text-muted">{d.when}</span>
                    </Link>
                  </li>
                ))}
              </Rows>
              <Link href="/app/roadmap" className={cn(LINK, "mt-auto self-start")}>See all {home.recentTotal} done</Link>
            </>
          ) : (
            <>
              <p className="text-muted">Nothing yet. Tasks you finish show up here, newest first.</p>
              <Link href="/app/roadmap" className={cn(LINK, "mt-auto self-start")}>Already done some? Tick them off</Link>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

type Loaded = { home: Home; route: RouteView; arrivalDate: string; now: Date }

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
      const now = new Date()
      const route = buildRouteView(roadmap, profile.arrivalDate, now)
      setState({ route, home: buildHomeView(route, profile, { firstName }, now), arrivalDate: profile.arrivalDate, now })
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
        <>
          <main className="container-page py-6">
            {state === "down" ? <ApiDown onRetry={load} /> : <HomeView {...state} />}
          </main>
          <PublicFooter />
        </>
      )}
    </>
  )
}
