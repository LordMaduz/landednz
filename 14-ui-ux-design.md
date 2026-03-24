# 14 — UI/UX Design Specification
*Written: March 2026*
*Purpose: Screen-by-screen design spec for LandedNZ web app (Next.js). Every screen defined with layout, component inventory, interaction notes, copy guidelines, states, and responsive behaviour. This document is the definitive spec Claude Code reads when building `apps/web/src/`.*
*Feeds from: 13-ui-ux-research.md, 07-feature-definition.md, 08-user-flows.md, 12-build-specification.md*

---

## DESIGN TOKENS

### Colour Palette

```
/* Primary */
--color-primary:          #1B6B6D;   /* Deep teal — primary actions, links, active states */
--color-primary-hover:    #15585A;   /* Darkened for hover */
--color-primary-light:    #E8F4F4;   /* Light teal — selected states, active backgrounds */
--color-primary-subtle:   #F0F8F8;   /* Very light teal — hover backgrounds */

/* Secondary */
--color-secondary:        #D4A843;   /* Warm amber — consequence callouts, accents */
--color-secondary-light:  #FDF6E7;   /* Light amber — consequence callout backgrounds */
--color-secondary-hover:  #C09338;   /* Darkened amber */

/* Neutral */
--color-bg:               #F8F6F3;   /* Warm off-white — page background */
--color-bg-card:          #FFFFFF;   /* Pure white — card backgrounds */
--color-bg-sidebar:       #F2F0ED;   /* Slightly darker warm — sidebar background */
--color-bg-panel:         #FFFFFF;   /* Detail panel background */

/* Text */
--color-text-primary:     #1A1A2E;   /* Near-black — headings, body text */
--color-text-secondary:   #5A5A6E;   /* Muted — secondary text, metadata */
--color-text-tertiary:    #8E8E9A;   /* Light grey — placeholders, disabled text */
--color-text-inverse:     #FFFFFF;   /* White — text on dark backgrounds */

/* Semantic */
--color-success:          #2D8A5E;   /* Muted green — complete, positive */
--color-success-light:    #E8F5EE;   /* Light green background */
--color-warning:          #D4A843;   /* Amber — consequence, attention (same as secondary) */
--color-warning-light:    #FDF6E7;   /* Light amber background */
--color-error:            #C75B4A;   /* Muted coral — errors, failures */
--color-error-light:      #FDF0EE;   /* Light coral background */
--color-blocked:          #8E8E9A;   /* Grey — blocked, disabled */
--color-blocked-light:    #F2F2F4;   /* Light grey background */
--color-premium:          #1B6B6D;   /* Deep teal with gold border — premium indicator */
--color-premium-gold:     #D4A843;   /* Gold — premium badge, lock icon */

/* Borders */
--color-border:           #E5E3E0;   /* Default card borders */
--color-border-focus:     #1B6B6D;   /* Focus ring colour */
--color-border-hover:     #D0CEC8;   /* Hover border */
```

### Typography Scale

```
/* Font family */
--font-family:            'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font sizes (rem-based for accessibility) */
--text-display:           2.25rem;   /* 36px — hero text */
--text-h1:                1.75rem;   /* 28px — page headings */
--text-h2:                1.375rem;  /* 22px — section headings */
--text-h3:                1.125rem;  /* 18px — card titles */
--text-body:              1rem;      /* 16px — body text */
--text-secondary:         0.875rem;  /* 14px — metadata, time estimates */
--text-caption:           0.75rem;   /* 12px — labels, badges */

/* Font weights */
--weight-regular:         400;
--weight-medium:          500;
--weight-semibold:        600;
--weight-bold:            700;

/* Line heights */
--leading-tight:          1.3;       /* Captions, badges */
--leading-heading:        1.4;       /* All headings */
--leading-body:           1.6;       /* Body text, descriptions */
```

### Spacing System

```
/* Base unit: 8px */
--space-1:    0.25rem;   /*  4px */
--space-2:    0.5rem;    /*  8px */
--space-3:    0.75rem;   /* 12px */
--space-4:    1rem;      /* 16px — card gap */
--space-5:    1.25rem;   /* 20px */
--space-6:    1.5rem;    /* 24px — card internal padding */
--space-8:    2rem;      /* 32px — section gap */
--space-10:   2.5rem;    /* 40px */
--space-12:   3rem;      /* 48px — page top padding */
```

### Layout Constants

```
--sidebar-width:          256px;
--sidebar-collapsed:      64px;
--content-max-width:      960px;
--detail-panel-width:     480px;
--detail-panel-min:       400px;
--card-border-radius:     12px;
--button-border-radius:   8px;
--input-border-radius:    8px;
--badge-border-radius:    100px;   /* Fully rounded */
```

### Shadows

