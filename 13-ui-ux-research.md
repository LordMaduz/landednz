# 13 — UI/UX Research: Reference App Analysis
*Written: March 2026*
*Purpose: Analyse 7 reference sources (4 with screenshots, 3 from product knowledge) to extract design patterns, anti-patterns, and visual direction for LandedNZ web app. Feeds directly into 14-ui-ux-design.md.*

---

## REFERENCE APP ANALYSIS

---

## GROUP A — SETTLY (Canada) — Direct Product Analogue

### What Settly Is
AI-powered newcomer settlement companion for Canada. Mobile-first. Checklist-based settlement guidance with task cards, progress tracking, and achievement system. The closest existing product to what LandedNZ is building — same problem domain, same user profile, different country.

### What Settly Does Exceptionally Well

**1. Dashboard hierarchy is immediately clear**
The dashboard opens with a dark hero card showing "Your First 30 Days in Canada" with a circular progress indicator (0% completed, 0 in progress, 11 remaining). Below this sits a single "NEXT STEP" card — one task, not a list of tasks. This answers the user's first question ("what do I do first?") before they scroll. LandedNZ's roadmap reveal should adopt this exact pattern: hero card with progress, then a single prioritised next action.

**2. Task card information architecture is layered correctly**
The checklist view shows task cards with three visible elements: task name, one-line description (truncated), and time estimate ("Usually takes 5 minutes" / "Usually takes 30-60 minutes"). The time estimate is a trust signal — it tells the user the task is bounded and achievable. The "Medium" / "Hard" / "Easy" difficulty badges on task detail views add a second dimension. LandedNZ should adopt time estimates on task list cards and difficulty indicators on task detail views.

**3. Task detail view is deeply structured**
Opening a task (e.g., "Open a Bank Account") reveals a rich layout: "Why This Matters Now" callout (yellow background, consequence-led), numbered step-by-step guide ("How This Works"), documents needed section with required/optional distinction, official website link with external icon, bank selection with institution-specific advice, "Helpful Tips" collapsible section, personal notes field, and reminder toggle. This is a comprehensive task card. LandedNZ's task detail design should match or exceed this depth.

**4. "Why This Matters Now" pattern is exactly right**
The yellow callout box with "Why This Matters Now" on the bank account task ("You need a bank account to receive paychecks, pay rent, and build your Canadian credit history. Most employers require direct deposit.") is the consequence-first pattern that LandedNZ's product thesis demands. This is the single most important UI pattern to adopt — the consequence callout must be the first thing a user sees when opening any task.

**5. Institution selection within tasks**
The "Choose your bank" section inside the bank account task shows Canadian banks (RBC, TD Canada Trust, Scotiabank) with institution-specific one-liners ("Newcomer packages available", "No-fee accounts for newcomers", "StartRight Program"). This is highly actionable — the user doesn't just learn what to do, they learn which specific institution to choose and why. LandedNZ should replicate this for NZ banks, telcos, and KiwiSaver providers.

**6. Status filter tabs are clean**
The checklist view has four filter tabs: All Steps, To Do, In Progress, Done. Simple, clear, standard. No reinvention needed. LandedNZ should adopt this exact pattern for the web roadmap view.

### What Settly Does Poorly — What LandedNZ Must Avoid

**1. No visible sequencing or dependency logic**
Settly presents tasks as a flat checklist with no visual indication of dependencies. "Confirm Your Arrival Details" sits above "Get a Canadian Phone Number" sits above "Apply for Social Insurance Number" — but there's no visual cue that SIN requires a bank account which requires a phone number. The tasks look independent when they are not. This is the single biggest gap LandedNZ can exploit. The dependency chain must be visually explicit — either through numbered sequencing, connector lines between cards, or a clear "blocked by" indicator on dependent tasks.

**2. Achievement system feels bolted on, not integrated**
The Progress tab shows "Your Achievement Journey" with locked badges (Helpful Neighbor, Explorer, Career Hunter, Week Warrior, Job Seeker, Settlement Master). Points, Day Streak, and Achievements counters sit at the top. This feels like a Duolingo copy applied to a fundamentally different domain. Settlement tasks are not language lessons — completing your IRD application is not a "fun challenge." Gamification in settlement must be subtle (progress percentage, phase completion celebration) not explicit (points, streaks, badges). LandedNZ should avoid achievements, points, and streaks entirely. A migrant completing their tax code declaration does not need a badge. They need reassurance that they did it right.

**3. The onboarding is a form, not a conversation**
The "Confirm Your Arrival Details" task is presented as a standard form: Province/Territory dropdown, City text input, Arrival Date date picker, Immigration Status dropdown, "Save & Continue" button. This is functional but clinical. Compare to Duolingo's conversational one-question-per-screen with mascot and speech bubbles — it feels guided and warm. LandedNZ's onboarding must feel like a conversation, not a government form.

**4. Translation icon is prominent but confusing**
The language/translate icon (文A) appears in the header of every screen. For a settlement app, multilingual support is valuable — but the icon placement and design make it look like a core navigation element rather than an accessibility feature. LandedNZ should support language options but through settings, not a persistent header icon.

