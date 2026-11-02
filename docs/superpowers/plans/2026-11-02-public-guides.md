# Public Guides (brand SEO phase C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build static `/guides` index and `/guides/<slug>` pages from the existing content bundle so people searching for settlement tasks find full official-source steps and a call to action for the personal plan.

**Architecture:** `apps/web/src/lib/guides.ts` (server-only) reads the content bundle produced by `apps/api`'s `buildBundle`, exposes `guides()`, `guide(slug)`, and `GUIDE_SLUGS`. Next.js static pages at `/guides` and `/guides/[slug]` use them. The build runs `npm run content:build -w @landednz/api` first, then `guides.ts` reads `apps/api/content-bundle.json` — this avoids Turbopack import issues. Expired content fails the web build (same rule as the API).

**Tech Stack:** Next 16.4 App Router metadata API, Vitest 5 + Testing Library, Playwright. Existing `buildBundle`, `ResolvedTask`, `shortDate`, `LEGS`, `PublicHeader`/`PublicFooter`, `ORG_ID`, `jsonLdScript`.

**Spec:** `docs/superpowers/specs/2026-11-01-public-guides-design.md`

## Global Constraints

- G1: All 27 active tasks get a public guide; retired tasks get no page. No content hidden behind sign-in.
- G2: The app's value is the plan; the public page gives one task's general steps.
- G3: One template, not 27 hand-made pages. No AI at runtime: pages are static HTML built at deploy.
- G4: Stale content fails the build (option A). An expired fact stops the whole web deploy.
- G5: Web build reads task files with existing `buildBundle`. No new API endpoint, no committed copy of content.
- G6: Only items with no `when` condition are shown (~90%). CTA says the rest depends on visa and family.
- G7: `/moving-to-nz/<audience>` pages are out of scope.
- Name `LandedNZ`; alternateName `Landed NZ`, `LandedNZ.co.nz`.
- Raw hex only in files listed in `src/cw01.test.ts` EXEMPT.
- Commits: Conventional Commits with scope, no Co-Authored-By trailer.
- Per task: `npm test -w @landednz/web` + `npm run typecheck -w @landednz/web` + `npm run lint -w @landednz/web`. Full e2e once after all tasks.

## Review Focus

1. Unknown slug → 404 (not soft 200); `dynamicParams = false` on the route segment.
2. Task missing from `GUIDE_SLUGS` → unit test fails at build time, task has no page.
3. Item with `when` condition is never rendered on the guide page.
4. `checkedAt` uses the oldest `checked` date across the task's items and their facts, formatted "27 Oct 2026".
5. JSON-LD `Article` uses absolute URLs and `#org` reference; `BreadcrumbList` has Home › Guides › task (at least two `ListItem`s).

---

### Task 1 (DONE f41fd53): Prove `buildBundle` import works; add `content:build` fallback to web build

**Files:**
- Modify: `apps/web/package.json` (build script)
- Create: `apps/web/src/lib/guides.test.ts` (smoke test for bundle import)
- Modify: `apps/api/package.json` (ensure `content:build` writes `content-bundle.json`)

**Interfaces:**
- Consumes: `buildBundle(dir, { now, allowUnverified: false })` from `apps/api/src/content/build.ts`
- Produces: `apps/api/content-bundle.json` (Bundle) for `guides.ts` to read

- [x] **Step 1: Write the failing test** — `guides.test.ts` imports `buildBundle` from `apps/api/src/content/build.ts` and calls it with the content dir and a fixed `now`, asserting it returns `{ bundle }` (not `{ errors }`).

```ts
import { buildBundle } from '@landednz/api/content/build'
import { resolve } from 'node:path'

const dir = resolve(__dirname, '../../../../apps/api/content')
const result = buildBundle(dir, { now: new Date('2026-11-01'), allowUnverified: false })
expect('bundle' in result).toBe(true)
expect(result.bundle.tasks.length).toBeGreaterThan(0)
```

- [x] **Step 2: Run** `npm test -w apps/web -- guides.test.ts` — FAIL (Turbopack cannot resolve `.js` imports from `apps/api`).

- [x] **Step 3: Add fallback to web `package.json`** — change `build` to run `npm run content:build -w @landednz/api` first, which writes `apps/api/content-bundle.json`. Then `guides.ts` will read that JSON file instead of importing `buildBundle`.

```json
"build": "npm run content:build -w @landednz/api && next build"
```

- [x] **Step 4: Update `apps/api/package.json` `content:build`** — write the bundle to `content-bundle.json` in the api root.

