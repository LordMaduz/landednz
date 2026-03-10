# 10 — Tech Stack Decision
*Written: February 2026*
*Purpose: Select the specific technologies that implement the
architecture defined in Section 6. Every decision is evaluated
against four criteria: MVP build speed, fit for LandedNZ's specific
requirements, local-first with clean cloud deployment path, and
single-developer maintainability.*
*Feeds into: Section 8 (MVP Scope), Claude Code Build Specification*

---

## EVALUATION CRITERIA

These four criteria apply to every decision, in priority order:

**Criterion 1 — MVP build speed**
25 hours per week. June 2026 deadline. Technologies that require
weeks of ramp-up before writing product code are a liability.

**Criterion 2 — Fit for LandedNZ's specific requirements**
Generic best-practice choices are not always right for a specific
product. LandedNZ requires: vector search for RAG, real-time
roadmap updates, streaming chat responses, offline caching, and
structured task graph with dependency resolution. The stack must
serve these requirements.

**Criterion 3 — Local-first, cloud-ready**
Everything runs locally without cloud dependencies during
development. The cloud deployment path is a configuration change,
not a rewrite.

**Criterion 4 — Single-developer maintainability**
One person building and maintaining this product. Technologies
requiring significant ongoing ops work, complex configuration,
or ecosystem fragmentation are wrong regardless of technical merit.

---

## DECISION 1: FRONTEND — MOBILE APP

### Options evaluated

**Progressive Web App (PWA)**
A website packaged to install on a phone's home screen.
Cannot match native app performance or access platform UI
components. The bottom sheet interactions, entry point animations,
and task card micro-animations we designed require better than
what a PWA delivers. LandedNZ's first impression depends on feeling
polished and trustworthy — a PWA is a risk to that impression.
Eliminated.

**iOS Native (Swift / SwiftUI)**
Excellent UI quality ceiling. First-class SwiftUI support for
every interaction pattern we designed. However: iOS-only excludes
approximately 55–70% of the primary target demographic on Day 1
(Indian and Filipino skilled migrants have approximately 85–95%
Android market share). An Android version would require a complete
rebuild in Kotlin. Wrong for this product's user demographic.
Eliminated.

**React Native with Expo**
Builds genuine native iOS and Android apps from a single TypeScript
codebase. Not a web wrapper — produces real native components.
Expo abstracts the painful parts (Xcode configuration, provisioning
profiles, app store submission). Expo Go enables instant physical
device testing without a full Xcode build — scan a QR code, app
runs on device immediately.

### Decision: React Native with Expo

**Market coverage rationale:**
LandedNZ's primary users are Indian, Filipino, and South/Southeast
Asian skilled migrants. Android market share in India is ~95%, in
the Philippines ~85%. Even accounting for the higher-income skilled
migrant skew toward iPhone (~30–45% iPhone in this segment), building
iOS-only excludes the majority of target users at MVP. React Native
covers both platforms from Day 1 with approximately the same
development effort as building for one platform natively.

**Single codebase rationale:**
One developer, 25 hours per week. Every bug fix, content update,
and UI change done once and shipped to both platforms. The
compounding benefit over a 6-month build is significant.

**Learning curve rationale:**
Neither Swift nor Kotlin is known. The choice is between learning
one new ecosystem (TypeScript/React Native) or two (Swift for iOS,
Kotlin for Android later). TypeScript is closer to Java than Swift —
the Spring Boot background provides more transferable mental models
in the JavaScript ecosystem.

---

## DECISION 2: BACKEND — LANGUAGE AND FRAMEWORK

### What the backend must do
- Serve the roadmap engine (query task graph, resolve dependencies,
  calculate priorities, return ordered task list)
- Handle user profile and completion state (read/write)
- Orchestrate the RAG pipeline (retrieval → prompt construction
  → Claude API call → stream response to client)
