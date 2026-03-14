# Phase 2 Pre-Analysis — Roadmap Engine
# File: rpi/phase2-roadmap-engine/research/pre-analysis.md
# Status: APPROVED — read this before every Phase 2 AC
# Purpose: Resolves all spec ambiguities before implementation begins.
#          Supersedes conflicting values in 12-build-specification.md and SKILL.md.
#          When this file conflicts with any other file — THIS FILE WINS.

---

## SECTION 1 — Canonical basePriority Values (T01–T21)

Source: landednz_kb.md (authoritative — verified 2026-03-14)
These are the ONLY correct basePriority values. Do not use any other source.

| ID  | Task                          | basePriority |
|-----|-------------------------------|-------------|
| T01 | Auckland suburb research      | 90          |
| T02 | Temporary accommodation       | 88          |
| T03 | Overseas bank prep            | 82          |
| T04 | Moving insurance              | 72          |
| T05 | Home country tax              | 70          |
| T06 | NZ SIM card                   | 98          |
| T07 | Open NZ bank account          | 95          |
| T08 | IRD number application        | 98          |
| T09 | Tax code declaration (IR330)  | 97          |
| T10 | KiwiSaver election            | 90          |
| T11 | Rental agreement + bond       | 88          |
| T12 | GP registration               | 85          |
| T13 | ACC overview                  | 70          |
| T14 | NZ tenancy rights             | 72          |
| T15 | International remittances     | 75          |
| T16 | NZ driving licence            | 65          |
| T17 | NZQA assessment               | 60          |
| T18 | Build NZ credit history       | 58          |
| T19 | NZ CV and LinkedIn            | 55          |
| T20 | KiwiSaver confirmation        | 50          |
| T21 | Joint bank account            | 45          |

---

## SECTION 2 — Scoring Formula (confirmed)

```
finalScore = basePriority + personaWeight + timeUrgencyBonus - dependencyPenalty
```

All four components always present. No component is optional.
dependencyPenalty = 50 if ANY unmet HARD dependency exists, else 0.

---

## SECTION 3 — Dependency Graph (confirmed — complete)

| Prerequisite      | Dependent                    | Type |
|-------------------|------------------------------|------|
| T06 (SIM)         | T07 (bank)                   | HARD |
| T07 (bank)        | T08 (IRD)                    | SOFT |  ← see Issue 1 below
| T07 (bank)        | T11 (rental bond)            | HARD |
| T07 (bank)        | T15 (remittances)            | HARD |
| T07 (bank)        | T21 (joint account)          | HARD |
| T08 (IRD)         | T09 (tax code)               | HARD |
| T08 (IRD)         | T10 (KiwiSaver election)     | SOFT |
| T08 (IRD)         | T20 (KiwiSaver confirmation) | HARD |
| T10 (KiwiSaver)   | T20 (KiwiSaver confirmation) | HARD |
| T01 (suburb)      | T11 (rental)                 | SOFT |
| T11 (rental)      | T21 (joint account)          | SOFT |
| T14 (tenancy)     | T11 (rental)                 | SOFT |

HARD dependency = -50 penalty if unmet. Task must not appear in top 3.
SOFT dependency = no penalty. Task can appear in top 3. Ordering only.

---

## SECTION 4 — Persona Weights (confirmed)

| Task | constrained_couple | family_with_children | solo_aewv |
|------|--------------------|---------------------|-----------|
| T08  | +20                | +15                 | +10       |
| T09  | +20                | +15                 | +10       |
| T10  | +15                | +10                 | +5        |
| T11  | +10                | +15                 | +5        |
| T12  | +10                | +20                 | +5        |
| T16  | +5                 | +15                 | +5        |
| T01  | 0                  | +20                 | 0         |

All tasks not listed: personaWeight = 0 for all personas.

---

## SECTION 5 — Time Urgency Bonuses (confirmed)

