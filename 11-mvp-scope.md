# 11 — MVP Scope
*Written: February 2026*
*Purpose: Define precisely what gets built in the first version of
LandedNZ — and what does not. Every inclusion is justified against
the build constraint. Every deferral is explicit. This document feeds
directly into the Claude Code Build Specification.*
*Feeds into: Claude Code Build Specification (12-build-specification.md)*

---

## THE CONSTRAINT

**Available time:** 25 hours per week
**Deadline:** June 2026 (before Auckland relocation)
**Available weeks from March 1, 2026:** 16 weeks
**Total build budget:** 25 × 16 = 400 hours

**Budget allocation:**
- Stack setup and local environment: 20 hours
- App Store and Play Store setup: 15 hours
- Database schema, migrations, seed data: 20 hours
- Knowledge base content creation (21 tasks × 2 variants): 40 hours
- Authentication and user accounts: 15 hours
- Admin tooling (Prisma Studio — zero build cost): 0 hours
- **Product features:** ~290 hours

290 hours for product features. Every scope decision below is
measured against this budget.

---

## THE SCOPING PRINCIPLE

Not: "What would make this product great?"

**"What is the minimum set of features that validates the core
thesis — that sequencing and personalisation deliver enough value
that migrants pay NZD $9.99/month for it?"**

If the answer is yes after MVP, we have a product.
If the answer is no, we know early enough to pivot.
Every feature that does not contribute to answering this question
delays the answer.

---

## THE FIVE-QUESTION SCOPE FILTER

Every feature passes through this filter:

1. **Does it validate the core thesis?**
   Does this feature directly test whether sequencing + personalisation
   is worth paying for?

2. **Does it block something else?**
   Is this required before another included feature can work?

3. **Can it be faked at MVP?**
   Can we simulate with manual effort rather than building fully?
   If yes — fake it and use the hours elsewhere.

4. **What breaks without it?**
   Does absence cause complete failure, or just incompleteness?

5. **How many hours does it cost?**
   Against a 290-hour feature budget, every hour matters.

---

## FEATURE DECISIONS

### INCLUDED — Entry Point (Flow 1)
Full implementation.
Auckland landmark visual, progressive text reveal, skip option.
Validates thesis: Sets empathy-first positioning — without it the
product feels generic from the first second.
Cannot be faked. Blocks thesis validation.
**Hours: 15**

---

### INCLUDED — Onboarding (Flow 2)
Full implementation.
5 questions, couple follow-up, profile persistence, loading state.
Validates thesis: Personalisation starts here. No profile = no
personalised roadmap = no thesis.
Cannot be faked. Blocks everything downstream.
**Hours: 20**

---

### INCLUDED — Roadmap Engine
**Simplified version at MVP.**

Full hybrid cache + delta recomputation architecture (Section 6)
is the correct long-term design. At MVP with a small, actively
monitored user base, a simpler approach is sufficient:

MVP implementation:
- Generate roadmap once at onboarding completion
- Store ordered task list in database per user
- On completion: recompute affected tasks and update stored list
- Content updates: admin triggers manual regeneration via
  a single API endpoint
- Time-aware urgency: daily background job recalculates priority
  scores based on elapsed days since arrival

What this MVP simplification defers:
- Local device cache (roadmap served from database, not cache)
- Automatic content delta sync on app open
- Offline roadmap access

These are real limitations at MVP. They are acceptable because:
- MVP user base is small and actively monitored
- Internet connectivity assumed for initial validation
- Full hybrid cache architecture added in v2 when user volumes
  justify the complexity

Full hybrid cache + delta recomputation: **v2**
**Hours: 15**

---

### INCLUDED — Roadmap Reveal (Flow 3)
Full implementation.
Priority-first "Do these first" (top 3), collapsed phase headers,
progress indicators after completion begins.
Validates thesis: "Do these first" is the thesis made visible.
Cannot be faked.
**Hours: 20**

---

### INCLUDED — Task Card Interaction (Flow 4)
Full implementation — all 7 interaction states.
Bottom sheet two heights, completion micro-animation, next task
highlight, government source links.
Validates thesis: Task cards are how users act on sequencing advice.
Cannot be faked. Core interaction pattern.
**Hours: 25**

