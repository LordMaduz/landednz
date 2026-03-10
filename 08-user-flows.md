# 08 — User Flows
*Written: February 2026*
*Purpose: Map every significant interaction screen by screen from first open
to key conversion moments. Primary persona lens: Priya & Karthik throughout.
Direct input to build — a developer should be able to read this and know
exactly what to build without ambiguity.*
*Feeds into: Section 6 (AI Design), Section 7 (Tech Stack), Section 8 (MVP Scope)*

---

## FLOW OVERVIEW

| # | Flow | Type | Tier |
|---|------|------|------|
| 1 | Entry point | First impression | Free |
| 2 | Onboarding | Data collection | Free |
| 3 | Roadmap reveal | Core value delivery | Free |
| 4 | Task card interaction | Primary recurring interaction | Free + Premium |
| 5 | Premium gate | Conversion moment | Transition |
| 6 | AI chat interaction | Premium differentiator | Premium |
| 7 | Returning user | Retention | Free + Premium |
| 8 | Lapsed user re-entry | Re-engagement | Free + Premium |

**Primary persona throughout:** Priya — Partner of Student Work Visa, arriving
Auckland, single income, Karthik on student visa. Every flow designed from
her perspective first.

---

## FLOW 1 — ENTRY POINT

### What this flow must achieve
The user has zero loyalty to LandedNZ. She will give it 30–60 seconds to prove
it understands her situation before closing it. The entry point must make her
feel understood before asking anything of her.

### Design decision: Empathy-first
Not a sample roadmap (generic content contradicts personalisation thesis).
Not a form (asking before earning the right to ask).
An empathy-first screen that names her situation, quantifies the stakes,
removes blame, and states the product thesis — before a single question is asked.

### Screen structure

**Background:**
Full-screen Auckland landmark photograph — Sky Tower or harbour.
Dark overlay (approximately 60% opacity) to ensure text legibility.
The image does geographic work instantly — "this is specifically New Zealand"
— before a single word is read.

**Progressive text reveal (lines appear sequentially, one at a time):**

Line 1 (fades in, 1 second):
> *"You've just landed in New Zealand — or you're about to."*

Line 2 (fades in, 1.5 seconds):
> *"In the next two weeks, five decisions will either cost you
> or save you hundreds of dollars."*

Line 3 (fades in, 1 second):
> *"Most migrants make at least one wrong.
> Not because they're careless —
> because nobody told them the order."*

Line 4 (fades in, larger and bolder, 0.8 seconds):
> *"LandedNZ tells you the order."*

Line 5 — data point (fades in, smaller, 0.8 seconds):
> *"130,000 migrants arrive in New Zealand every year.
> Most navigate this alone."*

**CTA button (appears after Line 5):**
Full-width button, bottom of screen:
> *"Build my plan → takes 2 minutes"*

**Skip option:**
Small text link, top right corner, visible from the start:
> *"Skip"*
Tapping skip jumps directly to onboarding Question 1.
For returning users or users who have seen the entry point before.

### What the entry point does NOT do
- Does not ask for email or account creation
- Does not show a sample roadmap (generic = contradicts personalisation thesis)
- Does not show pricing or premium features
- Does not require any input before the CTA

### Flow exit
User taps "Build my plan →" → proceeds to Flow 2 (Onboarding)
User taps "Skip" → proceeds to Flow 2 (Onboarding) Question 1

---

## FLOW 2 — ONBOARDING

### What this flow must achieve
Collect five inputs that generate the personalised roadmap. Feel like a
conversation, not a form. Show the user their profile building in real time.
Handle the couple-specific follow-up question naturally.

### Design decision: Questions build downward on single screen
Not one question per screen (wizard feels mechanical, previous answers
disappear). Not all questions at once (form anxiety). Questions render
one at a time on a single scrolling screen, building downward as each
is answered. Previous answers remain visible above — the profile takes
shape as the user progresses.

### Screen structure

**Single scrolling screen. Questions appear sequentially below previous answers.**

---

**Question 1 — appears on screen load:**
> *"First — what brings you to New Zealand?"*

Options (tap to select):
- Accredited Employer Work Visa (AEWV)
- Partner of Student Work Visa
- Green List Work Visa
- Green List Straight to Residence
- Other / Not sure

