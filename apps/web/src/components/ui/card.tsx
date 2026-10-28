import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

// Every landing card: white, hairline, radius 12, shadow-lift; padding 20 (16 on phones)
export function Card({ as: Tag = "section", className, ...props }: { as?: "section" | "div" | "aside" } & ComponentProps<"div">) {
  return (
    <Tag
      className={cn("flex min-w-0 flex-col gap-3.5 rounded-surface border border-hairline bg-white p-5 shadow-lift max-narrow:p-4", className)}
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
