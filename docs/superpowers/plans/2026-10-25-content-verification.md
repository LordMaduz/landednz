# Content Verification Implementation Plan (Plan 2 of 2: verified content and UI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every converted, unverified legacy item with researched, independently verified, owner-approved content, so `content:build` passes without `CONTENT_ALLOW_UNVERIFIED` and deploys can resume.

**Architecture:** Plan 1 built the platform (YAML → `content:build` → bundle → content module → chunk sync). This plan runs the spec's research stages 0–4 on top of it, adds the two small tools those stages need (a stricter gate and a per-task review page), applies any approved dimension and task-inventory changes to existing users, ships the per-item source links UI, and deletes the conversion bridge.

**Tech Stack:** Node 24, TypeScript 7, zod 4, `yaml`, Fastify 5, Prisma 7, Next 16 / React 19 / Tailwind 4 / shadcn, Vitest 5, Playwright. Research: `anthropic-skills:deep-research`, WebSearch/WebFetch.

**Spec:** `docs/superpowers/specs/2026-10-24-content-platform-design.md` (§5, §6 steps 5–9, §8). Plan 1: `docs/superpowers/plans/2026-10-24-content-platform.md`; its ledger `.superpowers/sdd/2026-10-24-content-platform/progress.md` holds rulings R1–R21 this plan builds on.

## Global Constraints

- Everything in Plan 1's Global Constraints still holds (content paths, item fields, allowed domains, fact pattern, denylist, staleness, `verified` gate, phases, C02/C07/C10/C12, auth never mocked, commit format).
- Sources: official NZ sources only (`govt.nz` and subdomains, `legislation.govt.nz`, the Crown-entity allowlist); `provider` sources only behind type C facts, each with a `reason`.
- Writing rules (spec §5): short paraphrase in neutral second person; no long copying of government text; no persona names or single-household details; home-country matters only as the D2 note ("check your own country's rules with a professional there"), plus the official NZ list where NZ treats countries differently.
- Visa items state Immigration NZ's published information and never advise on the user's own case (Immigration Advisers Licensing Act 2007 boundary, confirmed in Task 1). Tax and tenancy items stay informational and carry the advice item where the official guidance says to get advice.
- Not-supported items are fixed or removed, never softened.
- `verified: true` is set only after the owner approves the task's review page (stage 4), never by an agent on its own.
- Owner gates (Tasks 1, 2, every content task, every board) stop the session until the owner answers; record the answer and date in the ledger.
- Deploys stay blocked until Task 15 passes (Plan 1, owner approved 2026-10-24).
- Prisma: `schema.prisma` declares `embedding` and its ivfflat index since PR #3, so `prisma migrate dev --create-only` no longer proposes dropping them; still read every generated SQL file before applying.
- Commits: Conventional Commits with scope (`feat(content):`, `docs(content):`; a verified task is `docs(content): verify T08 <name>`), ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Content procedure (stages 2–4, one task at a time)

Every content task (7–12) runs this per settlement task `<id>`. Amended after the T08 pilot (Task 7, 2026-10-25); the ledger lists what changed and why.

