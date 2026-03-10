# 09 — AI Design
*Written: February 2026*
*Purpose: Specify the complete AI architecture for LandedNZ — both the
roadmap engine and the chat advisor. Every decision is grounded in
product requirements, failure mode analysis, and build constraints.
This document is the technical specification that feeds directly into
Section 7 (Tech Stack) and the Claude Code Build Specification.*
*Feeds into: Section 7 (Tech Stack), Section 8 (MVP Scope),
Claude Code Build Specification*

---

## FOUNDATIONAL PRINCIPLE

LandedNZ uses AI in two fundamentally different ways. These two jobs
must never be conflated in implementation — they have different
requirements, different failure modes, and different success criteria.

**Job A — The Roadmap Engine (deterministic)**
Takes onboarding inputs and produces a correctly sequenced,
personalised task list. Correctness is non-negotiable. Hallucination
is unacceptable. A wrong sequence costs the user money.

**Job B — The Chat Advisor (generative)**
Answers settlement questions grounded in verified content, personalised
to the user's specific situation. Helpfulness and honesty are the
primary criteria. Appropriate uncertainty is acceptable and required.

**The boundary between these two jobs is inviolable:**
The AI never touches task sequencing, dependency resolution, or
priority scoring. These are deterministic operations performed by
the roadmap engine. The AI only generates display language on top
of engine output — and answers conversational questions grounded
in the knowledge base.

This boundary must be preserved in every implementation decision.

---

## MODEL SELECTION

**Model: Claude (Anthropic) — single model for both jobs at MVP**

Rationale:
- One API integration, one billing relationship, one rate limit to manage
- Claude's instruction-following strength is critical for guardrail adherence
- Claude handles nuanced, context-heavy conversations well — essential for
  the persona-consistency requirements of the chat advisor
- Single model simplifies debugging — one failure surface, not two

Post-MVP evaluation: After MVP validation with real usage data, evaluate
whether a specialised embedding model improves retrieval quality, and
whether a smaller/faster model is appropriate for lower-stakes tasks.

**Tech stack: Framework-agnostic at this stage.**
All architectural decisions in this document are implementation-agnostic.
Framework and language selection is Section 7.

---

## PART A: ROADMAP ENGINE

### A1 — What the roadmap engine must do

Eight requirements the engine must satisfy simultaneously:

**R1 — Correct dependency resolution**
Hard dependencies between tasks must be enforced. Bank account cannot
precede SIM card. IRD must precede KiwiSaver election (soft dependency).
No task appears as actionable if its hard dependencies are unmet.

**R2 — Persona-aware task selection**
Tasks are filtered by visa type, family situation, and occupation.
School zone research excluded for childless couples. Nursing Council
registration excluded for non-healthcare occupations. Only applicable
tasks appear in the user's roadmap.

**R3 — Priority scoring**
Tasks are ranked by urgency within and across phases. The top 3
non-blocked, non-completed tasks are always the genuinely highest-priority
tasks for this specific user at this specific moment.

**R4 — Dynamic adaptation on completion**
Marking a task complete immediately updates the roadmap. Blocked tasks
become available when their dependencies are satisfied. The "Do these
first" top 3 recalculates in real time.

**R5 — Manual override handling**
Users who completed tasks before finding LandedNZ can bulk-mark them
complete. The engine recalculates from the user's actual current state,
not from Day 1 of the settlement journey.

**R6 — Time-aware urgency**
Priority scores factor in elapsed time since arrival. Tasks approaching
hard deadlines (foreign licence Month 10–11, tax year end March 31)
escalate in priority automatically. Time passes — urgency updates.

**R7 — Maintainability without redeployment**
Adding a new visa type, updating a processing time, changing a consequence
line — all are data changes, not code changes. No redeployment required
for content updates.

**R8 — AI personalisation boundary**
The AI personalisation layer is read-only with respect to the task graph.
It generates display language. It never alters task order, dependencies,
task selection, or priority scores.

---

### A2 — Conceptual data model

*Note: This is a conceptual model — entity relationships and field
definitions. Final schema (table structure, indexing, normalisation,
storage engine) is determined in Section 7 when the tech stack is selected.*

**Entity 1 — Task**
The atomic unit of the settlement journey. One record per distinct
settlement action.

Fields:
- `task_id` — unique identifier (e.g., `task_ird_application`)
- `name` — action-oriented display name ("Apply for your IRD number")
- `phase` — 1, 2, or 3
- `base_priority` — integer 0–100, universal importance score
- `estimated_duration` — display string ("15 minutes", "30–60 minutes")
- `processing_time` — display string if applicable ("8–15 working days")
- `government_source_url` — authoritative reference, always present
- `applicable_visa_types` — array of visa type keys
- `applicable_family_situations` — array of situation keys
- `applicable_occupations` — array, or "ALL"
- `content_version` — integer, increments on any content update

**Entity 2 — Task Dependency**
A directed edge between two tasks. Represents ordering constraints.

Fields:
- `source_task_id` — the prerequisite task
- `target_task_id` — the dependent task
- `dependency_type` — HARD (blocking) or SOFT (recommended order)

