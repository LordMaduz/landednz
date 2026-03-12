# Database Architecture

LandedNZ uses a **dual PostgreSQL setup** with clear separation of concerns between business logic and authentication.

---

## The Two PostgreSQL Instances

| Instance | Purpose | Port | Managed By | Schema | Contains |
|----------|---------|------|------------|--------|----------|
| **App Database** | Business data | 5432 | Us (Prisma) | Full control | User, RoadmapEntry, Task, ChatMessage, KnowledgeBaseChunk |
| **Supabase Database** | Auth data | 54322 | Supabase CLI | Managed by Supabase | auth.users, auth.sessions, auth.refresh_tokens, OAuth tokens |

### Why This Separation?

**🎯 Separation of Concerns**
- **Supabase expertise**: OAuth flows, password hashing, JWT signing, social login complexity
- **Our expertise**: Priority scoring, roadmap logic, task dependencies, AI chat history

**🔒 Security & Control**
- **Auth security**: Supabase handles password storage, OAuth tokens, session management
- **Business data control**: We control our schema evolution, migrations, optimizations

**📈 Scalability**
- **Independent scaling**: Can optimize each database separately
- **Independent deployment**: Business logic changes don't affect auth stability

---

## Supabase Services Breakdown

When you run `supabase start`, you get a microservices stack. Here's what we actually use:

### Core Services (We Use)

| Service | Container Name | Port | Purpose | Why We Need It |
|---------|----------------|------|---------|----------------|
| **Auth (GoTrue)** | `supabase_auth_landednz` | 54321/auth | JWT generation, OAuth flows | ✅ **Core**: Handles Google/Apple login |
| **API Gateway (Kong)** | `supabase_kong_landednz` | 54321 | Routes all Supabase requests | ✅ **Core**: Entry point for auth API |
| **PostgreSQL** | `supabase_db_landednz` | 54322 | Stores auth.users, sessions | ✅ **Core**: Persistent auth data |
| **Studio** | `supabase_studio_landednz` | 54323 | Web UI for user management | ✅ **Dev Tools**: Debug auth, view users |

### Optional Services (We Ignore)

| Service | Container Name | Purpose | Why We Don't Use |
|---------|----------------|---------|------------------|
| **PostgREST** | `supabase_rest_landednz` | Auto-generated REST API from DB | We have our own Fastify API |
| **Realtime** | `supabase_realtime_landednz` | Live database subscriptions | Chat uses SSE, roadmaps are request-response |
| **Storage** | `supabase_storage_landednz` | File uploads to S3-compatible storage | No file uploads in MVP, local storage later |
| **Edge Functions** | `supabase_edge_landednz` | Serverless functions | We use Claude API directly from our API |
| **Vector/Embeddings** | `supabase_vector_landednz` | AI/vector operations | We use pgvector on our own database |
| **Image Proxy** | `supabase_imgproxy_landednz` | Image transformations | No image processing needed |
| **Connection Pooler** | `supabase_pooler_landednz` | PgBouncer connection pooling | Overkill for local development |

---

## Data Flow: User Authentication

```
1. User taps "Sign in with Google" in mobile app
   │
   ▼
2. Supabase OAuth flow (managed by Supabase)
   │
   ▼
3. Supabase creates auth.users record + generates ES256 JWT
   │
   ▼
4. Mobile app receives JWT token
   │
   ▼
5. Mobile sends JWT to our API: POST /auth/verify
   │
   ▼
6. Our API verifies JWT using Supabase JWKS endpoint
   │
   ▼
7. Create/find corresponding User record in our PostgreSQL
   │
   ▼
8. Return app-specific data: { userId, email, isNewUser, hasProfile }
```

### The Link Between Databases

```typescript
// Supabase auth.users table (managed by Supabase)
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // UUID from Supabase
  email: "john@example.com",
  email_verified: true,
  // ... other auth fields
}

// Our User table (managed by us via Prisma)
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // Same UUID!
  email: "john@example.com",
  createdAt: "2024-03-12T...",
  // ... our business fields
}
```

**Key insight**: Same user exists in both databases, linked by UUID, but with different purposes.

---

## JWT Architecture: ES256 JWKS

**⚠️ Critical Change from Older Supabase Versions**

### Old Way (Supabase CLI v1.x)
```bash
supabase status
# Showed: JWT secret: "your-secret-here"

# In API code:
jwt.verify(token, process.env.SUPABASE_JWT_SECRET)  // HS256
```

### New Way (Supabase CLI v2.x - Current)
```bash
supabase status
# Shows: No JWT secret, uses ES256 with JWKS

# In API code:
const jwks = await fetch('http://127.0.0.1:54321/auth/v1/.well-known/jwks.json')
// Use jose library for ES256 verification
```

