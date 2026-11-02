import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { guides } from "@/lib/guides"
import GuidesIndex, { metadata } from "./page"

describe("/guides", () => {
  it("lists every guide under its leg, each linking to its page", () => {
    render(<GuidesIndex />)
    expect(screen.getByRole("heading", { level: 1, name: "Guides" })).toBeTruthy()
    for (const name of ["Before you fly", "Arrival", "Week 1", "Month 1", "Later"]) expect(screen.getByRole("heading", { level: 2, name: new RegExp(name) })).toBeTruthy()
    const all = guides()
    for (const g of all) expect(screen.getByRole("link", { name: g.name }).getAttribute("href")).toBe(`/guides/${g.slug}`)
    expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(all.length)
  })

  it("has a canonical URL and a Guides footer link", () => {
    render(<GuidesIndex />)
    expect(metadata.alternates?.canonical).toBe("/guides")
    expect(screen.getByRole("navigation", { name: "Legal" }).querySelector('a[href="/guides"]')).toBeTruthy()
  })

  it("emits a two-item BreadcrumbList", () => {
    const { container } = render(<GuidesIndex />)
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)
    expect(ld["@type"]).toBe("BreadcrumbList")
    expect(ld.itemListElement).toHaveLength(2)
  })
})
