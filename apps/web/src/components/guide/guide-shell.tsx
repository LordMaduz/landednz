"use client"

import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode, type RefObject } from "react"
import { Drawer } from "@base-ui/react/drawer"
import type { GuideScreen } from "@landednz/types"
import { useGuideStore } from "@/lib/stores/guideStore"
import { cn } from "@/lib/utils"
import { AskBar } from "./ask-bar"
import { FocusedView } from "./focused-view"
import { GuidePane } from "./guide-pane"

const WIDE = "(width >= 1024px)" // --breakpoint-pane: below it the guide is a sheet (D11)

function useWide() {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia?.(WIDE)
      mq?.addEventListener("change", cb)
      return () => mq?.removeEventListener("change", cb)
    },
    () => window.matchMedia?.(WIDE).matches ?? false,
    () => false,
  )
}

// "/" opens the guide, except while the user is typing somewhere (D22)
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

const composer = () => document.getElementById("guide-composer")

// Phone and tablet (D9): the pane as a bottom sheet, sized to the opening (at most 5/6 high), full height once there is a conversation
function GuideSheet({ titles, barRef }: { titles: Record<string, string>; barRef: RefObject<HTMLButtonElement | null> }) {
  const { open, turns, close } = useGuideStore()
  const full = turns.length > 0
  return (
    <Drawer.Root open={open} onOpenChange={o => !o && close()}>
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 bg-ink/20 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end">
            <Drawer.Popup
              id="guide-pane"
              aria-label="Guide"
              initialFocus={composer}
              finalFocus={barRef}
              className={cn(
                "guide-sheet-swipe flex w-full flex-col bg-white shadow-sheet outline-none transition-all duration-300 data-ending-style:translate-y-full data-starting-style:translate-y-full motion-reduce:transition-none",
                full ? "guide-safe-top h-full" : "max-h-5/6 rounded-t-pane",
              )}
            >
              {!full && <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />}
              <GuidePane titles={titles} sheet />
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  )
}

// Wraps the page area of Home, Roadmap and Task: <main> is the @container/page; the ask bar when closed,
// the pane beside the page from 1024 px (D11, D12), a sheet below, the focused view when expanded (D8)
export function GuideShell({
  page,
  titles,
  className,
  children,
}: {
  page: GuideScreen
  titles: Record<string, string>
  className?: string
  children: ReactNode
}) {
  const { open, expanded, unseen, page: current, setPage, openPane, close } = useGuideStore()
  const wide = useWide()
  const barRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(open)
  const { kind, taskKey } = page

  useEffect(() => {
    setPage({ kind, taskKey })
  }, [kind, taskKey, setPage])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const s = useGuideStore.getState()
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || s.open || !s.page) return
      e.preventDefault()
      void openPane()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [openPane])

  // B1: focus to the composer on open, back to the ask bar on close (the sheet does this through Drawer)
  useEffect(() => {
    if (open && wide) composer()?.focus()
    else if (!open && wasOpen.current) barRef.current?.focus()
    wasOpen.current = open
  }, [open, wide, expanded])

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // portalled popovers (citation preview) handle their own Escape
    if (e.key === "Escape" && e.currentTarget.contains(e.target as Node)) close()
  }
  const beside = open && wide

  return (
    <>
      <div className="flex w-full">
        <main
          data-guide={beside ? "open" : "closed"}
          hidden={beside && expanded}
          // pages keep space at the bottom so the ask bar never covers the last item (D19)
          className={cn("@container/page min-w-0 flex-1", className, "pb-28", kind !== "task" && "max-narrow:pb-36")}
        >
          {children}
        </main>
        {beside && expanded && <FocusedView page={page} titles={titles} onKeyDown={onKeyDown} />}
        {beside && !expanded && (
          <aside id="guide-pane" aria-label="Guide" onKeyDown={onKeyDown} className="sticky bottom-0 flex h-guide-pane shrink-0 self-end p-3">
            <div className="flex w-pane min-h-0 flex-col overflow-hidden rounded-pane bg-white shadow-pane pane-md:w-pane-md pane-lg:w-pane-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
              <GuidePane titles={titles} />
            </div>
          </aside>
        )}
      </div>
      {!wide && <GuideSheet titles={titles} barRef={barRef} />}
      {current && <AskBar ref={barRef} page={current} open={open} unseen={unseen} onOpen={() => void openPane()} />}
    </>
  )
}
