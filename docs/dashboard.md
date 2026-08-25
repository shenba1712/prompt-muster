# PromptMuster Dashboard

## Current Week

**Week 5** — Starting. Week 4 closed 2026-08-10 (ran one day past its
Sun 2026-08-09 target — a much smaller overrun than Week 2's ~2x). Tier 1
is now fully complete: `#06` (Next.js Routing) and `#07` (Professional UI)
are both `[x]` — every ticket named in Week 4's plan landed (`06.4`, `07.4`,
`07.6`, `07.8`, `08.1`, `08.2`) except `07.7`, which is `[~]` partial. See
`core/completion-log.md`'s Week 4 section for the full close-out, and
`reference/roadmap/week4-plans/overview.md` for what was planned.

## Progress

_"Complete" means the feature works as an interactive frontend feature per Week 1's documented scope (frontend-only, in-memory — see `CLAUDE.md`). It does not mean production-hardened: there's no persistence (expected, out of scope until a later tier), no input validation feedback, and no error handling beyond clipboard-copy failures. Tracked in Topics to Revisit, not repeated per row below._

### Backlog Features

| #   | Feature                       | Status                                                                                                                 |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 01  | Prompt CRUD                   | Complete — create/read/update/delete all work (update flow landed Week 2)                                            |
| 02  | Prompt Favoriting             | Complete                                                                                                               |
| 03  | Multi-Dimensional Filtering   | Complete                                                                                                               |
| 04  | Full-Text Search              | Complete                                                                                                               |
| 05  | Category and Tag Organization | Complete                                                                                                               |
| 06  | Next.js Routing               | **Complete** — 06.1-06.4 all shipped; `06.4` (filters as URL state via `useFilterParams`, `/settings` stub) landed 2026-08-09 |
| 07  | Professional UI (shadcn/ui)   | **Complete** — primitives (07.1-07.3) Week 2; 07.5 (dark mode) Week 3, exceeding spec; 07.4 (delete-confirm) and 07.6 (design-system pass) both landed 2026-08-04; 07.8 (toast/motion policy) landed 2026-08-09/10. `07.7` (keyboard-nav audit) is `[~]` partial — real fixes shipped, but not the full ia.md §4 walkthrough the ticket scopes — tracked separately, doesn't gate `#07` |

### Week 1 Deliverables

| #   | Deliverable                          | Status                                                                                           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1   | Claude Code installed with CLAUDE.md | Complete                                                                                         |
| 2   | Next.js + TypeScript project         | Complete                                                                                         |
| 3   | Domain types                         | Complete                                                                                         |
| 4   | Seven typed components               | Complete — Header, PromptForm, PromptFilters, PromptCard, PromptList, EmptyState, FavoriteButton |
| 5   | State management (CRUD + favorite)   | Complete — update/edit landed Week 2 (was the known gap at Week 1 close)                          |
| 6   | Custom usePromptManager hook         | Complete                                                                                         |
| 7   | Multi-dimensional filtering          | Complete                                                                                         |
| 8   | Coding challenge                     | Complete                                                                                         |
| 9   | GitHub repo with daily commits       | Complete                                                                                         |

### Week 2 Deliverables

| #   | Deliverable                                                                | Status                                                                                                                     |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | `updatePrompt` in `usePromptManager` + edit UI wired into PromptForm/PromptCard | Complete                                                                                                              |
| 2   | Visible validation errors on empty title/content submit                   | Complete                                                                                                                   |
| 3   | Select defaults in PromptForm initialize to a real union value            | Complete                                                                                                                   |
| 4   | shadcn/ui installed and driving every interactive control                 | Complete — went beyond PromptForm/PromptFilters to the whole app (Header, PromptCard, EmptyState, FavoriteButton, `page.tsx`), plus custom `Badge`/`Card` primitives |
| 5   | `.prettierrc` committed, codebase reformatted                             | Complete                                                                                                                   |
| 6   | Vitest installed with real tests (`utils/prompt.ts`, `filterPrompts`, `usePromptManager`, minimum 12 cases across 3 files) | Complete — exceeded the minimum (69 tests across 3 files)                                                     |
| 7   | `coding-challenges` repo: Two Sum + LeetCode 3 solution + complexity notes | Unverified from this repo — lives in a separate repo, not checkable from here                                             |
| 8   | `notes/week-02-*.md` for every day worked                                 | Not done — no daily notes found; only the closing `notes/week-02-review.md` exists                                       |
| 9   | Updated `core/completion-log.md`, `core/backlog.md`, `core/claude.md` Current State, `docs/dashboard.md` | Complete as of 2026-08-10 — sat pending for several weeks (this row tracked that gap) until this maintenance pass closed all four |

### Week 3 Deliverables

