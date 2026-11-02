import type { Metadata } from "next"
import Link from "next/link"
import { PublicFooter } from "@/components/chrome/public-footer"
import { PublicHeader } from "@/components/chrome/public-header"
import { buttonVariants } from "@/components/ui/button"
import { jsonLdScript } from "@/lib/brand-schema"
import { guides } from "@/lib/guides"
import { LEGS } from "@/lib/legs"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Guides",
  description: "Step-by-step guides for every settlement task when you move to New Zealand, checked against official sources.",
  alternates: { canonical: "/guides" },
}

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
  ],
}

// Static: the guides are built from the content bundle at deploy. Same public frame as About, Privacy and Terms.
export default function GuidesIndex() {
  const all = guides()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "secondary" })}>Sign in</Link>} />
        <main className="mx-auto flex w-full max-w-legal flex-col gap-8 px-6 pt-16 pb-24">
          <div className="flex flex-col gap-2">
            <h1 className="text-title">Guides</h1>
            <p className="text-fg-muted">Step-by-step help for {all.length} things to sort out when you move to New Zealand. Every step comes from an official site.</p>
          </div>
          {LEGS.map(leg => {
            const items = all.filter(g => g.leg === leg.id)
            if (items.length === 0) return null
            return (
              <section key={leg.id} className="flex flex-col gap-1">
                <h2 className="flex items-baseline justify-between text-section">
                  {items[0].legName}
                  <span className="text-small font-normal text-fg-muted">{items.length} guides</span>
                </h2>
                <ul>
                  {items.map(g => (
                    <li key={g.id} className="border-b border-border-subtle">
                      <Link href={`/guides/${g.slug}`} className="flex min-h-target items-center text-body text-fg hover:underline">{g.name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
