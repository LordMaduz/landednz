import { BRAND } from "./brand"
import { SITE_URL } from "./site"

export const ORG_ID = `${SITE_URL}/#org`

// Google's Organization (logo, sameAs) and site-name (WebSite) signals; no SearchAction, the site has no search.
export function homeGraph(description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}${BRAND.logoPath}` },
        description: BRAND.bioLong,
        email: BRAND.email,
        ...(BRAND.sameAs.length > 0 && { sameAs: BRAND.sameAs }),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        url: SITE_URL,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "WebApplication",
        name: BRAND.name,
        url: SITE_URL,
        description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        publisher: { "@id": ORG_ID },
      },
    ],
  }
}

// Escape < so page text can never close the script tag
export const jsonLdScript = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c")
