# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Skilled migrants in their first 90 days in New Zealand. They use LandedNZ in two ways, about equally:

- **Planning ahead:** before or just after landing, usually at a desk, looking at the whole 90 days and planning around it.
- **Quick check-ins:** busy while settling in, often on a phone, opening it for a minute to see what's due and tick things off.

## Product Purpose

A personalised, dependency-aware settlement roadmap with an AI settlement assistant. It tells each person which tasks apply to them (IRD number, bank account, visa conditions and so on), in what order, and why, and answers questions with cited official sources.

Success, in priority order: real migrants trust and rely on it to settle in; it is also good enough for a portfolio or investor demo. When the two conflict, trust wins.

## Positioning

The roadmap is built from the person's own profile and from verified official NZ sources, and it knows which tasks depend on which. A generic checklist or blog post cannot do that.

## Operating Context

- Content is a verified YAML knowledge base built from official NZ government sources and cited in the app.
- The roadmap is made of stages (legs) that hold tasks; each task has a state (done, current, available, blocked), a time estimate and a "why".
- Tasks are opened as a task page (`/app/roadmap?task=<id>`) with steps, sources and Ask.
- Signed-in pages: Home (`/app`), Roadmap (`/app/roadmap`), task page, Settings.

## Capabilities and Constraints

- Light-only web app (Next 16, Tailwind 4, shadcn/ui). No dark mode, no mobile app in R0.
- R0 ships no new features: redesigns work with existing data (profile, roadmap legs/tasks, arrival date).
- Later releases add cited answers (R1), an agent that acts on the roadmap (R2), conversational onboarding (R3) and document intelligence (R4); layouts must not block them.
- Open decision: whether the track metaphor, the stage names/order and the current voice are binding. The owner wants to try variations and decide from them (2026-10-28).

## Evidence on Hand

- Knowledge base in `content/` (verified official sources). No real user testimonials, usage numbers or customers exist; do not invent them.

## Product Principles

1. Trust before showiness: accurate, sourced and calm beats impressive.
2. Always make the next step obvious.
3. Serve both the 90-day planner and the one-minute check-in.
4. Designs are chosen from visible variations the owner has seen, never assumed.
