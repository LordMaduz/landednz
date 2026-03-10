# 07 — Feature Definition
*Written: February 2026*
*Purpose: Define every MVP feature at spec level — what it does, why it exists,
what it explicitly does not do, and how it serves the primary persona.
Feeds directly into Section 5 (User Flows) and Section 8 (MVP Scope).*

---

## FEATURE OVERVIEW

| # | Feature | Tier | Primary Persona Served |
|---|---------|------|----------------------|
| 1 | Onboarding flow | Free | All |
| 2 | Roadmap engine | Free + Premium | All |
| 3 | Task card design | Free + Premium | All |
| 4 | Progress tracker | Free + Premium | All |
| 5 | Couple-aware onboarding | Free | Priya & Karthik (primary) |
| 6 | Premium gate | Transition | All |
| 7 | AI chat interface | Premium | All |
| 8 | Smart reminders | Premium | All |

---

## FEATURE 1 — ONBOARDING FLOW

### What it does
Collects five inputs from the user in under two minutes. These inputs are the
only data LandedNZ needs to generate a personalised settlement roadmap.
No account creation required before the roadmap is shown — the user sees
value before being asked to register.

### The five questions

**Q1: What visa are you arriving on?**
- Accredited Employer Work Visa (AEWV)
- Partner of Student Work Visa
- Green List Work Visa
- Green List Straight to Residence
- Other / Not sure

*Why this question:* Visa type determines which tasks are legally required,
which are optional, and which carry time-critical consequences unique to
that visa. An AEWV holder has employer accreditation dependencies. A Partner
of Student holder has work rights tied to their partner's enrolment status.
These are not the same roadmap.

**Q2: Which city are you arriving in?**
- Auckland
- Wellington
- Christchurch
- Other

*Why this question:* Rental market dynamics, GP waitlist severity, suburb
selection complexity, and community resource availability differ materially
by city. Auckland is the primary focus for MVP — other cities receive a
simplified roadmap at launch with full coverage post-MVP.

**Q3: What is your family situation?**
- Arriving alone
- Couple — we both have independent work visas
- Couple — one of us is on a student or work visa, the other on a partner/dependent visa
- Family with dependent children

*Why this question:* The number of lives being set up simultaneously determines
roadmap complexity. A constrained couple (one on student visa) has fundamentally
different financial pressure and visa interdependency than a dual-income couple.
A family with children needs school zone guidance layered on top.

*Note on language:* Situation-based descriptions are used deliberately — no visa
jargon. The user recognises their situation in plain language without needing to
know the technical name of their visa category.

**Q4: What is your occupation or professional background?**
- Technology / Engineering
- Healthcare (nurse, doctor, allied health)
- Education (teacher)
- Finance / Accounting
- Trades (electrician, plumber, builder)
- Other professional
- Still looking for work

*Why this question:* Regulated professions (healthcare, teaching, engineering)
need NZQA assessment and professional body registration layered on top of
standard settlement tasks. Someone still looking for work needs job search
guidance prioritised earlier in their roadmap.

**Q5: When are you arriving (or when did you arrive)?**
- I haven't arrived yet (with date picker)
- I arrived in the last 2 weeks
- I arrived 2–8 weeks ago
- I arrived more than 2 months ago

*Why this question:* Arrival date determines urgency sequencing. A user
arriving tomorrow needs IRD application flagged as Day 1 critical. A user
who arrived three weeks ago has likely already done IRD — the roadmap
adapts to meet them where they are, not assume they started from zero.

### What onboarding does NOT do
- Does not require email or account creation before showing the roadmap
- Does not ask for payment information
- Does not collect any sensitive personal data (name, passport number, address)
- Does not connect to Immigration NZ or any government system

### Why account creation comes after roadmap, not before
The user has zero trust in LandedNZ at this point. Asking for an account
before delivering value is a conversion killer. The sequence is:
onboarding → roadmap shown → user experiences value → account creation
prompted to save progress. This is the standard pattern for high-converting
consumer products. Trust is earned before commitment is asked for.

---

## FEATURE 2 — ROADMAP ENGINE

### What it does
Takes the five onboarding inputs and generates a personalised, sequenced
settlement roadmap. The roadmap is a dependency-ordered list of tasks
grouped into phases, with each task carrying a consequence score that
determines its urgency weighting.

### Architecture: Hybrid (rule-based core + AI personalisation layer)

**Rule-based core (the dependency graph):**
The sequencing logic is pre-built, deterministic, and fully auditable.
It is structured as a task dependency graph — a set of nodes (tasks) and
edges (dependencies) where each edge represents "this task must be completed
before that task can begin."