*On selection: answer locks in with a subtle checkmark. Q2 renders below.*

---

**Question 2 — renders below Q1 answer:**
> *"Which city are you arriving in?"*

Options:
- Auckland
- Wellington
- Christchurch
- Other

*On selection: answer locks in. Q3 renders below.*

---

**Question 3 — renders below Q2 answer:**
> *"Who are you settling in with?"*

Options:
- Arriving alone
- Couple — we both have independent work visas
- Couple — one of us is on a student or work visa, the other on a partner/dependent visa
- Family with dependent children

*Note: Situation-based language throughout — no visa jargon. User
recognises their situation in plain language without needing to know
the technical name of their visa category.*

*If "Couple — one of us on student/partner visa" selected:*
Follow-up question renders immediately below (inline, same screen):
> *"Just to confirm — is one of you the primary visa holder,
> with the other on a dependent or partner visa?"*
- Yes — that's us
- No — we both have independent visas

*This follow-up triggers the constrained couple roadmap —
single income assumption, visa interdependency awareness,
elevated job search urgency.*

*Note: This is static onboarding input only — the roadmap
is generated based on this answer at onboarding time.
Live dual-partner tracking (Karthik's term calendar, real-time
visa status monitoring) is explicitly post-MVP (v2).*

*On selection: answer locks in. Q4 renders below.*

---

**Question 4 — renders below Q3 answer:**
> *"What's your professional background?"*

Options:
- Technology / Engineering
- Healthcare (nurse, doctor, allied health)
- Education (teacher)
- Finance / Accounting
- Trades (electrician, plumber, builder)
- Other professional
- Still looking for work

*On selection: answer locks in. Q5 renders below.*

---

**Question 5 — renders below Q4 answer:**
> *"When are you arriving — or when did you arrive?"*

Options:
- I haven't arrived yet (date picker appears on selection)
- I arrived in the last 2 weeks
- I arrived 2–8 weeks ago
- I arrived more than 2 months ago

*On selection: answer locks in.*

---

**After Q5 answered — CTA appears below all answers:**

The user can scroll up and see their full profile:
visa type → city → family situation → occupation → arrival timing.
All visible. All editable by tapping any previous answer.

CTA button (full width):
> *"Build my plan →"*

*Tapping this transitions to the loading state.*

---

**Loading state (1.5–2 seconds):**
Replaces the onboarding screen.
Simple animation — subtle pulse or progress indicator.
Text centred on screen:
> *"Building your plan..."*

*This pause is psychological, not technical. The roadmap generates
instantly. The pause signals that something meaningful is being
created specifically for this user — not a pre-built result being
retrieved.*

After 1.5–2 seconds → transitions to Flow 3 (Roadmap Reveal).

### Account creation
Not prompted here. Account creation is deferred until after the user
has experienced the roadmap. Trust is earned before commitment is asked.
A prompt to save progress appears after the user has marked their
first task complete.

### What onboarding does NOT do
- Does not require email or account creation before showing roadmap
- Does not ask for payment information
- Does not collect sensitive personal data (name, passport, address)
- Does not connect to Immigration NZ or any government system
- Does not validate visa type against government records

---

## FLOW 3 — ROADMAP REVEAL

### What this flow must achieve
Deliver on the promise made at the entry point. In the first 5 seconds,
the screen must answer: Is this personalised for me? Where do I start?
How much is there? Can I trust this?

### Design decision: Priority-first reveal
Not all tasks visible immediately (triggers overwhelm — contradicts
product thesis). Not phase-gated (creates false linearity, contradicts
Section 4 progress tracker decision). Priority-first: "Do these first"
above the fold, full roadmap collapsed below.

### Screen structure

**Above the fold — "Do these first" section:**

Header:
> *"Do these first"*

Three task cards, stacked vertically. Each card shows:
- Task name (action-oriented — "Apply for your IRD number" not "IRD")
- Consequence line (one sentence — why this matters right now)
- Time estimate

For Priya (Partner of Student Work Visa, arrived today, Auckland):

Card 1:
> **Get a NZ SIM card**
> *You need a NZ number before you can open a bank account or receive
> IRD correspondence.*
> ⏱ 15 minutes

