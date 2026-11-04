import { guideMarkdown } from "@/lib/guide-markdown"
import { guide, guides } from "@/lib/guides"

export const GET = () =>
  new Response(guides().map(g => guideMarkdown(guide(g.slug)!)).join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