```
--shadow-card:            0 1px 3px rgba(26, 26, 46, 0.06), 0 1px 2px rgba(26, 26, 46, 0.04);
--shadow-card-hover:      0 4px 12px rgba(26, 26, 46, 0.08), 0 2px 4px rgba(26, 26, 46, 0.04);
--shadow-panel:           -4px 0 24px rgba(26, 26, 46, 0.08);
--shadow-dropdown:        0 8px 24px rgba(26, 26, 46, 0.12);
```

---

## COMPONENT STATES — TASK CARD (7 STATES)

The task card is the primary interaction unit across the entire product. It appears in the roadmap list (Layer 1 — summary) and opens in the detail panel (Layer 2 — full).

### Layer 1 — List Card (always visible in roadmap)

Each state below describes the list card appearance. All cards share the same base structure: a horizontal row containing status indicator, task name, consequence one-liner, time estimate, and phase badge.

**State 1: not_started (default)**
- Status indicator: Empty circle, --color-text-tertiary border
- Task name: --color-text-primary, --weight-semibold
- Consequence line: --color-text-secondary, --weight-regular, single line truncated with ellipsis
- Time estimate: --color-text-tertiary, --text-secondary, clock icon
- Phase badge: Pill with phase name, --color-primary-light background, --color-primary text
- Background: --color-bg-card
- Border: 1px --color-border
- Hover: border transitions to --color-border-hover, shadow transitions to --shadow-card-hover
- Cursor: pointer

**State 2: in_progress**
- Status indicator: Half-filled circle, --color-primary fill on left half
- Task name: --color-text-primary, --weight-semibold
- Consequence line: same as not_started
- Time estimate: same as not_started
- Phase badge: same as not_started
- Background: --color-bg-card with 2px left border in --color-primary
- Additional element: Small progress bar below consequence line (if task has sub-steps), --color-primary fill

**State 3: complete**
- Status indicator: Filled circle with white checkmark, --color-success background
- Task name: --color-text-secondary (muted), --weight-regular (not bold), no strikethrough
- Consequence line: hidden — replaced with completion date: "Completed Mar 15"
- Time estimate: hidden
- Phase badge: same but muted opacity (0.6)
- Background: --color-bg-card with 0.7 opacity overall
- Border: 1px --color-border (same, not emphasised)
- Card height: slightly reduced (no consequence line)

