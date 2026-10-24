import { Button } from "@/components/ui/button"

// The API-down pattern (board WorkspaceError): ink-bordered alert, progress is safe, one way forward
// heading: h2 when the page already has its h1
export function ApiDown({ onRetry, heading: Heading = "h1" }: { onRetry: () => void; heading?: "h1" | "h2" }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-surface border border-ink p-6">
      <Heading className="text-section">Can&apos;t reach LandedNZ</Heading>
      <p className="text-muted">Your progress is saved. Check your connection, then try again.</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}
