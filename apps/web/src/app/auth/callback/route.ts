import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const redirectTo = safeRedirect(searchParams.get("redirect"));

  if (!code) {
    return NextResponse.redirect(new URL("/signin?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/signin?error=auth_failed", request.url));
  }

  // Upsert user into the API DB — ensures the user exists before onboarding
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
  } catch {
    // Non-fatal: the auth middleware on protected API routes also creates the user
  }

  // /auth/complete saves any onboarding answers, then goes on to redirectTo
  const complete = new URL("/auth/complete", request.url);
  complete.searchParams.set("redirect", redirectTo);
  return NextResponse.redirect(complete);
}
