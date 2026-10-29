import { cn } from "@/lib/utils"

// Text input: 40 px target (44 under 561 px), control border (3:1 against white)
export const fieldClass =
  "min-h-10 max-narrow:min-h-11 w-full rounded-control border border-control bg-white px-4 text-body text-ink placeholder:text-muted disabled:bg-wash"

export function Field({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="field" className={cn(fieldClass, className)} {...props} />
}
