import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// One primary per screen; secondary for other actions; ghost for in-row actions; text for a link-like action.
// Hover and pressed come from the state layer (globals.css `state`); disabled takes no layer.
const secondary = "border-border bg-surface text-fg state state-base-surface hover:text-fg"
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-medium whitespace-nowrap no-underline hover:no-underline [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-action bg-action text-fg-on-action state-inverse state-base-action hover:text-fg-on-action",
        secondary,
        /** @deprecated `quiet` is `secondary`; removed with the old token names */
        quiet: secondary,
        ghost: "border-transparent bg-transparent text-fg state hover:text-fg",
        danger: "border-danger bg-danger text-fg-on-action state-inverse state-base-danger hover:text-fg-on-action",
        "danger-ghost": "border-transparent bg-transparent text-danger state hover:text-danger",
        inverse: "border-transparent bg-transparent text-fg-on-inverse state-inverse hover:text-fg-on-inverse",
        // drawn as text; on phones an invisible ::after extends the tap area to 44 px
        text: "relative border-0 bg-transparent text-link after:absolute after:-inset-3 hover:text-link-hover hover:underline active:text-link-hover",
        disabled: "cursor-default border-surface-sunken bg-surface-sunken text-fg-muted",
      },
      size: {
        default: "min-h-10 px-4 max-narrow:min-h-11",
        sm: "min-h-8 px-3 text-ui max-narrow:min-h-11",
        lg: "min-h-12 px-6",
        icon: "size-10 px-0 max-narrow:min-h-11 max-narrow:min-w-11",
      },
    },
    compoundVariants: [{ variant: "text", class: "min-h-0 px-0 max-narrow:min-h-0" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type ButtonVariant = "primary" | "secondary" | "quiet" | "ghost" | "danger" | "danger-ghost" | "inverse" | "text"
// An icon-only button has no visible text, so it must carry an accessible name
type ButtonSize = { size?: "sm" | "default" | "lg" } | { size: "icon"; "aria-label": string }

function Button({
  className,
  variant = "primary",
  size = "default",
  disabled,
  ...props
}: ButtonPrimitive.Props & { variant?: ButtonVariant } & ButtonSize) {
  const v = disabled ? (variant === "text" ? "text" : "disabled") : variant
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant: v, size }), disabled && variant === "text" && "cursor-default text-fg-muted hover:text-fg-muted hover:no-underline", className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
