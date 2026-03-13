# Infrastructure Architecture

*📝 This document will be expanded during Phase 5 deployment*

LandedNZ infrastructure spans local development, staging, and production environments.

---

## Overview

### Environment Strategy
- **Local Development**: Docker Compose + Supabase CLI
- **Production API**: Railway (containerized deployment)
- **Production Database**: Railway PostgreSQL
- **Production Auth**: Supabase Cloud
- **Mobile Distribution**: App Store + Google Play Store

---

## Local Development Stack

### Docker Services
```yaml
# docker-compose.yml
services:
  postgres:          # Port 5432 - App business data
    image: pgvector/pgvector:pg16

# Supabase CLI services (separate from docker-compose)
# - supabase_db_*     # Port 54322 - Auth data
# - supabase_auth_*   # Port 54321 - Auth API
# - supabase_kong_*   # Port 54321 - API Gateway
# - supabase_studio_* # Port 54323 - Web UI
```

### Port Mapping
| Service | Port | Purpose | Managed By |
|---------|------|---------|------------|
| App PostgreSQL | 5432 | Business data | docker-compose |
| Fastify API | 3000 | API endpoints | npm run dev |
| Supabase API | 54321 | Auth endpoints | supabase CLI |
| Supabase Studio | 54323 | Auth management UI | supabase CLI |
| Supabase DB | 54322 | Auth data | supabase CLI |

---

## Production Architecture (Phase 5)

### Deployment Targets
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Mobile Apps   │    │   Railway API    │    │ Supabase Cloud  │
│ (App/Play Store)│◄──►│   (Containerized)│◄──►│     (Auth)      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │ Railway Postgres│
                       │  (Business Data)│
                       │                 │
                       └─────────────────┘
```

---

## To Be Documented

### Local Development
- [ ] Docker Compose setup and troubleshooting
- [ ] Supabase CLI management
- [ ] Environment variable management
- [ ] Database seeding and migrations

### Production Deployment (Phase 5)
- [ ] Railway deployment configuration
- [ ] Environment variable management (production)
- [ ] Database migration strategy
- [ ] Monitoring and logging setup
- [ ] Backup and disaster recovery

### Mobile Distribution
- [ ] Xcode build and archive configuration
- [ ] App Store submission process
- [ ] Google Play Store submission
- [ ] Certificate management (iOS)
- [ ] Update and rollback strategy

### Security & Compliance
- [ ] SSL/TLS configuration
- [ ] Environment isolation
- [ ] Secret management
- [ ] Compliance considerations (GDPR, privacy)

---

*This document will be completed during Phase 5 production deployment preparation.*