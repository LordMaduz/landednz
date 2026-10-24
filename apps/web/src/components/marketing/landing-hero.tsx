import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { RoadmapPreviewFigure } from "./roadmap-preview-figure"

// Contour lines behind the hero only (decorative)
function Topo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 640" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 size-full">
      <g fill="none" className="stroke-hairline" strokeWidth="1">
        <path d="M760 640 C840 520 780 420 900 360 S1140 330 1210 210 S1360 80 1460 100" />
        <path d="M810 680 C890 560 840 460 950 400 S1180 380 1260 260 S1390 140 1480 160" />
        <path d="M860 720 C940 600 900 500 1000 440 S1220 430 1310 310 S1420 200 1500 220" />
        <path d="M710 600 C790 480 730 380 850 320 S1100 280 1160 160 S1320 20 1420 40" />
        <path d="M660 560 C740 440 680 340 800 280 S1060 230 1110 110" />
        <path d="M910 760 C990 640 960 540 1050 480 S1260 480 1360 360" />
      </g>
    </svg>
  )
}

export function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-hairline">
      <Topo />
      <div className="container-page relative grid grid-cols-hero items-center gap-16 py-24 max-stack:grid-cols-1 max-stack:gap-12 max-stack:pt-12 max-stack:pb-16">
        <div className="flex flex-col items-start gap-6">
          <h1 id="hero-title" className="max-w-hero-title text-hero max-compact:text-title">Know what to do next in New Zealand</h1>
          <p className="max-w-hero-lede text-section leading-normal font-normal tracking-normal text-muted">
            Answer five questions and get a settling-in roadmap built for your visa, your city and the people moving with you.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/onboarding" className={buttonVariants({ size: "lg" })}>Build my roadmap</Link>
            <span className="text-small text-muted">You see it before you sign up.</span>
          </div>
        </div>
        <RoadmapPreviewFigure />
      </div>
    </section>
  )
}
