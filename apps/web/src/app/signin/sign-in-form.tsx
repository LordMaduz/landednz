"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { OnboardingPreviewResponse } from "@landednz/types";
import { PREVIEW_META, previewTitle } from "@/components/onboarding/preview-route";
import { Waypoint } from "@/components/route/waypoint";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { getRoadmapPreview } from "@/lib/api";
import { answersSummary, type Answers } from "@/lib/answers";
import { createClient } from "@/lib/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";
import { cn } from "@/lib/utils";

function SignInForm() {
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
      {error && <p role="alert" className="rounded-surface border border-ink p-4">{error}</p>}
      {/* Google's branding rules, not Precise tokens: see .gsi in globals.css */}
      <button type="button" className="gsi" onClick={signInWithGoogle}>
        Continue with Google
      </button>
      <p className="text-small text-muted">
        <span translate="no">LandedNZ</span> gets your name and email from Google, nothing else. By continuing you agree to the{" "}
        {/* Underlined: inside muted text, colour alone does not mark a link (axe link-in-text-block) */}
        <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
      {passwordEnabled && (
        <form action={signInWithPassword} className="flex flex-col gap-4 border-t border-hairline pt-6">
          <label className="flex flex-col gap-2">
            Email
            <Field name="email" type="email" autoComplete="email" spellCheck={false} required />
          </label>
          <label className="flex flex-col gap-2">
            Password
            <Field name="password" type="password" autoComplete="current-password" required />
          </label>
          <Button type="submit" variant="quiet" disabled={pending} className="self-start">
            Sign in
          </Button>
        </form>
      )}
    </>
  );
}

type Tasks = OnboardingPreviewResponse["tasks"];

// The roadmap the answers cookie will save: its first two tasks and how many follow
function Saving({ answers }: { answers: Answers }) {
  const [tasks, setTasks] = useState<Tasks | null>(null);

  useEffect(() => {
    // On failure the summary alone says what is being saved
    getRoadmapPreview(answers).then(r => setTasks(r.tasks), () => {});
  }, [answers]);

  const rest = tasks ? tasks.length - 2 : 0;
  return (
    <aside aria-labelledby="saving" className="flex flex-col gap-4 self-start rounded-surface bg-wash p-8">
      <div className="flex flex-col gap-1">
        <h2 id="saving" className="text-section">What you&apos;re saving</h2>
        <p className="text-small text-muted">{answersSummary(answers)}</p>
      </div>
      {tasks && (
        <ol className="route-legs on-wash m-0 list-none p-0 pt-2 [&>li]:pb-0">
          {tasks.slice(0, 2).map((t, i) => (
            <li key={t.taskId}>
              <div className="route-step">
                <span className="route-dot" aria-hidden="true">
                  <Waypoint state={i === 0 ? "current" : "available"} />
                </span>
                <div className="flex min-h-11 flex-wrap items-center gap-x-4">
                  <span className={cn(i === 0 && "font-medium")}>{previewTitle(t.taskId, t.name, answers.city)}</span>
                  {i === 0 && PREVIEW_META[t.taskId] && <span className="text-small text-muted">{PREVIEW_META[t.taskId]}</span>}
                </div>
              </div>
            </li>
          ))}
          {rest > 0 && (
            <li className="is-folded">
              <div className="route-step">
                <span className="route-dot" aria-hidden="true">
                  <Waypoint state="locked" />
                </span>
                <div className="flex min-h-11 items-center">
                  <span className="text-muted">{rest} more {rest === 1 ? "task" : "tasks"}, in the order they unlock</span>
                </div>
              </div>
            </li>
          )}
        </ol>
      )}
    </aside>
  );
}

// With onboarding answers the page saves them; without, it is a plain sign-in
export function SignIn({ answers }: { answers: Answers | null }) {
  return (
    <main className="container-page grid grid-cols-signin justify-between gap-16 pt-16 pb-24 max-split:grid-cols-1 max-split:gap-12 max-split:pt-8">
      <div className="flex flex-col gap-6">
        {answers && (
          <Link href="/onboarding/preview" className={cn(buttonVariants({ variant: "ghost" }), "-ml-4 self-start")}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your roadmap preview
          </Link>
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-title">{answers ? "Save your roadmap" : "Sign in"}</h1>
          <p className="text-muted">Sign in to tick tasks off, pick up where you left off on any device, and ask about any task.</p>
        </div>
        <SignInForm />
      </div>
      {answers && <Saving answers={answers} />}
    </main>
  );
}
