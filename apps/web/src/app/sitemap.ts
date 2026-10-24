import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/onboarding", "/privacy", "/terms"].map(path => ({ url: new URL(path, SITE_URL).toString() }))
}
