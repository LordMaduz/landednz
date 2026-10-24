import { Button } from "@/components/ui/button"
import type { RouteTask } from "@/lib/route-view"

// The current task, opened up on the route: why it matters and the page's one primary action
export function NextTaskCard({ task, onOpen }: { task: RouteTask; onOpen(taskId: string): void }) {
  return (
    <article className="mt-2 mb-4 flex flex-col gap-4 rounded-surface border border-hairline p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-section">{task.title}</h3>
        {task.why && <p className="text-muted">{task.why}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => onOpen(task.taskId)} className="max-narrow:w-full">
          Start<span className="sr-only">: {task.title}</span>
        </Button>
        <span className="text-small text-muted">{task.time}</span>
      </div>
    </article>
  )
}
