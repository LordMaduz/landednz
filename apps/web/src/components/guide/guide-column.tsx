"use client"

import { useContext, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react"
import { useGuideStore } from "@/lib/stores/guideStore"
import { GuidePane } from "./guide-pane"
import { GuideTitles, useWide } from "./guide-shell"

// Task's right column (chat-window D5): from 1024 px the open guide takes the place of the task actions, so the
// task card never moves. Below 1024 the guide is the sheet and the actions stay.
export function GuideColumn({ strip, children }: { strip: ReactNode; children: ReactNode }) {
  const { open, expanded, close } = useGuideStore()
  const titles = useContext(GuideTitles)
  const wide = useWide()
  const ref = useRef<HTMLElement>(null)
  const chat = open && wide && !expanded

  // Board: 24 px under the header and 24 px above the footer. At rest the column starts lower (under the
  // breadcrumb), so the height follows its top until it sticks
  useLayoutEffect(() => {
    const el = ref.current
    if (!chat || !el) return
    const fit = () => {
      const gap = parseFloat(getComputedStyle(el).top) || 0
      el.style.height = `${window.innerHeight - gap - Math.max(el.getBoundingClientRect().top, gap)}px`
    }
    fit()
    window.addEventListener("scroll", fit, { passive: true })
    window.addEventListener("resize", fit)
    return () => {
      window.removeEventListener("scroll", fit)
      window.removeEventListener("resize", fit)
    }
  }, [chat])

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // portalled popovers (citation preview) handle their own Escape
    if (e.key === "Escape" && e.currentTarget.contains(e.target as Node)) close()
  }

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {chat ? "Guide opened" : ""}
      </p>
      {chat ? (
        <aside
          ref={ref}
          id="guide-pane"
          aria-label="Guide"
          onKeyDown={onKeyDown}
          className="sticky top-22 flex min-h-0 flex-col overflow-hidden rounded-floating bg-surface shadow-overlay motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        >
          <GuidePane titles={titles} strip={strip} onBack={close} />
        </aside>
      ) : (
        children
      )}
    </>
  )
}