- Manage delta sync (version check, content sync)
- Validate authentication tokens
- Trigger smart reminder emails
- Handle payment webhook (subscription status updates)
- Serve admin interface for knowledge base management

**Critical non-standard requirement: streaming responses.**
The chat advisor must stream Claude's response token by token
to the mobile app via Server-Sent Events (SSE). A loading spinner
for 3–5 seconds while waiting for a complete response breaks the
conversational feel entirely.

### Options evaluated

**Java with Spring Boot**
Known deeply — zero ramp-up. However: Spring Boot is architecturally
over-engineered for a single-developer MVP consumer app. The verbosity,
boilerplate, and configuration overhead are costs worth paying in a
team environment with enterprise requirements — not for one developer
building a consumer app in 25 hours per week. The Anthropic Java SDK
is less mature than the TypeScript or Python SDKs. Streaming responses
are significantly more verbose. Eliminated on structural fit grounds,
not familiarity grounds.

**Python with FastAPI**
Python's AI ecosystem advantage (LangChain, LlamaIndex) is real but
does not materialise at MVP — we call the Claude API directly with a
structured prompt, not through AI orchestration frameworks. The two-
language penalty (Python backend + TypeScript frontend) is paid from
Day 1. Post-MVP, if more sophisticated AI patterns are needed, Python
can be evaluated. Wrong timing for MVP.

**Node.js with TypeScript and Fastify**
Same language across frontend and backend. Shared TypeScript types
between client and server — no translation layer, no interface
duplication, no type mismatch bugs. The Anthropic SDK is TypeScript-
first with the most mature feature coverage. Streaming SSE responses
are natural in Node.js's event-driven architecture. Fastify is
production-ready, significantly faster than Express, with excellent
TypeScript support.

### Decision: Node.js with TypeScript and Fastify

**Shared language benefit:**
TypeScript full-stack means every interface between frontend and
backend is defined once and shared. The task graph type, the user
profile type, the chat message type — defined in a shared types
package, used by both client and server. No duplication, no drift.

**AI integration benefit:**
Anthropic's TypeScript SDK has first-class streaming support.
Implementing SSE streaming from Fastify to the React Native client
is straightforward — the SDK's stream() method integrates directly
with Node.js streams.

**Ecosystem benefit:**
Every integration LandedNZ needs (Supabase, Resend, RevenueCat
webhooks, Prisma) has excellent TypeScript support with generated
types.

---

## DECISION 3: DATABASE — PRIMARY DATA STORE

### What the database must do
- Store task graph (tasks, dependencies, content variants)
- Store user profiles and roadmap state
- Store knowledge base version tracking
- Support efficient dependency resolution queries
- Support vector similarity search for RAG retrieval
- Run locally without complex setup
- Deploy to managed service without schema migration

### Options evaluated

**MongoDB**
Document database with flexible schema. JSON-native, good TypeScript
support. However: the task dependency graph is inherently relational
— representing directed edges between tasks in a document database
requires workarounds that relational databases handle naturally.
MongoDB Atlas vector search is a separate tier, adding complexity
and cost. Schema flexibility is a trap for a well-defined data model
— it delays schema discipline and creates inconsistency. Eliminated.

**SQLite**
Zero setup — a single file. Fast for read-heavy workloads. Perfect
for local development prototyping. However: no native vector search
support (no pgvector equivalent). Write concurrency limitations
become a problem with multiple users. Migration path to a managed
service requires switching database technology entirely — not just
moving data. Eliminated for production use.

**PostgreSQL with pgvector**
Battle-tested relational database with a vector search extension.
The task dependency graph maps naturally to relational tables with
foreign keys. JSONB support handles array fields (applicable_visa_types,
steps, documents_required) without requiring a document store.

**The pgvector advantage — critical:**
pgvector adds vector similarity search (cosine, inner product, L2)
directly to PostgreSQL. This means the primary database and the
vector store for RAG retrieval are the same database instance.
One database handles the relational task graph, user state,
knowledge base content, AND embedding vectors.

