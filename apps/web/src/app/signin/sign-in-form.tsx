"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { getRoadmapPreview } from "@/lib/api";
import { answersShort, type Answers } from "@/lib/answers";
import { createClient } from "@/lib/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";

function SignInForm({ saving }: { saving: boolean }) {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [error, setError] = useState(searchParams.get("error"));
  const [pending, setPending] = useState(false);
  const passwordEnabled = process.env.NEXT_PUBLIC_AUTH_PASSWORD_ENABLED === "true";

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
    // Full navigation so the server sees the new session cookie; /auth/complete saves any onboarding answers.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- route handler, needs a full request
    window.location.assign(`/auth/complete?redirect=${encodeURIComponent(redirectTo)}`);
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
      <div className="flex flex-col gap-2">
        <h1 className="text-title">{saving ? "Save your roadmap" : "Sign in"}</h1>
        <p className="text-fg-muted">Sign in to tick tasks off, pick up where you left off on any device, and ask about any task. New here? Continue with Google to create your account.</p>
      </div>
      {error && <p role="alert" className="rounded-card border border-fg p-4">{error}</p>}
      {/* Google's branding rules, not Precise tokens: see .gsi in globals.css */}
      <button type="button" className="gsi w-full" onClick={signInWithGoogle}>
        Continue with Google
      </button>
      {passwordEnabled && (
        <>
          <div className="or-rule text-small text-fg-muted">or use email</div>
          <form action={signInWithPassword} className="flex flex-col gap-5 max-narrow:gap-4">
            <label className="flex flex-col gap-2 font-medium">
              Email
              <Field name="email" type="email" autoComplete="email" spellCheck={false} required className="min-h-target font-normal" />
            </label>
            <label className="flex flex-col gap-2 font-medium">
              Password
              <Field name="password" type="password" autoComplete="current-password" required className="min-h-target font-normal" />
            </label>
            <Button type="submit" size="lg" disabled={pending} className="w-full">
              {saving ? "Save and sign in" : "Sign in"}
            </Button>
          </form>
        </>
      )}
      <p className="text-center text-small text-fg-muted">
        <span translate="no">LandedNZ</span> gets your name and email from Google, nothing else. By continuing you agree to the{" "}
        {/* Underlined: inside muted text, colour alone does not mark a link (axe link-in-text-block) */}
        <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </>
  );
}

// What the answers cookie will save: the task count and the answers in one line
function SaveChip({ answers }: { answers: Answers }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // On failure the chip just says what is being saved
    getRoadmapPreview(answers).then(r => setCount(r.tasks.length), () => {});
  }, [answers]);

  return (
    <div className="flex items-center gap-3 rounded-control border border-border-selected bg-surface-selected px-4 py-3">
      <span aria-hidden="true" className="size-4 flex-none rounded-full border-4 border-accent bg-surface" />
      <div className="flex min-w-0 flex-col">
        <span className="text-small font-semibold">Saving your roadmap{count !== null && ` · ${count} tasks`}</span>
        <span className="text-small text-fg-muted">{answersShort(answers)}</span>
      </div>
    </div>
  );
}

// With onboarding answers the page saves them; without, it is a plain sign-in
export function SignIn({ answers }: { answers: Answers | null }) {
  return (
    <main className="container-page flex flex-1 items-center justify-center py-12 max-narrow:pt-6 max-narrow:pb-8">
      <Card as="div" className="w-full max-w-auth gap-5 p-8 max-narrow:gap-5 max-narrow:px-5 max-narrow:py-6">
        {answers && (
          <>
            <Link href="/onboarding/preview" className="-mb-1 inline-flex h-8 items-center gap-2 self-start font-medium text-fg-muted no-underline hover:text-fg">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Your roadmap preview
            </Link>
            <SaveChip answers={answers} />
          </>
        )}
        <SignInForm saving={!!answers} />
      </Card>
    </main>
  );
}
