import type { MetadataRoute } from "next"
import { guides } from "@/lib/guides"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/onboarding", "/guides", ...guides().map(g => `/guides/${g.slug}`), "/about", "/privacy", "/terms"].map(path => ({ url: new URL(path, SITE_URL).toString() }))
}
