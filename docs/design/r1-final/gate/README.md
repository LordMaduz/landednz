# Design gate screenshots

App: signed-in test user, arrival today (day 1, 29 Oct 2026), production build (`next start -p 3100`) against the API on 3101 (`AI_MODE=mock`); no dev-tools badge. Boards: `docs/design/r1-final/*.dc.html` rendered at the same size. Re-shot in S4.

Widths at 1440: public pages (Landing, Sign in, Save) have a 160 px content edge and 1120 px content; Build my roadmap and the preview keep the board's 440 px ink rail at x 0 with content at x 560, and their header and footer sit at the 160 px edge; the workspace pages (Home, Roadmap, Task, Settings) have a 120 px edge and 1200 px content, as their boards. Phone gutter is 16 px everywhere. No page scrolls sideways at either width. The signed-in footer at 390 is one row (37 px).

Records: [behaviour-audit.md](behaviour-audit.md) (behaviour against main and the click-through), [critique-final.md](critique-final.md) (final critique).

| Page | App 1440 | Board 1440 | App 390 | Board 390 | Difference |
|---|---|---|---|---|---|
| Landing (PsLanding / PsLandingPhone) | [landing-1440.png](landing-1440.png) | [board](landing-1440-board.png) | [landing-390.png](landing-390.png) | [board](landing-390-board.png) | Type scale only, as specced. |
| Sign in (PsSignIn / PsSignInPhone) | [signin-1440.png](signin-1440.png) | [board](signin-1440-board.png) | [signin-390.png](signin-390.png) | [board](signin-390-board.png) | Type scale only, as specced. |
| Save your roadmap (PsSave / PsSavePhone) | [save-1440.png](save-1440.png) | [board](save-1440-board.png) | [save-390.png](save-390.png) | [board](save-390-board.png) | Type scale only, as specced. |
| Build my roadmap (question) (StRail / StRailPhone) | [rail-1440.png](rail-1440.png) | [board](rail-1440-board.png) | [rail-390.png](rail-390.png) | [board](rail-390-board.png) | Matches; board shows a mid-journey rail, app shows step 1. |
| Build my roadmap (date) (StRailDate / StRailPhone (no date phone board)) | [rail-date-1440.png](rail-date-1440.png) | [board](rail-date-1440-board.png) | [rail-date-390.png](rail-date-390.png) | [board](rail-date-390-board.png) | Matches; board has a selected day and Tomorrow chip, app shot is before a day is picked (today outlined). |
| Your roadmap is ready (StRailPreview (used for both sizes)) | [preview-1440.png](preview-1440.png) | [board](preview-1440-board.png) | [preview-390.png](preview-390.png) | [board](preview-390-board.png) | Matches; different answers and counts, so task names differ. |
| Home (Home / HomePhone) | [home-1440.png](home-1440.png) | [board](home-1440-board.png) | [home-390.png](home-390.png) | [board](home-390-board.png) | Width and gutter match (1200 at a 120 px edge, 16 px phone gutter). Board shows day 5 with 9 done, app shows day 1 empty states. Phone road labels differ. |
| Roadmap (Roadmap / RoadmapPhone) | [roadmap-1440.png](roadmap-1440.png) | [board](roadmap-1440-board.png) | [roadmap-390.png](roadmap-390.png) | [board](roadmap-390-board.png) | Width and gutter match. App adds a subtitle 'Done some already?' under the title. Board shows Done so far and Unlocks, app is day 1 so neither appears. |
| Task details (Task / TaskPhone) | [task-1440.png](task-1440.png) | [board](task-1440-board.png) | [task-390.png](task-390.png) | [board](task-390-board.png) | Width and gutter match. App page scrolls as a whole (board scrolls inside the card). App adds 'Open the IRD application' and source domains; ask title reads 'Ask about your IRD number'. Phone shot is a full-page capture, so the fixed bars sit mid-image. |
| Settings (Settings / SettingsPhone) | [settings-1440.png](settings-1440.png) | [board](settings-1440-board.png) | [settings-390.png](settings-390.png) | [board](settings-390-board.png) | Width and gutter match. Board shows City being changed, app opens on Visa (first answer). |
