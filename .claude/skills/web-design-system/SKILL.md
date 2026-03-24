# Skill: Web Design System
# Domain knowledge for implementing Tailwind config, UI primitives, and accessibility patterns.
# Preloaded by: senior-software-engineer agent
# Visual truth: mockup-screens/*.jsx — when in doubt, match the mockup, not this text.

---

## What this skill covers

Everything needed to implement and maintain the design token system and UI primitive
components in `apps/web/`. Covers Tailwind configuration, component API patterns,
accessibility requirements, and font setup.

**Source hierarchy (highest → lowest):**
1. `mockup-screens/*.jsx` — interactive React mockups are the visual truth
2. `MOCKUP-REFERENCE-INDEX.md` — design decisions, tokens, component inventory
3. `16-web-layout-analysis.md` — layout rules (sidebar + content, no three-column)
4. `14-ui-ux-design.md` — original spec (overridden where conflicts documented)
5. This skill file — implementation patterns and Tailwind mappings

---

## Files in scope

```
apps/web/
├── tailwind.config.ts              ← ALL design tokens defined here
├── src/app/globals.css             ← CSS custom properties fallback + @font-face
├── public/fonts/                   ← DM Sans + DM Serif Display font files (self-hosted)
├── src/lib/utils/cn.ts             ← clsx + tailwind-merge utility
└── src/components/ui/
    ├── Button.tsx + Button.stories.tsx
    ├── Card.tsx + Card.stories.tsx
    ├── Badge.tsx + Badge.stories.tsx
    ├── ProgressBar.tsx + ProgressBar.stories.tsx
    ├── Skeleton.tsx + Skeleton.stories.tsx
    ├── StatusIndicator.tsx + StatusIndicator.stories.tsx
    ├── Input.tsx + Input.stories.tsx
    ├── Tooltip.tsx + Tooltip.stories.tsx
    └── index.ts                    ← barrel export
```

---

## Colour palette (exact values)

| Token | Hex | Tailwind class | Usage |
|-------|-----|---------------|-------|
| primary | #1B6B6D | `bg-primary`, `text-primary` | Primary actions, links, active states |
| primary-hover | #15585A | `bg-primary-hover` | Hover on primary elements |
| primary-light | #E8F4F4 | `bg-primary-light` | Selected states, active backgrounds |
| primary-subtle | #F0F8F8 | `bg-primary-subtle` | Hover backgrounds |
| secondary | #D4A843 | `bg-secondary` | Consequence callouts, accents, CTAs |
| secondary-light | #FDF6E7 | `bg-secondary-light` | Consequence callout backgrounds |
| secondary-hover | #C09338 | `bg-secondary-hover` | Darkened amber |
| bg | #F8F6F3 | `bg-bg` | Page background |
| bg-card | #FFFFFF | `bg-bg-card` | Card backgrounds |
| bg-sidebar | #F2F0ED | `bg-bg-sidebar` | Sidebar background |
| text-primary | #1A1A2E | `text-text-primary` | Headings, body text |
| text-secondary | #5A5A6E | `text-text-secondary` | Metadata, secondary text |
| text-tertiary | #8E8E9A | `text-text-tertiary` | Placeholders, disabled |
| text-inverse | #FFFFFF | `text-text-inverse` | White text on dark backgrounds |
| success | #2D8A5E | `bg-success`, `text-success` | Complete, positive |
| success-light | #E8F5EE | `bg-success-light` | Success backgrounds |
| warning | #D4A843 | `bg-warning` | Consequence, attention |
| warning-light | #FDF6E7 | `bg-warning-light` | Warning backgrounds |
| error | #C75B4A | `bg-error`, `text-error` | Errors, failures |
| error-light | #FDF0EE | `bg-error-light` | Error backgrounds |
| blocked | #8E8E9A | `bg-blocked` | Blocked, disabled |
| blocked-light | #F2F2F4 | `bg-blocked-light` | Blocked backgrounds |
| premium-gold | #D4A843 | `text-premium-gold` | Premium badge, lock icon |
| border | #E5E3E0 | `border-border` | Default card borders |
| border-hover | #D0CEC8 | `border-border-hover` | Hover border |
| border-focus | #1B6B6D | `border-border-focus` | Focus rings |

---

## Typography

### Font families