**5. Privacy disclaimers are repetitive and anxiety-inducing**
"We do not collect or store your personal documents. Always submit documents directly to official government websites." appears in yellow boxes on multiple screens. Once is trust-building. Three times across different views is anxiety-inducing — it makes the user wonder why the app keeps insisting it doesn't collect data. LandedNZ should state this once during onboarding and once in settings. Never repeat it on task cards.

### Patterns to Adopt from Settly
- **Priority-first dashboard**: Hero progress card + single "NEXT STEP" card above fold
- **Consequence callout**: Yellow/warm-toned "Why This Matters Now" box as first element in task detail
- **Time estimates on task cards**: "Usually takes X minutes" as a trust signal
- **Institution-specific guidance**: Bank/telco selection with NZ-specific recommendations inside task cards
- **Status filter tabs**: All / To Do / In Progress / Done
- **Documents needed section**: Required vs. optional distinction with clear document names
- **Official website link**: Prominent external link with clear "Go to [Official Site]" CTA

### Patterns to Reject from Settly
- **Flat checklist without dependency indicators**: Must show sequencing visually
- **Gamification (achievements, points, streaks)**: Wrong emotional register for settlement
- **Form-style onboarding**: Must feel conversational, not clinical
- **Repeated privacy disclaimers**: State once, not on every task card
- **Bottom tab bar with 4 equal tabs**: Web app uses sidebar — dashboard and checklist should be unified, not separate

---

## GROUP B — NOTION — Onboarding Reference

### What Notion Is
All-in-one workspace for notes, docs, projects, and wikis. Desktop-web-first with mobile apps. Referenced here for its onboarding flow and workspace reveal pattern.

### What Notion Does Exceptionally Well

**1. Personalisation question is one-per-screen with large tap targets**
The "How do you want to use Notion?" screen shows three options (For work, For personal life, For school), each as a full-width card with icon, title, and one-line description. Large tap targets, no scrolling needed, clear visual differentiation between options. This maps perfectly to LandedNZ's visa type and family situation questions — each option should be a full-width card with an icon and a description line, not a radio button or dropdown.

**2. Progressive reveal — sidebar loads behind onboarding**
During the "Who else is on your team?" step, the left sidebar is visible but blurred/skeleton — the workspace is being built in real time as the user answers questions. This is a powerful pattern: the user sees their environment taking shape before they're dropped into it. LandedNZ should show a skeleton roadmap behind the onboarding overlay — the roadmap progressively reveals as questions are answered.

**3. Team invite is skippable and low-pressure**
The "Who else is on your team?" screen presents three email input fields with "Continue" as the primary CTA. It doesn't force invites — the user can skip. For LandedNZ, the equivalent is the "couple" follow-up question — it should be equally low-pressure and skippable if the user isn't ready to provide partner details.

**4. Home screen surfaces next actions without overwhelming**
The Notion home screen shows "Good evening" greeting, recently visited pages, a "Learn" section with tutorial cards, and upcoming events. The learn section is contextual (new user gets basics, experienced user gets advanced). LandedNZ's post-onboarding dashboard should follow this: greeting + next task + recently viewed tasks + helpful resources section.

**5. Left sidebar navigation is clean and hierarchical**
Sidebar sections: Search, Home, Meetings, Notion AI, Inbox, Library, then Private pages, then Teamspaces. Clear hierarchy. Active state is highlighted. Collapsible sections. This is the exact navigation pattern for LandedNZ web: Roadmap (home), Chat, Settings as primary nav items, with the roadmap phases as collapsible subsections.

### What Notion Does Poorly for LandedNZ's Context

**1. Too many onboarding steps before value**
Notion's flow: sign up → Google OAuth → use case selection → team invite → workspace reveal. That's 4-5 steps before seeing any content. LandedNZ must hit value faster — the roadmap should be visible (even as skeleton) from question 1.

**2. Dark theme is wrong for settlement context**
Notion's dark mode (shown in screenshots) feels professional and productivity-oriented. LandedNZ's emotional register requires light, warm tones — dark themes feel technical and cold for an anxiety-reducing settlement companion.

**3. AI chat is a separate navigation item, not contextual**
Notion AI is a separate sidebar item with its own full-page interface. For LandedNZ, the AI chat must be contextual — accessible from within task cards and the roadmap, not a separate destination.

### Patterns to Adopt from Notion
- **One-question-per-screen with large card options**: Each onboarding option as a full-width card with icon and description
- **Progressive workspace reveal**: Skeleton sidebar/roadmap visible behind onboarding overlay
- **Hierarchical left sidebar navigation**: Primary nav items at top, collapsible sections below
- **Home screen with contextual greeting + next action**: "Good morning, Priya" + your next task
- **Learn/resources section**: Tutorial cards for new users, helpful resources for returning users

