# Public Screens and Gate Gaps (S1–S4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Finish the final-screens redesign. Landing, Sign in and Save must match their boards. Close the open gaps from the P7 critique. Then audit the whole branch against main for behaviour changes nobody asked for, before the owner signs off.

**Spec:** `docs/superpowers/specs/2026-10-29-final-screens-design.md`. §4.1 was amended on 2026-10-29. This plan follows on from `docs/superpowers/plans/2026-10-29-final-screens.md`; its Global Constraints apply here unchanged, apart from the branch.

**Boards:** `docs/design/r1-final/*.dc.html`. The gate shots and both critiques are in `docs/design/r1-final/gate/`; the open findings are in `critique-independent.md` under "## Fix round 2".

## Global Constraints

- Work in worktree `/Users/ruchira/Development/NZ_Project/landednz-r0p`, on branch `feat/r1-public-screens`, which is cut from `feat/r0-polish`.
- **No behaviour change.** UI tasks change markup, classes, tokens and the copy the boards show, and nothing else.
  - These stay exactly as they are:
    - auth handlers;
    - the `NEXT_PUBLIC_AUTH_PASSWORD_ENABLED` switch;
    - redirects, cookies and API calls;
    - API code and data logic.
  - Any `apps/api` or `packages/types` diff is a defect. Reviewers flag it as Important.
- Type set {48, 24, 22, 18, 15, 13, 12}, through the text tokens only. The Google button keeps Roboto 15. Raw values go in `globals.css` `@theme` only.
- Phone is `max-narrow:` (under 561 px).
- Checks and e2e run on ports 3100/3101 only. A branch dev server is running on 3000/3001 for the owner: leave it alone.
- Never touch `.env.local` or `supabase/.env`. Leave the untracked `apps/web/PRODUCT.md` alone.
- Conventional Commits with a scope. No Co-Authored-By trailer.
- **Impeccable before every UI task.** Run `impeccable context` and read `craft-floor.md`. After building, run `impeccable critique` on the page and save the full output under `docs/design/r1-final/gate/`. Fix every P0/P1 before the commit.
- Each task ends with these passing:
  - `PORT=3199 make check`;
  - the e2e suite: `E2E_WEB_URL=http://localhost:3100 E2E_API_URL=http://localhost:3101 npm run test:e2e -w apps/web`.

## Sessions

| Session | Task |
|---|---|
| 1 | S1, S2, S3, S4 |

---

### Task S1: Sign in and Save your roadmap

**Boards:** PsSignIn, PsSignInPhone, PsSave, PsSavePhone. Spec §4.1.

**Files:**
- `apps/web/src/app/signin/sign-in-form.tsx`
- `apps/web/src/app/signin/sign-in.test.tsx`
- `apps/web/src/app/globals.css`, only for new layout tokens if needed

Steps:
- [ ] **One centred `Card`.**
  - 1440: 460 px wide, padding 32, gap 20, with `shadow-lift`, centred in `main` with 48 px vertical padding.
  - Phone: full width inside a 16 px gutter, padding 24/20, gap 18.
- [ ] **Card contents, in order:**
  1. On Save only, the back link "Your roadmap preview", followed by the summary chip (next step).
  2. The h1, "Sign in" or "Save your roadmap".
  3. The line "Sign in to tick tasks off, pick up where you left off on any device, and ask about any task. New here? Continue with Google to create your account."
  4. The Google button: `.gsi`, full width, 48 px.
  5. If the password switch is on:
     - the "or use email" divider;
     - Email and Password, as labels in medium 15 with 44 px fields;
     - a full-width primary 48 px button, "Sign in" or "Save and sign in".
  6. The Google consent line, `text-small text-muted`, centred, last.
- [ ] **The Save summary chip.** It replaces the `Saving` side panel.
  - Style: teal tint, with a 16 px ringed dot.
  - Line 1, in semibold small: "Saving your roadmap · n tasks". n comes from the existing `getRoadmapPreview` call. While it loads or if it fails, show just "Saving your roadmap".
  - Line 2, in small muted: the short form from a new `answersShort(a)` in `lib/answers.ts`, for example "Working holiday visa · Auckland · just you · lands 30 Oct". Use the existing `answerLabel`, `WHO` and an existing short-date helper. Skip the city when it is `OTHER`. Add a vitest case for it.
- [ ] **Unchanged:** the error alert, `signInWithPassword`, `signInWithGoogle`, `safeRedirect`, the auth/verify call and the `/auth/complete` navigation. The behaviour tests in `sign-in.test.tsx` must still pass. Update only their structural queries.
- [ ] **Screenshots** of `/signin` (with and without the answers cookie) at 1440×900 and 390×844. Compare them with the boards. Save them as `docs/design/r1-final/gate/signin-*.png` and `save-*.png`.
- [ ] Commit `feat(web): sign in and save match their boards`.

