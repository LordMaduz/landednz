# Brand SEO: entity hub + off-site presence — design

Date: 2026-11-01 · Status: design approved in chat by owner 2026-11-01, spec awaiting review

Scope: projects A (on-site brand basics) and B (off-site presence) of the brand + SEO roadmap. Projects C, D, launch push and E get their own specs (see Roadmap).

## Goal

1. A search for "LandedNZ" shows landednz.co.nz first. Today landednz.com (a live relocation business named "Landed") ranks above it.
2. Google and AI assistants understand LandedNZ as one entity: one name, one logo, one bio, one set of profiles, all pointing at landednz.co.nz.

Success: landednz.co.nz is result 1 for "LandedNZ" in Google NZ, and Google shows "LandedNZ" as the site name. Checked in Search Console (Performance → query "landednz") 8 weeks after the Tier 1 profiles are live.

## Decisions (owner, 2026-11-01)

| # | Decision |
|---|---|
| D1 | Approach: brand entity hub (one Organization, every profile links back, About page). Launch push (Product Hunt, press, Wikidata) waits until public guides (C) exist. |
| D2 | The bio names everyone moving to NZ, not one visa group. It must stay true to the product: onboarding has no student visa today, so no surface promises students yet. |
| D3 | Employer product is "LandedNZ for Employers" at `/employers`, same domain, same Organization. Not built now. |
| D4 | No accounts exist yet. Every profile is created fresh with the rules in B1. |
| D5 | No translations or hreflang. Users search in English for NZ topics. Revisit if Search Console shows demand. |
| D6 | Google Search Console: already verified as a Domain property. |

## A. On-site (code; no behaviour change)

### A1 Brand source: `apps/web/src/lib/brand.ts`

The only place brand facts live. Read by metadata, JSON-LD and the About page.

- `name`: `LandedNZ`
- `alternateNames`: `Landed NZ`, `LandedNZ.co.nz`
- `bioShort`: "Your step-by-step settling-in roadmap for New Zealand, checked against official sources."
- `bioLong`: `bioShort` + "Ask about any task and get answers cited from official New Zealand sites."
- `logo`: `/logo.png`
- `sameAs`: profile URLs, empty until each profile is live. Adding a profile is a one-line change.
- `email`: the brand contact address (B1), shown on /about.

The home page description stays as it is (it describes the five-question flow, which is right for that page).

### A2 Structured data (home, `apps/web/src/app/page.tsx`)

One JSON-LD `@graph` replaces the current single `WebApplication` object:

- `Organization` `@id` `https://landednz.co.nz/#org`: name, alternateName, url, logo (ImageObject, absolute URL), description = `bioLong`, `sameAs` (omitted when empty), email.
- `WebSite` `@id` `/#website`: name, alternateName, url, publisher → `#org`. This is Google's site-name signal.
- `WebApplication` (existing fields kept), publisher → `#org`.

No `SearchAction` (the site has no search). The existing `<` escaping stays.

