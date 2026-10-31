import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

// One card: surface, subtle border, card radius, card padding (20; 16 on phones). `raised` (default) adds the raised shadow.
export function Card({
  as: Tag = "section",
  variant = "raised",
  className,
  ...props
}: { as?: "section" | "div" | "aside"; variant?: "plain" | "raised" } & ComponentProps<"div">) {
  return (
    <Tag
      className={cn("flex min-w-0 flex-col gap-4 rounded-card border border-border-subtle bg-surface p-card-padding", variant === "raised" && "shadow-raised", className)}
      {...props}
    />
  )
}

export function CardHead({ title, titleId, aside }: { title: ReactNode; titleId: string; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={titleId} className="shrink-0 text-section">{title}</h2>
      {aside}
    </div>
  )
}

export function CardFoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-auto", className)}>{children}</div>
}
