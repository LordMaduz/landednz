import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
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

export default nextConfig;
