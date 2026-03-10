# 06 — Product Vision & Value Proposition
*Written: February 2026*
*Purpose: Define what LandedNZ is, what it isn't, why it wins, and what
the MVP must deliver to validate the core thesis. Feeds directly into
Section 4 (Feature Definition) and Section 8 (MVP Scope).*

---

## THE ONE-PARAGRAPH DEFINITION

LandedNZ is an AI-powered settlement companion for skilled migrants arriving
in New Zealand. It takes five onboarding inputs — visa type, city, family
situation, occupation, and arrival date — and generates a personalised,
sequenced settlement roadmap that tells the user what to do, in what order,
and why the order matters. It supplements the roadmap with a conversational
AI interface for NZ-specific questions and proactive reminders before
time-sensitive deadlines pass. The product's fundamental thesis is that
migrants don't fail to settle because information doesn't exist — they fail
because nobody tells them what order to do things in, and the wrong order
is expensive.

---

## THE PROBLEM STATEMENT (PRECISE VERSION)

Every year, 130,000+ people arrive in New Zealand as migrants. Within their
first two weeks, they must navigate a fragmented set of tasks across at least
six separate government agencies — IRD, Immigration NZ, MBIE, ACC, Ministry
of Health, and local councils — with no unified entry point, no sequencing
guidance, and no personalisation for their specific situation.

The information exists. Government websites have it. PDFs have it.
Facebook groups have fragments of it.

What doesn't exist is the answer to: **"Given my specific situation,
what do I do first, what depends on what, and what happens if I get it wrong?"**

The consequence is not just inconvenience. It's measurable financial loss:
- A missed IRD number in week one costs 45% emergency tax on every paycheck
  until it's resolved — on a single income, this is $300–400 lost per week
- A lease signed in the wrong suburb before understanding school zones is
  a $3,000–5,000 moving cost
- Sending money home through a bank instead of Wise costs $300–600/year
  in unnecessary fees
- A KiwiSaver default fund chosen passively in week one may underperform
  by tens of thousands over a working lifetime

These mistakes happen not because migrants are careless, but because the
system gives them no sequenced, personalised guidance. That is the gap
LandedNZ fills.

---

## THE CORE VALUE PROPOSITION

> **Every migrant needs the same thing first — someone who knows their situation
> and says: do this before anything else.**

Three words that define it: **Personalised. Sequenced. Proactive.**

- **Personalised** — not generic advice that applies to everyone and therefore
  truly applies to no one. Your visa type, your family structure, your occupation,
  your city, your arrival date. The roadmap is yours.

- **Sequenced** — not a list of tasks, but an ordered dependency chain.
  IRD before employer. Bank before bond. Suburb before lease. The order is the product.

- **Proactive** — not reactive (answering questions after problems happen).
  LandedNZ anticipates what the user needs before they know they need it,
  and surfaces it at the right moment.

---

## WHY SEQUENCING IS THE DIFFERENTIATOR — NOT INFORMATION

This distinction is the most important strategic decision in the product.

Government websites already have the information. They are comprehensive,
accurate, and freely available. LandedNZ does not win by having better
information than IRD.govt.nz. It wins by doing what IRD.govt.nz cannot do:

**Tell you what to do first, given who you are.**

The IRD website tells you how to get an IRD number.
LandedNZ tells you: you need your IRD number before your first paycheck,
which means you need to apply in week one, which means you need a temporary
NZ address first, which means your first task on arrival is not job searching —
it is getting a SIM card, finding temporary accommodation, and submitting
the IRD application within 48 hours of landing.

That is a fundamentally different product than an information website.
It is a **personal advisor encoded in software**.

---

## THE PRIMARY USE CASE (Designed Around Priya & Karthik)

Priya arrives in Auckland on a Partner of Student Work Visa.
Her husband Karthik is on a student visa studying for his Master's.
They have no children. She is the sole income earner. He can work 20 hours
per week during term time.

She opens LandedNZ on her phone at Auckland Airport.

She answers five questions:
1. Visa type → Partner of Student Work Visa
2. City → Auckland
3. Family situation → Couple, no children
4. Occupation → Accountant
5. Arrival date → Today

LandedNZ generates her roadmap. The first three tasks, in order:

**Task 1 (Today): Get a NZ SIM card**
*Why first:* You need a NZ phone number to open a bank account and to
receive IRD correspondence. Buy in-store — not at the airport kiosk.
Recommended: Spark or One NZ prepay. $30 gets you started.