| Condition                                      | Bonus |
|------------------------------------------------|-------|
| Days 1–3, T06 (SIM) not complete              | +30   |
| Days 1–3, T07 (bank) not complete             | +30   |
| Days 4–14, T08 (IRD) not applied              | +25   |
| T08 applied, T09 (tax code) not declared      | +28   |
| Month 10–11, T16 (foreign licence) in use     | +30   |
| February–March, tax tasks incomplete          | +25   |

Rules:
- Bonuses are additive if multiple conditions apply simultaneously
- Days calculated from arrivalDate to currentDate
- If arrivalDate is null (PRE_ARRIVAL state) → all time urgency bonuses = 0
- "Days 1–3" means days 1, 2, 3 inclusive. Day 4 onward = bonus expired for T06/T07
- "Month 10–11" means days 300–365 since arrival (approximate)

---

## SECTION 6 — Resolved Ambiguities

### Issue 1 — T07→T08 dependency type (RESOLVED)

CONFLICT:
- 12-build-specification.md (Golden 1 comment): implies T07→T08 is HARD
- priority-engine/SKILL.md (dependency graph): T07→T08 is SOFT

RESOLUTION: T07→T08 is **SOFT**.

RATIONALE: IRD number application does not require a NZ bank account as a hard
prerequisite — an overseas account can be given temporarily. The bank account
makes it easier but does not block the IRD application. SKILL.md is correct.
Build spec comment is wrong. SOFT means no -50 penalty when T07 is incomplete.

IMPACT: T08 is never blocked by T07. T08 score at Day 2 with no completions =
98 (base) + persona + urgency. No penalty applied.

---

### Issue 2 — Golden 1 third position (RESOLVED)

CONFLICT:
- 12-build-specification.md: topThreeIds = ["T06", "T07", "T03"]
- Actual scores: T08 = 118 at Day 2, T03 = 82. T08 beats T03 by 36 points.

RESOLUTION: Golden 1 third position is **T08**, not T03.

PROOF (constrained_couple, Day 2, no completions):
```
T06 = 98 + 0  + 30 + 0 = 128  ← first
T07 = 95 + 0  + 30 + 0 = 125  ← second
T08 = 98 + 20 + 0  + 0 = 118  ← third (SOFT dep on T07 — no penalty)
T03 = 82 + 0  + 0  + 0 = 82   ← fourth (pre-arrival task, no urgency)
```

Note: T08 urgency (+25) does NOT fire on Day 2 — the condition is Days 4–14.
Day 2 falls inside the T06/T07 urgency window (Days 1–3) not the T08 window.

CORRECTED: topThreeIds = **["T06", "T07", "T08"]**

---

### Issue 3 — Golden 2 expected output (RESOLVED)

CONFLICT:
- 12-build-specification.md: topThreeIds = ["T08", "T09", "T10"]
- T09 has HARD dep on T08. T08 not in completedTaskIds. T09 must be blocked.

RESOLUTION: Golden 2 expected output is **["T08", "T10", "T11"]**.

PROOF (constrained_couple, Day 2, completedTaskIds = ["T06", "T07"]):
```
T08 = 98 + 20 + 25 + 0  = 143  ← first (T07 complete, SOFT dep resolved, urgency fires)
T10 = 90 + 15 + 0  + 0  = 105  ← second (SOFT dep on T08 — not penalised)
T11 = 88 + 10 + 0  + 0  = 98   ← third (T07 complete, HARD dep resolved)
T09 = 97 + 20 + 28 - 50 = 95   ← fourth (HARD blocked by T08 — T08 not complete)
```

T09 scores 95 after penalty — below T11 at 98. T09 cannot be third.
T09 note: urgency +28 fires because "T08 applied, T09 not declared" —
but T08 is NOT applied in Golden 2. Therefore +28 does NOT fire.

CORRECTED PROOF:
```
T09 = 97 + 20 + 0 - 50 = 67   ← T08 not applied, urgency doesn't fire
```

T09 is definitively fourth at 67. T11 at 98 is third.
CORRECTED: topThreeIds = **["T08", "T10", "T11"]**

---

