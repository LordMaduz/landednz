import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// The API-down pattern (States board): the same card on every page, progress is safe, one way forward
// heading: h2 when the page already has its h1
export function ApiDown({ onRetry, heading: Heading = "h1" }: { onRetry: () => void; heading?: "h1" | "h2" }) {
  return (
    <Card role="alert" className="items-start gap-3">
      <Heading className="text-section">Can&apos;t reach LandedNZ</Heading>
      <p className="text-muted">Your progress is saved. Check your connection, then try again.</p>
      <Button onClick={onRetry}>Try again</Button>
    </Card>
  )
}
