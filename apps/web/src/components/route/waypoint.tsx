import { cn } from "@/lib/utils"
import type { WaypointState } from "@/lib/route-view"

// A route dot. Decorative: the row or leg next to it carries the words.
// "leg-now" is the current leg's head dot (12 px ink ring; the current task's dot is 16 px).
export function Waypoint({ state, size = "rail" }: { state: WaypointState | "leg-now"; size?: "rail" | "bead" }) {
  return <span data-waypoint={state} aria-hidden="true" className={cn("wp", `wp-${state}`, size === "bead" && "wp-bead")} />
}
