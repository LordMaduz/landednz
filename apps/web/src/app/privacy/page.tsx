import type { Metadata } from "next"
import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Privacy",
  description: "What LandedNZ keeps about you, how it is used, who else handles it and your rights.",
  alternates: { canonical: "/privacy" },
}

export default function Privacy() {
  return <LegalPage title="Privacy" updated="24 October 2026" file="privacy" />
}
