import type { Metadata } from "next"
import { LegalPage } from "@/components/marketing/legal-page"
import { BRAND } from "@/lib/brand"
import { ORG_ID, jsonLdScript } from "@/lib/brand-schema"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "About LandedNZ" },
  description: BRAND.bioShort,
  alternates: { canonical: "/about" },
}

const graph = { "@context": "https://schema.org", "@type": "AboutPage", url: `${SITE_URL}/about`, name: "About LandedNZ", about: { "@id": ORG_ID } }

export default function About() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
      <LegalPage title="About LandedNZ" updated="1 November 2026" file="about" />
    </>
  )
}