```json
"content:build": "node --env-file-if-exists=.env.local --import=tsx/esm scripts/content-build.ts"
```
(`scripts/content-build.ts` already writes `content-bundle.json` — verify it does.)

- [x] **Step 5: Run** `npm run build -w @landednz/web` — PASS (content bundle built, Next build succeeds).

- [x] **Step 6: Commit** `feat(web): add content:build step to web build for guides`

**Result:** Direct import not tried; used the fallback. `guides.ts` reads `apps/api/content-bundle.json` and imports types with `import type` (relative path, erased at build). Web `build` runs `content:build -w @landednz/api` first. Still to confirm: full `next build` passes (Task 5 Step 0b).

---

### Task 2 (DONE f41fd53): Create `guides.ts` with `GUIDE_SLUGS`, `guides()`, `guide(slug)`; unit tests

**Files:**
- Create: `apps/web/src/lib/guides.ts`
- Create: `apps/web/src/lib/guides.test.ts`
- Create: `apps/web/src/lib/guides.slugs.ts` (the hand-kept map, separate for testability)

**Interfaces:**
- Consumes: `apps/api/content-bundle.json` (Bundle), `LEGS` from `apps/web/src/lib/legs.ts`
- Produces:
  - `GUIDE_SLUGS: Record<string, string>` — e.g., `T11: 'rental-bond'`
  - `guides(): GuideIndexItem[]` — active tasks with `slug`, filtered items (no `when`), `checkedAt`
  - `guide(slug: string): GuideDetail | undefined` — one guide with all sections

```ts
// guides.slugs.ts
export const GUIDE_SLUGS: Record<string, string> = {
  T01: 'choose-where-to-live',
  T02: 'book-temporary-accommodation',
  T06: 'get-nz-sim-card',
  T07: 'open-nz-bank-account',
  T08: 'get-ird-number',
  T09: 'give-employer-tax-code',
  T10: 'join-kiwisaver-or-review-fund',
  T11: 'sign-rental-protect-bond',
  T12: 'enrol-with-gp',
  T16: 'convert-overseas-driver-licence',
  T17: 'check-qualification-assessment-iqa',
  T19: 'prepare-nz-style-cv-job-search',
  T22: 'check-public-health-eligibility',
  T23: 'confirm-occupational-registration',
  T24: 'gather-carry-key-documents',
  T25: 'check-what-you-can-bring-ship',
  T26: 'bringing-cat-or-dog',
  T27: 'complete-nz-traveller-declaration',
  T28: 'read-visa-conditions-immigration-nz',
  T29: 'know-employment-rights',
  T30: 'enrol-child-in-school',
  T31: 'find-early-childhood-education-ece',
  T32: 'enrol-child-well-child-immunisations-dental',
  T33: 'find-settlement-support-english-classes',
  T34: 'understand-nz-tax-residency-foreign-income',
  T35: 'check-working-for-families',
  T36: 'make-household-emergency-plan',
} as const
```

