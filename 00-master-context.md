# LandedNZ — Master Context Document
*Last Updated: February 2026*
*Purpose: Paste this at the start of every new chat session to restore full context*

---

## WHO I AM

- **Name:** Ruchira
- **Current Role:** Senior Software Engineer & Tech Lead at DBS Bank Singapore
- **Experience:** 6+ years, Java, Spring Boot, Kafka, AWS, Kubernetes, microservices
- **Education:** MSc Advanced Software Engineering (University of Westminster), BSc Statistics (University of Peradeniya)
- **Certifications:** AWS Solutions Architect Associate (valid 2025–2028)
- **Location:** Singapore (moving to Auckland, NZ end of June 2026)

---

## MY SITUATION

- **Wife:** Already in New Zealand pursuing her Master's degree (departed March 2025)
- **My Visa:** Applying for Partner of Student Work Visa mid-March 2026
- **Visa advantage:** Open work rights, no employer sponsorship needed
- **Target:** Secure NZ job offer by mid-June 2026, relocate end of June 2026
- **Target city:** Auckland specifically
- **Job targets:** Senior Software Engineer / Software Engineer roles, backend-focused

---

## THE PLAN — TWO PARALLEL TRACKS

### Track 1: LandedNZ (Product)
Building a real MVP product that solves a real NZ problem.
Not a portfolio toy — a genuine product with real users.

### Track 2: Communication Prep
Fixing core interview weaknesses running parallel to product building.
Format: Mock interviews + structured storytelling practice + articulation drills.

---

## MY COMMUNICATION WEAKNESSES (from past interview feedback)

1. **Articulation gap** — Have knowledge but struggle to express clearly
2. **No preparation habit** — Wing interviews, say whatever comes to mind
3. **Too technical** — Explain at too high a level, overwhelm listeners
4. **Curse of knowledge** — Try to explain everything instead of curating
5. **Unorganised flow** — Jump around topics, repeat myself, lose thread
6. **No documentation** — Knowledge in head, struggle to present without visuals
7. **Get nervous** — Pressure amplifies all above problems

---

## WORKING HOURS AVAILABLE

- **Weekdays:** ~3 hours/day (after DBS work)
- **Weekends:** ~5 hours/day
- **Total:** ~25 hours/week

---

## THE PRODUCT — LANDEDNZ

### What It Is
An AI-powered NZ Settlement Companion for skilled migrants arriving in New Zealand.

### The Problem It Solves
130,000+ migrants arrive in NZ annually. They face an overwhelming, fragmented, 
unsequenced set of tasks across multiple government agencies with no personalized 
guidance. The information exists — but nobody tells them what order to do things 
in and why the order matters. Costly mistakes happen in the first weeks due to 
ignorance, not incompetence.

### Core Value Proposition
Personalized, AI-guided settlement journey — from landing to feeling at home.
The key differentiator: sequencing. LandedNZ tells you what to do, in what order,
and why — personalized to your visa type, family situation, city, and occupation.

### Why This Wins
- No AI-powered NZ settlement companion exists
- Government resources are static, generic, and fragmented
- Existing NGOs (Belong Aotearoa etc.) are human-powered and cannot scale
- Founder (Ruchira) IS the target user — authentic, firsthand problem knowledge

### Target Market
Skilled migrants arriving in Auckland, New Zealand.
Primary nationalities: India, Philippines, Sri Lanka, Southeast Asia.
Primary visa types: AEWV, Partner of Student, Green List residency.

---

## PRODUCT DESIGN STATUS

### Completed Sections
- ✅ Section 1: User Personas (v2 — revised February 2026)
- ✅ Section 2: Problem Mapping (updated for v2 personas)
- ✅ Section 3: Product Vision & Value Proposition
- ✅ Section 4: Feature Definition

### In Progress
- ✅ Section 5: User Flows
- ✅ Section 6: AI Design
- ✅ Section 7: Tech Stack Decision
- ✅ Section 8: MVP Scope Document

### Build Status
- ⬜ Not started (starts after Plan A complete)

---

## SEGMENTATION FRAMEWORK

Personas are organised by **life stage + settlement complexity** — not visa type.
Visa type is a product variable handled at onboarding, not a market segment.
The differentiating factor is the number of lives being set up simultaneously
and the degree of interdependency between those lives.

| Segment | Complexity | MVP Priority |
|---------|------------|--------------|
| Constrained Couple | 2x — two lives, one with restricted work rights | Primary |
| Family with Children | 3x+ — two adults + dependent school-age lives | Secondary |
| Regulated Professional | 1.5x + credential blocker | Post-MVP |

---

