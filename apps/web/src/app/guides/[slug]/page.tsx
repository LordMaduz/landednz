import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicFooter } from "@/components/chrome/public-footer"
import { PublicHeader } from "@/components/chrome/public-header"
import { buttonVariants } from "@/components/ui/button"
import { ORG_ID, jsonLdScript } from "@/lib/brand-schema"
import { GUIDE_SLUGS, guide, guides, type GuideDetail } from "@/lib/guides"
import { SITE_URL } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

// Cache Components rejects `dynamicParams`: slugs not listed here render on request and return 404 through notFound()
export function generateStaticParams() {
  return Object.values(GUIDE_SLUGS).map(slug => ({ slug }))
}

const cut = (text: string) => (text.length > 155 ? `${text.slice(0, text.lastIndexOf(" ", 152))}…` : text)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guide((await params).slug)
  if (!g) return {}
  return { title: g.name, description: cut(g.why[0]?.text ?? ""), alternates: { canonical: `/guides/${g.slug}` } }
}

function graph(g: GuideDetail) {
  const url = `${SITE_URL}/guides/${g.slug}`
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${url}#article`, headline: g.name, dateModified: g.checkedAtIso, author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID }, mainEntityOfPage: { "@id": url } },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: g.name, item: url },
        ],
      },
    ],
  }
}

type Item = { id: string; text: string }
const List = ({ title, items }: { title: string; items: Item[] }) =>
  items.length === 0 ? null : (
    <section className="flex flex-col gap-4">
      <h2 className="mt-0">{title}</h2>
      <ul>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>
    </section>
  )

export default async function GuidePage({ params }: Props) {
  const g = guide((await params).slug)
  if (!g) notFound()
  const total = guides().length
  // Sources grouped under their agency, links flowing inline, to keep the page short
  const byAgency = Object.entries(Object.groupBy(g.sources, s => s.agency))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph(g)) }} />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "secondary" })}>Sign in</Link>} />
        <main className="legal mx-auto w-full max-w-legal px-6 pt-16 pb-24">
          <div className="flex flex-col gap-2">
            <nav aria-label="Breadcrumb" className="flex gap-2 text-small text-fg-muted">
              <Link href="/guides" className="link-subtle inline-flex min-h-6 items-center">Guides</Link>
              <span aria-hidden="true">/</span>
              <span>{g.name}</span>
            </nav>
            <h1 className="text-title">{g.name}</h1>
            <p className="text-fg-muted">Last checked {g.checkedAt}</p>
          </div>
          <List title="Why it matters" items={g.why} />
          <section className="flex flex-col gap-4">
            <h2 className="mt-0">Steps</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-6 marker:font-semibold">{g.steps.map(i => <li key={i.id}>{i.text}</li>)}</ol>
          </section>
          <aside aria-label="Your plan" className="flex items-center justify-between gap-4 rounded-card bg-surface-sunken p-4 max-narrow:flex-col max-narrow:items-start">
            <p><strong className="font-semibold">This is 1 of {total} things to sort out when you move.</strong> Some steps depend on your visa or family. Get your plan in the right order.</p>
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>Start free</Link>
          </aside>
          <List title="Documents you'll need" items={g.documents} />
          <List title="Common mistakes" items={g.mistakes} />
          <List title="Watch out for" items={g.watchOuts} />
          {g.cost && <List title="Cost" items={[g.cost]} />}
          {g.advice && <List title="When to get advice" items={[g.advice]} />}
          <section className="flex flex-col gap-4">
            <h2 className="mt-0">Sources</h2>
            {byAgency.map(([agency, list]) => (
              <div key={agency} className="flex flex-col gap-1">
                <span className="text-small text-fg-muted">{agency}</span>
                <div className="flex flex-wrap gap-x-4">
                  {list!.map(s => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center">{s.title}</a>)}
                </div>
              </div>
            ))}
          </section>
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