1. **Research (stage 2).** Use `anthropic-skills:deep-research` restricted to the sources allowed above; its notes go in `research_notes/<title>/` beside the repo, never inside it. Every researcher brief says: quote from the raw page (`curl -sL`, PDFs extracted locally), not from WebFetch summaries, which paraphrase; a page that does not open is "unconfirmed", never a search snippet. The report-writer brief also writes `apps/api/content/research/<id>.md` with sections `## Questions`, `## Sources used` (url, short verbatim quote, date opened), `## Sources rejected` (url, reason), `## Uncertainties` (each with what would settle it), `## Deliberately not said`, `## Findings`. One extra research round is allowed for a gap that changes what a line would say.
2. **Write.** Rewrite `content/tasks/<id>.yaml` from the research note (not from the legacy text): new item ids `<id>.<section>.<slug>`, every figure a fact in `content/facts/<agency>.yaml`, every source in `sources.yaml` with a real `title` and `agency`. Items stay `verified: false`. Remove legacy sources and facts nothing cites any more (grep the other tasks first). Where official pages disagree, an item states what its cited page says and names that page; it never picks a side. A claim only one agency makes (e.g. INZ) that another agency's own page does not back is left out and listed under "Deliberately not said". `duration` and `processingTime` are not items and carry no source: keep or set them as the app's estimate and say so at the owner gate.
3. **Gate.** `CONTENT_ALLOW_UNVERIFIED=true npm run content:build -w @landednz/api` passes; `npm run test:run -w @landednz/api -- src/content` passes. Unverified items skip the figure, provider and staleness rules, so also run the build once with this task's items and facts temporarily set `verified: true` (then set them back): it must pass, or approval would fail on a rule.
4. **Verify (stage 3).** Write `<sdd workspace>/<id>-verify-input.md` holding only the task YAML, its facts and each cited source's URL. Dispatch a fresh `general-purpose` subagent (opus) with that file and the rule not to open the research note or anything else in the repo. It opens every source (raw page via curl), and writes per item and fact `supported` (verbatim passage) / `partly` / `not supported`, plus the compliance check (visa: no case advice; tax/tenancy: advice item present where guidance says so), to `<sdd workspace>/<id>-verification.md`. Fix or remove every `partly`/`not supported` item, then resume the same verifier with only the changed items (it appends a re-verification section). Append the whole record under `## Verification <date>` in the research note.
5. **Review (stage 4).** `npm run content:review -w @landednz/api -- <id>`; give the owner the HTML path with one plain question ("Should <task> go live as written?"), the recommended answer, and the limits (what no source could confirm, pages that disagree, unsourced estimates). On approval, set `verified: true` and `checked: <verification date>` on the task's items and facts, rebuild, check the review page shows no unverified line, and commit YAML + facts + sources + research note together (only those files).

## Execution

Subagent-driven for code tasks; the controller runs the content procedure itself (research and owner gates need the main session), dispatching only the stage-3 verifier. Every task reviewer runs on `opus`.

| Task | Implementer | Why |
|---|---|---|
| 1 Stage 0 research | controller (deep-research) | Judgement + owner gate |
| 2 Stage 1 inventory | controller (deep-research) | Judgement + owner gate |
| 3 Gate hardening | `sonnet` | Small rules, fully pinned by tests |
| 4 Review page | `sonnet` | One script over the content module |
| 5 Dimension changes + task structure | `opus` | Enum + data migration on user rows, inventory structure (R24) |
| 6 Roadmap reconcile | `opus` | User state on content change |
| 7 Pilot (IRD number) | controller | Proves the procedure; owner gate |
| 8–12 Phase batches | controller | Content procedure per task |
| 13 Source links UI | board: controller; code: `sonnet` | Board approval, then a small component change |
| 14 Retired task UI | board: controller; code: `sonnet` | Skipped unless Task 2 retires a started task |
| 15 Remove the bridge | `sonnet` | Deletions, verified by the production build |

Sessions (two tasks each): 1 → 1–2 · 2 → 3–4 · 3 → 5–6 · 4 → 7, 13 · 5 → 8–9 · 6 → 10–11 · 7 → 12, 14 · 8 → 15 + final whole-branch review. Branch: `feat/content-verification` from `main` (d37e292).

## Review Focus

1. An answer combination for which every item in a section of an applicable task is conditional and none match: the task page shows no steps. → Task 4 adds a bundle test: every applicable task, for every combination, has ≥1 `why` item and ≥1 step.
2. An existing user whose stored answer value is renamed or removed by Task 1: `GET /onboarding/profile` and the roadmap still load, with the mapped value, never a 500 or an empty roadmap. → Task 5 test.
3. Task 2 adds a task or makes an open task non-applicable: after the recalculation, existing users get the new task and lose the open non-applicable one; completed entries and started retired tasks remain. → Task 6 test.
4. A verified item that uses an unverified fact: the build fails without the flag (the item cannot launder the fact). → Task 3 test.
5. A task detail whose `sources` arrays are missing or shorter than the item list (older API, legacy content): each line still renders, without a link, no crash. → Task 13 test.

---

### Task 1: Stage 0 — onboarding dimensions and compliance boundary