At MVP scale (~300–500 knowledge base chunks), pgvector performance
is more than sufficient — vector searches return in milliseconds.
No separate vector database (Pinecone, Weaviate, Qdrant) needed at
MVP. Fewer services, fewer costs, fewer failure surfaces.

### Decision: PostgreSQL with pgvector extension

**ORM: Prisma**
TypeScript-first ORM with generated types. Schema defined in a
Prisma schema file — migrations generated automatically from schema
changes. The generated TypeScript types from the Prisma schema are
the shared types used by both backend and frontend. Single source
of truth for all data types.

**Local setup: Docker**
One `docker-compose.yml` spins up PostgreSQL with pgvector enabled.
Single command: `docker compose up`. No manual database installation.
Consistent environment between local development and production.

---

## DECISION 4: VECTOR STORE

**Decision: pgvector (PostgreSQL extension) — no separate vector store at MVP**

Rationale documented in Decision 3 above. At MVP knowledge base
scale (~300–500 chunks), pgvector is sufficient. A dedicated vector
store (Pinecone, Weaviate, Qdrant) is post-MVP if the knowledge
base scales to thousands of chunks and query performance degrades.

---

## DECISION 5: AUTHENTICATION

### What auth must do
- User account creation and sign-in
- Persist roadmap state across sessions and devices
- Protect API endpoints — users access only their own data
- Support Google OAuth and Apple Sign-In (mobile friction reduction)
- Session token management

### Decision: Supabase Auth

Supabase is used for the managed PostgreSQL database. Supabase Auth
is included in the same service — adding authentication adds zero
new services, zero new billing relationships, zero new integration
work beyond configuration.

**Row Level Security (RLS) advantage:**
Supabase Auth enables PostgreSQL Row Level Security — authentication
and data access control enforced at the database level. A user
cannot access another user's roadmap state even if there is an
API-level bug. Security enforced structurally, not by policy.

**OAuth support:**
Google OAuth and Apple Sign-In both supported out of the box.
Apple Sign-In is required for App Store apps that offer any social
login — Apple mandates that if Google login is offered, Apple login
must also be offered. Supabase handles both.

**Local development:**
Supabase provides a local development CLI (`supabase start`) that
runs the full Supabase stack locally including Auth. Same auth
behaviour locally as in production.

---

## DECISION 6: EMAIL — TRANSACTIONAL

### What email must do
- Smart reminder emails (specific task + consequence subject line)
- Premium gate defer emails (24-hour follow-up)
- Lapsed user re-engagement emails
- High deliverability — must reach inboxes, not spam
- Simple TypeScript API

### Decision: Resend with React Email

**Resend** is a modern transactional email API built for developers.
TypeScript SDK is first-class. Generous free tier (3,000 emails/month)
— sufficient for MVP validation phase.

**React Email** is a companion library that allows building email
templates as React components. Same component model as the React
Native frontend. Email templates are typed TypeScript components —
no HTML string templates, no handlebars, no context switching.

**Deliverability:** Resend uses dedicated IPs and follows modern
deliverability best practices. Used by Vercel, Linear, and other
developer-first products with high deliverability requirements.

**Example email template structure:**
```typescript
// emails/SmartReminder.tsx
import { Button, Text } from '@react-email/components';

interface SmartReminderProps {
  userName: string;
  taskName: string;
  consequenceLine: string;
  deepLink: string;
}

export const SmartReminderEmail = ({
  userName,
  taskName,
  consequenceLine,
  deepLink
}: SmartReminderProps) => (
  <div>
    <Text>{consequenceLine}</Text>
    <Text>This takes 5 minutes to fix.</Text>
    <Button href={deepLink}>Open LandedNZ to check</Button>
  </div>
);
```

Typed. Testable. Previewed in browser during development.

---

## DECISION 7: PAYMENTS — IN-APP SUBSCRIPTIONS

