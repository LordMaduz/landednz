# 05 — Problem Mapping
*Research conducted: February 2026*
*Updated: February 2026 — revised for v2 personas (Constrained Couple as primary)*
*Purpose: Map every pain point across the full settlement journey,
sequenced chronologically from pre-arrival to 12 months in.
Directly informs MVP feature definition in Section 4.*

---

## MAPPING APPROACH

### Decision: Chronological Phases, Not Topic Categories
**Why chronological over topic-based (housing, banking, healthcare)?**

Migrants don't experience problems by topic — they experience them in time.
"What do I do this week?" is the real question, not "tell me everything about banking."

A chronological map forces us to think like the user, not like a government website.
It also directly informs the product's core structural decision:
show the user what they need to do NOW, not everything they'll ever need to do.

Topic-based organisation = government website (already exists, doesn't work)
Chronological organisation = personal advisor (what LandedNZ becomes)

### Decision: 5 Phases
Settlement research consistently shows migrants go through distinct stages
with different dominant needs at each stage.

- Too few phases (2–3): loses nuance between weeks and months
- Too many phases (7+): creates artificial overlap and confusion
- 5 phases: natural break points aligned with real lived experience

### Decision: MVP Covers Phases 1–3 Only
Phases 1–3 are where pain is most acute, mistakes most costly,
and users most motivated to use a tool.

A new arrival in Week 1 will download and use an app desperately.
A settled migrant in Month 9 has built workarounds and is comfortable.

Phases 4–5 are real problems worth solving — they are post-MVP expansion,
requiring deeper financial, legal, and community features out of 6-week scope.

### Persona Mapping Key
Problems are tagged to show which persona segments they apply to:

- 🔵 **Universal** — affects all three personas
- 🟢 **Couple** — Priya & Karthik (primary — constrained couple, no children)
- 🟡 **Family** — Raj & Aroha (secondary — family with children)
- 🟠 **Regulated** — Maria (post-MVP — regulated professional)

---

## PHASE 1 — PRE-ARRIVAL
*Timeline: 1–4 weeks before landing*

### What's Happening
Visa approved. Flight booked. Reality setting in.
High motivation, zero direction.
Making decisions now that will be hard to reverse after landing.

### Root Emotion
Anxious excitement. Want to prepare but don't know how.

### Problems

#### 1.1 No Single Pre-Arrival Checklist 🔵 Universal
**Problem:** No trusted source tells migrants what to prepare before they land.
Information is scattered across Immigration NZ, IRD, bank websites, employer packs.
**Consequence:** Arrive unprepared, waste first week on things that could have
been done before landing.
**Sequence dependency:** Everything downstream is slower if pre-arrival prep is skipped.

#### 1.2 Bank Account — Remote Opening Confusion 🔵 Universal
**Problem:** Some NZ banks allow account opening from overseas (ANZ, ASB, Kiwibank
have international onboarding) but this isn't widely known or explained clearly.
**Consequence:** Migrants who don't open an account remotely arrive with no NZ
bank account and face the circular problem: need NZ address to open account,
need bank account to pay for accommodation.
**Sequence dependency:** Bank account needed before rental bond can be paid.

#### 1.3 Suburb Selection Without Context 🔵 Universal (stakes differ by persona)
**Problem:** Choosing temporary accommodation without understanding Auckland's
suburb dynamics — commute times, community concentrations, public transport reality.
**Consequence:** Land in the wrong area, either too expensive or too far from work.
**Additional risk for Priya & Karthik:** Wrong suburb affects both Priya's job search
proximity and Karthik's campus commute — double constraint on a single income.
**Additional risk for families (Raj & Aroha):** Wrong suburb = wrong school zone =
cannot enrol child in nearby school. High-stakes, low-reversibility decision.

#### 1.4 Document Preparation Gaps 🔵 Universal
**Problem:** Don't know which documents to carry physically vs digitally.
Key documents needed on arrival and in first weeks:
- Passport and visa approval letter
- Birth certificates (self and children — families only)
- Marriage certificate (for partner visa holders)
- Academic transcripts and qualification certificates
- Employment reference letters
- Previous landlord references
- Police clearance certificate
- Health records and vaccination history (especially for children's school enrolment)
**Consequence:** Delays at every stage when documents are missing or only digital
when physical copies are required (many NZ processes still require originals).

#### 1.5 Qualification Recognition — NZQA Timing 🟢🟡 Couple + Family
**Problem:** Overseas qualifications often need NZQA (New Zealand Qualifications
Authority) assessment before they're recognised by NZ employers.
NZQA assessment takes 10–16 weeks.
Most migrants don't know this needs to be started before arrival.
**Consequence:** Priya (partner visa, no NZ work history) faces a 10–16 week
delay to being hireable if NZQA not started pre-arrival. On a single-income couple
budget, this delay compounds financial pressure significantly.
**Specifically critical for:** Accountants, engineers, teachers, healthcare workers.

#### 1.6 NZ Cost of Living Underestimation 🔵 Universal (most acute for couples)
**Problem:** Migrants consistently underestimate Auckland's rental costs.
Auckland median rent: NZD $600–750/week for a 2-bedroom house (2025).
Migrants budget based on home country equivalents — severely underestimate.
**Why it hits hardest for Priya & Karthik:** 60% of all migrants rated cost of living
worse than expected (MBIE 2023). For a single-income couple on student visa constraints,
arriving with a budget built on Indian/Sri Lankan cost references creates a 30–40%
shortfall discovered in the first 4–6 weeks.
**Consequence:** Arrive with insufficient savings buffer, financial stress before
first paycheck arrives.

#### 1.7 Karthik's Term-Time Work Limit — Pre-Arrival Planning 🟢 Couple
**Problem:** Karthik's student visa restricts him to 20 hours per week during
term time. Couples often don't plan their financial model around this before arrival.
**Consequence:** Arrive expecting two incomes, discover one is structurally capped.
Financial model needs rebuilding on the ground under pressure.
**Unique to this persona:** No other persona has this structural constraint pre-built
into their situation from day one.

#### 1.8 SIM Card and Internet Planning 🔵 Universal
**Problem:** Don't know which NZ telco to choose or that airport SIM card
prices are significantly worse than buying in-store.
**Consequence:** Minor but annoying — overpay for first month on wrong plan.

### Phase 1 — Problem Severity Matrix

| Problem | Severity | Reversibility | Persona | MVP Priority |
|---------|----------|---------------|---------|--------------|
| No pre-arrival checklist | High | Medium | Universal | ✅ Core feature |
| Bank account remote opening | High | Medium | Universal | ✅ Core feature |
| Suburb selection without context | High | Low | Universal | ✅ Core feature |
| Document preparation gaps | High | Medium | Universal | ✅ Core feature |
| NZQA timing | High | Low | Couple + Family | ✅ Core feature |
| Cost of living underestimation | Medium | Low | Universal | ✅ Core feature |
| Karthik's work limit planning | High | Medium | Couple | ✅ Core feature |
| SIM card planning | Low | High | Universal | ⬜ Nice to have |

---

## PHASE 2 — FIRST 2 WEEKS
*Timeline: Landing to first stability*

### What's Happening
On the ground. Everything needs to happen at once.
This is the most overwhelming phase of the entire settlement journey.
The most expensive mistakes happen here.

### Root Emotion
Overwhelmed. Making costly mistakes due to ignorance, not incompetence.

### Problems

#### 2.1 IRD Number — The Most Critical Sequencing Error 🔵 Universal (most acute for couples)
**Problem:** IRD number (NZ tax number equivalent) must be applied for immediately.
Without it, any employment income is taxed at 45% emergency rate.
Application takes 1–2 weeks to process.
Most migrants don't know this is urgent — they discover it when they receive
their first paycheck and see the deduction.
**Why it's most severe for Priya & Karthik:** On a single income, there is no
second paycheck to absorb the error while it's being corrected. Every week of
emergency tax costs the couple ~NZD $320–400 on a $60–80K salary. Karthik's
20-hour limit means he cannot compensate.
**Sequence dependency:** IRD number → tax code declaration to employer → submit
before first paycheck. The sequence is narrow and time-critical.

#### 2.2 Bank Account — The Circular Problem 🔵 Universal
**Problem:** Opening a NZ bank account requires:
- Proof of NZ address
- Passport
- Visa documentation
But migrants have no NZ address in week 1 (staying in Airbnb or temporary housing).
This creates a circular dependency:
- Need bank account to pay rental bond
- Need NZ address to open bank account
- Need bank account to have NZ address proof
**How to resolve:** Some banks accept a letter from employer or temporary
accommodation address. Most migrants don't know this workaround exists.
**Consequence:** Weeks of delay, cash-only existence, can't pay bond.

#### 2.3 Rental Market — Speed and Rights 🔵 Universal
**Problem:** Auckland rental market moves extremely fast.
Properties typically rent within 48 hours of listing.
Migrants competing against locals with:
- NZ rental references
- NZ credit history
- Local guarantors
Migrants have none of these advantages.

Additionally, most don't know:
- Rental bond must be lodged with Tenancy Services (not kept by landlord)
- Maximum bond = 4 weeks rent (landlords cannot legally charge more)
- Tenancy agreement must include specific clauses under Residential Tenancies Act
- 48-hour notice required for landlord entry (except emergencies)
- Healthy Homes Standards — minimum heating, insulation, ventilation requirements

**Consequence:** Miss rentals due to slow decision-making. Sign bad leases
without knowing rights. Pay illegal bond amounts. Lose bond illegally.

#### 2.4 KiwiSaver Default Trap 🔵 Universal (acute on single income)
**Problem:** Employers automatically enrol new employees in KiwiSaver
(NZ's retirement savings scheme).
Default fund assignment is based on age only — not risk appetite or time horizon.
Contribution rate defaults to 3% — migrants don't know they can choose 4%, 6%, 8%, 10%.
Employer contributes minimum 3% — migrants don't know they can opt out in year 1.
Fund type (conservative, balanced, growth) has enormous long-term impact.
**Why it's acute for Priya & Karthik:** On a tight single-income budget, an unexpected
3% deduction from Priya's first paycheck tightens an already stressed cash position.
The decision of whether to contribute at all in Year 1 is a real financial trade-off
that nobody explains to them.
**Consequence:** Years of suboptimal KiwiSaver performance due to wrong fund
and wrong contribution rate chosen passively under week-1 pressure.

#### 2.5 GP Registration — Discovery Timing 🔵 Universal
**Problem:** NZ public health system requires registration with a General Practice (GP).
You cannot walk into any doctor — you must be registered with a specific practice.
GP practices have waitlists. Some areas of Auckland have waits of weeks.
Most migrants discover this when someone is sick — the worst time.
**Consequence:** Healthcare access delayed by weeks. Emergency department used
for non-emergencies (expensive and wrong use of system).

#### 2.6 Driving — Foreign Licence Rules 🔵 Universal
**Problem:** Foreign driver's licences are valid for 12 months in NZ.
After 12 months, must convert to NZ licence.
Conversion process requires:
- Eye test
- Theory test (if licence not in English — must pass theory test)
- Practical test (in some cases)
Most migrants don't know the conversion timeline or process.
**Consequence:** Drive illegally after 12 months unknowingly.
Insurance invalid if driving on expired foreign licence.

#### 2.7 Children — Immediate Needs 🟡 Family only
**Problem:** Families with children (Raj & Aroha) have additional immediate tasks:
- School enrolment (zone-based, can only enrol in zone school)
- Plunket registration (NZ's child health programme, free)
- Vaccination catch-up (NZ schedule differs from many countries)
- After-school care / daycare arrangement
**Consequence:** Children's integration delayed. Parents' ability to work
delayed if childcare not arranged.
**Note:** This problem does not apply to Priya & Karthik (no children).
Presenting it as a universal pain in top-level positioning is incorrect.

#### 2.8 Visa Interdependency Tracking 🟢 Couple (unique to primary persona)
**Problem:** Karthik's student visa and Priya's Partner of Student Work Visa
are linked. Changes to Karthik's enrolment, study load, or visa status
directly affect Priya's work rights. Neither of them has a simple mental model
of how the two visas interact or what triggers a change in Priya's entitlements.
**Consequence:** Risk of Priya working in violation of her visa conditions
without realising it. Risk of Karthik making study decisions without understanding
the downstream effect on Priya's status.
**No other persona has this problem.** Solo migrants manage one visa. Maria
manages one visa. Only the interdependent couple has two linked visas.

#### 2.9 Utilities Setup 🔵 Universal
**Problem:** Electricity, gas, internet setup required immediately.
NZ has competitive retail electricity market — wrong provider choice
leads to overpaying significantly.
**Consequence:** Overpay on utilities for months before bothering to switch.

### Phase 2 — Problem Severity Matrix

| Problem | Severity | Reversibility | Persona | MVP Priority |
|---------|----------|---------------|---------|--------------|
| IRD number urgency | Critical | Low | Universal | ✅ Core feature |
| Bank account circular problem | High | Medium | Universal | ✅ Core feature |
| Rental market speed and rights | High | Low | Universal | ✅ Core feature |
| KiwiSaver default trap | High | Medium | Universal | ✅ Core feature |
| GP registration timing | High | Medium | Universal | ✅ Core feature |
| Foreign licence rules | Medium | Medium | Universal | ✅ Core feature |
| Children immediate needs | High | Medium | Family only | ✅ Core (persona-specific) |
| Visa interdependency tracking | High | Medium | Couple only | ✅ Core (persona-specific) |
| Utilities setup | Low | High | Universal | ⬜ Nice to have |

---

## PHASE 3 — WEEKS 3–8
*Timeline: Stabilisation*

### What's Happening
Basic admin mostly done. Now trying to build a real life.
First attempts at employment, social connection, longer-term planning.

### Root Emotion
Cautious optimism mixed with quiet frustration.
Stabilised but not yet comfortable.

### Problems

#### 3.1 Job Search — Partner Visa Holders 🟢🟡 Couple + Family
**Problem:** Priya (and Aroha re-entering NZ market) face job search with no NZ
work history:
- No NZ-format CV knowledge (NZ CVs: 2 pages max, photo optional not expected,
  references listed at end, different section ordering than Asian formats)
- No local references or guarantors
- Unfamiliarity with NZ hiring culture (heavily relationship and referral-driven)
- Uncertainty about whether overseas qualifications need NZQA assessment
- Don't know the role of recruitment agencies vs direct applications in NZ
**Why it's acute for Priya:** She is the sole income earner under financial pressure.
A prolonged job search isn't just an inconvenience — it directly threatens the
couple's financial runway while Karthik is studying.
**Consequence:** Job search takes 2–3x longer than it should.
Qualified migrants underemployed or unemployed for months unnecessarily.

#### 3.2 School Enrolment — Zone Reality 🟡 Family only
**Problem:** NZ school enrolment is strictly zone-based.
Each school has a defined enrollment zone — students outside the zone
cannot enrol (except through out-of-zone ballot with no guarantee).
Migrants who signed a lease in Week 2 without knowing this face:
- Cannot enrol child in nearby school
- Must travel to in-zone school (further away)
- Must move house (expensive) to get into desired school zone
**Consequence:** Wrong suburb choice = months of disruption and potential relocation.
**Note:** This belongs in Persona 2 (Family), not top-level product positioning.
It is not a universal problem — Priya & Karthik do not face this.

#### 3.3 Overseas Qualification Recognition 🔵 Universal
**Problem:** Many professional qualifications need formal NZ recognition:
- NZQA assessment (10–16 weeks, fees apply)
- Professional body registration (engineers, accountants, teachers, nurses)
- Some qualifications from certain countries require additional assessment
**Consequence:** Employment delayed significantly for migrants who didn't start
this pre-arrival. Qualified professionals working in unrelated jobs
while waiting for qualification recognition.

#### 3.4 ACC — Understanding NZ's Unique System 🔵 Universal
**Problem:** NZ's Accident Compensation Corporation (ACC) is unique globally.
It means:
- NZers cannot sue for personal injury (right removed in exchange for ACC coverage)
- All injury compensation — workplace, road, home, recreational — goes through ACC
- ACC levies are charged to employers and employees
- If injured at work, claim process is through ACC not through employer's insurance
Most migrants assume NZ works like their home country for workplace injury —
it doesn't. This catches people off-guard when injury occurs.
**Consequence:** Migrants don't claim ACC entitlements they're eligible for.
Or make wrong assumptions about workplace injury liability.

#### 3.5 Remittances — Overpaying on International Transfers 🔵 Universal (most acute for couples)
**Problem:** Most migrants initially send money home through their bank.
NZ bank international transfer fees: 3–5% of transfer amount.
Better alternatives: Wise (0.4–0.8%), OFX (competitive rates), Remitly.
For someone sending NZD $1,000/month home:
- Bank: NZD $30–50 per transfer = NZD $360–600/year in fees
- Wise: NZD $4–8 per transfer = NZD $48–96/year in fees
**Why it's acute for Priya & Karthik:** On a single income with Karthik possibly
repaying tuition financing in Sri Lanka, unnecessary transfer fees compound an
already tight financial position.
**Consequence:** Hundreds of dollars wasted annually on unnecessary transfer fees.
Nobody tells migrants this — they discover it months later via community forums.

#### 3.6 NZ Tax Obligations — First Year Complexity 🔵 Universal
**Problem:** NZ tax year runs April 1 to March 31.
Migrants arriving mid-year have complex first-year tax situations:
- May have overseas income that becomes NZ-taxable
- IR3 individual tax return may be required (not automatic)
- Tax residency rules differ from visa residency rules
- KiwiSaver tax credits available but not auto-applied
**Consequence:** Unexpected tax bill in first NZ tax return.
Or miss out on tax refunds/credits they're entitled to.

#### 3.7 Social Connection — The Hardest Unsolved Problem 🔵 Universal (different form per persona)
**Problem:** Building a social life from scratch as an adult in a new country
is one of the hardest challenges migrants face (MBIE settlement research).
Current "solutions":
- Facebook groups (overwhelming, impersonal)
- Meetup.com (inconsistent quality)
- Colleagues at work (professional relationship, not social)
- Kids' school connections (only for families with children)
- Migrant resource centres (formal, not organic)

**How it differs by persona:**
- **Priya & Karthik:** Have each other, which reduces acute loneliness — but creates
  an insular unit that risks never building an external network. Professional networks
  are how Priya gets her second job and future visa referees. Social isolation as a
  couple is more insidious than solo isolation — it's easier to not notice.
- **Raj & Aroha with children:** Children's social integration is often harder than
  adult integration. School friends → parent friendships is the primary mechanism,
  but takes months.

**Consequence:** Social isolation affects mental health, productivity, and
ultimately whether migrants choose to stay in NZ long-term.

#### 3.8 NZ Workplace Culture Navigation 🔵 Universal
**Problem:** NZ workplace culture differs significantly from most Asian cultures:
- Flat hierarchy — call manager by first name
- Direct communication expected — say what you think
- Self-advocacy essential — don't wait to be noticed
- Collaborative decision-making — input expected from everyone
- Work-life balance is genuine — leaving on time is not laziness
- Humour and informality — Kiwi workplaces are casual
Migrants conditioned by hierarchical Asian corporate cultures
often misread these signals and underperform politically
even while excelling technically.
**Why it's acute for Priya:** Her first NZ job is high-stakes — she needs to succeed
to maintain the couple's financial position. Cultural misreads cost her in
performance reviews and promotion speed.
**Consequence:** Slower career progression. Missed opportunities.
Feeling like an outsider despite strong technical performance.

#### 3.9 Karthik's Term Calendar Management 🟢 Couple only
**Problem:** Karthik must manage his work hours carefully against his academic calendar.
During standard term time: maximum 20 hours per week.
During scheduled breaks (AUT publishes these in advance): full-time work allowed.
An accidental breach of visa work conditions has serious downstream consequences
for the residency pathway.
**Consequence:** Risk of immigration violation without realising it.
Loss of residency eligibility if breach is detected during application.
**No other persona faces this problem.**

### Phase 3 — Problem Severity Matrix

| Problem | Severity | Reversibility | Persona | MVP Priority |
|---------|----------|---------------|---------|--------------|
| Job search without NZ context | High | Medium | Couple + Family | ✅ Core feature |
| School enrolment zone reality | High | Low | Family only | ✅ Core (persona-specific) |
| Qualification recognition | High | Low | Universal | ✅ Core feature |
| ACC understanding | Medium | High | Universal | ✅ Core feature |
| Remittances overpaying | Medium | High | Universal | ✅ Core feature |
| Tax first-year complexity | High | Medium | Universal | ✅ Core feature |
| Social connection | High | Medium | Universal | ✅ Core feature |
| NZ workplace culture | High | Medium | Universal | ✅ Core feature |
| Karthik's term calendar | High | Medium | Couple only | ✅ Core (persona-specific) |

---

## PHASE 4 — MONTHS 3–6
*Timeline: Integration*
*Note: Post-MVP. Documented for future expansion planning.*

### What's Happening
Settled enough to think longer term.
Starting to feel the gap between expectation and reality.
Growing confidence mixed with underlying anxiety about permanence.

### Key Problems (Summary — Not MVP Scope)

- **Visa pathway anxiety:** Many migrants don't understand their residency pathway
  or what milestones to track (income thresholds, employer accreditation status,
  continuous stay rules, maximum continuous stay limits).

- **Career progression barriers:** NZ workplace rewards self-advocacy and networking.
  Asian professionals culturally conditioned to wait — works against them here.

- **KiwiSaver optimisation:** Wrong fund type from Week 1 defaults.
  Many migrants don't revisit this for years.

- **Financial planning:** Understanding NZ property market, rent vs buy decision,
  first home buyer schemes, KiwiSaver first home withdrawal.

- **Employer obligations awareness:** Accredited employers legally required to
  provide settlement information within 30 days — most don't.
  Migrants don't know their rights.

- **Family visa sponsorship:** Wanting to bring parents, siblings.
  Parent Boost Visa (introduced September 2025): up to 5 years, renewable.
  Complex, expensive, long process — no clear guide exists.

- **Community belonging:** Many migrants report feeling "between two worlds"
  at this stage. Te Tiriti o Waitangi (Treaty of Waitangi) and Māori culture
  are central to NZ identity. Most migrants have zero exposure and inadvertently
  miss opportunities for genuine belonging.

---

## PHASE 5 — MONTHS 6–12+
*Timeline: Belonging or departure decision*
*Note: Post-MVP. Documented for future expansion planning.*

### What's Happening
Either settling in for the long term or starting to question the decision.
The "flight" or "fit" stage from settlement research.

### Key Problems (Summary — Not MVP Scope)

- **Residency application timing:** Migrants miss optimal application windows
  because they don't track their own eligibility milestones.
  AEWV holders have maximum continuous stay limits (3 or 5 years depending on role).

- **Citizenship pathway:** 5 years of NZ presence required.
  Time overseas during this period affects eligibility in complex ways.
  Most migrants don't know the counting rules.

- **Tax residency implications:** Worldwide income becomes NZ-taxable
  after becoming a NZ tax resident.
  Most migrants discover this too late.

- **Property purchase:** Foreign buyer restrictions (reinstated 2024),
  LIM reports, building inspections, conveyancer role —
  all unfamiliar concepts for most migrants.

- **Long-term cultural integration:** Māori culture, te reo Māori, kaitiakitanga —
  central to NZ identity but almost entirely unknown to most migrants
  on arrival. Genuine integration requires engagement with this,
  not just administrative settlement.

---

## COMPLETE PROBLEM MAP — SUMMARY TABLE

| Phase | Timeline | Problem | Severity | Persona | MVP? |
|-------|----------|---------|----------|---------|------|
| 1 | Pre-arrival | No pre-arrival checklist | High | Universal | ✅ |
| 1 | Pre-arrival | Bank remote opening unknown | High | Universal | ✅ |
| 1 | Pre-arrival | Suburb selection without context | High | Universal | ✅ |
| 1 | Pre-arrival | Document preparation gaps | High | Universal | ✅ |
| 1 | Pre-arrival | NZQA timing not known | High | Couple + Family | ✅ |
| 1 | Pre-arrival | Cost of living underestimation | Medium | Universal | ✅ |
| 1 | Pre-arrival | Karthik's work limit planning | High | Couple | ✅ |
| 2 | Week 1–2 | IRD urgency unknown | Critical | Universal | ✅ |
| 2 | Week 1–2 | Bank account circular problem | High | Universal | ✅ |
| 2 | Week 1–2 | Rental market speed and rights | High | Universal | ✅ |
| 2 | Week 1–2 | KiwiSaver default trap | High | Universal | ✅ |
| 2 | Week 1–2 | GP registration timing | High | Universal | ✅ |
| 2 | Week 1–2 | Foreign licence rules | Medium | Universal | ✅ |
| 2 | Week 1–2 | Children immediate needs | High | Family only | ✅ |
| 2 | Week 1–2 | Visa interdependency tracking | High | Couple only | ✅ |
| 3 | Week 3–8 | Job search without NZ context | High | Couple + Family | ✅ |
| 3 | Week 3–8 | School zone reality | High | Family only | ✅ |
| 3 | Week 3–8 | Qualification recognition | High | Universal | ✅ |
| 3 | Week 3–8 | ACC understanding | Medium | Universal | ✅ |
| 3 | Week 3–8 | Remittances overpaying | Medium | Universal | ✅ |
| 3 | Week 3–8 | Tax first-year complexity | High | Universal | ✅ |
| 3 | Week 3–8 | Social connection | High | Universal | ✅ |
| 3 | Week 3–8 | NZ workplace culture | High | Universal | ✅ |
| 3 | Week 3–8 | Karthik's term calendar | High | Couple only | ✅ |
| 4 | Month 3–6 | Visa pathway anxiety | High | Universal | ❌ Post-MVP |
| 4 | Month 3–6 | Career progression barriers | High | Universal | ❌ Post-MVP |
| 4 | Month 3–6 | Financial planning | Medium | Universal | ❌ Post-MVP |
| 4 | Month 3–6 | Family visa sponsorship | High | Universal | ❌ Post-MVP |
| 4 | Month 3–6 | Community belonging | High | Universal | ❌ Post-MVP |
| 5 | Month 6–12+ | Residency application timing | High | Universal | ❌ Post-MVP |
| 5 | Month 6–12+ | Citizenship pathway | Medium | Universal | ❌ Post-MVP |
| 5 | Month 6–12+ | Tax residency implications | High | Universal | ❌ Post-MVP |
| 5 | Month 6–12+ | Property purchase | Medium | Universal | ❌ Post-MVP |
| 5 | Month 6–12+ | Long-term cultural integration | High | Universal | ❌ Post-MVP |

---

## THE CORE PRODUCT INSIGHT

**The reason migrants make expensive mistakes is not lack of information.**
The information exists across government websites, PDFs, and community forums.

**The reason is lack of sequencing.**

Nobody tells migrants:
- What to do first
- What depends on what
- How long each step takes
- What happens if they get the order wrong

This is LandedNZ's core value proposition.
Not an information repository.
Not a search engine.
A personalised, sequenced, AI-guided settlement journey —
that knows your situation and tells you exactly what to do next.

---

## KEY PRODUCT DESIGN IMPLICATION FROM UPDATED PERSONAS

The shift from Arjun (solo AEWV) to Priya & Karthik (constrained couple) as primary
persona adds two problem categories that solo-settler tools never address:

1. **Visa interdependency** — two visas, linked status, shared risk if either
   breaches conditions. Product must surface this as a unit, not as two individuals.

2. **Single-income financial pressure under structural cap** — the IRD emergency tax,
   KiwiSaver default, and cost of living shock all hit harder when there is one income
   and that income has a structural ceiling (Karthik's 20-hour limit).

These two problem types are the clearest product differentiation opportunities
that no existing tool addresses. They should be prominent in Section 3 (Product Vision)
and directly drive feature design in Section 4.

---

## MVP SCOPE DECISION

**MVP covers Phases 1, 2, and 3 exclusively.**

### Why Phase 1–3 and not 4–5?

| Factor | Phases 1–3 | Phases 4–5 |
|--------|------------|------------|
| User pain level | Acute, daily | Background anxiety |
| Mistake cost | Very high (financial, legal) | Medium (opportunity cost) |
| User motivation to use tool | Maximum | Lower (comfortable already) |
| Feature complexity | Manageable in 6 weeks | Requires legal/financial depth |
| AI accuracy requirements | High but achievable | Very high (residency/tax law) |

Phases 4–5 are valuable future product expansion — documented here
to ensure MVP architecture supports them without rebuilding.

---

## DECISIONS LOG — PROBLEM MAPPING

| Decision | What | Why |
|----------|------|-----|
| Mapping structure | Chronological phases | Mirrors user experience not government categories |
| Number of phases | 5 | Natural break points aligned with lived experience |
| MVP phase scope | Phases 1–3 only | Highest pain, most motivated users, 6-week feasibility |
| Core insight | Sequencing not information | Information exists; ordering is the gap |
| Post-MVP documentation | Phases 4–5 included | Ensure architecture supports future expansion |
| Persona tagging added | Universal / Couple / Family / Regulated | Prevents over-generalising persona-specific problems |
| School zones moved | Family only, not Universal | Only relevant to ~30–40% with dependent children |
| New problems added | Visa interdependency, Karthik's term limit | Unique to constrained couple primary persona — no tool serves this |

---

## KEY SOURCES

- MBIE Migrant Settlement and Integration Strategy 2023
- MBIE Migrant Survey 2023 (n=5,318)
- Immigration NZ — Integrating Staff Guide (emotional stages)
- Immigration NZ — Settlement Services Directory
- Stats NZ — Migration and Demographics Data 2023–2025
- IRD NZ — Emergency tax rate and IRD number documentation
- NZ Tenancy Services — Residential Tenancies Act, bond rules, Healthy Homes
- Nursing Council of NZ — Registration requirements
- ACC NZ — Scheme overview and levy documentation
- NZQA — Qualification assessment process and timelines
- KiwiSaver documentation — fund types, contribution rates, default enrollment
- NZ Transport Agency — Foreign licence conversion rules
- Wise, OFX, Remitly — International transfer fee research
- IRD NZ — IR3 return requirements, tax residency rules
- "New Land, New Life" MBIE Long-Term Settlement Research Report
- Settlement research: Belong Aotearoa organisational documentation
- BCG Future of NZ Inc Report 2025
- OECD International Migration Outlook 2024
