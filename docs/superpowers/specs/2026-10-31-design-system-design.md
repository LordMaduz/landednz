# App-wide design system — design

Date: 2026-10-31 · Status: owner-approved in brainstorm, spec awaiting review · App: `apps/web`

## 1. Why

Hovering clickable things shows different shades: the app has 13 distinct hover classes (backgrounds `wash`, `ink-hover`, `white`, `tint`, `teal`, `white/12`, `danger`; text `ink`, `white`, `danger`; a teal ring; underline). Causes found in the audit:

- 23 hand-written `<button>`s in 12 files outside `components/ui` style themselves instead of using `components/ui/button.tsx`.
- `wash` (#F6F8F8) and `tint` (#F3F9F8) are near-identical and both used for hover.
- Hover darkens on white but lightens (`hover:bg-white`) on grey surfaces.
- `teal-hover` is used only by plain links; there are almost no pressed (`active:`) states, so phone taps give no feedback.
- Colour tokens are named by look (`ink`, `teal`, `wash`), so a new look means editing every component.

## 2. Goal (owner's words, summarised)

- One design across the whole app that feels organised and premium.
- Built like the type system: every visual decision lives once in `globals.css`; switching to a totally different look later is a change in one place that does not touch pages.
- Mobile is critical: it must feel the most premium and be user friendly.
- The current Precise look (Geist, hairlines, ink/teal, light only) is the starting point, not a constraint; suggestions are welcome as options with a recommendation.
- No behaviour change: only how it looks. No API, logic, copy or flow changes.

## 3. Scope and order

| Piece | What | When |
|---|---|---|
| 1 Foundations | palette + roles: colour, states, spacing, radius, elevation, font | now (this spec) |
| 2 Components | kit upgrade + move every hand-written control onto it | now (this spec) |
| 3 Pages | remaining page migration + empty-feeling mobile pages (owner screenshots for 3 phone models) | after Plan B Tasks 10–11 |
| 4 Review | whole-app review at web widths and on phones | before prod release |

Plan B Tasks 10–11 run after pieces 1–2 and use the new system. Pieces 3–4 get their own spec.

The "impeccable = chat only" guardrail does not apply to this work.

## 4. Token architecture: palette + roles

Two layers in `apps/web/src/app/globals.css` (practice of GitHub Primer, IBM Carbon, Material 3):

- **Palette**: raw values named by hue and step (`--palette-teal-600: #0E7C7B`). Defined once. Never used by components.
- **Roles**: what a value is for (`--color-action`). Each role points at a palette value. Components and pages use roles only.

A new look = new palette values and, where needed, re-pointed roles. Component-level tokens are added only where a component genuinely needs its own value.

During the migration the old names (`ink`, `wash`, …) stay as aliases of the new roles so nothing breaks mid-way; aliases are removed at the end.

## 5. Interaction states

**State layer**: hover and pressed draw a translucent layer over the element's existing background instead of swapping to a per-component colour (Material 3 state layers; Carbon's translucent hover tokens).

| State | Light surfaces | Dark surfaces (primary button, onboarding rail, crisis card, toast) |
|---|---|---|
| hover | `--state-hover` ≈ ink at 6 % | `--state-hover-inverse` ≈ white at 8 % |
| pressed | `--state-press` ≈ ink at 10 % | `--state-press-inverse` ≈ white at 12 % |

- **Method**: `color-mix()` on `background-color` against the element's own base colour, carried in a CSS variable (`--state-base`, default `transparent`). Not `::after` (the guide's small controls use `::after` for enlarged tap areas: `composer.tsx` remove and send, `ask-bar.tsx` open) and not `background-image` (used by the aurora wrapper, `.wp-done`, `.route-legs`). Those elements are not hover targets and keep their backgrounds.
- A transparent ghost or text-only control gets the layer as its whole hover background, so it needs padding to show; text-only controls use the `text` Button variant instead (§7.1).
- Hover always moves the same direction on any surface; one rule covers every component, including future ones.
- Exact percentages are chosen on the board (§9), not here.
- Tailwind 4 applies `hover:` only on devices that can hover, so phones rely on pressed: every interactive element gets a pressed state. iOS Safari can skip `:active` without a touch listener; pressed is confirmed on a real phone, not only Playwright emulation.
- **Surface that flips with width** (e.g. `delete-account.tsx`: dark rail on desktop, white on phones): roles are CSS variables, so the control switches tone with a responsive override of its role variables, not a second component.
- **Focus**: today's 2 px ring, 2 px offset, colour from `--color-focus`.
- **Disabled**: one rule everywhere: muted text, no state layer, default cursor.
- **Selected / chosen** (option rows, current nav item, chosen calendar day): `surface-selected` + `border-selected`. `tint` means selected only, never hover.
- **Links**: `link` text, `link-hover` + underline on hover; links use text change, not the layer.
- **Danger**: same layer rule on the danger colour.

