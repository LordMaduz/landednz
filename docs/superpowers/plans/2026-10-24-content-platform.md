# Content Platform Implementation Plan (Plan 1 of 2: platform and backend switch-over)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the persona-based task tables and the `kb-master.md` seed with a validated, versioned content bundle that the API loads at start-up, so verified content can be dropped in task by task.

**Architecture:** YAML under `apps/api/content/` (dimensions, sources, facts, tasks) is compiled by `content:build` into an immutable `content-bundle.json` whose version is its hash. The API loads it through a `ContentSource` and every consumer (roadmap, scoring, onboarding preview, chat, RAG) reads the in-memory content module; the database keeps only user state, chat, `ContentRelease` and the embedded `KnowledgeBaseChunk`s.

**Tech Stack:** Node 24, TypeScript 7, zod 4, `yaml` (eemeli, new devDependency, build-time only), Fastify 5, Prisma 7 + pgvector, Vitest 5, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-24-content-platform-design.md`

**Plan 2 (separate, written after this one lands):** research stages 0–4, dimension changes, the pilot and every task's verified content, and the three UI changes (spec §5, §6 steps 5–8, §8). This plan covers spec §3, §4, §6 steps 1–4 and the code half of step 9.

## Global Constraints

- Content files live in `apps/api/content/`; research notes in `apps/api/content/research/` are never bundled.
- Every item and fact: `source` (registry id), `checked` (ISO date), `verified` (boolean); ids stable and unique.
- Allowed `government`/`legislation` domains: `govt.nz` and subdomains, plus the explicit Crown-entity allowlist in `schema.ts`; `provider` sources only for type C facts and need `reason`.
- Dollar amounts, percentages, durations and deadlines in item text come from `{{fact.id}}`; identifiers (form names, phone numbers) may be literal.
- Denylist, whole-word, case-insensitive: `Priya`, `Karthik`, `DBS`, `I`, `I'd`, `we recommend`.
- Staleness: type B 6 months, type C 3 months, other items and type A 12 months.
- `verified: false` fails the build unless `CONTENT_ALLOW_UNVERIFIED=true`; unverified items are exempt from the fact-pattern rule, the provider-reason rule and staleness (they can never ship). Staging and production never set the flag.
- Phases: 1 pre-arrival · 2 arrival · 3 week 1 · 4 month 1 · 5 month 2–6.
- Pure core code (`src/core/`, `src/content/matches.ts`) has zero framework imports (constitution C02); `$queryRaw` results use the BigInt replacer (C10); cosine `<=>` only (C12); persona/condition filtering happens in SQL before semantic search (C07).
- Auth is never mocked in integration tests; tests run against the real local Supabase.
- Commits: Conventional Commits with scope, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit `.env.local`.
- **Spec extension (owner to confirm):** scoring's hard-coded time-urgency rules (T06/T07/T08/T09/T16) move into each task's YAML as `urgency`, beside `boosts`, because research may renumber tasks.

## Review Focus

1. A profile whose answers no conditional item names (e.g. `city: OTHER`, `visa: OTHER`) still gets every general task and item, never an empty roadmap or task page. → Task 3 content test over every combination.
2. A user changes answers after completing tasks: completions survive for tasks that still apply, newly applicable tasks appear, no-longer-applicable incomplete tasks drop. → Task 5 test.
3. The bundle file is missing, corrupt, or from an older schema: the API exits non-zero with a message naming the file and the fix (`npm run content:build`), never serves partial content. → Task 3 test.
4. A user matching none of a task's `why` items: `consequenceLine` is `''`, not a crash or the wrong persona's line. → Task 3 test.
5. Chunk sync fails halfway (embedding error) or the embedding mode switches mock → live: no chunk keeps an embedding from the wrong mode or old text while marked current. → Task 7 tests.

---

### Task 1: Content schema and condition matcher

**Files:**
- Create: `apps/api/src/content/schema.ts`, `apps/api/src/content/matches.ts`, `apps/api/src/content/types.ts`
- Test: `apps/api/src/content/schema.test.ts`, `apps/api/src/content/matches.test.ts`

