# RPI Request — Web Stage 6: Deployment and Production Readiness
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 6.

---

## Stage goal

Web app deployed to Vercel, connected to production API, all features working
end-to-end in production.
**Stage 6 is complete when the app is live at the production URL and the full
user journey works in production.**

---

## Scope

**Builds:**
- Vercel project configuration (connected to monorepo, `apps/web/` root)
- Environment variables in Vercel dashboard
- Production Supabase OAuth configuration (Google redirect URIs)
- Production Stripe Checkout configuration (price IDs, success/cancel URLs)
- Custom domain configuration (if ready)
- Preview deployment verification (PR deploys with preview URL)
- Error monitoring (Vercel Analytics or Sentry — basic setup)
- SEO (meta tags, OG images, sitemap for marketing pages only)
- Production smoke test (full user journey)
- Documentation update (IMPLEMENT.md, CLAUDE.md)

**Does NOT build:**
- New features
- CDN or caching optimisation (Vercel handles this)
- A/B testing infrastructure

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W6-01 | Vercel deployment succeeds from main, production URL accessible | Access URL |
| AC-W6-02 | All env vars in Vercel, no secrets in NEXT_PUBLIC_ | Inspect dashboard |
| AC-W6-03 | Google OAuth works in production end-to-end | Complete flow |
| AC-W6-04 | Full production smoke test: signin → onboard → roadmap → task → complete → chat → gate → settings → signout | Manual walkthrough |
| AC-W6-05 | Stripe Checkout production (test mode): upgrade → payment → return → Phase 3 | Complete payment |
| AC-W6-06 | Preview deployments: PR → Vercel preview URL → features work | Create test PR |
| AC-W6-07 | SEO: meta title, description, OG image on landing. robots.txt. Sitemap. | Inspect source + social preview |
| AC-W6-08 | Error monitoring: unhandled errors reported to dashboard | Force error, check |
| AC-W6-09 | IMPLEMENT.md + CLAUDE.md updated with web completion | Inspect files |
| AC-W6-10 | Lighthouse production: Performance ≥ 85, Accessibility ≥ 95, LCP < 3.0s on 3G | Run on production URL |

---

## Known failure points

- **Supabase redirect URI** — production domain must be added to Supabase Auth → URL Configuration → Redirect URLs
- **Stripe success URL** — must use production domain with protocol, not localhost
- **Vercel serverless function timeout** — default 10s; chat SSE may need Vercel Pro plan for longer streaming
- **OG image** — must be absolute URL with protocol in meta tags; relative paths don't work for social previews
- **CORS** — production API must allow requests from the Vercel domain in its CORS config

---

## Skills to load

None required — deployment and configuration only.

---

## Stage gate

ALL 10 ACs must pass. Full user journey on production by Ruchira.
Lighthouse scores meet thresholds on production URL.
IMPLEMENT.md and CLAUDE.md updated.
Then run `/rpi:gate web-stage6`. **Web build complete.**