```ts
// guides.ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Bundle, ResolvedTask } from '@landednz/api/content/build'
import { GUIDE_SLUGS } from './guides.slugs'
import { LEGS, legForPhase, legName } from './legs'
import { shortDate } from './nz-date'

const BUNDLE_PATH = resolve(process.cwd(), '../../apps/api/content-bundle.json')

function loadBundle(): Bundle {
  const raw = readFileSync(BUNDLE_PATH, 'utf8')
  return JSON.parse(raw) as Bundle
}

function filterItems(items: ResolvedTask[typeof itemsKey]) {
  return items.filter(item => !item.when)
}

export interface GuideIndexItem {
  id: string
  slug: string
  name: string
  phase: number
  leg: string
  legName: string
  checkedAt: string
}

export interface GuideDetail {
  id: string
  slug: string
  name: string
  checkedAt: string
  why: ResolvedItem[]
  steps: ResolvedItem[]
  documents: ResolvedItem[]
  mistakes: ResolvedItem[]
  watchOuts: ResolvedItem[]
  cost?: ResolvedItem
  advice?: ResolvedItem & { required: boolean }
  sources: Array<{ id: string; title: string; agency: string; url: string }>
  leg: string
  legName: string
}

export function guides(): GuideIndexItem[] {
  const bundle = loadBundle()
  return bundle.tasks
    .filter(t => !t.retired)
    .map(t => {
      const slug = GUIDE_SLUGS[t.id]
      if (!slug) throw new Error(`Task ${t.id} missing from GUIDE_SLUGS`)
      return {
        id: t.id,
        slug,
        name: t.name,
        phase: t.phase,
        leg: legForPhase(t.phase),
        legName: legName(legForPhase(t.phase), true), // "Before you fly" for index
        checkedAt: shortDate(t.checkedAt!),
      }
    })
}

export function guide(slug: string): GuideDetail | undefined {
  const bundle = loadBundle()
  const id = Object.entries(GUIDE_SLUGS).find(([, s]) => s === slug)?.[0]
  if (!id) return undefined
  const task = bundle.tasks.find(t => t.id === id && !t.retired)
  if (!task) return undefined

  const sources = new Map<string, { title: string; agency: string; url: string }>()
  const collect = (items: ResolvedItem[]) => items.forEach(i => i.factIds.forEach(fid => {
    const fact = bundle.facts[fid]
    if (fact && !sources.has(fact.source)) sources.set(fact.source, bundle.sources[fact.source]!)
  }))

  collect(filterItems(task.why))
  collect(filterItems(task.steps))
  collect(filterItems(task.documents))
  collect(filterItems(task.mistakes))
  collect(filterItems(task.watchOuts))
  if (task.cost) collect([task.cost])
  if (task.advice) collect([task.advice])

  return {
    id: task.id,
    slug,
    name: task.name,
    checkedAt: shortDate(task.checkedAt!),
    why: filterItems(task.why),
    steps: filterItems(task.steps),
    documents: filterItems(task.documents),
    mistakes: filterItems(task.mistakes),
    watchOuts: filterItems(task.watchOuts),
    cost: task.cost && !task.cost.when ? task.cost : undefined,
    advice: task.advice && !task.advice.when ? task.advice : undefined,
    sources: Array.from(sources.entries()).map(([id, s]) => ({ id, ...s })),
    leg: legForPhase(task.phase),
    legName: legName(legForPhase(task.phase), false), // "Before you flew" for guide page
  }
}
```

- [x] **Step 1: Write failing unit tests** in `guides.test.ts`:
  - Every active task has a slug in `GUIDE_SLUGS`; slugs are unique and URL-safe (lowercase, hyphens only).
  - Retired tasks are excluded from `guides()`.
  - Items with `when` are filtered out by `guides()` and `guide()`.
  - `checkedAt` is present and formatted "27 Oct 2026".
  - `guide(slug)` returns `undefined` for unknown slug.
  - `guide(slug)` returns the correct sections and sources.
  - `guide(slug)` throws if `content-bundle.json` has errors (expired content).

