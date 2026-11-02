import { describe, expect, it } from "vitest"
import { guide, guides } from "@/lib/guides"
import { GET as full } from "./llms-full.txt/route"
import { GET as index } from "./llms.txt/route"

describe("llms files", () => {
  it("/llms.txt is plain text and links every guide", async () => {
    const res = index()
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toContain("text/plain")
    const body = await res.text()
    for (const g of guides()) expect(body).toContain(`/guides/${g.slug}`)
  })

  it("/llms-full.txt holds every guide, separated by rules", async () => {
    const res = full()
    expect(res.headers.get("content-type")).toContain("text/plain")
    const body = await res.text()
    for (const g of guides()) expect(body).toContain(`# ${guide(g.slug)!.name}\n`)
    expect(body.split("\n\n---\n\n")).toHaveLength(guides().length)
  })
})
