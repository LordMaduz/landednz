# Pre-Tool-Use Hook
# Runs before every tool call in a Claude Code session.

---

## TDD Guard

Before writing any implementation code in `apps/api/src/core/`:

- `core/priority/` — a failing test MUST exist before any implementation file is created or modified
- `core/dependencies/` — a failing test MUST exist before any implementation file is created or modified
- `core/prompts/` — a failing test MUST exist before any implementation file is created or modified

If about to write implementation code in `core/` without a corresponding failing test:
STOP. Write the test first. Run it. Confirm it fails. Then implement.

Red → Green → Refactor. No exceptions.

---

## Secret Detection

Before writing or editing any file, check that the content does not contain:

- Hardcoded API keys (strings matching `sk-ant-`, `sk-`, `eyJ`)
- Database connection strings with embedded credentials
- JWT secrets or signing keys
- Any value that belongs in `.env.local` instead of source code

If any of the above are detected: STOP. Move the value to `.env.local`.
NEVER commit secrets to source control.

Files that must NEVER contain secrets:
- Any file tracked by git
- `apps/api/src/shared/config.ts` — use `process.env.*` only
- `apps/api/prisma/schema.prisma` — use `env("DATABASE_URL")` only

---

## Architecture Boundary Guard

Before writing any import statement, check:

1. Is this a `features/roadmap/` file importing from `features/chat/`? → STOP. Violation of C01.
2. Is this a `features/chat/` file importing from `features/roadmap/`? → STOP. Violation of C01.
3. Is this a `core/` file importing from Fastify, Prisma, or `@anthropic-ai/sdk`? → STOP. Violation of C02.
4. Is this any file other than `shared/ai/claude.client.ts` importing from `@anthropic-ai/sdk`? → STOP. Violation of C03.
5. Is this a prompt string literal outside `core/prompts/registry.ts`? → STOP. Violation of C04.

If any boundary violation is detected: surface it immediately. Do not proceed.
See `.claude/constitution.md` for the full list of architectural constraints.

---

## Storybook Story Guard (Web)

Before creating or modifying any component in `apps/web/src/components/ui/`:

- A corresponding `.stories.tsx` file MUST exist or be created in the same commit.
- The story MUST cover all documented states from 14-ui-ux-design.md.
- If modifying an existing component and adding a new state: the story MUST be updated
  in the same commit to include the new state.

If about to commit a UI primitive without its story: STOP. Write the story first.
Constitutional constraint CW02.

---

## Design Token Guard (Web)

Before using any colour, font-size, spacing, or shadow value in `apps/web/src/`:

- MUST use Tailwind design token class (e.g., `bg-primary`, `text-h2`, `shadow-card`,
  `rounded-card`, `p-6`, `gap-4`).
- Raw hex values are NOT permitted: `bg-[#1B6B6D]` → violation.
- Arbitrary Tailwind values are NOT permitted: `p-[23px]` → violation.
- Inline styles with raw values are NOT permitted: `style={{ color: '#1B6B6D' }}` → violation.
- Exception: `tailwind.config.ts` itself defines the raw token values.

If a raw value is detected in any component file: STOP. Use the Tailwind token class instead.
If the needed token doesn't exist in `tailwind.config.ts`: add it to the config first,
then use the class.
Constitutional constraint CW01.

---

## Accessibility Guard (Web)

Before creating any interactive component in `apps/web/src/`:

- **Keyboard interaction defined:** Every clickable element must respond to Enter/Space.
  Every dismissible element (panel, modal, tooltip) must respond to Escape.
  Tab order must follow visual order.

- **ARIA attributes present:** Expandable sections need `aria-expanded`. Live regions
  for chat need `aria-live`. Form inputs need `<label>` or `aria-label`. Decorative
  icons need `aria-hidden="true"`. Meaningful icons need `aria-label`.

- **Reduced motion handled:** Any CSS `transition`, `animation`, or Framer Motion
  animation MUST have a `prefers-reduced-motion` check. When active: duration → 0.
  Constitutional constraint CW03.

- **Focus indicators visible:** Every interactive element must have a visible focus ring
  (`focus:ring-2 focus:ring-border-focus focus:ring-offset-2`). Never remove outlines
  without replacement.

If any of the above are missing: STOP. Add them before proceeding.
