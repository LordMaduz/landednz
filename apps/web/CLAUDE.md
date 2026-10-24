@AGENTS.md

# apps/web

Next 16.4 App Router, React 19.3, Tailwind 4 (tokens in `src/app/globals.css` `@theme`), shadcn/ui (`components.json`, `@/components/ui`, `cn` from `@/lib/utils`), Zustand, `@supabase/ssr`.

- **Design gate:** pages in R0 Stage A are unstyled placeholders. Build or restyle a page only from its approved board (spec §7.4), then run the minimalism validator (`.claude/skills/minimalism-validator`).
- **Rules** (`.claude/constitution.md`): CW01 tokens only, no arbitrary values (with Tailwind 4 the tokens live in `globals.css`, not `tailwind.config.ts`) · CW02′ matches its approved board · CW03 reduced motion (`useReducedMotion`) · CW04 API types from `@landednz/types` · CW05 mock data matches API shapes · CW06 no localStorage for auth or app state · CW07 minimalism · CW08 light only.
- **Auth:** `src/proxy.ts` refreshes the Supabase session and guards `/app` and `/settings` (signed-out → `/signin?redirect=…`; signed-in on `/signin` → `/app`). Any `redirect` value goes through `safeRedirect`. Old URLs (`/roadmap`, `/chat`, `/auth/signin`) redirect in `next.config.ts`.
- **API calls** live in `src/lib/api.ts` only.
- **Env** (`.env.example`): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED` (`false` in production: Google only), `SUPABASE_SECRET_KEY` (e2e only).
- **Tests:** `npm test` (Vitest, jsdom) for logic; `npm run test:e2e` (Playwright) needs local Supabase running and starts the API and web if they are not up.
