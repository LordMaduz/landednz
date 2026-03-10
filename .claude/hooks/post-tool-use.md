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