### Task S2: Landing

**Boards:** PsLanding, PsLandingPhone. Spec §4.1.

**Files:**
- `apps/web/src/components/marketing/landing-hero.tsx`
- `apps/web/src/components/marketing/roadmap-preview-figure.tsx`
- The landing feature section and footer components, if the phone board differs from them
- `apps/web/src/app/landing.test.tsx`

Steps:
- [ ] **Preview figure rows.**
  - Separate the rows with a hairline. Drop the route line.
  - Status marks:
    - done: filled teal circle with a white tick;
    - next: ringed teal dot;
    - blocked: dashed grey circle;
    - later: hollow grey circle.
  - Text: every title at `text-body`, the next row's title in medium. The meta sits on the right, in small muted, on both 1440 and phone, as on the boards.
- [ ] **Build my roadmap** gets a trailing chevron.
- [ ] **Phone board:**
  - The lede is `text-body`.
  - **Build my roadmap** is full width, with "You see it before you sign up." centred under it.
  - Hide the contour lines on phones.
  - The footer text and its links sit on one row.
- [ ] **Screenshots** at 1440 and 390. Compare them with the boards and save them as `landing-*.png`.
- [ ] Commit `feat(web): landing matches its boards`.

### Task S3: Gaps from the P7 critique

**Source:** `critique-independent.md`, "## Fix round 2", P2 items 1–3 and P3 items 5 and 7. Also the width and gutter difference, because the boards win (spec §2.1).

Steps:
- [ ] **Width and gutter.**
  - At 1440, the page content edge sits at 160 px, the same as the boards' `.hd` and `.ft`, which have 160 px padding. So the content is 1120 px.
  - Phone gutter: 16 px.
  - Change `--container-page` and the `container-page` padding in one place, then re-check every page.
- [ ] **P2-1, the "now" and "You're here" markers.**
  - The marker belongs on the calendar stage, where the Today line sits.
  - An earlier stage that holds only overdue tasks is labelled "still open".
  - Make the change in `lib/route-progress.ts`, which positions the pill and the "now" label. Do not change counts or task states.
  - Add `route-progress` vitest cases:
    - on day 1, with open Before-you-flew tasks, "now" is on Arrival;
    - before arrival, it stays on Before you flew.
- [ ] **P2-2, the task page Sources card**, matching the Task board:
  - the title is `text-section` (18);
  - a numbered column;
  - hairlines between rows;
  - "n more sources" as a teal link.
  - The domain lines and the "Ask about your IRD number" title are owner rulings already kept; leave them.
- [ ] **P2-3, the Settings radios** in `components/onboarding/option-row.tsx`:
  - the radio is 20 px, with a 1.5 px border, and when selected a teal fill with an 8 px white centre;
  - the option column is the board's width;
  - Build my roadmap shares the component, so re-check it.
- [ ] **P3-5, the Roadmap phone carried title:** put ", n still open from …" on its own 13 muted line under the title.
- [ ] **P3-7, Home "Then this week":**
  - markers are 20 px circles;
  - **Start task** and **Ask about this** are 44 px tall.
- [ ] **Re-shoot** the affected pages at 1440 and 390, and save the shots to the gate folder.
- [ ] Commit `fix(web): close the P7 critique gaps`.

### Task S4: Behaviour audit and whole-branch gate

Steps:
- [ ] **Behaviour audit** against main, at `d37e29241a6827d029f5de31711bc4ab672908fe`.
  - Cover every non-presentational diff in:
    - `apps/api/**`
    - `packages/types/**`
    - `apps/web/src/lib/**`
    - `apps/web/src/app/**/route.ts`
    - `apps/web/src/proxy.ts`
  - List each change in `docs/design/r1-final/gate/behaviour-audit.md`, with the spec section that asked for it.
  - Revert anything no spec section asked for to main's behaviour, with tests.
- [ ] **Manual click-through** on 3100/3101, signed in as a real local user:
  - onboarding, then preview, then Save, then email sign-in, then Home;
  - complete a task and reopen it;
  - change an answer in Settings, then save and rebuild;
  - open Ask on a task (`?ask=1`) and get a reply in mock mode;
  - sign out, then sign in again.
  - Record each result in `behaviour-audit.md`.
- [ ] **Gate re-shoot** of every page at 1440 and 390. Update `gate/README.md`. Run the font-size check. Run axe with `test:e2e`.
- [ ] **Final impeccable critique** of all pages, with the full output saved in `gate/critique-final.md`. There must be no P0/P1.
- [ ] Commit `docs: public screens gate and behaviour audit`.
- [ ] **Final whole-branch review on opus**, from the merge base to HEAD. Then one fix wave and one re-review.
