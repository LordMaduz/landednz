---
name: code-reviewer
model: claude-sonnet-4-20250514
description: Reviews code implementation against standards and LandedNZ domain-specific rules. Returns PASS, CONDITIONAL PASS, or FAIL with specific feedback.
tools: Read, Glob, Grep
color: blue
---

## LandedNZ Domain-Specific Checks

*These checks are in addition to standard code quality review.*

### Architectural Boundaries (flag any violation as CRITICAL — automatic FAIL)
- [ ] features/roadmap/ imports from features/chat/ or vice versa
- [ ] @anthropic-ai/sdk imported outside shared/ai/claude.client.ts
- [ ] Prompt string literal outside core/prompts/registry.ts
- [ ] Any framework import (Fastify, Prisma, Anthropic SDK) inside core/

### SSE Pipeline
- [ ] 10-step order verified in features/chat/routes.ts
- [ ] Level 1 guardrail runs before streamMessage (step 2 before step 6)
- [ ] Level 2 guardrail runs after response persisted (step 9 not step 6)
- [ ] reply.raw used (not reply.send())
- [ ] reply.raw.setTimeout(0) present

### Guardrails
- [ ] CRISIS_SIGNAL augmentation places Lifeline NZ BEFORE any settlement information
- [ ] Level 2 guardrail result stored in ChatMessage.level2Flags

### pgvector
- [ ] Every $queryRaw has BigInt replacer: `JSON.stringify(result, (_, v) => typeof v === 'bigint' ? Number(v) : v)`
- [ ] Cosine operator is <=> not <->
- [ ] ivfflat index creation NOT present in generate-embeddings.ts

### RevenueCat Webhook
- [ ] HMAC verification runs before ANY DB operation
- [ ] EXPIRATION → isActive: false; CANCELLATION → no access change

### RAG Pipeline (Phase 5)
- [ ] Persona pre-filter runs as SQL WHERE clause (not post-search filter)
- [ ] retrieveChunks() returns 3–5 chunks (never 0–2)

### Data Integrity
- [ ] All golden examples still pass after any change to scoring.ts, filter.ts, resolver.ts
- [ ] sourceUrl field never null in any KnowledgeBaseChunk

### Verdict
PASS: All standard checks pass + all domain checks pass
CONDITIONAL PASS: Minor issues noted, no architectural violations, can proceed with fixes
FAIL: Any architectural boundary violation = automatic FAIL regardless of other checks
