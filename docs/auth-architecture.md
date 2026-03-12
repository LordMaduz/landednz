# Authentication Architecture

*📝 This document will be expanded during Phase 1 implementation (AC-1-06 to AC-1-09)*

LandedNZ uses **Supabase Auth** for all authentication concerns, with ES256 JWT verification in our API.

---

## Overview

### OAuth Providers
- **Google OAuth**: Primary sign-in method (Android + iOS)
- **Apple Sign-In**: Required for iOS App Store (AC-1-07)

### JWT Flow
1. **User signs in** → Supabase handles OAuth flow
2. **Supabase returns JWT** → ES256 signed, contains user metadata
3. **Mobile sends JWT** → `Authorization: Bearer` header to our API
4. **API verifies JWT** → JWKS endpoint validation (not shared secret)
5. **API returns app data** → `{ userId, email, isNewUser, hasProfile }`

---

## ES256 JWKS Architecture

**⚠️ Breaking Change from Supabase CLI v1**

| Supabase CLI | JWT Algorithm | Verification Method |
|--------------|---------------|-------------------|
| **v1.x** (Legacy) | HS256 | Shared secret from `supabase status` |
| **v2.x** (Current) | ES256 | JWKS endpoint discovery |

### Current Implementation (ES256)
- **No shared secret** — asymmetric key pairs
- **JWKS endpoint**: `http://127.0.0.1:54321/auth/v1/.well-known/jwks.json`
- **Verification library**: `jose` (supports ES256 + JWKS)

---

## To Be Documented

### Implementation Details (AC-1-06 to AC-1-09)
- [ ] Google OAuth configuration (client IDs, redirect URLs)
- [ ] Apple Sign-In configuration (app.json, app delegate)
- [ ] JWT verification middleware implementation
- [ ] User creation/lookup flow in `/auth/verify`
- [ ] Error handling (invalid/expired tokens)
- [ ] Session management and refresh tokens

### Security Considerations
- [ ] JWT token storage (secure storage on mobile)
- [ ] Token refresh strategy
- [ ] Rate limiting on auth endpoints
- [ ] CORS configuration for auth flows

### Environment Configuration
- [ ] Local vs production OAuth settings
- [ ] Supabase project configuration
- [ ] Client ID management (iOS vs Android)

---

*This document will be completed as authentication features are implemented in Phase 1.*