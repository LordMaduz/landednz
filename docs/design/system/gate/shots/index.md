# Design system build: before / after (2026-10-31)

`<page>-<width>-before.png` / `-after.png` for landing, signin, home, roadmap, task, settings at 1440 and 390.
After = `feat/design-system` (port 3100). Before = the owner's dev server on 3000 (`landednz-r0cloud`: `feat/type-system` **plus that session's uncommitted app-chrome work**, so header/Settings differences there are not from this branch).

## Visible changes and their source

| Change | Source |
|---|---|
| Hover/pressed on every control from one state layer (ink 6/10 %, white 8/12 % on dark) | Decision 1 (strength A), decision 5 (pressed on phones) |
| Ask bar, guide pane, phone sheet radius 16 (pane was 18); source popover takes the ask-bar shadow | Decision 2; board elevation merge |
| Citation chip: state layer, open = chosen edge (no solid teal) | Decision 4 |
| Header current link, chosen calendar day, chosen option row: selected surface + accent edge (calendar was an ink fill) | Board "Selected rows, nav"; spec §5 |
| Footer Privacy / Terms: muted, ink + underline on hover | Spec §7.2 `link-subtle` |
| Half-step spacing moved to the 4 px grid (101 places, `../spacing-shifts.txt`): rows and cards a few px roomier | Spec §6.2 |
| Avatar unchanged | Decision 3 deferred |

Not captured: delete dialog, toasts, guide answers on Task (same rules). Pressed feedback on a real iPhone: owner check (Playwright can't prove iOS `:active`).
