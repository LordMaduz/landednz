# apps/mobile — LandedNZ Mobile App
# Stack: React Native · Expo · RevenueCat SDK · Supabase Auth
# This file is loaded by Claude Code when working inside apps/mobile/.
# Keep under 90 lines. Add new gotchas via /learn during the build.

---

## Structure

```
apps/mobile/src/
├── screens/       ← OnboardingScreen, RoadmapScreen, TaskCardScreen, ChatScreen
├── components/    ← shared UI components
├── hooks/         ← custom React hooks
└── services/
    └── api.ts     ← all API calls to apps/api backend
```

**Key config files:**
- `app.json` — bundleIdentifier: `com.landednz.app` (must match App Store Connect exactly)
- `eas.json` — build profiles: development, preview, production

---

## Known Gotchas

### RevenueCat SDK

- **Requires a development build — NOT Expo Go.**
  Expo Go does not support custom native modules.
  Build a dev client first: `eas build --profile development --platform ios`
  Do not waste time debugging RevenueCat in Expo Go — it will never work.

- **Sandbox purchases fire real RevenueCat webhooks.**
  Test the full flow on a real device: sandbox purchase → webhook fires →
  `isSubscribed` updates in DB → content unlocks.

- **iOS simulator cannot test App Store payment flow.**
  Use a real device with a sandbox Apple ID.
  Create the sandbox Apple ID in App Store Connect before testing.

### Apple Sign-In

- **Apple Sign-In is mandatory if Google Sign-In is offered.**
  App Store guideline 4.8. Configure both from Phase 1 — adding Apple Sign-In
  late is painful and can block App Store submission.

- **`app.json` bundleIdentifier must match App Store Connect exactly.**
  Register `com.landednz.app` in App Store Connect before `eas submit` will work.
  Do this in Week 15 setup — not submission week.

### SSE Streaming

- **SSE streaming behaviour differs between iOS and Android.**
  Test on a real iOS device AND a real Android device before marking
  Phase 4 complete. Simulator does not replicate production streaming reliably.

- **Chat responses arrive as SSE chunks — parse progressively.**
  Each `data:` event is a JSON object `{ type: "chunk", text: "..." }` or `{ type: "done" }`.
  Display text as it arrives — do not wait for `done` to render.

### EAS Build

- **EAS Build free tier queues builds.**
  Upgrade to EAS Production plan at least one week before the App Store
  submission deadline. Free tier delays can cost days.

- **`eas build` for development profile required before any native module testing.**
  Includes: RevenueCat, Apple Sign-In, and any other native dependencies.

### General React Native

- **`packages/types/` for all types shared with the API.**
  Never redefine types locally that already exist in `packages/types/index.ts`.

- **API base URL via environment variable — never hardcode.**
  Use `process.env.EXPO_PUBLIC_API_URL` — different for local, preview, production.
