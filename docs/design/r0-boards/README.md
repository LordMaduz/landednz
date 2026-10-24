# R0 approved boards (Precise, canvas version 1792798426-d102)

Source of the approved page boards on the design canvas
(https://claude.ai/artifact/515pzxGLq8z371DbXf9gVc). Built pages must match these (CW02′).

- `ui_parts.py`: shared tokens and parts (CSS, header, footer, route rail). The single source for exact values.
- `build_*.py`: generate the `.dc.html` boards (`python3 build_home.py` etc.).
- `*.dc.html`: the generated boards. Interactive ones take a `scenario` prop:
  `JourneyHome` (the Roadmap) = default | open | streaming | first | error; `Onboarding` = questions | preview; `Home` takes `firstUse`.
- Phone boards (`*Phone.dc.html`) are the same page rendered at 390 px.

Board names vs routes: Home → `/app`, JourneyHome → `/app/roadmap`, Landing → `/`, Onboarding → `/onboarding`, OnboardingPreview → `/onboarding/preview`, SignIn → `/signin`, Settings → `/settings`, Legal → `/privacy` and `/terms`.