| #   | Deliverable                                                                | Status                                                                                                            |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `PromptProvider` context lifting state out of the page                    | Complete — with its own test file                                                                                |
| 2   | `/prompts` list, `/prompts/[id]` detail + not-found, `/prompts/new` + `/prompts/[id]/edit` editor routes | Complete                                                            |
| 3   | Dark-mode toggle + `prefers-color-scheme` default                         | Complete — exceeded spec: server-read cookie via `cookies()`, no localStorage, no hydration flash                |
| 4   | Filters/search as URL state + settings page stub (06.4)                   | Complete — landed Week 4 (2026-08-09), not Week 3 as originally planned                                          |
| 5   | Delete-confirmation UX (07.4)                                              | Complete — landed Week 4 (2026-08-04/05), after four weeks carried                                                |
| 6   | `notes/week-03-*.md` daily notes                                          | Not done — second week running without daily notes; this dashboard reconstructed from git history + audit review |
| 7   | Coding-challenge bonuses (Week 3: context-hook factory, route matcher, notFound boundary, useDarkMode hook) | Not attempted — Week 2's bonuses (`pick`/`omit`, `cn()`) confirmed committed instead |
| 8   | LinkedIn posting begins (preset §5.3 said "from Week 3")                  | Not done — deferred to Week 4                                                                                    |

### Week 4 Deliverables

