# AC-2-15 Instructions
# This file is read by /rpi:research before AC-2-15.
# It supersedes any conflicting instructions in REQUEST.md or 12-build-specification.md.
# AC-2-15 is non-standard. Follow this workflow exactly.

---

## What makes AC-2-15 non-standard

AC-2-15 is not just an implementation task. It is a content accuracy task.
The seed data is the backbone of the entire app — Phase 4 AI chat and Phase 5 RAG
both depend on its quality. Poor content here = poor AI answers forever.

This is a verify-then-seed workflow, not a copy-then-seed workflow.

---

## Step 1 — Verify before seeding (do this BEFORE writing any seed code)

For each task T01–T21, read its entry in `landednz_kb_master_COMPLETE_v1.md`.
Then fetch its Tier 1 source URL (listed in SOURCES field).

Verify:
- Key facts in WHAT_AND_WHY match the live government page
- Steps in HOW_TO are current and accurate
- All Type B numbers match current published figures
- Source URLs return HTTP 200 (not 404, not redirect to different content)

Flag any discrepancy. Do NOT seed a task until its Tier 1 source is verified.

## Step 2 — Number type discipline

TYPE A (Statutory) — state as confirmed fact, cite legislation section.
TYPE B (Administrative) — confirm against live source URL.
  Add caveat in content: "confirm current rate at [url] as this is reviewed periodically."
  If current figure cannot be confirmed from live source — flag it, do not seed unconfirmed.
TYPE C (Market) — mark as guidance only.
  Add caveat: "check current rates with [provider] as these vary."

## Step 3 — URL liveness check

Fetch every source URL in the SOURCES field for each task.
Flag any URL that returns non-200 or redirects to a different page than expected.
Content supported only by dead URLs needs re-verification before seeding.

## Step 4 — Write seed script

Only after Steps 1–3 pass for a task, write its seed records.
Field mapping from landednz_kb_master_COMPLETE_v1.md:

| KB field                    | Prisma column                     |
|-----------------------------|-----------------------------------|
| SUMMARY                     | summary                           |
| WHAT_AND_WHY                | whatAndWhy                        |
| HOW_TO                      | howTo                             |
| KEY_FACTS (bullets as array)| keyFacts String[]                 |
| WATCH_OUTS (bullets as array)| watchOuts String[]                |
| PROFESSIONAL_ADVICE_REQUIRED| professionalAdviceRequired Boolean|
| PROFESSIONAL_ADVICE_NOTE    | professionalAdviceNote String?    |
| PERSONA_CONSTRAINED_COUPLE  | persona variant: constrained_couple|
| PERSONA_SOLO_AEWV           | persona variant: solo_aewv        |

Both persona variants required for every task.
No TODOs. No placeholders. Production quality only.

## Step 5 — Post-seed validation script

Write `scripts/validate-seed-content.ts` that checks:
- No null/empty required fields in any TaskContentVariant
- All source URLs resolve (HTTP 200)
- Type B numbers have recency caveats in content
- professionalAdviceRequired tasks have non-null professionalAdviceNote
- Task count = 21, variant count >= 42

Run after seeding. Output pass/fail per task.
AC-2-15 is NOT complete until this script passes cleanly.

## Step 6 — Verification report (required before seed script runs)

Write to: `rpi/phase2-roadmap-engine/research/AC-2-15-verification-report.md`

Include:
- Tasks verified clean (T01–T21 status)
- Any discrepancies found between KB content and live sources
- Any URLs that failed liveness check
- Any Type B numbers that could not be confirmed
- Whether all source URLs returned HTTP 200

This report must be reviewed by the human before the seed script runs against
the real database. Present it and STOP. Do not run the seed script until confirmed.

---

## Phase 2 gate additions for AC-2-15

Before /rpi:gate phase2 passes, verify:
- AC-2-15-verification-report.md exists and was reviewed
- validate-seed-content.ts passes cleanly
- SELECT count(*) FROM "Task" = 21
- SELECT count(*) FROM "TaskContentVariant" >= 42
- No empty required fields in any variant
- All source URLs resolve

---

## Why this matters

landednz_kb_master_COMPLETE_v1.md was written on 2026-03-03.
NZ government policy changes regularly — IRD processes, tenancy law, ACC levies,
NZQA fees. Some content may already be outdated.

If a real migrant follows wrong IRD steps, they could face the 45% emergency tax rate.
That is a real financial consequence. The verification step exists because of this.

Do not skip Steps 1–3 to save time. The verification IS the work.
