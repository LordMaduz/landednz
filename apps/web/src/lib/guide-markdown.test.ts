import { describe, expect, it } from "vitest"
import { guide, guides } from "./guides"
import { guideMarkdown, llmsIndex } from "./guide-markdown"
import { SITE_URL } from "./site"

const base = guide("get-ird-number")!

describe("guideMarkdown", () => {
  it("renders heading, date, numbered steps and linked sources", () => {
    const md = guideMarkdown(base)
    expect(md.startsWith(`# ${base.name}\n`)).toBe(true)
    expect(md).toContain(`Last checked ${base.checkedAt}`)
    expect(md).toContain(`1. ${base.steps[0].text}`)
    for (const s of base.sources) expect(md).toContain(`- [${s.title}](${s.url}) (${s.agency})`)
    expect(md).toContain(`${SITE_URL}/guides/${base.slug}`)
  })

  it("leaves out empty sections", () => {
    const md = guideMarkdown({ ...base, documents: [], cost: undefined, advice: undefined })
    expect(md).not.toContain("## Documents")
    expect(md).not.toContain("## Cost")
    expect(md).not.toContain("## When to get advice")
    expect(md).toContain("## Steps")
  })

  it("passes <, | and backticks through verbatim", () => {
    const text = "a < b | `c`"
    expect(guideMarkdown({ ...base, steps: [{ ...base.steps[0], text }] })).toContain(`1. ${text}`)
  })
})

describe("llmsIndex", () => {
  it("lists every guide under its leg with absolute links", () => {
    const items = guides()
    const md = llmsIndex(items)
    expect(md.startsWith("# LandedNZ\n\n> ")).toBe(true)
    for (const g of items) expect(md).toContain(`- [${g.name}](${SITE_URL}/guides/${g.slug})`)
    for (const leg of new Set(items.map(g => g.legName))) expect(md).toContain(`## ${leg}`)
    expect(md).toContain(`## Optional\n\n- [About LandedNZ](${SITE_URL}/about)`)
  })
})