Examples:
- `task_sim_card` → `task_bank_account` (HARD — NZ number required)
- `task_bank_account` → `task_rental_bond` (HARD — account required)
- `task_ird_application` → `task_kiwisaver_election` (SOFT — easier after)
- `task_bank_account` → `task_ird_application` (SOFT — recommended order)

**Entity 3 — Task Content Variant**
Persona-specific content for each task. Multiple records per task —
one per relevant persona combination.

Fields:
- `variant_id` — unique identifier
- `task_id` — foreign key to Task
- `persona_key` — persona identifier (e.g., `constrained_couple`,
  `solo_aewv`, `family_with_children`)
- `consequence_line` — base consequence line for this persona
  ("Without this, your first paycheck — your only income right now
  — is taxed at 45% emergency rate")
- `steps` — ordered array of step-by-step instructions
- `documents_required` — array of required documents for this persona/visa
- `common_mistakes` — array of observed mistakes specific to this persona
- `cost` — string if applicable ("Free", "NZD $XX")
- `ai_personalisation_prompt` — short instruction fragment for the AI
  personalisation layer (see A5 below)
- `source_url` — verified authoritative source for this content
- `content_version` — integer, increments on update

**Entity 4 — User Roadmap State**
The user's current completion state. Updated in real time.

Fields:
- `user_id` — foreign key to user account
- `task_id` — foreign key to Task
- `status` — NOT_STARTED | IN_PROGRESS | COMPLETE | SKIPPED
- `completion_timestamp` — when status last changed
- `completion_method` — USER_MARKED | BULK_OVERRIDE | AI_SUGGESTED
- `last_sync_version` — content version at time of last sync

**Entity 5 — Knowledge Base Version**
A single record tracking the global content version number.

Fields:
- `current_version` — integer, incremented on any content update
- `last_updated` — timestamp
- `updated_by` — admin user reference

This single record is the signal the delta sync checks on every
app open. One integer comparison determines whether a content
sync is needed.

---

### A3 — Roadmap engine architecture: Hybrid cache with delta recomputation

Three architecture options were evaluated:

**Option A — Static generation (generate once, store result)**
Rejected: Breaks R6 (time-aware urgency — frozen at generation).
Breaks R7 (content updates don't reach stored roadmaps without
full regeneration for all users).

**Option B — Full dynamic generation (recompute on every app open)**
Rejected: Creates unnecessary database dependency on every open.
If database is unavailable, roadmap cannot load. Blocks future
offline capability. Wasteful at MVP user volumes where nothing
has changed between most sessions.

**Option C — Hybrid cache with delta recomputation**
Selected. Satisfies all 8 requirements. Optimal performance,
reliability, and correctness balance.

**How Option C works:**

*Initial generation (post-onboarding):*
Full computation runs once after onboarding completes:
1. Fetch all tasks from database
2. Filter by user's visa type, family situation, occupation (R2)
3. Resolve dependency graph — identify blocked and available tasks (R1)
4. Calculate priority scores for all available tasks (R3)
5. Order tasks by priority within phases
6. Store result in local cache with current content version number

*On every subsequent app open — delta check (3 triggers):*

```
TRIGGER 1 — Completion state change:
Compare cache timestamp against most recent completion timestamp
in Entity 4. If completions have occurred since last computation:
→ Re-resolve dependencies for affected tasks only
→ Recalculate priority scores for newly unblocked tasks
→ Update "Do these first" top 3
→ Update cache

TRIGGER 2 — Time threshold crossing:
Check current date against time-sensitive task urgency windows:
→ Days 1–3: SIM card and bank account urgency +30
→ Days 4–14: IRD urgency +25
→ Month 10–11: Foreign licence urgency +30
→ March (tax year approaching): Tax filing urgency +25
If any threshold has been crossed since last computation:
→ Update priority scores for affected tasks
→ Recalculate top 3
→ Update cache

TRIGGER 3 — Content version change:
Single API call: fetch current_version from Entity 5
Compare against last_sync_version stored in cache
If version has changed:
→ Fetch only changed task content variants from database
→ Update cached content for affected tasks
→ No full recomputation needed — content update only

If all three triggers return no change:
→ Serve cached roadmap immediately
→ Zero database load
→ Zero computation
```

*Offline resilience:*
The cached roadmap is always available regardless of connectivity.
Delta sync runs when connectivity is restored. Primary product
function (viewing and interacting with the roadmap) works offline.
Task completion is queued locally and synced when online.

---

### A4 — Priority scoring algorithm

The "Do these first" top 3 must always surface the genuinely
highest-priority tasks. The scoring algorithm is fully deterministic
and auditable — no inference, no AI involvement.

**Formula:**
```
final_priority = base_priority
               + persona_weight
               + time_urgency_bonus
               - completion_dependency_penalty
```

**Base priority (0–100):**
Set in database per task. Universal importance in settlement journey.

| Task | Base Priority |
|---|---|
| IRD number application | 95 |
| Bank account | 90 |
| NZ SIM card | 85 |
| KiwiSaver election | 80 |
| GP registration | 60 |
| Driving licence (foreign validity) | 55 |
| Rental agreement / bond | 75 |
| Tax code declaration to employer | 88 |

**Persona weight (+0 to +20):**
Added based on how critical the task is for this specific persona.

| Task | Constrained Couple | Family with Children | Solo AEWV |
|---|---|---|---|
| IRD / tax code | +20 | +15 | +10 |
| KiwiSaver opt-out consideration | +15 | +10 | +5 |
| GP registration | +10 | +20 | +5 |
| School zone research | 0 | +20 | 0 |
| Driving licence | +5 | +15 | +5 |

**Time urgency bonus (+0 to +30):**
Added based on elapsed time since arrival date and approaching deadlines.

| Condition | Bonus |
|---|---|
| Days 1–3: SIM card incomplete | +30 |
| Days 1–3: Bank account incomplete | +30 |
| Days 4–14: IRD not yet applied | +25 |
| IRD applied, tax code not declared to employer | +28 |
| Month 10–11: Foreign licence still in use | +30 |
| February–March: Tax filing tasks incomplete | +25 |

**Completion dependency penalty (-50 if blocked):**
Applied to any task with an unmet HARD dependency.
Prevents blocked tasks from appearing in the top 3.

**Result:**
All non-completed tasks ranked by final_priority.
Top 3 non-blocked tasks = "Do these first."
Fully deterministic. Fully auditable. No AI involved.

---

### A5 — AI personalisation layer

The AI personalisation layer has exactly one job: generate personalised
consequence lines and contextual language for the top 3 tasks on
roadmap reveal. It does not touch sequencing, dependencies, or scoring.

**Trigger:** Roadmap reveal (after onboarding or on returning user open
when top 3 has changed since last session).

**Input to AI call (per task in top 3):**
```json
{
  "task_id": "task_ird_application",
  "base_consequence_line": "Without an IRD number, income is taxed at 45% emergency rate.",
  "ai_personalisation_prompt": "This user is on a single income supporting a student partner. Emphasise the financial cost in terms of their specific income constraint and the compounding effect of delayed action.",
  "user_profile": {
    "visa_type": "partner_of_student",
    "family_situation": "constrained_couple",
    "partner_situation": "student_visa_20hr_limit",
    "city": "Auckland",
    "arrival_days_ago": 2,
    "estimated_salary": 65000
  }
}
```

**Output from AI call:**
```
"Without this, your first paycheck — your only income right now
— is taxed at 45% emergency rate. On a $65K salary, every week
of delay costs $280–400 that you cannot recover."
```

**Graceful degradation:**
If the AI personalisation call fails (network error, rate limit,
timeout) — the system falls back silently to the base consequence
line from the database. The roadmap loads. Personalisation degrades
gracefully. The user sees a slightly less personalised consequence
line — not an error.

This is a hard architectural constraint: the roadmap never fails
because of an AI failure.

**Boundary enforcement:**
The AI personalisation call is strictly read-only with respect to
the task graph. The call signature accepts task content and user
profile. It returns only a display string. There is no mechanism
by which this call can alter task order, add or remove tasks,
or modify priority scores. The boundary is enforced structurally,
not by instruction.

---

## PART B: CHAT ADVISOR

### B1 — Precise definition

The LandedNZ chat advisor is:

*A contextually-aware settlement advisor that answers questions
grounded in verified NZ settlement content, personalised to a
specific user's visa type, family situation, city, occupation,
and current position in their settlement journey — and that knows
when to answer, when to redirect, and when to express uncertainty.*

Every word in this definition is a design constraint:
- **Contextually-aware:** knows who it's talking to before first message
- **Grounded in verified content:** answers traceable to authoritative sources
- **Personalised:** same question from different users gets different answers
- **Knows when to answer:** in-scope detection working correctly
- **Knows when to redirect:** out-of-scope handling working correctly
- **Knows when to express uncertainty:** epistemic honesty when needed

---

### B2 — Failure mode map

Twelve failure modes identified and addressed architecturally.
Every failure mode has a specific architectural response — none
are left to model behaviour alone.

| # | Failure Mode | Severity | Addressed At |
|---|---|---|---|
| FM1 | Hallucination on consequential facts | Critical | Behavioural constraints + RAG grounding |
| FM2 | Out-of-scope answer given confidently | Critical | Scope boundaries + Level 1 guardrail |
| FM3 | Correct answer, wrong persona | High | User profile injection + persona anchor |
| FM4 | Context drift over long conversations | High | Double persona anchor |
| FM5 | Stale information | High | RAG grounding (retrieved content preferred) |
| FM6 | Wrong persona content retrieved | High | Persona pre-filter before semantic search |
| FM7 | Confidence miscalibration | Medium-High | UNCERTAINTY + SPECIFICITY constraints |
| FM8 | Emotional escalation mishandling | Medium-High | EMOTIONAL SIGNALS constraint + Level 1 crisis detection |
| FM9 | Scope boundary edge case failure | Medium | Three-tier scope boundary design |
| FM10 | Token limit breach | Medium | Token budget allocation + efficient injection |
| FM11 | Prompt injection | Medium | Level 1 injection pattern detection |
| FM12 | Latency degradation | Medium | Standard RAG (not agentic) + non-blocking output guardrails |

---

### B3 — Knowledge base design

The knowledge base is what the RAG retrieval layer operates on.
Its design determines the quality ceiling of every chat response.

**Three content types — handled differently:**

**Content Type 1 — Task content (structured)**
The settlement tasks themselves. Most consequential content —
errors here cause direct financial harm to users.

Per task, per persona variant:
- Official process (steps verified against government source)
- Documents required (specific, visa-type accurate)
- Processing times (specific, sourced, dated)
- Common mistakes (observed, not inferred)
- Cost if applicable
- Source URL (authoritative — IRD, MBIE, Immigration NZ, Tenancy Services)

Chunking: One chunk per task per persona variant (200–400 tokens).
Self-contained — each chunk has everything needed to answer a
question about that task for that persona. No cross-chunk inference required.

**Content Type 2 — Settlement context (semi-structured)**
Background knowledge for contextual questions not tied to specific tasks.

Topics:
- Auckland suburb profiles (school zones, transport, rental market)
- NZ workplace culture (leave, 90-day trial, pay norms, union rights)
- NZ banking system (which banks accept international applicants)
- Cost of living context (typical rent by suburb, groceries, utilities)
- NZ healthcare system (ACC, what's free, private insurance)
- Remittance options (factual comparison — Wise vs OFX vs bank transfer)

Chunking: Topic-based with generous overlap (300–600 tokens).
Each chunk self-contained. Adjacent topics include enough overlap
that retrieval of one chunk provides sufficient context without
requiring retrieval of the adjacent chunk.

**Content Type 3 — Policy and regulatory reference (authoritative)**
The policy text underpinning settlement decisions.

Coverage:
- Employment Relations Act provisions relevant to migrants
- Residential Tenancies Act provisions (bond, notice, maintenance)
- IRD tax code guidelines
- KiwiSaver Act provisions
- Immigration NZ visa condition summaries by visa type

Chunking: Provision-level (150–300 tokens). Each chunk is one
specific provision or rule. Always paired with section reference
and source URL. Small chunks prevent mixing of provisions that
apply in different circumstances.

**Content update and versioning:**
Every chunk has a content version timestamp. When policy changes:
1. Admin updates the affected chunk in the database
2. Knowledge Base Version record (Entity 5) increments
3. Re-embedding triggered for changed chunks only
4. Delta sync on next user app open fetches updated chunks
5. No full knowledge base re-embedding required
6. No model retraining required
7. No redeployment required

**Source verification requirement:**
Every chunk must have a verified source URL. This is enforced
in the data model — source URL is a required field, not optional.
Chunks without a source URL cannot be committed to the knowledge base.

---

### B4 — RAG retrieval architecture

**Approach: Standard RAG with persona pre-filter**

Agentic RAG evaluated and rejected for LandedNZ at MVP:
- Query space is narrow and predictable (~50 topic clusters)
- Knowledge base is small and bounded (~80 tasks + context)
- Agentic retrieval adds 1–3 seconds per iteration round
- Multiple retrieval rounds introduce non-determinism in a product
  where consistency builds trust
- Standard RAG with precise retrieval design delivers 95% of what
  Agentic RAG would deliver at this knowledge base complexity —
  at a fraction of the latency and architectural overhead

**Retrieval pipeline:**

```
USER QUERY
    ↓
PERSONA PRE-FILTER
Filter knowledge base to chunks matching:
- user.visa_type
- user.family_situation
- user.city (where city-specific content exists)
- applicable = true (exclude non-applicable tasks)
This filter runs BEFORE semantic search — not after.
    ↓
SEMANTIC SEARCH (within filtered set)
Convert user query to embedding vector
Cosine similarity search against filtered chunk embeddings
Retrieve top 5 most similar chunks
    ↓
RELEVANCE + PERSONA MATCH SCORING
Re-rank retrieved chunks by:
- Semantic similarity score (primary)
- Persona match exactness (secondary — exact match > general)
- Content recency (tertiary — more recently updated = higher rank)
    ↓
SELECT TOP 3–5 CHUNKS
Fixed budget: minimum 3, maximum 5 chunks per query
Inject into system prompt (Component 5)
```

**Why the persona pre-filter is critical:**

Without the persona pre-filter, semantic search may retrieve the
solo AEWV worker KiwiSaver variant when Priya (constrained couple)
asks about KiwiSaver — because the chunks are semantically similar.
The model then generates advice grounded in the wrong persona content.

The pre-filter eliminates this failure mode (FM6) at the architectural
level, before any semantic comparison occurs.

**Fixed chunk budget rationale:**
- Fewer than 3 chunks: insufficient grounding for complex questions
- More than 5 chunks: diminishing returns on answer quality,
  unnecessary token consumption, increased latency
- 3–5 chunks covers 95%+ of settlement questions within scope

---

### B5 — System prompt architecture

The system prompt has 5 components plus a double persona anchor.
Target total: 2,250–3,150 tokens.
Exceeding 3,500 tokens requires justification — every token costs
money on every API call.

---

**COMPONENT 1 — Identity and role definition (~150 tokens)**

```
You are LandedNZ, a settlement advisor for skilled migrants
arriving in New Zealand. Your role is to help migrants navigate
the practical steps of settling in NZ — in the right order,
with the right information for their specific situation.

You are not a general-purpose assistant. You are not an
immigration lawyer. You are not a financial advisor. You are
not a medical professional. You are a knowledgeable friend
who understands exactly what a new migrant needs to do and when.
```

---

**COMPONENT 2 — User profile injection (~300–500 tokens)**

Injected dynamically per user. Content varies by:
- Completion state (5 most recent completions + dependency-relevant tasks)
- Entry point (task context included for Entry Points 1 and 3 only)
- Arrival timing (days since arrival calculated at injection time)

```
THE PERSON YOU ARE HELPING:
Name: [name from account]
Visa type: [visa_type]
Family situation: [family_situation]
[If constrained_couple:]
Partner situation: [partner on student visa, 20hr limit during term]
Income constraint: Single income household
[If family_with_children:]
Children: [ages]
City: [city]
Professional background: [occupation]
Arrival: [X days ago / arriving in X days]
Settlement phase: [Phase 1 / Phase 2 / Phase 3]

RECENTLY COMPLETED TASKS:
[Last 5 completions with brief detail where available]
- NZ SIM card ✓
- Bank account ✓ (ASB, temporary address accepted)
- IRD number ✓ (applied Day 3, expecting 8–15 working days)

[CONDITIONAL — Entry Points 1 and 3 only:]
CURRENT TASK CONTEXT:
Task: [task_name]
[task_consequence_line]
[Brief task status — what the user is trying to decide or do]
```

**Profile injection constraints:**
- Only 5 most recent completions injected (not full history)
- Dependency-relevant tasks also injected if they affect current query
  (e.g., if user asks about KiwiSaver, IRD completion status injected
  even if not in recent 5)
- Current task context injected only for Entry Points 1 and 3
- Arrival days calculated fresh at injection time — not cached

---

**PERSONA ANCHOR — TOP (~60 tokens)**

Placed immediately after Component 2, before Component 3:

```
PERSONA ANCHOR — READ BEFORE EVERY RESPONSE:
You are speaking with [name] — [family_situation], [visa_type],
[city]. Every response must account for this specific context.
If your response would differ for a solo worker or dual-income
couple, ensure you are giving [name]'s answer, not the generic answer.
```

This anchor is short but placement is deliberate. Prominent position
ensures it is not diluted by subsequent content before the model
begins processing.

---

**COMPONENT 3 — Behavioural constraints (~400 tokens)**

Eight explicit rules. These are hard constraints, not suggestions.

```
BEHAVIOURAL CONSTRAINTS:

1. GROUNDING: Every factual claim must be grounded in the
   retrieved knowledge base content provided in Component 5.
   If the answer is not in the retrieved content, say so
   explicitly. Do not generate NZ-specific facts from general
   training knowledge.

2. SPECIFICITY: Be specific. "You should apply soon" is not
   acceptable. "Apply within the next 3 days so your IRD number
   arrives before your first paycheck" is acceptable.

3. CITATION: End every response with the authoritative source.
   Format: "Source: [Source Name] — [URL]"
   Never omit the citation. Never cite a source not present
   in the retrieved content.

4. UNCERTAINTY: If uncertain about a specific fact, say so.
   Use: "Based on current IRD guidance, though you should
   verify this directly..."
   Never present uncertain information as certain.

5. PERSONA CONSISTENCY: Every answer must account for the
   user's specific situation as described in the profile above.
   Never give generic advice that ignores their income
   constraint, partner situation, visa type, or city.

6. SCOPE: Answer settlement questions only. Follow SCOPE
   BOUNDARIES (Component 4) exactly for boundary and
   out-of-scope questions.

7. EMOTIONAL SIGNALS: If the user expresses distress,
   overwhelm, or emotional difficulty — acknowledge it
   warmly and directly before providing any information.
   Never lead with task information when an emotional
   signal is present in the message.

8. NEVER FABRICATE: If you do not know something, say so.
   Never invent processing times, costs, policy details,
   or government requirements. An honest "I'm not certain —
   here's where to verify" is always better than a
   confident wrong answer.
```

---

**COMPONENT 4 — Scope boundaries (~500 tokens)**

Three-tier design: in-scope, boundary cases, out-of-scope.
The boundary cases tier directly prevents FM9 (edge case failures).

```
SCOPE BOUNDARIES:

IN SCOPE — Answer directly and specifically:
- IRD number, tax codes, emergency tax, KiwiSaver
- Bank account opening, credit building in NZ
- Tenancy rights, rental bond, rental agreements
- GP registration, Healthline, ACC basics
- NZ driving licence conversion, foreign licence validity
- NZQA qualification assessment process
- Remittance options (factual comparison only)
- NZ CV format, job search platforms, interview norms
- NZ workplace culture (leave, 90-day trial, pay norms)
- School zone research, school enrolment (for families)
- Auckland suburb profiles (factual — transport, costs, zones)

BOUNDARY CASES — Answer with explicit scope acknowledgment:
These questions are partially in scope. Provide factual
information only. Never advise on decisions.

- Salary questions: Provide market data only.
  ("The median salary for software engineers in Auckland
  is approximately $X based on SEEK data.")
  Never advise whether to accept or reject an offer.

- Suburb recommendations: Describe factual tradeoffs only.
  Never tell the user which suburb to choose.

- KiwiSaver fund selection: Explain fund types and factors.
  Never recommend a specific fund provider.

- Employer reputation: Do not answer. Direct to Glassdoor
  or LinkedIn for peer reviews.

OUT OF SCOPE — Redirect warmly, specifically, immediately:

Immigration legal advice (visa conditions, visa breaches):
→ "Immigration legal questions need a Licensed Immigration
  Adviser. Find one at: immigration.govt.nz/find-an-adviser"

Employment law disputes (dismissal, discrimination, unpaid wages):
→ "For employment disputes, Employment NZ (employment.govt.nz)
  and Citizens Advice Bureau are the right resources."

Medical advice (symptoms, diagnoses, medication):
→ "For medical questions, Healthline is free and available
  24/7: 0800 611 116."

Financial investment advice (shares, property, fund selection):
→ "For investment decisions, Sorted.org.nz is New Zealand's
  independent financial guidance service."

Emotional crisis or severe distress signals:
→ "It sounds like you're going through a really difficult time.
  Settling in a new country is genuinely hard — you're not
  alone in finding it overwhelming. If you need someone to
  talk to, Lifeline NZ is available 24/7: 0800 543 354.
  They're experienced with exactly this kind of transition."

REDIRECT FORMAT — Always follow this structure:
1. Acknowledge the question is valid and real
2. Explain briefly why LandedNZ doesn't answer it
3. Name the specific resource with contact details or URL
4. Offer to help with the next settlement step when ready
Never use: "I can't answer that" without this full structure.
```

---

**COMPONENT 5 — Retrieved knowledge base content (~900–1,500 tokens)**

RAG layer output injected here. 3–5 chunks, each with source URL.

```
RETRIEVED KNOWLEDGE BASE CONTENT:
Use this verified content to ground your response.
Prefer this content over training knowledge for any
NZ-specific facts, processes, or requirements.

[CHUNK 1 — identifier — persona variant]
[chunk content]
Source: [Source Name] — [URL]

[CHUNK 2 — identifier — persona variant]
[chunk content]
Source: [Source Name] — [URL]

[Continue for 3–5 chunks]
```

---

**PERSONA ANCHOR — BOTTOM (~60 tokens)**

Repeated at the end of the system prompt, after retrieved content:

```
FINAL REMINDER: You are speaking with [name] —
[family_situation], [visa_type], [city].
Ground every response in the retrieved content above
and in [name]'s specific circumstances.
```

Research on LLM instruction following shows critical instructions
placed at both beginning and end of context outperform instructions
placed only at the beginning. The double anchor directly addresses
FM4 (context drift) for longer conversations.

---

**COMPLETE SYSTEM PROMPT TOKEN BUDGET:**

| Component | Tokens |
|---|---|
| Component 1 — Identity | ~150 |
| Component 2 — User profile | ~300–500 |
| Persona anchor (top) | ~60 |
| Component 3 — Behavioural constraints | ~400 |
| Component 4 — Scope boundaries | ~500 |
| Component 5 — Retrieved content (3–5 chunks) | ~900–1,500 |
| Persona anchor (bottom) | ~60 |
| **Total system prompt** | **~2,370–3,170 tokens** |

Target: Stay below 3,500 tokens. Above this, review each component
for reduction before adding new content.

---

### B6 — Complete request pipeline

Every user message travels this path, in this order:

```
USER MESSAGE
     ↓
[1] LEVEL 1 GUARDRAIL — Input classifier (rules-based, ~50ms)

    Crisis signal detection:
    Keywords/patterns: "don't know what to do", "can't cope",
    "want to give up", "end it", explicit self-harm language
    → If detected: pre-load crisis resource into prompt.
      Model leads response with Lifeline NZ resource.

    Prompt injection detection:
    Patterns: "ignore previous instructions", "you are now",
    "disregard your system prompt", "pretend you are",
    "DAN mode", "jailbreak"
    → If detected: pre-load rejection instruction.
      Model acknowledges message, explains role cannot change,
      offers settlement help.

    Out-of-scope signal detection:
    Strong signals: medical symptom descriptions, legal case
    details, investment portfolio questions, explicit visa
    interpretation requests
    → If detected: pre-load specific redirect instruction
      for that category.

    Implementation at MVP: Rules-based keyword and pattern
    matcher. Not an ML model. Sufficient for constrained
    query space. Upgrade to ML-based classification post-MVP
    when real usage data informs training set.

     ↓
[2] RAG RETRIEVAL

    Apply persona pre-filter:
    Filter knowledge base by user.visa_type,
    user.family_situation, user.city (where applicable)

    Semantic search within filtered set:
    Convert user message to embedding vector
    Cosine similarity against filtered chunk embeddings

    Re-rank by: similarity score + persona match + recency

    Select top 3–5 chunks

     ↓
[3] PROMPT CONSTRUCTION

    Assemble in order:
    - Component 1: Identity
    - Component 2: User profile (dynamically injected)
    - Persona anchor (top)
    - Component 3: Behavioural constraints
    - (Level 1 guardrail augmentations inserted here if triggered)
    - Component 4: Scope boundaries
    - Component 5: Retrieved content
    - Persona anchor (bottom)
    - Conversation history (full, within token budget)
    - Current user message

     ↓
[4] MODEL GENERATION (Claude)

    Generates response grounded in retrieved content.
    Applies all behavioural constraints.
    Includes source citation.
    Calibrates confidence per UNCERTAINTY constraint.
    Handles emotional signals per EMOTIONAL SIGNALS constraint.

     ↓
[5] LEVEL 2 GUARDRAIL — Output validation (logged, not blocking at MVP)

    Citation presence check:
    Does response contain "Source:" with URL?
    → If absent: append "Please verify with relevant NZ
      government source." Do not block response.

    Specific number logging:
    Does response contain specific percentages, dollar amounts,
    processing times, or deadlines?
    → Log for human review. Do not block.
    → Review cadence: weekly at MVP.

    Out-of-scope response detection:
    Does response appear to directly answer an out-of-scope
    question rather than redirecting?
    → Log for human review. Do not block.

    All Level 2 guardrails: LOGGED, NOT BLOCKING at MVP.
    Rationale: blocking adds latency and complexity. Logging
    provides data to identify failure patterns. Post-MVP,
    add blocking guardrails selectively based on observed
    failure modes.

     ↓
[6] RESPONSE DISPLAYED TO USER

    Source link formatted as tappable (not raw URL)
    Next action offer appended if AI generated one
    Crisis resource prepended if Level 1 flagged crisis signal
```

---

### B7 — Conversation design specifications

Beyond the pipeline, specific conversation design rules that
shape how every interaction feels:

**Opening message — always specific, never generic:**

Entry Point 1 (from task card):
> "You're looking at the [task name] task. I know you're
> [persona-specific context — e.g., on a single income right now
> with your partner studying]. What would you like to know?"

Entry Point 2 (from roadmap — general):
> "Hi [name] — you've completed [X] tasks so far.
> What would you like to know about settling in Auckland?"

Entry Point 3 (from email deep link):
Same as Entry Point 1, pre-loaded with email task context.

Entry Point 4 (from navigation):
Same as Entry Point 2.

Generic opening ("Hi! How can I help?") is never acceptable.
It signals the product has no awareness of the user's situation.

**Every answer structure:**
1. Direct answer (specific, not hedged unless genuinely uncertain)
2. Persona-specific context (why this matters for their situation)
3. Source citation (authoritative URL, always present)
4. Next action offer (optional — "Would you like me to walk you
   through the next step?")

**Session memory — completion state as proxy for continuity:**
The model does not retain conversation history across sessions (MVP).
On return, completion state signals awareness:
> "You've completed 7 tasks including KiwiSaver election.
> What's on your mind?"

This is honest — the model genuinely knows the completion state.
It is not fabricating memory of a previous conversation.

**Uncertainty expression — calibrated, not evasive:**

When uncertain: "Based on current IRD guidance — though processing
times can vary, so verify directly at ird.govt.nz."

Not: "I cannot be certain about this." (evasive, unhelpful)
Not: "Processing always takes exactly 10 days." (overclaims)

**Out-of-scope redirect — always warm, always specific:**

Wrong: "I can't answer that."
Right: "Career decisions are outside what I can reliably guide you
on — but Careers NZ (careers.govt.nz) is built exactly for this.
Once you've decided, come back and I'll walk you through the
employment setup steps for your visa."

Every redirect:
1. Acknowledges the question is real and valid
2. Names specific resource with URL or phone number
3. Leaves door open for next settlement question

---

### B8 — Knowledge base maintenance system

**Update workflow:**
```
Policy change detected
     ↓
Admin updates affected Task Content Variant in database
     ↓
Knowledge Base Version (Entity 5) increments
     ↓
Re-embedding triggered for changed chunks only
(Not full knowledge base — changed chunks only)
     ↓
On next app open for all users:
Delta sync detects version change (single integer comparison)
Fetches updated chunk content
Updates local cache
     ↓
Next relevant query retrieves updated chunk
Updated content in model context
No redeployment. No model retraining.
```

**At MVP — manual updates via admin interface:**
Knowledge base is small enough (50–80 tasks + context) that
manual updates are manageable. Admin interface provides:
- Task content variant editor (all fields editable)
- Source URL validator (must be a live, accessible URL)
- Preview of how content appears in retrieval
- Version history with diff view
- One-click re-embedding trigger for changed chunks

**Source verification requirement:**
Every chunk requires a verified source URL before it can be
saved to the knowledge base. Admin interface enforces this —
save button disabled if source URL field is empty or URL returns
a non-200 status. No content without a source enters the system.

**Review cadence at MVP:**
Weekly review of Level 2 guardrail logs (specific numbers,
out-of-scope responses). Any flagged response traced to its
source chunk and corrected if needed.

---

## PART C: INTEGRATION — HOW THE TWO JOBS CONNECT

The roadmap engine (Job A) and chat advisor (Job B) are separate
systems that share one data source: the knowledge base.

**Shared data:**
- Task Content Variants (Entity 3) — used by both the roadmap engine
  (for consequence lines and task detail) and the chat advisor
  (as knowledge base chunks for RAG retrieval)
- User Roadmap State (Entity 4) — used by the roadmap engine
  (for dynamic adaptation) and by the chat advisor
  (for completion state injection into system prompt)

**No shared compute:**
The roadmap engine computation and the chat advisor generation
are independent processes. A failure in the chat advisor never
affects roadmap engine output. A slow chat response never delays
roadmap loading. The graceful degradation principle applies to
both systems independently.

**Data flow:**
```
ONBOARDING INPUTS
     ↓
ROADMAP ENGINE
→ Filters tasks (R2)
→ Resolves dependencies (R1)
→ Scores priorities (R3)
→ Returns ordered task list
     ↓
AI PERSONALISATION LAYER
→ Reads top 3 tasks
→ Reads Task Content Variants (Entity 3)
→ Generates personalised consequence lines
→ Returns display text only
     ↓
ROADMAP DISPLAYED TO USER
     ↓
[User taps task card]
     ↓
TASK DETAIL SERVED FROM Entity 3
(no AI call for task card detail — served directly from database)
     ↓
[User taps "Ask a question"]
     ↓
CHAT ADVISOR PIPELINE (Part B above)
→ Reads Entity 4 (completion state for profile injection)
→ Reads Entity 3 (knowledge base for RAG retrieval)
→ Generates response
     ↓
USER RECEIVES ANSWER
     ↓
[User marks task complete]
     ↓
Entity 4 updated
Roadmap engine delta check triggered
Top 3 recalculated
```

---

## DECISIONS LOG — AI DESIGN

| Decision | What | Why |
|---|---|---|
| Single model | Claude (Anthropic) for both jobs | One API, one billing, one failure surface. Claude's instruction-following critical for guardrail adherence |
| Tech stack | Framework-agnostic | Stack decision in Section 7 — architecture must not be constrained by implementation preference |
| Data model | Conceptual only | Final schema requires tech stack decision. Relationships and fields correct. Storage implementation TBD |
| Roadmap engine type | Deterministic core — AI never touches sequencing | Sequencing errors cost users money. Deterministic = auditable, testable, correct |
| Roadmap architecture | Hybrid cache + delta recomputation | Satisfies all 8 requirements. Static fails time-awareness. Full dynamic fails reliability |
| Delta triggers | 3 triggers: completion, time threshold, content version | Minimum necessary to keep roadmap current. Each trigger maps to a specific requirement |
| Priority scoring | Formula: base + persona + time urgency - dependency penalty | Fully deterministic, fully auditable, no AI inference |
| AI personalisation scope | Top 3 tasks only, read-only, graceful degradation | Personalisation where it matters most. Boundary enforced structurally not by instruction |
| RAG approach | Standard RAG, persona pre-filter, 3–5 chunk budget | Agentic RAG: unnecessary latency + cost + non-determinism for narrow query space |
| Persona pre-filter | Applied before semantic search | Prevents wrong persona content retrieval at architectural level, not instruction level |
| Knowledge base types | 3 types: task content, settlement context, policy reference | Different update frequency, different chunking needs, different retrieval patterns |
| Chunking strategy | Per type: task (200-400), context (300-600), policy (150-300) | Chunk size matched to content coherence and retrieval precision requirements |
| System prompt structure | 5 components + double persona anchor | Each component addresses specific failure modes. Double anchor prevents context drift |
| Token budget | Target 2,250–3,150, hard limit 3,500 | Every token costs money on every call. Discipline enforced from start |
| Behavioural constraints | 8 explicit rules, hard constraints | Failure modes FM1, FM3, FM5, FM7, FM8 addressed here |
| Scope boundaries | Three tiers: in-scope, boundary cases, out-of-scope | Binary in/out fails edge cases. Three tiers handle the full spectrum of question types |
| Level 1 guardrails | Rules-based classifier, pre-generation | Speed (50ms), cost (negligible), sufficient for constrained query space at MVP |
| Level 2 guardrails | Logged not blocking at MVP | Blocking adds latency. Logging provides failure data. Blocking guardrails added post-MVP selectively |
| Knowledge base maintenance | Manual via admin interface at MVP | Knowledge base small enough. Automated update detection is over-engineering for MVP |
| Source requirement | Required field, enforced in data model | No content without a source enters the system. Enforced structurally not by policy |
| Graceful degradation | Roadmap never fails due to AI failure | Hard architectural constraint. AI personalisation falls back to base content silently |
| Failure mode coverage | All 12 addressed at specific layers | No failure mode left to model behaviour alone |

---

*Next document: 10-tech-stack.md*
*Section 7 takes the framework-agnostic architecture defined here
and selects the specific technologies — language, framework, database,
embedding model, hosting, and deployment approach — that best serve
LandedNZ's requirements at MVP scale.*