**State 4: blocked**
- Status indicator: Solid circle with lock icon, --color-blocked
- Task name: --color-text-secondary (muted)
- Consequence line: replaced with dependency message: "Needs: Open bank account (Task 2)" in --color-text-tertiary
- Time estimate: hidden
- Phase badge: same but muted opacity (0.6)
- Background: --color-blocked-light
- Border: 1px --color-border
- Cursor: pointer (clicking shows detail with explanation of what's needed)
- No hover shadow (visually de-emphasised)

**State 5: premium_locked**
- Status indicator: Solid circle with lock icon, --color-premium-gold
- Task name: --color-text-primary, --weight-semibold (teaser visible)
- Consequence line: First 60 characters visible + "..." + small "Premium" pill badge in --color-premium-gold with lock icon
- Time estimate: hidden
- Phase badge: same as not_started
- Background: --color-bg-card
- Border: 1px --color-border, bottom border 2px --color-premium-gold (subtle gold accent)
- Cursor: pointer (clicking opens upgrade prompt in detail panel, not the full task)
- Hover: same as not_started

**State 6: loading (skeleton)**
- Status indicator: Pulsing grey circle (--color-blocked-light)
- Task name: Pulsing grey bar, 60% width
- Consequence line: Pulsing grey bar, 80% width
- Time estimate: Pulsing grey bar, 15% width
- Phase badge: Pulsing grey pill
- Animation: Gentle pulse (opacity 0.4 → 0.7 → 0.4), 1.5s cycle
- Background: --color-bg-card

**State 7: error**
- Status indicator: Solid circle with exclamation icon, --color-error
- Task name: --color-text-primary
- Consequence line: replaced with error message: "Something went wrong — tap to retry" in --color-error
- Time estimate: hidden
- Background: --color-error-light
- Border: 1px --color-error at 0.3 opacity
- Cursor: pointer (clicking retries the load)

### Layer 2 — Detail Panel

When a task card is clicked, the detail panel opens on the right side of the two-panel layout. The detail panel contains:

1. **Header**: Task name (H2), status badge, phase badge, time estimate, difficulty badge (Easy/Medium/Hard)
2. **Consequence callout**: Full "Why This Matters Now" block — amber background (--color-warning-light), left border 3px --color-warning, exclamation icon, full consequence paragraph
3. **How This Works**: Numbered step-by-step guide — each step a row with number circle (--color-primary), step text, and optional "Go to [site]" link
4. **Documents Needed**: Checklist-style list — document name, required/optional badge, brief note
5. **Source Links**: "Official source" row — government agency name, specific page, clickable URL, external link icon
6. **Ask a Question**: Button that opens chat pre-loaded with this task's context
7. **Action buttons (sticky footer)**: "Mark as done" (primary, --color-primary) / "Save progress" (secondary, outline) / "I've already done this" (text link)

---

## NAVIGATION PATTERN

### Sidebar Structure (Desktop — 1280px+)

```
┌─────────────────────────────┐
│  🏠 LandedNZ               │  ← Logo + name, links to dashboard
│                             │
│  ◉ Roadmap                  │  ← Primary nav, always first, active by default
│  💬 Chat                    │  ← Opens chat in full-page or side panel
│  ⚙ Settings                │  ← Profile, subscription, preferences
│                             │
│  ─── YOUR PLAN ───          │  ← Section divider
│  ▸ Phase 1: Before arrival  │  ← Collapsible, shows task count + completed count
│  ▸ Phase 2: First 2 weeks   │
│  ▸ Phase 3: Weeks 3-8       │  ← Premium badge if locked
│                             │
│  ─── HELP ───               │
│  📖 Resources               │  ← Links to NZ government sites
│  📧 Feedback                │  ← Link to feedback form
│                             │
│                             │
│  ─────────────────          │
│  Priya & Karthik            │  ← User name(s), avatar
│  Partner of Student Visa    │  ← Visa type badge
│  Auckland                   │  ← City
└─────────────────────────────┘
```

**Width**: 256px expanded, 64px collapsed (icon-only mode)
**Background**: --color-bg-sidebar
**Active state**: --color-primary-light background, --color-primary text, left border 3px --color-primary
**Hover state**: --color-primary-subtle background
**Collapse trigger**: Hamburger icon at top of sidebar, or automatic on viewports below 1024px

### Tablet Behaviour (768px — 1023px)
Sidebar collapses to 64px icon-only mode by default. Hovering/clicking hamburger expands to full 256px as an overlay (with backdrop). Content area takes full width.

### Phase Section (expanded)
```
▾ Phase 2: First 2 weeks        4/8 ✓
    ○ Get NZ SIM card            ← Status circle + task name
    ◐ Open bank account
    ○ Apply for IRD number
    ○ Submit tax code declaration
    ...
```

---

## SCREEN-BY-SCREEN SPECIFICATIONS

---

### SCREEN 1: LANDING PAGE

**Purpose**: Value proposition, how it works, social proof, CTA. This is the marketing entry point for organic/paid traffic. Not the app — the sales page.

**URL**: `/` (root)

**Layout**: Single-column, full-width sections, no sidebar. Standard marketing page structure.

**Section 1 — Hero (above the fold)**
- Background: Auckland harbour/skyline photograph, dark overlay at 55% opacity
- Headline (--text-display, --color-text-inverse, --weight-bold): "You've just arrived in New Zealand. We'll tell you what to do first."
- Subheadline (--text-h3, --color-text-inverse, --weight-regular, 0.85 opacity): "LandedNZ builds a personalised settlement plan based on your visa, your city, and your family. In 2 minutes."
- CTA button (full-width on mobile, 320px max on desktop, --color-secondary background, --color-text-primary text, --weight-semibold): "Build my plan — free"
- Secondary link (--color-text-inverse, underline): "See how it works ↓"
- Trust signal (below CTA, --text-secondary, --color-text-inverse at 0.7 opacity): "No account needed. No payment required. Your plan in 2 minutes."

**Section 2 — Problem Statement (scroll down)**
- Three cards in a row (stack vertically on mobile):
  - Card 1: "45% emergency tax" — "Miss your IRD number in week one and every paycheck loses $300–400."
  - Card 2: "$3,000 wrong suburb" — "Sign a lease before understanding school zones and you're moving again."
  - Card 3: "$600/year in fees" — "Send money home through a bank instead of Wise and it costs $300–600 extra per year."
- Below cards: "These mistakes happen because nobody tells you the order. LandedNZ tells you the order."

**Section 3 — How It Works**
- Three-step horizontal layout (vertical on mobile):
  1. "Answer 5 questions" — icon: clipboard — "Your visa, city, family, job, arrival date."
  2. "Get your personalised plan" — icon: roadmap — "A sequenced roadmap built for your exact situation."
  3. "Complete tasks with confidence" — icon: checkmark — "Step-by-step guides with official source links."

**Section 4 — Social Proof / Testimonials**
- Placeholder for launch: "Built by a migrant, for migrants. Ruchira is settling in Auckland in 2026 — every feature is built from lived experience."
- Post-launch: rotate real user testimonials

**Section 5 — Pricing Preview**
- Two cards side by side:
  - Free: "Your first 2 weeks covered. Personalised roadmap, progress tracking, government source links."
  - Premium ($49/6 months): "Full 8-week roadmap, AI settlement advisor, smart deadline reminders."
- Anchor copy: "One week of emergency tax costs $240. Six months of LandedNZ costs $49."

**Section 6 — Final CTA**
- Repeat hero CTA: "Build my plan — free"
- Below: "5 questions. 2 minutes. No account required."

**Responsive**: All sections stack vertically on mobile. Hero image crops to center. Cards go full-width. CTA buttons go full-width.

**Empty state**: N/A (static page)
**Loading state**: N/A (static page, SSR)
**Error state**: Standard 500 page if server fails

---

### SCREEN 2: ONBOARDING FLOW

**Purpose**: Collect 5 inputs to generate personalised roadmap. Feel like a conversation, not a form.

**URL**: `/onboarding` (or `/get-started`)

**Layout**: Centered single-column (max-width 640px), no sidebar. Full-viewport height per question. Progress bar at top.

**Structure**: The user flows doc specifies "questions build downward on single screen." For web, we adapt this to a **one-question-per-view with smooth scroll transition** — each question takes the full viewport, and answering scrolls to the next question below. Previous answers remain visible above (scrolled up). This preserves the "profile building" feel while giving each question visual breathing room on a large screen.

**Progress bar**: Fixed at top of viewport. 5 segments. Filled segments use --color-primary. Unfilled use --color-border. Height: 4px. Border-radius: 2px.

**Scope declaration** (appears before Q1):
- Centered text: "5 quick questions to build your settlement plan"
- Subtext: "Takes about 2 minutes. No account needed."
- CTA: "Let's go →"

**Question template** (each question follows this structure):
- Question text: --text-h2, --weight-semibold, --color-text-primary. Conversational tone (speech-bubble optional — test both).
- Options: Full-width cards, 64px min-height, --color-bg-card background, --color-border border, 12px border-radius. On hover: --color-primary-subtle background, --color-border-hover border. On selection: --color-primary-light background, --color-primary border, checkmark icon appears right-aligned. Each card shows: option text (--text-body, --weight-medium) and optional description line (--text-secondary, --color-text-secondary).
- After selection: 0.3s pause, then smooth scroll to next question. Selected card stays highlighted. Previous questions remain visible but muted (0.7 opacity on scroll-up).

**Q1**: "What brings you to New Zealand?"
Options: AEWV, Partner of Student Work Visa, Green List Work Visa, Green List Straight to Residence, Other / Not sure

**Q2**: "Which city are you arriving in?"
Options: Auckland, Wellington, Christchurch, Other

**Q3**: "Who are you settling in with?"
Options: Arriving alone, Couple — we both have independent work visas, Couple — one of us is on a student or work visa (the other on a partner visa), Family with dependent children
*Conditional*: If constrained couple selected → follow-up confirmation appears inline: "Just to confirm — is one of you the primary visa holder, with the other on a dependent or partner visa?" — Yes / No

**Q4**: "What's your professional background?"
Options: Technology / Engineering, Healthcare, Education, Finance / Accounting, Trades, Other professional, Still looking for work

**Q5**: "When are you arriving — or when did you arrive?"
Options: I haven't arrived yet (reveals date picker), I arrived in the last 2 weeks, I arrived 2–8 weeks ago, I arrived more than 2 months ago

**After Q5 answered — Transition**:
- All questions scroll up. Center of screen shows:
- "Building your personalised plan..."
- Below: animated loading indicator (pulsing teal dots or subtle spinner)
- Below that: brief context sentences appear sequentially (0.8s each):
  - "Checking settlement requirements for Partner of Student visa..."
  - "Sequencing tasks for Auckland..."
  - "Adjusting for couple on single income..."
- Duration: 1.5–2 seconds total (psychological pause to signal personalisation)
- Then: redirect to `/roadmap` (dashboard)

**Empty state**: N/A (new flow every time)
**Loading state**: Transition screen described above
**Error state**: If roadmap generation fails: "Something went wrong building your plan. Let's try again." + "Retry" button that re-submits the same inputs.

**Responsive**: Questions and cards are already max-width 640px, so they work across all viewports. Cards go full-width within the 640px container. Date picker uses native input on mobile.

---

### SCREEN 3: ROADMAP DASHBOARD

**Purpose**: Primary app screen. Shows personalised roadmap with priority tasks, progress, and phase sections. This is where the user spends most of their time.

**URL**: `/roadmap`

**Layout**: Two-panel layout on desktop (1280px+). Left panel: roadmap task list (scrollable). Right panel: task detail (appears on task click). Sidebar visible on left.

```
┌──────────┬─────────────────────────────────┬────────────────────────┐
│ Sidebar  │  Roadmap List                   │  Task Detail Panel     │
│ 256px    │  (scrollable)                   │  480px                 │
│          │                                 │  (empty until click)   │
│          │                                 │                        │
└──────────┴─────────────────────────────────┴────────────────────────┘
```

**Roadmap list panel components (top to bottom)**:

**1. Hero progress card**
- Background: --color-primary (deep teal), full-width within content area
- Border-radius: --card-border-radius
- Padding: --space-6
- Content:
  - Greeting: "Hi Priya" (--text-h3, --color-text-inverse, --weight-semibold)
  - Progress: "Your First 90 Days in New Zealand" (--text-body, --color-text-inverse, 0.85 opacity)
  - Progress circle: 72px diameter, circular progress indicator, percentage in center (--text-h2, --weight-bold, --color-text-inverse), ring colour: --color-secondary
  - Stats row: "X completed · X in progress · X remaining" (--text-secondary, --color-text-inverse, 0.7 opacity)

**2. "Do these first" section**
- Section header: "Do these first" (--text-h3, --weight-semibold, --color-text-primary)
- 3 task cards in priority order — these are the top 3 uncompleted tasks from the dependency-ordered roadmap
- Each card: Layer 1 task card in not_started or in_progress state
- Cards are slightly larger than phase-section cards: more internal padding (--space-6), consequence line not truncated (up to 2 lines)

**3. Filter tabs**
- Tab bar: All Tasks | To Do | In Progress | Done
- Active tab: --color-primary text, --color-primary bottom border (2px)
- Inactive tab: --color-text-secondary, no bottom border
- Hover: --color-text-primary

**4. Phase sections (collapsible)**
- Phase header row: Disclosure triangle (▸/▾) + phase name + task count ("4/8 completed") + phase timeline ("First 2 weeks")
- Collapsed by default for Phase 2 and Phase 3
- Phase 1 expanded by default if user has incomplete Phase 1 tasks
- Phase 3: If premium_locked, shows lock icon + "Premium" badge on header. Clicking expands to show task cards in premium_locked state.

**5. Helpful Resources section (bottom)**
- Section header: "Helpful Resources"
- Resource cards: icon + title + one-line description + chevron
  - Find Housing — "Tips for renting your first flat in New Zealand"
  - Public Transport — "Getting around Auckland: AT HOP cards and routes"
  - Job Search — "NZ CV format, job boards, and interview tips"
- Each card links to a resource page or external site

**Right panel — before any task is clicked**:
- Empty state: Centered illustration (simple line drawing of a map/compass) + "Select a task to see details" (--text-body, --color-text-tertiary)

**Right panel — after task is clicked**:
- Layer 2 task detail as described in Component States section
- Panel slides in from right (0.25s ease-out)
- Close button (X) top-right of panel returns to empty state

**Responsive behaviour**:
- 1280px+: Full three-column (sidebar + list + detail panel)
- 1024px–1279px: Sidebar collapsed to 64px, list + detail panel
- 768px–1023px: Sidebar collapsed to 64px, full-width list. Task click opens detail as a slide-over overlay (covers list, with back button)
- Below 768px: No sidebar (hamburger menu). Full-width list. Task click navigates to full-page detail view.

**Loading state**: Skeleton cards — 3 skeleton hero cards, 3 skeleton task cards in "Do these first", skeleton phase headers. Pulse animation.
**Error state**: If roadmap fails to load: "We couldn't load your roadmap. This might be a temporary issue." + "Try again" button.

---

### SCREEN 4: TASK DETAIL (Full Page — Mobile/Tablet)

**Purpose**: Full detail view of a single task. On desktop this is the right panel; on smaller viewports it's a full page.

**URL**: `/roadmap/task/:taskId`

**Layout**: Single column, max-width 720px, centered. Back button at top ("← Back to roadmap").

**Components (top to bottom)**:

1. **Back navigation**: "← Back to roadmap" link, --color-primary
2. **Task header card**: Task name (--text-h1), status badge, phase badge, time estimate with clock icon, difficulty badge (Easy = --color-success / Medium = --color-warning / Hard = --color-error)
3. **Consequence callout**: Full "Why This Matters Now" block (as described in Component States)
4. **Conditional: sub-situation selector** (like Settly's "What applies to you?"):
   - Example for driver's licence: "Convert foreign licence" / "Get a brand new licence" / "I'm not sure yet"
   - Selecting changes the step-by-step content below
5. **How This Works**: Numbered steps (1–5 typically), each with number circle + step text + optional link
6. **Documents Needed**: List with required (solid dot) and optional (hollow dot + "(optional)" label) items
7. **Official Source**: Prominent card with agency name, page name, and URL. Green "Go to [Agency]" button with external link icon.
8. **Ask a Question**: Secondary button that opens chat with this task pre-loaded
9. **Helpful Tips**: Collapsible section with insider tips (e.g., "Buy your SIM in-store, not at the airport — airport kiosks charge more")
10. **Action footer** (sticky at bottom on mobile):
    - "Mark as done" — primary button, full-width
    - "Save progress" — secondary outline button (if task has sub-steps)
    - "I've already done this" — text link below buttons

**Empty state**: N/A (always has content if reached)
**Loading state**: Skeleton with pulsing bars matching content layout
**Error state**: "This task couldn't load. Try refreshing." + "Refresh" button

**Responsive**: Already single-column, so no layout changes needed. Buttons go full-width. Font sizes stay the same (rem-based, responsive to viewport).

---

### SCREEN 5: CHAT INTERFACE

**Purpose**: AI settlement advisor. Entry-point-aware, streaming responses, structured citations.

**URL**: `/chat` (full page) or slide-in panel from any screen

**Layout on desktop**: Can be accessed two ways:
1. **Sidebar panel**: 480px wide, slides in from right over the detail panel (or overlays on smaller viewports). Chat button in task detail or sidebar nav triggers this.
2. **Full page**: `/chat` URL, no task list, centered chat area (max-width 720px) with sidebar.

**Chat area components**:

**Header**:
- "LandedNZ Advisor" (--text-h3, --weight-semibold)
- Subtitle: "AI-powered · Based on official NZ sources" (--text-secondary, --color-text-secondary)
- Close button (X) if in panel mode

**Message thread**:
- AI messages: Left-aligned, --color-bg-card background, --color-border border, 12px border-radius, max-width 85% of chat area. Attribution below: "LandedNZ · AI Advisor · Just now" (--text-caption, --color-text-tertiary)
- User messages: Right-aligned, --color-primary-light background, --color-primary border at 0.3 opacity, 12px border-radius, max-width 85%
- Message spacing: --space-4 between messages, --space-6 between turns (user→AI or AI→user)

**Opening message (entry-point-aware)**:
- From task card: "You're looking at [task name]. What would you like to know about this?"
- From roadmap (no specific task): "Hi Priya — you've completed [X] tasks so far. What's your next question?"
- From chat nav item: "Hi Priya — ask me anything about settling in New Zealand. I have your roadmap context, so no need to explain your situation."

**AI response structure**:
- Source header (first line): "Based on [source name]" — (--text-caption, --color-text-tertiary, with source icon)
- Response body: Markdown-rendered with support for numbered lists, bold, and inline source pills
- Inline source pills: Small badges within text (--color-bg-sidebar background, --text-caption, rounded) showing source name. Clickable to expand source URL.
- Source footer: Bordered section at bottom of message with "Source: [Agency name] — [Page name]" + clickable URL
- For out-of-scope responses: Redirect card with icon, text explaining why it's out of scope, and link to appropriate resource

**Thinking state**:
- Three pulsing dots (--color-primary) left-aligned
- Below dots: "Checking NZ settlement guidance..." text (--text-secondary, --color-text-tertiary)
- If processing takes >2s, status text updates: "Looking up [specific topic]..."

**Input area (sticky at bottom)**:
- Text input: Full-width, multi-line (auto-expand to 3 lines max), --color-bg-card background, --color-border border
- Placeholder text: "Ask about this task..." (from task) or "Ask about your settlement..." (from roadmap)
- Send button: --color-primary background, arrow icon, 40px circle, right side of input
- Subtle note below input: "Responses are AI-generated. Always verify with official sources." (--text-caption, --color-text-tertiary)

**Crisis detection**:
- If user message contains distress signals (keyword detection per 07-feature-definition.md), the first response element is a Lifeline NZ resource card:
  - "If you're going through a tough time, free help is available."
  - "Lifeline NZ: 0800 543 354 (free, 24/7)"
  - This appears above the settlement response, not replacing it.

**Empty state**: The chat always has at least the opening message — there is no empty state.
**Loading state**: Thinking state (pulsing dots + status text)
**Error state**: Inline error message in thread: "I couldn't process that question. Try asking again, or rephrase it." — appears as a system message, not an AI response.

**Responsive**:
- 1280px+: Side panel (480px) or full page
- 1024px–1279px: Side panel (400px) or full page
- 768px–1023px: Full page only (no panel — not enough room)
- Below 768px: Full page, input sticky at bottom

---

### SCREEN 6: PREMIUM GATE

**Purpose**: Conversion moment. Appears inline in the roadmap when user reaches the premium boundary (after Phase 2 free tasks). Three paths: upgrade, defer, decline.

**NOT a separate page.** The premium gate appears as a card within the roadmap task list, between the last free task and the first premium task.

**Gate card components**:

**Teaser section** (top):
- Shows first 2-3 premium tasks in premium_locked card state
- User can see task names and truncated consequence lines
- Communicates "there's more value here" without being vague

**Gate card** (below teaser tasks):
- Background: --color-bg-card with subtle gradient at top (--color-premium-gold at 5% opacity)
- Border: 1px --color-border, top border 2px --color-premium-gold
- Padding: --space-8

**Content**:
- Heading: "Your first two weeks are covered. Ready to keep going?" (--text-h2, --weight-semibold)
- Subheading: "Your full 8-week settlement plan includes:" (--text-body, --color-text-secondary)
- Benefit list (3 items, each with check icon in --color-success):
  - "Complete Phase 3 roadmap — weeks 3 through 8"
  - "AI settlement advisor — ask any NZ question, get sourced answers"
  - "Smart reminders — we'll alert you before deadlines pass"
- Anchor line: "One week of IRD emergency tax costs ~$240. Six months of LandedNZ costs $49." (--text-body, --weight-semibold, --color-text-primary)

**Three paths**:
1. **Upgrade** (primary CTA): "Continue with Premium — $49 for 6 months" — full-width button, --color-primary background, --color-text-inverse text. Links to Stripe Checkout.
2. **Defer** (secondary): "Remind me in 24 hours" — outline button, --color-primary border and text. On click: stores deferral, sends email in 24 hours with specific task + consequence.
3. **Decline** (tertiary): "Stay on the free plan" — text link, --color-text-secondary. On click: gate card collapses to a minimal banner: "Premium available anytime — $49 for 6 months" with small "Upgrade" link.

**After decline — persistent banner**:
- Thin bar at top of Phase 3 section: "Premium unlocks your full roadmap — $49 for 6 months" with "Learn more" link
- Banner is dismissible (X button). Once dismissed, does not reappear for 7 days.

**Responsive**: Gate card is full-width within the roadmap content area. Three paths stack vertically on mobile. Button sizing stays consistent.

---

### SCREEN 7: SETTINGS / SUBSCRIPTION

**Purpose**: Profile management, subscription status, billing, and preferences.

**URL**: `/settings`

**Layout**: Single column, max-width 720px, centered. Sidebar visible. No right panel.

**Sections**:

**1. Profile**
- Name: Display name (editable)
- Email: From auth provider (read-only, with note "Managed by Google")
- Onboarding answers summary: Visa type, city, family situation, occupation, arrival date — each as a read-only field with "Edit" link that allows changing individual answers
- Note: "Changing your answers will update your roadmap to match."

**2. Subscription**
- Current plan: "Free" or "Premium (expires [date])"
- If free: "Upgrade to Premium" button + pricing info
- If premium: "Manage subscription" link (opens Stripe customer portal) + "Cancel subscription" text link
- Payment method: Last 4 digits of card (if premium)

**3. Notifications**
- Email reminders: Toggle on/off
- Reminder frequency: "Before deadlines only" (default) or "Weekly progress summary"
- Note: "We'll only email about tasks that matter — never spam."

**4. Account**
- "Sign out" button
- "Delete account" text link (opens confirmation: "This will permanently delete your roadmap, progress, and subscription. This cannot be undone." + "Delete my account" destructive button + "Cancel" link)

**Empty state**: N/A (always has profile data if authenticated)
**Loading state**: Skeleton for subscription status (may need to fetch from Stripe)
**Error state**: Inline error messages next to failed fields

**Responsive**: Already single-column. No layout changes needed.

---

### SCREEN 8: ROADMAP REVEAL (Transition)

**Purpose**: Transition screen between onboarding completion and the full roadmap dashboard. Creates a moment of anticipation and demonstrates personalisation.

**URL**: Momentary state within the `/onboarding` → `/roadmap` redirect

**Duration**: 1.5–2 seconds

**Layout**: Centered, full-viewport, no sidebar

**Animation sequence**:
1. (0–0.3s) All onboarding questions fade up and out
2. (0.3–0.8s) Center of screen: "Building your plan..." text fades in + subtle loading animation (three teal dots pulsing)
3. (0.8–1.5s) Context lines appear below, one at a time:
   - "Checking requirements for [visa type]..."
   - "Sequencing for [city]..."
   - "[Family/couple] adjustments applied..."
4. (1.5–2.0s) Fade to roadmap dashboard

**Key principle**: This is a psychological pause. The roadmap is generated server-side in <500ms. The 1.5-2s pause communicates "we're building something custom for you" — not "we're slow."

---

### SCREEN 9: AUTH (Sign Up / Sign In)

**Purpose**: Account creation to save progress. Appears after onboarding + first task interaction, not before.

**URL**: `/auth/signin`

**Layout**: Centered card (max-width 420px), full-viewport height, no sidebar

**Components**:
- Heading: "Save your progress" (--text-h1)
- Subheading: "Sign in to keep your roadmap and pick up where you left off." (--text-body, --color-text-secondary)
- Google OAuth button: Full-width, white background, Google logo + "Continue with Google" text. Standard Google branding.
- Divider: "or" with horizontal rules
- Email input: "Enter your email" + "Continue" button → magic link flow (Supabase)
- Note below: "We'll never share your email. No spam, ever."
- Terms: "By continuing, you agree to our Terms of Service and Privacy Policy" (--text-caption, --color-text-tertiary)

**Post-auth redirect**: Back to `/roadmap` with all onboarding data persisted.

**Empty state**: N/A
**Loading state**: Button shows spinner after click, disabled state
**Error state**: Inline error below input: "Something went wrong. Please try again." or "No account found with this email."

---

## ANIMATION PRINCIPLES

### What Animates
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Task completion | Checkmark draws in, card mutes | 0.3s | ease-out |
| Detail panel open | Slide from right | 0.25s | ease-out |
| Detail panel close | Slide to right | 0.2s | ease-in |
| Onboarding question appear | Fade in + slide up 16px | 0.3s | ease-out |
| Onboarding answer lock | Border colour transition + check appear | 0.2s | ease-out |
| Premium gate appear | Fade in | 0.2s | ease-out |
| Chat message (AI) | Fade in from bottom 8px | 0.15s | ease-out |
| Chat message (user) | Instant (no animation) | 0 | — |
| Progress bar fill | Width transition | 0.4s | ease-out |
| Skeleton pulse | Opacity 0.4 → 0.7 → 0.4 | 1.5s | linear loop |
| Phase section expand/collapse | Height transition | 0.2s | ease-out |

### What Does NOT Animate
- Page navigation (instant)
- Tab switching (instant)
- Form inputs, selections (instant visual feedback)
- Sidebar expand/collapse on desktop (0.1s max, near-instant)
- Scroll (native browser behaviour)

### Reduced Motion
When `prefers-reduced-motion: reduce` is set:
- All animations disabled
- Transitions replaced with instant state changes
- Skeleton pulse replaced with static skeleton (0.5 opacity)
- Loading indicators replaced with static spinner icon

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Layout | Sidebar | Detail Panel | Chat |
|------------|--------|---------|-------------|------|
| 1280px+ | Three-column | 256px expanded | 480px right panel | Side panel or full page |
| 1024px–1279px | Two-column + collapsed sidebar | 64px icon-only | 400px right panel | Side panel or full page |
| 768px–1023px | Single column + collapsed sidebar | 64px overlay | Slide-over overlay | Full page only |
| Below 768px | Single column, no sidebar | Hamburger menu | Full page navigate | Full page only |

### Responsive Rules
1. Content max-width (960px) is the same across all breakpoints — it's the sidebar and panel that adjust
2. Font sizes do not change (rem-based, responsive to browser settings)
3. Card padding reduces from --space-6 to --space-4 below 768px
4. Button heights: 48px on desktop, 52px on mobile (larger touch targets)
5. Task cards: no layout change, just width adapts to container
6. Images (hero, illustrations): max-width 100%, aspect ratio preserved

---

## FIRST-USE EXPERIENCE HINTS

When a user first sees the roadmap (first session only), contextual hints appear:

**Hint 1** (on the "Do these first" section):
- Tooltip pointing to the first task card: "Start here — tap any task to see what to do and why."
- Dismiss: Click anywhere or "Got it" button

**Hint 2** (on the sidebar Phase sections):
- Tooltip: "Your full plan is organised by phase. Each phase covers a specific time period."
- Appears after Hint 1 is dismissed

**Hint 3** (after first task detail is opened):
- Tooltip on "Ask a question" button: "Have questions? Our AI advisor knows your situation and can help."
- Only appears if user is premium or on trial

Hints stored in localStorage (or user profile flag). Never shown again after first dismissal.

---

## ERROR HANDLING PATTERNS

### API Errors (Network / Server)
- Inline error card within the content area: "Something went wrong. We're looking into it." + "Try again" button
- No technical details (no error codes, no stack traces)
- Error card uses --color-error-light background, --color-error text

### Auth Errors
- Inline below the auth input: "Couldn't sign in. Please check your email and try again."
- For OAuth: "Google sign-in failed. Please try again."

### Validation Errors (Onboarding)
- Not applicable — onboarding uses selection cards, no free-text input that can be invalid
- Date picker: if date is invalid, inline: "Please select a valid date."

### Chat Errors
- System message in thread: "I couldn't process that. Try rephrasing your question."
- Not styled as an AI response — uses system message styling (centered, --color-text-tertiary, --text-secondary)

### Payment Errors
- Handled by Stripe Checkout — LandedNZ displays: "Payment didn't go through. You can try again anytime." + link back to premium gate

---

*This document is the definitive spec for building `apps/web/src/`. Every screen, every component, every state, every animation, and every responsive breakpoint is defined. Claude Code should reference this document when implementing any web UI component.*