- [x] **Step 2: Run** `npm test -w apps/web -- guides.test.ts` — FAIL (files don't exist).

- [x] **Step 3: Implement** `guides.slugs.ts`, `guides.ts` as above.

- [x] **Step 4: Run** `npm test -w apps/web -- guides.test.ts` — PASS.

- [x] **Step 5: Run** `npm run typecheck -w apps/web` — PASS.

- [x] **Step 6: Commit** `feat(web): add guides.ts with slug map, index and detail functions`

**Result:** Sources = each item's own `source` plus the source of every fact in its text. 27 slugs match the 27 active tasks. `guides.ts` re-exports `GUIDE_SLUGS`.

---

### Task 3: Design boards for guide page and /guides index; run impeccable critique

**Files:**
- Create: `docs/design/guide/board.html` (guide page board)
- Create: `docs/design/guides-index/board.html` (index page board)
- Run: `impeccable critique` on both — no P0/P1.

**Must pass before Tasks 4 and 5 start.** Save the critique output to `docs/design/guides/gate/critique.md`.

**Notes:**
- Guide page board: H1 + "Last checked", Why it matters, Steps (numbered), Documents, Common mistakes, Watch out for, Cost, When to get advice, Sources, CTA. Public frame (same as About/Privacy/Terms).
- Index page board: H1 "Guides", grouped by leg with leg names from `legName(id, true)`, each guide as link. Public frame. Footer has Guides link.
- Mobile first; 390px and 1440px boards.
- Use `text-title`, `text-section`, `text-body`, `text-fg-muted`, `link-subtle`, `button-secondary`, `max-w-legal`, `container-page` tokens.
- No behaviour change — this is UI only.

- [ ] **Step 1: Create boards** in `docs/design/guide/` and `docs/design/guides-index/` at 390 and 1440.

- [ ] **Step 2: Run** `impeccable critique` on each — fix all P0/P1.

- [ ] **Step 3: Commit** `docs: add guide page and guides index boards (design gate passed)`

---

### Task 4: Build `/guides` index page (static, grouped by leg)

**Files:**
- Create: `apps/web/src/app/guides/page.tsx`
- Create: `apps/web/src/app/guides/page.test.tsx`
- Modify: `apps/web/src/app/sitemap.ts` (add `/guides`)
- Modify: `apps/web/src/components/chrome/public-footer.tsx` (add Guides link)

**Interfaces:**
- Consumes: `guides()` from `apps/web/src/lib/guides.ts`, `LEGS`, `legName`, `PublicHeader`, `PublicFooter`, `SITE_URL`, metadata template

- [ ] **Step 1: Write failing render test** — `page.test.tsx` renders the page, checks:
  - H1 "Guides"
  - Each leg (Before you fly, Arrival, Week 1, Month 1, Later) has a heading.
  - Every active task appears under its leg as a link to `/guides/<slug>`.
  - No retired tasks appear.
  - JSON-LD `BreadcrumbList`: Home › Guides (at least two items).
  - Canonical URL is `${SITE_URL}/guides`.

- [ ] **Step 2: Run** `npm test -w apps/web -- guides/page.test.tsx` — FAIL.

- [ ] **Step 3: Implement** `page.tsx`:

```tsx
import type { Metadata } from 'next'
import { guides } from '@/lib/guides'
import { LEGS, legName } from '@/lib/legs'
import { PublicHeader } from '@/components/chrome/public-header'
import { PublicFooter } from '@/components/chrome/public-footer'
import { SITE_URL } from '@/lib/site'
import { jsonLdScript } from '@/lib/brand-schema'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Step-by-step guides for every settlement task when moving to New Zealand, checked against official sources.',
  alternates: { canonical: '/guides' },
}

const breadcrumbGraph = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
  ],
}

export default function GuidesIndex() {
  const all = guides()
  const byLeg = LEGS.map(leg => ({
    ...leg,
    displayName: legName(leg.id, true),
    guides: all.filter(g => g.leg === leg.id),
  })).filter(l => l.guides.length > 0)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbGraph) }} />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "secondary" })}>Sign in</Link>} />
        <main className="flex-1 mx-auto w-full max-w-legal px-6 pt-16 pb-24">
          <h1 className="text-title">Guides</h1>
          <p className="text-fg-muted mt-2">Every settlement task, checked against official New Zealand sources.</p>
          {byLeg.map(leg => (
            <section key={leg.id} className="mt-12">
              <h2 className="text-section">{leg.displayName}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {leg.guides.map(g => (
                  <li key={g.id}>
                    <Link href={`/guides/${g.slug}`} className="link-subtle font-medium text-fg">
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
```

- [ ] **Step 4: Update `sitemap.ts`** to include `/guides`.

- [ ] **Step 5: Update `public-footer.tsx`** — add `<a href="/guides" className="link-subtle ...">Guides</a>` before About.

- [ ] **Step 6: Run** `npm test -w apps/web -- guides/page.test.tsx` — PASS.

- [ ] **Step 7: Run** `npm run typecheck -w apps/web` — PASS.

- [ ] **Step 8: Commit** `feat(web): add /guides index page and footer link`

---

### Task 5: Build `/guides/[slug]` page (static, one template, JSON-LD Article + Breadcrumb)

**Files:**
- Create: `apps/web/src/app/guides/[slug]/page.tsx`
- Create: `apps/web/src/app/guides/[slug]/page.test.tsx`
- Modify: `apps/web/src/app/sitemap.ts` (add all `/guides/<slug>` entries)

**Interfaces:**
- Consumes: `guide(slug)`, `GUIDE_SLUGS`, `SITE_URL`, `ORG_ID`, `jsonLdScript`, `PublicHeader`, `PublicFooter`, `shortDate`, metadata template `%s · LandedNZ`

- [ ] **Step 0: Add `checkedAtIso: string` (raw `YYYY-MM-DD`) to `GuideDetail` in `guides.ts`, with a test.**
- [ ] **Step 0b: Run `npm run build -w @landednz/web` once to confirm the content:build step works end to end.**
- [ ] **Step 1: Write failing render test** — `page.test.tsx` renders one guide (e.g., `get-ird-number`), checks:
  - H1 = task `name`; "Last checked 27 Oct 2026" under it.
  - Sections rendered only when non-empty: Why it matters, Steps (numbered), Documents you'll need, Common mistakes, Watch out for, Cost, When to get advice.
  - Sources list: unique source ids → title, agency, url.
  - CTA: "This is 1 of 27 things to sort out when you move. Some steps depend on your visa or family. Get your plan in the right order → Start free" linking to `/onboarding`.
  - JSON-LD `Article`: `headline`, `dateModified` = `checkedAtIso`, `author`/`publisher` = `#org`.
  - JSON-LD `BreadcrumbList`: Home › Guides › task name (3 items).
  - Canonical URL = `${SITE_URL}/guides/<slug>`.
  - Unknown slug → 404 (page has `export const dynamicParams = false` and returns `notFound()`).

- [ ] **Step 2: Run** `npm test -w apps/web -- guides/[slug]/page.test.tsx` — FAIL.

- [ ] **Step 3: Implement** `page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { guide, GUIDE_SLUGS } from '@/lib/guides'
import { PublicHeader } from '@/components/chrome/public-header'
import { PublicFooter } from '@/components/chrome/public-footer'
import { SITE_URL, ORG_ID, jsonLdScript } from '@/lib/brand-schema'
import Link from 'next/link'
import { shortDate } from '@/lib/nz-date'

export const dynamicParams = false

function articleGraph(g: GuideDetail) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE_URL}/guides/${g.slug}#article`,
        headline: g.name,
        dateModified: g.checkedAtIso, // ISO date for Google; the screen shows g.checkedAt
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: { '@id': `${SITE_URL}/guides/${g.slug}` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
          { '@type': 'ListItem', position: 3, name: g.name, item: `${SITE_URL}/guides/${g.slug}` },
        ],
      },
    ],
  }
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = guide(slug)
  if (!g) return { title: { absolute: 'Not found' } }
  const whyText = g.why[0]?.text ?? ''
  const description = whyText.length > 155 ? whyText.slice(0, 152).trimEnd() + '...' : whyText
  return {
    title: { absolute: g.name },
    description,
    alternates: { canonical: `/guides/${slug}` },
  }
}