### The App Store constraint

Apple requires that in-app purchases and subscriptions in iOS apps
use Apple's In-App Purchase system (StoreKit). External payment
processors (Stripe) cannot be used for digital subscriptions sold
through the App Store. Apple takes 15–30% of subscription revenue
as platform fee. This is non-negotiable.

Google Play has equivalent requirements for Android subscriptions.

Stripe is correct for web payments. For a React Native mobile app
with App Store distribution, Stripe cannot be used for subscription
management.

### Decision: RevenueCat

RevenueCat is a mobile subscription management platform that wraps
both Apple's StoreKit (iOS) and Google Play Billing (Android) in a
unified API.

**Why RevenueCat is correct:**
- Configure subscription products once — RevenueCat handles the
  complexity of both stores' payment APIs
- Webhook to backend when subscription status changes
  (new subscription, renewal, cancellation, refund)
- Real-time subscription status checking from the backend
- Subscription analytics (conversion rates, churn, MRR)
- Free tier up to $2,500 monthly revenue — covers entire MVP
  validation phase

**Pricing configuration in RevenueCat:**
- Monthly: NZD $9.99/month
- Six-month: NZD $49 (save ~18%)

Both products configured in App Store Connect and Google Play
Console, then referenced in RevenueCat. The React Native app uses
the RevenueCat SDK to present the paywall and handle purchase flow.

---

## DECISION 8: HOSTING — CLOUD DEPLOYMENT

### Requirement: local first, cloud later, migration = config change

**Local development stack:**
Everything runs on localhost during development. No cloud
dependencies except the Claude API (requires internet).

```
┌─────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT ENVIRONMENT               │
│                                             │
│  Expo Go (iPhone)                           │
│       ↕ HTTP / SSE                          │
│  Fastify server (localhost:3000)            │
│       ↕ Prisma                              │
│  PostgreSQL + pgvector (Docker, port 5432)  │
│                                             │
│  External (requires internet):              │
│  - Claude API (api.anthropic.com)           │
│  - Resend (mocked locally via test mode)    │
│  - RevenueCat (sandbox mode)                │
└─────────────────────────────────────────────┘
```

**Cloud deployment:**

*Backend: Railway*
Railway deploys Node.js applications from a GitHub repository with
zero infrastructure configuration. No Kubernetes, no Docker Compose
in production, no load balancer configuration, no VPC setup. Push
to main branch → Railway automatically builds and deploys.

Railway supports long-lived connections and Server-Sent Events —
critical for streaming chat responses.

Pricing: Free tier covers MVP validation. $5/month for hobby plan
when more consistent uptime is needed.

*Database: Supabase*
Managed PostgreSQL with pgvector extension available. Same schema
as local — migration is a connection string change. Supabase also
provides the Auth service (Decision 5) in the same platform.

Free tier: 500MB database, 50,000 monthly active users — sufficient
for MVP validation phase.

**Migration from local to cloud:**

```
// .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/landednz
SUPABASE_URL=http://localhost:54321
API_BASE_URL=http://localhost:3000

// .env.production
DATABASE_URL=postgresql://[supabase-connection-string]
SUPABASE_URL=https://[project-ref].supabase.co
API_BASE_URL=https://[railway-deployment-url]
```

Two environment files. No code changes. No architecture changes.
No rewrites. The local development environment and the production
environment are structurally identical — only the connection targets
differ.

---

## COMPLETE TECH STACK

