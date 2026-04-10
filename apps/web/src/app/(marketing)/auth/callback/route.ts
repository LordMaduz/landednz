import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  // Read redirect destination from cookie set by AuthCard
  const redirectTo = request.cookies.get('auth_redirect')?.value
    ? decodeURIComponent(request.cookies.get('auth_redirect')!.value)
    : '/roadmap'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=missing_code', request.url))
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/auth/signin?error=auth_failed', request.url))
  }

  // Upsert user into Fastify/Prisma DB — ensures user exists before onboarding
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    })
  } catch {
    // Non-fatal: the auth middleware on protected routes will create the user as a fallback
  }

  // Clean up the auth_redirect cookie and redirect to final destination
  const response = NextResponse.redirect(new URL(redirectTo, request.url))
  response.cookies.delete('auth_redirect')
  return response
}
