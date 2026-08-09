# PromptMuster Dashboard

## Current Week

**Week 4** — Starting, short week (Wed 2026-08-05 → Sun 2026-08-09) —
mirrors Week 3's own short-week precedent since Week 3 itself closed on a
Tuesday. Week 3 (Next.js Routing) closed: 06.1-06.3 shipped (App Router,
`PromptProvider` context, detail route, editor routes); `06.4` (filters as
URL state + settings stub) relocates to Saturday's Block 0 this week, not
dropped. Professional UI (#07) stays `[~]` — 07.5 (dark mode) shipped Week
3, exceeding the plan; 07.4/07.6 are this week's Wednesday; 07.7/07.8 are
Saturday stretch or Week 5. See completion-log.md's Week 3 section and
`reference/roadmap/week4-plans/overview.md`.

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
| 06  | Next.js Routing               | In progress ([~]) — 06.1/06.2/06.3 complete (App Router + Context, detail route + not-found, editor routes); 06.4 (filters as URL state + settings stub) not started, carried to Week 4 |
| 07  | Professional UI (shadcn/ui)   | In progress ([~]) — primitives (07.1-07.3) shipped Week 2; 07.5 (dark mode) shipped Week 3, exceeding spec; **07.4 (delete-confirm) and 07.6 (design-system application pass) are done** (corrected 2026-08-08 — both were stale here; see `core/tickets.md` and `core/backlog.md`'s 2026-08-04 resolution); 07.7/07.8 (keyboard-nav audit, feedback/motion policy) still open |

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
| 9   | Updated `core/completion-log.md`, `core/backlog.md`, `core/claude.md` Current State, `docs/dashboard.md` | Partial — `backlog.md` updated; `CLAUDE.md` Current State and `completion-log.md` still pending             |

### Week 3 Deliverables

| #   | Deliverable                                                                | Status                                                                                                            |
| --- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `PromptProvider` context lifting state out of the page                    | Complete — with its own test file                                                                                |
| 2   | `/prompts` list, `/prompts/[id]` detail + not-found, `/prompts/new` + `/prompts/[id]/edit` editor routes | Complete                                                            |
| 3   | Dark-mode toggle + `prefers-color-scheme` default                         | Complete — exceeded spec: server-read cookie via `cookies()`, no localStorage, no hydration flash                |
| 4   | Filters/search as URL state + settings page stub (06.4)                   | Not started — carried to Week 4                                                                                  |
| 5   | Delete-confirmation UX (07.4)                                              | Complete — shadcn `AlertDialog` (`DeleteConfirmDialog.tsx`), wired via `PromptActions` (status corrected 2026-08-08; this row was stale)                                                                                |
| 6   | `notes/week-03-*.md` daily notes                                          | Not done — second week running without daily notes; this dashboard reconstructed from git history + audit review |
| 7   | Coding-challenge bonuses (Week 3: context-hook factory, route matcher, notFound boundary, useDarkMode hook) | Not attempted — Week 2's bonuses (`pick`/`omit`, `cn()`) confirmed committed instead |
| 8   | LinkedIn posting begins (preset §5.3 said "from Week 3")                  | Not done — deferred to Week 4                                                                                    |

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
- `usePromptManager` still owns CRUD, filtering, and clipboard state in one hook — deliberately not split yet (single consumer).
- `seedPrompts` test-data generator still lives inside the production hook, self-flagged as temporary, not yet relocated.
- ~~Dark-mode tokens are now theme-correct...~~ **Closed Week 3** — toggle built, exceeds spec (server cookie, no flash).
- ~~**Design-system application debt (found 2026-08-04):** the gradient `Header`, default-anchor prompt titles, unicode favorite star, and "Load Sample Data" in production layout all predate design-system.md and were never migrated.~~ **Closed same day (2026-08-04)** — ticket 07.6 landed: gradient removed, titles via `CardTitle`, star replaced with a phosphor icon, sample-data button dev-only gated (this bullet was stale until corrected 2026-08-08).
- **Keyboard navigation** is a stated hard requirement (design-system.md §4) with no ticket ever enforcing it until 07.7 (found 2026-08-04).
- **Toast/motion policy** — only 2 toasts exist anywhere in the doc set; motion tokens are defined but never wired into a real transition. Tracked as 07.8.
- `06.4` (filters/search as URL state + settings stub) — not started, carried to Week 4.
- ~~`07.4` (delete-confirmation UX) — fourth week carried, no decision made yet.~~ **Closed**
  — shipped as a shadcn `AlertDialog` (corrected 2026-08-08; this bullet was stale).
- Two weeks running without daily `notes/week-0N-*.md` files — worth a real decision (keep trying, or simplify the Document step) rather than a third silent lapse.

## Weekly Reviews

| Week | Status   | Key Takeaway                                                                                                                                                                                                        | Link                    |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1    | Complete | Built filtering, favoriting, search, and a full visual identity through heavy iteration; strongest reasoning shown in TypeScript/state architecture, biggest gap is CRUD's missing "update" and zero test coverage. | notes/week-01-review.md |
| 2    | Complete | Closed the CRUD gap (edit/update), migrated the entire app to shadcn/ui well beyond the original two-file scope, stood up Vitest with 69 tests, and found/fixed two separate CSS cascade-layer bugs left over from pre-shadcn code. | notes/week-02-review.md |
| 3    | Complete | Shipped App Router + `PromptProvider` context, full detail/editor routing, and a dark-mode toggle that solved the hydration-flash problem better than the plan itself suggested (server-read cookie, not localStorage). Test suite grew to 77, still green. A same-day design-review + multi-angle audit found real Tier-1 UI debt (07.6-07.8) and a large Phase 1-3 backlog addition — see completion-log.md. | (no notes/week-03-review.md — reconstructed from git history) |
