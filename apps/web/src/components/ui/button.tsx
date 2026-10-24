import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// One primary per screen; quiet for secondary actions; ghost for in-row actions
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-medium whitespace-nowrap no-underline hover:no-underline [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border-ink bg-ink text-white hover:bg-ink-hover hover:text-white",
        quiet: "border-border bg-white text-ink hover:bg-wash hover:text-ink",
        ghost: "border-transparent bg-transparent text-ink hover:bg-wash hover:text-ink",
        disabled: "cursor-default border-wash bg-wash text-muted",
      },
      size: {
        default: "min-h-11 px-4",
        lg: "min-h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type ButtonVariant = "primary" | "quiet" | "ghost"

function Button({
  className,
  variant = "primary",
  size = "default",
  disabled,
  ...props
}: ButtonPrimitive.Props & { variant?: ButtonVariant; size?: VariantProps<typeof buttonVariants>["size"] }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled}
      className={cn(buttonVariants({ variant: disabled ? "disabled" : variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
