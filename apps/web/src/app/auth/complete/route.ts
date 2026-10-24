import { NextRequest, NextResponse } from "next/server"
import { submitOnboardingProfile } from "@/lib/api"
import { ANSWERS_COOKIE, decodeAnswers } from "@/lib/answers"
import { safeRedirect } from "@/lib/safe-redirect"
import { createClient } from "@/lib/supabase/server"

// After any sign-in: save the onboarding answers (if any) as the profile, then go on.
export async function GET(request: NextRequest) {
  const redirectTo = safeRedirect(request.nextUrl.searchParams.get("redirect"))
  const to = (path: string) => new URL(path, request.url)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const signin = to("/signin")
    signin.searchParams.set("redirect", redirectTo)
    return NextResponse.redirect(signin)
  }

  const cookie = request.cookies.get(ANSWERS_COOKIE)?.value
  if (cookie === undefined) return NextResponse.redirect(to(redirectTo))

  const answers = decodeAnswers(cookie)
  if (answers) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    try {
      // 409 (a profile already exists) resolves too: they keep their roadmap (Review Focus 1)
      await submitOnboardingProfile(answers, session!.access_token)
    } catch {
      // Keep the answers; the preview offers Save again
      return NextResponse.redirect(to("/onboarding/preview?save=failed"))
    }
  }

  const res = NextResponse.redirect(to(redirectTo))
  res.cookies.set(ANSWERS_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
