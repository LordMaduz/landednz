import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

// An AI reply: aurora hairline (flowing only while streaming), the one-line trace, then the answer.
// Markdown without raw HTML (react-markdown's default); aria-busy holds the announcement until it is complete.
export function AiReply({ text, trace, streaming }: { text: string; trace: string; streaming: boolean }) {
  return (
    <div className={cn("ai", streaming && "ai-streaming")}>
      <div aria-live="polite" aria-busy={streaming} className="flex flex-col gap-2 p-4">
        <span className="text-small text-muted">{trace}</span>
        <div className="md">
          <ReactMarkdown>{streaming ? `${text} …` : text}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
