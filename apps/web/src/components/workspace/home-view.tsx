"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Loading from "@/app/app/loading"
import { ApiDown } from "@/components/chrome/api-down"
import { AppHeader, type HeaderUser } from "@/components/chrome/app-header"
import { PublicFooter } from "@/components/chrome/public-footer"
import { GuideShell } from "@/components/guide/guide-shell"
import { RouteTrack } from "@/components/route/route-track"
import { Waypoint } from "@/components/route/waypoint"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardFoot, CardHead } from "@/components/ui/card"
import { getOnboardingProfile, getRoadmap } from "@/lib/api"
import { buildHomeView, type HomeView as Home } from "@/lib/home-view"
import { buildRouteView, taskTitles, type RouteView } from "@/lib/route-view"
import { useGuideStore } from "@/lib/stores/guideStore"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const taskHref = (taskId: string) => `/app/roadmap?task=${taskId}`

const ROW =
  "flex min-h-10 items-center gap-3 px-5 py-2 text-fg no-underline hover:bg-surface-sunken hover:text-fg hover:no-underline max-narrow:min-h-11 max-narrow:px-4"
const LINK = "inline-flex min-h-6 items-center text-small font-medium"

// Rows run edge to edge inside a card: the li cancels the card padding
function Rows({ children }: { children: ReactNode }) {
  return <ol className="m-0 list-none p-0 [&>li]:-mx-5 [&>li]:border-t [&>li]:border-border-subtle max-narrow:[&>li]:-mx-4">{children}</ol>
}

