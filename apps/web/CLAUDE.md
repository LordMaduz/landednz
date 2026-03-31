# apps/web — LandedNZ Web App
# Stack: Next.js 14 · React 18 · Tailwind CSS · TypeScript
# This file is loaded by Claude Code when working inside apps/web/.
# Keep under 160 lines. Add new gotchas via /learn during the build.

---

## Structure

```
apps/web/src/
├── app/                    ← Next.js App Router
│   ├── (marketing)/        ← Route group — no sidebar
│   ├── (app)/              ← Route group — with sidebar
│   ├── layout.tsx          ← Root layout
│   └── globals.css         ← Tailwind + CSS custom properties
├── components/
│   ├── ui/                 ← Design system primitives (Stage 1)
│   ├── layout/             ← Sidebar, panels (Stage 2)
│   ├── roadmap/            ← Roadmap components (Stage 3-4)
│   ├── onboarding/         ← Onboarding flow (Stage 3-4)
│   ├── chat/               ← Chat interface (Stage 3-4)
│   └── marketing/          ← Landing page (Stage 3)
├── lib/
│   ├── api.ts              ← Typed API client
│   ├── supabase/           ← Auth (SSR helpers)
│   ├── hooks/              ← Custom hooks
│   ├── stores/             ← Zustand state
│   └── utils/              ← cn(), formatters
├── mocks/                  ← Mock data (Stage 3, removed Stage 4)
└── types/web.ts            ← Web-specific types
```

**Key boundaries:**
- UI primitives (components/ui/) isolated from feature components
- Mock data (Stage 3) completely replaced by API integration (Stage 4)
- Auth state via Supabase SSR cookies, never localStorage

---

## Key patterns

**Component API:**
```typescript
interface ComponentProps {
  variant: 'primary' | 'secondary' | 'outline';  // Explicit variants
  size: 'sm' | 'md' | 'lg';                      // Sized consistently
  children: React.ReactNode;
  className?: string;                             // Allow overrides
}

export function Component({ variant, size, className, ...props }: ComponentProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variantStyles[variant],
        sizeStyles[size],
        className,  // User overrides last
      )}
      {...props}
    />
  );
}
```

**State management:**
- Server: React Server Components + API fetch
- URL: `nuqs` for shareable state
- Client: Zustand stores for complex interactions
- Auth: Supabase SSR helpers (never localStorage)

---

## Known Gotchas

### Next.js Configuration

- **Next.js 14 does not support `next.config.ts` — requires `.js` or `.mjs`.**
  TypeScript config file support was introduced in Next.js 15. Attempting to use `next.config.ts` in Next.js 14.2.x fails with "Configuring Next.js via 'next.config.ts' is not supported." Use `next.config.mjs` for ES modules or `next.config.js` for CommonJS.

### Storybook Setup

- **Storybook 8.6.18 + @storybook/react-vite framework resolves webpack compatibility.**
  `@storybook/nextjs` causes "Cannot read properties of undefined (reading 'tap')" in webpack compilation. Use `@storybook/react-vite` framework and create separate `vite.config.ts` for path alias resolution to avoid Next.js-specific webpack hooks.

### Vitest Configuration

- **Vitest requires `globals: true` for @testing-library/jest-dom to work.**
  The jest-dom v6+ package calls `expect.extend()` at module load time and needs `expect` to be global. Use `import '@testing-library/jest-dom'` in test-setup.ts (not manual extend) to get both runtime matchers AND TypeScript types.

### Component Testing Patterns

- **StatusIndicator uses `role="img"` on its container — use `getByRole('img')` in tests.**
  Don't rely on `querySelector('svg')` as the SVG is an implementation detail. The semantic role is what matters for testing.

### Tailwind Font Configuration

- **font-display/font-body Tailwind classes implemented as `display` and `body` keys in tailwind.config.ts fontFamily section.**
  This is the correct pattern for custom Tailwind font utility classes: `fontFamily: { display: ['DM Serif Display', 'serif'], body: ['DM Sans', 'sans-serif'] }` enables `font-display` and `font-body` classes.

### Layout Implementation

- **Nav elements need `flex flex-col` for vertical stacking — without it items go horizontal.**
  Navigation containers must use `flex flex-col` to stack nav items vertically. Flex alone defaults to row direction, causing horizontal layout instead of expected vertical sidebar navigation.

- **Route deletion requires .next cache cleanup before TypeScript passes.**
  After deleting route files, run `rm -rf .next` before TypeScript check. Stale .next cache references deleted files, causing tsc errors until cache is cleared.

### Responsive Testing

- **Playwright mobile tests: `aside` with `hidden md:flex` uses `not.toBeVisible()`, not `not.toBeAttached()`.**
  Elements with `hidden md:flex` stay in DOM but are visually hidden at mobile. Use `not.toBeVisible()` in mobile tests. Marketing routes (never rendered) correctly use `not.toBeAttached()`.

### Tailwind Custom Values

- **Add custom borderWidth values to tailwind.config.ts to avoid arbitrary values.**
  `borderWidth: { '3': '3px' }` enables `border-l-3` class instead of arbitrary `border-l-[3px]`, maintaining CW01 compliance.

### Stage 3 Static Screens Learnings

- **Storybook next/navigation mocking requires Vite aliases for components using usePathname/useRouter.**
  Add to `.storybook/main.ts` viteFinal config: `'next/navigation': resolve(__dirname, '../src/__mocks__/next-navigation.ts')` and similar for next/link. Create mock files that return noop functions to prevent Storybook runtime errors.

- **First-use hints and route-persistent state must live in Zustand stores, not component useState.**
  Component state resets on route navigation. Use stores like `useOnboardingStore` for UI state that should persist across route changes within a session. localStorage is only for cross-session persistence (Stage 5).

- **useReducedMotion() hook pattern established for animation-heavy components.**
  Import from `@/lib/hooks/useReducedMotion`, use as boolean flag to skip animation sequences. Apply `motion-reduce:animate-none` to CSS animations and set stroke-dashoffset to 0 for SVG animations when reduced motion is true.

- **PhaseSection slot injection pattern: topSlot/bottomSlot props for premium gates.**
  Allows content injection inside collapsible sections without breaking the fold/expand logic. Both slots render conditionally based on phase number, filter state, and premium gate state.

---

## Constitutional Compliance

**CW01: Design tokens only**
- All colours, spacing, typography via Tailwind config classes
- No raw hex (#1B6B6D) or px values in component files
- Exception: tailwind.config.ts defines the token values

**CW02: Storybook stories required**
- Every component/ui/ primitive needs .stories.tsx
- Must cover all states from 14-ui-ux-design.md

**CW03: Reduced motion respected**
- All animations check prefers-reduced-motion
- CSS: @media (prefers-reduced-motion: reduce)
- JS: useReducedMotion() hook

**CW04: Shared types from packages/types/**
- Import TaskStatus, VisaType, etc. from @landednz/types
- Web-specific types (TaskCardState) in src/types/web.ts

**CW05: Mock data shape = API shape**
- Stage 3 mocks must match Fastify response types exactly

**CW06: No localStorage auth**
- Auth via Supabase SSR cookies only
- localStorage only for non-critical UI preferences

---

## Dependencies

**Core:**
- Next.js 14 (App Router, TypeScript)
- React 18 (Server Components)
- Tailwind CSS 3.4+ (design tokens)

**Stage additions:** clsx + tailwind-merge (W1), Storybook 8 (W1), Vitest + Testing Library (W1), Lucide React (W2), Zustand (W2), nuqs (W2), Supabase SSR (W4), Framer Motion (W5)