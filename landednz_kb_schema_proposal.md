# LandedNZ Knowledge Base — Schema Design & Task Ordering Proposal
**Status:** AWAITING APPROVAL before content build begins
**Date:** 2026-03-03
**Version:** v1.0 schema proposal

---

## SECTION 1: PROPOSED CANONICAL TASK ORDERING

### Ordering principles applied
1. Pre-arrival tasks first (do before leaving home country)
2. Day 1–Week 1 critical path next (must do immediately on arrival)
3. Week 1–Month 1 settlement tasks
4. Month 2–6 integration tasks
5. Ongoing/long-horizon tasks last
6. Dependencies respected (e.g. IRD number before KiwiSaver; individual bank account before joint account)

---

### Proposed task list (21 tasks)

| ID | Task Name | Phase | Timing |
|----|-----------|-------|--------|
| T01 | Auckland suburb research | Pre-Arrival | 4–6 weeks before departure |
| T02 | Temporary accommodation booking | Pre-Arrival | 4–6 weeks before departure |
| T03 | Overseas bank account final prep | Pre-Arrival | 1–2 months before departure |
| T04 | Moving and transit insurance | Pre-Arrival | 1–2 weeks before departure |
| T05 | Home country tax — final year considerations | Pre-Arrival | 2–3 months before departure |
| T06 | NZ SIM card | Arrival (Day 1) | Day 1 |
| T07 | Open NZ bank account in person | Arrival (Day 1–3) | Day 1–3 |
| T08 | IRD number application | Week 1 | Day 1–5 |
| T09 | Tax code declaration (IR330) | Week 1 | Before first pay |
| T10 | KiwiSaver election | Week 1 | Before first pay |
| T11 | Rental agreement and bond | Week 1–4 | As soon as rental secured |
| T12 | Register with GP | Week 2–4 | Within first month |
| T13 | ACC overview | Week 1 | Reading task — Day 1 onward |
| T14 | NZ tenancy rights | Week 1–2 | Before signing rental |
| T15 | Set up international remittances | Month 1–2 | Once bank account active |
| T16 | NZ driving licence conversion | Month 2–6 | Within 18 months of arrival |
| T17 | NZQA qualification assessment | Month 1–3 | Pre-arrival preferred |
| T18 | Build NZ credit history | Month 3–6 | Ongoing |
| T19 | NZ CV and LinkedIn | Pre-Arrival / Month 1–2 | Before job search begins |
| T20 | KiwiSaver first contribution confirmation | Month 2–3 | ~8–10 weeks after first pay |
| T21 | Joint bank account | Month 2–4 | Once settled in rental |

---

**Notes on ordering decisions:**
- T13 (ACC) placed at Week 1 as a reading/awareness task — no action needed but knowledge is immediately relevant
- T14 (tenancy rights) placed before T11 (rental agreement) in reading order — know your rights before you sign
- T17 (NZQA) placed Month 1–3 but flagged as pre-arrival preferred — content will make this clear
- T19 (CV/LinkedIn) listed pre-arrival/Month 1–2 because job search preparation ideally begins before arrival
- T21 (joint account) last because it depends on T07 (individual accounts) and being settled in rental

---

## SECTION 2: DOCUMENT SCHEMA

### 2.1 Schema overview

Each task entry follows an identical schema with the fields below. Field names use `snake_case` for machine readability. All fields are present in every task — no optional fields (missing data is represented as `null` or `"N/A"` with a reason, never omitted).

---

### 2.2 Complete field specification

