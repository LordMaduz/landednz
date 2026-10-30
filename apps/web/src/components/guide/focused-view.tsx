"use client"

import { useState, type KeyboardEvent } from "react"
import { ArrowLeft, Minimize2, X } from "lucide-react"
import type { GuideScreen } from "@landednz/types"
import { Button } from "@/components/ui/button"
import { useGuideStore } from "@/lib/stores/guideStore"
import { TASK_COPY } from "@/lib/task-copy"
import { cn } from "@/lib/utils"
import { Composer } from "./composer"
import { Conversation, GuideTitle, IconButton } from "./guide-pane"

const BACK: Record<GuideScreen["kind"], string> = { task: "Back to your task", roadmap: "Back to your roadmap", home: "Back to Home" }

// Board "Writing, and the focused view" (D8): a 280 px rail grouped by task and a 720 px reading column at 17 px
export function FocusedView({
  page,
  titles,
  onKeyDown,
}: {
  page: GuideScreen
  titles: Record<string, string>
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
}) {
  const { turns, context, historyLoaded, toggleExpanded, close, showAll } = useGuideStore()
  const [group, setGroup] = useState<string | null>(context.kind === "task" ? (context.taskKey ?? null) : null)
  const counts = new Map<string, number>()
  for (const t of turns) if (t.screen.taskKey) counts.set(t.screen.taskKey, (counts.get(t.screen.taskKey) ?? 0) + 1)
  const shown = group ? turns.filter(t => t.screen.taskKey === group) : turns
  const everything = () => {
    setGroup(null)
    if (historyLoaded !== "all") void showAll()
  }

  const row = (on: boolean) =>
    cn(
      "flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-control px-2.5 py-2 text-left text-ui text-ink hover:bg-white",
      on && "bg-white font-medium ring-1 ring-hairline",
    )

  return (
    <aside id="guide-pane" aria-label="Guide" onKeyDown={onKeyDown} className="container-page container-app sticky bottom-0 grid h-guide-pane grid-cols-focus self-end bg-white">
      <div className="flex min-h-0 flex-col gap-4.5 border-r border-hairline bg-wash px-4 py-5">
        <Button variant="quiet" size="sm" className="self-start" onClick={toggleExpanded}>
          <ArrowLeft className="size-3.5" aria-hidden />
          {BACK[page.kind]}
        </Button>
        <h2 className="px-2.5 text-small font-semibold text-muted">This conversation, by task</h2>
        <nav aria-label="This conversation, by task" className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
          {[...counts].map(([key, n]) => (
            <button key={key} type="button" aria-pressed={group === key} onClick={() => setGroup(key)} className={row(group === key)}>
              <span className="truncate">{titles[key] ?? TASK_COPY[key]?.title ?? key}</span>
              <small className="text-small text-muted">{n}</small>
            </button>
          ))}
          <button type="button" aria-pressed={group === null} onClick={everything} className={row(group === null)}>
            Everything <small className="text-small text-muted">{turns.length}</small>
          </button>
        </nav>
        <p className="mt-auto px-2.5 text-small text-muted">One conversation, on every device.</p>
      </div>
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-2 px-5 py-3.5">
          <GuideTitle />
          <span className="flex-1" />
          <IconButton label="Collapse" onClick={toggleExpanded}>
            <Minimize2 className="size-4" aria-hidden />
          </IconButton>
          <IconButton label="Close" onClick={close}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </div>
        <Conversation turns={shown} focus className="mx-auto w-full max-w-reading px-6 pt-3" />
        <div className="mx-auto w-full max-w-reading shrink-0 px-6 pt-3 pb-5.5">
          <Composer titles={titles} />
        </div>
      </div>
    </aside>
  )
}
