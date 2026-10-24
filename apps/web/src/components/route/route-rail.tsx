"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RouteLeg, RouteTask } from "@/lib/route-view"
import { Waypoint } from "./waypoint"

const legDot = (leg: RouteLeg) =>
  leg.state === "done" ? "done" : leg.state === "current" ? "leg-now" : leg.state === "locked" ? "locked" : "available"

// The Roadmap's route: one vertical line through five legs; done and locked legs fold
export function RouteRail({
  legs,
  selectedTaskId,
  onOpen,
  renderCurrent,
}: {
  legs: RouteLeg[]
  selectedTaskId?: string
  onOpen(taskId: string): void
  renderCurrent?: (task: RouteTask) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState<Partial<Record<string, boolean>>>({})

  return (
    <ol className="route-legs m-0 list-none p-0" aria-label="Your route">
      {legs.map(leg => {
        const foldable = leg.state === "done" || leg.state === "locked"
        const open = expanded[leg.id] ?? !foldable
        const summary = `${leg.done} of ${leg.total} done, ${leg.when}`
        return (
          <li key={leg.id} className={cn(leg.state === "done" && "is-done", !open && "is-folded")}>
            <div className="route-step">
              <span className="route-dot" aria-hidden="true">
                <Waypoint state={legDot(leg)} />
              </span>
              <div className="flex min-h-11 flex-wrap items-center gap-x-4">
                <h2 className="text-body font-semibold">
                  {leg.name}
                  <span className="sr-only">: {summary}</span>
                </h2>
                <span aria-hidden="true" className="flex-1 text-small text-muted">
                  {summary}
                </span>
                {foldable && (
                  <Button
                    variant="ghost"
                    className="text-small"
                    aria-expanded={open}
                    onClick={() => setExpanded(e => ({ ...e, [leg.id]: !open }))}
                  >
                    {open ? "Hide" : "Show"}{" "}
                    <span className="sr-only">{leg.name} tasks</span>
                  </Button>
                )}
              </div>
            </div>
            {open && (
              <ol className="m-0 list-none p-0">
                {leg.tasks.map(task => {
                  const card = task.state === "current" && renderCurrent
                  return (
                    <li key={task.taskId} className="route-step">
                      <span className={cn("route-dot", card && "route-dot-card")} aria-hidden="true">
                        <Waypoint state={task.state} />
                      </span>
                      {card ? (
                        renderCurrent(task)
                      ) : (
                        <div className="pb-1">
                          <button
                            type="button"
                            onClick={() => onOpen(task.taskId)}
                            aria-current={task.taskId === selectedTaskId ? "true" : undefined}
                            className="flex min-h-11 w-full cursor-pointer flex-wrap items-baseline justify-between gap-x-4 rounded-control border-0 bg-transparent p-2 text-left text-ink hover:bg-wash aria-[current=true]:bg-wash"
                          >
                            <span className={cn("grow basis-60 font-medium", task.state === "done" && "text-muted")}>
                              {task.title}
                            </span>
                            <span className="text-small text-muted">{task.meta}</span>
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </li>
        )
      })}
    </ol>
  )
}
