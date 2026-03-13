# Mobile Architecture

*📝 This document will be expanded during Phase 1 mobile implementation*

LandedNZ mobile app is built with **React Native CLI** for cross-platform iOS and Android deployment.

---

## Overview

### Stack
- **Framework**: React Native CLI (no Expo)
- **Development**: iOS Simulator via `npx react-native run-ios`, Android Emulator via `npx react-native run-android`
- **Build**: Xcode for iOS production builds, Android Studio for Android
- **State Management**: TBD (React Query + Context, or Redux Toolkit)
- **Navigation**: React Navigation v6
- **Authentication**: Supabase Auth (Google + Apple OAuth via react-native-app-auth)

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
- [ ] React Native CLI project structure (ios/, android/)
- [ ] Navigation structure (bottom tabs, screen flow)
- [ ] Apple Sign-In configuration (AC-1-07)
- [ ] Google OAuth setup via react-native-app-auth (AC-1-06)
- [ ] TypeScript setup and shared types import
- [ ] CocoaPods setup and pod install workflow

### Authentication Flow
- [ ] OAuth implementation (Google + Apple via react-native-app-auth)
- [ ] JWT token storage (react-native-keychain)
- [ ] Token refresh handling
- [ ] Auth state management across app

### Feature Implementation
- [ ] Roadmap screens (Phase 2)
- [ ] Task card components and states
- [ ] Chat interface with streaming (Phase 4)
- [ ] Onboarding flow and profile setup

### Platform Considerations
- [ ] iOS vs Android OAuth differences
- [ ] App Store submission via Xcode + App Store Connect
- [ ] Deep linking setup (iOS URL Schemes)
- [ ] Push notification setup (future)

---

*This document will be completed as mobile screens are implemented in each phase.*