---

### INCLUDED — Premium Gate (Flow 5)
Full implementation — all 3 response paths.
Gate card with value anchor, task preview, IRD math reframe,
pricing buttons. Upgrade path, defer path, decline path.
Validates thesis: This IS the monetisation validation.
Does sequencing deliver enough value that users pay?
RevenueCat integration for App Store compliance.
**Hours: 20**

---

### INCLUDED — AI Chat Advisor (Flow 6)
**Two-phase implementation within MVP build.**

Phase A (Week 12–13): Chat without RAG
System prompt with full user profile injection, behavioural
constraints, scope boundaries. Claude responds from training
knowledge. Streaming SSE. All 4 entry points. Level 1 guardrails
(rules-based keyword classifier). Validates that the advisor
concept works and feels right before adding retrieval complexity.

Phase B (Week 14): RAG layer added
pgvector embeddings for all knowledge base chunks. Persona
pre-filter retrieval. 3–5 chunk injection into system prompt.
Level 2 guardrail logging. Full Section 6 chat architecture.

Why two phases within MVP:
Phase A ships a working chat advisor that can be tested with
real users before Phase B adds retrieval grounding. If Phase A
reveals a fundamental UX problem with the chat concept, Phase B
effort is not wasted on a flawed foundation.

**Hours: 40 (20 Phase A + 20 Phase B)**

---

### INCLUDED — AI Personalisation Layer
**Base consequence lines only at MVP. AI generation deferred.**

The graceful degradation principle (Section 6) means the base
consequence lines from the database are a complete product —
not a degraded one. AI-generated personalisation of consequence
lines is polish, not core functionality.

The thesis is validated by:
- Correct task sequencing (deterministic engine)
- Persona-appropriate task selection (database filter)
- Consequence lines that explain why each task matters (database content)

Whether those consequence lines say "on a single income" vs
the base version does not determine whether a user pays.
Defer AI personalisation of consequence lines to v2 and use
the 15 hours on RAG implementation (higher impact).

AI personalisation of consequence lines: **v2**
**Hours saved: 15 (redirected to Phase B RAG)**

---

### SIMPLIFIED — Returning User Experience (Flow 7)
**Scenario 1 only at MVP.**

Scenario 1 (active returner — last session within 3 days):
Contextual banner above "Do these first" section.
"Welcome back — you completed X tasks last time. Here's what's next."
Updated top 3 reflecting completion state.

Scenarios 2 and 3: **v2**

What this means:
- Checking-in returner (5–10 days away): standard roadmap open,
  no status check card. Still works — just less contextual.
- Email deep link entry: opens to roadmap, not specific task sheet.
  Deep link navigation added in v2.

**Hours: 5**

---

### SIMPLIFIED — Smart Reminders — Email
**Manual trigger at MVP. Automated scheduling in v2.**

Resend email service integrated. Email templates built
(SmartReminder, GateDefer). But scheduling logic (cron jobs,
user-specific timing) is not built at MVP.

Manual trigger: Admin calls a Resend API endpoint directly
to send reminder emails to specific users during MVP validation.
At 50–200 users this is manageable. At 1,000+ users it is not —
automated scheduling added in v2.

Automated smart reminders: **v2**
**Hours: 5 (templates + manual API trigger)**

---

### DEFERRED — Lapsed User Re-entry (Flow 8)
**v2.**

At MVP, lapsed users (10+ days absent) get a standard app open —
roadmap in current state, no triage screen. Still functional.
Lapsed re-entry is a retention optimisation, not a thesis validation
feature. With a small MVP user base, manually reaching out to lapsed
users is feasible.

Lapsed user triage screen and smart re-entry email: **v2**
**Hours saved: 15**

---

### DEFERRED — Custom Admin Interface
**Prisma Studio at MVP.**

Prisma Studio is a visual database editor included with Prisma
at zero build cost. Provides GUI editing for all database records —
task content variants, source URLs, version numbers.

