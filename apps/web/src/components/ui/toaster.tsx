"use client"

import { Toaster as Sonner } from "sonner"

// Inverse toast, bottom centre, 6 s; sonner holds it while hovered or focused. The action is a link-on-inverse text button.
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={6000}
      icons={{
        success: (
          <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-avatar">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-fg-accent">
              <path d="M2.2 5.2 4.2 7.1 7.8 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-card bg-surface-inverse py-2 pr-2 pl-4 text-ui text-fg-on-action shadow-raised",
          icon: "flex",
          actionButton:
            "ml-auto inline-flex shrink-0 whitespace-nowrap min-h-10 cursor-pointer items-center rounded-control border-0 bg-transparent px-3 font-semibold text-link-on-inverse state-inverse state-base-surface-inverse max-narrow:min-h-11",
        },
      }}
    />
  )
}
