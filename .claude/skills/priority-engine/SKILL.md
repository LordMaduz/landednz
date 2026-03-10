# Skill: Priority Engine
# Domain knowledge for implementing core/priority/ functions.
# Preloaded by: senior-software-engineer agent

---

## What this skill covers

Everything needed to implement and maintain the priority scoring and task filtering
functions in `apps/api/src/core/priority/`. These are pure functions — zero framework
dependencies. TDD required for all of them.

---

## Files in scope

```
apps/api/src/core/priority/
├── scoring.ts          ← scoreTask() — the scoring formula
├── scoring.test.ts     ← unit tests + golden examples
├── filter.ts           ← filterApplicableTasks(), derivePersonaKey()
└── filter.test.ts
```

---

## Scoring formula

```
final_priority = basePriority + personaWeight + timeUrgencyBonus - dependencyPenalty
```

All four components are always present. No component is optional.

---

## Persona weights (exact values — do not deviate)

| Task | constrained_couple | family_with_children | solo_aewv |
|------|--------------------|---------------------|-----------|
| T08 IRD application | +20 | +15 | +10 |
| T09 Tax code declaration | +20 | +15 | +10 |
| T10 KiwiSaver election | +15 | +10 | +5 |
| T11 Rental agreement | +10 | +15 | +5 |
| T12 GP registration | +10 | +20 | +5 |
| T16 Driving licence | +5 | +15 | +5 |
| T01 Suburb research | 0 | +20 | 0 |

All other tasks: personaWeight = 0 for all personas.

---

## Time urgency bonuses (exact values — do not deviate)

| Condition | Bonus |
|-----------|-------|
| Days 1–3, T06 (SIM) incomplete | +30 |
| Days 1–3, T07 (bank) incomplete | +30 |
| Days 4–14, T08 (IRD) not applied | +25 |
| T08 applied, T09 (tax code) not declared | +28 |
| Month 10–11, T16 (foreign licence) in use | +30 |
| February–March, tax tasks incomplete | +25 |

Bonuses are additive if multiple conditions apply simultaneously.
"Days since arrival" is calculated from `arrivalDate` to `currentDate`.
If `arrivalDate` is null (PRE_ARRIVAL), all time urgency bonuses = 0.

---

## Dependency penalty

| Condition | Penalty |
|-----------|---------|
| Task has any unmet HARD dependency | -50 |

`isBlocked` = true means at least one HARD dependency is not in completedTaskIds.
SOFT dependencies do NOT trigger the penalty — they only affect ordering.
A penalty of -50 ensures blocked tasks never surface in top 3.

---

## Dependency graph (complete — T01–T21)

| Prerequisite | Dependent | Type |
|-------------|-----------|------|
| T06 (SIM) | T07 (bank) | HARD |
| T07 (bank) | T08 (IRD) | SOFT |
| T07 (bank) | T11 (rental bond) | HARD |
| T08 (IRD) | T09 (tax code) | HARD |
| T08 (IRD) | T10 (KiwiSaver) | SOFT |
| T01 (suburb) | T11 (rental) | SOFT |
| T14 (tenancy rights) | T11 (rental) | SOFT |
| T07 (bank) | T21 (joint account) | HARD |
| T11 (rental) | T21 (joint account) | SOFT |
| T08 (IRD) | T20 (KiwiSaver confirmation) | HARD |
| T10 (KiwiSaver election) | T20 (KiwiSaver confirmation) | HARD |
| T07 (bank) | T15 (remittances) | HARD |

---

## Persona key derivation

```typescript
// derivePersonaKey() logic — exact mapping:
familySituation === COUPLE_CONSTRAINED  → "constrained_couple"
familySituation === FAMILY_WITH_CHILDREN → "family_with_children"
all others                               → "solo_aewv"
```

visaType does NOT affect the persona key — only familySituation does.

---

## Task applicability filtering

`filterApplicableTasks()` parses JSON strings from the DB and checks intersection:
- `applicableVisaTypes` — JSON array of VisaType strings, or `["ALL"]`
- `applicableFamilySituations` — JSON array of FamilySituation strings, or `["ALL"]`
- `applicableOccupations` — JSON array of Occupation strings, or `["ALL"]`

A task is applicable if the user's profile value appears in the array, OR the array contains `"ALL"`.
All three fields must pass — it's AND logic, not OR.

---

## Golden examples (load-bearing — must always pass)

```typescript
// GOLDEN 1: constrained_couple, Day 2, no completions
// Expected top 3: T06 (SIM), T07 (bank), then next non-blocked task (NOT T08 — T07 is SOFT dep only)
// T08 has SOFT dep on T07, so T08 is NOT blocked, but T07's urgency (+30) keeps it above T08

// GOLDEN 2: constrained_couple, Day 2, T06 + T07 complete
// Expected top 3: T08 first (base 95 + persona +20 + urgency +25 = 140), T09, T10
// T08 no longer blocked. T09 has HARD dep on T08 so still blocked until T08 complete.

// GOLDEN 3: constrained_couple, Month 11, T06–T12 complete, T16 not done
// Expected: T16 must appear in top 3
// T16 score = basePriority + 5 (persona) + 30 (month 10-11 urgency) = should exceed other tasks

// GOLDEN 4: solo_aewv, Day 5, no completions
// Expected: T09 must NOT appear in top 3 (blocked — T08 is HARD dep)
// T09 final score = basePriority + 10 + 28 - 50 = negative or very low
```

Run: `npm test -- golden-examples/priority-scoring.ts`
These must pass alongside unit tests. A passing test suite with failing golden examples = wrong product.

---

## TDD requirement

For every function in `core/priority/`:
1. Write test first (RED)
2. Run — confirm it fails
3. Implement (GREEN)
4. Refactor

Test files live next to source: `scoring.ts` + `scoring.test.ts` in the same folder.
No implementation code without a prior failing test.