**Files:**
- Create: `apps/api/content/research/stage-0.md`
- Create (proposal only, not applied): `apps/api/content/research/dimensions.proposed.yaml`

**Interfaces:**
- Produces: owner-approved `dimensions.proposed.yaml`; an `## Answer mapping` table (old value → new value, per dimension) for Task 5; the IAA boundary rules every visa item follows; the confirmed Crown-entity domain list for Task 3.

- [ ] **Step 1: Research** (deep-research, official sources) and record in `stage-0.md`, each finding with its source:
  - Immigration NZ's current visa categories a skilled migrant can arrive on, against today's `visa` values (AEWV, GREEN_LIST_WORK, GREEN_LIST_RESIDENCE, PARTNER_OF_STUDENT, OTHER): keep / rename / split / add, and which settlement steps actually differ by visa.
  - Whether `city` (Auckland, Wellington, Christchurch, Other), `family` and `occupation` values each change at least one settlement step; a value that changes nothing is proposed for removal.
  - Immigration Advisers Licensing Act 2007: what counts as immigration advice vs information, and the rule the content follows.
  - Reuse terms for NZ government web content (paraphrase and link only, or licensed reuse).
  - Crown-entity domains the content will cite (today `acc.co.nz`, `sorted.org.nz`, candidate `privacy.org.nz`), each checked against an official Crown-entity list (ledger R6).
- [ ] **Step 2: Write** `dimensions.proposed.yaml` (same format as `dimensions.yaml`) and the answer mapping table; every change cites its source.
- [ ] **Step 3: Owner gate** — present the proposal, mapping and boundary note; record approval (or the changes asked for) in the ledger.
- [ ] **Step 4: Commit** — `docs(content): stage 0 dimension and compliance research`.

### Task 2: Stage 1 — task inventory

**Files:**
- Create: `apps/api/content/research/stage-1.md`

**Interfaces:**
- Consumes: Task 1's approved dimensions.
- Produces: the approved inventory table `| id | name | phase | decision (keep/merge/split/add/retire) | dependsOn | source |`, the batch list for Tasks 8–12, and whether any retired task has users who started it (decides Task 14).

- [ ] **Step 1: Research** official settlement guidance (Immigration NZ, IRD, NZTA, Tenancy Services, Health NZ, MBIE) from pre-arrival to month 6 against T01–T21; one source per decision. New tasks get the next free id (`T22`…); ids are never reused.
- [ ] **Step 2: Check started tasks** — `select "taskId", count(*) from "UserRoadmapEntry" where status <> 'NOT_STARTED' group by 1` on the local DB; list any proposed-retired ids with rows (production check happens in Stage C).
- [ ] **Step 3: Owner gate** — present the inventory; record approval in the ledger.
- [ ] **Step 4: Commit** — `docs(content): stage 1 task inventory`. (Applying the structure moved to Task 5, ledger R24: the new conditions name values that exist only after the dimension change.)

### Task 3: Content gate hardening

**Files:**
- Modify: `apps/api/src/content/rules.ts`
- Test: `apps/api/src/content/rules.test.ts`

**Interfaces:**
- Consumes: `CROWN_DOMAINS` list confirmed in Task 1.
- Produces: same `RULES` export and rule names; the new rule name `provider-item`.

- [ ] **Step 1: Write the failing tests** in `rules.test.ts`, using its existing fixture helpers, one per case:
  - `unknown-dimension: prototype keys` — `when: { constructor: ['X'] }` → one `unknown-dimension` error, no TypeError.
  - `literal-figure: words and units` — each of `two weeks`, `10 per cent`, `5 hrs`, `a fortnight`, `by 31 March` in a verified item's text → `literal-figure`; `form IR595` and `0800 377 774` → no error.
  - `provider-item` — a verified item whose `source` is a `provider` source → `provider-item` (providers only behind type C facts).
  - `provider-reason: uncited source` — a provider source without `reason` that nothing cites → exactly one `provider-reason` error; a source cited by three items → still one.
  - `stale: month ends` — `now = 2026-08-31`, type B: `checked: 2026-02-28` passes, `2026-02-27` fails.
  - `stale: NZ date` — `now = 2026-10-24T20:00:00Z` (25 Oct in Auckland), type C: `checked: 2026-07-25` passes.
  - `unverified: fact used by a verified item` — verified item, `{{f}}` with `verified: false`, `allowUnverified: false` → `unverified` error naming the fact.
  - `domain: crown allowlist` — sources on each Task 1 confirmed domain pass; `example.org.nz` as `government` fails.
