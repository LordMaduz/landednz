import type { Metadata } from "next"
import { Suspense } from "react"
import { QuestionStep } from "@/components/onboarding/question-step"

export const metadata: Metadata = {
  title: "Build your roadmap",
  description: "Five questions about your visa, city, family, work and arrival date. You see your roadmap before you sign up.",
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <QuestionStep />
    </Suspense>
  )
}
