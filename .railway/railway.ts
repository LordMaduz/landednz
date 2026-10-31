// Production API on Railway (replaces railway.json; Config as Code stops working 2026-12-01).
// Apply: `railway config plan` then `railway config apply` from the repo root, linked to landednz-prod.
// Secrets are preserve(): the value lives only in the Railway dashboard, never in git.
import { defineRailway, github, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const api = service("api", {
    source: github("LordMaduz/landednz", { branch: "production" }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/api/Dockerfile",
      watchPatterns: ["apps/api/**", "packages/types/**"],
    },
    preDeploy: ["npm run migrate:deploy -w @landednz/api"],
    healthcheck: "/health",
    regions: { "asia-southeast1-eqsg3a": 1 },
    env: {
      NODE_ENV: "production",
      AI_MODE: "live",
      ANTHROPIC_MODEL: "claude-sonnet-5-5",
      TRUST_PROXY: "true",
      BETA_MODE: "true",
      CORS_ORIGIN: "https://landednz.co.nz,https://www.landednz.co.nz",
      SUPABASE_URL: "https://cauaowrnsivggivsopad.supabase.co",
      DATABASE_URL: preserve(),
      SUPABASE_SECRET_KEY: preserve(),
      ANTHROPIC_API_KEY: preserve(),
      OPENAI_API_KEY: preserve(),
      SENTRY_DSN: preserve(),
      ADMIN_API_KEY: preserve(),
    },
  });

  return project("landednz-prod", { resources: [api] });
});