function Tick() {
  return (
    <span aria-hidden="true" className="flex size-4 flex-none items-center justify-center rounded-full bg-avatar text-fg-accent">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.2 5.2 4.2 7.1 7.8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

// Wide on desktop, hidden on phones (and the other way round for `Phone`)
const Wide = ({ children }: { children: ReactNode }) => <span className="max-narrow:hidden">{children}</span>
const Phone = ({ children }: { children: ReactNode }) => <span className="hidden max-narrow:inline">{children}</span>

export function HomeView({ home, route, arrivalDate, now }: { home: Home; route: RouteView; arrivalDate: string; now: Date }) {
  const { top } = home
  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="hello" className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 id="hello" className="text-title">{home.greeting}</h1>
        <p className="text-fg-muted max-narrow:w-full">
          <Phone>{home.sublineShort}</Phone>
          <Wide>{home.subline}</Wide>
        </p>
      </section>

      <Card aria-labelledby="route" className="max-narrow:gap-2">
        <div className="max-narrow:hidden">
          <CardHead title="Your 90 days" titleId="route" aside={<Link href="/app/roadmap" className={LINK}>Open roadmap</Link>} />
        </div>
        <RouteTrack route={route} arrivalDate={arrivalDate} now={now} variant="compact" />
      </Card>

      <div className="grid grid-cols-home gap-4 max-split:grid-cols-1 @max-guide-home/page:grid-cols-1">
        <Card aria-labelledby="next">
          {top ? (
            <>
              <h2 id="next" className="text-small font-semibold text-fg-accent">
                <Phone>{home.nextMetaShort}</Phone>
                <Wide>{home.nextMeta}</Wide>
              </h2>
              <div className="flex flex-col gap-2">
                <h3 className="text-featured">{top.title}</h3>
                {top.why && <p className="max-w-lede text-body text-fg-muted">{top.why}</p>}
                {home.unlocks.length > 0 && (
                  <p className="text-small text-fg-muted max-narrow:hidden">Unlocks: {home.unlocks.join(" · ")}</p>
                )}
              </div>
              <CardFoot className="flex gap-2 pt-1">
                <Link href={taskHref(top.taskId)} className={buttonVariants({ className: "min-h-11 max-narrow:flex-1" })}>
                  Start task<span className="sr-only">: {top.title}</span>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => useGuideStore.getState().openPane({ kind: "task", taskKey: top.taskId })}
                  className="min-h-11"
                >
                  <Wide>Ask about this</Wide>
                  <Phone>Ask</Phone>
                </Button>
              </CardFoot>
            </>
          ) : (
            <>
              <CardHead title="Your next move" titleId="next" />
              <p className="text-fg-muted">You have finished every task on your roadmap.</p>
            </>
          )}
        </Card>

        <Card aria-labelledby="week">
          <CardHead
            title="Then this week"
            titleId="week"
            aside={
              <>
                <span className="text-small text-fg-muted max-narrow:hidden">{home.weekAside}</span>
                {home.weekTotal > 0 && (
                  <Link href="/app/roadmap" className={cn(LINK, "hidden max-narrow:inline-flex")}>
                    {home.weekTotal} {home.weekTotal === 1 ? "task" : "tasks"}
                  </Link>
                )}
              </>
            }
          />
          {home.week.length > 0 && (
            <Rows>
              {home.week.map(({ task: t, meta }, i) => (
                <li key={t.taskId} className={cn(i > 1 && "max-narrow:hidden")}>
                  <Link href={taskHref(t.taskId)} className={ROW}>
                    <Waypoint size="mark" state={t.state === "blocked" ? "blocked" : "available"} />
                    <span title={t.title} className="min-w-0 flex-1 truncate font-medium max-narrow:whitespace-normal">{t.title}</span>
                    <span className="flex-none text-small text-fg-muted max-narrow:hidden">{meta}</span>
                  </Link>
                </li>
              ))}
            </Rows>
          )}
          {home.weekEmpty && <p className="text-fg-muted">{home.weekEmpty}</p>}
          {home.nextLine ? (
            <p className="mt-auto text-small text-fg-muted">{home.nextLine}</p>
          ) : (
            home.weekFoot && <Link href="/app/roadmap" className={cn(LINK, "mt-auto self-start max-narrow:hidden")}>{home.weekFoot}</Link>
          )}
        </Card>
      </div>

      <Card aria-labelledby="done">
        <CardHead
          title="Recently done"
          titleId="done"
          aside={
            home.recentTotal > 0 && (
              <>
                <span className="text-small text-fg-muted max-narrow:hidden">
                  {home.recentTotal} {home.recentTotal === 1 ? "task" : "tasks"} done ·{" "}
                  <Link href="/app/roadmap?done=1" className="font-semibold">Show all</Link>
                </span>
                <Link href="/app/roadmap?done=1" className={cn(LINK, "hidden max-narrow:inline-flex")}>Show all {home.recentTotal}</Link>
              </>
            )
          }
        />
        {home.recent.length > 0 ? (
          <ol className="m-0 grid list-none grid-cols-4 p-0 max-narrow:grid-cols-1">
            {home.recent.map((d, i) => (
              <li
                key={d.taskId}
                className={cn(
                  "min-w-0 border-l border-border-subtle px-4 first:border-l-0 first:pl-0 last:pr-0",
                  "max-narrow:border-l-0 max-narrow:border-t max-narrow:px-0 max-narrow:first:border-t-0",
                  i > 1 && "max-narrow:hidden",
                )}
              >
                <Link href={taskHref(d.taskId)} className="flex items-start gap-3 py-1 text-fg no-underline hover:text-fg hover:underline max-narrow:min-h-11 max-narrow:items-center">
                  <Tick />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span>{d.title}</span>
                    <span className="text-small text-fg-muted max-narrow:hidden">{d.when}</span>
                  </span>
                  <span className="hidden text-small text-fg-muted max-narrow:inline">{d.weekday}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <p className="text-fg-muted">Nothing yet. Tasks you finish show up here, newest first.</p>
            <Link href="/app/roadmap" className={cn(LINK, "mt-auto self-start")}>Already done some? Tick them off</Link>
          </>
        )}
      </Card>
    </div>
  )
}

type Loaded = { home: Home; route: RouteView; arrivalDate: string; now: Date }

// Fetches profile and roadmap with the browser session, like the Roadmap page
export function HomeScreen({ user }: { user: HeaderUser }) {
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
      setState({ route, home: buildHomeView(route, profile, now), arrivalDate: profile.arrivalDate, now })
    } catch (err) {
      if ((err as { status?: number }).status === 404) return router.replace("/onboarding?step=1")
      setState("down")
    }
  }, [router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount; load sets state after awaiting
    load()
  }, [load])

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader active="home" user={user} />
      {state === "loading" ? (
        <Loading />
      ) : (
        <>
          {state === "down" ? (
            <main className="container-page container-app py-6">
              <ApiDown onRetry={load} />
            </main>
          ) : (
            <GuideShell page={{ kind: "home" }} titles={taskTitles(state.route)} className="container-page container-app py-6">
              <HomeView {...state} />
            </GuideShell>
          )}
          <PublicFooter app />
        </>
      )}
    </div>
  )
}