- [ ] **Step 2: Run** `npm run test:run -w @landednz/api -- src/content/rules.test.ts` — the new tests FAIL.
- [ ] **Step 3: Implement** in `rules.ts`: `Object.hasOwn` for dimension lookup; extend `FIGURE_RE` with number words (`one`–`twelve`, `a`) before time units, `per cent`, `hrs?`/`mins?`, `fortnights?`, and `\b\d{1,2} (January|…|December)\b`; new `provider-item` rule; `provider-reason` iterates sources, not citers; staleness cutoff computed on the `Pacific/Auckland` calendar date with month subtraction clamped to the month's last day; `CROWN_DOMAINS` from Task 1.
- [ ] **Step 4: Run** the content tests and `CONTENT_ALLOW_UNVERIFIED=true npm run content:build -w @landednz/api` — PASS (legacy items are unverified, so exempt).
- [ ] **Step 5: Commit** — `feat(content): tighten figure, provider and staleness rules`.

### Task 4: Per-task review page

**Files:**
- Create: `apps/api/scripts/content-review.ts`, `apps/api/src/content/review.ts`
- Test: `apps/api/src/content/review.test.ts`
- Modify: `apps/api/package.json` (script `content:review`), `.gitignore` (`apps/api/content-review/`), `apps/api/src/content/bundle.test.ts`

**Interfaces:**
- Consumes: `Bundle`, `itemsFor(task, profile)`, `matches()`; dimension values from `bundle.dimensions`.
- Produces: `variants(bundle: Bundle, taskId: string): { profiles: Profile[]; items: ReturnType<typeof itemsFor> }[]` (answer combinations grouped by identical visible item ids; combinations where the task does not apply are left out) and `reviewHtml(bundle: Bundle, taskId: string): string`. CLI: `npm run content:review -w @landednz/api -- <taskId>` writes `apps/api/content-review/<taskId>.html` and prints its path.

- [ ] **Step 1: Write the failing tests** in `review.test.ts` against a small fixture bundle (2 visa × 2 family values; one step `when: { family: [CHILDREN] }`):
  - `variants` returns 2 groups; the children group has 2 profiles and includes the conditional step id.
  - `reviewHtml` contains every visible item's text, its source title as a link to the source URL, its `checked` date, its `verified` state, and lists the profiles of each group by label; text is HTML-escaped (`<b>` in item text appears as `&lt;b&gt;`).
- [ ] **Step 2: Add the Review Focus 1 test** in `bundle.test.ts`: for every combination of registry values, every applicable task has ≥1 `why` item and ≥1 step.
- [ ] **Step 3: Run** — new tests FAIL (the bundle test may also fail on legacy content: record which tasks in the ledger; they are fixed by their content task, and the test is `skip`-free).
- [ ] **Step 4: Implement** `review.ts` (plain HTML, inline CSS, no dependency) and the CLI.
- [ ] **Step 5: Run** content tests and `npm run content:review -w @landednz/api -- T08`; open the file and check it reads.
- [ ] **Step 6: Commit** — `feat(content): per-task review page`.

### Task 5: Dimension changes and task structure

Task 1 approved dimension changes and Task 2 an inventory, so this task runs (ledger R24).

**Files:**
- Modify: `apps/api/content/dimensions.yaml`, `apps/api/prisma/schema.prisma` (enums), task YAML `when`/`appliesTo`/`boosts` naming changed values, `docs/design/r0-boards/` onboarding board (only if option lists change)
- Create: `apps/api/prisma/migrations/<timestamp>_dimension_changes/migration.sql`
- Test: `apps/api/src/features/onboarding/onboarding.dimensions.test.ts`

**Interfaces:**
- Consumes: Task 1's `dimensions.proposed.yaml` and answer mapping.
- Produces: regenerated `packages/types/dimensions.ts` (web onboarding reads it), migrated `UserProfile` rows.

