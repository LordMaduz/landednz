import { cn } from "@/lib/utils"

// A wash block in the shape of what is loading; hidden for the first 300 ms (see .skeleton in globals.css)
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block rounded-control bg-wash", className)} />
}
