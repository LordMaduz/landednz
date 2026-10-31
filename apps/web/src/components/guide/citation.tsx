import { Popover } from "@base-ui/react/popover"
import { ExternalLink } from "lucide-react"
import type { ReplyPart } from "@landednz/types"
import { shortDate } from "@/lib/nz-date"

export type SourcePart = Extract<ReplyPart, { type: "source" }>

export const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, "")

// Numbered chip after a sentence; hover, tap or Enter shows the page, domain and checked date (D4)
export function Citation({ source }: { source: SourcePart }) {
  const domain = domainOf(source.url)
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={200}
        aria-label={`Source ${source.index}`}
        className="ml-1 inline-flex h-4.5 min-w-4.5 cursor-pointer items-center justify-center rounded-control bg-surface-selected px-1 relative -top-0.5 text-small font-semibold leading-none text-fg-accent state state-base-surface-selected data-popup-open:shadow-chosen"
      >
        {source.index}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="z-50">
          <Popover.Popup className="flex w-75 flex-col gap-2 rounded-card bg-surface p-4 shadow-floating outline-none">
            <small className="text-small text-fg-muted">
              {domain} · checked {shortDate(source.checkedAt.slice(0, 10))}
            </small>
            <Popover.Title className="text-section">{source.title}</Popover.Title>
            <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-small font-medium">
              Open on {domain}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