```
---
TASK_ID: T[XX]
TASK_NAME: [Full human-readable name]
VERSION: [e.g. 1.0]
LAST_VERIFIED: [YYYY-MM-DD]
VERIFIED_BY: [Name]
NEXT_REVIEW_TRIGGER: [What should prompt a review — e.g. "Annual — ACC levy rates change 1 April each year"]
---

METADATA:
  phase: [Pre-Arrival | Arrival | Week 1 | Month 1-2 | Month 2-6 | Ongoing]
  timing: [When to do this, plain English]
  time_required: [Estimated effort e.g. "30–60 min"]
  priority_score: [1–100, higher = more urgent]
  task_type: [Free | Premium]
  professional_advice_required: [true | false]
  professional_advice_note: [If true: what kind of advice and why. If false: null]

SUMMARY:
  [2–3 sentence plain English summary of what this task is and why it matters for new migrants.
  Written to be retrieved standalone — assumes no other task context.]

WHAT_AND_WHY:
  [Full explanation of the task. What it is, why NZ has this system, why it matters specifically
  for skilled migrants on work visas. Enough context for someone with zero NZ knowledge.
  Typically 150–300 words.]

HOW_TO:
  [Step-by-step guidance. Numbered steps where sequence matters.
  Include: what to bring, where to go, what to expect, common mistakes to avoid.
  Typically 200–400 words.]

KEY_FACTS:
  [Bullet list of the most important facts a user must know.
  Each fact tagged with its number type inline: [Type A], [Type B], or [Type C]
  Example: "Bond maximum is 4 weeks rent [Type A — Residential Tenancies Act 1986]"
  Typically 5–10 bullets.]

NUMBER_TYPES:
  - figure: [The specific number, date, threshold, or fee]
    type: [A | B | C]
    type_label: [Statutory | Administrative | Market]
    source: [Legislation name / authority name]
    caveat: [What the AI should say when presenting this figure]
    last_confirmed: [YYYY-MM-DD]

PERSONA_CONSTRAINED_COUPLE:
  [Specific guidance for Priya + Karthik scenario.
  Must be fully self-contained — written as if this is the only content the AI has retrieved.
  Include: which person this task applies to, any couple-specific nuances,
  any Sri Lanka / India / Singapore-specific considerations,
  any student visa considerations for Karthik.
  Typically 100–200 words.]

PERSONA_SOLO_AEWV:
  [Specific guidance for solo skilled migrant on AEWV.
  Must be fully self-contained.
  Typically 80–150 words.]

CROSS_REFERENCES:
  related_tasks:
    - task_id: [T_XX]
      task_name: [Task name]
      relationship: [Why these tasks are related — e.g. "IRD number required before completing this task"]
  inline_references:
    [Any inline cross-references used in the content above, listed here for AI indexing]

WATCH_OUTS:
  [Common mistakes, misconceptions, or traps specific to migrants from India/Sri Lanka/Singapore.
  Things that differ from what they may expect based on home country experience.
  Typically 3–6 bullet points.]

SOURCES:
  - title: [Source name]
    url: [Full URL]
    tier: [1 | 2 | 3]
    tier_label: [Primary Government | Government-Affiliated / Reputable | Commercial / Community]
    last_accessed: [YYYY-MM-DD]
    notes: [Any caveats on source reliability or recency]
```

---

### 2.3 Field definitions and rules

**TASK_ID:** Sequential T01–T21. Fixed. Do not renumber after approval.

**VERSION:** Starts at 1.0. Increment minor version (1.1, 1.2) for content updates. Increment major version (2.0) for structural changes.

**LAST_VERIFIED / VERIFIED_BY / NEXT_REVIEW_TRIGGER:** Maintenance metadata. NEXT_REVIEW_TRIGGER written as a plain English condition, not a date — because some tasks are event-triggered (budget announcements, policy changes) not calendar-triggered.

**PHASE:** Maps to LandedNZ app phases. Controls which tasks the AI surfaces based on user's settlement stage.

**PRIORITY_SCORE:** 1–100. Used for task surfacing order within a phase. Carried forward from verified KB scores.

**TASK_TYPE:** Free = available to all users. Premium = requires paid tier. Carried forward from MVP scope.

**PROFESSIONAL_ADVICE_REQUIRED:** Boolean. If true, the AI must surface the professional_advice_note at the end of any response that uses this task's content. Never suppress this flag.

**SUMMARY:** Written for RAG retrieval. This field is what the AI reads first to decide if the task is relevant to a query. Must be dense and specific — no filler phrases.

**WHAT_AND_WHY:** Context layer. Explains the NZ-specific system to someone from India/Sri Lanka/Singapore. Does not assume prior NZ knowledge.

**HOW_TO:** Action layer. Practical steps. Written for someone doing this for the first time, alone, in a new country.

