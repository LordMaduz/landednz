import { useId } from "react"

// One Settings row: what it is on the left, its controls on the right (stacked ≤860)
export function SettingsSection({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="grid grid-cols-settings gap-12 border-t border-hairline py-8 max-split:grid-cols-1 max-split:gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id={id} className="text-section">{title}</h2>
        <p className="text-muted">{lede}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </section>
  )
}