**Interfaces:**
- Produces (`types.ts`, all inferred from zod in `schema.ts`):
  - `type Profile = { visaType: string; city: string; familySituation: string; occupation: string }`
  - `type Condition = 'all' | { any: Condition[] } | { not: Condition } | Partial<Record<DimensionKey, string[]>>` where `DimensionKey = 'visa' | 'city' | 'family' | 'occupation'` (YAML keys; map to `Profile` fields visa→visaType, family→familySituation)
  - `type Item = { id; text; when?: Condition; source: string; checked: string; verified: boolean; numberType?: 'A'|'B'|'C' }`
  - `type TaskDef = { id; name; phase: 1|2|3|4|5; priority: number; boosts: {when: Condition; by: number}[]; urgency: UrgencyRule[]; duration: string; processingTime?: string; appliesTo: Condition; dependsOn: {task: string; type: 'hard'|'soft'}[]; retired: boolean; why: Item[]; steps: Item[]; documents: Item[]; mistakes: Item[]; watchOuts: Item[]; cost?: Item; advice?: Item & { required: boolean } }`
  - `type UrgencyRule = { fromDay: number; toDay: number; by: number } | { months: number[]; afterFirstYear: true; by: number }`
  - `type Source = { url; title; agency; tier: 'government'|'legislation'|'provider'; reason?: string }`, `type Fact = { value: string; numberType: 'A'|'B'|'C'; source; checked; verified }`
  - `type Dimensions = Record<DimensionKey, { label: string; values: [value: string, label: string][] }>`
  - zod schemas `dimensionsSchema`, `sourcesSchema`, `factsSchema`, `taskSchema` (structural only; cross-file rules are Task 2).
  - `matches(when: Condition | undefined, profile: Profile): boolean` in `matches.ts` (pure; `undefined` and `'all'` → true).

- [ ] **Step 1: Write failing tests**

`matches.test.ts`, with `p = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY' }`:
- `matches(undefined, p)` and `matches('all', p)` → `true`
- `{ city: ['AUCKLAND', 'WELLINGTON'] }` → `true`; `{ city: ['WELLINGTON'] }` → `false`
- `{ city: ['AUCKLAND'], family: ['FAMILY_WITH_CHILDREN'] }` → `false` (keys are all-of)
- `{ any: [{ visa: ['GREEN_LIST_RESIDENCE'] }, { occupation: ['TECHNOLOGY'] }] }` → `true`
- `{ not: { city: ['AUCKLAND'] } }` → `false`; nested `{ not: { any: [...] } }` evaluates recursively

`schema.test.ts`:
- a minimal valid task parses
- rejects: item without `source`; `checked: '2026-13-01'`; `phase: 6`; `numberType: 'D'`; unknown top-level key (schemas are `.strict()`); `dependsOn` type other than `hard|soft`

- [ ] **Step 2: Run, expect FAIL** — `npm run test:run -w @landednz/api -- src/content` → cannot find module `./matches.js`

- [ ] **Step 3: Implement** `schema.ts` (zod `.strict()` objects, ISO date via `z.iso.date()`), `types.ts` (`z.infer` exports), `matches.ts`.

- [ ] **Step 4: Run, expect PASS** — same command.

- [ ] **Step 5: Commit** — `feat(content): content schema and condition matcher`

---

### Task 2: `content:build` — validation rules, fact resolution, bundle

**Files:**
- Create: `apps/api/src/content/build.ts`, `apps/api/src/content/rules.ts`, `apps/api/scripts/content-build.ts`, `apps/api/src/content/__fixtures__/valid/{dimensions,sources}.yaml`, `.../valid/facts/core.yaml`, `.../valid/tasks/{T01,T02}.yaml`, `apps/api/content/.gitkeep`
- Modify: `apps/api/package.json` (script `"content:build": "node --env-file-if-exists=.env.local --import=tsx/esm scripts/content-build.ts"`, devDependency `yaml`), root `.gitignore` (`apps/api/content-bundle.json`), `apps/web/src/lib/answers.ts` (`QUESTIONS` options come from `VISA_TYPES`, `CITIES`, `FAMILY_SITUATIONS`, `OCCUPATIONS`; question titles stay in web)
- Generate: `packages/types/dimensions.ts` (committed)
- Test: `apps/api/src/content/build.test.ts`, `apps/api/src/content/rules.test.ts`, `apps/api/src/content/registry-sync.test.ts`