For a single developer managing their own knowledge base at MVP
scale (21 tasks × 2 variants = 42 records), Prisma Studio is
entirely sufficient.

Custom admin interface with content versioning UI,
source URL validator, and preview: **v2**
**Hours saved: 20**

---

## WHAT IS IN MVP

| Feature | Implementation | Hours |
|---|---|---|
| Entry point | Full | 15 |
| Onboarding | Full | 20 |
| Roadmap engine | Simplified (generate once + store) | 15 |
| Roadmap reveal | Full | 20 |
| Task card interaction | Full — all 7 states | 25 |
| Premium gate | Full — 3 response paths | 20 |
| AI chat (Phase A — no RAG) | System prompt + streaming | 20 |
| AI chat (Phase B — RAG) | pgvector retrieval + guardrails | 20 |
| Returning user Scenario 1 | Welcome banner only | 5 |
| Email (manual trigger) | Templates + Resend API | 5 |
| Stack setup + infra | Docker, Expo, Fastify, Prisma | 20 |
| App Store + Play Store setup | EAS Build, listings | 15 |
| Auth | Supabase Auth + OAuth | 15 |
| DB schema + migrations | All Section 6 entities | 20 |
| Knowledge base content | 21 tasks × 2 variants | 40 |
| **Total** | | **295 hours** |

295 hours against a 290-hour feature budget.
5-hour overrun absorbed by the simplifications:
Prisma Studio (saved 20h), no AI personalisation layer (saved 15h),
no lapsed flow (saved 15h), no automated reminders (saved 15h).

---

## WHAT IS OUT — DEFERRED TO V2

| Feature | Why Deferred | Impact at MVP |
|---|---|---|
| AI personalisation layer (consequence lines) | Base lines validate thesis. Polish, not core. | Slightly less personalised consequence lines |
| Full hybrid cache + delta recomputation | Simplified engine sufficient at MVP user volumes | No offline access. Roadmap loads from DB. |
| Returning user Scenarios 2 and 3 | Scenario 1 sufficient | Less contextual returning experience |
| Lapsed user re-entry (Flow 8) | Retention optimisation, not thesis validation | Lapsed users see standard roadmap |
| Automated smart reminders | Manual sufficient at MVP scale | Manual email outreach during validation |
| Custom admin interface | Prisma Studio sufficient | DB editing via Prisma Studio |
| Dual-partner live tracking | Static onboarding input sufficient | Partner's status is static from onboarding |
| Maria persona (post-student) | Priya + Karthik validate core thesis | Auckland new arrival only |
| Wellington + Christchurch variants | Auckland sufficient for validation | Auckland-only at MVP |
| B2B employer channel | Consumer validation first | Direct to consumer only |
| Deep link navigation (email → specific task) | General deep link in v1 | Email links open app to roadmap |

---

## THE 21 MVP TASKS

The knowledge base is scoped to exactly the tasks needed to
validate the thesis with Priya and Karthik in Auckland.
No more, no less.

### Phase 1 — Before you arrive (5 tasks)
1. Research Auckland suburbs (school zones, transport, rental cost)
2. Open a NZ bank account from overseas
3. Book temporary accommodation (first 2–4 weeks)
4. Arrange international moving insurance
5. Obtain tax documentation from home country

### Phase 2 — First 2 weeks: Free tier (5 tasks — Tasks 1–5)
6. Get a NZ SIM card *(Free Task 1)*
7. Open NZ bank account in person *(Free Task 2)*
8. Apply for IRD number *(Free Task 3)*
9. Find and sign rental agreement *(Free Task 4)*
10. Register with a GP *(Free Task 5)*

### Phase 2 — First 2 weeks: Premium tier (3 tasks — Tasks 6–8)
11. Submit tax code declaration to employer *(Premium Task 6)*
12. KiwiSaver election *(Premium Task 7)*
13. Set up international remittances *(Premium Task 8)*

