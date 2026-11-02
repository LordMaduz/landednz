# Product

LandedNZ is a personalised settlement roadmap and a cited question-and-answer guide for skilled migrants in their first 90 days in New Zealand. Live at <https://landednz.co.nz>.

## Who it is for

People arriving in New Zealand, or about to, on a work or residence visa. They are unfamiliar with local systems (IRD number, bank account, tenancy bond, driver licence, KiwiSaver) and need practical steps they can check against the official source. They use a laptop or a phone, often mid-task.

## What it does

**1. A roadmap built from five answers.** Onboarding asks for a visa type, a city, who is moving with the person, their kind of work and an arrival date (`apps/api/content/dimensions.yaml`). Every task in the content set carries conditions on those answers, so each person sees the tasks and the wording that apply to them. A preview shows the roadmap before sign-in; saving it needs an account.

**2. Tasks with sources.** Each task has steps, documents, common mistakes, watch-outs and cost. Every item names its official source and the date it was last checked (`apps/api/content/tasks/*.yaml`). People can mark a task complete, reopen it, or mark several tasks at once.

**3. Ordering that responds to the person.** Tasks are ranked by a base priority, boosts for the person's answers, time-based urgency after arrival, and a penalty while a prerequisite is unfinished (`apps/api/src/core/priority/scoring.ts`, `core/dependencies/resolver.ts`). The roadmap is grouped into five legs: Before you flew, Arrival, Week 1, Month 1, Later.

**4. A settlement guide.** An assistant answers questions using the person's profile and progress. It answers from LandedNZ's checked content first, then from a fixed list of official New Zealand sites. Each answer shows which of the two it came from. It is read-only: it changes nothing in the roadmap. See [architecture.md](architecture.md#settlement-guide).

**5. Public guides** (on `main`, not yet on the live site at the time of writing). One page per task at `/guides/[slug]`, generated from the same content so the public pages and the app never disagree.

## Screens

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/about`, `/privacy`, `/terms` | Public information and legal pages |
| `/signin` | Google sign-in (password sign-in is enabled locally and in staging only) |
| `/onboarding`, `/onboarding/preview` | Questionnaire and roadmap preview |
| `/app` | Home: next steps and the journey strip |
| `/app/roadmap` | Full roadmap, task sheets |
| `/settings` | Details, memory the guide has kept, account deletion |
| `/guides`, `/guides/[slug]` | Public guides (on `main`) |

The guide opens as a pane from Home, Roadmap and task screens (full view on wider screens, a sheet on phones).

## Trust model

- **Every claim traces to a source.** Content items carry a source, a last-checked date and a `verified` flag. The content build fails on unverified items unless explicitly allowed for local development, and flags items older than their freshness window (3, 6 or 12 months by source tier).
- **The guide does not answer from model memory.** Its answers are restricted to retrieved passages from the checked content or allowlisted official pages. Citations are checked against the passages that were sent, and uncited factual sentences are flagged to the reader.
- **Distress is handled with fixed text.** A crisis signal produces fixed text first (1737, Lifeline 0800 543 354, 111), before any settlement information.
- **Scope is bounded.** One question limit per person per New Zealand day (default 20). Memory stores only facts the person stated, shown in chat with undo and editable in Settings.
- **The footer states the limit:** "General information, not legal or tax advice."

## Deliberately not built

- An autonomous agent that takes actions for the person. The guide reads and explains; the person decides and acts.
- Payments. Everything is free during the beta (`BETA_MODE`); a leftover `Subscription` table is unused.
- Dark mode, voice and languages other than English.

## Design and engineering

- Visual system: [design-system.md](design-system.md)
- Technical design: [architecture.md](architecture.md)
- Deployment: [deployment.md](deployment.md)
