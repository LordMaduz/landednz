# Content Platform — Verified Settlement Content Design

**Date:** 2026-10-24 · **Status:** Draft, awaiting review · **Branch:** `feat/r0-stage-b`

## 1. Purpose

The information LandedNZ presents (roadmap tasks and the assistant's knowledge) is the core of the product, and LandedNZ takes responsibility for every claim it makes. Today that information is not fit for purpose:

- `apps/api/content/kb-master.md` (4,086 lines, T01–T21) was written as one household's case study: Priya (India via Singapore, AEWV) and Karthik (Sri Lanka, Master's student), Auckland, arriving June 2026. Their names appear 69 times inside the advice itself.
- Only two personas exist in the source; `scripts/seed-knowledge-base.ts` (51 KB) fabricates the other two by copying the closest persona, so a family with children receives the couple's text.
- Onboarding offers Wellington and Christchurch; the content is Auckland-only.
- Content is dated ("checked 3 Mar 2026", "departing June 2026") and much of it is home-country advice (India FEMA, NRE/NRO, Sri Lankan tax) that is wrong for most users.

This spec replaces the content, its model and its runtime with a verified, versioned content platform.

### Success criteria

1. No persona names or case-study details in any user-facing content.
2. Every statement shown to a user links to an official source and carries a checked date; every figure declares its number type (A statutory, B administrative, C market).
3. What a user sees matches their onboarding answers (every combination onboarding offers), or the item does not appear.
4. Every item passed an independent verification pass and the owner's approval.
5. We can answer "what did we tell this user on this date, and from which source?".
6. Production can never ship unverified or stale content.

### Decisions taken in brainstorming

| # | Decision |
|---|---|
| D1 | Cover every combination onboarding offers (not a narrowed launch set). |
| D2 | NZ-side content only. Home-country matters become one short note to check the user's own country's rules with a professional there; where NZ treats countries differently (e.g. licence conversion) we link the official NZ list. |
| D3 | Research may correct the onboarding options; the owner approves changes before content is written. |
| D4 | Sign-off: automated research gate, independent verification, then owner approval per task. Every claim links its source so users can cross-check it themselves. |
| D5 | Content as structured, compiled, versioned data (§3–4), not DB-edited content and not one markdown file. |
| D6 | The backend may be restructured freely to suit the content model. |
| D7 | The three UI changes in §8 stay in scope, each behind an approved design board. |

## 2. Overview

```
content/  (authoring, git-reviewed)          content:build                     runtime
  dimensions.yaml ─┐                      ┌─ validate (schema, sources,   ┌─ ContentSource ─► content module
  sources.yaml ────┼─► zod schemas ──────►│   facts, conditions, staleness,│   (bundle file today;   tasks(), task(id),
  facts/*.yaml ────┤                      │   names, dependency cycles)    │    CMS/storage later)   itemsFor(task, profile),
  tasks/*.yaml ────┘                      └─ resolve facts ─► content-bundle.json                         fact(id), matches()
  research/*.md  (research notes, not shipped)            (version = content hash)   │
                                                                                     ├─► roadmap, task detail, scoring,
                                                                                     │   onboarding preview, chat context
                                                                                     └─► chunk sync ─► KnowledgeBaseChunk (pgvector)
```

## 3. Content model (`apps/api/content/`)

### 3.1 Dimensions registry — `dimensions.yaml`

Defines each onboarding answer dimension (today: `visa`, `city`, `family`, `occupation`, `arrivalDate`) and the allowed values with their user-facing labels. It is the single source the following are generated from or checked against: web onboarding options (`apps/web/src/lib/answers.ts`), Prisma enums, the schema check, and every `when` condition. Adding a dimension later (e.g. country of origin) is a registry change, not a matcher or schema rewrite.

### 3.2 Sources registry — `sources.yaml`

Each source is defined once:

```yaml
ird-tax-codes:
  url: https://www.ird.govt.nz/...
  title: Tax codes for individuals
  agency: Inland Revenue
  tier: government        # government | legislation | provider
```