### Issue 4 — Golden 3 (CONFIRMED CORRECT)

No conflict. Verified by calculation.

PROOF (constrained_couple, Month 11, completedTaskIds = T06–T12):
```
T16 = 65 + 5  + 30 + 0 = 100  ← urgency fires at month 10-11 ✅
T15 = 75 + 0  + 0  + 0 = 75
T14 = 72 + 0  + 0  + 0 = 72
T13 = 70 + 0  + 0  + 0 = 70
```

T16 at 100 comfortably leads all remaining incomplete tasks.
topThreeContains: "T16" — **CORRECT AS WRITTEN**.

---

### Issue 5 — Golden 4 (CONFIRMED CORRECT)

No conflict. Verified by calculation.

PROOF (solo_aewv, Day 5, completedTaskIds = []):
```
T08 = 98 + 10 + 25 + 0  = 133  ← first (SOFT dep on T07, not blocked)
T06 = 98 + 0  + 0  + 0  = 98   ← second (Day 5 — Days 1-3 urgency expired)
T10 = 90 + 5  + 0  + 0  = 95   ← third (SOFT dep on T08, not penalised)
T07 = 95 + 0  + 0  - 50 = 45   ← blocked (HARD dep on T06 — T06 not complete)
T09 = 97 + 10 + 0  - 50 = 57   ← blocked (HARD dep on T08 — T08 not complete)
```

T09 at 57 is well outside top 3. topThreeExcludes: "T09" — **CORRECT AS WRITTEN**.

Note: T08 urgency (+25, Days 4–14) fires on Day 5. Correct.
Note: T06/T07 urgency (+30, Days 1–3) does NOT fire on Day 5. Correct.
Note: T09 urgency (+28) does NOT fire — T08 not yet applied. Correct.

---

## SECTION 7 — Corrected Golden Examples (implement these exactly)

```typescript
// GOLDEN 1: constrained_couple, Day 2, no completions
// T06=128, T07=125, T08=118
const golden1Expected = {
  topThreeIds: ["T06", "T07", "T08"],
};

// GOLDEN 2: constrained_couple, Day 2, completedTaskIds=["T06","T07"]
// T08=143, T10=105, T11=98, T09=67 (blocked+no urgency)
const golden2Expected = {
  topThreeIds: ["T08", "T10", "T11"],
  T08Score: 143,  // 98 + 20 + 25 + 0
};

// GOLDEN 3: constrained_couple, Month 11, completedTaskIds=T06–T12
// T16=100 — urgency fires
const golden3Expected = {
  topThreeContains: "T16",
  T16Score: 100,  // 65 + 5 + 30 + 0
};

// GOLDEN 4: solo_aewv, Day 5, no completions
// T09=57 — HARD blocked, urgency does not fire
const golden4Expected = {
  topThreeExcludes: "T09",
  T09Score: 57,   // 97 + 10 + 0 - 50
};
```

---

## SECTION 8 — Edge Cases to Handle

These are not covered by golden examples but must be handled correctly:

1. **All top tasks blocked** — every non-complete task has an unmet HARD dep.
   Return whatever tasks are available even if all are blocked. Never return empty.
   Surface the least-blocked task with a "complete X first" message.

2. **arrivalDate in the future (PRE_ARRIVAL state)**
   All time urgency bonuses = 0. Pre-arrival tasks (T01–T05) dominate.

3. **All tasks complete**
   Return empty topThree. UI handles this as "settlement complete" state.

4. **Unknown persona** (familySituation not in known values)
   Default to solo_aewv weights. Never throw — degrade gracefully.

5. **Simultaneous urgency bonuses**
   Bonuses are additive. A task can receive multiple bonuses simultaneously.
   No cap on total urgency bonus.

---

## SECTION 9 — What This File Does NOT Change

Everything not mentioned above remains exactly as specified in:
- priority-engine/SKILL.md
- 12-build-specification.md
- knowledge-base-schema/SKILL.md

This file only supersedes the specific items listed in Section 6.
