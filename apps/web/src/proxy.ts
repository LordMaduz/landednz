import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { ANSWERS_COOKIE, decodeAnswers } from '@/lib/answers'

const PROTECTED_PATHS = ['/app', '/settings']

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // The preview needs fresh, valid answers; stale or tampered ones are cleared (Review Focus 2).
  // Public page: no Supabase round trip.
  if (request.nextUrl.pathname === '/onboarding/preview') {
    if (decodeAnswers(request.cookies.get(ANSWERS_COOKIE)?.value)) return NextResponse.next()
    const res = NextResponse.redirect(new URL('/onboarding?step=1', request.url))
    res.cookies.set(ANSWERS_COOKIE, '', { path: '/', maxAge: 0 })
    return res
  }

  // Landing: only a request carrying a Supabase session cookie pays the auth round trip (LCP).
  if (
    request.nextUrl.pathname === '/' &&
    !request.cookies.getAll().some((c) => /^sb-.+-auth-token/.test(c.name))
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // RequestCookies.set() only accepts name + value (no options)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Carry any refreshed session cookies, or the rotated refresh token is lost and reused.
  const redirectTo = (url: URL) => {
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
    return res
  }

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.search = ''
    url.searchParams.set('redirect', pathname + request.nextUrl.search)
    return redirectTo(url)
  }

  // /app sends a user without a roadmap on to onboarding step 1
  if ((pathname === '/signin' || pathname === '/') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    url.search = ''
    return redirectTo(url)
  }

  return supabaseResponse
}

export const config = {
  // Other public pages (onboarding, legal) skip the Supabase round trip, which kept LCP waiting on auth.
  matcher: ['/', '/app/:path*', '/settings/:path*', '/signin', '/onboarding/preview'],
}
