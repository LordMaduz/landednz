# AI Architecture

*📝 This document will be completed during Phase 2-4 implementation*

LandedNZ's AI system is built around **two independent jobs** that never share code or state.

---

## Overview: Two AI Jobs

### Job A: Roadmap Engine (Phase 2)
- **Purpose**: Personalized priority scoring and task sequencing
- **Input**: User profile (visa, city, family situation)
- **Output**: Top 3 prioritized tasks with consequence explanations
- **Technology**: Pure TypeScript functions + priority scoring algorithm
- **Location**: `apps/api/src/features/roadmap/`, `apps/api/src/core/priority/`

### Job B: Chat Advisor (Phase 4-5)
- **Purpose**: Settlement questions via streaming chat
- **Input**: User messages + conversation history
- **Output**: Streaming AI responses with citations
- **Technology**: Claude API + RAG retrieval + guardrails
- **Location**: `apps/api/src/features/chat/`, `apps/api/src/core/prompts/`

---

## Constitutional Boundaries

**🚨 Critical Constraint**: `features/roadmap/` and `features/chat/` NEVER import from each other.

```
features/roadmap/  ←—————————×—————————→  features/chat/
                             ↑
                   no cross-imports ever
                   shared types → packages/types/
```

---

## To Be Documented

### Job A: Roadmap Engine (Phase 2)
- [ ] Priority scoring algorithm
- [ ] Dependency resolution system
- [ ] Persona-based filtering
- [ ] Consequence line generation

### Job B: Chat Advisor (Phase 4-5)
- [ ] RAG pipeline architecture
- [ ] System prompt construction
- [ ] Guardrail implementation (CRISIS_SIGNAL, OUT_OF_SCOPE, etc.)
- [ ] Citation and source attribution
- [ ] Conversation history management

### Shared Infrastructure
- [ ] Claude API client architecture
- [ ] Prompt registry organization
- [ ] Error handling (AIFailureError vs AppError)
- [ ] Token usage monitoring

---

*This document will be expanded with detailed technical specifications as each phase is implemented.*