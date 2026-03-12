# Mobile Architecture

*📝 This document will be expanded during Phase 1 mobile implementation*

LandedNZ mobile app is built with **React Native + Expo** for cross-platform iOS and Android deployment.

---

## Overview

### Stack
- **Framework**: React Native with Expo SDK
- **Development**: Expo Go for development, EAS Build for production
- **State Management**: TBD (React Query + Context, or Redux Toolkit)
- **Navigation**: React Navigation v6
- **Authentication**: Supabase Auth (Google + Apple OAuth)

### Screen Structure
```
apps/mobile/src/
├── screens/
│   ├── auth/          ← Sign-in, OAuth flows
│   ├── onboarding/    ← Profile setup, visa questions
│   ├── roadmap/       ← Task list, priority view, completion
│   └── chat/          ← AI chat interface, streaming
├── components/        ← Reusable UI components
├── navigation/        ← Tab navigation, screen routing
├── services/          ← API client, auth management
└── types/             ← Local TypeScript types
```

---

## To Be Documented

### Core Setup (Phase 1)
- [ ] Expo configuration (`app.json`, EAS settings)
- [ ] Navigation structure (bottom tabs, screen flow)
- [ ] Apple Sign-In configuration (AC-1-07)
- [ ] Google OAuth setup (AC-1-06)
- [ ] TypeScript setup and shared types import

### Authentication Flow
- [ ] OAuth implementation (Google + Apple)
- [ ] JWT token storage (secure storage)
- [ ] Token refresh handling
- [ ] Auth state management across app

### Feature Implementation
- [ ] Roadmap screens (Phase 2)
- [ ] Task card components and states
- [ ] Chat interface with streaming (Phase 4)
- [ ] Onboarding flow and profile setup

### Platform Considerations
- [ ] iOS vs Android OAuth differences
- [ ] App Store submission requirements
- [ ] Deep linking setup
- [ ] Push notification setup (future)

---

*This document will be completed as mobile screens are implemented in each phase.*