| Layer | Technology | Version target | Purpose |
|---|---|---|---|
| Mobile app | React Native | Latest stable | Cross-platform iOS + Android |
| App platform | Expo | SDK 52+ | Build tooling, device testing, app store submission |
| Language (all) | TypeScript | 5.x | Type safety across full stack |
| Backend framework | Fastify | 4.x | API server, SSE streaming |
| ORM | Prisma | 5.x | Type-safe database access, migrations |
| Database | PostgreSQL | 16.x | Primary data store |
| Vector search | pgvector | 0.7+ | RAG embedding storage and retrieval |
| AI model | Claude (Anthropic) | claude-sonnet-4-20250514 | Roadmap personalisation + chat advisor |
| Auth | Supabase Auth | Latest | User accounts, RLS, OAuth |
| Email | Resend + React Email | Latest | Transactional emails |
| Payments | RevenueCat | Latest | In-app subscriptions (iOS + Android) |
| Local database | Docker + docker-compose | Latest | Zero-config local PostgreSQL |
| Mobile dev | Expo Go | Latest | Instant device testing |
| Cloud backend | Railway | — | Node.js hosting, auto-deploy |
| Cloud database | Supabase | — | Managed PostgreSQL + pgvector + Auth |

---

## LOCAL DEVELOPMENT SETUP SEQUENCE

The sequence a developer (or Claude Code) follows to get the full
stack running locally for the first time:

```
1. Clone repository
   git clone [repo-url]
   cd landednz

2. Install dependencies
   npm install              # root (shared types)
   cd apps/mobile && npm install   # React Native app
   cd apps/api && npm install      # Fastify backend

3. Environment setup
   cp .env.example .env.local
   # Add: ANTHROPIC_API_KEY, SUPABASE_ANON_KEY (local)

4. Start local database
   docker compose up -d
   # Starts PostgreSQL 16 + pgvector on localhost:5432

5. Run database migrations
   cd apps/api
   npx prisma migrate dev
   # Creates all tables from schema

6. Seed knowledge base
   npx ts-node scripts/seed-knowledge-base.ts
   # Populates tasks, dependencies, content variants

7. Generate embeddings
   npx ts-node scripts/generate-embeddings.ts
   # Creates pgvector embeddings for all knowledge base chunks

8. Start backend
   npm run dev
   # Fastify server on localhost:3000

9. Start mobile app
   cd apps/mobile
   npx expo start
   # Scan QR code with Expo Go on iPhone or Android device
```

Full local environment running in under 15 minutes on a clean machine.

---

## REPOSITORY STRUCTURE

Monorepo using npm workspaces. Single repository, multiple packages.
Shared TypeScript types used by both mobile app and backend.

```
landednz/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   │   ├── src/
│   │   │   ├── screens/     # Flow screens (entry, onboarding, etc.)
│   │   │   ├── components/  # Shared UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── services/    # API client, auth, storage
│   │   └── app.json         # Expo configuration
│   │
│   └── api/             # Fastify backend
│       ├── src/
│       │   ├── routes/      # API endpoints
│       │   ├── services/    # Roadmap engine, RAG pipeline, email
│       │   ├── plugins/     # Fastify plugins (auth, cors)
│       │   └── scripts/     # Seed, embed, admin scripts
│       └── prisma/
│           ├── schema.prisma    # Database schema
│           └── migrations/      # Migration history
│
├── packages/
│   └── types/           # Shared TypeScript types
│       ├── task.ts          # Task, TaskDependency, ContentVariant
│       ├── user.ts          # UserProfile, RoadmapState
│       └── chat.ts          # ChatMessage, ChatResponse
│
├── emails/              # React Email templates
│   ├── SmartReminder.tsx
│   ├── GateDefer.tsx
│   └── LapsedReEntry.tsx
│
├── docker-compose.yml   # Local PostgreSQL + pgvector
├── .env.example         # Environment variable template
└── package.json         # Workspace root
```

Monorepo rationale: shared TypeScript types in `packages/types`
are imported by both `apps/mobile` and `apps/api`. Type changes
propagate to both automatically — no duplication, no drift between
client and server interfaces.

---

## KEY INTEGRATION PATTERNS

### Streaming chat response (SSE)

The chat advisor streams Claude's response token by token.
Backend sends SSE, React Native client reads the stream.

