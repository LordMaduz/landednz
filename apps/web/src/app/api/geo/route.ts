import { NextRequest, NextResponse } from "next/server"

// Country from Vercel's edge header, so analytics knows the country without PostHog keeping the IP (cookieless mode drops it)
export function GET(request: NextRequest) {
  const raw = request.headers.get("x-vercel-ip-country")
  const country = raw && /^[A-Z]{2}$/.test(raw) ? raw : null
  return NextResponse.json({ country }, { headers: { "Cache-Control": "no-store" } })
}
