import { NextRequest, NextResponse } from "next/server"
import { ANSWERS_COOKIE, answersCookieOptions, encodeAnswers, parseAnswers } from "@/lib/answers"

// Holds the five answers for an hour so they survive sign-in (spec §6)
export async function POST(request: NextRequest) {
  const answers = parseAnswers(await request.json().catch(() => null))
  if (!answers) {
    return NextResponse.json({ error: "INVALID_ANSWERS", message: "Those answers are not complete." }, { status: 400 })
  }
  const res = new NextResponse(null, { status: 204 })
  res.cookies.set(ANSWERS_COOKIE, encodeAnswers(answers), answersCookieOptions)
  return res
}

export async function DELETE() {
  const res = new NextResponse(null, { status: 204 })
  res.cookies.set(ANSWERS_COOKIE, "", { path: "/", maxAge: 0 })
  return res
}