**Interfaces:**
- Consumes: Task 1 schemas and types, `matches`.
- Produces:
  - `type Bundle = { version: string; builtAt: string; dimensions: Dimensions; sources: Record<string, Source>; facts: Record<string, Fact>; tasks: ResolvedTask[] }`
  - `type ResolvedItem = Item & { text: string /* facts substituted */; factIds: string[] }`; `ResolvedTask` = `TaskDef` with every item a `ResolvedItem`, plus `checkedAt: string` (oldest `checked` across its items and their facts).
  - `buildBundle(dir: string, opts: { now: Date; allowUnverified: boolean }): { bundle: Bundle } | { errors: RuleError[] }`
  - `type RuleError = { file: string; id?: string; rule: string; message: string }`
  - `version` = first 12 hex chars of sha256 over the canonical JSON of the bundle without `version`/`builtAt`.
  - CLI writes `apps/api/content-bundle.json` and `packages/types/dimensions.ts`; reads `CONTENT_DIR` (default `apps/api/content`) and `CONTENT_ALLOW_UNVERIFIED`; prints every `RuleError` as `file:id rule — message` and exits 1 on any.
  - `packages/types/dimensions.ts` exports `VISA_TYPES`, `CITIES`, `FAMILY_SITUATIONS`, `OCCUPATIONS` as `readonly [value, label][]` `as const`, and `VisaType`/`City`/`FamilySituation`/`Occupation` derived from them; `packages/types/index.ts` re-exports these instead of its hand-written unions.

- [ ] **Step 1: Write failing tests** — `rules.test.ts`: one test per rule, each loading the valid fixture and mutating one field in memory, asserting exactly one `RuleError` with that `rule` name:
  - `missing-source` (source id not in registry)
  - `domain` (government source on `example.com`)
  - `provider-reason` (provider source without `reason`) and `provider-type` (provider source on a type A fact)
  - `literal-figure` (item text `costs $50`, `takes 10 days`, `45%`) — and no error for `form IR595` or `0800 227 774`
  - `unknown-dimension` (`when: { town: [...] }`) and `unknown-value` (`city: ['DUNEDIN']`)
  - `denylist` (`Priya` in text; `priyanka` passes)
  - `stale` (type C fact checked 4 months before `now`; type B 7 months; item 13 months) — boundary: type C at exactly 3 months passes
  - `duplicate-id`, `missing-dependency`, `retired-dependency`, `cycle` (T01→T02→T01)
  - `unresolved-fact` (`{{nope}}`)
  - `unverified` (fails without `allowUnverified`; with it, the same item also skips `literal-figure`, `provider-reason` and `stale`)

  `registry-sync.test.ts`: the values in `packages/types/dimensions.ts` equal `Object.values()` of the Prisma enums `VisaType`, `City`, `FamilySituation`, `Occupation` from `src/generated/prisma/enums.js` (a registry change without a migration fails here).

  `build.test.ts`: valid fixture builds; `{{fact}}` substituted and `factIds` recorded; `checkedAt` is the oldest date; same input → same `version`; a one-character text change → different `version`; `buildBundle` collects all errors rather than stopping at the first.

- [ ] **Step 2: Run, expect FAIL** — `npm run test:run -w @landednz/api -- src/content`

- [ ] **Step 3: Implement** `rules.ts` (one exported function per rule, each `(ctx) => RuleError[]`), `build.ts` (read YAML with `yaml.parse`, zod-parse, run rules, resolve facts, hash), the CLI, the `dimensions.ts` generator; switch `packages/types/index.ts` to re-export; add `PersonaKey` untouched for now (removed in Task 8).

- [ ] **Step 4: Run, expect PASS**, then `npm run typecheck` (web still compiles against the re-exported unions).

- [ ] **Step 5: Commit** — `feat(content): content:build validates and bundles content`

---

### Task 3: Content module and start-up loading

**Files:**
- Create: `apps/api/src/content/source.ts`, `apps/api/src/content/index.ts`
- Modify: `apps/api/src/server.ts` (load content before `buildApp`), `apps/api/Dockerfile` (`ARG CONTENT_ALLOW_UNVERIFIED=false`; builder runs `CONTENT_ALLOW_UNVERIFIED=$CONTENT_ALLOW_UNVERIFIED npm run content:build`; runner copies `apps/api/content-bundle.json`; Render and Railway build with the default, so unverified content can never deploy), `apps/api/vitest.config.ts` (`globalSetup` builds the bundle once with `allowUnverified: true`)
- Test: `apps/api/src/content/content.test.ts`, `apps/api/src/content/bundle.test.ts`

