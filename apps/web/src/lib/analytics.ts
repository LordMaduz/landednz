"use client";

import { useEffect } from "react";

// PostHog loads only when a key is set (not locally or in CI), and after mount so it stays off the critical path.
// persistence "memory" = no cookies or localStorage (CW06).
export async function initAnalytics(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: "history_change",
    autocapture: false,
    persistence: "memory",
  });
}

export function Analytics(): null {
  useEffect(() => {
    void initAnalytics();
  }, []);
  return null;
}