**Task 2 (Today or tomorrow): Open a bank account**
*Why second:* You need a bank account before you can pay a rental bond
or receive your first paycheck. ANZ, ASB, and Kiwibank allow account
opening with overseas passport and a temporary accommodation address.
Bring your passport, visa approval letter, and the address of where
you're staying — even an Airbnb is accepted.

**Task 3 (This week, before anything else): Apply for your IRD number**
*Why third and urgent:* Without an IRD number, your employer will tax you
at 45% on every paycheck — the emergency rate. Your IRD application takes
8–15 working days to process. Apply today. You need your bank account
number for the application (Task 2 first). Here is the exact link.

Priya does not need to search five websites. She does not need to join
a Facebook group and wait for answers. She has a sequenced plan built
for her specific situation, and she knows why each task comes before the next.

This is the product.

---

## WHAT LANDEDNZ IS NOT

Defining boundaries is as important as defining the product.

**LandedNZ is not an immigration advisor.**
It does not provide visa advice, legal interpretation of immigration policy,
or guidance that requires a Licensed Immigration Adviser. When questions
enter this territory, LandedNZ links to verified sources and recommends
professional consultation.

**LandedNZ is not a government information repository.**
It does not attempt to replicate what Immigration NZ, IRD, or ACC already
publish. It links to those sources. Its value is in curating, sequencing,
and personalising — not in creating competing content.

**LandedNZ is not a community forum.**
It does not replace Facebook groups, Reddit, or WhatsApp communities.
It may surface relevant community resources, but peer-to-peer discussion
is not a feature it builds or moderates.

**LandedNZ is not a relocation service.**
It does not book flights, arrange removals, or negotiate leases.
It is a digital product — software, not services.

**LandedNZ does not serve all migrants equally at MVP.**
Working Holiday Makers, refugees, humanitarian entrants, and parent visa
holders are explicitly out of scope. MVP serves skilled migrants arriving
on AEWV, Partner of Student, and Green List visas — the segments with
the highest settlement complexity and the clearest willingness to engage
with a digital product.

---

## THE POSITIONING STATEMENT

**For skilled migrants arriving in New Zealand,**
**who are overwhelmed by the volume and complexity of settlement tasks,**
**LandedNZ is an AI-powered settlement companion**
**that gives them a personalised, sequenced roadmap for their first 90 days.**

**Unlike government websites, which are comprehensive but generic and unordered,**
**LandedNZ knows who you are and tells you exactly what to do next —**
**before the cost of getting it wrong hits your bank account.**

---

## THE COMPETITIVE MOAT

The competitive space is currently empty for an AI-powered NZ settlement product.
But "empty space" is not a durable moat. The moat must be built deliberately.

### Moat Layer 1: NZ-Specific Depth
Generic relocation apps exist globally. None have the NZ-specific depth required
to be useful — IRD emergency tax rates, KiwiSaver defaults, Healthy Homes
Standards, ACC, school zone mechanics, NZ CV format. Building this knowledge
base correctly takes months of research and validation. It is a content moat
that compounds over time.

### Moat Layer 2: Founder Authenticity
Ruchira is the primary user. He will live every pain point LandedNZ is built
to solve. Product decisions made from lived experience are more accurate than
those made from research alone. This is not replicable by a competitor who
is not a migrant.

### Moat Layer 3: Sequencing Intelligence
The sequencing logic — what depends on what, what the consequences of delay
are, what the time windows look like — is the core intellectual property.
It is not a list of tasks. It is a dependency graph with financial consequences
attached. Building this correctly for multiple visa types, family situations,
and cities is complex enough to take months to replicate.

### Moat Layer 4: User Data Over Time
As users complete tasks and report outcomes, LandedNZ learns what sequences
actually work, where delays happen, and what the real failure modes are.
This feedback loop compounds into a better product over time — one that
a new entrant without the user base cannot easily replicate.

### Moat Layer 5: B2B Employer Channel (Post-MVP)
Accredited employers are legally required to provide settlement information
to AEWV holders within 30 days of employment. Most don't — or provide a PDF.
LandedNZ as a white-label employer tool creates a B2B distribution channel
that individual consumer products cannot easily compete with.

---

## MONETISATION MODEL

### MVP: Freemium B2C

**Free tier:**
- Onboarding (5 questions)
- Personalised settlement roadmap (Phases 1–2: pre-arrival + first 2 weeks)
- Progress tracker (mark tasks complete)
- Links to verified government sources