Card 2:
> **Open a bank account**
> *You need a bank account before you can pay a rental bond or receive
> your first paycheck. Some banks accept temporary accommodation address.*
> ⏱ 30–60 minutes

Card 3:
> **Apply for your IRD number**
> *Without this, your first paycheck is taxed at 45% emergency rate.
> On a single income, every week of delay costs $280–400.*
> ⏱ 15 minutes — processing takes 8–15 working days

*The consequence line on Card 3 is personalised to the constrained
couple situation — "on a single income" — because Priya selected
"Couple — one on student/partner visa" in onboarding.*

---

**Below the fold — collapsed full roadmap:**

Section header:
> *"Your full settlement plan"*

Three collapsed phase headers (name and timeline only — no task counts
on first reveal, no numbers to trigger anxiety):

```
▶  Phase 1 — Before you arrive
▶  Phase 2 — First 2 weeks
▶  Phase 3 — Weeks 3–8
```

Each header is tappable — expands to show tasks within that phase.
Tasks within expanded phases are shown as minimal rows:
task name + consequence line only. Full detail on tap (Flow 4).

**Task counts:** Hidden on first reveal. After the user begins
completing tasks, counts are replaced by progress indicators:
```
▶  Phase 2 — First 2 weeks     ●●●○○○○○  3 done
```
Progress is motivating. Volume is daunting. Show progress, not volume.

### What the roadmap reveal does NOT do
- Does not show all tasks immediately (overwhelm risk)
- Does not lock phases behind completion gates (contradicts Section 4 decision)
- Does not show task counts on first reveal
- Does not require account creation before showing roadmap

---

## FLOW 4 — TASK CARD INTERACTION

### What this flow must achieve
Convert reading into action. Handle all seven interaction states gracefully.
Feel fast on mobile. Support AI chat transition seamlessly. Never create a dead end.

### Design decision: Bottom sheet with two heights
Not accordion in-place (action button buried, visual noise from other tasks).
Not full-screen replacement (roadmap context lost, navigation friction).
Bottom sheet — slides up from bottom, covers ~75% of screen, current context
(roadmap) visible and dimmed behind.

Two heights:
- Half-open (default): consequence line + time estimate + three primary action buttons
- Full-open (scroll up within sheet): complete detail layer

### Seven interaction states

---

**State 1 → 2: Unstarted → Reading**

User taps any task card in the roadmap.
Bottom sheet slides up to half-height.

Half-height sheet content:
- Task name (large, bold)
- Consequence line (1–2 sentences, the hook)
- Time estimate
- Three action buttons (full width, stacked):
  1. *"Take action →"* (primary — opens government source)
  2. *"I've already done this"* (secondary — marks complete instantly)
  3. *"Ask a question about this"* (tertiary — opens AI chat)

User can scroll up within the sheet to reveal full detail layer.

---

**Full detail layer (scroll up from half-height):**
- Step-by-step instructions specific to user's situation
- Documents required
- Common mistakes and how to avoid them
- Processing time if applicable
- Cost if applicable
- Government source link (always present as authoritative reference)

---

**State 2 → 3: Reading → Acting**

User taps *"Take action →"*
Opens government source in external browser.
App moves to background.

*On return to app (user closes browser or switches back):*
Bottom sheet re-opens at half-height automatically.
"Mark as done" button is now the most prominent action.
The task card remembers the user left to act on it.

---

**State 3 → 4 → 5: Returned after acting → Complete**

User taps *"Mark as done"*

Completion micro-animation:
- Checkmark draws itself on the task card
- Task card gently slides to completed section (below active tasks)
- Bottom sheet closes
- Next task in roadmap highlights with a subtle pulse

The next task highlight answers the question Priya is always asking
after completing something: "what do I do next?" The product answers
proactively without her asking.

If the completed task was the last free task (Task 5 — GP registration):
Premium gate appears (Flow 5) instead of next task highlight.

---

**State 6: Already done (pre-LandedNZ)**

User taps a task they completed before finding LandedNZ.
Bottom sheet opens at half-height.
*"I've already done this"* button is the first option — above the fold,
before any guidance content.
One tap marks complete. No forced reading of guidance they don't need.
Completion micro-animation fires. Next task highlighted.

