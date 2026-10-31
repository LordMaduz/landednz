"use client"

import { useState, type Ref } from "react"
import { ArrowUp, Info } from "lucide-react"
import type { GuideScreen } from "@landednz/types"
import { useGuideStore } from "@/lib/stores/guideStore"
import { Button } from "@/components/ui/button"
import { TASK_COPY } from "@/lib/task-copy"
import { cn } from "@/lib/utils"

// The guide's mark: a mint wave on an ink tile (board .mark)
export function GuideMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("grid size-5.5 shrink-0 place-items-center rounded-control bg-surface-inverse text-accent-bright", className)}>
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
  // sticky, not fixed: it floats at the window bottom while scrolling, then rests right under the page content.
  // While hidden the wrapper keeps its height so the phone footer doesn't jump; beside the open pane it goes, so the pane fits; clicks pass through its empty sides
  return (
    <div className={cn("pointer-events-none sticky bottom-7 z-30 mb-8 flex h-ask-bar-height justify-center max-narrow:bottom-17 max-narrow:px-3", wide && "h-auto min-h-ask-bar-height items-end", page.kind === "task" && "max-narrow:hidden", open && "pane:hidden")}>
      {wide ? (
        <AskBox page={page} unseen={unseen} onOpen={onOpen} ref={ref as Ref<HTMLTextAreaElement>} />
      ) : (
        <Button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          variant="secondary"
          hidden={open}
          aria-expanded={open}
          aria-controls="guide-pane"
          onClick={onOpen}
          className={cn(
            "pointer-events-auto relative h-full min-h-0 w-ask-bar justify-start gap-3 rounded-floating border-0 pr-3 pl-3 font-normal text-ui text-fg-muted shadow-floating hover:text-fg-muted max-narrow:min-h-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
            // phone: full width above the tab bar; Task keeps its own bottom bar instead (D23)
            "max-narrow:w-full",
          )}
        >
          <GuideMark />
          {unseen && <i aria-hidden className="absolute top-2.5 left-8.5 size-1.75 rounded-full bg-accent ring-2 ring-surface" />}
          <span className="flex-1 truncate text-left">
            {askLabel(page)}
            {unseen && <span className="sr-only">, new answer</span>}
          </span>
          <kbd aria-hidden className="rounded border border-border px-1 font-sans text-small text-fg-muted max-narrow:hidden">
            /
          </kbd>
          <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-control bg-surface-inverse text-fg-on-action">
            <ArrowUp className="size-4" />
          </span>
        </Button>
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
    if (limited) return
    if (!typed) return setEmpty(true)
    void askFromBar(draft)
  }

  return (
    <div
      data-ask-bar
      className={cn(
        "pointer-events-auto relative flex min-h-ask-bar-height w-ask-bar gap-3 rounded-floating py-2 pr-3 pl-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        typed ? "items-end" : "items-center",
        limited ? "bg-surface-sunken ring-1 ring-border-subtle" : "bg-surface shadow-floating focus-within:ring-1 focus-within:ring-accent focus-within:outline-4 focus-within:outline-accent/12",
      )}
    >
      <p role="status" className="absolute bottom-full left-0 mb-3 empty:hidden">
        {empty && (
          <span className="flex items-center gap-2 rounded-control bg-surface px-3 py-2 text-ui text-fg shadow-floating">
            <Info aria-hidden className="size-4 text-accent" />
            Type a question to start chatting.
          </span>
        )}
      </p>
      {hasConversation ? (
        <Button type="button" variant="ghost" size="icon" aria-label="Open conversation" title="Open conversation" onClick={onOpen} className={cn("relative size-auto border-0 after:absolute after:-inset-1", typed ? "mt-1 self-start" : "self-center")}>
          <GuideMark />
        </Button>
      ) : (
        <GuideMark className={typed ? "mt-1 self-start" : "self-center"} />
      )}
      {unseen && (
        <i aria-hidden className="absolute top-3 left-7.75 size-1.75 rounded-full bg-accent ring-2 ring-surface" />
      )}
      <textarea
        ref={ref}
        id="guide-ask"
        aria-label={unseen ? `${label}, new answer` : label}
        aria-keyshortcuts="/"
        rows={1}
        value={draft}
        // read-only, not disabled: it stays in the tab order, so keyboard and screen-reader users hear why
        readOnly={limited}
        aria-disabled={limited || undefined}
        aria-describedby={limited ? "guide-ask-limit" : undefined}
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
        className={cn("field-sizing-content max-h-18 min-h-6 flex-1 resize-none bg-transparent text-body text-fg outline-none placeholder:text-fg-muted aria-disabled:cursor-not-allowed")}
      />
      {limited && (
        <span id="guide-ask-limit" className="sr-only">
          {LIMIT_COPY}
        </span>
      )}
      {!typed && !limited && (
        <kbd aria-hidden className="self-center rounded border border-border px-1 font-sans text-small text-fg-muted">
          /
        </kbd>
      )}
      {!limited && (
        <Button
          type="button"
          size="icon"
          aria-label="Send"
          disabled={!typed}
          onClick={send}
          className="size-8 disabled:border-border disabled:bg-border disabled:text-fg-on-action"
        >
          <ArrowUp aria-hidden className="size-4" />
        </Button>
      )}
    </div>
  )
}