**Premium tier (NZD $9.99/month or NZD $49/6 months):**
- Full Phase 3 roadmap (weeks 3–8)
- AI chat interface — ask any NZ settlement question in plain English
- Smart reminders — proactive alerts before deadlines
- Couple-aware onboarding — roadmap accounts for single income constraint,
  visa interdependency, and student visa 20-hour work limit as a static input
  *(Full live dual-partner tracking is post-MVP v2)*

**Pricing rationale:**
- One week of IRD emergency tax on a $65K salary = ~NZD $240 in overpayment
- Six months of LandedNZ Premium = NZD $49
- The product pays for itself the moment it prevents a single week of emergency tax
- Price point is below the threshold of deliberation for someone who has just
  paid $3,000+ in visa fees and $2,000+ in flights

### Post-MVP: B2B Employer

**Target:** NZ accredited employers (17,500+)
**Proposition:** White-label LandedNZ as their legal settlement information
obligation fulfillment tool. Employer pays per migrant employee onboarded.
**Pricing model:** NZD $75–150 per employee onboarded (one-time fee per arrival)
**Revenue ceiling:** Even 1% of accredited employers onboarding 5 employees/year
at $100/employee = NZD $875,000 ARR. This is a meaningful B2B business.

---

## MVP SUCCESS CRITERIA

The MVP is validated when:

1. **Activation:** 70%+ of users who complete onboarding view at least
   3 tasks on their roadmap within the first session

2. **Retention:** 40%+ of activated users return within 7 days to
   mark tasks complete or use AI chat

3. **Core value delivered:** At least one user explicitly reports
   avoiding a costly mistake (IRD, KiwiSaver, rental rights) because
   of LandedNZ guidance — qualitative evidence collected via in-app
   feedback or direct user interview

4. **Willingness to pay:** 5%+ of free users upgrade to premium
   within 30 days of activation

5. **NPS:** Net Promoter Score of 40+ from users who have completed
   Phase 2 of their settlement journey

These are intentionally specific. They tell us whether the core thesis —
that sequenced, personalised guidance is worth paying for — is true.
If activation is high but retention is low, the roadmap is compelling
but not sticky enough to keep users returning. If retention is high
but willingness to pay is low, the free tier is too generous.
Each metric is a diagnostic, not just a target.

---

## WHAT SECTION 4 (FEATURE DEFINITION) MUST ANSWER

Now that the vision is defined, Section 4 translates it into specific features:

1. **Onboarding flow** — the 5 questions and how they map to roadmap generation
2. **Roadmap engine** — how tasks are sequenced, what triggers personalisation,
   how dependency chains are structured
3. **Task card design** — what information each task contains (what, why, how,
   time required, consequence of delay, link to source)
4. **AI chat interface** — scope, guardrails, what it answers vs. defers
5. **Progress tracker** — how completion is recorded and what it unlocks
6. **Smart reminders** — what triggers them, timing, delivery mechanism
7. **Couple-aware onboarding** — how the student visa + partner visa situation
   is captured at onboarding and reflected in the roadmap as a static input.
   Full live dual-partner tracking is post-MVP.
8. **Premium gate** — exactly where the free/paid boundary sits and why

---

## DECISIONS LOG — PRODUCT VISION

| Decision | What | Why |
|----------|------|-----|
| Core differentiator | Sequencing, not information | Information already exists; ordering is the gap |
| Dual-partner mode | Simplified couple-awareness at onboarding only | Over-engineering for MVP; static input is sufficient to personalise roadmap; live tracking is v2 |
| Positioning | Personal advisor encoded in software | Beats "better government website" framing |
| Monetisation | Freemium B2C + B2B employer post-MVP | Free tier earns trust; premium tier monetises within 30 days |
| Premium price | NZD $9.99/month or $49/6 months | Below deliberation threshold; product pays for itself first week |
| MVP excluded segments | Working Holiday, refugees, parents | Different needs, different channels — dilutes focus |
| MVP success metric | 5% free-to-paid conversion + 40% D7 retention | Tests both core thesis (value) and business model (willingness to pay) |
| B2B channel | Post-MVP, employer white-label | Requires MVP validation first; employer relationship takes time to build |

---

*Next document: 07-feature-definition.md*
*Section 4 takes the vision above and defines every feature at the spec level —
what it does, who it serves, and what it explicitly does not do.*