## THREE USER PERSONAS

### Primary: Priya & Karthik (Constrained Couple)
Couple, no children. Karthik on student visa (Level 8 Master's, Green List qualification).
Priya on Partner of Student Work Visa — open work rights but no NZ work history.
Single income under structural constraint. Visa interdependency between partners.
Dual job setup, cost of living shock, social isolation as a unit.

**Who this represents in market:** Partner of Student couples, AEWV + partner visa couples,
Green List couples in early settlement. ~50,000–80,000 in active settlement at any time.

**Design principle:** If it works for this couple under financial and visa constraint,
it works for all couples. Product spine is built around this journey.

**Key pain:** IRD emergency tax on single income, KiwiSaver default, cost of living shock,
bank-address circular dependency, rental market, dual job search without NZ references,
social isolation as a unit, Karthik's 20hr work limit during term.

### Secondary: Raj & Aroha (Family with Children)
Couple with dependent children. Raj on AEWV (Green List Tier 2). Aroha is NZ citizen
returning from abroad. Two children: 7 and 4. Highest logistical complexity.
Suburb decision is high-stakes — wrong zone = wrong school.

**Design principle:** School zone content and child-specific tasks belong here,
not in top-level positioning. Family complexity layered on top of core couple journey.

### Tertiary (Post-MVP): Maria Santos (Regulated Professional)
Filipino, 35, Green List Straight to Residence, Registered Nurse. Partner in Manila.
Core blocker: Nursing Council registration (10–16 weeks) before she can work.
Signals B2B expansion — DHBs and private hospitals as employer partners.

**Design principle:** Post-MVP only. Regulated profession needs require verified
profession-specific content out of 6-week MVP scope.

---

## WHAT IS NOT A PERSONA (DELIBERATELY EXCLUDED)

- **Working Holiday Maker** — Temporary, travel-adjacent, no settlement intent. Exclude.
- **Parent visa holders** — Small volume, distinct needs, out of MVP scope.
- **Refugees and humanitarian entrants** — Different channel, different funding model.

---

## SETTLEMENT JOURNEY — 5 PHASES

| Phase | Timeline | Focus | MVP Scope |
|-------|----------|-------|-----------|
| Phase 1 | Pre-arrival (1–4 weeks before) | Preparation, documents, temporary housing | ✅ In MVP |
| Phase 2 | First 2 weeks | IRD, bank, rental, KiwiSaver, GP | ✅ In MVP |
| Phase 3 | Weeks 3–8 | Job search, qualifications, remittances, social | ✅ In MVP |
| Phase 4 | Months 3–6 | Visa pathway, career, financial planning | ❌ Post-MVP |
| Phase 5 | Months 6–12+ | Residency, citizenship, property, belonging | ❌ Post-MVP |

**Key insight:** The core problem is not lack of information — it's lack of sequencing.
Nobody tells migrants what to do first, what depends on what, or how long each step takes.

---

## DECISIONS LOG

| Decision | What | Why |
|----------|------|-----|
| Product choice | Candidate 3 over 1, 2, 4 | Empty competitive space, AI differentiator, founder = user |
| Persona count | 3 personas | Enough diversity without scope creep |
| Segmentation framework | Life stage + settlement complexity | Maps directly to product problems; grounded in MBIE data |
| Primary persona | Priya & Karthik (Constrained Couple, no children) | Largest underserved segment; structurally unique interdependency; founder lived experience |
| Replaced Arjun (solo AEWV) | Solo migrants only ~21% of arrivals | Not representative majority; childless couples are larger and more underserved |
| Secondary persona | Raj & Aroha (Family with Children) | School zone + child complexity belongs here, not in top-level positioning |
| School zones out of top-level positioning | Moved to Persona 2 only | Only relevant to ~30–40% with dependent children — not universal pain |
| MVP phases | Phases 1–3 only | Highest pain, most motivated users, achievable in 6 weeks |
| Journey structure | Chronological phases | Mirrors user experience, not government category structure |
| Positioning line | "Every migrant needs the same thing first — someone who knows their situation and says: do this before anything else." | Advisor framing; sequencing thesis in plain language |
| Core differentiator | Sequencing not information | Information exists on govt sites; ordering is the gap |
| Roadmap engine | Hybrid rule-based + AI | Integrity on sequencing, personalisation on language; pure AI risks hallucination |
| AI chat scope | Narrow — settlement tasks only at MVP | Auditable, testable, honest; upgrade path to contextual post-MVP |
| Task card design | Layered — consequence line first | Answers "why now?" before user asks; prevents information overload |
| Progress tracker | Adaptive + manual override | Meets users where they are; prevents lapsed-user problem |
| Couple-aware onboarding | Situation-based language, static input | Plain language over visa jargon; full live tracking is v2 |
| Premium gate | After 5 core Week 1 tasks | Max value before gate; IRD math makes $49 trivially small |
| Smart reminders | Email for MVP | Universal, no permission friction; push notifications v2 |
| AI guardrails | Honest redirect, 4 out-of-scope categories | Trust-building; advisor who knows limits is more credible |
| B2B employer channel | Post-MVP | Consumer validation first |
| Dual-partner live tracking | Post-MVP v2 | Over-engineering for MVP; static input sufficient |
| Entry point approach | Empathy-first content + Auckland landmark + progressive reveal | Generic sample contradicts personalisation thesis; form-first asks before earning trust |
| Entry point visual | Auckland landmark, dark overlay, skip option | Specific location signals NZ-built product instantly |
| Onboarding structure | Questions build downward on single screen | Profile ownership before roadmap appears; wizard loses context between screens |
| Onboarding language | Situation-based, no visa jargon | Plain language recognition more reliable than visa terminology |
| Loading transition | 1.5-2 seconds psychological pause | Signals personalisation not instant pre-built retrieval |
| Account creation timing | Deferred until after first task complete | Trust earned before commitment asked |
| Roadmap reveal | Priority-first three tasks above fold | Answers all 4 first-impression questions; 3 = cognitive sweet spot |
| Task counts | Hidden on first reveal, progress indicators after completion | Numbers trigger overwhelm; progress is motivating |
| Phase headers | Collapsed, name and timeline only | Depth available without forcing; never locked |
| Task card interaction | Bottom sheet two heights | Context preserved; all 7 states served; modern native pattern |
| Completion moment | Micro-animation + next task highlighted | Positive reinforcement + proactive next step |
| Premium gate | Contextual inline card, three response paths | Inline preserves context; 95%+ users are Response 2 or 3 |
| Gate defer path | Remind me later + 24hr specific task email | Specific email converts; generic email churns |
| Gate decline path | Graceful exit + minimal persistent banner | Goodwill preserved; declined users refer when respected |
| AI chat interaction | Contextual sheet, entry-point aware, 4 entry points | Context preservation; roadmap primary, AI supporting |
| AI chat opening | Specific per entry point, task context or completion state | Generic opening destroys premium value proposition |
| AI session memory | Completion state as proxy for continuity | Honest about MVP limit; completion state signals genuine awareness |
| Returning user flow | Three scenarios detected: active, checking-in, prompted | Each scenario has different needs; generic return serves none |
| Lapsed user re-entry | Triage screen, max 2 findings, one starting point | Dissolves anxiety without guilt; consequence-led findings are action triggers |
| Lapsed email design | Specific task subject line, 3 sentences, no guilt language | Specific emails convert; guilt emails churn |
| Single model | Claude (Anthropic) for both jobs at MVP | One API, one billing, one failure surface |
| Roadmap engine | Deterministic core — AI never touches sequencing | Sequencing errors cost users money; deterministic = auditable |
| Roadmap architecture | Hybrid cache + delta recomputation (3 triggers) | Satisfies all 8 requirements; static fails time-awareness; full dynamic fails reliability |
| Priority scoring | Formula: base + persona + time urgency - dependency penalty | Fully deterministic, fully auditable, no AI inference |
| AI personalisation scope | Top 3 tasks only, read-only, graceful degradation | Boundary enforced structurally not by instruction |
| RAG approach | Standard RAG, persona pre-filter, 3-5 chunk budget | Agentic RAG: unnecessary latency + cost + non-determinism for narrow query space |
| Persona pre-filter | Applied before semantic search | Prevents wrong persona content retrieval at architectural level |
| Knowledge base | 3 types: task content, settlement context, policy reference | Different update frequency, chunking, retrieval patterns |
| System prompt | 5 components + double persona anchor, target 2250-3150 tokens | Each component addresses specific failure modes |
| Scope boundaries | Three tiers: in-scope, boundary cases, out-of-scope | Binary in/out fails edge cases; three tiers handle full spectrum |
| Level 1 guardrails | Rules-based keyword classifier, pre-generation | Speed, cost, sufficient for constrained query space at MVP |
| Level 2 guardrails | Logged not blocking at MVP | Blocking adds latency; logging provides failure data |
| Knowledge base maintenance | Manual via admin interface at MVP | Small enough; automated detection is over-engineering |
| Graceful degradation | Roadmap never fails due to AI failure | Hard architectural constraint — AI falls back to base content silently |
| Failure mode coverage | All 12 failure modes addressed at specific architectural layers | No failure mode left to model behaviour alone |
| Data model | Conceptual only — final schema deferred to Section 7 | Requires tech stack decision before schema can be finalised |
| Tech stack in AI design | Framework-agnostic | Stack decision belongs in Section 7 |
| Claude Code handoff | Dedicated Build Specification after Section 8 (Option A) | Product design docs for understanding; build spec for execution |
| Frontend | React Native CLI | Cross-platform iOS + Android, single codebase, target demographic is 55-70% Android |
| PWA rejected | Not native enough for LandedNZ UX requirements | Bottom sheets, animations, micro-interactions require native quality |
| iOS Native rejected | Excludes majority of target users | Indian + Filipino migrant demographic predominantly Android |
| Backend | Node.js with TypeScript + Fastify | Shared language with frontend, TypeScript-first Anthropic SDK, native SSE streaming |
| Spring Boot rejected | Over-engineered for single-developer MVP | Verbosity and boilerplate not justified at this scale |
| Python rejected at MVP | Two-language penalty from Day 1 | AI ecosystem advantage doesn't materialise until post-MVP |
| Database | PostgreSQL with pgvector | Relational task graph + vector search in one database, eliminates separate vector store |
| ORM | Prisma | TypeScript-first, generated types, single source of truth for data model |
| Vector store | pgvector — no separate vector DB at MVP | 300-500 chunks sufficient, eliminates separate service |
| Auth | Supabase Auth | Consolidated with database, RLS enforced structurally, Google + Apple OAuth |
| Email | Resend + React Email | TypeScript-first, React component templates, excellent deliverability |
| Payments | RevenueCat | App Store compliance — Stripe cannot be used for in-app subscriptions |
| Stripe rejected | App Store does not permit | Apple requires StoreKit for in-app digital subscriptions |
| Local dev | Docker Compose + iOS Simulator | Zero-config local Postgres, instant device testing |
| Cloud backend | Railway | Zero infrastructure config, auto-deploy, SSE streaming support |
| Cloud database | Supabase | Managed PostgreSQL + pgvector + Auth, same schema as local |
| Repo structure | Monorepo with npm workspaces | Shared TypeScript types between mobile and backend |
| Migration path | Environment variables only | No code changes required to move local to cloud |
| Build budget | 400 hours total, ~290 for product features | 25 hrs/week x 16 weeks minus infrastructure overhead |
| Scoping principle | Minimum to validate thesis | Everything else delays the answer |
| Roadmap engine | Simplified at MVP — generate once + store | Full hybrid cache adds complexity without benefit at small volumes |
| AI personalisation layer | Deferred to v2 | Base consequence lines validate thesis; AI polish is not core |
| AI chat | Two-phase within MVP — Phase A no RAG, Phase B RAG | Validates UX before adding retrieval complexity |
| Returning user | Scenario 1 only at MVP | Scenarios 2 and 3 are polish, not thesis validation |
| Lapsed user flow | Deferred to v2 | Retention optimisation, not thesis validation |
| Automated reminders | Manual trigger at MVP | Manageable at small user base |
| Custom admin | Prisma Studio at MVP | Sufficient for single developer |
| Task scope | 21 tasks, Auckland only, 2 persona variants | Sufficient to validate thesis with primary persona |
| Persona variants | constrained_couple + solo_aewv at MVP | Family + other cities in v2 |
| Build sequence | 5 phases — foundation, core product, monetisation, AI chat, RAG + launch | Dependency chain — nothing built on unproven foundation |
| App Store submission | Week 14 — two weeks before deadline | Buffer for rejection and resubmission |
| Go/no-go criterion | 10%+ free-to-premium conversion in first 4 weeks | Clear thesis validation signal |
| Success criteria | 100 installs, 60% onboarding completion, 40% free task completion, 10% conversion | Measurable thesis validation |





---

## HOW TO USE THIS DOCUMENT

1. Paste entire document at start of new chat
2. Tell Claude which section we're working on
3. Claude restores full context and continues seamlessly
4. After each completed section, update the status checkboxes above
5. After each major decision, add a row to the Decisions Log

---

## ASSISTANT BEHAVIOUR RULES (for Claude)

- Every decision must be explained: what, why, why it's optimal over alternatives
- Ruchira analyses and approves before anything moves forward
- Research before proposing — don't assume, verify
- Generate MD documents after each completed section
- Be honest, not pleasing — push back when something is wrong
- Track all decisions in the Decisions Log above
- Personas are Priya & Karthik (primary), Raj & Aroha (secondary), Maria (post-MVP)
- Arjun Sharma no longer exists as a persona — do not reference him

