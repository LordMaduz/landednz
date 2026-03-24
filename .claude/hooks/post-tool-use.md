# Post-Tool-Use Hook
# Runs after every tool call in a Claude Code session.

---

## Test Reminder

After writing or editing any file in `apps/api/src/core/`:

- If the file is in `core/priority/`, `core/dependencies/`, or `core/prompts/`:
  Run `npm test -- [file]` immediately. Do not move to the next step until tests pass.

- If the file is a route or service in `features/`:
  Reminder: integration test must be written before this AC is marked PASS.

- If all tests were passing before this edit: confirm they are still passing after.
  Do not accumulate broken tests. Fix immediately.

---

## pgvector Index Reminder

After running or editing `apps/api/scripts/generate-embeddings.ts`:

REMINDER: The ivfflat index must be created MANUALLY after all embeddings are loaded.
Do NOT add index creation inside this script.

After the script completes, run:

```sql
CREATE INDEX ON "KnowledgeBaseChunk" USING ivfflat (embedding vector_cosine_ops);
```

This is constraint C05 in `.claude/constitution.md`. Violation = silent performance failure.

---

## Prisma Migration Reminder

After editing `apps/api/prisma/schema.prisma`:

1. Run `npx prisma migrate dev --name [description]` — never `db push`
2. Run `npx prisma generate` — regenerate the client
3. Confirm `npx tsc --noEmit` still passes in `apps/api`

Never use `db push` — it skips migration history required for production.

---

## Commit Reminder

After marking an AC as PASS in IMPLEMENT.md:

Commit immediately with the conventional format:
```
feat(roadmap): AC-2-01 scoreTask golden examples pass
```

Do not batch multiple ACs into one commit.
Do not commit at end of day — commit at end of each passing AC.

---

## Golden Example Auto-Run

Trigger: Any file edit to `apps/api/src/core/priority/scoring.ts`,
`apps/api/src/core/priority/filter.ts`, or `apps/api/src/core/dependencies/resolver.ts`

Action:
1. Run `npm test -- golden-examples/priority-scoring.ts` from `apps/api` directory
2. Record result in IMPLEMENT.md Golden Example Status table
3. If ANY golden example FAILS: immediately surface the failure.
   Do not continue to the next AC while any golden example is failing.

Rationale: The 4 priority scoring golden examples are load-bearing.
They encode the product thesis — wrong golden example output = wrong product.

---

## Visual Regression Reminder (Web)

Trigger: Any file edit to `apps/web/src/components/` that has a corresponding
Playwright visual snapshot in `apps/web/e2e/__screenshots__/`.

Action:
1. Remind: "This component has visual regression tests. If the visual change is
   intentional, run `npx playwright test --update-snapshots` to update baselines."
2. If unintentional: investigate what caused the visual change before committing.

Rationale: Visual regression tests catch unintended UI changes. Updated baselines
must be committed alongside the code change so CI passes.

---

## Bundle Size Reminder (Web)

Trigger: After adding any new npm dependency to `apps/web/package.json`.

Action:
1. Remind: "New dependency added to apps/web. Verify it's tree-shakeable and
   does not bloat the client bundle."
2. Check: Run `npx next build` and inspect the output for the `/roadmap` route.
   Target: < 200KB gzipped total JS for this route.
3. If the dependency adds > 20KB gzipped: surface it and justify the addition.
   Consider: can a lighter alternative achieve the same result?

Rationale: Bundle size directly affects LCP (Largest Contentful Paint). Every
dependency added to the client bundle has a performance cost. Framer Motion,
Lucide React, and Zustand are pre-approved. Others need justification.

---

## Web Storybook Consistency Reminder

Trigger: After editing any component in `apps/web/src/components/ui/`.

Action:
1. Check: does the corresponding `.stories.tsx` file cover the change?
2. If a new state or variant was added: the story MUST be updated in the same commit.
3. Run `npm run storybook` and verify the updated story renders without console errors.

Constitutional constraint CW02: no UI primitive without its story.