### Patterns to Reject from Notion
- **Dark theme default**: Light, warm theme is non-negotiable for settlement context
- **AI as separate nav destination**: Chat must be contextual, not a standalone page
- **Multi-step onboarding before value**: Roadmap skeleton should be visible from step 1
- **Invite-others step**: Not relevant for individual/couple settlement tool at MVP

---

## GROUP C — LINEAR — Task List and Dashboard Reference

### What Linear Is
Issue tracking and project management tool for software teams. Desktop-web-first. Referenced here for its task list layout, sidebar navigation, empty states, and minimal aesthetic.

### What Linear Does Exceptionally Well

**1. Task list density is exactly right for web**
The issues list view shows: issue ID (TES-1), status circle indicator, task title, assignee, and date — all in a single row. No descriptions, no icons, no excess metadata on the list row. Clean, scannable, dense without being cramped. For LandedNZ web, the roadmap task list should achieve similar density: status indicator, task name, consequence one-liner (Settly's description line), and phase badge — all in a single row.

**2. Status indicators are minimal and effective**
Linear uses small coloured circles with different fills for status: empty circle (Todo), half-filled (In Progress), filled with check (Done). No text labels needed on the list row. LandedNZ should adapt this: empty circle (not_started), half-fill or progress indicator (in_progress), green check (complete), lock icon (premium_locked), warning icon (blocked), skeleton (loading), red circle (error).

**3. Side panel for task detail preserves list context**
Clicking an issue opens a right panel with full detail (title, description, properties, labels, project) while the task list remains visible on the left. This two-panel layout is ideal for LandedNZ web: roadmap task list on the left (always visible), task detail panel on the right (opens on click). The user never loses context of where they are in the roadmap.

**4. Properties panel is structured and scannable**
The right panel shows Properties (status, priority, assignee), Labels, and Project as distinct sections with clear headers. For LandedNZ task detail, this maps to: Status, Phase, Time Estimate, Documents Needed, and Source Links as distinct property sections.

**5. Empty states are clear and action-oriented**
"My issues" with no assigned issues shows a centered illustration, "No issues assigned to you" text, and a "Create new issue" CTA button. Clean, no wasted space, clear next action. LandedNZ's empty states should follow: centered message + single CTA.

**6. Onboarding is minimal — gets to product fast**
Linear's onboarding: welcome → theme selection → workspace creation → team invite → subscribe to updates → product. The theme and subscribe steps are skippable. Total time to first interaction: under 60 seconds. LandedNZ should aim for similar speed — 5 questions in under 2 minutes, then roadmap.

**7. Left sidebar hierarchy is production-grade**
Sidebar sections: Inbox, My issues, then Workspace (Projects, Views, More), then Your teams (team name → Issues, Projects, Views), then Try (Import, Invite, Connect). Clear grouping with collapsible sections and section headers. This is a mature sidebar pattern that LandedNZ should reference — but simplified: Roadmap (primary), Chat, Settings, then phase sections within Roadmap.

### What Linear Does Poorly for LandedNZ's Context

**1. No emotional warmth whatsoever**
Linear's design is deliberately cold — it's a tool for engineers. Dark backgrounds, monospace fonts for IDs, minimal colour. LandedNZ cannot be this clinical. The skeleton of Linear's layout is right; the emotional register is wrong.

**2. Technical metadata that doesn't translate**
Issue IDs (TES-1), assignee avatars, priority dots, label tags — these are engineering concepts. LandedNZ's task list metadata should be: phase badge, time estimate, status indicator, and consequence preview — all in human language, no codes.

**3. No guidance or context for new users**
The "Get familiar with Linear" welcome issue is a single card with a video. There's no progressive tutorial, no contextual help, no onboarding wizard for the main interface. LandedNZ's first-time roadmap view must include contextual hints — "This is your first task. Tap to see what to do." — that disappear after first interaction.

### Patterns to Adopt from Linear
- **Two-panel layout**: Task list left, task detail right on desktop
- **Single-row task cards**: Status indicator + title + metadata in one scannable row
- **Minimal status indicators**: Small coloured icons for each state, no text labels in list view
- **Right panel for detail**: Opens on click, list remains visible, preserves context
- **Clean empty states**: Centered illustration + message + single CTA
- **Hierarchical sidebar**: Collapsible sections, clear grouping, active state highlighting

### Patterns to Reject from Linear
- **Cold aesthetic**: No dark theme, no monospace, no engineering-tool feeling
- **Technical metadata**: No IDs, no priority dots, no label tags — human language only
- **No onboarding guidance in main UI**: Must have contextual first-use hints

---

## GROUP D — INTERCOM FIN CHAT — AI Chat Reference

### What Intercom Fin Is
AI-powered customer support chatbot embedded in Intercom's product. Slide-in panel from bottom-right corner. Referenced here for chat layout, streaming text, conversation threading, and AI response patterns.

### What Intercom Fin Does Exceptionally Well

**1. Context-aware opening message**
Fin's first message: "Hey there! I'm Fin, an AI assistant here at Intercom. I noticed you were checking out our sign-up page — what brings you to Intercom today?" This is entry-point-aware — it references where the user came from. LandedNZ's chat must do exactly this: "You're looking at the IRD application — what would you like to know?" from a task card, or "Hi Priya — you've completed 3 tasks. What's your next question?" from the roadmap.

**2. Thinking indicator is honest and visible**
The three-dot typing indicator ("...") appears while Fin processes a question. The user knows the AI is working. No false instant responses. LandedNZ's chat should show a similar thinking state — but enhanced with a brief status message: "Checking NZ settlement guidance..." or "Looking up IRD information..."

**3. Inline links in responses are natural**
Fin's response to "how pricing work?" includes inline hyperlinks: "Here's our pricing page where you can explore all the options: https://www.intercom.com/pricing" and "You can also use our pricing calculator to estimate costs based on your specific needs: https://www.intercom.com/pricing/calculator". Links are embedded in natural sentences, not appended as a footnote list. LandedNZ should embed source links inline within the response text, plus a dedicated "Source" footer with the official government link.

**4. Follow-up questions flow naturally**
The conversation thread shows: user message → Fin response → user follow-up → Fin response. Each turn renders cleanly in the same panel without page reload. The "Message..." input stays at the bottom throughout. LandedNZ's chat must support this same conversational threading within a session.

**5. "The team can also help" subtitle is a trust signal**
Below "Fin" in the header, "The team can also help" signals that a human escalation path exists. For LandedNZ, the equivalent is: "For immigration or legal questions, we'll point you to the right professional." This sets scope expectations from the start.

**6. Agent label builds transparency**
"Fin · AI Agent · Just now" appears below each AI response. This is honest attribution — the user knows they're talking to AI, not a human. LandedNZ should similarly label responses: "LandedNZ · AI Advisor · Based on official NZ sources"

### What Intercom Fin Does Poorly for LandedNZ's Context

**1. Chat panel is too narrow for detailed settlement guidance**
Fin's slide-in panel is approximately 320px wide. Settlement guidance often requires step-by-step instructions, document lists, and comparison tables. LandedNZ's chat panel on web should be wider — at least 400px, ideally 480px — or offer a full-page chat view for complex responses.

**2. No citation structure**
Fin provides links but no structured citations. "Here's our pricing page" is not the same as "Source: IRD.govt.nz — Tax code declaration form (IR330)". LandedNZ's AI responses must always end with a structured citation footer — source name, specific page, and clickable URL.

**3. No response structure beyond paragraphs**
Fin's responses are flowing text paragraphs with inline links. For settlement guidance, structured responses are often clearer: numbered steps, document lists, or comparison tables. LandedNZ's chat should support rich formatting in AI responses — numbered steps, bold key terms, and document lists — not just flowing text.

### Patterns to Adopt from Intercom Fin
- **Entry-point-aware opening message**: Reference where the user came from
- **Thinking indicator with status**: Three dots + brief "Checking..." message
- **Inline links in natural sentences**: Source links embedded in response text
- **Conversational threading**: User → AI → User → AI in same panel
- **Agent label for transparency**: "AI Advisor · Based on official NZ sources"
- **Human escalation signal**: "For immigration questions, we'll point you to a professional"

### Patterns to Reject from Intercom Fin
- **Narrow panel width**: Must be wider for settlement content (400-480px minimum)
- **Unstructured responses**: Must support numbered steps, document lists, and bold terms
- **No structured citations**: Must have formal source footer on every response

---

## GROUP E — DUOLINGO — Progress and Onboarding Reference

### What Duolingo Is
Language learning app. Mobile-first. Referenced here for its conversational onboarding pattern, progress indicators, premium gate design, and mascot-guided UX.

### What Duolingo Does Exceptionally Well

**1. Mascot-guided conversational onboarding is the gold standard**
Every onboarding question is presented as a speech bubble from the Duo owl mascot: "What would you like to learn?", "How much English do you know?", "Why are you learning English?", "What's your daily learning goal?". One question per screen. Progress bar at top. Large card options below. "CONTINUE" button pinned at bottom. This pattern makes a data collection flow feel like a conversation with a friendly guide. LandedNZ should adapt this pattern — not with a mascot (wrong tone for professional settlement), but with a conversational question format: speech-bubble-styled question text, one question visible at a time, large card options, persistent "Continue" button.

**2. Progress bar communicates where you are**
The green progress bar at the top of every onboarding screen fills incrementally as questions are completed. The user always knows how far through the process they are. LandedNZ must have a progress indicator during onboarding — either a progress bar or step counter ("2 of 5").

**3. Premium gate is presented as a choice, not a wall**
The "How do you want to get started?" screen shows two clear options: "Super Duolingo — Faster progress, no ads" (highlighted, with RECOMMENDED badge) and "Learn for free — Core learning features, with ads". The user actively chooses their path. No popup. No modal. No interstitial. LandedNZ's premium gate should follow this model — inline within the roadmap as a card, not a modal or page redirect.

**4. Expectation-setting before commitment**
"Here's what you can achieve in 3 months!" screen shows three benefit cards with icons before the user starts learning. This sets expectations and gives the user a reason to invest time. LandedNZ's equivalent: "Here's your personalised plan" as the roadmap reveal transition — showing what the product will deliver before asking for registration.

**5. Notification permission is primed before the system prompt**
Duolingo shows "I'll remind you to practice so it becomes a habit!" from the mascot before triggering the iOS notification permission dialog. The user understands why they're being asked. LandedNZ should prime reminder permissions the same way: "We'll remind you before important deadlines — like when your foreign driving licence conversion window closes."

**6. "Just 7 quick questions" sets scope expectations**
Before the onboarding questions begin, Duolingo shows: "Just 7 quick questions before we start your first lesson!" This tells the user the commitment is bounded. LandedNZ should do the same: "5 quick questions to build your settlement plan — takes about 2 minutes."

### What Duolingo Does Poorly for LandedNZ's Context

**1. Gamification is wrong for settlement**
Points, streaks, achievements, widgets — all designed to create habit loops for daily language practice. Settlement tasks are not daily habits. They are one-time high-stakes actions. Celebrating a completed IRD application with confetti and "+40 points" trivialises a consequential life action. LandedNZ should use subtle progress celebration (checkmark animation, percentage increase) not gamification mechanics.

**2. Too many onboarding steps**
Duolingo's full onboarding is 7+ questions plus premium gate plus notification prompt plus widget prompt — that's 10+ screens before the first lesson. LandedNZ must be 5 questions → roadmap. No upsells, no notification prompts, no widget prompts during onboarding.

**3. Mascot character doesn't translate to professional settlement**
Duo the owl works for language learning because language learning is playful. Settlement guidance is serious — people are stressed, spending money, navigating bureaucracy. A mascot character would feel incongruous. LandedNZ should use the conversational question pattern without a character.

### Patterns to Adopt from Duolingo
- **Conversational question format**: Speech-bubble-styled question, one per screen, large card options
- **Progress bar during onboarding**: Visual indicator of completion progress
- **Premium gate as inline choice card**: Two paths presented as options, not a wall
- **Expectation-setting screen**: "Here's what you'll get" before commitment
- **Permission priming**: Explain why before asking for system permissions
- **Scope declaration**: "5 quick questions — takes 2 minutes" before onboarding begins
- **Pinned bottom CTA button**: Primary action always at bottom of screen, full-width

### Patterns to Reject from Duolingo
- **Gamification mechanics**: No points, streaks, badges, or achievement systems
- **Mascot character**: Conversational tone without a character
- **Extended onboarding**: Maximum 5 questions, no upsells before roadmap

---

## GROUP F — PERPLEXITY — AI Answer Layout Reference

### What Perplexity Is
AI-powered search and answer engine. Mobile and web. Referenced here for its citation layout, source display, AI thinking state, and answer structure.

### What Perplexity Does Exceptionally Well

**1. "Reviewed X sources" header establishes credibility immediately**
Above the answer text: "Reviewed 10 sources ⌄" with a Perplexity logo. This tells the user the answer is grounded in research, not generated from thin air. LandedNZ's AI chat should show a similar signal: "Based on official NZ government sources" or "Verified against IRD.govt.nz, sorted.org.nz" above the response.

**2. Inline citation badges are scannable and trustworthy**
Source citations appear as small grey pill badges inline within the answer text: "unitec +1", "wise", "vistanz +5", "thecurrencyshop +1". The "+N" indicates additional supporting sources. Tapping a badge shows the source URL. This is a superior citation pattern to footnotes — the user can see which specific claim is sourced without breaking reading flow. LandedNZ should adopt this: inline source pills within AI response text, plus a footer with full URLs.

**3. "Working..." thinking state with progress description**
While generating a response, Perplexity shows "Working... ⌄" with an expanding description: "Outlining the steps to open a new New Zealand bank account and verify identity". The user knows what the AI is doing, not just that it's thinking. LandedNZ should show: "Checking NZ settlement guidance..." → "Looking up IRD requirements for your visa type..." — specific, not generic.

**4. Structured answer with numbered sections and tables**
The NZ bank account answer is structured: "1. Decide your situation", "2. Choose a bank" (with comparison table), "3. Documents you'll need" (with bulleted list). This structured format is far more useful for actionable guidance than flowing paragraphs. LandedNZ's AI responses for settlement tasks should always be structured: numbered steps, document lists, and comparison tables where relevant.

**5. Follow-up prompt encourages continued engagement**
"Ask a follow up..." placeholder text in the input field. LandedNZ should use a similar contextual placeholder: "Ask about this task..." when opened from a task card, or "What else about your settlement?" when opened from the roadmap.

**6. Premium gate is a toast, not a wall**
The "This answer has been upgraded to advanced search" banner appears at the bottom as a dismissible toast with an "Upgrade" button. The answer is still visible. The user isn't blocked. LandedNZ's premium chat gate should behave the same way — show one response, then surface the upgrade prompt as a non-blocking banner.

### What Perplexity Does Poorly for LandedNZ's Context

**1. Opening message is generic**
"Hey there! What's up?" is the default greeting. This contradicts LandedNZ's entry-point-aware chat design. Every chat opening must reference the user's context.

**2. No user context awareness**
Perplexity doesn't know who the user is — every question starts from zero. LandedNZ's AI knows the user's visa type, family situation, occupation, arrival date, and task completion state. The AI should use this context in every response.

### Patterns to Adopt from Perplexity
- **"Based on official sources" header**: Credibility signal above AI responses
- **Inline citation badges**: Source pills within response text (source name + link)
- **Structured thinking state**: "Checking [specific topic]..." with expanding description
- **Structured answer format**: Numbered sections, tables, document lists
- **Contextual follow-up placeholder**: "Ask about this task..." in input field
- **Non-blocking premium toast**: Upgrade prompt as dismissible banner, not a wall

### Patterns to Reject from Perplexity
- **Generic opening message**: Must always be context-aware
- **No user context**: Must leverage onboarding profile in every response

---

## GROUP G — CALM — Emotional Register and Premium Gate Reference

### What Calm Is
Meditation and sleep app. Referenced here for its emotional register, anxiety-reducing design patterns, copy tone, and premium gating approach. Analysis based on product knowledge (no screenshots).

### What Calm Does Exceptionally Well

**1. Colour palette reduces cortisol**
Calm uses deep navy/blue backgrounds with warm gold accents. The palette itself is therapeutic — designed to lower anxiety on sight. LandedNZ's palette should not be Calm's exact palette (too dark, too meditation-focused), but should apply the same principle: muted, warm neutrals with a calming accent colour. No harsh reds, no electric blues, no high-contrast black/white interfaces.

**2. Typography is generous and unhurried**
Large type, generous line-height, wide margins. Text never feels cramped. Reading speed is naturally slowed, which reduces perceived urgency. LandedNZ's typography should follow: body text at 16px minimum, line-height at 1.6, generous margins around content cards.

**3. Premium gate is aspirational, not punitive**
Calm's premium gate shows locked content with a brief preview: the user can see what they're missing (a specific meditation, a sleep story) before the upgrade prompt appears. The copy is aspirational: "Unlock your full potential" rather than "You've reached your limit." LandedNZ's premium gate should follow this: show the first two lines of a Phase 3 task as a teaser, then the upgrade card — aspirational ("Continue your settlement journey"), never punitive ("You've used all your free tasks").

**4. Copy never uses anxiety words**
Calm never says "hurry", "limited time", "don't miss", or "you need to". Everything is invitational: "when you're ready", "explore at your pace", "try this tonight". LandedNZ's copy should follow this principle throughout — even when the urgency is real (IRD emergency tax), the tone should be calm authority, not alarm. "This needs to happen in your first week — here's exactly how" rather than "WARNING: You must do this immediately or you'll lose money!"

**5. White space is a design element**
Calm's screens have significant empty space. Content never fights for attention. The user's eye moves naturally to the single focal point. LandedNZ should apply the same principle: generous spacing between task cards, clear visual hierarchy, no information cramming.

### Patterns to Adopt from Calm
- **Anxiety-reducing colour palette**: Muted warm neutrals with calming accent
- **Generous typography**: 16px+ body, 1.6 line-height, wide margins
- **Aspirational premium copy**: "Continue your journey" not "You've hit a limit"
- **Invitational language throughout**: "When you're ready" not "You must act now"
- **Strategic white space**: Let content breathe, single focal point per screen section

### Patterns to Reject from Calm
- **Dark backgrounds**: Too moody for a practical settlement tool
- **Meditation-specific aesthetic**: LandedNZ is warm and practical, not spa-like
- **Slow/ambient animations**: Settlement users want efficiency, not contemplation

---

## SYNTHESISED DESIGN DIRECTION

---

## TOP 10 DESIGN PATTERNS TO ADOPT ACROSS LANDEDNZ WEB

### 1. Priority-First Dashboard (from Settly + Notion)
Hero card with progress percentage + single "Your next task" card above the fold. Answer "what do I do next?" before the user scrolls. Phase sections collapsed below.

### 2. Two-Panel Layout (from Linear)
Task list on left, task detail on right. Clicking a task in the list opens its detail in the right panel without leaving the list. Roadmap context is never lost. On tablet (768px), collapse to single panel with slide-in detail.

### 3. Conversational Onboarding (from Duolingo + Notion)
One question per screen. Speech-bubble-styled question text. Large card options with icons and descriptions. Progress bar at top. Pinned "Continue" button at bottom. "5 questions — takes 2 minutes" scope declaration on entry.

### 4. Consequence-First Task Cards (from Settly)
Every task card shows: status indicator, task name, consequence one-liner ("Without this, you're taxed at 45%"), time estimate, and phase badge. The consequence line is the differentiator — it answers "why should I care?" before the user clicks.

### 5. Entry-Point-Aware Chat (from Intercom Fin)
AI chat opening message always references context: which task, which phase, what's been completed. Never generic. "You're looking at the IRD application. What would you like to know?" is the standard.

### 6. Structured AI Responses with Inline Citations (from Perplexity)
AI responses use numbered steps, document lists, and comparison tables. Inline source pills (citation badges) within the text. Formal source footer with clickable URL. "Based on official NZ sources" header above every response.

### 7. Inline Premium Gate as Choice Card (from Duolingo + Calm)
Premium gate appears inline in the task list — not a modal, not a page redirect. Two paths presented as cards: "Continue with premium — $49 for 6 months" and "Stay on free plan". Aspirational copy, never punitive. Anchor: "One week of emergency tax = $240. Six months of LandedNZ = $49."

### 8. Dependency-Visible Sequencing (LandedNZ-original, filling Settly's gap)
Tasks show dependency indicators: "Requires: Bank account (Task 2)" on blocked tasks. Completed dependencies show as satisfied with a green check. Visual connector line or indent shows parent-child relationships in the task list. This is the single biggest UX differentiator over Settly.

### 9. Generous Typography and White Space (from Calm)
Body text at 16px, line-height 1.6, card spacing at 16px minimum. Content cards have internal padding of 24px. No information cramming. Single focal point per screen section. The UI should feel unhurried even when the content is urgent.

### 10. Contextual Thinking State (from Perplexity + Intercom)
AI chat shows "Checking NZ settlement guidance..." with expanding context description ("Looking up IRD requirements for Partner of Student visa holders...") while generating. The user knows what the AI is doing, not just that it's loading.

---

## VISUAL DIRECTION RECOMMENDATION

### Colour Palette Philosophy
**Warm authority.** Not clinical government blue. Not playful startup green. Not dark productivity grey. The palette should communicate: "I know what I'm doing, and I'm here to help you — calmly."

**Primary**: Deep teal (e.g., #1B6B6D or similar) — authoritative but warm, distinct from government blue
**Secondary**: Warm amber/gold (e.g., #D4A843) — for accents, consequence callouts, and CTAs
**Neutral base**: Warm off-white (#F8F6F3) — not pure white, not grey, slightly warm
**Text**: Near-black with warmth (#1A1A2E) — not pure black
**Semantic - Success**: Muted green (#2D8A5E)
**Semantic - Warning**: Warm amber (#D4A843) — same as secondary, used for consequence callouts
**Semantic - Error**: Muted coral (#C75B4A) — not harsh red
**Semantic - Blocked**: Muted grey (#8E8E9A)
**Semantic - Premium**: Deep teal with gold accent

### Typography Philosophy
**Clean, readable, and slightly generous.** Not design-forward display fonts. Not system defaults. A typeface that reads well at small sizes (task card descriptions) and large sizes (hero headings) without feeling either corporate or playful.

**Recommended font stack**: Inter (primary) with system sans-serif fallback. Inter is free, highly legible, has excellent number rendering (important for financial data), and works across all weights.

**Scale**:
- Display/hero: 36px / 700 weight
- Page heading (H1): 28px / 600 weight
- Section heading (H2): 22px / 600 weight
- Card title: 18px / 600 weight
- Body text: 16px / 400 weight
- Secondary text (metadata, time estimates): 14px / 400 weight
- Caption/label: 12px / 500 weight, uppercase tracking

**Line heights**: 1.4 for headings, 1.6 for body text, 1.3 for captions

### Spacing Philosophy
**Generous but structured.** Spacing creates visual grouping — related items are closer together, unrelated items are further apart.

**Base unit**: 8px
**Card internal padding**: 24px (3 units)
**Card gap (between cards)**: 16px (2 units)
**Section gap**: 32px (4 units)
**Sidebar width**: 256px (collapsed: 64px icon-only)
**Content max-width**: 960px within content area
**Detail panel width**: 480px minimum

### Animation Philosophy
**Purposeful, not decorative.** Animations serve exactly two purposes: (1) communicating state change, and (2) reducing perceived abruptness of transitions.

**What animates**:
- Task completion: checkmark draws in (0.3s ease-out), card fades to completed state (0.2s)
- Panel open/close: slide from right (0.25s ease-out)
- Onboarding question reveal: fade-in + slide-up (0.3s)
- Premium gate appearance: fade-in (0.2s)
- Chat message appearance: fade-in from bottom (0.15s)
- Progress bar fill: smooth width transition (0.4s ease-out)

**What does NOT animate**:
- Navigation between pages (instant)
- Sidebar expand/collapse on desktop (instant or very fast, 0.1s)
- Filter tab switching (instant)
- Form inputs, dropdowns, selection states (instant)

**Duration ceiling**: 0.4s maximum. No animation should make the user wait.

---

## EMOTIONAL REGISTER GUIDELINES

### Copy Tone
**Knowledgeable friend who has done this before.** Not a customer service bot. Not a government portal. Not a startup trying too hard to be friendly. A person who moved to NZ two years ago, figured it all out, and is now walking you through it.

### Microcopy Examples

**Onboarding questions**:
- Do: "First — what brings you to New Zealand?"
- Don't: "Please select your visa type"
- Don't: "Hey! Let's get started! What visa are you on?"

**Consequence callouts**:
- Do: "Without this, your first paycheck is taxed at 45% — the emergency rate."
- Don't: "WARNING: Failure to complete this step may result in higher taxation."
- Don't: "Yikes! You could lose a LOT of money if you skip this!"

**Task completion**:
- Do: "Done. Your IRD number is on its way — usually 8-15 working days."
- Don't: "Congratulations! Task completed! +40 points!"
- Don't: "Task marked as complete."

**Premium gate**:
- Do: "Your first two weeks are covered. Ready to keep going?"
- Don't: "You've reached the limit of your free plan."
- Don't: "UPGRADE NOW to unlock premium features!"

**Chat greeting (from task card)**:
- Do: "You're looking at the IRD application. What would you like to know?"
- Don't: "Hi! How can I help you today?"
- Don't: "Welcome to LandedNZ AI Chat! Ask me anything about settling in New Zealand!"

**Error state**:
- Do: "Something went wrong loading this task. Try refreshing — if it keeps happening, we're already looking into it."
- Don't: "Error 500: Internal Server Error"
- Don't: "Oops! Something broke!"

**Lapsed user re-entry**:
- Do: "You've been away for a while — that's okay. Let's see where things stand."
- Don't: "You haven't logged in for 14 days! You have 8 incomplete tasks!"
- Don't: "Welcome back! We missed you!"

### Language Rules
1. Never use "just" to minimise effort ("just fill out this form") — respect the user's time
2. Never use exclamation marks in system messages — one exclamation mark per screen maximum, and only in celebration moments
3. Never blame the user — "This task needs your bank account number first" not "You haven't completed your bank account yet"
4. Always lead with what to do, not what went wrong
5. Use "you" and "your" — never "the user" or "one should"
6. Use NZ-specific terms: "flat" not "apartment", "GP" not "doctor", "sorted" not "organized"
7. Currency always in NZD with dollar sign: "$49" not "49 NZD"

---

## ANTI-PATTERNS TO AVOID

### 1. Gamification of Consequential Life Tasks
No points. No streaks. No badges. No achievements. No leaderboards. Settlement tasks are one-time, high-stakes life actions. Celebrating them with game mechanics trivialises the gravity and disrespects the user's intelligence. Progress percentage and phase completion are sufficient feedback.

### 2. Dark Patterns in Premium Gating
No "X" button that's smaller than the upgrade button. No pre-selected premium option. No countdown timers. No "last chance" copy. No making the free path visually inferior. Three equal paths: upgrade, defer, decline. All equally accessible.

### 3. Information Overload on First View
No showing all tasks at once. No showing task counts before the user completes their first task. No expanding all phases by default. No loading the chat with message history on first open. Progressive disclosure: show what's needed now, make the rest accessible.

### 4. Generic AI Responses
No "Hello! How can I help you?" No "I'm an AI and may make mistakes." No disclaimers before the actual answer. Context-aware opening, structured response, source citation, then subtle disclaimer at the bottom.

### 5. Form-Style Onboarding
No dropdowns. No text inputs. No multi-field forms on a single screen. Every onboarding question is a single selection from large, descriptive card options. The onboarding should feel like a conversation, not a visa application.

### 6. Government Portal Aesthetic
No blue-and-white colour schemes. No Times New Roman. No dense paragraph blocks. No all-caps section headers. No "click here" links. LandedNZ is the antithesis of a government website — it has the same information, but presented with warmth and sequencing.

### 7. Anxiety-Amplifying Language
No "WARNING", "URGENT", "CRITICAL", "DON'T MISS", "ACT NOW". Even when urgency is real, the tone is calm authority: "This needs to happen in your first week." The consequence line does the urgency work — the tone stays steady.

### 8. Assumed Technical Literacy
No "OAuth", "SSO", "sync your data". "Sign in with Google" not "Continue with Google OAuth". "We'll save your progress" not "Your data will be synced to our cloud." Plain language for every interaction.

---

## ACCESSIBILITY REQUIREMENTS

**WCAG 2.1 AA compliance is mandatory.** These users may be reading in a second language, in a stressful situation, on an unfamiliar device, in poor lighting.

### Specific Requirements
- Colour contrast ratio: 4.5:1 minimum for body text, 3:1 for large text (18px+)
- All interactive elements: minimum 44px touch target on mobile, 32px on desktop
- Keyboard navigation: all flows completable via keyboard alone
- Focus indicators: visible focus rings on all interactive elements (not just browser defaults)
- Screen reader: semantic HTML with ARIA labels for all custom components
- Reduced motion: respect `prefers-reduced-motion` — disable all animations when set
- Font sizing: respect user's browser font size preference (use rem, not px for text)
- Error states: never communicate status through colour alone — always include icon + text

---

*This document feeds directly into 14-ui-ux-design.md, which translates these patterns and principles into screen-by-screen design specifications for every LandedNZ web screen.*
