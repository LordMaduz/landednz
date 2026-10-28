# R0 polish boards (canvas version 1793169870-b87a)

Source of the polish boards on the design canvas
(https://claude.ai/artifact/778HVTsFG43hyKeJMJ4ENh). These supersede the matching boards in
`../r0-boards/` for Home, Roadmap, the task page and Settings (CW02′). Spec:
`docs/superpowers/specs/2026-10-28-r0-polish-and-stage-c-design.md`.

- `build.py`: generates every board except the task page from one shared style (`CSS`, `ROUTE_CSS`,
  `STATE_CSS`). The single source for exact values. Run `python3 -I build.py` here; it also rewrites
  `canvas.json` and the "now" screenshot boards, which only resolve on the canvas.
- `TaskPage.dc.html`: hand-edited (sources in the side column, tap-to-call numbers, previous and next task).
- `Details.dc.html`: the sizing rules every board follows.
- `States.dc.html`: loading, API down, field error, saved and undo, task done, saving, Ask thinking and
  failed, delete dialog, empty, focus, disabled.
- Phone boards (`*Phone.dc.html`) are the same page at 390 px.

Board names vs routes: Main (first visit) and HomeLater (day 3) → `/app`, Roadmap → `/app/roadmap`,
TaskPage → `/app/roadmap?task=<id>`, Settings → `/settings`.