## 6. Roles

### 6.1 Colour

| Role | Today's token | Use |
|---|---|---|
| `text` / `text-muted` / `text-subtle` | ink / muted / control | normal, secondary, quietest text |
| `surface` / `surface-sunken` | white / wash | page and cards / grey wells |
| `surface-selected` / `border-selected` | tint / tint-border | chosen rows, current nav item |
| `surface-inverse` / `text-on-inverse` / `text-on-inverse-muted` | ink / rail-text / rail-label | dark rail, toast, crisis card |
| `action` / `text-on-action` | ink / white | primary button |
| `accent` / `accent-bright` | teal / mark | brand, progress / decorative marks |
| `focus` | teal | focus ring |
| `link` / `link-hover` | teal-text / teal-hover | links |
| `link-on-inverse` | toast-action | links and actions on dark surfaces |
| `danger` / `danger-on-inverse` | danger / danger-on-ink | errors, delete |
| `border` / `border-subtle` / `track` | border / hairline / track | controls / dividers / progress track |

- Removed: `ink-hover` (replaced by the state layer).
- Suggestion: fold `avatar` (#E8F2F1) into `surface-selected`; decided on the board.
- The AI aurora gradient (`@utility ai`) and every shadow (all embed raw `rgba(15,42,58,…)` or hex, incl. `--shadow-pin-halo`) are rebuilt from palette/roles.
- `ink` (≈95 uses) today means three roles (text, surface-inverse, action) and `white` (≈77) means three or more (surface, text-on-action, on-dark hover). An alias points at one role only, so each use is sorted by hand before aliases are removed.

### 6.2 Spacing

- Allowed steps (4 px grid): 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96 px. Half steps in use today (6, 10, 14, 18, 28, 30 …) move to the nearest allowed step; any visible change shows on the before/after screenshots.
- Density lives in Tailwind 4's single `--spacing` base.
- Layout roles for repeated decisions, with phone and desktop values: `page-gutter`, `card-padding`, `section-gap`, `stack-gap`. Piece 3 uses these to fix empty-feeling mobile pages.

### 6.3 Radius

`control` (8), `surface` (12; radius role name settled on the board so it does not clash with the `surface` colour role), `floating` (one value for pane, ask bar, sheet; replaces 16 and 18), `full`. The 3 stray `rounded-md` move to a role. Final `floating` value chosen on the board.

### 6.4 Elevation

- Three levels: `raised` (cards), `floating` (ask bar, popovers), `overlay` (pane, phone sheet), with direction variants for the upward sheet and the fixed frame (top and bottom).
- `lift` and `frame-top` are duplicates today; they merge.
- Merging `pop` + `bar` into `floating` and `pane` + `sheet` into `overlay` is visible; shown on the board.
- Outline effects (focus, chosen, field error, calendar today, rail ring) become rings built from colour roles.

### 6.5 Type and font

Type roles (2026-10-30, `type-roles.test.ts`) stay as they are. The font family becomes a role so changing it is a one-place edit.

## 7. Components

Rule: every interactive element is a kit component from `components/ui`. A hand-written `<button>` is allowed only inside `components/ui` (guarded, §8).

### 7.1 Button

| Variant | Use | Replaces |
|---|---|---|
| `primary` | one main action per screen | Button primary, composer send, ask-bar submit, toast action |
| `secondary` | other actions (today's `quiet`) | Button quiet, settings buttons |
| `ghost` | in-row and toolbar actions | Button ghost, reply actions, header items |
| `danger` / `danger-ghost` | delete account, remove memory | hand-written danger hovers |
| `inverse` | buttons on dark surfaces | onboarding rail, crisis card |
| `text` | text-only action, no padding or background; hover = `link-hover` + underline | `plan-form.tsx`, `account-section.tsx` `p-0` buttons |

- Sizes stay `sm`, `default`, `lg` (no rename) plus `icon` (square; accessible name required).
- On phones every control's **tap area** is at least 44 × 44 px (Apple HIG 44 pt; Material 48 dp; above WCAG 2.5.8's 24 px). The visual size can be smaller: small icon controls keep their drawn size and get the tap area from an invisible `::after` extension, as the composer already does.
- `render={<button>}` patterns (`delete-account.tsx`) become `render={<Button …/>}`.
- Disabled keeps today's behaviour (Base UI `disabled`); each swap is checked for rendered `type`, `disabled`/`data-disabled` and merged classes.
- All variants use the state layer, the shared focus ring and the shared disabled rule.

### 7.2 Others

- **Link**: one style via roles; `subtle` variant for header and footer nav.
- **Field / Select / textarea**: one input look (border, focus ring, error ring from roles), 16 px text on phones (no iOS zoom). Ask bar and composer keep their floating shape on the same tokens.
- **Card**: one surface, one padding role, variants `plain` (hairline) and `raised`.
- **Selectable rows** (OptionRow, nav items, calendar days): selected style + state layer.
- **Header / nav**: current page uses the selected style.
- **Calendar, AlertDialog, Skeleton, Toast**: move to roles; Calendar's day buttons stay hand-written inside `components/ui`.
- **CSS components in `globals.css` `@layer components`** (`.radio`, `.wp*`, `.stamp`, `.progress`, `.track*`, `.ask-q`, sheet grab handle): colours, radii and shadows move to roles. Drawn sizes (dots, marks, track widths) stay as px inside their one CSS class: that is already one place, and a new look does not need them.
- **Citation chip**: suggestion to use the state layer instead of a solid teal fill on hover; decided on the board.

### 7.3 No behaviour change

- Base UI primitives, props, handlers, ARIA and copy are unchanged.
- Each swap from a hand-written `<button>` to `<Button>` keeps the element, `onClick`, `type` and labels.
- Behaviour tests (roles, names, clicks, flows) pass unchanged. Tests that assert class names or old-board pixels are updated in the same commit as the change, never loosened to pass: `button.test.tsx`, `card.test.tsx`, `skeleton.test.tsx`, `settings.test.tsx:282`, and `e2e/board-compare.spec.ts` (re-baselined on the new board).

## 8. Guard tests

Extend the existing `apps/web/src/cw01.test.ts` (already fails on raw hex, `[13px]`-style arbitrary values and inline colour styles) so it also fails the build on:

- palette names or Tailwind default colours in components and pages
- spacing outside the allowed steps
- radius and shadow other than the roles
- hand-written `<button>` outside `components/ui`
- hex / `rgb()` in `globals.css` outside the palette block (the guard also reads `globals.css`; `.gsi` excepted)

The spacing check is a regex over utility prefixes, incl. sizes (`size-*`, `w-*`, `h-*`); class names built at runtime are not caught.

**Known exceptions** (outside the one-place change, listed in the guard):
- Google sign-in button `.gsi`: Google's required branding (own colours, 15 px, 48 px, `#F8FAFF` hover).
- `opengraph-image.tsx` (rendered by `next/og`, cannot read CSS variables; already exempt) and `favicon.ico`: brand assets, updated by hand on a new look.
- Supabase email templates: not checked; out of scope.

Every new role class is registered in `src/lib/utils.ts` (`cn` / tailwind-merge config) so merged classes are not silently dropped.

`type-roles.test.ts` stays as is.

Docs updated in the same branch: constitution CW01 wording (roles, not raw tokens) and `.claude/skills/landednz-design-system/SKILL.md` (role names, state layer, Button variants).

## 9. Board (before any code)

- Made with impeccable; saved under `docs/design/system/`.
- Shows: palette, roles, state-layer percentages, `floating` radius, the three elevations, every Button variant in rest / hover / pressed / focus / disabled, inputs, cards, selected rows.
- On real composite screens at 1440 and 390.
- Full critique output in `docs/design/system/gate/critique.md`; every size, percentage and weight cites a published system with a URL; judgement calls flagged.
- Owner approves the board before tokens are written.

## 10. Verification

- Playwright e2e on every page at 1440 and 390 (owner's 3 phone sizes added when shared): hover and pressed change the background; focus ring visible; touch targets ≥ 44 px on phones.
- Before/after screenshots of every page for owner review.
- Guard tests (§8) green.
- Behaviour tests pass unchanged; class-name and board-compare tests updated as in §7.3.
- Pressed state checked on a real phone.

## 11. Order of work

1. Housekeeping: build in a new worktree on `feat/design-system`, cut from `feat/type-system` HEAD. Uncommitted guide work in `landednz-r0cloud` (another session's) is not touched; it is merged in when that work is committed.
2. Board (§9) → owner approval.
3. Palette + roles in `globals.css`, old names as aliases.
4. Kit upgrade (§7), then move the 23 hand-written buttons and stray styles onto it.
5. Guard tests on; remove aliases.
6. Verification (§10) → owner review.

## 12. Standards to cite (verified on the board step)

- Material 3 state layers: https://m3.material.io/foundations/interaction/states/state-layers
- IBM Carbon colour tokens: https://carbondesignsystem.com/elements/color/tokens/
- GitHub Primer primitives: https://primer.style/foundations/primitives
- Atlassian spacing: https://atlassian.design/foundations/spacing
- Apple HIG accessibility (44 pt targets): https://developer.apple.com/design/human-interface-guidelines/accessibility
- WCAG 2.2 SC 2.5.8 target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Tailwind 4 hover on hover-capable devices: https://tailwindcss.com/docs/hover-focus-and-other-states
