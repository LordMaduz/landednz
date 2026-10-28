"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHead } from "@/components/ui/card"
import type { RouteLeg, RouteTask } from "@/lib/route-view"
import { cn } from "@/lib/utils"
import { Waypoint } from "./waypoint"

const ROW = "flex min-h-10 w-full items-center gap-3 px-5 py-2 max-narrow:min-h-11 max-narrow:px-4"
const TASK_ROW = `${ROW} cursor-pointer border-0 bg-transparent text-left text-ink hover:bg-wash`
const RULED = "m-0 list-none p-0 [&>li]:border-t [&>li]:border-hairline"

// Rows run edge to edge inside a card: the li cancels the card padding
function Rows({ children }: { children: ReactNode }) {
  return <ol className={cn(RULED, "[&>li]:-mx-5 max-narrow:[&>li]:-mx-4")}>{children}</ol>
}

function TaskRow({ task, onOpen }: { task: RouteTask; onOpen(taskId: string): void }) {
  const now = task.state === "current"
  return (
    <li>
      <button type="button" className={TASK_ROW} onClick={() => onOpen(task.taskId)}>
        <Waypoint state={task.state} />
        <span className={cn("min-w-0 flex-1", now ? "font-semibold" : "font-medium", task.state === "done" && "text-muted")}>
          {task.title}
        </span>
        {now && <span className="text-small font-medium text-teal-text">Up next</span>}
        <span className={cn("text-small text-muted", now && "max-narrow:hidden")}>{now ? task.time : task.meta}</span>
      </button>
    </li>
  )
}

function OtherStage({ leg, onOpen }: { leg: RouteLeg; onOpen(taskId: string): void }) {
  const [open, setOpen] = useState(false)
  const done = leg.state === "done"
  return (
    <li>
      <div className={ROW}>
        <Waypoint state={done ? "done" : "available"} />
        <span className="min-w-0 flex-1 font-medium">{leg.name}</span>
        <span className="text-small text-muted max-narrow:hidden">
          {done ? `${leg.done} of ${leg.total} done` : `${leg.total} ${leg.total === 1 ? "task" : "tasks"} · ${leg.when}`}
        </span>
        <Button variant="quiet" size="sm" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? "Hide" : "Show"}{" "}
          <span className="sr-only">{leg.name} tasks</span>
        </Button>
      </div>
      {open && <ol className={RULED}>{leg.tasks.map(t => <TaskRow key={t.taskId} task={t} onOpen={onOpen} />)}</ol>}
    </li>
  )
}

// The Roadmap's stage cards: the current stage with every task, then the other stages folded
export function StageList({ legs, onOpen }: { legs: RouteLeg[]; onOpen(taskId: string): void }) {
  const current = legs.find(l => l.state === "current")
  // Stages still to come first, finished ones after
  const others = legs.filter(l => l !== current).sort((a, b) => Number(a.state === "done") - Number(b.state === "done"))
  return (
    <>
      {current && (
        <Card aria-labelledby="stage-now" className="border-ink">
          <CardHead
            title={current.name}
            titleId="stage-now"
            aside={<span className="text-small text-muted">{current.done} of {current.total} · {current.when}</span>}
          />
          <Rows>{current.tasks.map(t => <TaskRow key={t.taskId} task={t} onOpen={onOpen} />)}</Rows>
        </Card>
      )}
      {others.length > 0 && (
        <Card aria-labelledby="stage-other">
          <CardHead title="Other stages" titleId="stage-other" />
          <Rows>{others.map(l => <OtherStage key={l.id} leg={l} onOpen={onOpen} />)}</Rows>
        </Card>
      )}
    </>
  )
}
