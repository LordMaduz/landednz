# apps/mobile — LandedNZ Mobile App
# Stack: React Native CLI · Xcode · RevenueCat SDK · Supabase Auth
# This file is loaded by Claude Code when working inside apps/mobile/.
# Keep under 90 lines. Add new gotchas via /learn during the build.

---

## Structure

```
apps/mobile/src/
├── screens/       ← LoginScreen, OnboardingScreen, RoadmapScreen, TaskCardScreen, ChatScreen
├── components/    ← shared UI components
├── hooks/         ← custom React hooks (useAuth stubbed — implemented in AC-1-06 migration)
└── services/
    ├── api.ts     ← all API calls to apps/api backend
    └── supabase.ts ← Supabase client singleton
```

**Key config files:**
- `ios/LandedNZ.xcodeproj` — Xcode project (bundleIdentifier: `com.landednz.app`)
- `android/` — Android project (package: `com.landednz.app`)
- `react-native.config.js` — React Native CLI configuration

---

## Development Commands

```bash
# Install iOS dependencies (run after npm install)
cd ios && pod install

# RELIABLE iOS Simulator Build (ALWAYS USE THIS)
cd ios && xcodebuild -workspace LandedNZ.xcworkspace -scheme LandedNZ -configuration Release -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build
xcrun simctl boot "iPhone 17 Pro"
xcrun simctl install "iPhone 17 Pro" /Users/ruchira/Library/Developer/Xcode/DerivedData/LandedNZ-*/Build/Products/Release-iphonesimulator/LandedNZ.app
xcrun simctl launch "iPhone 17 Pro" com.landednz.app

# Android (if needed)
npx react-native run-android
```

---

## Environment Variables

React Native CLI uses `.env` files (via react-native-dotenv or direct process.env):
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `API_URL` — Backend API URL (e.g. http://localhost:3000)

---

## Known Gotchas

### React Native CLI Setup

- **CocoaPods must be installed for iOS.**
  Run `cd ios && pod install` after any `npm install`.
  Missing pod install = red Xcode build.

- **Xcode version must match React Native version.**
  Check React Native release notes for compatible Xcode version before upgrading either.

- **Metro cache can cause stale bundle issues.**
  Run `npx react-native start --reset-cache` to force clean rebuild.

- **React Native CLI with Metro bundler is unreliable — NEVER use for iOS Simulator.**
  `npx react-native run-ios` fails with Metro TurboModule crashes and "Cannot read properties of undefined" errors.
  ALWAYS use direct Xcode release builds: xcodebuild → xcrun simctl install → xcrun simctl launch.
  Release builds embed JS bundle = zero Metro dependency. This approach is 100% reliable.

- **Simulator window visibility issues after app launch.**
  App may launch successfully but Simulator window not visible to user.
  Open Simulator app first (`open -a Simulator`) before launching the app to ensure window visibility.
  iPhone 17 Pro is the standard device — provides better testing environment than older simulators.

### Supabase OAuth

- **React Native OAuth requires manual deep link handling.**
  `detectSessionInUrl: true` doesn't work with custom schemes like `landednz://auth/callback`.
  Must manually extract `access_token` from URL fragment and call `supabase.auth.setSession()` to create session.

- **iOS Simulator networking uses 127.0.0.1 not localhost.**
  API calls to `http://localhost:3000` fail from iOS Simulator — use `http://127.0.0.1:3000` instead.
  Simulator's localhost refers to simulator itself, not Mac host machine.

- **URL polyfill required for Supabase SDK.**
  Add `react-native-url-polyfill/auto` import in `index.js` to prevent "URL.protocol is not implemented" errors.
  Supabase SDK uses web URL APIs not available in React Native by default.

### RevenueCat SDK

- **Requires a development build — cannot test in Metro/JS-only mode.**
  Build to simulator or real device via Xcode before testing any purchase flow.

- **Sandbox purchases fire real RevenueCat webhooks.**
  Test the full flow on a real device: sandbox purchase → webhook fires →
  `isSubscribed` updates in DB → content unlocks.

- **iOS simulator cannot test App Store payment flow.**
  Use a real device with a sandbox Apple ID.
  Create the sandbox Apple ID in App Store Connect before testing.

### Apple Sign-In

- **Apple Sign-In is mandatory if Google Sign-In is offered.**
  App Store guideline 4.8. Configure both from Phase 1.

- **Bundle ID `com.landednz.app` must match App Store Connect exactly.**
  Set from the beginning — changing it later requires a new App Store entry.

### SSE Streaming

- **SSE streaming behaviour differs between iOS and Android.**
  Test on a real iOS device AND real Android device before marking Phase 4 complete.

- **Chat responses arrive as SSE chunks — parse progressively.**
  Each `data:` event is `{ type: "chunk", text: "..." }` or `{ type: "done" }`.

### General React Native

- **`packages/types/` for all types shared with the API.**
  Never redefine types locally that already exist in `packages/types/index.ts`.

- **API base URL via environment variable — never hardcode.**
  Use `process.env.API_URL` — different for local, preview, production.
