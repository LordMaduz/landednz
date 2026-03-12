# LandedNZ Architecture

**Stack:** React Native (Expo) · Node.js/Fastify · PostgreSQL/pgvector · Supabase Auth · Claude API
**Environment:** macOS · Node.js · Docker · Railway · Claude Code

---

## System Overview

LandedNZ helps skilled migrants navigate NZ settlement through two distinct AI-powered features:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│                 │    │                  │    │                     │
│   Mobile App    │◄──►│   Fastify API    │◄──►│   Claude API        │
│  (React Native) │    │                  │    │                     │
│                 │    │                  │    │                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │  Supabase Auth  │ ◄─── Google/Apple OAuth
                       │                 │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │   PostgreSQL    │ ◄─── Business Data
                       │   (App Data)    │
                       │                 │
                       └─────────────────┘
```

## Core Architectural Principles

### 1. **Two AI Jobs — Always Separate**
- **Job A (Roadmap Engine)**: Priority scoring, dependency resolution, task sequencing
- **Job B (Chat Advisor)**: Streaming chat, RAG retrieval, guardrails
- **Constraint**: `features/roadmap/` and `features/chat/` never import from each other

### 2. **Dual Database Architecture**
- **App PostgreSQL**: Business data (tasks, roadmaps, chat history)
- **Supabase PostgreSQL**: Auth data (users, sessions, OAuth tokens)
- **Why**: Separation of concerns + leverage Supabase's auth expertise

### 3. **Mobile-First Design**
- React Native + Expo for cross-platform consistency
- API designed around mobile data usage patterns
- Offline-capable roadmap viewing

### 4. **Claude API Integration**
- All prompts centralized in `core/prompts/registry.ts`
- Structured error handling for AI failures
- Streaming responses for real-time chat experience

---

## Architecture Documentation

### Core Systems
- 📊 **[Database Architecture](docs/database-architecture.md)** — Dual PostgreSQL setup, Supabase services, data flow
- 🤖 **[AI Architecture](docs/ai-architecture.md)** — Job A vs Job B, RAG pipeline, Claude integration
- 🔐 **[Authentication Architecture](docs/auth-architecture.md)** — ES256 JWT, OAuth flows, user lifecycle

### Implementation Details
- 🚀 **[API Architecture](docs/api-architecture.md)** — Fastify structure, SSE streaming, error handling
- 📱 **[Mobile Architecture](docs/mobile-architecture.md)** — React Native patterns, navigation, state management
- ☁️ **[Infrastructure Architecture](docs/infrastructure.md)** — Docker, Railway deployment, environments

---

## Development Quick Start

### 1. **Local Environment Setup**
```bash
# Start app database
docker compose up -d

# Start Supabase auth services
supabase start

# Start API server
cd apps/api && npm run dev

# Start mobile app
cd apps/mobile && npm start
```

### 2. **Key URLs (Local)**
- API: `http://localhost:3000`
- Supabase Studio: `http://127.0.0.1:54323`
- Supabase API: `http://127.0.0.1:54321`

### 3. **First-Time Setup**
1. Copy `.env.example` → `.env.local`
2. Get Supabase keys from `supabase status`
3. Run `npx prisma migrate dev` for app schema
4. Visit Studio to configure OAuth providers

---

## Phase Development Status

| Phase | Focus | Status | Documentation |
|-------|-------|--------|---------------|
| **Phase 1** | Foundation (Auth, Schema, Health) | 🟡 5/14 ACs | All phases in `IMPLEMENT.md` |
| **Phase 2** | Roadmap Engine (Job A) | ⚫ Pending | Scoring algorithm in AI docs |
| **Phase 3** | Monetization (RevenueCat) | ⚫ Pending | Payment flow in infrastructure docs |
| **Phase 4** | AI Chat (Job B) | ⚫ Pending | RAG pipeline in AI docs |
| **Phase 5** | Production Launch | ⚫ Pending | Deployment in infrastructure docs |

---

## Contributing

1. **Read the relevant architecture docs** before making changes
2. **Follow RPI workflow**: `/rpi:research` → `/rpi:plan` → `/rpi:implement`
3. **Update architecture docs** when making structural changes
4. **Respect architectural boundaries** (constitution in `.claude/constitution.md`)

For operational gotchas and session-specific notes, see `CLAUDE.md`.