```css
/* TWO font families — display serif + body sans */
--font-display: 'DM Serif Display', serif;   /* Headings, hero text, greeting, page titles */
--font-body:    'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Tailwind mapping:
- `font-display` → DM Serif Display (headings, hero, greeting)
- `font-body` → DM Sans (everything else)

**DM Serif Display** is used for: landing page headline, section headings, hero card greeting ("Hi Priya"), page titles ("Settings"), onboarding question text, premium gate heading, auth heading. Weight 400 only.

**DM Sans** is used for: all body text, metadata, buttons, labels, navigation, badges, input fields. Weights 300–700.

### Typography scale (from mockups — slightly tighter than original spec)

| Token | Size | Weight | Line-height | Font | Tailwind class |
|-------|------|--------|-------------|------|---------------|
| display | 2.25rem (36px) | 400 | 1.2 | DM Serif Display | `text-display font-display` |
| h1 | 1.5rem (24px) | 400 | 1.35 | DM Serif Display | `text-h1 font-display` |
| h2 | 1.375rem (22px) | 400 | 1.35 | DM Serif Display | `text-h2 font-display` |
| h3 | 1.125rem (18px) | 600 | 1.4 | DM Sans | `text-h3` |
| body | 0.9375rem (15px) | 400 | 1.6 | DM Sans | `text-body` |
| secondary | 0.8125rem (13px) | 400 | 1.4 | DM Sans | `text-secondary` |
| caption | 0.6875rem (11px) | 500 | 1.3 | DM Sans | `text-caption` |

**IMPORTANT:** Body text is 0.9375rem (15px), NOT 1rem (16px). This was a deliberate
mockup decision for better density in hybrid task rows. Match the mockups.

All sizes in `rem` — never `px` — so browser font size preferences are respected.

---

## Font setup

```css
/* In globals.css — self-hosted, no Google Fonts CDN */
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/DMSans-Variable.woff2') format('woff2');
}

@font-face {
  font-family: 'DM Serif Display';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/DMSerifDisplay-Regular.woff2') format('woff2');
}
```

Download both from Google Fonts. Place in `public/fonts/`. Do NOT use `next/font` with
Google Fonts CDN — self-host for performance and privacy.

---

## Spacing system (base unit: 8px)

| Token | Value | Tailwind | Usage |
|-------|-------|---------|-------|
| space-1 | 0.25rem (4px) | `p-1`, `m-1` | Tight gaps |
| space-2 | 0.5rem (8px) | `p-2`, `m-2` | Base unit |
| space-3 | 0.75rem (12px) | `p-3`, `gap-3` | Between related items |
| space-4 | 1rem (16px) | `p-4`, `gap-4` | Card gap between cards |
| space-6 | 1.5rem (24px) | `p-6` | Card internal padding |
| space-8 | 2rem (32px) | `p-8`, `gap-8` | Section gap |
| space-10 | 2.5rem (40px) | `p-10` | Large spacing |
| space-12 | 3rem (48px) | `pt-12` | Page top padding |

---

## Layout constants

| Token | Value | Tailwind class |
|-------|-------|---------------|
| Sidebar width | 256px | `w-sidebar` |
| Sidebar collapsed | 64px | `w-sidebar-collapsed` |
| Content max-width | 960px | `max-w-content` |
| Card border-radius | 12px | `rounded-card` |
| Button border-radius | 10px | `rounded-button` |
| Input border-radius | 10px | `rounded-input` |
| Badge border-radius | 100px | `rounded-badge` |
| Chat panel width | 420px | `w-chat-panel` |
| Chat panel height | 600px | `h-chat-panel` |
| Chat panel radius | 16px | `rounded-chat-panel` |

---

## Shadows

| Token | Value | Tailwind class |
|-------|-------|---------------|
| card | `0 1px 3px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04)` | `shadow-card` |
| card-hover | `0 4px 12px rgba(26,26,46,0.08), 0 2px 4px rgba(26,26,46,0.04)` | `shadow-card-hover` |
| panel | `-4px 0 24px rgba(26,26,46,0.08)` | `shadow-panel` |
| chat-panel | `0 12px 48px rgba(26,26,46,0.15), 0 4px 16px rgba(26,26,46,0.08)` | `shadow-chat-panel` |
| modal | `0 16px 48px rgba(26,26,46,0.15)` | `shadow-modal` |
| dropdown | `0 8px 24px rgba(26,26,46,0.12)` | `shadow-dropdown` |

---

## Component API patterns

Every UI primitive follows this pattern:

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'text' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, size, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'rounded-button focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

Key rules:
- Use `cn()` for all class merging (clsx + tailwind-merge)
- Variant styles defined as const objects, not inline ternaries
- `disabled` and `loading` always disable click AND reduce opacity
- Focus ring: `focus:ring-2 focus:ring-border-focus focus:ring-offset-2` on ALL interactive elements
- All text sizes via Tailwind token classes, never raw `text-sm` or `text-lg`
- **Visual verification**: compare rendered output against `mockup-screens/` files

---

## Accessibility requirements

**Colour contrast (WCAG 2.1 AA):**
- Body text on bg: ≥ 4.5:1
- Large text (18px+) on bg: ≥ 3:1
- Interactive elements: ≥ 3:1 against adjacent colours

**Touch/click targets:**
- Desktop: minimum 32px × 32px
- Mobile: minimum 44px × 44px (button heights: 36/44/52px for sm/md/lg)

**Focus indicators:**
- Visible focus ring on ALL interactive elements
- 2px ring, `border-focus` colour (#1B6B6D), 2px offset
- Never remove focus outlines — only replace with custom rings

**Reduced motion (constitutional constraint CW03):**
- Every animation checks `prefers-reduced-motion`
- CSS: `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0s !important; transition-duration: 0s !important; } }`

**Screen readers:**
- Decorative icons: `aria-hidden="true"`
- Meaningful icons: `aria-label="description"`
- Form inputs: always have `<label>` or `aria-label`
- Status changes: `aria-live="polite"` for non-urgent, `aria-live="assertive"` for urgent
