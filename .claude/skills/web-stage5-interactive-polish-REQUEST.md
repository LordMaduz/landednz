# RPI Request — Web Stage 5: Interactive States and Animation Polish
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 5.

---

## Stage goal

All micro-interactions, transitions, and animation polish applied. Accessibility verified.
Performance optimised. **Stage 5 is complete when the product feels polished and professional,
matching the interaction quality in `mockup-screens/*.jsx` files.**

---

## Scope

**Builds:**
- Task completion micro-animation (checkmark draw-in 0.3s, card mute 0.2s)
- Onboarding question transitions (fade-in + slide-up 0.3s, fade-out + slide-up 0.35s)
- Roadmap reveal full animated sequence (~2s with personalised context lines)
- Chat streaming polish (no layout jitter, auto-scroll within fixed 420×600px panel)
- Premium gate decline animation (collapse to banner 0.3s)
- Phase section expand/collapse animation (height 0.2s)
- Task detail entrance animation (slideInRight 0.3s ease-out)
- First-use hints localStorage persistence
- Keyboard navigation for ALL interactive elements
- Focus management (chat overlay focus trap, return focus on close)
- Screen reader testing (semantic HTML, ARIA, live regions)
- `prefers-reduced-motion` verification across ALL animations
- Lighthouse audit (Performance ≥ 90, Accessibility ≥ 95)
- Bundle analysis (< 200KB gzipped for /roadmap)
- Cross-browser verification (Chrome, Firefox, Safari macOS)
- Playwright visual regression re-capture (updated baselines)

**Does NOT build:**
- New features, screens, or API changes

---

## Animation reference

Exact animation specs are documented in `MOCKUP-REFERENCE-INDEX.md`
under the ANIMATION SPECS section. All durations, easings, and keyframes are defined there.

Key animations to verify against mockups:
- Task row hover → `mockup-screens/landednz-screen-roadmap-dashboard.jsx`
- Chat thinking dots → `mockup-screens/landednz-screen-chat-interface.jsx`
- Onboarding transitions → `mockup-screens/landednz-screen-onboarding.jsx`
- Premium gate collapse → `mockup-screens/landednz-screen-premium-gate.jsx`
- Auth states → `mockup-screens/landednz-screen-auth.jsx`

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W5-01 | Task completion animation + reduced motion = instant | Visual + toggle |
| AC-W5-02 | Onboarding transitions + reduced motion = instant | Visual + toggle |
| AC-W5-03 | Roadmap reveal full sequence (~2s), reduced motion = skip | Visual + toggle |
| AC-W5-04 | Chat streaming: no jitter, auto-scroll, citations inline, within 420×600 floating panel | Send real message |
| AC-W5-05 | Premium gate decline: collapse to banner, reduced motion = instant | Click decline |
| AC-W5-06 | Phase expand/collapse: height 0.2s, triangle rotation | Click headers |
| AC-W5-07 | Task detail: slideInRight 0.3s on enter, instant back | Click task + back |
| AC-W5-08 | Keyboard: Tab follows visual order, Enter/Space activates, Escape closes chat overlay | Keyboard walkthrough |
| AC-W5-09 | Focus: chat open → close button focus, chat close → trigger focus, trap active | Keyboard chat test |
| AC-W5-10 | Screen reader: alt text, aria-labels, aria-live polite/assertive | VoiceOver walkthrough |
| AC-W5-11 | `prefers-reduced-motion` verified for ALL animations | Full walkthrough with toggle |
| AC-W5-12 | Lighthouse /roadmap: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90 | Run Lighthouse |
| AC-W5-13 | Bundle: /roadmap < 200KB gzipped, tree-shaking verified | `npx next build` + analyze |
| AC-W5-14 | First-use hints persist in localStorage, survive refresh | Clear storage, verify return |
| AC-W5-15 | Playwright visual regression re-captured, baselines updated | `npx playwright test --update-snapshots` |
| AC-W5-16 | Cross-browser: Chrome, Firefox, Safari macOS, all screens correct | Manual in each browser |

---

## Known failure points

- **Chat jitter** — floating panel has fixed 420×600px dimensions; messages scroll within, panel never resizes
- **Focus trap scope** — only the chat overlay needs focus trap (it's an overlay). Task detail does NOT need focus trap (it's content replacement, not a panel)
- **Lighthouse perf on SSE** — chat page may tank metrics; test /roadmap specifically
- **Framer Motion bundle** — can add 30KB+ if not tree-shaken; only import `motion`, `AnimatePresence`
- **Safari animation quirks** — `transform` + `will-change` may need explicit values for Safari

---

## Skills to load

- `web-design-system` — animation durations, reduced motion rules
- `web-component-patterns` — content replacement animation

---

## Stage gate

ALL 16 ACs must pass. Lighthouse meets thresholds. Keyboard-only full walkthrough.
VoiceOver test on roadmap + chat. Reduced motion full walkthrough. Cross-browser check.

**Mockup interaction comparison (MANDATORY):**
Open each mockup .jsx file and compare hover states, transitions, and animations
against the built product. The mockups define the interaction quality bar.

Then run `/rpi:gate web-stage5`.
