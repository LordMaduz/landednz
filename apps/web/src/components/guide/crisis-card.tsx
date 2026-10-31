import { ChevronRight, Phone } from "lucide-react"

// Board "Distress": the same numbers as the API's GUIDE_CRISIS_TEXT (reply.test.tsx checks). Never animated (D10).
const ROWS = [
  { tel: "1737", label: "1737", note: "Free call or text, any time. Need to Talk?" },
  { tel: "0800543354", label: "0800 543 354", note: "Lifeline" },
  { tel: "111", label: "111", note: "In an emergency" },
]

export function CrisisCard() {
  return (
    <section aria-label="Support" className="flex flex-col gap-3 rounded-bar bg-ink p-4.5 text-white">
      <p className="text-body text-white/85">If you&apos;re struggling, you don&apos;t have to carry it alone.</p>
      {ROWS.map(r => (
        <a
          key={r.tel}
          href={`tel:${r.tel}`}
          className="flex min-h-11 items-center gap-3 rounded-surface bg-white/7 px-3 py-2.5 text-white no-underline hover:bg-white/12 hover:text-white active:bg-white/16"
        >
          <Phone className="size-4 text-mark" aria-hidden />
          <span className="flex flex-1 flex-col">
            <b className="text-section font-semibold tabular-nums">{r.label}</b>
            <small className="text-small text-rail-text">{r.note}</small>
          </span>
          <ChevronRight className="size-4 text-mark" aria-hidden />
        </a>
      ))}
    </section>
  )
}
