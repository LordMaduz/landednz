import { cn } from "@/lib/utils"
import type { RouteLeg } from "@/lib/route-view"
import { Waypoint } from "./waypoint"

// Home's horizontal route: one bead per task, legs sized by task count; on phones only the current leg is labelled
export function RouteStrip({ legs }: { legs: RouteLeg[] }) {
  return (
    <ol className="m-0 flex list-none gap-6 p-0 max-narrow:gap-2">
      {legs.map(leg => {
        const now = leg.state === "current"
        const count = `${leg.done} of ${leg.total}`
        return (
          <li key={leg.id} className="flex min-w-0 flex-col gap-4" style={{ flex: `${leg.total} 1 0` }}>
            <div className={cn("route-track", leg.state === "done" && "is-done")} aria-hidden="true">
              {leg.tasks.map(t => (
                <Waypoint key={t.taskId} state={t.state === "done" || t.state === "current" ? t.state : "available"} size="bead" />
              ))}
            </div>
            <div data-leg-label aria-hidden="true" className={cn("flex flex-col text-small whitespace-nowrap", !now && "max-narrow:hidden")}>
              <span className={cn("font-medium", now ? "text-ink" : "text-muted")}>{leg.name}</span>
              <span className="text-muted">{count}</span>
              <span className="text-muted">{leg.when}</span>
            </div>
            <span className="sr-only">{`${leg.name}: ${count} done`}</span>
          </li>
        )
      })}
    </ol>
  )
}
