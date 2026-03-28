# Implementation Plan: Web Stage 1 Quality Gate (AC-W1-13 through W1-16)

## Approach
Execute comprehensive quality verification in batch mode: set up Vitest infrastructure with component tests for all 8 primitives, add reduced motion support to 3 components with transitions, verify color contrast ratios for WCAG AA compliance, and confirm Storybook integration remains clean. Fix any issues found, then verify all 4 ACs pass as an integrated gate before marking Web Stage 1 complete.

## File Changes
### AC-W1-14 (Vitest setup):
- **Create** `apps/web/vitest.config.ts` — Vitest config with jsdom, React Testing Library setup
- **Create** `apps/web/src/components/ui/Button.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/Card.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/Badge.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/ProgressBar.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/Skeleton.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/StatusIndicator.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/Input.test.tsx` — mount + render test
- **Create** `apps/web/src/components/ui/Tooltip.test.tsx` — mount + render test

### AC-W1-15 (Reduced motion):
- **Modify** `apps/web/src/components/ui/Card.tsx` — add `motion-reduce:transition-none` to transition classes
- **Modify** `apps/web/src/components/ui/Button.tsx` — add `motion-reduce:transition-none` to transition classes
- **Modify** `apps/web/src/components/ui/ProgressBar.tsx` — add `motion-reduce:transition-none` to transition classes

## Implementation Order
1. **Set up Vitest config** — create `vitest.config.ts` with jsdom environment and React plugin
2. **Install test dependencies** — `@testing-library/react`, `@testing-library/jest-dom` if missing
3. **Create component tests** — 8 simple mount/render tests (Button through Tooltip)
4. **Add reduced motion support** — update Card, Button, ProgressBar transition classes
5. **Run AC-W1-14 verification** — `npm test` confirms all tests pass
6. **Run AC-W1-15 verification** — DevTools reduced motion toggle + visual check in Storybook
7. **Run AC-W1-16 verification** — color contrast checker on 3 specified combinations
8. **Run AC-W1-13 verification** — `npm run storybook` final integration check
9. **Update IMPLEMENT.md** — mark all 4 ACs as PASS

## Test Strategy
### AC-W1-13: Storybook Integration
- `npm run storybook` starts without console errors
- Visual confirmation: all 8 primitives appear under UI/ in sidebar
- All stories render without crashes

### AC-W1-14: Vitest Testing
- `npm test` runs all component tests successfully
- Each primitive has basic mount/render test that passes
- TypeScript compilation clean (`npx tsc --noEmit`)

### AC-W1-15: Reduced Motion Compliance
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
- Visual verification in Storybook: Card hover, Button hover, ProgressBar transitions become instant
- No animations play when reduced motion preference active

### AC-W1-16: Color Contrast Verification
Use axe-core browser extension or WebAIM contrast checker:
- `text-primary` (#1A1A2E) on `bg` (#F8F6F3) ≥ 4.5:1
- `text-secondary` (#5A5A6E) on `bg` (#F8F6F3) ≥ 4.5:1
- `text-inverse` (#FFFFFF) on `primary` (#1B6B6D) ≥ 4.5:1

## Golden Examples Affected
None — quality gate verification only. No functional changes to existing components beyond reduced motion accessibility improvements.