**Interfaces:**
- Consumes: `Bundle`, `ResolvedTask`, `ResolvedItem`, `buildBundle`, `matches`, `Profile`.
- Produces (`index.ts`; module-level state set once by `loadContent`):
  - `interface ContentSource { load(): Promise<Bundle> }`; `class FileContentSource implements ContentSource { constructor(path = <apps/api/content-bundle.json>) }`
  - `loadContent(source?: ContentSource): Promise<Bundle>` — re-validates with zod; throws `ContentLoadError` whose message names the path and says to run `npm run content:build -w @landednz/api`
  - `contentVersion(): string`
  - `tasks(): ResolvedTask[]` (excludes retired), `task(id): ResolvedTask | undefined` (includes retired)
  - `applicableTasks(profile: Profile): ResolvedTask[]` — non-retired tasks whose `appliesTo` matches
  - `itemsFor(task: ResolvedTask, profile: Profile): { why: ResolvedItem | null; steps; documents; mistakes; watchOuts: ResolvedItem[]; cost: ResolvedItem | null; advice: (ResolvedItem & { required: boolean }) | null }`
  - `source(id): Source`, `fact(id): Fact`
  - `useContent(bundle: Bundle)` — test helper that sets state directly

- [ ] **Step 1: Write failing tests**
  - `content.test.ts` (on the valid fixture via `useContent`): `itemsFor` returns general items plus matching conditional ones, in YAML order; `why` is the first matching item; a profile matching no `why` item → `why: null` (Review Focus 4); retired tasks absent from `tasks()` but present via `task(id)`; `loadContent` with a missing file and with `{"version":1}` both reject with `ContentLoadError` mentioning `content:build` (Review Focus 3).
  - `bundle.test.ts` (on the real `apps/api/content-bundle.json`; skipped with a clear message until Task 4 adds content): for every combination of dimension values, `applicableTasks` is non-empty and every applicable task's hard `dependsOn` is either applicable or absent from the roadmap's blocking set; no item text contains `{{`; every item `source` exists (Review Focus 1).

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement** `source.ts`, `index.ts`; in `server.ts` `start()`, `await loadContent()` before `buildApp()` and on failure log the error and `process.exit(1)`; Dockerfile and vitest `globalSetup` as listed.

- [ ] **Step 4: Run, expect PASS**; `docker build -f apps/api/Dockerfile -t landednz-api .` succeeds.

- [ ] **Step 5: Commit** — `feat(content): content module loaded at API start-up`

---

### Task 4: Conversion bridge from `kb-master.md`

**Files:**
- Create: `apps/api/scripts/convert-kb-master.ts` (one-off; deleted in Plan 2 when every task is verified)
- Generate and commit: `apps/api/content/{dimensions,sources}.yaml`, `apps/api/content/facts/legacy.yaml` (empty map), `apps/api/content/tasks/T01.yaml` … `T21.yaml`
- Modify: `apps/api/.env.example` (`CONTENT_ALLOW_UNVERIFIED=true  # local only; never in staging or production`; the owner adds the same line to their own `.env.local`), `Makefile` (`check` and `dev` run `npm run content:build -w @landednz/api` first), `.github/workflows/ci.yml` (`npm run content:build -w @landednz/api` with `CONTENT_ALLOW_UNVERIFIED: true` before typecheck; the `docker build` step passes `--build-arg CONTENT_ALLOW_UNVERIFIED=true`, as a smoke build only)
- Test: `apps/api/scripts/convert-kb-master.test.ts`

