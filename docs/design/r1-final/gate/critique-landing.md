# Critique: Landing (S2)

Target: apps/web/src/components/marketing/landing-hero.tsx, roadmap-preview-figure.tsx. Shots: landing-1440.png, landing-390.png beside landing-*-board.png (PsLanding, PsLandingPhone). Shots from a production build (`next start -p 3100`), so no dev badge.

## Assessment A (design review)
- Specificity: the hero shows the product's own Roadmap on day 3, with real task states, not a stock illustration. Matches the boards.
- Hierarchy: h1, one lede, one primary button with a trailing chevron, a muted reassurance line. The preview's next row is the only medium-weight title, so the eye lands on "Apply for your IRD number".
- Preview rows: hairline-separated, no route line. Marks: filled teal circle with white tick (done), ringed teal dot (next), dashed grey (blocked), hollow grey (later). All four are distinguishable by shape, not by colour alone.
- Phone: lede at 15, full-width CTA with "You see it before you sign up." centred below, contour lines hidden, footer text and links on one row.
- P0: none. P1: none.
- P2: phone side gutter is 24 px (app-wide container-page) where the board draws 16 px, so "Give your employer a tax code" wraps to two lines at 390 (row 68.5 px tall vs 44). Same known difference as Home/Roadmap in the gate README. Left as is: changing the shared gutter is out of scope.

## Assessment B (detector and measurements)
`impeccable detect --json` on both files returned `[]`.
getBoundingClientRect on the 3100 production build:
- 1440: CTA x 184, w 200, h 48; figure x 776, w 480, h 436; all four rows h 44; no horizontal overflow (scrollWidth 1440); topo svg displayed.
- 390: CTA x 24, w 342, h 48 (full width); figure x 24, w 342, h 483; rows 44, 44, 68.5, 44; scrollWidth 390; topo svg display none.
- Rendered font sizes (text nodes): 1440 {48, 18, 15, 13}; 390 {22, 18, 15, 13}. All in the type set.
