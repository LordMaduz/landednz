# API Architecture

*📝 This document will be expanded throughout Phase 1-4 implementation*

LandedNZ API is built on **Fastify** with clear separation between roadmap and chat features.

---

## Overview

### Stack
- **Framework**: Fastify v5 (high performance, low overhead)
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: ES256 JWT verification (Supabase)
- **AI Integration**: Claude API for chat features
- **Deployment**: Railway (containerized)

### Route Organization
```
/health          → Health check (AC-1-03/04)
/auth/verify     → JWT verification (AC-1-08)
/roadmap/*       → Job A: Priority scoring, task management
/chat/*          → Job B: AI chat, streaming responses
/onboarding/*    → User profile creation
```

---

## Architectural Boundaries

**🚨 Critical Constraint**: `features/roadmap/` and `features/chat/` never import from each other.

```
apps/api/src/
├── features/
│   ├── roadmap/       ← Job A routes/services
│   ├── chat/          ← Job B routes/services
│   ├── onboarding/    ← User profile setup
│   ├── health/        ← Health check endpoint
│   └── auth/          ← JWT verification
├── core/              ← Pure functions (no Fastify/Prisma)
└── shared/            ← DB client, logger, errors, config
```

---

## To Be Documented

### Core Infrastructure
- [ ] Fastify server configuration
- [ ] Middleware stack (auth, CORS, rate limiting)
- [ ] Error handling (AppError vs AIFailureError)
- [ ] Logging and monitoring setup

### Route Implementation
- [ ] Health check endpoints (`/health`)
- [ ] Auth verification (`/auth/verify`)
- [ ] Roadmap API endpoints (Phase 2)
- [ ] Chat streaming API (Phase 4)

### Streaming Architecture (Phase 4)
- [ ] Server-Sent Events (SSE) setup
- [ ] Claude API streaming integration
- [ ] Error handling in streaming responses
- [ ] Connection management

### Performance & Reliability
- [ ] Database connection pooling
- [ ] Rate limiting strategies
- [ ] Graceful shutdown handling
- [ ] Health check implementation

---

*This document will be expanded with detailed API specifications as each phase is implemented.*