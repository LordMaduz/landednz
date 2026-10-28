import { PublicFooter } from "@/components/chrome/public-footer"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Grey blocks in the shape of the cards while the page loads (no spinner)
export default function Loading() {
  return (
    <>
      <main aria-busy="true" className="container-page flex flex-col gap-4 py-6">
        <span className="sr-only">Loading</span>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-settings gap-4 max-split:grid-cols-1">
          <Card aria-hidden="true">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/5" />
          </Card>
          <Card aria-hidden="true">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/5" />
          </Card>
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
