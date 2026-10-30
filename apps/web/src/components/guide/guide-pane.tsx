"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { Maximize2, X } from "lucide-react"
import { askedOn, type Turn } from "@/lib/guide-turns"
import { useGuideStore } from "@/lib/stores/guideStore"
import { cn } from "@/lib/utils"
import { GuideMark } from "./ask-bar"
import { Composer } from "./composer"
import { Opening } from "./opening"
import { Banner, Reply } from "./reply"

// API default (config.guideDailyCap), only used if the cap arrives before the opening has loaded
const DEFAULT_CAP = 20

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-muted hover:bg-wash hover:text-ink max-pane:size-11"
    >
      {children}
    </button>
  )
}

export function GuideTitle() {
  return (
    <span className="flex items-center gap-2 text-section text-ink">
      <GuideMark />
      Guide
    </span>
  )
}

// The scrolling conversation: opening or turns, the cap/busy banner under them (pane, sheet and focused view)
export function Conversation({ turns, focus, className }: { turns: Turn[]; focus?: boolean; className?: string }) {
  const { opening, banner, historyLoaded, page, ask, retry, undoMemory, showAll } = useGuideStore()
  const now = new Date()
  const ref = useRef<HTMLDivElement>(null)
  // On open and on each new question, its heading goes to the top and the answer flows in below it, unfollowed,
  // so the question, its sources and a crisis card are read first
  useEffect(() => {
    const box = ref.current
    const all = box ? [...box.querySelectorAll<HTMLElement>("[data-turn]")] : []
    const newest = all.at(-1)
    if (!box || !newest) return
    // the newest turn is at least the pane's height (less its bottom padding), so the scroll can reach its heading
    all.forEach(t => (t.style.minHeight = ""))
    newest.style.minHeight = `${box.clientHeight - parseFloat(getComputedStyle(box).paddingBottom || "0")}px`
    box.scrollTop = newest.offsetTop
  }, [turns.length])
  // The banner joins the newest turn: drop its full-pane height so the question above stays in view with the banner
  useEffect(() => {
    const box = ref.current
    if (!banner || !box) return
    box.querySelectorAll<HTMLElement>("[data-turn]").forEach(t => (t.style.minHeight = ""))
    box.scrollTop = box.scrollHeight
  }, [banner])

  return (
    <div
      ref={ref}
      className={cn("guide-fade relative flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain pb-9", focus && "gap-8", className)}
    >
      {historyLoaded === "task" && turns.length > 0 && (
        <button type="button" onClick={() => void showAll()} className="min-h-8 cursor-pointer self-center text-small font-medium text-muted hover:text-ink max-narrow:min-h-11">
          Show all messages
        </button>
      )}
      {turns.length === 0 ? (
        <Opening opening={opening} onAsk={text => void ask(text)} />
      ) : (
        turns.map(t => (
          <Reply
            key={t.key}
            turn={t}
            focus={focus}
            meta={askedOn(t, page, now)}
            onRetry={() => void retry(t.key)}
            onFollowUp={text => void ask(text)}
            onUndoMemory={id => void undoMemory(id)}
          />
        ))
      )}
      {banner && <Banner banner={banner} dailyCap={opening?.dailyCap ?? DEFAULT_CAP} />}
    </div>
  )
}

// Pane contents (board "The pane on a task"): header, conversation, composer. The sheet reuses it without Expand.
export function GuidePane({ titles, sheet }: { titles: Record<string, string>; sheet?: boolean }) {
  const { turns, toggleExpanded, close } = useGuideStore()
  return (
    <>
      <div className={cn("flex shrink-0 items-center gap-1.5 pt-3.5 pr-3.5 pb-2.5 pl-5", sheet && "pt-2 pr-2.5 pl-4.5")}>
        <GuideTitle />
        <span className="flex-1" />
        {!sheet && (
          <IconButton label="Expand" onClick={toggleExpanded}>
            <Maximize2 className="size-4" aria-hidden />
          </IconButton>
        )}
        <IconButton label="Close" onClick={close}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
      <Conversation turns={turns} className={sheet ? "px-4.5 pt-1" : "px-6 pt-2"} />
      <div className={cn("shrink-0", sheet ? "guide-keyboard-pad px-2.5 pt-2" : "px-3.5 pt-2.5 pb-3.5")}>
        <Composer titles={titles} />
      </div>
    </>
  )
}
