"use client"

import { ArrowRight } from "lucide-react"
import type { GuideOpeningResponse } from "@landednz/types"

// Board "Opening" (D24): where you are (API copy, shown as it comes) and at most three starters
export function Opening({ opening, onAsk }: { opening: GuideOpeningResponse | null; onAsk: (text: string) => void }) {
  if (!opening) return null
  // Board hierarchy: the first sentence leads, the rest reads quieter. The API text is shown whole, only split
  const cut = opening.whereYouAre.search(/[.!?] /) + 1
  const lead = cut > 0 ? opening.whereYouAre.slice(0, cut) : opening.whereYouAre
  const rest = cut > 0 ? opening.whereYouAre.slice(cut + 1) : ""
  return (
    <div className="flex flex-col gap-2 pt-7 max-pane:pt-2">
      <h3 className="text-title text-balance text-ink">{lead}</h3>
      {rest && <p className="text-reading text-muted">{rest}</p>}
      {opening.starters.length > 0 && (
        <div className="mt-4.5 flex flex-col">
          {opening.starters.slice(0, 3).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onAsk(s)}
              className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-hairline px-1 py-3 text-left text-ui text-ink last:border-b hover:bg-wash"
            >
              {s}
              <ArrowRight className="ml-auto size-4 shrink-0 text-muted" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
