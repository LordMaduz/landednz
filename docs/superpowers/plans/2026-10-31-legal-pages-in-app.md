# Privacy & Terms in the App Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A signed-in user who opens Privacy or Terms stays in the app: same header and tab bar, content at the app's left edge, text in one 720 px card (no card on phones). Signed-out visitors keep today's public page.

**Architecture:** `LegalPage` (both routes use it) wraps an async frame in `<Suspense>` (needed under `cacheComponents: true`). The frame reads the Supabase user and renders a sync `LegalLayout` with `user: HeaderUser | null`. Signed in → `AppHeader` + `Card` + `TabBarSpace`; signed out → today's `PublicHeader` + centered column + `PublicFooter`.

**Tech Stack:** Next.js 16 App Router (cacheComponents), React 19, Tailwind v4 tokens in `globals.css`, Vitest + Testing Library, Playwright.

**Spec:** Owner-approved mockup `/private/tmp/claude-501/-Users-ruchira-Development-NZ-Project/e79d59f3-de6f-4686-8cf2-7c3b6256d656/scratchpad/legal-pages-plan.html` (2026-10-31), sections 2, 3 and 5.

## Global Constraints

- Legal markdown, API, sign-in page: not touched.
- Opened in the same tab (no `target="_blank"`).
- Reading width: `--container-reading` (720 px); desktop content starts at the `container-app` edge, same as Settings.
- Phones (`max-narrow`, < 561 px): no card border/shadow/padding; text full width; tab bar shows with **You** current (`active="settings"`).
- Title row copies Settings: `h1.text-title`, muted "Last updated …" line.
- Signed-out render is pixel-identical to today.
- No new tokens, no new components beyond what `legal-page.tsx` exports.

## Review Focus

- Guide full view open on Home, then avatar menu → Privacy: header must not stay in "Guide" mode → Privacy/Terms menu items call the guide store `close` (Task 1 test).
- Signed-in page must not show "Sign in" or the public footer → Task 1 unit test.
- Signed-out `/privacy` keeps the footer at the bottom and passes a11y → existing `footer.spec.ts` and `a11y.spec.ts` run unchanged in Task 2.
- Title and card left edge must line up with the logo at 1024/1440/1920 → Task 2 e2e.
- First markdown heading inside the card must not add 32 px of empty space above it → `.legal > :first-child { margin-top: 0 }` (Task 1 step 3, checked in Task 2 screenshots).

---

### Task 1: Signed-in legal layout

**Files:**
- Modify: `apps/web/src/components/marketing/legal-page.tsx`
- Modify: `apps/web/src/app/globals.css:511` (`.legal` rule)
- Modify: `apps/web/src/components/chrome/app-header.tsx:134-141` (Privacy/Terms menu items)
- Test: `apps/web/src/app/legal.test.tsx`

**Interfaces:**
- Produces: `LegalPage({ title, updated, file })` (unchanged signature, used by both `page.tsx`); `LegalLayout({ title, updated, file, user }: { …; user: HeaderUser | null })` exported for tests.

- [ ] **Step 1: Rewrite the tests to render `LegalLayout`** (async server components can't render in jsdom). Keep every existing assertion, rendering `<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={null} />` and the Terms equivalent; keep the `metadata` imports from the pages. Add:

```tsx
const USER = { name: 'Aroha Ngata', initials: 'AN', email: 'a@example.com' }

describe('signed in', () => {
  it('uses the app frame: nav and account, no Sign in, no footer', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={USER} />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account, Aroha Ngata' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull()
    expect(document.querySelector('footer')).toBeNull()
    expect(headings(1)).toEqual(['Privacy'])
  })
})

describe('signed out', () => {
  it('keeps the public page', () => {
    render(<LegalLayout title="Privacy" updated="24 October 2026" file="privacy" user={null} />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull()
  })
})
```

- [ ] **Step 2: Run** `cd apps/web && npx vitest run src/app/legal.test.tsx` — Expected: FAIL, `LegalLayout` is not exported.

- [ ] **Step 3: Implement in `legal-page.tsx`.**
  - `LegalPage` → `<Suspense fallback={<div className="min-h-dvh" />}><LegalFrame {...props} /></Suspense>`; a blank fallback so neither frame flashes.
  - `async function LegalFrame(props)`: `await connection()`, `getUser()` via `createClient()` from `@/lib/supabase/server`, pass `user ? userBadge(user) : null` to `LegalLayout`.
  - `LegalLayout` signed out: today's markup, except the centering/padding now lives on `<main>` as utilities (`mx-auto w-full max-w-legal px-6 pt-16 pb-24`), with `.legal` on it for the prose.
  - `LegalLayout` signed in: `AppHeader active="settings"`, `<main className="container-page container-app py-6 max-narrow:py-4">`, a title block (`mb-5`, `h1.text-title`, muted date), then `<Card className="legal max-w-reading max-narrow:border-0 max-narrow:bg-transparent max-narrow:p-0 max-narrow:shadow-none">` holding the markdown, then `<TabBarSpace />`.
  - `globals.css`: `.legal` keeps only `display:flex; flex-direction:column; gap:16px` + the existing h2/p/li/ul rules; add `.legal > :first-child { margin-top: 0; }`.
  - `app-header.tsx`: add `onClick={close}` to the Privacy and Terms `Menu.Item`s (the full guide view would otherwise stay open over the new page).

- [ ] **Step 4: Run** `cd apps/web && npx vitest run src/app/legal.test.tsx src/components/chrome/app-header.test.tsx && npx tsc --noEmit` — Expected: all PASS, no type errors.

- [ ] **Step 5: Commit** only the four files above:

```bash
git add apps/web/src/components/marketing/legal-page.tsx apps/web/src/app/globals.css apps/web/src/components/chrome/app-header.tsx apps/web/src/app/legal.test.tsx
git commit -m "feat(web): Privacy and Terms keep the app frame when signed in"
```
(`globals.css` and `app-header.tsx` already carry uncommitted design-system work; stage only this task's hunks with `git add -p`.)

### Task 2: E2E frame check + visual verify

**Files:**
- Modify: `apps/web/e2e/app-frame.spec.ts` (signed-in path loop)

- [ ] **Step 1: Add `/privacy` and `/terms`** to the signed-in `for (const path of [...])` loop, and for those two paths assert the `h1` left edge equals the header logo's left edge (±1 px).
- [ ] **Step 2: Run** `cd apps/web && npx playwright test e2e/app-frame.spec.ts e2e/footer.spec.ts e2e/a11y.spec.ts` — Expected: PASS (signed-out footer/a11y specs unchanged).
- [ ] **Step 3: Screenshots** of `/privacy` signed in at 1440×900 and 390×844, and signed out at 1440, saved to the scratchpad; check them against the mockup (left edge, card at 720, no card on phone, You tab current).
- [ ] **Step 4: Commit** `git add apps/web/e2e/app-frame.spec.ts && git commit -m "test(web): legal pages sit in the app frame"`.