### Phase 3 — Weeks 3–8: Premium tier (8 tasks — Tasks 9–16)
14. NZ driving licence conversion *(Premium Task 9)*
15. NZQA qualification assessment *(Premium Task 10)*
16. Understand ACC (accident compensation) *(Premium Task 11)*
17. Build NZ credit history *(Premium Task 12)*
18. Understand NZ tenancy rights *(Premium Task 13)*
19. Set up NZ CV and LinkedIn for NZ market *(Premium Task 14)*
20. Open joint bank account (couples) *(Premium Task 15)*
21. Confirm KiwiSaver first contribution *(Premium Task 16)*

**Content scope:**
- 21 tasks × 2 persona variants = 42 Task Content Variant records
- Persona variants at MVP: `constrained_couple` and `solo_aewv`
- `family_with_children` variant: v2 (Raj and Aroha persona)
- Each variant requires: consequence line, steps, documents required,
  common mistakes, cost if applicable, verified source URL

**Task dependency map (HARD dependencies only):**

```
task_sim_card → task_bank_account_inperson
task_bank_account_inperson → task_rental_agreement
task_ird_application → task_tax_code_declaration
task_ird_application → task_kiwisaver_election (SOFT)
task_rental_agreement → task_gp_registration (SOFT — needs NZ address)
```

---

## BUILD SEQUENCE

16 weeks, 5 phases. Each phase produces a testable deliverable
before the next phase begins. The sequence follows the dependency
chain — no feature is built on an unproven foundation.

---

### Phase 1 — Foundation (Weeks 1–3, ~60 hours)

**Goal:** Full technical stack running locally.
No product features — but everything the product features
run on top of is proven and working.

Week 1 (~20 hours):
- Monorepo setup (npm workspaces, shared types package)
- Docker Compose running PostgreSQL 16 + pgvector
- Fastify server with TypeScript, basic health endpoint
- Prisma schema — all 5 entities (Task, TaskDependency,
  TaskContentVariant, UserRoadmapState, KnowledgeBaseVersion)
- First migration runs clean

Week 2 (~20 hours):
- Supabase Auth integration (email, Google OAuth, Apple Sign-In)
- React Native Expo project, navigation shell
- Auth screens (sign up, sign in, sign out)
- API connection verified — mobile app calls backend, auth works

Week 3 (~20 hours):
- Knowledge base seed script — all 21 tasks, base content
- All 42 Task Content Variant records populated with verified content
- Dependency graph seeded (all HARD and SOFT edges)
- pgvector extension enabled, embedding column added to
  knowledge_base_chunks table

**Phase 1 deliverable:**
App opens → user signs in → navigation shell works →
database has all task content. Ready to build product features.

---

### Phase 2 — Core Product (Weeks 4–8, ~100 hours)

**Goal:** The product thesis in working software.
Priya can complete onboarding, see her personalised roadmap,
interact with task cards, and mark tasks complete.

Week 4 (~20 hours):
- Entry point screen (Flow 1) — landmark visual, progressive
  text animation, skip option
- Onboarding questions (Flow 2) — all 5 questions, couple
  follow-up, profile persistence

Week 5 (~20 hours):
- Roadmap engine — persona filter, dependency resolution,
  priority scoring, generate-and-store implementation
- Loading state + roadmap reveal (Flow 3) — "Do these first"
  top 3, collapsed phase headers

Week 6 (~20 hours):
- Task card bottom sheet (Flow 4) — half-height state,
  consequence line, time estimate, 3 action buttons
- Full-height state — step-by-step, documents, mistakes,
  source link

Week 7 (~20 hours):
- All 7 task card interaction states (Flow 4 complete)
- Completion micro-animation
- Next task highlight after completion
- "Already done" bulk marking

Week 8 (~20 hours):
- Returning user Scenario 1 (welcome back banner)
- Progress indicators on phase headers
- Navigation polish — all screens connected correctly

**Phase 2 deliverable:**
Priya completes onboarding → sees personalised roadmap →
taps task cards → reads detail → marks tasks complete →
roadmap updates. Core thesis visible and testable.

---

### Phase 3 — Monetisation (Weeks 9–11, ~55 hours)

**Goal:** The business model in working software.
Priya can subscribe, unlock the full roadmap, and manage
her subscription.

