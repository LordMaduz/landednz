# Design system board: gate notes (2026-10-31)

Board: https://claude.ai/artifact/JDm4bkdqbTXmXjhnxsqjNv (source `src/gen.py` → `board.html`; images in `img/`).

## Evidence (measured on the running app, test user, 10 pages, 1440 and 390)

- Hover inventory (`hovers.json`): 9 distinct hover changes plus 25 controls with none (incl. disabled Continue/Send, current nav item, account avatar).
- Phone tap feedback: of 21 enabled controls held down at 390, 18 show no change today; with the injected state layer (strength A) all 21 do. The 2 disabled controls (Continue, Save and rebuild) stay unchanged, as intended.
- At rest the proposed system draws the same pages; changes are states, merged radius/elevation, role names.

## Impeccable

- Mode: Operate. In-world extension of the incumbent look (no new-work); PRODUCT.md scope note says chat-only, superseded for this work by the owner (2026-10-31).
- `impeccable detect` on board.html: "overused font: Geist" (pinned app font, brief wins, ignored); "same text repeated" for Rest/Hover/Pressed labels (intentional state matrix). No P0/P1.

## Not covered by the board

- Guide pane and answers, delete dialog, toasts (need live AI or destructive flows); before/after in plan Task 9.
- Proposed crops use a throwaway injected CSS: a text-like control on dark (Settings "Change") shows a square layer; the build gives it `rounded-control`.

## Owner decisions pending

1. State strength A 6/10 % (recommended) or B 8/12 %.
2. Floating radius 16 (recommended) or 18.
3. Fold avatar into surface-selected (recommended yes).
4. Citation chip: state layer (recommended) or solid teal.
5. Pressed feedback everywhere on phones (recommended yes).

## Owner decisions (2026-10-31)

1. A 6/10 %. 2. Floating radius 16. 3. Avatar merge deferred (avatar has its own redesign in another session). 4. Citation chip = state layer. 5. Pressed feedback everywhere on phones: yes.