---

**State 7: Has a question**

User taps *"Ask a question about this"*
AI chat sheet slides up on top of task card sheet.
Two sheets stacked — task card dimmed behind chat.
AI chat opens pre-loaded with this task as context (Flow 6).

On dismissing chat sheet:
Returns to task card sheet exactly as left.
Action buttons still visible. User acts immediately on AI advice.

### What task card interaction does NOT do
- Does not verify task completion with government systems
- Does not penalise users for marking complete without actually completing
- Does not lock subsequent tasks behind completion of current task
- Does not close the roadmap or require navigation to return

---

## FLOW 5 — PREMIUM GATE

### What this flow must achieve
Convert the user at the moment of highest urgency and established trust —
after 5 free tasks delivered genuine value. Answer all five gate questions
simultaneously. Serve all three response types without punishing any of them.

### Design decision: Contextual inline gate with three response paths
Not a hard gate full-screen block (destroys trust built by free tier).
Not blurred content (dark pattern risk, doesn't answer value question).
Contextual gate card — inline in the roadmap, not a screen replacement.

### Trigger
User taps Task 6 (KiwiSaver election) — the first locked task.
OR user scrolls past Task 5 in the roadmap.

### Gate card structure (inline, between Task 5 and Task 6)

**Top — anchor to value delivered:**
Visual progress indicator — 5 filled dots or short progress bar.
> *"You've completed your 5 most critical tasks with LandedNZ."*

**Middle — specific preview of what's next:**
> *"Your next task: KiwiSaver election*
> *You've been auto-enrolled in a default fund. Most migrants don't
> realise this is a decision — and the wrong fund compounds against
> you for decades.*
> *This is task 6 of 21 in your plan."*

*"Task 6 of 21" signals scope without showing all 21 tasks.*

**Bottom — IRD math reframe + pricing:**
> *"One week of IRD emergency tax on a $65K salary = ~NZD $280 lost.*
> *Six months of LandedNZ Premium = NZD $49.*
> *The plan pays for itself the moment it prevents one mistake."*

Two pricing buttons (full width, stacked):
> *[Unlock for NZD $9.99/month]*
> *[Get 6 months for NZD $49 — save 18%]*

Two exit options (smaller text links below buttons):
> *Remind me later*
> *Continue with free plan*

---

### Response Path 1 — Immediate upgrade

User taps either pricing button.
Standard payment flow (Apple Pay / Google Pay / card).
On completion:
- Gate card disappears from roadmap
- Full roadmap unlocks — all 21 tasks visible
- Task 6 (KiwiSaver) highlights with subtle pulse
- Brief banner at top of roadmap:
  > *"Your full plan is unlocked — here's what's next."*
- Premium features (AI chat, smart reminders) activate immediately

---

### Response Path 2 — Defer ("Remind me later")

User taps *"Remind me later"*

Three things happen:
1. Gate card dismisses for this session — user returns to roadmap,
   free tasks fully accessible, no gate re-appearing today
2. Smart reminder email scheduled for 24 hours later:
   Subject: *"Your KiwiSaver default — this is worth 5 minutes"*
   Body: 3 sentences — consequence, time to act, single link back to gate
3. On next app open: gate reappears with contextual acknowledgment:
   > *"Yesterday we mentioned your KiwiSaver default. Here's why it matters today."*
   Same gate card structure — task preview updated to most urgent pending task.

---

### Response Path 3 — Decline ("Continue with free plan")

User taps *"Continue with free plan"*

Two things happen:
1. User returns to roadmap — free tasks fully accessible, no punishment,
   no resentment-triggering consequences
2. Gate card collapses to minimal persistent banner at bottom of
   free task section:
   > *"Full 21-task plan available — unlock anytime"*
   Small upgrade icon. Always visible. Never intrusive.
   Tapping the banner reopens the full gate card.

*Goodwill preserved. A user who declines and feels respected
refers others. A user who declines and feels trapped does not.*

### What the premium gate does NOT do
- Does not block access to completed task history
- Does not remove free tier access
- Does not use blurred content (dark pattern risk)
- Does not guilt the user about not upgrading
- Does not require credit card before showing gate

---

## FLOW 6 — AI CHAT INTERACTION

### What this flow must achieve
Feel like a knowledgeable friend who already knows Priya's situation —
not a chatbot, not a support widget. Every entry point must open with
context awareness. Every answer must connect back to action.

### Scope: Narrow — settlement tasks only (MVP)
The AI answers questions directly related to NZ settlement tasks:
IRD, KiwiSaver, tenancy rights, GP registration, driving licence,
NZQA qualification assessment, remittances, NZ CV format, ACC basics,
NZ workplace culture, school zones (for families).
It does not answer questions outside this scope — out-of-scope questions
receive an honest redirect to the appropriate resource.
Upgrade path to contextual (roadmap-aware) scope is post-MVP.

### Design decision: Contextual sheet (entry-point aware)
Not standalone screen (severs context, signals separation from roadmap).
Not persistent bottom bar (wrong visual hierarchy, screen real estate collision).
Contextual sheet — slides up over current view, pre-loaded with context
specific to how it was opened.

### Four entry points

---

**Entry Point 1 — From task card**

User taps *"Ask a question about this"* in task card sheet.
AI chat sheet slides up on top of task card sheet.
Two sheets stacked — task card visible and dimmed behind chat.

AI opening message (pre-loaded with task context + user profile):
> *"You're looking at the KiwiSaver election task. I know you're
> on a single income right now with your partner studying —
> what would you like to know?"*

*The AI already knows the task and the user's situation.
Priya does not need to explain anything. She just asks.*

On dismissing chat sheet:
Swipe down or tap behind sheet.
Returns to task card sheet exactly as left.
Action buttons still visible — act immediately on AI advice.

---

**Entry Point 2 — From roadmap**

Floating action button — subtle chat icon, bottom right of roadmap screen.
Tapping slides up chat sheet over roadmap.

AI opening message (profile context + completion state):
> *"Hi Priya — you've completed 7 tasks so far.
> What would you like to know about settling in Auckland?"*

*Uses completion state as proxy for continuity —
feels like the advisor has been paying attention.*

On dismissing: roadmap returns, same scroll position preserved.

---

**Entry Point 3 — From smart reminder email**

Email contains deep link → tapping opens app directly to chat sheet.
Chat pre-loaded with the task from the email.
Same experience as Entry Point 1 — task context pre-loaded.

---

**Entry Point 4 — From navigation**

User navigates to chat deliberately from bottom navigation bar.
Same experience as Entry Point 2 — profile context, completion state.

---

### Conversation design

**Every AI opening message is specific — never generic:**

Wrong: *"Hi! How can I help you today?"*
Right: *"You're looking at the KiwiSaver task. I know you're on
a single income right now — what would you like to know?"*

The specific opening signals context awareness and sets the expectation
that answers will be personalised to Priya's situation.

---

**Every answer ends with source link + next action offer:**

Example answer to "Should I opt out of KiwiSaver in Year 1?":
> *"Given you're on one income right now, opting out in Year 1
> is worth considering — it preserves cash flow while you stabilise.
> You can always re-enrol later. Here's the official IRD guidance
> on opting out: [link]. Would you like me to update your KiwiSaver
> task card with this approach?"*

Source link answers "can I trust this?"
Next action offer connects advice back to the roadmap.

---

**Out-of-scope handling — warm redirect, not hard block:**

Wrong: *"I can only answer NZ settlement questions."*

Right (career question example):
> *"Career decisions are outside what I can reliably guide you on —
> but Careers NZ (careers.govt.nz) is built exactly for this.
> Once you've decided, come back and I'll walk you through the
> employment setup steps for your visa."*

Four explicit out-of-scope categories:

| Category | Redirect |
|---|---|
| Immigration legal advice | Licensed Immigration Adviser — immigration.govt.nz/find-an-adviser |
| Employment law / disputes | Employment NZ or Citizens Advice Bureau |
| Medical advice | Healthline — 0800 611 116 (free, 24/7) |
| Financial investment advice | Sorted.org.nz |

---

**Session memory — completion state as proxy for continuity:**

The AI does not retain conversation history across sessions (MVP scope).
On return, it uses completion state to signal awareness:
> *"You've completed 7 tasks including KiwiSaver election.
> What's on your mind?"*

Not pretending to remember a conversation.
Genuinely reading the user's actual progress.
Feels like continuity without being dishonest about limitations.

---

### What AI chat does NOT do
- Does not provide immigration advice or interpret visa conditions
- Does not answer medical questions beyond directing to Healthline
- Does not retain conversation history across sessions (MVP)
- Does not connect to live government systems
- Does not guarantee accuracy — every response includes source link

---

## FLOW 7 — RETURNING USER (DAY 3+)

### What this flow must achieve
Make Priya feel the product has been paying attention since she left.
Surface what matters right now — not what she was looking at when
she last closed the app. Never generic. Always specific to her state.

### Design decision: Context-aware scenario detection
Not resume-where-left-off (ignores time cost, presents stale roadmap).
Not always-top-of-roadmap (not intelligent enough, fails email entry).
Three scenarios detected on every app open — different opening experience
for each.

### Scenario detection logic

```
On app open (after first session):

Signal 1: Entry point
→ Deep link from email? → Scenario 3
→ Direct open? → check Signal 2

Signal 2: Time since last session + completion activity
→ Last session within 3 days + recent task completions? → Scenario 1
→ Last session 5–10 days ago, lower activity? → Scenario 2
```

---

### Scenario 1 — Active returner (last session within 3 days)

Roadmap opens.
Contextual banner above "Do these first" section:
> *"Welcome back — you completed 3 tasks last time.
> Here's what's next."*

"Do these first" section updated to current top 3 — reflecting
tasks completed in last session. Completed tasks no longer appear.
New tasks have moved up to replace them.

*Minimal intervention. Active returner knows the product.
Just needs orientation to current state.*

---

### Scenario 2 — Checking-in returner (last session 5–10 days ago)

Roadmap opens.
Status check card above "Do these first" section:

> *"It's been 6 days since your last visit.*
> *Your IRD application should arrive this week — check your email.*
> *2 tasks are waiting for you when you're ready."*

*"2 tasks waiting"* is tappable — navigates directly to those tasks
in the roadmap. Highlighted with subtle pulse on arrival.

*The IRD processing window mention (8–15 working days from application)
is a proactive status update — the product doing work for Priya between
sessions. This is advisor behaviour, not app behaviour.*

---

### Scenario 3 — Prompted returner (entry via email deep link)

Specific task card from the email opens immediately in bottom sheet.
No roadmap shown first.

Brief contextual line above the task card:
> *"You came from your KiwiSaver reminder. Here's everything you need."*

Action button prominent at half-height — act immediately on the
reason she came. Zero navigation friction between email tap and task action.

After dismissing task card:
Roadmap shown in standard state. No special banner. Normal flow resumes.

---

### Tone across all returning scenarios
- Never guilt language ("you haven't been back in X days")
- Never volume language ("you have 8 incomplete tasks")
- Always specific to her actual situation
- Always one clear next action

---

## FLOW 8 — LAPSED USER RE-ENTRY (10+ DAYS ABSENT)

### What this flow must achieve
Dissolve the anxiety of returning after absence without creating guilt.
Surface specifically what may have been missed — not everything, just
the highest-consequence items. Give one clear starting point, not a list.

### The lapsed user's emotional state
"Is it too late? Have I missed something important? Where do I even
start after all this time?"
Anxiety mixed with inertia. The re-entry flow must dissolve both.

### Design decision: Triage re-entry
Not standard re-entry (ignores time cost, presents stale roadmap).
Not re-onboarding (punishment disguised as helpfulness, friction at
worst possible moment).
Triage screen — honest, specific, maximum two findings,
one starting point.

### Smart reminder email (precedes re-entry)

The re-entry flow begins before the user opens the app.
Smart reminder email fires when lapse flag is set (10+ days absent):

Subject line — specific, consequence-led, no guilt:
Wrong: *"You haven't been back to LandedNZ in 14 days"*
Right: *"Your IRD number should have arrived by now — have you submitted your tax code?"*

Email body (3 sentences maximum):
> *"If your IRD number arrived and you haven't submitted your tax
> code declaration to your employer, you may still be on 45%
> emergency tax.*
> *This takes 5 minutes to fix.*
> *[Open LandedNZ to check →]*"

Deep link opens app directly to triage re-entry screen.

---

### Triage re-entry screen

**Top — time-aware acknowledgment (no guilt):**
> *"You've been away for a while — that's okay.*
> *A lot happens in settlement. Let's see where things stand."*

**Middle — triage results:**

Triage algorithm runs on app open:
- Checks all incomplete tasks against arrival date
- Ranks by financial consequence (IRD emergency tax → KiwiSaver → rental rights → licence)
- Surfaces maximum 2 findings

*If overdue high-consequence tasks found:*
> *"Here's what we noticed:"*
>
> *⚠️ Tax code declaration — your IRD number should have arrived
> by now. If you haven't submitted your tax code to your employer,
> you may still be on emergency tax.*
>
> *⚠️ KiwiSaver election — you were auto-enrolled 3 weeks ago.
> The default fund may not suit your situation.*

*If no overdue high-consequence tasks:*
> *"You're in good shape — your critical tasks are done.*
> *Here's what's next when you're ready."*
→ Opens directly to standard roadmap. No anxiety created where none warranted.

**Bottom — single clear action (if findings exist):**
> *"Start with the most important one →"*

Single button. No list. No choice paralysis.
Opens highest-consequence incomplete task in bottom sheet (Flow 4).
User acts or marks complete.
Dismiss → standard roadmap. Normal flow resumes.

---

### Tone across lapsed re-entry
- Never: "you missed X tasks" (guilt + volume)
- Never: "you haven't been back in X days" (guilt)
- Always: specific task + specific consequence
- Always: one next action, never a list
- Always: acknowledgment without judgment

---

## FLOW INTERACTION MAP

How all flows connect:

```
FLOW 1 — Entry Point
    → "Build my plan" → FLOW 2 (Onboarding)
    → "Skip" → FLOW 2 (Onboarding Q1)

FLOW 2 — Onboarding
    → "Build my plan" → Loading state → FLOW 3 (Roadmap Reveal)

FLOW 3 — Roadmap Reveal
    → Tap task card → FLOW 4 (Task Card Interaction)
    → Tap phase header → Expands tasks within phase → FLOW 4

FLOW 4 — Task Card Interaction
    → "Take action" → External browser → Returns to task card sheet
    → "Mark as done" → Completion animation → Next task highlighted
    → If Task 5 completed → FLOW 5 (Premium Gate)
    → "Ask a question" → FLOW 6 (AI Chat) → Returns to task card
    → "I've already done this" → Completion → Next task highlighted

FLOW 5 — Premium Gate
    → Upgrade → Full roadmap unlocked → Returns to FLOW 3/4
    → "Remind me later" → Session dismissed → 24hr email → FLOW 5 next open
    → "Continue with free plan" → Returns to FLOW 3, persistent banner

FLOW 6 — AI Chat
    → Entry Point 1 (task card) → Returns to task card sheet (FLOW 4)
    → Entry Point 2 (roadmap) → Returns to roadmap (FLOW 3)
    → Entry Point 3 (email) → Deep link → chat → roadmap (FLOW 3)
    → Entry Point 4 (navigation) → Returns to roadmap (FLOW 3)

FLOW 7 — Returning User
    → Scenario 1 → Standard roadmap (FLOW 3) with contextual banner
    → Scenario 2 → Standard roadmap with status check card
    → Scenario 3 → Specific task card (FLOW 4) → Roadmap (FLOW 3)

FLOW 8 — Lapsed User Re-entry
    → Email → Deep link → Triage screen
    → Findings found → Task card (FLOW 4) → Roadmap (FLOW 3)
    → No findings → Standard roadmap (FLOW 3)
```

---

## DESIGN PRINCIPLES ACROSS ALL FLOWS

These principles apply to every flow and every screen:

**1. Sequencing over information**
Every screen answers "what do I do next?" before the user has to ask.
Never show everything — show what matters now.

**2. Consequence before instruction**
Every task, every prompt, every gate component leads with the cost
of not acting — not the steps to act. Stakes first. Instructions second.

**3. One action per screen moment**
At every decision point, one action is primary. Supporting actions
are available but do not compete visually. The product makes the
decision for the user wherever possible.

**4. Advisor tone, not app tone**
Every message — entry point, onboarding questions, AI chat, gate,
reminders — is written as a knowledgeable friend checking in.
Never corporate. Never generic. Never guilt-laden.

**5. No dead ends**
Every flow has a clear exit that returns the user to a known state.
Task card → roadmap. Chat → task card. Gate → roadmap.
The user is never stranded.

**6. Mobile-first, thumb-reachable**
Primary action buttons are always full-width at the bottom of the
screen — within thumb reach. Secondary actions above. No two-handed
interactions required for primary tasks.

---

## DECISIONS LOG — USER FLOWS

| Decision | What | Why |
|---|---|---|
| Entry point approach | Empathy-first content + Auckland landmark visual + progressive text reveal | Generic sample roadmap contradicts personalisation thesis; form-first asks before earning right to ask; empathy-first earns trust before asking anything |
| Entry point visual | Auckland landmark (Sky Tower / harbour) | Specific location signals "built for NZ migrants" instantly — generic stock photos signal generic product |
| Skip option | Top right, visible from start | Returning users and repeat visitors should not be forced through full entry sequence |
| Onboarding structure | Questions build downward on single screen | Previous answers visible = profile ownership before roadmap appears; wizard pattern loses context between screens |
| Onboarding language | Situation-based, no visa jargon | Visa terminology causes drop-off; plain language recognition is more reliable |
| Couple follow-up | Inline on same screen, single yes/no | Natural continuation of conversation; no extra screen navigation required |
| Loading transition | 1.5–2 seconds psychological pause | Signals personalisation — not an instant retrieval of a pre-built result |
| Account creation timing | Deferred until after first task complete | Trust earned before commitment asked — standard high-converting consumer pattern |
| Roadmap reveal | Priority-first — "Do these first" (3 tasks) above fold | Answers all 4 first-impression questions simultaneously; 3 tasks = cognitive sweet spot |
| Task counts | Hidden on first reveal | Numbers trigger overwhelm; replace with progress indicators after completion starts |
| Phase headers | Collapsed, name and timeline only | Depth available without forcing it; full roadmap accessible, never locked |
| Task card interaction | Bottom sheet, two heights | Context preservation (roadmap visible behind); modern native mobile pattern; all 7 states served efficiently |
| Completion moment | Micro-animation + next task highlighted | Positive reinforcement + answers "what next?" proactively |
| Premium gate type | Contextual inline card — not full screen block | Inline preserves roadmap context; hard block destroys trust built by free tier |
| Gate response paths | Three explicit paths (upgrade, defer, decline) | 95%+ of users at gate are Response 2 or 3 — designing only for Response 1 loses them permanently |
| Defer path | 24hr specific task email + contextual return | Specific email converts at fundamentally different rate than generic re-engagement email |
| Decline path | Graceful exit + minimal persistent banner | Goodwill preserved; declined users refer others when treated with respect |
| AI chat interaction | Contextual sheet, entry-point aware | Context preservation; correct visual hierarchy (roadmap primary, AI supporting); seamless task card layering |
| AI chat opening | Specific per entry point — task context or completion state | Generic "how can I help?" signals no awareness of user situation — destroys premium value proposition |
| AI session memory | Completion state as proxy for continuity | Honest about MVP limitation; completion state genuinely signals awareness without fabricating conversation memory |
| Returning user flow | Three scenarios detected — active, checking-in, prompted | Each scenario has different needs; generic return experience serves none of them well |
| Lapsed user flow | Triage screen — max 2 findings, one starting point | Dissolves anxiety without guilt; consequence-led findings are action triggers; volume is overwhelm trigger |
| Lapsed email subject | Specific task + consequence, no guilt language | Specific emails convert; guilt emails churn |
| Tone across all flows | Advisor — knowledgeable friend, never corporate | Product thesis is personal advisor encoded in software — tone must match at every touchpoint |

---

*Next document: 09-ai-design.md*
*Section 6 takes the AI behaviour defined across these flows and specifies
the technical design — the prompt architecture, context management,
guardrail implementation, and the rule-based dependency graph structure
that powers the roadmap engine.*
