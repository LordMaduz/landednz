import { Logo } from "@/components/chrome/logo"
import { Waypoint } from "@/components/route/waypoint"
import { cn } from "@/lib/utils"
import type { WaypointState } from "@/lib/route-view"

// A static picture of the Roadmap on day 3. The figure's label is the one announcement.
const ROWS: { state: WaypointState; name: string; meta: string }[] = [
  { state: "done", name: "Open a bank account", meta: "Done 22 Oct" },
  { state: "current", name: "Apply for your IRD number", meta: "Next" },
  { state: "locked", name: "Give your employer a tax code", meta: "Needs your IRD number" },
  { state: "available", name: "Enrol with a GP", meta: "Month 1" },
]

export function RoadmapPreviewFigure() {
  return (
    <figure aria-label="Example: a roadmap on day 3" className="m-0 overflow-hidden rounded-card border border-border-subtle bg-surface shadow-raised">
      <div aria-hidden="true" className="flex h-12 items-center gap-4 border-b border-border-subtle px-4">
        <Logo size={20} />
        <span className="text-small text-fg-muted">Home</span>
        <span className="rounded-control bg-surface-sunken px-2 py-1 text-small font-medium">Roadmap</span>
      </div>
      <div aria-hidden="true" className="flex flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-section">Your roadmap</span>
          <span className="text-small text-fg-muted">7 of 20 tasks done</span>
        </div>
        <div>
          {ROWS.map(row => (
            <div key={row.name} className="preview-row">
              <Waypoint state={row.state} />
              <span className={cn("text-ui", row.state === "current" && "font-medium", row.state === "done" && "text-fg-muted")}>{row.name}</span>
              <span className="text-small text-fg-muted">{row.meta}</span>
            </div>
          ))}
        </div>
        <div className="ai">
          <div className="flex flex-col gap-2 p-4">
            <span className="text-small text-fg-muted">Read your roadmap, checked ird.govt.nz</span>
            <p className="text-body">Your passport, your visa details and your NZ bank account number. Yours is open, so you have everything.</p>
          </div>
        </div>
      </div>
    </figure>
  )
}