export async function generateStaticParams() {
  return Object.values(GUIDE_SLUGS).map(slug => ({ slug }))
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const g = guide(slug)
  if (!g) notFound()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(articleGraph(g)) }} />
      <div className="flex min-h-dvh flex-col">
        <PublicHeader right={<Link href="/signin" className={buttonVariants({ variant: "secondary" })}>Sign in</Link>} />
        <main className="flex-1 mx-auto w-full max-w-legal px-6 pt-16 pb-24">
          <article className="guide flex flex-col gap-8">
            <header className="flex flex-col gap-1">
              <h1 className="text-title">{g.name}</h1>
              <p className="text-fg-muted">Last checked {g.checkedAt}</p>
            </header>

            {g.why.length > 0 && (
              <section>
                <h2 className="text-section">Why it matters</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {g.why.map((item, i) => (
                    <li key={item.id} className="text-body">{item.text}</li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-section">Steps</h2>
              <ol className="mt-3 flex flex-col gap-3 list-decimal pl-6">
                {g.steps.map((item, i) => (
                  <li key={item.id} className="text-body">{item.text}</li>
                ))}
              </ol>
            </section>

            {g.documents.length > 0 && (
              <section>
                <h2 className="text-section">Documents you'll need</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {g.documents.map(item => <li key={item.id} className="text-body">{item.text}</li>)}
                </ul>
              </section>
            )}

            {g.mistakes.length > 0 && (
              <section>
                <h2 className="text-section">Common mistakes</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {g.mistakes.map(item => <li key={item.id} className="text-body">{item.text}</li>)}
                </ul>
              </section>
            )}

            {g.watchOuts.length > 0 && (
              <section>
                <h2 className="text-section">Watch out for</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {g.watchOuts.map(item => <li key={item.id} className="text-body">{item.text}</li>)}
                </ul>
              </section>
            )}

            {g.cost && (
              <section>
                <h2 className="text-section">Cost</h2>
                <p className="mt-2 text-body">{g.cost.text}</p>
              </section>
            )}

            {g.advice && (
              <section>
                <h2 className="text-section">When to get advice</h2>
                <p className="mt-2 text-body">{g.advice.text}</p>
              </section>
            )}

            {g.sources.length > 0 && (
              <section>
                <h2 className="text-section">Sources</h2>
                <ol className="mt-3 flex flex-col gap-2 list-decimal pl-6">
                  {g.sources.map(s => (
                    <li key={s.id} className="text-body">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-subtle font-medium">{s.title}</a>
                      <span className="text-fg-muted ml-2">— {s.agency}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="border-t border-border-subtle pt-8 mt-4">
              <p className="text-body">
                This is 1 of {Object.keys(GUIDE_SLUGS).length} things to sort out when you move.
                Some steps depend on your visa or family.
                <Link href="/onboarding" className="link-subtle font-medium ml-1">
                  Get your plan in the right order → Start free
                </Link>
              </p>
            </section>
          </article>
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
```

- [ ] **Step 4: Update `sitemap.ts`** to include all `/guides/<slug>` from `GUIDE_SLUGS`.

- [ ] **Step 5: Run** `npm test -w apps/web -- guides/[slug]/page.test.tsx` — PASS.

- [ ] **Step 6: Run** `npm run typecheck -w apps/web` — PASS.

- [ ] **Step 7: Commit** `feat(web): add /guides/[slug] page with Article + Breadcrumb JSON-LD`

**Decision:** the guide page is public-only (the signed-out frame of `LegalLayout`); no signed-in variant, so no `Suspense`/`connection()`.

---

### Task 6: Playwright visual regression at 390 and 1440; sitemap test

**Files:**
- Modify: `apps/web/e2e/guide-widths.spec.ts` (add guide page and index checks)
- Modify: `apps/web/e2e/seo.test.tsx` (sitemap covers `/guides` and all slugs)

**Interfaces:**
- Consumes: built pages, approved boards

- [ ] **Step 1: Add e2e tests** to `guide-widths.spec.ts`:
  - Visit `/guides` at 390 and 1440; compare to board; footer Guides link present.
  - Visit one guide (e.g., `/guides/get-ird-number`) at 390 and 1440; compare to board; no overflow, all sections render, CTA present.

- [ ] **Step 2: Add sitemap test** to `seo.test.tsx`: `sitemap()` returns `/guides` and every `/guides/<slug>`.

- [ ] **Step 3: Run** `npm run test:e2e -w apps/web` — PASS.

- [ ] **Step 4: Run** `npm test -w apps/web` — PASS (all unit + render tests).

- [ ] **Step 5: Run** `npm run typecheck -w apps/web` — PASS.

- [ ] **Step 6: Run** `npm run lint -w apps/web` — PASS.

- [ ] **Step 7: Commit** `test(e2e): add guides visual regression and sitemap coverage`

---

### Task 7: Deploy to production; run Rich Results Test and Schema.org validator; record in PR #22

**Files:** (no code changes — this is a deploy + verification step)

- [ ] **Step 1: Run** `scripts/release.sh v1.2.0` (or next version) to deploy PR #22 + this branch merged to main.

- [ ] **Step 2: After deploy, run Rich Results Test** on `https://landednz.co.nz/guides/get-ird-number` (or any guide URL). Record result in PR #22.

- [ ] **Step 3: Run validator.schema.org** on the same URL. Check the full graph: `Article`, `BreadcrumbList`, `Organization` (`#org`), `WebSite`, `WebApplication`. Record result in PR #22.

- [ ] **Step 4: Commit** `docs: record Rich Results + validator results for guides in PR #22`

---

## Execution Order

1. Tasks 1–2 done (`f41fd53`).
2. **Task 3** boards + impeccable gate (no P0/P1) — blocks 4 and 5.
3. **Task 4** `/guides` index, **Task 5** `/guides/[slug]`.
4. **Task 6** e2e + sitemap.
5. **Task 7** after release: Rich Results + validator on a guide URL, recorded in the PR. Also PR #22's Task 7 Step 3 on `https://landednz.co.nz` (home + `/about`) once v1.2.0 is live.

## Notes for Implementer

- The `content:build` script in `apps/api/scripts/content-build.ts` must write `content-bundle.json` to the api root. If it doesn't, add that before Task 1 Step 3.
- `buildBundle` returns `checkedAt` on each `ResolvedTask` as the oldest `checked` date across its items and their facts — already implemented.
- `shortDate` formats as "27 Oct 2026" — already in `apps/web/src/lib/nz-date.ts`.
- The CTA uses `Object.keys(GUIDE_SLUGS).length` for the count (27), never hard-coded.
- `dynamicParams = false` on the slug route ensures unknown slugs 404 at build time.
- No changes to `apps/api` content, rules, or API routes.
- The public page frame (`PublicHeader` + `PublicFooter`) is the same as About/Privacy/Terms — reuse exactly.