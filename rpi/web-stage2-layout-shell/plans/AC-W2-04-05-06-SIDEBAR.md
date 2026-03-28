# Implementation Plan: AC-W2-04 + AC-W2-05 + AC-W2-06 — Complete Sidebar Batch

## Approach
Replace the stub Sidebar component with a full implementation covering all three sidebar ACs in one pass. The Sidebar is a 'use client' component using usePathname() for active states and useState for phase expand/collapse and tablet overlay. Responsive behaviour is handled entirely with Tailwind token classes — no breakpoint JS detection. MobileNav is a separate 'use client' component for <768px. lucide-react is installed for icons. One CW01 fix: add `borderWidth: { '3': '3px' }` to tailwind.config.ts to replace the skill's `border-l-[3px]` arbitrary value with `border-l-3`.

## File Changes
- Install: `lucide-react` (npm install in apps/web)
- Modify: `apps/web/tailwind.config.ts` — add `borderWidth: { '3': '3px' }` to extend
- Modify: `apps/web/src/components/layout/Sidebar.tsx` — replace stub with full implementation
- Create: `apps/web/src/components/layout/MobileNav.tsx` — mobile hamburger + drawer
- Modify: `apps/web/src/app/(app)/layout.tsx` — add `<MobileNav />` alongside Sidebar

## Implementation Order
1. `npm install lucide-react` in apps/web
2. Add `borderWidth: { '3': '3px' }` to `tailwind.config.ts`
3. Implement full `Sidebar.tsx`:
   - 'use client', usePathname, useState (expandedPhases, isTabletExpanded)
   - Logo (inline SVG + DM Serif Display "LandedNZ")
   - Nav items (Map/MessageSquare/Settings) with active state (bg-primary-light + border-l-3 border-primary)
   - Collapsed state at lg (64px): icons only, text hidden, Tooltip on hover
   - Tablet overlay at md (hamburger at top of collapsed sidebar → absolute w-sidebar + backdrop)
   - "YOUR PLAN" section with 3 static phases, ChevronRight rotation (motion-reduce:transition-none)
   - Phase 3 Premium badge (Lock icon)
   - "HELP" section (BookOpen/Mail)
   - User footer (avatar initials + static placeholder text)
   - hidden md:flex — not rendered below 768px
4. Implement `MobileNav.tsx`:
   - Hamburger button (md:hidden) — fixed top-left
   - Slide-in drawer (fixed left-0 inset-y-0 z-40 w-sidebar bg-bg-sidebar, motion-reduce:transition-none)
   - Same nav items as Sidebar
   - Backdrop (fixed inset-0 bg-black/20 z-30) — click closes
   - Escape key handler
5. Update `(app)/layout.tsx` — add `<MobileNav />` before Sidebar in the flex container
6. `npx tsc --noEmit` → 0 errors
7. `npm run dev` → visual verify at xl/lg/mobile viewports

## Test Strategy
Verification per REQUEST.md:
- AC-W2-04 ("Navigate routes"): /roadmap active state visible, phase expand/collapse works
- AC-W2-05 ("Resize viewport"): at 1100px → 64px collapsed, hover tooltip visible
- AC-W2-06 ("Resize + click"): at 375px → no sidebar, hamburger → MobileNav opens, backdrop closes

All: `npx tsc --noEmit` → 0 errors

## Golden Examples Affected
None — layout/UI AC with no logic.

## Constitutional Validator
PASS — 16/16 constraints checked, 0 violations.
CW01 fix noted: border-l-[3px] → border-l-3 via borderWidth.3 token addition.
CW03 noted: all transitions use motion-reduce:transition-none.