**Interfaces:**
- Consumes: the existing parser functions in `scripts/seed-knowledge-base.ts` (`parseKnowledgeBase`, exported for this script only) for task metadata, dependencies, applicability and the `solo_aewv` variant text.
- Produces: content that builds with `CONTENT_ALLOW_UNVERIFIED=true`; every item `verified: false`, `checked: 2026-03-03` (the old KB's date), ids `<task>.<section>.<n>`; `appliesTo` from the old applicability fields; `boosts` from scoring's `PERSONA_WEIGHTS` translated to family conditions (`constrained_couple`→`COUPLE_CONSTRAINED`, `family_with_children`→`FAMILY_WITH_CHILDREN`, `dual_work_couple`→`COUPLE_DUAL_WORK`, `solo_aewv`→`SOLO`); `urgency` from scoring's `URGENCY_BONUSES` (T06/T07 days 1–3 +30, T08 days 4–14 +25, T16 days 275–336 +30, T08/T09 months [2,3] afterFirstYear +25); sources keyed by URL host+path slug, tier `government` if the domain is allowed else `provider` with `reason: legacy, unverified`. `dimensions.yaml` copies today's values and labels from `apps/web/src/lib/answers.ts`.

- [ ] **Step 1: Write failing test** — runs the converter into a temp dir, then `buildBundle(tmp, { allowUnverified: true })`: no errors; 21 tasks; zero occurrences of the denylist anywhere in the output (items whose text contains a denylisted word are dropped and counted in the script's report); `T08` boosts equal `{ COUPLE_CONSTRAINED: 20, FAMILY_WITH_CHILDREN: 15, SOLO: 10, COUPLE_DUAL_WORK: 18 }`; `buildBundle(tmp, { allowUnverified: false })` fails with `unverified`.

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement** the converter; run it into `apps/api/content/`; `CONTENT_ALLOW_UNVERIFIED=true npm run content:build -w @landednz/api` succeeds.

- [ ] **Step 4: Run, expect PASS**, and `bundle.test.ts` from Task 3 now runs and passes.

- [ ] **Step 5: Commit** — `feat(content): convert legacy KB into unverified content files`

---

### Task 5: Roadmap creation on content — scoring, onboarding, preview, recalculation

**Files:**
- Create: `apps/api/prisma/migrations/<timestamp>_content_platform_additive/migration.sql`
- Modify: `apps/api/prisma/schema.prisma`, `apps/api/src/core/priority/scoring.ts`, `apps/api/src/core/priority/filter.ts` (delete `filterApplicableTasks`, `derivePersonaKey`), `apps/api/src/features/onboarding/onboarding.service.ts`, `apps/api/src/features/onboarding/onboarding.preview.ts`, `apps/api/src/features/roadmap/roadmap.recalculate.ts`
- Test: `scoring.test.ts`, `filter.test.ts` (deleted), `onboarding.service.test.ts`, `onboarding.preview.test.ts`, `roadmap.recalculate.test.ts`

**Interfaces:**
- Consumes: `applicableTasks`, `task`, `contentVersion`, `matches`, `Profile`.
- Produces:
  - Additive migration: `ContentRelease { version String @id; builtAt DateTime; servedFrom DateTime @default(now()) }`; `UserRoadmapEntry.contentVersion String?`; `ChatMessage.contentVersion String?`, `ChatMessage.usedItemIds String?` (JSON array); `KnowledgeBaseChunk.when Json?`, `contentHash String?`, `itemIds String?`, `sourceIds String?`, `embeddingMode String?`; drop the `UserRoadmapEntry.taskId` foreign key (column stays). Nothing dropped yet.
  - `scoreTask(input: { task: { id: string; priority: number; boosts: TaskDef['boosts']; urgency: UrgencyRule[] }; profile: Profile; arrivalDate: Date | null; currentDate: Date; isBlocked: boolean }): ScoringResult` — `breakdown.personaWeight` renamed `conditionBoost` (sum of matching `boosts`); urgency from `urgency` rules (`fromDay`/`toDay` inclusive on day-1-is-arrival-day; `months` with `afterFirstYear` as today).
  - `buildRoadmapEntries(profile: Profile, arrivalDate: Date, currentDate: Date, completedTaskIds: string[]): { taskId: string; priorityScore: number; isBlocked: boolean }[]` in `src/features/roadmap/roadmap.build.ts` — the shared pipeline createProfile, updateProfile and recalculate all call. Entries written with `contentVersion: contentVersion()`.
  - `previewRoadmap(answers)` reads `applicableTasks(answers)`, ordered by id; response shape unchanged.

- [ ] **Step 1: Write failing tests**
  - `scoring.test.ts`: port each existing persona case to a family condition with the same expected numbers (e.g. family-with-children T01 → +20); urgency cases keep today's numbers, driven by `urgency` rules; a task with no `boosts`/`urgency` scores its `priority` only.
  - `onboarding.service.test.ts`: created entries carry the current `contentVersion`; Review Focus 2 — complete T07, change `familySituation` to `FAMILY_WITH_CHILDREN`: T07 still `COMPLETE`, family-only tasks added, no-longer-applicable incomplete tasks removed.
  - `onboarding.preview.test.ts`: unchanged assertions pass reading from content.

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**: migration (`npx prisma migrate dev --name content_platform_additive`), scoring, `roadmap.build.ts`, switch the three callers; `personaKey` still written to `UserProfile` (column dropped in Task 8) as `''`.

- [ ] **Step 4: Run, expect PASS** — `npm run test:run -w @landednz/api`

- [ ] **Step 5: Commit** — `refactor(roadmap): build roadmaps from the content bundle`

---

### Task 6: Roadmap reads and task detail on content

**Files:**
- Modify: `apps/api/src/features/roadmap/roadmap.service.ts` (`getRoadmap`, `completeTask`, `reopenTask`, `bulkOverride`, `getTaskDetail`), `apps/api/src/features/roadmap/roadmap.types.ts`, `apps/web/src/lib/api.ts` (`TaskDetailApiResponse` adds optional fields only)
- Test: `roadmap.service.test.ts`, `roadmap.detail.service.test.ts`, `roadmap.complete.service.test.ts`, `roadmap.reopen.service.test.ts`, `roadmap.bulk.service.test.ts`

**Interfaces:**
- Consumes: `task`, `itemsFor`, `source`, `Profile` from the stored `UserProfile`.
- Produces:
  - No Prisma `include: { task }` anywhere in roadmap code; dependencies and names come from `task(id)`.
  - `getRoadmap`: same response shape; `consequenceLine = itemsFor(...).why?.text ?? ''`; entries whose task is retired get `retired: true` and are excluded from `topThree`; entries whose `taskId` is unknown are omitted and logged once (`logger.warn({ userId, taskId }, 'Roadmap entry for unknown task')`).
  - `getTaskDetail`: same fields as today from `itemsFor`; `governmentSourceUrl` = the `why` item's source URL (fallback the first step's); `lastVerified` = task `checkedAt`; adds `contentVersion` and, per section, `sources: { itemId, title, url, checked }[]` for the Plan 2 UI.

- [ ] **Step 1: Write failing tests** — adjust fixtures to content task ids; add: a family profile's detail includes a family-only step and a solo profile's does not; a retired task's entry returns `retired: true` and is not in `topThree`; an entry with `taskId: 'T99'` is omitted without throwing.

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**.

- [ ] **Step 4: Run, expect PASS**; `npm run test:run -w @landednz/web` and `npm run typecheck` pass.

- [ ] **Step 5: Commit** — `refactor(roadmap): serve roadmap and task detail from content`

---

### Task 7: Chunk sync, condition-filtered retrieval, chat on content

**Files:**
- Create: `apps/api/src/content/chunks.ts`, `apps/api/scripts/sync-chunks.ts`
- Modify: `apps/api/scripts/bootstrap.ts` (migrate → `syncChunks` → vector index; seed and `generateEmbeddings` calls removed), `apps/api/src/features/chat/rag/retrieval.ts`, `apps/api/src/features/chat/service.ts`, `apps/api/src/features/chat/chat.types.ts`, `apps/api/src/core/prompts/registry.ts` (drop `personaKey` from prompt params), `Makefile` (`db-reset-live` replaced by `kb-sync-live: AI_MODE=live npm run db:bootstrap -w @landednz/api`)
- Test: `apps/api/src/content/chunks.test.ts`, `apps/api/scripts/sync-chunks.test.ts`, chat service tests, `golden-examples/**` where they pass `personaKey`

**Interfaces:**
- Consumes: `tasks`, `itemsFor`-style grouping, `source`, `contentVersion`, `generateEmbedding`, `config.aiMode`.
- Produces:
  - `buildChunks(bundle: Bundle): { chunkKey: string; taskId: string; when: Condition | null; content: string; itemIds: string[]; sourceIds: string[]; contentHash: string }[]` — per task: `CHUNK_<task>_general` (items with no `when`) and `CHUNK_<task>_<hash8 of when>` per distinct condition; content = task name + section headings + item texts + a "Sources:" list of titles and URLs; `contentHash` = sha256 of content.
  - `syncChunks(): Promise<{ embedded: number; deleted: number; unchanged: number }>` — upsert by `chunkKey`; embed when `contentHash` or `embeddingMode` differs from the row; write `embedding`, `contentHash`, `embeddingMode` in one statement only after the embedding succeeds; delete rows whose `chunkKey` is not in the bundle; record the bundle in `ContentRelease`.
  - `retrieveChunks({ query, profile: Profile, taskContext })`: SQL pre-filter `WHERE when IS NULL OR <condition matches>` — the candidate set is fetched with all chunk keys whose `when` matches computed in TS from the bundle (`buildChunks` keys filtered by `matches`), passed as `"chunkKey" = ANY(${keys})`, keeping the filter in SQL before semantic search (C07); task-context boost uses `CHUNK_<task>_general`.
  - Chat: task name and `consequenceLine` from content; recent completions' names from `task(id)`; assistant `ChatMessage` rows store `contentVersion` and `usedItemIds` (union of retrieved chunks' `itemIds`).

