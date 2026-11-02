# Public guides (brand SEO phase C) — design

Date: 2026-11-01 · Branch `feat/public-guides` (from `feat/brand-seo`, PR #22) · Follows `2026-11-01-brand-seo-design.md` (Roadmap: C).

## Goal

People who search for a settlement task (for example "how to get an IRD number NZ") find a LandedNZ page, read the full official-source steps, and see why the personal plan is worth signing up for.

Success: Search Console shows impressions and clicks for `/guides/*` pages within 8 weeks of deploy. Sign-up click tracking is not added (PostHog autocapture is off), so it is left for later.

## Decisions (owner, 2026-11-01)

| # | Decision |
|---|---|
| G1 | All 27 active tasks get a public guide. Each one ends with a call to action for the personal plan (option A). Nothing is hidden behind sign-in: Google does not rank hidden content. |
| G2 | The app's value is the plan, not the steps. The plan covers which tasks apply to you, their order and blockers, priority for your family, progress tracking, and the Guide chat. The public page gives one task's general steps. |
| G3 | One template, not 27 hand-made pages. No AI at runtime: pages are static HTML built at deploy. |
| G4 | Stale content fails the build (option A), the same rule the API follows. An expired fact stops the whole web deploy, not only the guides. |
| G5 | The web build reads the task files with the existing `buildBundle` (approach 1). There is no new API endpoint and no committed copy of the content. |
| G6 | Only items with no `when` condition are shown (about 90% of items). The call to action says the rest depends on visa and family. |
| G7 | The `/moving-to-nz/<audience>` pages are out of scope, until Search Console shows demand for them. |

## Pages

- `/guides` is the index of all 27 guides, grouped by journey leg with the names in `apps/web/src/lib/legs.ts`, before-arrival form (`legName(id, true)`: "Before you fly", "Arrival", "Week 1", "Month 1", "Later"). The public footer links to it.
- `/guides/<slug>` is one page per active task. Retired tasks get no page. An unknown slug returns 404 (`dynamicParams = false`).

### Guide page, top to bottom

Every string comes from the resolved task (`ResolvedTask`). No new copy is written per task.

1. H1: the task `name`. Under it: "Last checked <checkedAt, e.g. 27 Oct 2026>".
2. **Why it matters**: the `why` items.
3. **Steps**: the `steps`, numbered.
4. **Documents you'll need**, **Common mistakes**, **Watch out for**: `documents`, `mistakes` and `watchOuts`. A section is shown only when it has items.
5. **Cost** (`cost`) and **When to get advice** (`advice`), when present.
6. **Sources**: the unique `source` ids used on the page, resolved to their `title`, `agency` and official `url` from `sources`.
7. Call to action, with the wording set on the design board: "This is 1 of <N> things to sort out when you move. Some steps depend on your visa or family. Get your plan in the right order → Start free". `<N>` is the number of guides (`guides().length`), never hard-coded. It links to the existing sign-up entry point.

Look: the same public page frame as About, Privacy and Terms. The template and the index each get a design board through the normal gate (impeccable critique, no P0/P1) before they are built (CW02′).

## Data flow

```
apps/api/content/*.yaml ─► buildBundle(dir, { now, allowUnverified: false })   (apps/api/src/content/build.ts, unchanged)
                         ─► apps/web/src/lib/guides.ts                         (new)
                         ─► /guides, /guides/[slug]                            (static at build)
```

`apps/web/src/lib/guides.ts` (server-only):
- `GUIDE_SLUGS: Record<taskId, slug>`, for example `T11 → rental-bond`. Slugs are short, lowercase and hyphenated. A new task needs a new entry, and a test enforces this.
- `guides()` returns the active tasks with their slug, each item list filtered to items without `when`, and `checkedAt`.
- `guide(slug)` returns one guide, or `undefined`.
- It throws when `buildBundle` returns errors, so the build fails (G4).

No change to `apps/api` code, content files or the API. Vercel has no ignored-build rule, so a content-only commit also rebuilds the guides.

Technical risk, proven first in the plan: `apps/api` source imports with `.js` extensions, and Turbopack may not resolve them from `apps/web`. Fallback: the web `build` script runs `npm run content:build -w @landednz/api` first, and `guides.ts` reads `apps/api/content-bundle.json`. The checks and the expiry rule stay the same.

## SEO

- Title: `<task name>` through the existing `%s · LandedNZ` template. Description: the first `why` text, cut at a word boundary to about 155 characters.
- Canonical URL on every guide page and on `/guides`. The sitemap adds `/guides` and every guide.
- JSON-LD on each guide: `Article` (`headline`, `dateModified` = `checkedAt`, `author` and `publisher` = the Organization `#org` from PR #22) and `BreadcrumbList` (Home › Guides › task). Google lists both as supported rich-result types: [search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) (updated 2026-10-16), [Article](https://developers.google.com/search/docs/appearance/structured-data/article) (`author` may be an `Organization`), [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) (at least two `ListItem`s).
- No `HowTo` and no `FAQPage`. Neither appears in Google's search gallery. Google's [2023 post](https://developers.google.com/search/blog/2023/08/howto-faq-changes) dropped HowTo rich results and limited FAQ results to government and health sites.

## Error handling

- Invalid or expired content: `guides.ts` throws and the build fails, listing the content errors.
- Unknown slug: 404.
- Task missing from `GUIDE_SLUGS`: a unit test fails. At build time, the task has no page.

## Testing

- Unit (`guides.test.ts`): every active task has a slug, slugs are unique and URL-safe, retired tasks are excluded, no item with `when` is returned, and `checkedAt` is present.
- Render: the guide page renders its sections and sources and leaves out empty sections. The index lists every guide under its leg. JSON-LD has absolute URLs and the `#org` reference.
- Sitemap test covers `/guides` and every slug.
- Playwright at 390 and 1440 on `/guides` and one guide, compared with the approved boards. No overflow, footer link present.
- After deploy: Rich Results Test and validator.schema.org on one guide URL, with the results recorded in the PR.

## Out of scope

Audience pages (G7), AI search work (D), translations, and any change to the app, the API, the content or the onboarding flow.
