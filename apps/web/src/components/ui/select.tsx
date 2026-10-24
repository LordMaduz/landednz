import { cn } from "@/lib/utils"
import { fieldClass } from "./field"

// Native select with the board's inline chevron (no data: URI)
export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select data-slot="select" className={cn(fieldClass, "cursor-pointer appearance-none pr-12", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 stroke-muted"
      >
        <path d="m4 6 4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