Allowed domains for `government`/`legislation`: `govt.nz` and its subdomains (e.g. `immigration.govt.nz`, `ird.govt.nz`, `nzta.govt.nz`, `legislation.govt.nz`, `tenancy.govt.nz`), plus Crown entities on an explicit allowlist in the schema. `provider` sources (e.g. a bank's fee page) are allowed only for type C facts and require a `reason`.

### 3.3 Facts registry — `facts/*.yaml`

Every figure or rule that can change is a fact, defined once and referenced from text as `{{fact.id}}`:

```yaml
ird.non-declaration-rate:
  value: "45%"
  numberType: A           # A statutory | B administrative | C market
  source: ird-tax-codes
  checked: 2026-10-30
  verified: true
```

A policy change is one fact edit; every task and assistant chunk using it changes together. Staleness is tracked per fact.

### 3.4 Tasks — `tasks/<id>.yaml`

```yaml
id: T08
name: Get your IRD number
phase: 2                     # 1 pre-arrival · 2 arrival · 3 week 1 · 4 month 1 · 5 month 2–6
priority: 80
boosts:                      # replaces persona boosts in scoring
  - { when: { occupation: [SEEKING_WORK] }, by: 10 }
duration: 20 minutes online
appliesTo: all               # or a condition (§3.5)
dependsOn:
  - { task: T07, type: hard }
retired: false
why:                         # first matching item is the task's "why now" line
  - id: T08.why.tax-rate
    text: Without an IRD number your employer deducts tax at {{ird.non-declaration-rate}}.
    source: ird-tax-codes
    checked: 2026-10-30
    verified: true
steps:
  - id: T08.step.apply-online
    text: Apply online with your passport and NZ bank account details.
    source: ird-apply
    checked: 2026-10-30
    verified: true
  - id: T08.step.children
    when: { family: [FAMILY_WITH_CHILDREN] }
    text: ...
documents: [...]             # same item shape
mistakes:  [...]
watchOuts: [...]
cost:      { id: T08.cost, text: "{{ird.number-fee}}", ... }
advice:    { id: T08.advice, required: true, text: ..., source: ..., checked: ..., verified: true }
```

Item ids are stable across edits; feedback, analytics, audit records and future translations point at them. Text is one field per item so localisation can be added later without restructuring.

### 3.5 Conditions

`when` / `appliesTo` take `all`, or a condition over registry dimensions:

```yaml
when: { family: [COUPLE_DUAL_WORK, COUPLE_CONSTRAINED], city: [AUCKLAND] }   # implicit all-of
when: { any: [ { visa: [GREEN_LIST_RESIDENCE] }, { occupation: [HEALTHCARE] } ] }
when: { not: { city: [AUCKLAND] } }
```

A list within a dimension means any-of; keys in one object mean all-of. `matches(when, profile)` is a pure function.

### 3.6 Schema rules (enforced by `content:build`, `make check`, CI)

1. Every item and fact has `source` (a registry id), `checked` (ISO date) and `verified`.
2. Source domains follow §3.2.
3. Dollar amounts, percentages, durations and deadlines in item text must come from a `{{fact}}` (checked by pattern: `$`, `%`, a number followed by a time unit); identifiers such as form names or phone numbers may be literal. Facts declare `numberType`.
4. Conditions name only registry dimensions and values.
5. Denylist (whole-word, case-insensitive): the old case-study names `Priya`, `Karthik`, `DBS`; first person (`I`, `I'd`, `we recommend`). Voice is neutral second person; anything the denylist cannot catch (e.g. a single household's circumstances) is checked in stage 3.
6. Staleness: `checked` older than its period fails — type B 6 months, type C 3 months, other items 12 months; type A is reviewed on law change and at least every 12 months.
7. Unique stable ids; every `dependsOn` exists and is not retired; no dependency cycles; every `{{fact}}` resolves.
8. `verified: false` fails unless `CONTENT_ALLOW_UNVERIFIED=true` (local only; never set in staging or production, asserted by the deploy config check).

## 4. Runtime

### 4.1 Bundle

`npm run content:build -w @landednz/api` validates (§3.6), resolves facts into text (keeping fact ids per item), and writes `content-bundle.json`. `contentVersion` is a hash of the bundle. The bundle is a build artifact (gitignored), built in CI and the Docker image.

### 4.2 Content module — `apps/api/src/content/`

- `ContentSource` interface: `load(): Promise<Bundle>`. Today `FileContentSource` reads the built bundle. A CMS-published or storage-fetched bundle later is a new `ContentSource`, with no change to consumers.
- At start-up the API loads and re-validates the bundle; an invalid bundle stops start-up with a clear error.
- API: `tasks()`, `task(id)`, `itemsFor(task, profile)` (items grouped by section, filtered by `matches`), `fact(id)`, `contentVersion`.
- Everything that read task tables reads this module: roadmap, task detail, priority scoring, onboarding preview, chat task context.

### 4.3 Database changes (one Prisma migration)

- **Dropped:** `Task`, `TaskDependency`, `TaskContentVariant`, `KnowledgeBaseVersion`, `UserProfile.personaKey`.
- **`UserRoadmapEntry.taskId`:** plain string, no FK. On start-up every stored `taskId` is checked against the bundle: retired tasks are served read-only (§8.3); unknown ids are logged and hidden, never a crash.
- **`KnowledgeBaseChunk`:** `personaKey` → `when` (JSON), add `contentHash`, `itemIds`, `sourceIds`.
- **Accountability:** `UserRoadmapEntry` and `ChatMessage` record `contentVersion`; assistant `ChatMessage` rows record the item and fact ids used. A `ContentRelease` table (version, built at, git commit) records each bundle that was served.
- Existing users: answers are kept; `recalculateAllRoadmaps` re-scores everyone after the first bundle loads. No user data is lost.

### 4.4 Chunk sync (replaces seed + `db-reset-live`)

On each new bundle a sync step builds chunks (per task: one for its general items, one per distinct condition set, each with its sources), upserts by `chunkKey`, embeds only chunks whose `contentHash` changed (or whose embedding mode changed), and deletes chunks no longer in the bundle. RAG retrieval filters chunks with `matches(when, profile)` instead of `personaKey`. Switching mock ↔ live embeddings is a re-sync, not a database wipe.

## 5. Research and verification workflow

| Stage | Work | Output | Gate |
|---|---|---|---|
| 0 | Check onboarding options against Immigration NZ's current visa categories and how city/family/occupation change settlement steps. Confirm the Immigration Advisers Licensing Act 2007 boundary (information vs immigration advice) and NZ government content reuse terms. | Proposed `dimensions.yaml` with a source per change; IAA boundary note | Owner approves |
| 1 | Check the task list against official settlement guidance (Immigration NZ, IRD, NZTA, Tenancy Services, Health NZ, MBIE), pre-arrival to month 6. | Task inventory: keep / merge / split / add / retire, phases, dependencies, a source per decision | Owner approves |
| 2 | Research each task with the `anthropic-skills:deep-research` skill, official sources only (provider sources only for type C). Pilot one task (IRD number) end to end first. | Task YAML, its facts, research note `content/research/<id>.md` (questions, sources used and rejected with reasons, uncertainties, what is deliberately not said) | Schema gate |
| 3 | Independent verification: a fresh-context verifier gets only the YAML, facts and source URLs (not the research note), opens every source and marks each item supported (with passage) / partly / not supported. Compliance check: visa items state Immigration NZ's information without advising on the user's own case; tax and tenancy items stay informational and carry the advice note where the official guidance says to get advice. | Verification record appended to the research note | Not-supported items fixed or removed, never softened |
| 4 | `content:build` renders a review page per task showing the text a given answer set would see, each line linked to its source. | Review page | Owner approves; item `verified: true` |

Writing rules: short paraphrase in neutral second person; no long copying of government text; no persona names; home-country matters only as the D2 note.

Pacing: at most two plan tasks per session. Order: stages 0–1, pilot, then tasks in batches by phase.

## 6. Build order

1. **Content platform:** zod schemas, `content:build`, bundle, `ContentSource`, content module, `matches()` — TDD against small fixtures.
2. **Backend switch-over:** all consumers to the content module; the §4.3 migration; `contentVersion` and used-item recording.
3. **Chunk sync** (§4.4).
4. **Conversion bridge:** a one-off script converts `kb-master.md` into the new format with persona names stripped and every item `verified: false`, so the app keeps working locally (`CONTENT_ALLOW_UNVERIFIED=true`) until verified content replaces it.
5. **Research stages 0 and 1**, with owner approvals.
6. **Dimension changes** if approved: registry, enums, onboarding options, profile migration (§8.2).
7. **Pilot task**, then **all tasks in batches by phase** (stages 2–4).
8. **Per-item source links** on the task page (§8.1).
9. **Remove** `kb-master.md`, the conversion script and `seed-knowledge-base.ts` once every task is verified.

## 7. Testing

- **Unit:** `matches()` for every condition form; one failing fixture per §3.6 rule; fact resolution; staleness; dependency cycles; scoring rewritten on answers and `boosts`.
- **Content tests on the real bundle:** every answer combination yields a non-empty roadmap with no dangling dependency; no unresolved `{{fact}}`; every source id exists.
- **Integration** (real local Supabase, auth never mocked): roadmap and task detail APIs; RAG returns only chunks matching the user's answers; chunk sync embeds only changed chunks.
- **E2E:** existing journey and change-answers specs keep passing; a family user sees a family-only step and a solo user does not.

## 8. UI changes (each needs an approved design board first, CW02′)

1. **Per-item source links** on the task page: each step, document, mistake, watch-out, cost and advice line links its source and shows its checked date. The task detail API adds `source { title, url, checked }` per item; the response keeps its current shape otherwise.
2. **Onboarding options**, only if stage 0 changes them: same layout, new option lists from the registry.
3. **Retired task** in an existing roadmap: shown like a completed task with a "no longer needed" note, only if stage 1 retires a task someone has started.

No other UI changes; the roadmap API keeps its shape.

## 9. Error handling

- Invalid bundle: API refuses to start; CI catches it before deploy.
- Unknown stored `taskId`: logged at start-up, hidden from the user.
- Unresolved fact: build failure, never rendered as `{{…}}`.
- Verifier or research tool unavailable: the task stays unverified and cannot ship; no fallback to unverified text in production.

## 10. Out of scope

CMS or admin UI, translations, scheduled source monitoring (fetch registered sources and flag changed pages), a country-of-origin question, and switching chat to `AI_MODE=live` (an owner choice; after §4.4 it no longer needs a database wipe). Each has a seam in this design: `ContentSource`, stable item ids, the sources registry, the dimensions registry.
