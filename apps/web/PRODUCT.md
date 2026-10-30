# Product

<!-- impeccable:product-schema 1 -->

Scope: this record covers the settlement guide (the chat) only. The rest of the app keeps its approved r1-final design (`docs/design/r1-final`) and is not redesigned from this file.

## Platform

web

## Users

Skilled migrants new to New Zealand, in their first 90 days, often in Auckland. They arrive with a personalised roadmap of settlement tasks (IRD number, bank account, SIM, accommodation, health cover). They open the guide mid-task, usually with one concrete question, on a laptop or a phone, sometimes tired or stressed.

## Product Purpose

The guide answers settlement questions using the user's profile, roadmap and progress, links to their tasks by real title, and suggests the next step. It is read-only: it changes nothing. Success: a correct, cited answer the user can act on, without leaving the task they are on.

## Positioning

Every claim is cited. Answers come from LandedNZ's checked guide first, then a fixed allowlist of official NZ sites, never from model memory. Each answer is labelled "From LandedNZ's checked guide" or "From official sites, checked today". A general chatbot cannot truthfully claim this.

## Operating Context

- Reachable from home, roadmap and task screens, at 1440 desktop and 390 phone.
- One continuous conversation per user, synced across devices; each question records the screen it came from. Opened from a task, that task's messages show first, with full history available.
- Answers arrive sentence by sentence; shown text is never taken back. One answer streams at a time per user.
- 20 questions per user per day, reset at midnight NZ time.

## Capabilities and Constraints

- Answer parts: direct answer, steps, "What I can't tell you", source chips with origin label, task links, `unverified` note, at most one follow-up, "Checking…" notices, truncated notice.
- States: streaming with Stop, interrupted, failed with Retry, busy in another window, daily cap reached, nothing found (points to the right agency), official sites unavailable, empty first visit, distress reply with fixed crisis text (1737, Lifeline 0800 543 354, 111).
- Opening: one 'where you are' line and at most 3 starter questions. In the full view the starters stay under 'Try asking' after the conversation starts.
- Memory: only facts the user stated; shown in-chat as "Remembered: …" with undo; listed in Settings → Memory with edit and delete; at most 50; deletes are hard.
- Internal IDs are never shown. English only, no voice. No pop-ups, badges or nudges outside the guide.
- Light theme only; design tokens only; reduced motion respected. The UI never parses reply text; it renders typed parts.

## Brand Commitments

- Name: LandedNZ.
- Voice: calm checked expert. Plain, short, precise, warm without chat. No exclamation marks. Matches existing copy ("You can undo this.", "Nothing yet.").
- First proof: answers are checked. Sources and the origin label lead each answer.
- Footer line stays: "General information, not legal or tax advice."

## Evidence on Hand

Real task content and official sources live in the app's content bundle (e.g. "Apply for your IRD number", ird.govt.nz pages). No testimonials, user counts or accuracy figures exist; do not invent them.

## Product Principles

1. Checked before clever: show where every fact came from.
2. Stay in the task: the guide sits beside the user's work, not instead of it.
3. Quiet by default: one line, three starters, one follow-up, nothing outside the chat.
4. Nothing hidden: every memory is visible and removable.
5. Honest edges: say plainly what the guide can't tell, and who can.

## Accessibility & Inclusion

WCAG 2.2 AA. Many users read English as a second language: plain words, short sentences. Streaming must work with screen readers and reduced motion. Crisis text is always readable and never animated away.
