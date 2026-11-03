"use client";

import { useEffect } from "react";

// PostHog loads only when a key is set (not locally or in CI), and after mount so it stays off the critical path.
// cookieless_mode "always" = no cookies or storage (CW06); needs cookieless tracking on in PostHog project settings, or events are dropped. No identify()/alias() in this mode.
export async function initAnalytics(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: "history_change",
    autocapture: false,
    cookieless_mode: "always",
  });
}

export function Analytics(): null {
  useEffect(() => {
    void initAnalytics();
  }, []);
  return null;
}
