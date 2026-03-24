# RPI Request — Web Stage 5: Interactive States and Animation Polish
# Read this file at the start of every /rpi:research and /rpi:implement session for Web Stage 5.

---

## Stage goal

All micro-interactions, transitions, and animation polish applied. Accessibility verified.
Performance optimised. **Stage 5 is complete when the product feels polished and professional.**

---

## Scope

**Builds:**
- Task completion micro-animation (checkmark draw-in 0.3s, card mute 0.2s)
- Onboarding question transitions (fade-in + slide-up 0.3s)
- Roadmap reveal full animated sequence (~2s with context lines)
- Chat streaming polish (no layout jitter, auto-scroll)
- Premium gate decline animation (collapse to banner 0.3s)
- Phase section expand/collapse animation (height 0.2s)
- First-use hints localStorage persistence
- Keyboard navigation for ALL interactive elements
- Focus management (panel focus trap, return focus on close)
- Screen reader testing (semantic HTML, ARIA, live regions)
- `prefers-reduced-motion` verification across ALL animations
- Lighthouse audit (Performance ≥ 90, Accessibility ≥ 95)
- Bundle analysis (< 200KB gzipped for /roadmap)
- Cross-browser verification (Chrome, Firefox, Safari macOS)
- Playwright visual regression re-capture (updated baselines)

**Does NOT build:**
- New features, screens, or API changes

---

## Acceptance criteria

| AC | Description | Verification |
|----|-------------|-------------|
| AC-W5-01 | Task completion animation + reduced motion = instant | Visual + toggle |
| AC-W5-02 | Onboarding transitions + reduced motion = instant | Visual + toggle |
| AC-W5-03 | Roadmap reveal full sequence (~2s), reduced motion = skip | Visual + toggle |
| AC-W5-04 | Chat streaming: no jitter, auto-scroll, citations inline | Send real message |
| AC-W5-05 | Premium gate decline: collapse to banner, reduced motion = instant | Click decline |
| AC-W5-06 | Phase expand/collapse: height 0.2s, triangle rotation | Click headers |
| AC-W5-07 | Keyboard: Tab follows visual order, Enter/Space activates, Escape closes | Keyboard walkthrough |
| AC-W5-08 | Focus: panel open → close button focus, panel close → trigger focus, trap active | Keyboard panel test |
| AC-W5-09 | Screen reader: alt text, aria-labels, aria-live polite/assertive | VoiceOver walkthrough |
| AC-W5-10 | `prefers-reduced-motion` verified for ALL animations | Full walkthrough with toggle |
| AC-W5-11 | Lighthouse /roadmap: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90 | Run Lighthouse |
| AC-W5-12 | Bundle: /roadmap < 200KB gzipped, tree-shaking verified | `npx next build` + analyze |
| AC-W5-13 | First-use hints persist in localStorage, survive refresh | Clear storage, verify return |
| AC-W5-14 | Playwright visual regression re-captured, baselines updated | `npx playwright test --update-snapshots` |
| AC-W5-15 | Cross-browser: Chrome, Firefox, Safari macOS, all screens correct | Manual in each browser |

---

## Known failure points

- **Chat jitter** — message container height must be fixed; messages scroll within, container never resizes
- **Focus trap** — use `focus-trap-react` or manual `inert` attribute; test with Tab cycling
- **Lighthouse perf on SSE** — chat page may tank metrics; test /roadmap specifically
- **Framer Motion bundle** — can add 30KB+ if not tree-shaken; only import `motion`, `AnimatePresence`
- **Safari animation quirks** — `transform` + `will-change` may need explicit values for Safari

---

## Skills to load

- `web-design-system` — animation durations, reduced motion rules
- `web-component-patterns` — focus management pattern

---

## Stage gate

ALL 15 ACs must pass. Lighthouse meets thresholds. Keyboard-only full walkthrough.
VoiceOver test on roadmap + chat. Reduced motion full walkthrough. Cross-browser check.
Then run `/rpi:gate web-stage5`.
