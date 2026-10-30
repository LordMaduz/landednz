"use client"

import type { Ref } from "react"
import { ArrowUp } from "lucide-react"
import type { GuideScreen } from "@landednz/types"
import { TASK_COPY } from "@/lib/task-copy"
import { cn } from "@/lib/utils"

// The guide's mark: a mint wave on an ink tile (board .mark)
export function GuideMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-5.5 shrink-0 place-items-center rounded-control bg-ink text-mark", className)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M3 15c3-3 6-3 9 0s6 3 9 0" />
      </svg>
    </span>
  )
}

// D18: the bar already says what you'd be asking about
export function askLabel(page: GuideScreen): string {
  if (page.kind === "home") return "Ask about your first 90 days"
  const topic = page.kind === "task" && page.taskKey ? TASK_COPY[page.taskKey]?.topic : undefined
  return topic ? `Ask about ${topic}` : "Ask about your roadmap"
}

// Board "Where you can ask": the only entry, floating at the bottom of Home, Roadmap and Task (D18, D19, D23)
export function AskBar({
  page,
  open,
  unseen,
  onOpen,
  ref,
}: {
  page: GuideScreen
  open: boolean
  unseen: boolean
  onOpen: () => void
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      type="button"
      hidden={open}
      aria-expanded={open}
      aria-controls="guide-pane"
      onClick={onOpen}
      className={cn(
        "fixed bottom-7 left-1/2 z-30 flex h-13 w-ask-bar -translate-x-1/2 cursor-pointer items-center gap-3 rounded-bar bg-white pr-2.5 pl-3 text-body text-muted shadow-bar hover:ring-1 hover:ring-teal/35 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        // phone: full width above the tab bar; Task keeps its own bottom bar instead (D23)
        "max-narrow:inset-x-3 max-narrow:bottom-17 max-narrow:h-12 max-narrow:w-auto max-narrow:translate-x-0",
        page.kind === "task" && "max-narrow:hidden",
      )}
    >
      <GuideMark />
      {unseen && <i aria-hidden className="absolute top-2.5 left-8.5 size-1.75 rounded-full bg-teal ring-2 ring-white" />}
      <span className="flex-1 truncate text-left">
        {askLabel(page)}
        {unseen && <span className="sr-only">, new answer</span>}
      </span>
      <kbd aria-hidden className="rounded border border-border px-1.25 font-sans text-citation text-muted max-narrow:hidden">
        /
      </kbd>
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-control bg-ink text-white">
        <ArrowUp className="size-4" />
      </span>
    </button>
  )
}
