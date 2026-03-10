# /learn [finding]
# Learning command — encodes corrections and discoveries into CLAUDE.md.

---

## Purpose

Every correction made during the build must be encoded so the next session
inherits the knowledge. A stale CLAUDE.md is worse than no CLAUDE.md.

Run `/learn [finding]` immediately after any:
- Bug discovered and fixed
- Architecture decision made
- Gotcha encountered (tool, framework, SDK, deployment)
- Incorrect assumption corrected
- Pattern established for the first time

---

## Steps

1. **Classify the finding**

   | Category | Where it goes in CLAUDE.md |
   |----------|---------------------------|
   | Framework/tool gotcha | `## Known Gotchas` — under the relevant subsection |
   | Architecture decision | `## Architecture Overview` or a new `## Decisions` section |
   | Coding pattern established | `## Coding Standards` |
   | Phase learning | New `## Phase N Learnings` section at bottom |
   | Correction to existing entry | Update the existing entry in place |

2. **Write the entry**

   Format for Known Gotchas:
   ```
   - **[Short title in bold].**
     [One to three sentences explaining the gotcha, why it happens,
     and the correct approach. Be specific — vague gotchas are useless.]
   ```

   Format for decisions:
   ```
   - **[Decision]** — [rationale in one sentence]. Decided [when/why].
   ```

3. **Update CLAUDE.md**
   - Add the entry to the correct section
   - Do not duplicate existing entries — update in place if it already exists
   - Keep entries concise — one paragraph maximum per gotcha

4. **Confirm**
   Output: `Learned: [short summary of what was added and where]`

---

## Rules

- Run `/learn` immediately after any correction — not at end of session
- Never silently fix and continue without encoding the learning
- The compounding effect over 16 weeks depends on discipline here
- One finding per `/learn` call — do not batch multiple learnings