- [ ] **Step 1: Board** — if option lists change, regenerate the Onboarding board with the new options (`docs/design/r0-boards/build_public.py`), validate with the minimalism rules, owner approves (CW02′).
- [ ] **Step 2: Write the failing test** (Review Focus 2): seed a real local user whose profile holds each mapped old value; run the migration SQL's update; `GET /onboarding/profile` returns 200 with the mapped value and `GET /roadmap` returns a non-empty roadmap.
- [ ] **Step 3: Implement** — copy the proposal into `dimensions.yaml`; apply Task 2's inventory structure (retired tasks `retired: true`; T22–T36 skeletons with `id`, `name`, `phase`, `priority`, `appliesTo`, `dependsOn`, one `why` and one step marked `verified: false`, citing the inventory source; `dependsOn` edges per the table); update enums; `prisma migrate dev --create-only`, then edit the SQL so profile rows are mapped (`UPDATE … SET … WHERE …`) before old enum values are dropped; update conditions in task YAML; `npm run content:build` regenerates `dimensions.ts`.
- [ ] **Step 4: Run** `make check` — PASS (includes `registry-sync.test.ts`); `make test-e2e` — onboarding specs pass with the new options.
- [ ] **Step 5: Commit** — `feat(onboarding): apply stage 0 dimension changes`.

### Task 6: Roadmap reconcile on a new bundle

**Files:**
- Modify: `apps/api/src/features/roadmap/roadmap.recalculate.ts`
- Test: `apps/api/src/features/roadmap/roadmap.recalculate.test.ts`

**Interfaces:**
- Consumes: `buildRoadmapEntries` (`roadmap.build.ts`), the same path `updateProfileAndRegenerateRoadmap` uses.
- Produces: `recalculateAllRoadmaps(currentDate?)` keeps its signature and `RecalculateResponse`, adding `entriesAdded` and `entriesRemoved`. Trigger unchanged: the existing admin route, run after each content deploy (Stage C checklist).

- [ ] **Step 1: Write the failing test** (Review Focus 3): user with entries for tasks A (complete), B (open), R (in progress); swap in a bundle (`useContent`) where B no longer applies, R is retired and new task N applies; after `recalculateAllRoadmaps` the user has A (complete), R (unchanged), N (`NOT_STARTED`), and no B; the response counts 1 added, 1 removed.
- [ ] **Step 2: Run** — FAIL (today only open applicable entries are re-scored).
- [ ] **Step 3: Implement** — reconcile each user with the same add/drop rules as `updateProfileAndRegenerateRoadmap` (reuse its helper; do not copy it); retired tasks with a started entry are kept.
- [ ] **Step 4: Run** `npm run test:run -w @landednz/api -- src/features/roadmap` — PASS.
- [ ] **Step 5: Commit** — `fix(roadmap): add and drop tasks when content changes`.

### Task 7: Pilot — the IRD number task (T08 today)

- [ ] **Step 1:** Run the content procedure end to end for the IRD-number task (its id from Task 2).
- [ ] **Step 2:** Note in the ledger anything in the procedure that did not work and amend the "Content procedure" section of this plan before Task 8 (owner sees the amendment at the gate).
- [ ] **Step 3: Check** — `npm run content:build -w @landednz/api` with the flag passes; `content:review` shows only verified lines for this task.

### Tasks 8–12: Phase batches

One plan task per phase, in order: **8** phase 1 pre-arrival · **9** phase 2 arrival · **10** phase 3 week 1 · **11** phase 4 month 1 · **12** phase 5 month 2–6. Task ids per batch come from Task 2's inventory (the pilot task is skipped).

- [ ] **Step 1:** Run the content procedure for each task in the phase, one owner review page per task (the owner may approve several in one sitting).
- [ ] **Step 2: Check** after each batch — `make check` passes; Task 4's bundle test passes for every task in the batch; `make kb-sync-live` is not required (mock embeddings are fine locally).
- [ ] **Step 3: Commit** per task, as the procedure says.

### Task 13: Per-item source links on the task page

