import { llmsIndex } from "@/lib/guide-markdown"
import { guides } from "@/lib/guides"

export const GET = () => new Response(llmsIndex(guides()), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