Example dependency chain:
```
Arrive in NZ
    → Get NZ SIM card
        → Open bank account (requires NZ phone number)
            → Apply for IRD number (requires bank account number)
                → Submit tax code declaration to employer (requires IRD number)
                    → First paycheck at correct tax rate
```

This chain is fixed. It does not change based on user personality or AI
interpretation. It is the structural truth of NZ settlement sequencing.

The rule engine also handles persona-specific branching:
- Couple with student visa → adds visa interdependency awareness task
- Family with children → adds school zone research before suburb selection
- Regulated profession → adds NZQA assessment as pre-arrival priority task
- Still looking for work → elevates job search tasks to Phase 2

**AI personalisation layer (sits on top of the rule engine):**
The AI does not determine sequencing. It personalises the language and
context of each task card based on the user's specific situation.

For the same IRD task, the AI generates different consequence lines:
- Solo AEWV holder: *"Without this, your first paycheck is taxed at 45%."*
- Constrained couple (Priya): *"You're the sole income earner right now —
  without this, your first paycheck loses $300–400 to emergency tax
  with no second income to absorb it."*

Same task. Different stakes. Different language. Same underlying rule.

### What the roadmap engine does NOT do
- Does not generate tasks via LLM at runtime (hallucination risk on
  critical financial/legal tasks is unacceptable)
- Does not connect to live government systems or check real-time policy
- Does not provide immigration advice or interpret visa conditions
- Does not guarantee task sequences are legally exhaustive — all tasks
  link to verified government sources as the authoritative reference

### Why hybrid over pure rule-based or pure AI
Pure rule-based: brittle at scale. Hundreds of unique persona combinations
require hundreds of maintained templates. Every policy change requires
updating multiple templates.

Pure AI-generated: unacceptable error rate on consequential tasks. IRD
sequencing, tenancy bond rules, and KiwiSaver election cannot tolerate
hallucination.

Hybrid: the dependency graph is the intellectual property — auditable,
maintainable, and correct. The AI layer adds warmth and personalisation
without touching the sequencing logic. Scales cleanly: adding a new visa
type means adding nodes and edges to the graph, not rebuilding templates.

---

## FEATURE 3 — TASK CARD DESIGN

### What it does
Every task in the roadmap is presented as a card with a layered
information architecture: essential information visible immediately,
full detail available on demand.

### Card structure (three layers)

**Layer 1 — Always visible (the hook):**
- Task name (clear, action-oriented — "Apply for your IRD number", not "IRD")
- Consequence line (one sentence answering "why does this matter right now?")
- Time estimate ("~15 minutes")
- Status indicator (not started / in progress / complete)

**Layer 2 — Expanded on tap (the how):**
- Step-by-step instructions specific to the user's situation
- Documents required
- Common mistakes and how to avoid them
- Estimated processing time if applicable (IRD: 8–15 working days)
- Cost if applicable

**Layer 3 — Source and escalation:**
- Link to verified government source (always present)
- "I have a question about this" → opens AI chat pre-loaded with task context
- "I've already done this" → marks complete, updates roadmap

### The consequence line — why it is the most important design element
The consequence line is what makes LandedNZ feel like an advisor rather
than a directory. It answers the question the user is always asking but
rarely states: "Why should I do this today and not next week?"

Examples:
- IRD: *"Without this, your first paycheck is taxed at 45% emergency rate."*
- KiwiSaver: *"You'll be auto-enrolled in a default fund that may not suit
  your situation — this is a decision, not a default."*
- GP registration: *"Auckland practices have waitlists. Register now so
  you're not searching when someone is sick."*
- Rental bond: *"Your bond must be lodged with Tenancy Services — not held
  by your landlord. If it isn't, you have no legal protection to get it back."*

Each consequence line is factual, specific, and financially or legally grounded.
No scaremongering. No vagueness. Just the honest cost of delay.

### What task cards do NOT do
- Do not provide legal advice or interpret visa conditions
- Do not guarantee step-by-step instructions are exhaustive for every
  edge case — the government source link is always present as authority
- Do not automate any government process (no form filling, no API submission)

---

## FEATURE 4 — PROGRESS TRACKER

### What it does
Records task completion and actively adapts the roadmap based on what
the user has and hasn't done. Completion is not cosmetic — it changes
what the product surfaces next.

### How it works

