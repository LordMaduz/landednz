# Settlement guide backend: Task 15 results

Measured 2026-10-30 (S7) on a local live API (`AI_MODE=live`, `ANTHROPIC_MODEL=claude-haiku-5-5` from `.env.local`; the owner rule keeps Sonnet for staging and production). Runner: `make guide-accuracy` (`scripts/guide-accuracy.ts`), set: `apps/api/accuracy/guide-questions.yaml` (41 questions).

## 1. Understand step latency (Haiku 5.5, structured output, effort `low`)

Direct calls with the real `GUIDE_UNDERSTAND_PROMPT` and schema, ~1,125 input / 60–110 output tokens, 8 questions per arm, one reused client.

| Arm | p50 | p75 | max |
|---|---|---|---|
| thinking default (adaptive), run 1 | 1,463 ms | 1,827 ms | 2,013 ms |
| `thinking: {type: "disabled"}` | 1,944 ms | 2,179 ms | 2,460 ms |
| thinking default, run 2 | 1,441 ms | 1,568 ms | 1,815 ms |
| round-trip floor (`max_tokens: 5`, "Say ok") | 917–1,330 ms (one 2,822 ms) | | |

`output_tokens_details.thinking_tokens` was 0 on every call in both arms: at effort `low` Haiku does not think on this task, so the thinking setting is not the cause.

**Ruling:** understand timeout 1,000 → 3,000 ms, thinking left at the default. The 1 s budget sat at the network floor, so live understand fell back on almost every question (S6 curl runs) and Haiku's distress, scope and memory signals never fired. A first raise to 2 s still lost a distress signal at 2,004 ms in the accuracy run (about 1 call in 10 reaches 2 s), so the budget covers the tail at 3 s. Spec §7 "understand fails / > 1 s" now reads 3 s in code.

## 2. Pricing (checked against the Claude API reference, 2026-10-30)

| Model | Input | Output | Cache read | Cache write (5 min, 1.25×) |
|---|---|---|---|---|
| Sonnet 5.5 | $2 / MTok | $10 / MTok | $0.20 / MTok | $2.50 / MTok |
| Haiku 5.5 | $0.10 / MTok | $0.50 / MTok | $0.01 / MTok | $0.125 / MTok |

Web search: $10 per 1,000 = 1¢ each. The plan's rate constants were right; cache-write tokens are now captured (`cache_creation_input_tokens`) and priced in `turnCostCents`. The understand call sends no `cache_control`, so it never writes cache; the answer call caches its system prompt.

## 3. Live-fetch block rate per host (plain `fetch`, bundle source pages, PDFs skipped)

All allowlisted hosts returned HTML on every page (147/147 pages on 25 hosts) except one:

| Host | OK | Blocked |
|---|---|---|
| getready.govt.nz | 0/6 | 100% (HTTP 403) |

Every other host, e.g. ird.govt.nz 30/30, immigration.govt.nz 19/19, tenancy.govt.nz 14/14, education.govt.nz 10/10, healthnz.govt.nz 9/9, nzta.govt.nz 7/7, employment.govt.nz 7/7: 100% OK.

**Owner decision needed (spec §11):** getready.govt.nz blocks plain HTTP clients. Options: leave it (the emergency-plan task's guide chunks still answer; only live reads of that host fail and show `official_unavailable`), or add the Anthropic `web_fetch_20260209` fallback for that host (one extra model call with up to ~4k page tokens per live read).

## 4. Accuracy runs

Full 41-question set, one fresh test user per question, judge = Haiku with the cited text (`GUIDE_ACCURACY_JUDGE_PROMPT`). Relevance-floor sweep after the S7 fixes (date in aboutUser, gate `*` closer, distress bypasses the out-of-scope redirect, visa-conditions in scope, crisis keywords, judge prompt):

| Floor | Grounded (≥ 95%) | Sources (≥ 90%) | Invented facts (0) | OOS declines | Crisis text | p75 first text guide / official | Avg cost |
|---|---|---|---|---|---|---|---|
| 0.2 | 95.4% | 100% | 0 | 100% | 100% | 6,806 / 5,442 ms | 0.17¢ |
| **0.3** | **95.8%** | 100% | 0 | 100% | 100% | 6,279 / 4,415 ms | 0.15¢ |
| 0.4 | 94.8% FAIL | 100% | 0 | 100% | 100% | 6,877 / 4,600 ms | 0.14¢ |

Before the fixes (floor 0.3): grounded 92.1% FAIL, sources 97%, OOS declines 75% FAIL.

**Ruling:** `GUIDE_RELEVANCE_FLOOR` stays 0.3 (best groundedness and speed; sources are 100% at every floor). Groundedness passes with a thin margin: the unsupported sentences are mostly true facts the model adds beside a citation (e.g. the Tenancy line's phone number next to a cited Tenancy Services sentence), so the Sonnet staging run is the real check.

**Speed:** p75 first text is 4.4–6.9 s on local Haiku against the §5.2 target of 2.5 s. Understand (~1.2–1.5 s) and retrieval (~0.35 s) sit before the answer starts, and needsLive adds 0.3–2.4 s on about half the questions. Measure on staging with Sonnet before deciding on changes (owner question).
