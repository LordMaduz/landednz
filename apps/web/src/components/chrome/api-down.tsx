import { Button } from "@/components/ui/button"

// The API-down pattern (board WorkspaceError): ink-bordered alert, progress is safe, one way forward
export function ApiDown({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-surface border border-ink p-6">
      <h1 className="text-section">Can&apos;t reach LandedNZ</h1>
      <p className="text-muted">Your progress is saved. Check your connection, then try again.</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}