Week 9 (~20 hours):
- Premium gate card UI (Flow 5) — value anchor, task preview,
  IRD math, pricing buttons
- Gate response paths — upgrade, defer (session dismiss),
  decline (persistent banner)

Week 10 (~20 hours):
- RevenueCat integration — iOS StoreKit, Android Google Play Billing
- Subscription products configured (NZD $9.99/month, NZD $49/6-month)
- RevenueCat webhook → backend subscription status endpoint

Week 11 (~15 hours):
- Subscription state management — locked/unlocked task enforcement
- Premium access verification on task card open
- Post-purchase confirmation flow — gate disappears, full roadmap
  unlocks, Task 6 highlights

**Phase 3 deliverable:**
Priya hits the gate at Task 6 → sees gate card → taps upgrade
→ payment flows through RevenueCat → full roadmap unlocks.
Revenue is possible.

---

### Phase 4 — AI Chat Basic (Weeks 12–13, ~40 hours)

**Goal:** Chat advisor concept working and feeling right.
No RAG grounding yet — validates UX before adding retrieval.

Week 12 (~20 hours):
- Fastify SSE streaming endpoint
- Claude API integration (claude-sonnet-4-20250514)
- System prompt construction — all 5 components, dynamic
  profile injection, persona anchor
- Level 1 guardrail (rules-based keyword classifier)

Week 13 (~20 hours):
- Chat sheet UI in React Native — bottom sheet on top of
  task card sheet
- Streaming text rendering (token by token)
- All 4 entry points wired (task card, roadmap, navigation,
  email stub)
- Out-of-scope redirect handling in UI

**Phase 4 deliverable:**
Priya taps "Ask a question about KiwiSaver" → chat sheet
opens pre-loaded with task context → she asks a question →
Claude responds with streaming text → source citation appears.
Advisor concept proven.

---

### Phase 5 — RAG and Launch (Weeks 14–16, ~60 hours)

**Goal:** Chat responses grounded in verified content.
Product ready for real users.

Week 14 (~20 hours):
- Embedding generation script — all knowledge base chunks
  embedded and stored in pgvector
- RAG retrieval pipeline — persona pre-filter, cosine similarity
  search, chunk injection into system prompt
- Level 2 guardrail logging (citation check, number flagging)

Week 15 (~20 hours):
- Email templates (Resend + React Email) — SmartReminder,
  GateDefer, manual send via Resend API
- App Store submission preparation — screenshots, metadata,
  privacy policy, App Store Connect setup
- Expo EAS Build configuration — production build pipeline

Week 16 (~20 hours):
- App Store submission (iOS) via Expo EAS
- Play Store submission (Android) via Expo EAS
- Beta testing with 5–10 real users (friends, network, community)
- Critical bug fixes from beta feedback

**Phase 5 deliverable:**
App submitted to App Store and Play Store.
RAG-grounded chat responses.
Real users can download and use LandedNZ.

---

## RISK REGISTER

Three risks that could break the timeline — stated honestly
with specific mitigations.

---

**Risk 1 — App Store review delay**

Apple's review takes 1–7 days under normal circumstances.
A rejection resets the clock and can add 2–4 weeks.

Probability: Medium (first-time submission, payment integration)
Impact: High (delays launch past June deadline)

Mitigation:
- Submit at end of Week 14 — two weeks before the build window ends
- Follow Apple's Human Interface Guidelines for payment integration precisely
- Use Expo EAS Build which has established App Store approval patterns
- Prepare rejection response plan — most common reasons are
  metadata issues or payment flow violations, both fixable in 1–2 days

---

**Risk 2 — Knowledge base content quality**

40 hours for 42 Task Content Variant records requires verification
against IRD, Tenancy Services, Immigration NZ, and other
government sources. Inaccurate content is a product-level failure.

Probability: Medium (NZ-specific details require careful sourcing)
Impact: High (wrong IRD processing times or tax rates erode trust)

Mitigation:
- Content creation is Phase 1 Week 3 — not left to the end
- Schema enforces source URL as required field — verification
  is part of content creation, not a separate step