- [ ] **Step 1: Write failing tests**
  - `chunks.test.ts`: fixture task with general and two conditional items → three chunks; content includes source URLs; hashes stable.
  - `sync-chunks.test.ts` (real local DB): first sync embeds all; second sync embeds 0; editing one item re-embeds only its chunk; a removed task's chunks are deleted. Review Focus 5: make `generateEmbedding` throw on the second chunk → that row's `contentHash` is unchanged and the next sync retries it; switching `AI_MODE` mock→live re-embeds every chunk (assert via `embeddingMode`).
  - Chat service tests: a family profile retrieves its family chunk, a solo profile never does; assistant message has `contentVersion` and non-empty `usedItemIds`.

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**.

- [ ] **Step 4: Run, expect PASS** — full `npm run test:run -w @landednz/api`; then `make db-reset` locally and `make test-e2e` (journey and change-answers specs pass).

- [ ] **Step 5: Commit** — `feat(chat): condition-filtered RAG over synced content chunks`

---

### Task 8: Drop legacy tables and code; start-up integrity check

**Files:**
- Create: `apps/api/prisma/migrations/<timestamp>_content_platform_drop_legacy/migration.sql`, `apps/api/src/content/integrity.ts`
- Modify: `apps/api/prisma/schema.prisma` (drop `Task`, `TaskDependency`, `TaskContentVariant`, `KnowledgeBaseVersion`, `UserProfile.personaKey`, `KnowledgeBaseChunk.personaKey`, `KnowledgeBaseChunk.taskId` relation if any), `apps/api/src/server.ts`, `packages/types/index.ts` (remove `PersonaKey`), `CLAUDE.md` (Gotchas: replace the `db-reset-live` line with `content:build`/`kb-sync-live`; Commands)
- Delete: `apps/api/scripts/seed-knowledge-base.ts`, `seed-knowledge-base.test.ts`, `validate-seed-content.ts`, `end-to-end-validation.ts`, `generate-embeddings.ts`
- Keep: `apps/api/content/kb-master.md` and `scripts/convert-kb-master.ts` (removed in Plan 2 once every task is verified)
- Test: `apps/api/src/content/integrity.test.ts`

**Interfaces:**
- Produces: `checkStoredTaskIds(): Promise<{ unknown: string[]; retired: string[] }>` — distinct `UserRoadmapEntry.taskId` values compared with the bundle; logs `warn` per unknown id; called from `start()` after `loadContent()`, never blocks start-up.

- [ ] **Step 1: Write failing test** — insert an entry with `taskId: 'T99'` for a test user → `unknown` contains `T99`; a retired fixture task → in `retired`.

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**; migration (`--name content_platform_drop_legacy`); `grep -rn "personaKey\|db.task\b\|taskContentVariant\|PersonaKey" apps packages --include=*.ts` returns nothing outside `generated/` and migrations.

- [ ] **Step 4: Verify everything** — `make check` and `make test-e2e` pass locally; `docker build -f apps/api/Dockerfile -t landednz-api .` without the build arg fails at `content:build` with `unverified` (the production guard working). Deploys therefore stay blocked until Plan 2 verifies content; staging and production keep running the current release until then.

- [ ] **Step 5: Commit** — `refactor(api): drop persona task tables and seed scripts`
