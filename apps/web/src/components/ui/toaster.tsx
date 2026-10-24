"use client"

import { Toaster as Sonner } from "sonner"

// Bottom centre, 4 s, hairline surface with the one shadow; the action is named again ("Marked as done", Undo)
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      duration={4000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center justify-between gap-4 rounded-surface border border-hairline bg-white py-2 pr-2 pl-4 text-body text-ink shadow-lift",
          actionButton:
            "inline-flex min-h-11 cursor-pointer items-center rounded-control border border-transparent bg-transparent px-4 font-medium text-ink hover:bg-wash",
        },
      }}
    />
  )
}
