# LandedNZ — Web Layout Analysis (from Linear, Notion, Intercom Fin)
# Carry this into the mockup session. This is what the screenshots actually show.

---

## CORE RULE: Always two windows — sidebar | content. Nothing else.

---

## LINEAR — Issues List View (exact observations)

- Sidebar and content share the SAME top edge — zero gap, zero offset
- Content area top bar: workspace name left-aligned, flush to top — no padding above it
- Filter tabs ("All issues" / "Active" / "Backlog") sit DIRECTLY below the title — no padding between title and tabs
- Below tabs: group header row ("Todo 4") — very thin, just text + count, subtle background tint
- Task rows: EXTREMELY minimal — row height ~36px
  - Three dots menu → issue ID → status circle → title → right-aligned metadata (assignee, date)
  - No cards, no borders between rows — just the faintest hairline separator
  - No description text visible in list rows — title only
- Entire content area is white background, edge to edge
- No progress bars, no hero cards, no floating elements in the list view
- Filter icons (funnel, settings) right-aligned in the tab bar area

## LINEAR — Issue Detail View (when you click an issue)

- The list view is REPLACED entirely — not split side by side
- Breadcrumb at top: "Workspace > TES-1 Issue title" with navigation arrows (1/4) at far right
- Content takes the LEFT portion of the content area: issue title (large), body text, video
- Properties panel sits RIGHT-ALIGNED WITHIN the same content area — not a third column
  - Properties panel sections: Properties (status, priority, assignee), Labels, Project
  - Each section has a header with disclosure triangle
  - Property rows: label left, value right — very compact
- Same sidebar stays completely unchanged
- Still TWO windows total: sidebar | content (content internally splits into body + properties)

## LINEAR — Empty State (My Issues > Assigned)

- Filter tabs at top: "Assigned" / "Created" / "Subscribed" / "Activity"
- Centered illustration + "No issues assigned to you" + single CTA button
- Clean, zero clutter, filter tabs still present above the empty state

---

## NOTION — Home Screen (exact observations)

- Sidebar is its own column — content area is a separate white area
- "Good evening" is LARGE text (~28px, bold) centered horizontally in the content area
  - This IS the page content — not a header bar, not a floating card
  - No background colour, no card wrapper — just text on the white page
- Below greeting: content sections flow vertically as page content
  - "Recently visited" — small label, then card thumbnails in a row
  - "Learn" — section label, then tutorial cards in a horizontal row
  - "Upcoming events" — section label, then event rows
- Each section has a small icon + label header (clock icon + "Recently visited")
- No extra padding or spacing between sidebar and content — they share the same top edge
- Sidebar sections: Search, Home, Meetings, Notion AI, Inbox, Library — then Private pages, Teamspaces
- Active nav item (Home) has highlight background — similar to Linear

---

## INTERCOM FIN — Chat Panel (exact observations)

- Chat is a FLOATING PANEL overlaid on the page — not embedded in the layout
- Panel appears bottom-right, approximately 350px wide, ~500px tall
- Panel has: header (Fin icon + name + "The team can also help" + close X), conversation area, input
- Header: back arrow left, Fin branding center, close button right
- AI messages: dark background bubble, left-aligned, with "Fin · AI Agent · Just now" below
- User messages: light background bubble, right-aligned
- Typing indicator: three animated dots in a dark bubble
- Input: "Message..." placeholder, attachment icon, emoji, GIF, mic, send arrow
- "Powered by Fin" footer below input
- Panel has rounded corners, slight shadow — it floats above the page content

---

## WHAT THIS MEANS FOR LANDEDNZ

### Roadmap list view (home screen):
- Title area: "Good evening, Priya" as page content text (Notion-style) — NOT a card, NOT a hero
  - Progress indicator inline next to title or as subtle subtext — not a separate section
- Tabs immediately below: "Active" / "All tasks" / "Completed" — flush, no gap (Linear-style)
- Task rows below tabs: Linear density — status circle, task name, time estimate right-aligned
  - Group headers for phases: "Phase 2 · First 2 weeks" — thin row, subtle bg
  - Blocked tasks: muted, lock icon in status circle
  - Premium tasks: gold lock icon, "Premium" pill right-aligned
  - Row height: ~36px, tight
- No cards wrapping anything. No floating elements. No hero progress cards.

### Task detail view (when task clicked):
- Content area REPLACES list view (Linear pattern) — not a side panel
- Breadcrumb at top: "Roadmap > Open a bank account"
- Left side: task content (consequence callout, steps, documents, source link)
- Right side: properties panel (status, phase, time, difficulty, depends on, unlocks) — within same content area
- Back navigation via breadcrumb or back arrow

### Chat:
- Floating panel overlay (Intercom Fin pattern) — not a full page, not a sidebar replacement
- Opens from "Ask a question" button on task detail, or from Chat nav item
- Overlays the current content — does not change the layout

### Key differences from what I built before:
1. NO three-column layout — ever. Sidebar + content only.
2. NO hero progress card — greeting is text content, progress is a subtle bar
3. NO card wrappers on task rows — bare rows like Linear
4. Task detail REPLACES list — not a side panel
5. Chat is a FLOATING OVERLAY — not embedded in the layout
6. Everything flush — no extra padding between title and tabs, between tabs and rows