- Review each task against primary government source before seeding
- For any uncertain fact: use a range rather than a specific number,
  or direct to source rather than stating a specific claim

---

**Risk 3 — React Native learning curve overrun**

Estimated 2–4 weeks of ramp-up. Could extend to 6–8 weeks
if unexpected complexity arises (Expo EAS quirks, iOS-specific
behaviour, native module issues).

Probability: Medium (new framework, new platform ecosystem)
Impact: Medium — Phase 1 absorbs the delay without blocking product features

Mitigation:
- Phase 1 is deliberately infrastructure-only. Learning curve is
  absorbed here without delaying product feature delivery.
- If Phase 1 takes an extra week, Phase 2 starts a week later —
  but nothing is blocked because Phase 1 has no product feature dependencies.
- Expo's documentation and community are excellent. Most React Native
  issues have well-documented solutions in the Expo forums.
- Claude Code is the build partner — architectural questions can be
  resolved quickly without context-switching to Stack Overflow.

---

## SUCCESS CRITERIA FOR MVP

How we know the MVP has validated the thesis:

**Quantitative criteria (to be measured in first 4 weeks post-launch):**
- At least 100 installs (validates there is a discovery path)
- At least 60% of users complete onboarding (validates entry point + onboarding)
- At least 40% of users complete all 5 free tasks (validates roadmap value)
- At least 10% of users who complete free tasks convert to premium
  (validates willingness to pay — thesis validated at 10%+)
- At least 3 of 5 beta users report the product "told them something
  they didn't already know" (validates sequencing differentiation)

**Qualitative criteria:**
- At least 3 unprompted mentions of "I didn't know I had to do that first"
  (direct validation of the sequencing thesis in user language)
- Zero reports of incorrect IRD, tax, or tenancy information
  (validates knowledge base quality)
- At least one user prevented a measurable financial mistake
  (IRD emergency tax, wrong KiwiSaver decision, bond over-payment)

**Go/no-go decision:**
If 10%+ free-to-premium conversion is achieved within 4 weeks of
launch — the thesis is validated. Build v2.
If conversion is below 5% — the thesis needs revision. Investigate
whether the sequencing value is landing, the pricing is wrong,
or the target persona needs adjustment.

---

## DECISIONS LOG — MVP SCOPE

| Decision | What | Why |
|---|---|---|
| Build budget | 400 hours total, ~290 for product features | 25 hrs/week × 16 weeks, minus infrastructure overhead |
| Scoping principle | Minimum to validate thesis | Everything else delays the answer |
| Roadmap engine simplified | Generate once + store at MVP | Full hybrid cache adds complexity without benefit at small user volumes |
| AI personalisation layer deferred | Base consequence lines at MVP | Thesis validated by sequencing, not by AI-generated language polish |
| RAG two-phase | Phase A (no RAG) then Phase B (RAG) within MVP | Validates chat UX before adding retrieval complexity |
| Returning user Scenario 1 only | Active returner only at MVP | Scenarios 2 and 3 are polish, not thesis validation |
| Lapsed user flow deferred | v2 | Retention optimisation, not thesis validation |
| Automated reminders deferred | Manual trigger at MVP | Manageable at small user base, saves 15 hours |
| Custom admin deferred | Prisma Studio at MVP | Sufficient for single developer, saves 20 hours |
| 21 tasks only | Auckland, Priya + Karthik personas | Sufficient to validate thesis with primary persona |
| 2 persona variants | constrained_couple + solo_aewv | Family variant and additional cities in v2 |
| Phase 1 foundation first | Infrastructure before product features | Learning curve absorbed without delaying product delivery |
| App Store submit Week 14 | Two weeks before end of build window | Buffer for rejection and resubmission |
| Success criteria defined | 10% free-to-premium conversion as go/no-go | Clear thesis validation signal |

---

*Next document: 12-build-specification.md*
*The Claude Code Build Specification synthesises all product design
documents into the format Claude Code needs to execute the build —
exact component specifications, API contracts, acceptance criteria,
build sequence, and environment setup instructions.*
