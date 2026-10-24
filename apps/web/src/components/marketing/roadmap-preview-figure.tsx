import { Logo } from "@/components/chrome/logo"
import { Waypoint } from "@/components/route/waypoint"
import { cn } from "@/lib/utils"
import type { WaypointState } from "@/lib/route-view"

// A static picture of the Roadmap on day 3. The figure's label is the one announcement.
const ROWS: { state: WaypointState; name: string; meta: string }[] = [
  { state: "done", name: "Open a bank account", meta: "Done 22 Oct" },
  { state: "current", name: "Apply for your IRD number", meta: "Next" },
  { state: "blocked", name: "Give your employer a tax code", meta: "Needs your IRD number" },
  { state: "available", name: "Register with a GP", meta: "Month 1" },
]

export function RoadmapPreviewFigure() {
  return (
    <figure aria-label="Example: a roadmap on day 3" className="m-0 overflow-hidden rounded-surface border border-hairline bg-white shadow-lift">
      <div aria-hidden="true" className="flex h-12 items-center gap-4 border-b border-hairline px-4">
        <Logo size={20} />
        <span className="text-small text-muted">Home</span>
        <span className="rounded-control bg-wash px-2 py-1 text-small font-medium">Roadmap</span>
      </div>
      <div aria-hidden="true" className="flex flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-section">Your roadmap</span>
          <span className="text-small text-muted">7 of 20 tasks done</span>
        </div>
        <div>
          {ROWS.map(row => (
            <div key={row.name} className={cn("preview-row", row.state === "done" && "is-done")}>
              <Waypoint state={row.state} />
              <span className={cn(row.state === "current" ? "font-medium" : "text-small", row.state === "done" && "text-muted")}>{row.name}</span>
              <span className="text-small text-muted">{row.meta}</span>
            </div>
          ))}
        </div>
        <div className="ai">
          <div className="flex flex-col gap-2 p-4">
            <span className="text-small text-muted">Read your roadmap, checked ird.govt.nz</span>
            <p className="text-small">Your passport, your visa details and your NZ bank account number. Yours is open, so you have everything.</p>
          </div>
        </div>
      </div>
    </figure>
  )
}
