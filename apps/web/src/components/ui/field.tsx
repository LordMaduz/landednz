import { cn } from "@/lib/utils"

// Text input: 40 px target (44 under 561 px), strong border (3:1 against white), error ring from the danger role
export const fieldClass =
  "min-h-control w-full rounded-control border border-border-strong bg-surface px-4 text-body text-fg placeholder:text-fg-muted disabled:bg-surface-sunken aria-invalid:border-danger aria-invalid:shadow-error"

export function Field({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="field" className={cn(fieldClass, className)} {...props} />
}