| #   | Deliverable                                                                | Status                                                                                                            |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `06.4` — filters/search as URL state + settings stub                      | Complete — `useFilterParams` hook, `/settings` route, Header hoisted to root layout with a home-linking logo     |
| 2   | `07.4` — delete-confirmation dialog                                       | Complete — shadcn `AlertDialog` via `DeleteConfirmDialog.tsx`, four weeks carried                                |
| 3   | `07.6` — design-system application pass                                   | Complete — gradient Header removed, titles via `CardTitle`, favorite star → phosphor icon, type scale/spacing app-wide, seed-data button dev-only gated |
| 4   | `07.7` — keyboard-navigation audit                                        | Partial — 4 real bugs found and fixed via ad hoc full-app audits (focus-trap escape, missing focus rings, wrong default-focus button); the actual ia.md §4 flow-by-flow walkthrough the ticket scopes not done |
| 5   | `07.8` — toast/inline/silence policy + motion tokens                      | Complete — policy audited against every current interaction; motion tokens wired into real transitions; global `prefers-reduced-motion` support added |
| 6   | `08.1` — dotprompt spike                                                   | Complete — `docs/prompt-file-format-spike.md` + 3 real `.prompt.md` example files, two grammar ambiguities explicitly left open for `08.3`; one (Picoschema's `(array)` grammar) resolved during `08.3` itself, one (`additionalProperties: false` default) still open |
| 7   | `08.2` — framework-free `core/` package scaffold                          | Complete, then hardened — `core/prompt-file.ts` + `core/parse-error.ts`; boundary enforced by eslint, then hardened against `require()`/dynamic `import()` and a stray-DOM-type gap via a standalone `core/tsconfig.json` |
| 8   | `08.3` — `.prompt` file parser                                            | Complete — `core/parse-prompt-file.ts`, `gray-matter`+`yaml` installed; body-splitting verified against google/dotprompt's real source; Picoschema `(array)` grammar ambiguity resolved the same way, which surfaced and fixed a real mistake in `generate-api-docs.prompt.md`'s own example |
| 9   | Test suite                                                                 | Grew from 77 to 193 tests across 23 files, all green throughout                                                  |
| 10  | Coding-challenge bonuses (Wed's `useConfirm` hook, Fri's frontmatter splitter) | Not attempted — no `coding-challenges` commits this week                                                     |
| 11  | `notes/week-04-*.md` daily notes                                          | Not done — third week running without daily notes                                                                |
| 12  | Two LinkedIn posts (Wed, Fri) + first Medium/writing-day article (Thu)    | Confirmed done (2026-08-10) — first Medium/writing-day session and both LinkedIn posts landed                     |
| 12  | Sunday maintenance pass (docs, velocity check, doc-sync script)           | Substantially done ahead of schedule, in the product repo itself, by 2026-08-08/10 — this session's job was reconciling that work back into the roadmap repo as the canonical source, not redoing it |

## Confidence Levels

Scale: 1 (unfamiliar) to 5 (confident). **Self-assessed only** — Claude can't reliably tell a question backed by genuine understanding apart from one built on borrowed phrasing, so it doesn't fill in Level. The Notes column is a neutral log of what came up each week, as a memory aid for your own rating, not a judgment.

| Skill            | Level | Notes                                                                                                                                                                                                                  |
| ---------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code      |       | This week: relied on CLAUDE.md's existing session-type/verify/justify conventions rather than defining them mid-session; asked how memory, CLAUDE.md, and BACKLOG.md should divide responsibility across chat threads. |
| TypeScript       |       | This week: questions centered on where types should live and why (e.g. CreatePromptInput in utils vs. types), `Omit`, `as const` derivation, and type guards vs. unsafe `as` casts.                                    |
| React Components |       | This week: discussed whether `EmptyState` should own total-vs-filtered branching logic itself, or leave it to the caller.                                                                                              |
| React State      |       | This week: discussed stale closures and the functional-updater pattern specifically when asking for a hook review.                                                                                                     |
| Custom Hooks     |       | This week: raised whether `usePromptManager` was doing too much (CRUD + filtering + clipboard) and should be split.                                                                                                    |
| Derived State    |       | This week: discussed `filteredPrompts`/counts as values computed during render rather than stored in state.                                                                                                            |

## Coding Challenges

| Date     | Problem                | Status    |
| -------- | ---------------------- | --------- |
| Sat Wk 1 | groupBy/countBy/sortBy | Completed |

## Topics to Revisit

- Error-handling strategy beyond form validation and clipboard-copy failures — still ad hoc; needs a deliberate pass once the shape is clearer.
- Delete confirmation / undo pattern — still deferred pending design thinking on where this goes. Two weeks running now.
- **Silent no-op bug (confirmed live, still open):** deleting the prompt you're currently editing, then clicking "Save changes," closes the form as if it succeeded with no error shown — the update silently matches nothing. `updatePrompt` still no-ops silently on a non-existent id.
- **Unsaved-input loss (confirmed by design, still open):** switching the edit target to a different prompt — or starting a create, then clicking Edit — remounts the form (by design, via its `key`) and silently discards whatever was typed, no confirmation.
- ~~`usePromptManager` still owns CRUD, filtering, and clipboard state in one hook...~~ **Moot as of Week 4** — the hook no longer exists; `PromptProvider` owns CRUD/favoriting/clipboard/seed-data state directly.
- `seedPrompts` test-data generator still lives inside `PromptProvider`, gated to non-production builds since 07.6 (2026-08-04) but not yet relocated out entirely.
- ~~Dark-mode tokens are now theme-correct...~~ **Closed Week 3** — toggle built, exceeds spec (server cookie, no flash).
- ~~**Design-system application debt (found 2026-08-04):** the gradient `Header`, default-anchor prompt titles, unicode favorite star, and "Load Sample Data" in production layout...~~ **Closed same day** — ticket 07.6 landed 2026-08-04.
- **Keyboard navigation** (design-system.md §4's hard requirement) — `07.7` is `[~]` partial: 4 real bugs found and fixed via ad hoc audits (focus-trap escape, missing focus rings, wrong default-focus button), but the actual ia.md §4 flow-by-flow walkthrough the ticket scopes still hasn't happened.
- ~~**Toast/motion policy**...~~ **Closed 2026-08-09/10** — ticket 07.8: policy audited against every interaction, motion tokens wired into real transitions, `prefers-reduced-motion` added.
- ~~`06.4` (filters/search as URL state + settings stub)...~~ **Closed 2026-08-09.**
- ~~`07.4` (delete-confirmation UX)...~~ **Closed 2026-08-04/05**, after four weeks carried.
- Three weeks running without daily `notes/week-0N-*.md` files (Weeks 2, 3, 4 all skipped) — this is no longer "worth a real decision," it needs one. The pattern is now the actual gap, not any individual week's miss.
- **New (Week 4 close-out):** the product repo's own `docs/` mirror got ahead of this roadmap repo this session — real doc updates (backlog/tickets/dashboard/CLAUDE.md corrections, plus a from-scratch `docs/core/completion-log.md`) happened directly in `prompt-muster` between 2026-08-04 and 2026-08-10, reconciled back here. Worth deciding deliberately whether the product repo or the roadmap repo is the actual source of truth for these mirrored docs going forward, rather than discovering the direction has reversed again next time.

## Weekly Reviews

| Week | Status   | Key Takeaway                                                                                                                                                                                                        | Link                    |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1    | Complete | Built filtering, favoriting, search, and a full visual identity through heavy iteration; strongest reasoning shown in TypeScript/state architecture, biggest gap is CRUD's missing "update" and zero test coverage. | notes/week-01-review.md |
| 2    | Complete | Closed the CRUD gap (edit/update), migrated the entire app to shadcn/ui well beyond the original two-file scope, stood up Vitest with 69 tests, and found/fixed two separate CSS cascade-layer bugs left over from pre-shadcn code. | notes/week-02-review.md |
| 3    | Complete | Shipped App Router + `PromptProvider` context, full detail/editor routing, and a dark-mode toggle that solved the hydration-flash problem better than the plan itself suggested (server-read cookie, not localStorage). Test suite grew to 77, still green. A same-day design-review + multi-angle audit found real Tier-1 UI debt (07.6-07.8) and a large Phase 1-3 backlog addition — see completion-log.md. | (no notes/week-03-review.md — reconstructed from git history) |
| 4    | Complete | Closed Tier 1 outright — `#06` and `#07` both `[x]`. `06.4`, `07.4`, `07.6`, `07.8`, `08.1`, and `08.2` (a stretch goal!) all landed; `07.7` partial. Test suite grew to 170+ across 22 files. Opened the domain-model rewrite on schedule (`core/` package, framework-free boundary enforced by eslint, then hardened). Real documentation work happened directly in the product repo this week — ahead of the roadmap repo, for once — and had to be reconciled back as the canonical source. | (no notes/week-04-review.md — third week running without daily notes; reconstructed from git history + the product repo's own parallel completion-log) |