Source: Google Search Central, Organization structured data (https://developers.google.com/search/docs/appearance/structured-data/organization) and site names (https://developers.google.com/search/docs/appearance/site-names).

### A3 Titles (`apps/web/src/app/layout.tsx`)

`title: { default: "LandedNZ", template: "%s · LandedNZ" }`, plus `applicationName: "LandedNZ"`. Pages keep their own short titles ("Build your roadmap" → "Build your roadmap · LandedNZ"). The home page title is set with `absolute` so it stays "LandedNZ: your settling-in roadmap for New Zealand".

### A4 Logo files (`apps/web/public/`)

`logo.svg` and `logo.png` (512×512) exported from the mark in `components/chrome/logo.tsx` (same paths, same colours resolved from tokens). Square, crawlable, used by the schema and every profile. The in-app `Logo` component is unchanged.

### A5 About page (`/about`)

Text-led, same frame and type roles as /privacy and /terms. Sections: what LandedNZ is, who it is for, how content is checked (official sources, review dates), who runs it, contact. `AboutPage` JSON-LD whose `about` → `#org`. Linked from `components/chrome/public-footer.tsx` next to Privacy and Terms, added to the sitemap.

New UI, so it goes through the design gate (frontend-design + board) before it is built. Copy follows the content rules: verified facts only, no persona names.

### A6 Indexing fixes

| Page | Change |
|---|---|
| `/onboarding` | canonical `/onboarding` |
| `/signin` | `robots: { index: false, follow: true }` |
| `/onboarding/preview` | `robots: { index: false, follow: true }` |
| `/about` | canonical, in sitemap |

### A7 Tests (`apps/web/src/app/seo.test.ts`)

- Title template applied to a child page; home title unchanged.
- Home JSON-LD graph has Organization (with logo URL and description) and WebSite; both reference `#org`; `sameAs` equals `brand.sameAs`.
- `/signin` and `/onboarding/preview` are noindex; sitemap includes `/about`.
- Existing landing tests pass unchanged (no visual or behaviour change outside /about and the footer link).

After deploy, check the home page in Google's Rich Results Test (https://search.google.com/test/rich-results) and record the result.

## B. Off-site presence (owner does the sign-ups; agent prepares everything)

### B1 Rules for every profile

- Name: `LandedNZ` exactly. Handle: `@landednz`, fallback `@landed_nz`.
- Logo: `logo.png`. Bio: `bioShort`. Website: `https://landednz.co.nz`.
- Sign-up and contact email: one brand address (e.g. `hello@landednz.co.nz`, via email forwarding on the domain).
- When a profile is live, its URL goes into `brand.sameAs` (one-line PR).

### B2 Tiers

| Tier | Platform | Why |
|---|---|---|
| 1 | LinkedIn company page | Strongest company signal for Google; owner's AI Engineer audience |
| 1 | Facebook page + Instagram (one Meta setup) | NZ migrant communities live in Facebook groups |
| 1 | YouTube channel | Future short how-tos; YouTube results show in Google |
| 1 | Crunchbase | Company profile that search engines and AI read for "what is this company" |
| 1 | NZBN record | If LandedNZ is a registered business, add the website to its NZ Business Number record (official register) |
| 2 | X, TikTok, Threads | Claim the handle only (stops squatting) |
| 3 | Reddit (r/newzealand), NZ migrant Facebook groups | Helpful answers, link only when it answers the question. After C ships. |
| 3 | Product Hunt, NZ startup press, Wikidata | Launch push, after C ships |

Not possible: Google Business Profile ("Brands, organizations, artists, and other online-only businesses" are listed as ineligible: https://support.google.com/business/answer/13763036).

Also owner: submit `https://landednz.co.nz/sitemap.xml` in Search Console; import the site into Bing Webmaster Tools from Search Console.

### B3 Agent deliverables

- Owner checklist (local, gitignored, not committed): per platform the exact name, handle, bio, link, image specs and steps.
- Profile and cover images sized for each Tier 1 platform, made from `logo.svg` and the design tokens. Sizes are checked against each platform's official help page at build time, not from memory.

## Roadmap (reserved now, nothing built)

URL map, so later projects need no renames:

| Path | Project | Note |
|---|---|---|
| `/guides/<task>` | C | Public guides from the KB, e.g. `/guides/ird-number` |
| `/moving-to-nz/<audience>` | C | e.g. `work-visa`; `student` only once onboarding supports a student visa (D2) |
| `/employers` | E | LandedNZ for Employers |
| `/jobs/<id>` | E | `JobPosting` schema (Google job search); job-board feed rules (Seek, Indeed) checked against current official docs in E's spec |

Brand architecture: one `Organization` (`#org`). The employer product becomes a second `WebApplication` with publisher `#org`, and a LinkedIn showcase page "LandedNZ for Employers".

Order: C (public guides) → D (AI search) → launch push → E (employers). Each gets its own spec.

## Risks

- **Name collision.** landednz.com runs a relocation business in the same field. Besides the ranking fight, this may be a trademark issue (trademark still open). Owner checks IPONZ (https://www.iponz.govt.nz) before spending on brand assets.
- **Time.** Google's site-name and brand results update over weeks, not days. The 8-week check in Goal is the first real measurement.

## Out of scope

Public guide pages (C), AI search work (D), launch push, employer product (E), translations, paid ads, landing-page redesign.
