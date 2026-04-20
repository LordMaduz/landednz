import { Skeleton } from '@/components/ui/Skeleton'

function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border border-border rounded-card mb-2">
      <Skeleton variant="circle" className="w-6 h-6 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text-line" width="w-1/2" />
        <Skeleton variant="text-line" width="w-3/4" />
      </div>
      <Skeleton variant="text-line" width="w-16" className="h-5" />
    </div>
  )
}

export default function RoadmapLoading() {
  return (
    <div>
      {/* Hero card */}
      <Skeleton variant="card" className="mb-6 h-32" />

      {/* "Do these first" label + 3 priority task rows */}
      <Skeleton variant="text-line" width="w-40" className="mb-4 h-5" />
      {[1, 2, 3].map((i) => (
        <TaskRowSkeleton key={i} />
      ))}

      {/* Filter tabs */}
      <Skeleton variant="text-line" width="w-64" className="my-6 h-9 rounded-full" />

      {/* Phase header + 2 task rows */}
      <Skeleton variant="text-line" width="w-32" className="mb-3 h-5" />
      {[1, 2].map((i) => (
        <TaskRowSkeleton key={i} />
      ))}
    </div>
  )
}
