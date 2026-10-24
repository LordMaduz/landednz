import { cn } from "@/lib/utils"

// One answer in a question step: label + radio; chosen = teal border, inset teal hairline, wash
export function OptionRow({
  label,
  checked,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode }) {
  return (
    <label
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-4 rounded-control border border-border bg-white px-4 py-2 hover:bg-wash",
        checked && "border-teal bg-wash shadow-chosen",
        className,
      )}
    >
      <input type="radio" checked={checked} className="m-0 size-4 accent-teal" {...props} />
      {label}
    </label>
  )
}
