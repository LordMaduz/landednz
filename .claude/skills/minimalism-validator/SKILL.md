---
name: minimalism-validator
description: Use when reviewing a LandedNZ design board (.dc.html artboard) or a UI diff or page before approval or merge, or when asked whether a screen is minimal enough, on-brand, or follows the Topo Minimal direction.
---

# Minimalism validator

Judge one screen (artboard, page or UI diff) against the 8 checks from spec §7.1 (`docs/superpowers/specs/2026-10-24-r0-foundation-design.md`). Every check gets a binary verdict with evidence from the markup. Taste comments that map to no check are not findings.

## Inputs to read first

- The screen's markup (inline styles, classes, Tailwind tokens).
- Spec §7.2 for tokens and signature elements; spec §7.4 for whether a Design system version id is recorded. If it is, read that board's type scale.

## Definitions

- **Accent**: a saturated hue used to draw attention. Teal is the one accent; darker or lighter teal shades for text contrast or hover (e.g. `#0A6463`, `#074B4A`) count as teal. Ink `#0F2A3A`, muted `#4B6170`, mist `#F4F7F7`, white, and low-saturation greys for borders and lines are neutrals, never accents.
- **Signature elements** (spec §7.2, they carry information): route waypoints and connectors whose styles encode task state, the completion stamp on done tasks, the aurora hairline and one-line trace on AI replies, the topo motif on the landing hero only.
- **Spacing**: `margin`, `padding`, `gap`, `inset`/`top`/`left`… Allowed: 0, 4, then multiples of 8. Borders and hairlines of 1–2 px are not spacing; nor are width, height, radius, or `min-height` touch targets.

## The checks

| # | Check | How to check | FAIL when |
|---|---|---|---|
| 1 | One accent colour | List every colour value; classify each as teal, aurora or neutral. | Any other accent hue appears, or aurora is on a non-AI element. |
| 2 | Every element carries information | For each text, shape, icon, card, divider: what does the user learn from it? | An eyebrow/kicker label, ornament, divider, icon or card that adds nothing the content beside it doesn't already say. Signature elements pass. |
| 3 | ≤ 5 type sizes, on the scale | List every distinct `font-size`. | More than 5. If spec §7.4 records a Design system version id: also any size not on its scale. |
| 4 | One primary action, one dominant element | Find filled/high-contrast buttons and the largest element. | Two different primary-styled actions, or two elements competing for dominance. |
| 5 | 8 px spacing scale | List every spacing value. | Any value outside 0, 4, 8n. |
| 6 | No duplicated actions or repeated information | Group actions by label + target; group facts. | The same action or the same fact appears twice on the screen. |
| 7 | Copy says each thing once, plainly | Read each text block. | A sentence restates its neighbour, or uses jargon/marketing filler where a plain word exists. |
| 8 | Light theme only | Look for dark backgrounds on surfaces, `prefers-color-scheme: dark`, theme toggles. | Any dark-mode styling or theme switch. A dark primary button is not a dark theme. |

A finding belongs to the single check whose FAIL condition it meets. Check 6 owns duplicated actions and facts; check 7 owns wording inside a text block.

## Output

Exactly 9 lines, nothing before them:

```
PASS|FAIL 1 One accent colour — <evidence: values and elements>
PASS|FAIL 2 Every element carries information — <evidence>
PASS|FAIL 3 Type sizes — <list of sizes, count>
PASS|FAIL 4 One primary action — <the primary action>
PASS|FAIL 5 Spacing scale — <off-scale values, or "all on scale">
PASS|FAIL 6 No duplication — <evidence>
PASS|FAIL 7 Plain copy — <evidence>
PASS|FAIL 8 Light theme — <evidence>
OVERALL PASS|FAIL
```

OVERALL is FAIL if any line is FAIL, otherwise PASS. After the 9 lines you may add a short "Notes (not findings)" list for observations that meet no FAIL condition.

## Common mistakes

| Mistake | Correct |
|---|---|
| Calling the completion stamp or waypoint styles decorative | They are signature elements that encode state: check 2 passes. |
| Counting a darker teal for link text, or border greys, as extra accents | Shades of teal are teal; greys are neutrals. |
| "PASS with fixes" | Binary. A required fix means FAIL on a named check; otherwise it is a note. |
| Skipping spacing because it "looks even" | List the values; 10, 12, 14, 18 and 23 px fail. |
| Flagging layout taste (placement, line-height) as a failure | Only FAIL conditions in the table are findings. |
