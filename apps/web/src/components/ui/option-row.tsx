import { cn } from "@/lib/utils"

// One answer in a question step: label + radio; state layer on hover and press; chosen = selected surface, accent edge
export function OptionRow({
  label,
  checked,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-4 rounded-control border border-border bg-surface px-4 py-2 state state-base-surface",
        checked && "border-accent bg-surface-selected shadow-chosen state-base-surface-selected",
        className,
      )}
    >
      <input type="radio" checked={checked} className="radio" {...props} />
      {label}
    </label>
  )
}
