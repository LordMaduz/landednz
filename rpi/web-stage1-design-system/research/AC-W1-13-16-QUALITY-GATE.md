# Research: AC-W1-13 through W1-16 — Web Stage 1 Quality Gate

## Understanding

These 4 ACs form the **Web Stage 1 Quality Gate** — comprehensive verification that
the design system foundation (W1-01 through W1-12) meets production standards:

- **AC-W1-13**: Storybook integration works cleanly
- **AC-W1-14**: Test infrastructure exists and passes
- **AC-W1-15**: Accessibility (reduced motion) compliance
- **AC-W1-16**: Color contrast accessibility compliance

No new components. Fix quality issues found, verify gates pass, mark stage complete.

## Current State Analysis

### ✅ AC-W1-13 (Storybook) — PASSING
- Storybook 8.6.18 running ✅
- All 8 primitives with stories under UI/ path ✅
- Smoke test: `[]` (zero console errors) ✅
- **No action needed**

### ⚠️ AC-W1-14 (Vitest) — NEEDS SETUP
- **Missing**: `vitest.config.ts` configuration file
- **Working**: `npm test` runs, cn.test.ts passes (3/3 tests)
- **Missing**: Component tests for all 8 primitives
- **Required**: Mount/render tests for each component to verify "all primitives tested"

### ⚠️ AC-W1-15 (Reduced Motion) — PARTIAL
- **Compliant**: Input.tsx has `motion-reduce:transition-none` ✅
- **Missing reduced motion support**:
  - Card.tsx: `transition-all duration-150`
  - Button.tsx: `transition-colors duration-150`
  - ProgressBar.tsx: `transition-all duration-fill`
- **Required**: Add `motion-reduce:transition-none` to all 3 components

### ❓ AC-W1-16 (Color Contrast) — REQUIRES VERIFICATION
**Combinations to verify (WCAG AA ≥ 4.5:1):**
- `text-primary` (#1A1A2E) on `bg` (#F8F6F3)
- `text-secondary` (#5A5A6E) on `bg` (#F8F6F3)
- `text-inverse` (#FFFFFF) on `primary` (#1B6B6D)

**Tool options**: axe-core browser extension OR manual contrast checker

## Files To Modify

### New files:
- `vitest.config.ts` — Vitest configuration with React Testing Library setup
- `src/components/ui/Button.test.tsx` — mount + render test
- `src/components/ui/Card.test.tsx` — mount + render test
- `src/components/ui/Badge.test.tsx` — mount + render test
- `src/components/ui/ProgressBar.test.tsx` — mount + render test
- `src/components/ui/Skeleton.test.tsx` — mount + render test
- `src/components/ui/StatusIndicator.test.tsx` — mount + render test
- `src/components/ui/Input.test.tsx` — mount + render test
- `src/components/ui/Tooltip.test.tsx` — mount + render test

### Modified files:
- `src/components/ui/Card.tsx` — add `motion-reduce:transition-none`
- `src/components/ui/Button.tsx` — add `motion-reduce:transition-none`
- `src/components/ui/ProgressBar.tsx` — add `motion-reduce:transition-none`

## Implementation Strategy

### Vitest Setup (AC-W1-14)
**Config approach**: Minimal setup for component mounting/rendering tests.
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],  // if needed for React Testing Library globals
  },
})
```

**Test pattern**: Each component gets a simple mount + render test:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders without crash', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Reduced Motion Fix (AC-W1-15)
**Pattern**: Add `motion-reduce:transition-none` to existing transition classes:
```typescript
// BEFORE: 'transition-colors duration-150'
// AFTER:  'transition-colors duration-150 motion-reduce:transition-none'
```

### Color Contrast Verification (AC-W1-16)
**Approach**: Use axe-core browser extension OR WebAIM contrast checker to verify:
1. Dark text (#1A1A2E) on light bg (#F8F6F3) — expect PASS
2. Medium text (#5A5A6E) on light bg (#F8F6F3) — may be borderline
3. White text (#FFFFFF) on teal bg (#1B6B6D) — expect PASS

## Verification Strategy

1. **Run each AC verification in sequence**:
   - AC-W1-13: `npm run storybook` → visual check all 8 primitives
   - AC-W1-14: `npm test` → confirm all tests pass
   - AC-W1-15: Storybook + DevTools reduced motion toggle → verify no animations
   - AC-W1-16: Contrast checker on the 3 specified combinations

2. **Fix any failures found**

3. **Final integration check**: All 4 ACs passing

## Dependencies

- Need `@testing-library/react` and `@testing-library/jest-dom` for component tests
- Need `jsdom` environment for Vitest browser simulation
- AxeCore browser extension OR online contrast checker for AC-W1-16

## Risk Assessment

- **Low risk**: AC-W1-13 already passing, AC-W1-15 simple addition
- **Medium risk**: AC-W1-14 requires full test setup but pattern is straightforward
- **Unknown risk**: AC-W1-16 contrast ratios — won't know until measured

## Ready to Plan

YES — comprehensive quality gate approach covers all 4 ACs as integrated verification.
Efficient batch-fix approach for any issues discovered.