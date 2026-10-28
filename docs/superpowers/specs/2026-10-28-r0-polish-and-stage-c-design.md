# R0 polish and Stage C (cloud): design

Date: 2026-10-28 · Parent spec: `2026-10-24-r0-foundation-design.md` (§5, §8) · Boards: `docs/design/r0-polish/`,
canvas https://claude.ai/artifact/778HVTsFG43hyKeJMJ4ENh version `1793169870-b87a`

## 1. Purpose

R0 runs end to end locally (Stages A and B, PRs #1–#5 merged). Before the cloud release, the signed-in app
gets a polish pass so it looks premium, not a prototype. Then Stage C puts R0 on staging and production.

Two tracks, one release:

| Track | What | Who |
|---|---|---|
| P. Polish | Tokens, Home, Roadmap page, task page, Settings, shared states, footer on every page | agent, local |
| C. Cloud | §5.6 owner prerequisites, then deploy config, monitoring, staging check, release `r0` | owner first, then agent |

The owner prerequisites (track C, step 0) only need the owner and can run alongside track P. Cloud build tasks
start when the checklist is ticked. Release `r0` waits for both tracks.

### Success criteria

- The built Home, Roadmap, task page and Settings match their polish boards at 1440 and 390 px (CW02′).
- Every page uses only the sizes in §3.1. The polish boards' States board is implemented where the app has that state.
- `make check` and `make test-e2e` green; axe clean; an impeccable critique of the built pages has no P0/P1.
- Staging runs with `AI_MODE=live`: the e2e journey passes against `BASE_URL=https://staging…`.
- Production is on `landednz.co.nz`, tagged `r0`, health job green, Sentry and PostHog receive events.

### Non-goals

Redesigning the Ask answer panel and adding an avatar menu: both stay as built and get their own boards later.
Landing, onboarding, sign-in and legal pages only get the token changes and the shared footer, not new boards. No dark mode, no
new font, no payments.

## 2. Decisions made during brainstorming (2026-10-28)

1. **The minimalism validator is retired.** Constitution rule CW07 is deleted and the `minimalism-validator`
   skill removed. Designs are judged by the impeccable skill (`critique`, `audit`, `polish`) plus
   `web-design-guidelines` and `accessibility`. CLAUDE.md files and the R0 spec's §7.1, §7.3 and §9 references are updated to match.
2. **Surfaces are the landing card.** Page `#FFFFFF`; cards `#FFFFFF`, 1 px `#E3E8EA` border, radius 12,
   shadow-lift (`0 1px 2px rgba(15,42,58,.04), 0 16px 48px rgba(15,42,58,.08)`). Cream and wash backgrounds are not used for cards.
3. **Layout:** a main column that grows plus a 360 px side column on every signed-in page. Cards in the same row share a height. Home has no empty band at the bottom.
   Home lists cap at 3 rows with a "see all" link. Every page ends with the landing footer.
4. **Your roadmap card is "the track" (concept B).** A tramping-track hill profile: the walked part is teal with a fade,
   a flag marks the end of each stage, faint contour lines echo the landing hero, and a "You · …" pin marks the traveller.
   Concepts A (flight) and C (tiles) were rejected.
5. **Task page:** sources move into the side column under Status and Ask. Every cited source is listed, each opening in a new tab.
   Phone numbers are `tel:` links. Previous and next task appear as named cards.
6. **First visit greets with "Welcome, {first name}"**. Once the traveller has arrived it reads "Welcome to {city}, {first name}".

## 3. Track P: polish

### 3.1 Sizing (the rules board, `Details.dc.html`)

| Token | Now | New |
|---|---|---|
| Page title (`--text-title`) | 32 | **24** (22 under 561 px), 600, -0.015em |
| Section title (`--text-section`) | 20 | **18**, 600, -0.01em |
| Body / card title | 15 | 15 (card title 600) |
| Meta (`--text-small`) | 13 | 13; only citation numbers go smaller (12 px with a 24 px tap area) |
| Landing hero (`--text-hero`) | 48 | 48 (landing only, unchanged) |
| Control radius | 6 | **8** |
| Surface radius | 10 | **12** |
| Controls | 40 / 44 mixed | 40 desktop. **Under 561 px every button, chip and field is 44** |
| Small button | 32 | 32 desktop headers and task nav only; 44 on phones |
| Text links | — | at least a 24 px tap area |
| Card padding | mixed | 20 (16 under 561 px); 16 between cards and page sections |
| Home grid | `1fr 320px` | `1fr 360px` |
| Settings grid | `280px 560px` | `1fr 360px` (plan card spans two rows; Account and Delete stack beside it) |
| Task grid | `680px 1fr`, gap 64 | `1fr 360px`, gap 16, cards; side not sticky |

The values live only in `globals.css` `@theme` (CW01). The board's `build.py` is the reference for anything not listed.

### 3.2 Shared parts

- **Card**: one `Card` component (`components/ui/card.tsx`) with `CardHead` (title left, meta or link right, baseline-aligned)
  and an optional footer pushed to the bottom (`mt-auto`), so cards in one row line up.
- **Footer**: `PublicFooter` renders on every page, signed-in pages included: "General information, not legal or tax advice." with Privacy and Terms.
- **States** (`States.dc.html`): loading placeholders in the cards' shape (pulse off with reduced motion, shown after 300 ms);
  the API-down card; a field error under the field on save; a toast for saved with Undo (6 s, kept while hovered or focused);
  task done shown in place with Undo for 6 s; busy buttons say "Saving…" at the same width; Ask "Checking official sources…" and an error that keeps the
  question; a delete dialog with focus on "Keep my account"; empty cards that say what happens next; a teal focus ring; disabled
  buttons with the reason beside them.

### 3.3 Home (`Main`, `HomeLater`, `HomePhone`)

From top to bottom: the greeting and subline; the **Your roadmap** card (the track) with "N of M done · Open roadmap"; then a two-column grid:
Up next (main) next to Your plan (side), and Also this week (main) next to Recently done (side). Lists cap at 3 rows.
Recently done when empty says "Nothing yet. Tasks you finish show up here, newest first." and links "Already done some? Tick them off".

**The track (`components/route/route-track.tsx`)**: an inline SVG, `aria-hidden`. A visible summary (stage labels, or on phones one
line "Week 1 · 0 of 5 · 6 days left") carries the same information as text. Geometry is from `build.py` `route_track`:

- The x axis runs 0–1000 with five stages of 200 each, and a flag at each stage end. A flag is filled teal when the traveller has passed it.
- The pin sits at `stage × 200 + 200 × f`. Before arrival `f = max(0.2, done/total)` of the current stage. From arrival
  `f` is the share of that stage's days reached, today included (Arrival days 1–2, Week 1 days 3–8, Month 1 days 9–31, Later days 32–61; capped at 1). So day 3 of the journey (the first day of Week 1) is x 433, which matches the board.
- The pin label: before arrival "You · {n} days to go"; after "You · day {n}".
- Terrain is a fixed profile (`terrain_y`), not data. Under 561 px the stage labels hide and the summary line shows.
- Stage names and dates come from `lib/legs.ts` (`LEGS`, `legWhen`). The first stage reads "Before you fly" until the arrival date and "Before you flew" from then on.

`lib/route-progress.ts` holds the x and label maths with unit tests. The SVG component only draws.

### 3.4 Roadmap page (`Roadmap`, `RoadmapPhone`)

The title "Your roadmap" and "N of M done · landed {date}" (before arrival: "arriving {date}"); the track card at full width (120 px tall);
then the grid. Main: the **current stage** card (outlined in ink, every task row with its time, the current task tagged
"Up next"), then an **Other stages** card with one row per remaining stage (dot, name, count and dates, a "Show" button that expands
its tasks in place). Side: **Up next** (title, why, Start task) and **Key dates** (landed or arriving, end of Week 1, end of Month 1,
a "Change your arrival date" link to Settings). It replaces the vertical `RouteRail` and the progress bar.

### 3.5 Task page (`TaskPage`, `TaskPhone`)

Layout `1fr 360px`, gap 16, with white cards. The title is 24 (22 on phones). The side column, in order: Status (mark done), Ask, then **Sources**
("All checked {date} · open in a new tab", a numbered list of every cited source with domain and ↗,
`target="_blank" rel="noopener"`, and visually hidden "(opens in a new tab)"). Citation numbers are 12 px with a 24 × 24 tap area.
NZ phone numbers in content render as `tel:` links. The bottom of the article has previous and next task cards ("← Previous task / {title}").
On phones it is one column, the side cards come after the content, and chips and buttons are 44.

### 3.6 Settings (`Settings`, `SettingsPhone`)

The title, then the grid: the Your plan card (two-column form, Save changes disabled with "No unsaved changes" until something changes)
spanning two rows, next to Account and Delete account. The delete flow uses the States dialog.

### 3.7 Out of scope for P

The landing, onboarding, sign-in and legal pages keep their approved boards. They only pick up the token changes, and their screenshots are re-checked.

## 4. Track C: cloud (parent spec §5, §8 stage C, §10)

### 4.1 Owner prerequisites (first; checklist in `docs/setup/deploy-runbook.md`)

Domain, two Supabase projects, Render, Railway, Vercel, the Google OAuth client with both callbacks, Anthropic workspaces and keys
with spend limits, an OpenAI key with a spend limit, Sentry, PostHog, GitHub secrets, and fresh CLI logins. The runbook lists each with the
exact values to copy back. The agent never creates accounts or handles payment. It verifies each item after the owner ticks it.

### 4.2 Code and config the agent adds

| Item | Where |
|---|---|
| `trustProxy` behind one proxy hop (env `TRUST_PROXY`, default off locally) | `apps/api/src/server.ts`, `shared/config.ts` |
| Sentry: API (`@sentry/node`, init before Fastify, release = commit SHA) and web (`@sentry/nextjs`) | `apps/api/src/instrument.ts`, `apps/web/sentry.*.config.ts`, `instrumentation.ts` |
| PostHog web (page views, no autocapture of inputs); off when the key is unset | `apps/web/src/lib/analytics.ts`, root layout |
| Render staging service (Docker, pre-deploy `prisma migrate deploy`, health `/health`) | `render.yaml` |
| Railway production (Dockerfile, pre-deploy migrate, health check) | `railway.json` |
| Vercel project config (`syd1`, root `apps/web`) | `apps/web/vercel.json` |
| Health job every 6 h for staging and production; opens an issue on failure | `.github/workflows/health.yml` |
| Staging smoke + axe after merge to `main` | `.github/workflows/staging.yml` |
| Release script: fast-forward `production`, tag, smoke production | `scripts/release.sh`, runbook |
| Env examples for staging and production (names only, no values) | `docs/setup/env-staging.md` |

### 4.3 Order

1. Owner checklist ticked, then the agent verifies logins, projects and DNS from the CLIs.
2. Code items above on a branch → PR → CI green → merge.
3. Staging: Supabase `landednz-staging` bootstrap (`db:bootstrap`, live embeddings), Render service, Vercel staging domain,
   OAuth callbacks; e2e + axe with `BASE_URL` against staging and `AI_MODE=live`.
4. `security-review`, deploy checklist, then production: Supabase `landednz-prod` bootstrap, Railway, Vercel production domain, DNS,
   Google-only sign-in; production smoke; tag `r0`.
5. The runbook records the deploy, rollback and DNS steps as run.

### 4.4 Risks

| Risk | Mitigation |
|---|---|
| Render free cold start (30–60 s) fails staging e2e | Warm-up request with a 90 s retry before the suite |
| Supabase free project pauses | Health job queries the DB every 6 h |
| A Railway Docker build differs from local | The same Dockerfile is proven on Render first; `make docker-api` before every release |
| Live AI cost | `CHAT_DAILY_CAP` lower on staging; workspace spend limits |
| DNS propagation delays the release | Staging runs on platform URLs until the domain resolves |

## 5. Testing

- Unit: `route-progress` (pin x, labels before and after arrival, cap at the last stage), the tel-link and source-list helpers, and Home's 3-row caps.
- Component: Card row alignment, Settings Save disabled until dirty, the toast's Undo restoring the old answers.
- E2E: the existing journey plus the Roadmap "Show" expand, opening a source in a new tab, the task page's previous and next links.
- Screenshot baselines re-captured after the owner signs off the built pages.
- Design: impeccable `critique` and `audit` on the four built pages at 1440 and 390; P0 and P1 findings fixed.

## 6. Open content questions (owner judgement, not blocking the build)

Board placeholder copy: "Partner work visa", "Greater Christchurch" vs "Christchurch", the Week 1 task names and times.
The build uses the KB's real task names and durations, so the boards' placeholder text does not ship.

## 7. Approvals

| Board | Version id | Approved on |
|---|---|---|
| Polish: Home (first visit, day 3, phone), Your roadmap card B, Roadmap page, task page, Settings, States, sizing rules | 1793169870-b87a | pending owner review of this spec |
