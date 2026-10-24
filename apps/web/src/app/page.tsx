import type { Metadata } from "next"
import Link from "next/link"
import { PublicFooter } from "@/components/chrome/public-footer"
import { PublicHeader } from "@/components/chrome/public-header"
import { LandingHero } from "@/components/marketing/landing-hero"
import { buttonVariants } from "@/components/ui/button"
import { SITE_URL } from "@/lib/site"

const title = "LandedNZ: your settling-in roadmap for New Zealand"
const description =
  "Answer five questions and get a step-by-step roadmap for your first months in New Zealand, checked against official sources."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", siteName: "LandedNZ", locale: "en_NZ", type: "website" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LandedNZ",
  url: SITE_URL,
  description,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
}

const FEATURES = [
  ["In the right order", "Tasks that depend on each other unlock in turn, so you never start one too early."],
  ["From official sources", "Each task links to the source it was checked against, such as tenancy.govt.nz or acc.co.nz, with the date."],
  ["Answers about your roadmap", "Ask about any task. The assistant reads your roadmap and tells you what it checked."],
]

export default function Landing() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "quiet" })}>Sign in</Link>} />
      <main>
        <LandingHero />
        <section aria-label="What you get" className="container-page grid grid-cols-3 gap-12 pt-16 pb-24 max-stack:grid-cols-1 max-stack:gap-8 max-stack:pt-12 max-stack:pb-16">
          {FEATURES.map(([heading, text]) => (
            <div key={heading} className="flex flex-col gap-2 border-t border-ink pt-6">
              <h2 className="text-body font-semibold">{heading}</h2>
              <p className="text-muted">{text}</p>
            </div>
          ))}
        </section>
      </main>
      <PublicFooter />
    </>
  )
}
