# RPI Request — Phase 3: Monetisation
# Read this file at the start of every /rpi:research and /rpi:implement session for Phase 3.

---

## Phase goal

Premium gate implemented and functional. RevenueCat integration working end-to-end.
Users can upgrade, payment processes correctly, premium content unlocks.
Subscription status persists across sessions.

---

## Scope

**Builds:**
- Premium gate card (inline in roadmap — not modal)
- Three response paths: upgrade, defer, decline
- RevenueCat SDK integration (iOS + Android)
- Subscription record creation on purchase (webhook from RevenueCat)
- Premium gate enforcement on task routes (403 for unsubscribed)
- Subscription status check in app (guards premium screens)
- Defer path email (Resend — 24hr specific task reminder)
- Account creation gate (required before premium purchase)

**Does NOT build:**
- AI chat (Phase 4)
- Push notifications (post-MVP)

---

## Key contracts

### `POST /subscription/webhook`
- Not authenticated — uses HMAC signature verification
- Header: `X-RevenueCat-Signature`
- **HMAC verification runs BEFORE any DB operation — non-negotiable**
- Events handled: `INITIAL_PURCHASE` → isActive: true, `RENEWAL` → update expiresAt, `EXPIRATION` → isActive: false, `CANCELLATION` → no action
- Returns 401 if HMAC fails. DB untouched on 401.

### `GET /roadmap/tasks/:taskId` — premium gate 403 response
```typescript
interface PremiumGateResponse {
  error: "PREMIUM_REQUIRED";
  taskId: string;
  taskName: string;
  consequenceLinePreview: string;   // first sentence only — teaser
  gateContext: {
    irdMathCaption: string;         // "One week of emergency tax = NZD $280. 6 months = NZD $49."
    monthlyPrice: "NZD $9.99";
    sixMonthPrice: "NZD $49";
  };
}
```

### `POST /subscription/defer`
- Sends 24hr reminder email via Resend
- Email subject must reference the specific task — not generic
- Response: `{ emailScheduled: true }`

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-3-01 | RevenueCat SDK initialises in dev build (NOT Expo Go). iOS + Android both initialised. | RevenueCat customer ID appears in dashboard after app launch |
| AC-3-02 | Monthly purchase (NZD $9.99) completes in sandbox. Webhook fires. `isActive: true` in DB within 10s. | `GET /subscription/status` returns `isSubscribed: true` |
| AC-3-03 | Six-month purchase (NZD $49) completes. `expiresAt` ~6 months from purchase. | Inspect DB record |
| AC-3-04 | `GET /roadmap/tasks/:taskId` for PREMIUM task returns 403 with PremiumGateResponse for unsubscribed user | Inspect response body |
| AC-3-05 | Same endpoint returns 200 with full task detail for subscribed user | Inspect response body |
| AC-3-06 | EXPIRATION webhook sets `isActive: false`. CANCELLATION webhook does NOT set `isActive: false`. | Fire both webhook events, inspect DB |
| AC-3-07 | `POST /subscription/webhook` with invalid HMAC returns 401. DB not touched. | Send bad signature |
| AC-3-08 | Premium gate card renders inline in roadmap (not as modal) | Visual check |
| AC-3-09 | Upgrade path: taps upgrade → RevenueCat sheet → completes → task immediately accessible. No restart. | End-to-end on real device |
| AC-3-10 | Defer path: `POST /subscription/defer` called with taskId. Email delivered within 5 min with task name in subject. | Check email inbox |
| AC-3-11 | Decline path: gate dismissed, minimal banner persists at bottom. Roadmap still fully navigable. | Visual check |
| AC-3-12 | Account creation gate: user without User record cannot complete purchase. Structural — not a special check. | Verify onboarding flow requires auth before reaching gate |

---

## Known failure points

- **RevenueCat requires dev build — NOT Expo Go.** See CLAUDE.md Known Gotchas. Do not waste time debugging RevenueCat in Expo Go.
- **HMAC before DB — always.** Verify `X-RevenueCat-Signature` header BEFORE touching any data. This is constitutional constraint C09.
- **EXPIRATION vs CANCELLATION:** Users retain access from cancellation until expiration. Wrong event = wrong revocation timing. This is a common mistake.
- **Sandbox purchases fire real webhooks.** Test the full flow on a real device with sandbox Apple ID. Create sandbox Apple ID in App Store Connect first.
- **iOS simulator cannot test payment flow.** Real device required for AC-3-01 through AC-3-09.

---

## Skills to load

None specific to Phase 3. Review CLAUDE.md RevenueCat Known Gotchas section before starting.

---

## Phase gate

ALL 12 ACs must pass. Critical: AC-3-01 through AC-3-06 must be tested on a real device.
Then run `/rpi:gate phase3`.
