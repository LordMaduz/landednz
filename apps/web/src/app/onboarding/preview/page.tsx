import type { Metadata } from "next"
import { Suspense } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { PublicHeader } from "@/components/chrome/public-header"
import { PreviewRoute } from "@/components/onboarding/preview-route"
import { ANSWERS_COOKIE, decodeAnswers } from "@/lib/answers"

export const metadata: Metadata = {
  title: "Your roadmap is ready",
  robots: { index: false },
}

// proxy.ts clears stale or tampered answers before this page; the check here is the backstop
async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection() // decodeAnswers reads the clock
  const answers = decodeAnswers((await cookies()).get(ANSWERS_COOKIE)?.value)
  if (!answers) redirect("/onboarding?step=1")
  const saveFailed = (await searchParams).save === "failed"
  return <PreviewRoute answers={answers} saveFailed={saveFailed} />
}

export default function PreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <>
      <PublicHeader />
      <div aria-hidden="true" className="h-0.5 bg-teal" />
      <Suspense>
        <Preview searchParams={searchParams} />
      </Suspense>
    </>
  )
}