### Our Implementation (AC-1-08)
```typescript
import { jwtVerify, createRemoteJWKSet } from 'jose'

// JWKS endpoint for ES256 public key
const JWKS = createRemoteJWKSet(new URL('http://127.0.0.1:54321/auth/v1/.well-known/jwks.json'))

// Verify the JWT
const { payload } = await jwtVerify(token, JWKS, {
  issuer: 'http://127.0.0.1:54321/auth/v1',
  audience: 'authenticated'
})
```

---

## Environment Mapping

### Local Development
| Component | Host | Port | URL | Notes |
|-----------|------|------|-----|-------|
| **Our PostgreSQL** | localhost | 5432 | `postgresql://postgres:postgres@localhost:5432/landednz` | docker-compose |
| **Supabase PostgreSQL** | 127.0.0.1 | 54322 | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Supabase CLI |
| **Supabase API** | 127.0.0.1 | 54321 | `http://127.0.0.1:54321` | Auth endpoints |
| **Supabase Studio** | 127.0.0.1 | 54323 | `http://127.0.0.1:54323` | Web UI |

### Production (Phase 5)
| Component | Provider | URL | Notes |
|-----------|----------|-----|-------|
| **Our PostgreSQL** | Railway | `postgresql://user:pass@railway.app:5432/db` | Business data |
| **Supabase PostgreSQL** | Supabase Cloud | Managed by Supabase | Auth data |
| **Supabase API** | Supabase Cloud | `https://yourproject.supabase.co` | Auth endpoints |

---

## Migration Strategy

### Our Database (Prisma)
```bash
# Create new migration
npx prisma migrate dev --name add_user_profile

# Apply to production
npx prisma migrate deploy
```

### Supabase Database (Managed)
- **We don't migrate Supabase's auth schema** — it's managed by Supabase
- **OAuth configuration** is done through Supabase Studio/Dashboard
- **auth.users table** evolves with Supabase updates automatically

### Schema Separation
```sql
-- Our PostgreSQL (port 5432)
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,  -- matches Supabase auth.users.id
  email TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Supabase PostgreSQL (port 54322) - we never touch this
-- auth.users, auth.sessions, etc. managed by Supabase
```

---

## Troubleshooting

### Common Issues

**🚨 "JWT verification failed"**
- **Cause**: Using old HS256 approach instead of ES256 JWKS
- **Fix**: Use `jose` library with JWKS endpoint
- **Check**: `curl http://127.0.0.1:54321/auth/v1/.well-known/jwks.json`

**🚨 "Port 5432 already in use"**
- **Cause**: Conflict between our Postgres and Supabase Postgres
- **Fix**: Our app uses 5432, Supabase uses 54322 — check `DATABASE_URL`

**🚨 "Supabase services not starting"**
- **Cause**: Docker Desktop not running or port conflicts
- **Fix**: `supabase stop && supabase start`
- **Check**: `supabase status` should show all core services

**🚨 "User not found after successful login"**
- **Cause**: JWT verified but no User record in our database
- **Fix**: `/auth/verify` should create User record on first login
- **Debug**: Check both `auth.users` (Supabase Studio) and `User` (our DB)

### Debug Commands

```bash
# Check our database
npx prisma studio  # Browse our User table

# Check Supabase database
open http://127.0.0.1:54323  # Supabase Studio

# Check JWT structure
curl -H "Authorization: Bearer YOUR_JWT" http://localhost:3000/auth/verify

# Verify JWKS endpoint
curl http://127.0.0.1:54321/auth/v1/.well-known/jwks.json
```

---

## Performance Considerations

### Connection Management
- **Our DB**: Single Prisma client, connection pooling via PgPool
- **Supabase**: Managed connection pooling, no direct DB access

### Query Optimization
- **Our DB**: We control indexes, query optimization, EXPLAIN ANALYZE
- **Supabase**: Optimized by Supabase for auth workloads

### Scaling Bottlenecks
- **Our DB**: Business logic queries, vector searches (Phase 5)
- **Supabase**: JWT verification rate limits (10,000 requests/hour free tier)

---

## Security Model

### Our Database Security
- **Network**: Private Railway network in production
- **Application**: Prisma parameterized queries prevent SQL injection
- **Access**: Only our API has database credentials

### Supabase Security
- **Auth Flow**: OAuth tokens never touch our database
- **JWT Signing**: ES256 with managed key rotation
- **Rate Limiting**: Built-in protection against auth brute force

### Cross-Database Security
- **User ID matching**: UUIDs prevent ID collision/enumeration
- **No sensitive auth data**: We never store passwords, OAuth tokens
- **Audit trail**: Auth events in Supabase, business events in our DB