**Marking complete:**
Three ways to mark a task complete:
1. Tap "Mark as done" on any task card
2. Answer a brief confirmation question ("Did you get your IRD number?
   Add it here to unlock your tax code declaration task") — optional,
   never required
3. Bulk-mark on first login if user arrived before finding LandedNZ
   ("It looks like you arrived 2 weeks ago — let's quickly mark off
   what you've already done")

**What completion triggers:**
- Task moves to "Completed" section, visually de-emphasised
- Next dependent task is surfaced and highlighted
- AI chat context updates — the assistant now knows this task is done
  and won't repeat guidance on it
- Smart reminder for this task is suppressed

**The adaptive roadmap:**
The roadmap is not a static list. It responds to completion state.
A user who arrived last week and has already sorted their bank account
and IRD number sees a roadmap that starts from their current position —
not from Day 1. The product meets users where they are.

### Manual override — why it matters
A significant portion of users will find LandedNZ after they've already
completed some tasks. If the product assumes everyone starts from zero,
these users experience a roadmap full of tasks they've already done —
immediately signalling the product doesn't understand their situation.

The bulk-mark flow on first login solves this: "Before we show your roadmap,
let's mark off what you've already sorted." Fast, respectful of their
progress, and immediately makes the roadmap feel personalised.

### What the progress tracker does NOT do
- Does not verify task completion with government systems
- Does not penalise users for marking tasks complete without actually
  completing them — trust is given, not policed
- Does not lock subsequent phases behind completion gates
  (users can always see ahead — the tracker nudges, it doesn't block)

---

## FEATURE 5 — COUPLE-AWARE ONBOARDING

### What it does
Captures the constrained couple situation — one partner on a student or
work visa, the other on a dependent/partner visa — through a single
follow-up question in plain language. Uses this input to generate a
roadmap that reflects the structural realities of their situation:
single income under constraint, visa interdependency, elevated urgency
on financial setup tasks.

### The follow-up question
Triggered when user selects "Couple" in Q3:

*"Is one of you the primary visa holder, with the other on a dependent
or partner visa?"*

- **Yes** — one of us is on a student or work visa, the other on a
  partner/dependent visa → constrained couple roadmap
- **No** — we both have independent work visas → standard couple roadmap

### What changes in the roadmap when "Yes" is selected

**Financial tasks elevated:**
- IRD consequence line updated to reflect single income risk
- KiwiSaver card includes explicit opt-out consideration for Year 1
  cash flow management
- Cost of living card includes a budget recalibration prompt
  ("Your pre-arrival budget was likely built on home country costs —
  here's a realistic Auckland baseline for a single income")
- Remittances card prioritised earlier — if sending money home on
  one income, the Wise vs bank fee gap matters immediately

**Visa interdependency awareness card added:**
A task card unique to this persona:
> *"Understanding your linked visa situation"*
> *Your work rights are connected to your partner's visa status.
> Here's what you need to know about the 20-hour work limit during
> term time, what triggers changes to your work rights, and what
> to do if your partner's study situation changes.*

**Job search prioritised:**
The constrained couple has one income and time pressure. Job search
guidance is surfaced in Phase 2, not Phase 3, for the partner visa holder.

### What couple-aware onboarding does NOT do (MVP scope)
- Does not track Karthik's term calendar in real time
- Does not monitor visa status changes
- Does not provide immigration advice on visa interdependency
- Does not create two separate user accounts linked together
  (full dual-partner mode is post-MVP v2)

### Why situation-based language over visa terminology
Asking "What visa is your partner on?" requires the user to know the
exact name of their visa — which many don't at the point of onboarding.
Situation-based language ("one of us is on a student or work visa,
the other on a partner/dependent visa") is recognisable without
requiring technical knowledge. Lower cognitive load = lower drop-off
at the critical onboarding step.

---

## FEATURE 6 — PREMIUM GATE

### What it does
Creates the transition point between the free and paid tiers at a
specific, deliberate moment in the user journey — after the five most
time-critical Week 1 tasks, before the remainder of Phase 2 and all
of Phase 3.

### Free tier task list (exactly)
1. Get a NZ SIM card
2. Open a bank account
3. Apply for your IRD number
4. Find temporary accommodation / understand the rental market
5. Register with a GP

These five tasks represent the highest-urgency, highest-consequence
actions of the entire settlement journey. Every user — whether they
find LandedNZ pre-arrival or in Week 2 — receives full guidance on
these tasks for free.

### Premium tier content
- Remainder of Phase 2: KiwiSaver election, driving licence conversion,
  utilities setup, NZ workplace culture introduction
- Full Phase 3: job search guidance, school zone navigation (families),
  qualification recognition, ACC overview, remittances, tax year planning,
  social connection resources
- AI chat interface
- Smart reminders
- Couple-aware roadmap additions (visa interdependency card, budget
  recalibration, elevated job search)

### The gate design — three components

**Component 1: Preview the next task**
The gate does not show a generic "upgrade to premium" screen. It shows
the specific next task the user would unlock, with the consequence line
visible:

> *"Your next task: KiwiSaver election*
> *Most migrants are auto-enrolled in the wrong fund and don't realise
> it for years. This decision affects your retirement savings.*
> *Unlock this and 20+ more tasks →"*

The user knows exactly what they're paying for before they pay.

**Component 2: Anchor to value already delivered**
Above the paywall prompt:
> *"You've completed 5 critical tasks with LandedNZ. Here's what's next."*

This reminds the user of value received before asking for payment.
It frames the upgrade as a continuation, not a new transaction.

**Component 3: The IRD math reframe**
Below the pricing:
> *"One week of IRD emergency tax on a $65K salary = ~NZD $280 lost.
> Six months of LandedNZ Premium = NZD $49.*
> *The product pays for itself the moment it prevents a single mistake."*

This reframes the decision from "is this worth $49?" to "I've already
saved more than this." For a user who followed the IRD guidance, this
is viscerally true.

### Pricing
- NZD $9.99/month
- NZD $49 for 6 months (save ~18%)

### What the premium gate does NOT do
- Does not lock users out of their completed task history
- Does not remove access to the free tier tasks once upgraded
  (downgrade returns user to free tier with history preserved)
- Does not require credit card details before showing the gate
  (gate is shown first, payment details collected on upgrade decision)

---

## FEATURE 7 — AI CHAT INTERFACE

### What it does
Provides a conversational interface for NZ settlement questions within
a defined scope. The AI knows the user's onboarding profile and
completion state, and uses this context to give answers that are
specific to their situation — not generic.

### Scope: Narrow (settlement tasks only)
The AI answers questions directly related to the settlement roadmap:
IRD, KiwiSaver, tenancy rights, GP registration, driving licence
conversion, NZQA qualification assessment, remittances, NZ CV format,
ACC basics, NZ workplace culture, school zones (for families).

It does not answer questions outside this scope. When asked something
outside scope, it responds with an honest redirect — not a hard block.

### Guardrail response design
Out-of-scope questions receive a response that:
1. Acknowledges the question is real and valid
2. Explains briefly why LandedNZ doesn't answer it
3. Points to the specific right resource

Example — user asks "Should I accept this job offer?":
> *"That's an important decision and I want to make sure you get the
> right input on it. Career decisions are outside what I can reliably
> guide you on — but once you decide, I can walk you through the
> employment setup steps specific to your visa situation. For the
> decision itself, Careers NZ (careers.govt.nz) is a good starting point."*

### Four explicit out-of-scope categories

| Category | Redirect |
|---|---|
| Immigration legal advice | Licensed Immigration Adviser (immigration.govt.nz/find-an-adviser) |
| Employment law / disputes | Employment NZ or Citizens Advice Bureau |
| Medical advice | Healthline — 0800 611 116 (free, 24/7) |
| Financial investment advice | Sorted.org.nz (NZ's free financial guidance service) |

### Context awareness
The AI chat is pre-loaded with the user's onboarding profile and
completion state. This means:
- It knows the user is on a Partner of Student Work Visa
- It knows they've completed IRD and bank account tasks
- It knows they haven't yet done KiwiSaver election
- It uses this context without the user having to re-explain their situation

When a user taps "I have a question about this" on a task card, the
chat opens pre-loaded with that task as context — no need to explain
which task they're asking about.

### What the AI chat does NOT do
- Does not provide immigration advice or interpret visa conditions
- Does not answer medical questions beyond directing to Healthline
- Does not remember conversations across sessions (MVP — session memory only)
- Does not connect to live government systems
- Does not guarantee accuracy — every response includes a source link
  as the authoritative reference

---

## FEATURE 8 — SMART REMINDERS

### What it does
Sends proactive email reminders to users before time-sensitive deadlines
pass — both for tasks they haven't completed yet and for real-world
deadlines that exist regardless of app engagement.

### Two reminder types

**Type 1 — Deadline reminders (time-based, always fire)**
Triggered by real-world deadlines anchored to arrival date:
- Foreign driving licence expiry warning (Month 11 from arrival)
- NZ tax year end reminder (fired in February for March 31 deadline)
- KiwiSaver annual statement reminder (when to review fund and rate)

These fire whether or not the user has been active in the app recently.
They are the safety net for lapsed users.

**Type 2 — Progress reminders (completion-aware, suppressed when done)**
Triggered when a task is overdue based on arrival date and expected
completion window:
- IRD application: if not marked complete by Day 3, reminder fires
- Bank account: if not marked complete by Day 2, reminder fires
- GP registration: if not marked complete by Week 2, reminder fires

These fire only if the task is still marked incomplete. Once marked
done, the reminder is permanently suppressed.

### Delivery: Email (MVP)
Email is chosen for MVP for three reasons:
1. Universal — every user has email, no permission friction
2. Works for lapsed users — reaches users who haven't opened the app
3. No native app required — avoids push notification permission complexity

Push notifications are a v2 addition when the mobile app is built.

### Email design principles
- One task per email — not a digest of everything pending
- Subject line leads with the consequence, not the task name
  ("Your foreign licence expires in 30 days — here's how to convert it")
- Single clear action in the email body
- Unsubscribe always visible — reminders that can't be turned off
  become spam

### What smart reminders do NOT do
- Do not send more than one reminder per task (no nagging)
- Do not send reminders for tasks in the free tier to premium-only users
  (reminder scope matches tier access)
- Do not send push notifications at MVP
- Do not connect to calendar apps at MVP

---

## FEATURE INTERACTION MAP

How features connect to each other:

```
Onboarding (F1)
    → Roadmap engine generates personalised task list (F2)
        → Tasks displayed as cards (F3)
            → User completes tasks → Progress tracker updates (F4)
                → Roadmap adapts to completion state
                → Smart reminders suppressed for completed tasks (F8)
            → User hits 5th free task → Premium gate shown (F6)
                → Upgrade → AI chat unlocked (F7)
                → Upgrade → Smart reminders activated (F8)
                → Upgrade → Full Phase 2 + Phase 3 roadmap unlocked
    → Couple situation detected → Couple-aware roadmap generated (F5)
        → Visa interdependency card added to roadmap (F3)
        → Financial tasks elevated in sequence (F2)
```

---

## MVP FEATURE SCOPE SUMMARY

| Feature | In MVP | Post-MVP |
|---------|--------|----------|
| Onboarding flow (5 questions) | ✅ | — |
| Hybrid roadmap engine | ✅ | — |
| Task card design (layered) | ✅ | — |
| Progress tracker + adaptive roadmap | ✅ | — |
| Couple-aware onboarding (static) | ✅ | — |
| Premium gate (mid-Phase 2) | ✅ | — |
| AI chat (narrow scope) | ✅ | Expand to contextual (v2) |
| Smart reminders (email) | ✅ | Push notifications (v2) |
| Live dual-partner tracking | ❌ | v2 |
| B2B employer white-label | ❌ | Post-MVP |
| Wellington / Christchurch full coverage | ❌ | Post-MVP |
| Regulated profession deep content | ❌ | Post-MVP |

---

## DECISIONS LOG — FEATURE DEFINITION

| Decision | What | Why |
|---|---|---|
| Roadmap engine | Hybrid rule-based + AI | Rule engine for sequencing integrity; AI for personalisation. Pure AI risks hallucination on consequential tasks. Pure rule-based doesn't scale. |
| AI chat scope | Narrow (settlement only) | MVP cannot guarantee accuracy across all NZ life domains. Narrow scope is auditable, testable, and honest. Upgrade path to contextual is clear. |
| Task card design | Layered (consequence first) | Consequence line answers "why now?" before user has to ask. Depth on demand prevents information overload. |
| Progress tracker | Adaptive + manual override | Meets users where they are. Manual override prevents lapsed-user problem where roadmap is full of already-done tasks. |
| Couple-aware onboarding | Situation-based language, static input | Visa jargon causes drop-off. Situation recognition in plain language is more reliable. Full live tracking is over-engineering for MVP. |
| Premium gate placement | After 5 core Week 1 tasks | User has experienced maximum value before gate appears. IRD math reframe makes the $49 price feel trivially small against avoided cost. |
| Gate design | Preview + anchor + IRD math | Three components together convert better than a generic paywall. Each component addresses a specific objection. |
| Smart reminders delivery | Email for MVP | Universal access, no permission friction, works for lapsed users. Push notifications are v2 when mobile app exists. |
| AI guardrails | Honest redirect with reason | Builds trust. An advisor who knows their limits is more trustworthy than one who attempts everything. |

---

*Next document: 08-user-flows.md*
*Section 5 takes every feature above and maps the exact screen-by-screen
journey for the primary persona (Priya & Karthik) from first open to
premium upgrade. This becomes the direct input for build.*
