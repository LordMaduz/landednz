import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ORG_ID } from "@/lib/brand-schema"
import { guide, guides } from "@/lib/guides"
import GuidePage, { generateMetadata, generateStaticParams } from "./page"

const notFound = vi.hoisted(() => vi.fn(() => { throw new Error("NEXT_NOT_FOUND") }))
vi.mock("next/navigation", () => ({ notFound }))
const props = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe("/guides/[slug]", () => {
  it("renders one guide with its sections, one Start link and grouped sources", async () => {
    const { container } = render(await GuidePage(props("get-ird-number")))
    const g = guide("get-ird-number")!
    expect(screen.getByRole("heading", { level: 1, name: g.name })).toBeTruthy()
    expect(screen.getByText(`Last checked ${g.checkedAt}`)).toBeTruthy()
    for (const h of ["Why it matters", "Steps", "Documents you'll need", "Common mistakes", "Watch out for", "Sources"]) expect(screen.getByRole("heading", { level: 2, name: h })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Cost" })).toBeNull() // T08 has no cost: empty sections are left out
    expect(screen.getAllByRole("listitem").length).toBeGreaterThan(g.steps.length)
    const start = screen.getAllByRole("link", { name: "Start free" })
    expect(start).toHaveLength(1)
    expect(start[0].getAttribute("href")).toBe("/onboarding")
    expect(screen.getByText(`This is 1 of ${guides().length} things to sort out when you move.`)).toBeTruthy()
    for (const s of g.sources) expect(screen.getByRole("link", { name: s.title }).getAttribute("href")).toBe(s.url)
    expect(container.querySelector("ol")!.children).toHaveLength(g.steps.length)
  })

  it("shows Cost and When to get advice when a guide has them", async () => {
    render(await GuidePage(props("sign-rental-protect-bond")))
    expect(screen.getByRole("heading", { name: "Cost" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "When to get advice" })).toBeTruthy()
  })

  it("emits Article and BreadcrumbList JSON-LD with absolute URLs", async () => {
    const { container } = render(await GuidePage(props("get-ird-number")))
    const [article, crumbs] = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)["@graph"]
    expect(article).toMatchObject({ "@type": "Article", headline: "Get your IRD number", author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID } })
    expect(article.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Guides", "Get your IRD number"])
    for (const i of crumbs.itemListElement) expect(i.item).toMatch(/^https?:\/\//)
  })

  it("sets a canonical URL and a description under 156 characters", async () => {
    const m = await generateMetadata(props("get-ird-number"))
    expect(m.alternates?.canonical).toBe("/guides/get-ird-number")
    expect(String(m.description).length).toBeLessThanOrEqual(156)
  })

  it("returns 404 for an unknown slug and prebuilds every guide", async () => {
    await expect(GuidePage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND")
    expect(generateStaticParams()).toHaveLength(guides().length)
  })
})
