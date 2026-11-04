"use client";

import { useEffect } from "react";

// Country from /api/geo (Vercel header); null when unknown or the call fails, so analytics never breaks on it
async function fetchCountry(): Promise<string | null> {
  try {
    const res = await fetch("/api/geo");
    return res.ok ? ((await res.json()).country ?? null) : null;
  } catch {
    return null;
  }
}

// PostHog loads only when a key is set (not locally or in CI), and after mount so it stays off the critical path.
// cookieless_mode "always" = no cookies or storage (CW06); needs cookieless tracking on in PostHog project settings, or events are dropped. No identify()/alias() in this mode.
export async function initAnalytics(): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const [{ default: posthog }, country] = await Promise.all([import("posthog-js"), fetchCountry()]);
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: "history_change",
    autocapture: false,
    cookieless_mode: "always",
    // Cookieless mode drops the IP before GeoIP runs; supply the country ourselves and tell GeoIP to leave it alone
    before_send: (event) => {
      if (event && country) {
        event.properties.$geoip_country_code = country;
        event.properties.$geoip_disable = true;
      }
      return event;
    },
  });
}

export function Analytics(): null {
  useEffect(() => {
    void initAnalytics();
  }, []);
  return null;
}
