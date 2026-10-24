import type { Metadata } from "next"
import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using LandedNZ: general information, not advice.",
  alternates: { canonical: "/terms" },
}

export default function Terms() {
  return <LegalPage title="Terms" updated="24 October 2026" file="terms" />
}
