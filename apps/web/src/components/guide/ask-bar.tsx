"use client"

import { useState, type Ref } from "react"
import { ArrowUp, Info } from "lucide-react"
import type { GuideScreen } from "@landednz/types"
import { useGuideStore } from "@/lib/stores/guideStore"
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

export const LIMIT_COPY = "No questions left today. You can ask again after midnight, NZ time."

// Board "Where you can ask": the only entry, floating at the bottom of Home, Roadmap and Task (D18, D19, D23).
// From 1024 px it is a box you type into (chat-window D1, D2, D9); below, a button that opens the sheet (D11)
export function AskBar({
  page,
  open,
  unseen,
  wide = false,
  onOpen,
  ref,
}: {
  page: GuideScreen
  open: boolean
  unseen: boolean
  wide?: boolean
  onOpen: () => void
  ref?: Ref<HTMLButtonElement | HTMLTextAreaElement>
}) {
  // sticky, not fixed: it floats at the window bottom while scrolling, then rests right under the page content. From 1024 px it clears the fixed 65 px footer (92 = 65 + 27).
  // While hidden the wrapper keeps its height so the phone footer doesn't jump; beside the open pane it goes, so the pane fits; clicks pass through its empty sides
  return (
    <div className={cn("pointer-events-none sticky bottom-7 z-30 mb-7 flex h-13 justify-center pane:bottom-23 max-narrow:bottom-17 max-narrow:h-12 max-narrow:px-3", wide && "h-auto min-h-13 items-end", page.kind === "task" && "max-narrow:hidden", open && "pane:hidden")}>
      {wide ? (
        <AskBox page={page} unseen={unseen} onOpen={onOpen} ref={ref as Ref<HTMLTextAreaElement>} />
      ) : (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          hidden={open}
          aria-expanded={open}
          aria-controls="guide-pane"
          onClick={onOpen}
          className={cn(
            "pointer-events-auto relative flex h-full w-ask-bar cursor-pointer items-center gap-3 rounded-bar bg-white pr-2.5 pl-3 text-ui text-muted shadow-bar hover:ring-1 hover:ring-teal/35 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
            // phone: full width above the tab bar; Task keeps its own bottom bar instead (D23)
            "max-narrow:w-full",
          )}
        >
          <GuideMark />
          {unseen && <i aria-hidden className="absolute top-2.5 left-8.5 size-1.75 rounded-full bg-teal ring-2 ring-white" />}
          <span className="flex-1 truncate text-left">
            {askLabel(page)}
            {unseen && <span className="sr-only">, new answer</span>}
          </span>
          <kbd aria-hidden className="rounded border border-border px-1.25 font-sans text-small text-muted max-narrow:hidden">
            /
          </kbd>
          <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-control bg-ink text-white">
            <ArrowUp className="size-4" />
          </span>
        </button>
      )}
    </div>
  )
}

function AskBox({ page, unseen, onOpen, ref }: { page: GuideScreen; unseen: boolean; onOpen: () => void; ref?: Ref<HTMLTextAreaElement> }) {
  const { draft, setDraft, askFromBar, hasConversation, opening, banner } = useGuideStore()
  const [empty, setEmpty] = useState(false)
  const limited = banner?.kind === "cap" || opening?.leftToday === 0
  const typed = draft.trim() !== ""
  const label = askLabel(page)

  const send = () => {
    if (!typed) return setEmpty(true)
    void askFromBar(draft)
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-ask-bar gap-3 rounded-bar py-2.5 pr-2.5 pl-3.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        typed ? "items-end" : "items-center",
        limited ? "bg-wash ring-1 ring-hairline" : "bg-white shadow-bar focus-within:ring-1 focus-within:ring-teal focus-within:outline-4 focus-within:outline-teal/12",
      )}
    >
      <p role="status" className="absolute bottom-full left-0 mb-2.5 empty:hidden">
        {empty && (
          <span className="flex items-center gap-2 rounded-control bg-white px-3 py-2 text-ui text-ink shadow-bar">
            <Info aria-hidden className="size-4 text-teal" />
            Type a question to start chatting.
          </span>
        )}
      </p>
      {hasConversation ? (
        <button type="button" aria-label="Open conversation" title="Open conversation" onClick={onOpen} className={cn("relative grid cursor-pointer place-items-center rounded-control after:absolute after:-inset-1", typed ? "mt-0.75 self-start" : "self-center")}>
          <GuideMark />
        </button>
      ) : (
        <GuideMark className={typed ? "mt-0.75 self-start" : "self-center"} />
      )}
      {unseen && (
        <i aria-hidden className="absolute top-3 left-7.75 size-1.75 rounded-full bg-teal ring-2 ring-white" />
      )}
      <textarea
        ref={ref}
        id="guide-ask"
        aria-label={unseen ? `${label}, new answer` : label}
        aria-keyshortcuts="/"
        rows={1}
        value={draft}
        disabled={limited}
        placeholder={limited ? LIMIT_COPY : label}
        onChange={e => {
          setDraft(e.target.value)
          setEmpty(false)
        }}
        onKeyDown={e => {
          if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return
          e.preventDefault()
          send()
        }}
        className="field-sizing-content max-h-18 min-h-6 flex-1 resize-none bg-transparent text-body text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
      {!typed && !limited && (
        <kbd aria-hidden className="self-center rounded border border-border px-1.25 font-sans text-small text-muted">
          /
        </kbd>
      )}
      {!limited && (
        <button
          type="button"
          aria-label="Send"
          disabled={!typed}
          onClick={send}
          className={cn("grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-white disabled:cursor-default", typed ? "bg-ink hover:bg-ink-hover" : "bg-border")}
        >
          <ArrowUp aria-hidden className="size-4" />
        </button>
      )}
    </div>
  )
}