**Files:**
- Modify: `apps/web/src/components/workspace/task-sheet.tsx`, `apps/web/src/lib/roadmap-mapper.ts` (if the mapper drops `sources`)
- Create: `docs/design/r0-boards/TaskSources.dc.html` (+ phone variant) via the board scripts
- Test: `apps/web/src/components/workspace/task-sheet.test.tsx`

**Interfaces:**
- Consumes: `TaskDetailApiResponse.sources[section][i]` pairs with `steps[i]`, `documentsRequired[i]`, `commonMistakes[i]`, `watchOuts[i]`; `cost` ↔ `sources.cost[0]`, advice ↔ `sources.advice[0]`, consequence line ↔ `sources.why[0]`.

- [ ] **Step 1: Board** — load `frontend-design`, draw two or three variants of a line with its source title and checked date (desktop + phone), validate with the minimalism rules, owner picks one (CW02′).
- [ ] **Step 2: Write the failing tests**: each step renders a link with the source title, `href` = source URL, `target="_blank"` and `rel="noopener noreferrer"`, and the checked date formatted like `lastVerified`; Review Focus 5: with `sources` absent, and with `sources.steps` shorter than `steps`, every step still renders and unmatched lines have no link.
- [ ] **Step 3: Run** `npm run test -w @landednz/web -- task-sheet` — FAIL.
- [ ] **Step 4: Implement** the approved variant with existing shadcn/house components.
- [ ] **Step 5: Run** web tests, `make check`, `make test-e2e` — PASS; screenshot the task sheet on desktop and phone width against the board.
- [ ] **Step 6: Commit** — `feat(web): link each task line to its source`.

### Task 14: Retired task in an existing roadmap (only if Task 2 retires a started task)

Otherwise record "Task 14: skipped" in the ledger.

- [ ] **Step 1: Board** — a retired task shown like a completed one with a "no longer needed" note; owner approves.
- [ ] **Step 2: Write the failing test** in `roadmap-view.test.tsx`: an entry flagged retired by the API renders the note and no complete/reopen actions (the API already refuses writes with 409 `TASK_RETIRED`).
- [ ] **Step 3: Implement**, run web tests and `make test-e2e` — PASS.
- [ ] **Step 4: Commit** — `feat(web): show retired tasks as no longer needed`.

### Task 15: Remove the conversion bridge and unblock deploys

**Files:**
- Delete: `apps/api/content/kb-master.md`, `apps/api/scripts/convert-kb-master.ts`, `apps/api/scripts/convert-kb-master.test.ts`, `apps/api/content/facts/legacy.yaml`, every `reason: legacy, unverified` source
- Modify: `CLAUDE.md`, `.claude/skills/knowledge-base-schema/`, `.claude/constitution.md` (only lines naming deleted files), `Makefile` (if a target names the converter)

- [ ] **Step 1: Check** — `grep -rn "verified: false" apps/api/content` is empty; `grep -rln "kb-master\|convert-kb-master\|legacy, unverified" --exclude-dir=node_modules --exclude-dir=.superpowers .` lists only files this task edits.
- [ ] **Step 2: Delete and edit** the files above.
- [ ] **Step 3: Verify the production guard** — `npm run content:build -w @landednz/api` passes **without** the flag; `docker build -f apps/api/Dockerfile -t landednz-api .` (no build arg) succeeds and the container starts; `make check` and `make test-e2e` pass.
- [ ] **Step 4: Commit** — `chore(content): remove the kb-master conversion bridge`.
- [ ] **Step 5:** Final whole-branch review (opus), then the owner merges; Stage C (cloud) can start.

## Self-review notes

- Spec coverage: §5 stage 0 → T1, stage 1 → T2, stages 2–4 → content procedure + T4 + T7–12; §6 step 6 → T5, step 8 → T13, step 9 → T15; §8.2 → T5 board, §8.3 → T14; §4.3 "re-score after first bundle" → T6; §3.6 rules strengthened → T3.
- Deferred Plan 1 minors picked up here: Task 2 rule minors (T3), R6 Crown list (T1, T3), Task 4 per-item re-sourcing and quoted-advice artifacts (content procedure), Task 5 recalculate add/remove (T6), Task 8 converter dead code (deleted in T15). Others stay deferred.
