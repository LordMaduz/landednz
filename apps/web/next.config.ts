import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Supabase's local site_url is 127.0.0.1; without this, dev blocks hydration there and buttons are dead.
  allowedDevOrigins: ["127.0.0.1"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/roadmap", destination: "/app/roadmap", permanent: true },
      { source: "/chat", destination: "/app", permanent: true },
      { source: "/auth/signin", destination: "/signin", permanent: true },
    ];
  },
};

// Source maps upload only when SENTRY_AUTH_TOKEN is set (staging/production builds)
export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
