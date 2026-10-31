"use client"

import { ArrowRight } from "lucide-react"
import type { GuideOpeningResponse } from "@landednz/types"
import { Button } from "@/components/ui/button"

// Board "Opening" (D24): where you are (API copy, shown as it comes) and at most three starters
export function Opening({ opening, onAsk }: { opening: GuideOpeningResponse | null; onAsk: (text: string) => void }) {
  if (!opening) return null
  // Board hierarchy: the first sentence leads, the rest reads quieter. The API text is shown whole, only split
  const cut = opening.whereYouAre.search(/[.!?] /) + 1
  const lead = cut > 0 ? opening.whereYouAre.slice(0, cut) : opening.whereYouAre
  const rest = cut > 0 ? opening.whereYouAre.slice(cut + 1) : ""
  return (
    <div className="flex flex-col gap-2 pt-8 max-pane:pt-2">
      <h3 className="text-title text-balance text-fg">{lead}</h3>
      {rest && <p className="text-reading text-fg-muted">{rest}</p>}
      {opening.starters.length > 0 && (
        <div className="mt-5 flex flex-col">
          {opening.starters.slice(0, 3).map(s => (
            <Button
              key={s}
              type="button"
              variant="ghost"
              onClick={() => onAsk(s)}
              className="h-auto min-h-target justify-start gap-3 rounded-none border-0 border-t border-border-subtle px-1 py-3 text-left font-normal whitespace-normal text-ui last:border-b"
            >
              {s}
              <ArrowRight className="ml-auto size-4 shrink-0 text-fg-muted" aria-hidden />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