```typescript
// Backend (Fastify route)
fastify.post('/chat/message', async (request, reply) => {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: constructSystemPrompt(request.body.userProfile),
    messages: request.body.messages,
  });

  for await (const chunk of stream) {
    reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  reply.raw.end();
});
```

```typescript
// Mobile (React Native)
const response = await fetch(`${API_BASE_URL}/chat/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, userProfile }),
});

const reader = response.body?.getReader();
// Read stream chunks and update chat UI incrementally
```

### pgvector similarity search

```typescript
// RAG retrieval with persona pre-filter
const relevantChunks = await prisma.$queryRaw`
  SELECT id, content, source_url, persona_key,
         embedding <=> ${queryEmbedding}::vector AS distance
  FROM knowledge_base_chunks
  WHERE persona_key = ANY(${applicablePersonas})
    AND applicable_visa_types @> ${[userVisaType]}
  ORDER BY distance ASC
  LIMIT 5
`;
```

### Roadmap delta check

```typescript
// On app open — delta check before serving roadmap
async function checkRoadmapDelta(userId: string, cachedVersion: number) {
  const { currentVersion } = await prisma.knowledgeBaseVersion.findFirst();

  const lastCompletion = await prisma.userRoadmapState.findFirst({
    where: { userId },
    orderBy: { completionTimestamp: 'desc' },
  });

  const completionChanged = lastCompletion?.completionTimestamp >
    cachedRoadmap.lastComputedAt;
  const contentChanged = currentVersion > cachedVersion;
  const timeThresholdCrossed = checkTimeThresholds(
    userProfile.arrivalDate,
    new Date()
  );

  return { completionChanged, contentChanged, timeThresholdCrossed };
}
```

---

## DECISIONS LOG — TECH STACK

| Decision | What | Why |
|---|---|---|
| Frontend | React Native with Expo | Cross-platform from Day 1, target demographic is 55-70% Android, single codebase for one developer |
| PWA rejected | Not native enough | Bottom sheet, animations, micro-interactions require native quality |
| iOS Native rejected | Excludes majority of target users | Indian + Filipino migrant demographic is predominantly Android |
| Backend | Node.js with TypeScript + Fastify | Shared language with frontend, TypeScript-first Anthropic SDK, native SSE streaming |
| Spring Boot rejected | Over-engineered for single-developer MVP | Verbosity and boilerplate cost not justified at this scale |
| Python rejected at MVP | Two-language penalty from Day 1 | AI ecosystem advantage doesn't materialise until post-MVP |
| Database | PostgreSQL with pgvector | Relational task graph + vector search in one database |
| Separate vector DB rejected | Over-engineering at MVP scale | 300-500 chunks — pgvector is sufficient, eliminates separate service |
| ORM | Prisma | TypeScript-first, generated types, single source of truth for data model |
| Auth | Supabase Auth | Consolidated with database, RLS enforced structurally, Google + Apple OAuth |
| Email | Resend + React Email | TypeScript-first, React component templates, excellent deliverability |
| Payments | RevenueCat | App Store compliance — Stripe cannot be used for in-app subscriptions |
| Stripe rejected | App Store does not permit | Apple requires StoreKit for in-app digital subscriptions |
| Local database | Docker Compose | Zero-config, consistent with production, single command startup |
| Cloud backend | Railway | Zero infrastructure config, auto-deploy, SSE support |
| Cloud database | Supabase | Managed PostgreSQL + pgvector + Auth, same schema as local |
| Monorepo structure | npm workspaces | Shared TypeScript types between mobile and backend without duplication |
| Migration path | Environment variables only | No code changes required to move from local to cloud |

---

*Next document: 11-mvp-scope.md*
*Section 8 defines exactly what gets built in the first version —
which features, which flows, which tasks, which content —
bounded by the 6-week build constraint and the June 2026
relocation deadline. Section 8 output directly feeds the
Claude Code Build Specification.*
