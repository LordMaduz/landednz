"use client"

import { Fragment, useState, type KeyboardEvent } from "react"
import { ArrowLeft, ArrowRight, Minimize2, X } from "lucide-react"
import type { GuideScreen } from "@landednz/types"
import { Button } from "@/components/ui/button"
import { useGuideStore } from "@/lib/stores/guideStore"
import { TASK_COPY } from "@/lib/task-copy"
import { cn } from "@/lib/utils"
import { Composer } from "./composer"
import { Conversation, GuideTitle, IconButton } from "./guide-pane"

const BACK: Record<GuideScreen["kind"], string> = { task: "Back to your task", roadmap: "Back to your roadmap", home: "Back to Home" }

// Board "Writing, and the focused view" (D8): a 280 px rail (320 at 1280 and up, board guide-rail C) grouped by task and a 720 px reading column at 17 px
export function FocusedView({
  page,
  titles,
  onKeyDown,
}: {
  page: GuideScreen
  titles: Record<string, string>
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
}) {
  const { turns, context, historyLoaded, opening, toggleExpanded, close, showAll, ask } = useGuideStore()
  const onTask = page.kind === "task"
  // Try asking (D8): the opening's starters, minus the one the latest answer already offers as its follow-up
  const followUp = turns.at(-1)?.parts.find(p => p.type === "follow_up")?.text
  const starters = turns.length ? (opening?.starters ?? []).slice(0, 3).filter(s => s !== followUp) : []
  const [group, setGroup] = useState<string | null>(context.kind === "task" ? (context.taskKey ?? null) : null)
  const counts = new Map<string, number>()
  for (const t of turns) if (t.screen.taskKey) counts.set(t.screen.taskKey, (counts.get(t.screen.taskKey) ?? 0) + 1)
  const shown = group ? turns.filter(t => t.screen.taskKey === group) : turns
  const everything = () => {
    setGroup(null)
    if (historyLoaded !== "all") void showAll()
  }

  const questions = (n: number) => `${n} ${n === 1 ? "question" : "questions"}`
  // Board guide-rail C (open rail): plain rows; selected is a tint fill with a 3 px teal start bar, and keeps its tint on hover
  const row = (on: boolean) =>
    cn(
      "h-auto w-full flex-col items-start gap-0 border-0 py-2 text-left font-normal whitespace-normal state-base-surface",
      on && "relative bg-surface-selected state-base-surface-selected [--state-hover-pct:0%] before:absolute before:inset-y-2 before:left-0 before:w-0.75 before:rounded-r-full before:bg-accent",
    )
  const item = (title: string, n: number | null, on: boolean, onClick: () => void) => (
    <Button type="button" variant="ghost" size="sm" aria-pressed={on} onClick={onClick} title={title} className={row(on)}>
      <span className="line-clamp-2">{title}</span>
      {n !== null && <span className="text-small text-fg-muted">{questions(n)}</span>}
    </Button>
  )

  return (
    <aside id="guide-pane" aria-label="Guide" onKeyDown={onKeyDown} className="container-page container-app sticky top-14 grid h-guide-pane grid-cols-focus self-start bg-surface py-6">
      <div className="flex min-h-0 flex-col gap-5 border-r border-border-subtle bg-surface px-4 py-5">
        {/* Home and Roadmap have no side pane to go back to: Back closes the guide */}
        <Button variant="text" size="sm" className="-ml-2 self-start px-2 py-1 font-normal text-fg-muted hover:text-fg hover:no-underline active:text-fg" onClick={onTask ? toggleExpanded : close}>
          <ArrowLeft className="size-3.5" aria-hidden />
          {BACK[page.kind]}
        </Button>
        <div className="px-3">
          <h2 id="guide-by-task" className="text-small font-semibold text-fg-muted">This conversation, by task</h2>
          <p className="mt-0.5 text-small text-fg-muted">One conversation, on every device.</p>
        </div>
        <nav aria-labelledby="guide-by-task" className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
          {/* The total is only known once the whole conversation has loaded */}
          {item("All questions", historyLoaded === "all" ? turns.length : null, group === null, everything)}
          <div aria-hidden className="mx-3 my-2 h-px shrink-0 bg-border-subtle" />
          {[...counts].map(([key, n]) => (
            <Fragment key={key}>{item(titles[key] ?? TASK_COPY[key]?.title ?? key, n, group === key, () => setGroup(key))}</Fragment>
          ))}
        </nav>
        {starters.length > 0 && (
          <div className="flex flex-col">
            <h2 id="guide-try-asking" className="px-3 pb-0.5 text-small font-semibold text-fg-muted">Try asking</h2>
            <ul aria-labelledby="guide-try-asking" className="flex flex-col gap-0.5">
              {starters.map(s => (
                <li key={s}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void ask(s)}
                    className="h-auto w-full items-start justify-start gap-3 border-0 py-2 text-left font-normal whitespace-normal text-link state-base-surface hover:text-link-hover"
                  >
                    {s}
                    <ArrowRight className="mt-0.5 ml-auto size-4 shrink-0" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Owner 2026-10-31: the reading column is a hairline card (no shadow) 24 px from the rail divider, filling the column to the page edge; content fills the card */}
      <div className="ml-6 flex min-h-0 flex-col overflow-hidden rounded-card border border-border-subtle bg-surface">
        {/* Header, conversation and composer share the same 32 px sides, so the Guide mark lines up with the question and × with the composer edge */}
        <div className="flex shrink-0 items-center gap-2 px-8 py-4">
          <GuideTitle />
          <span className="flex-1" />
          {onTask && (
            <IconButton label="Collapse" onClick={toggleExpanded}>
              <Minimize2 className="size-4" aria-hidden />
            </IconButton>
          )}
          <IconButton label="Close" onClick={close}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </div>
        <Conversation turns={shown} focus className="w-full px-8 pt-3" />
        <div className="w-full shrink-0 px-8 pt-3 pb-4">
          <Composer titles={titles} />
        </div>
      </div>
    </aside>
  )
}
