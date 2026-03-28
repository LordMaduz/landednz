import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/roadmap', '/chat', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!isProtected) return NextResponse.next()

  // Stage 2: check for Supabase session cookie by prefix
  // Stage 4: replace with createServerClient().auth.getUser() from @supabase/ssr
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-'))

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/roadmap/:path*', '/chat/:path*', '/settings/:path*'],
}