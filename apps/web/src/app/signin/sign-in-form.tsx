"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";

const passwordEnabled = process.env.NEXT_PUBLIC_AUTH_PASSWORD_ENABLED === "true";

export function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [error, setError] = useState(searchParams.get("error"));
  const [pending, setPending] = useState(false);

  async function signInWithPassword(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error || !data.session) {
      setError(error?.message ?? "Sign-in failed");
      setPending(false);
      return;
    }
    // Ensure the API has a user row; non-fatal, the API auth middleware also upserts.
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    }).catch(() => {});
    // Full navigation so proxy.ts sees the new session cookie.
    window.location.assign(redirectTo);
  }

  async function signInWithGoogle() {
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("redirect", redirectTo);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (error) setError(error.message);
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {passwordEnabled && (
        <form action={signInWithPassword}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit" disabled={pending}>
            Sign in
          </button>
        </form>
      )}
      <button type="button" onClick={signInWithGoogle}>
        Continue with Google
      </button>
    </>
  );
}
