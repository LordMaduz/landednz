# Critique: public guides boards (2026-11-02)

Boards: `docs/design/guides/board.html` (guide page A and B at 1440, A at 390; index at 1440 and 390). Sample guide: T08 "Get your IRD number", real content and real source titles.
Mode: Read. Incumbent world inherited (About/Privacy/Terms frame, existing role tokens). No new colour, type size or component.
Reviewer: the building agent (not an independent reviewer). `impeccable detect` on the board: 0 findings. No horizontal overflow at 390 or 1440.

## Result: no P0, no P1

Heuristic read (Nielsen, 0–4): visibility 4, match to real world 4, consistency 4, error prevention n/a, recognition 4, minimalism 3, help 3. Roughly 33/40 on the scale used for the chat rail.

## P2 (log, fix while building)
1. Sources run to 10 rows on IRD, so at 1440 the CTA sits about 1,700 px down. Acceptable for Read, but the CTA is the page's only conversion point. Option for the owner: keep (recommended, matches G1) or add a one-line plan note under "Last checked".
2. Breadcrumb links are 12 px text. Give them a 24 px minimum target (WCAG 2.2 target size, AA) in the build.
3. Index intro line "Every step comes from an official site." is new copy. It matches the product claim (every fact has an official source) but needs owner OK.
4. Variant B rail repeats six section names that are one scroll apart. Only worth it if guides get long; A is recommended.
5. Cost and "When to get advice" sections are not in T08, so they are not on the board. They use the same section style (T11 has both).

## Checks
- Heading order H1, H2 per section; breadcrumb is a nav landmark; sources are links with agency below.
- Contrast: body #0F2A3A, muted #4B6170, link #0A6463 on white, all AA (same tokens as the app).
- Steps are numbered because they are a sequence; other lists are bullets. No cards except the CTA.
- Phones: 15 px body and 22 px title (existing phone roles), 44 px rows on the index, footer one line with Guides link.