**KEY_FACTS:** Quick-reference layer. The 5–10 most important facts. Each fact tagged inline with number type.

**NUMBER_TYPES:** Machine-readable table of all figures used in this task. The AI queries this field to determine caveat requirements before presenting any number to a user. Type A = state as fact. Type B = state with "confirm current rate at [source]". Type C = state as guidance with "check current [market/provider] rates".

**PERSONA_CONSTRAINED_COUPLE / PERSONA_SOLO_AEWV:** Persona routing layer. The AI selects the relevant field based on known user persona. Each field is fully self-contained for isolated retrieval.

**CROSS_REFERENCES:** Two sub-fields. `related_tasks` is a structured list for AI task graph traversal. `inline_references` mirrors any cross-references used in prose content so the AI can resolve them without re-parsing the full text.

**WATCH_OUTS:** Migrant-specific risk flags. Prioritises India/Sri Lanka/Singapore-specific misconceptions. Surfaced proactively by the AI when a user reaches this task.

**SOURCES:** Full citation. Tier 1 = primary government sources (ird.govt.nz, tenancy.govt.nz, acc.co.nz, immigration.govt.nz etc). Tier 2 = government-affiliated or consistently reliable (sorted.org.nz, cab.org.nz, careers.govt.nz). Tier 3 = commercial or community sources used only where Tier 1/2 unavailable.

---

### 2.4 Number type caveat rules (for AI layer)

These rules are embedded here for reference during content build and for AI system prompt design.

| Type | Label | Rule |
|------|-------|------|
| A | Statutory | State as confirmed fact. Cite legislation. e.g. "The bond maximum is 4 weeks rent, set by the Residential Tenancies Act 1986." |
| B | Administrative | State with recency caveat. e.g. "The current NZQA assessment fee is NZD $445 — confirm the current fee at nzqa.govt.nz before applying as this is set by NZQA and reviewed periodically." |
| C | Market | State as guidance only. e.g. "GP visit costs for enrolled patients typically range $20–50 in Auckland — check with your specific practice as fees vary." |

---

### 2.5 Document structure

```
DOCUMENT HEADER
├── Document metadata (version, date, scope)
├── How to use this document (for AI and human readers)
├── Persona definitions
├── Phase map
└── Number type taxonomy

TASK ENTRIES (T01–T21)
└── [21 × full schema entries]

APPENDICES
├── Appendix A — Sources master list (all URLs consolidated)
├── Appendix B — Number types master register (all figures across all tasks)
├── Appendix C — Policy change log (dated record of updates post-verification)
└── Appendix D — Glossary (NZ-specific terms explained for migrants)
```

---

### 2.6 RAG chunking strategy

Each task entry is one chunk. The document header + appendices form separate chunks. Recommended chunk boundaries:

| Chunk | Content |
|-------|---------|
| CHUNK_00 | Document header, persona definitions, phase map, taxonomy |
| CHUNK_T01 through CHUNK_T21 | One chunk per task, full schema entry |
| CHUNK_APP_A | Sources master list |
| CHUNK_APP_B | Number types master register |
| CHUNK_APP_C | Policy change log |
| CHUNK_APP_D | Glossary |

Total: 26 chunks at MVP. Each chunk is self-contained. The AI retrieves CHUNK_00 on every query (system context) plus the 1–3 most relevant task chunks based on query embedding similarity.

---

## SECTION 3: WHAT NEEDS YOUR APPROVAL

**3.1 Task ordering (T01–T21)**
Review the proposed canonical order in Section 1. Confirm or request changes before content build begins. Task IDs are fixed once approved.

**3.2 Schema completeness**
Review the field specification in Section 2.2. Any fields to add, remove, or rename?

**3.3 Appendices scope**
Are all four appendices (Sources, Number types register, Policy change log, Glossary) in scope for the initial document build? Or defer any to a later version?

**3.4 One sample task**
Recommended: before building all 21 tasks, I write one complete task entry (suggest T08 — IRD number application, highest stakes, good representative complexity) for you to review. If the schema works in practice, proceed to full build. If adjustments needed, fix on one task before multiplying across 21.

---

*Schema proposal complete. Awaiting approval on items in Section 3 before content build begins.*
