# PromptMuster Dashboard

## Current Week

**Week 2** — Complete. Closing the CRUD Gap, Professional UI (shadcn/ui), First Tests

## Progress

_"Complete" means the feature works as an interactive frontend feature per Week 1's documented scope (frontend-only, in-memory — see `CLAUDE.md`). It does not mean production-hardened: there's no persistence (expected, out of scope until a later tier), no input validation feedback, and no error handling beyond clipboard-copy failures. Tracked in Topics to Revisit, not repeated per row below._

### Backlog Features

| #   | Feature                       | Status                                                                                                                  |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 01  | Prompt CRUD                   | Complete — create/read/update/delete all work (update flow landed Week 2)                                               |
| 02  | Prompt Favoriting             | Complete                                                                                                                |
| 03  | Multi-Dimensional Filtering   | Complete                                                                                                                |
| 04  | Full-Text Search              | Complete                                                                                                                |
| 05  | Category and Tag Organization | Complete                                                                                                                |
| 06  | Next.js Routing               | Not started — deliberately deferred to Week 3                                                                           |
| 07  | Professional UI (shadcn/ui)   | Complete — every component and `page.tsx` migrated, exceeding the original Week 2 scope (PromptForm/PromptFilters only) |

### Week 1 Deliverables

| #   | Deliverable                          | Status                                                                                           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1   | Claude Code installed with CLAUDE.md | Complete                                                                                         |
| 2   | Next.js + TypeScript project         | Complete                                                                                         |
| 3   | Domain types                         | Complete                                                                                         |
| 4   | Seven typed components               | Complete — Header, PromptForm, PromptFilters, PromptCard, PromptList, EmptyState, FavoriteButton |
| 5   | State management (CRUD + favorite)   | Complete — update/edit landed Week 2 (was the known gap at Week 1 close)                         |
| 6   | Custom usePromptManager hook         | Complete                                                                                         |
| 7   | Multi-dimensional filtering          | Complete                                                                                         |
| 8   | Coding challenge                     | Complete                                                                                         |
| 9   | GitHub repo with daily commits       | Complete                                                                                         |

### Week 2 Deliverables

| #   | Deliverable                                                                                                                | Status                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `updatePrompt` in `usePromptManager` + edit UI wired into PromptForm/PromptCard                                            | Complete                                                                                                                                                             |
| 2   | Visible validation errors on empty title/content submit                                                                    | Complete                                                                                                                                                             |
| 3   | Select defaults in PromptForm initialize to a real union value                                                             | Complete                                                                                                                                                             |
| 4   | shadcn/ui installed and driving every interactive control                                                                  | Complete — went beyond PromptForm/PromptFilters to the whole app (Header, PromptCard, EmptyState, FavoriteButton, `page.tsx`), plus custom `Badge`/`Card` primitives |
| 5   | `.prettierrc` committed, codebase reformatted                                                                              | Complete                                                                                                                                                             |
| 6   | Vitest installed with real tests (`utils/prompt.ts`, `filterPrompts`, `usePromptManager`, minimum 12 cases across 3 files) | Complete — exceeded the minimum (69 tests across 3 files)                                                                                                            |
| 7   | `coding-challenges` repo: Two Sum + LeetCode 3 solution + complexity notes                                                 | Unverified from this repo — lives in a separate repo, not checkable from here                                                                                        |
| 8   | `notes/week-02-*.md` for every day worked                                                                                  | Not done — no daily notes found; only the closing `notes/week-02-review.md` exists                                                                                   |
| 9   | Updated `core/completion-log.md`, `core/backlog.md`, `core/claude.md` Current State, `docs/dashboard.md`                   | Complete                                                                                                                                                             |

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
- **Silent no-op bug (narrowed, not eliminated):** `updatePrompt` still no-ops silently on a non-existent id with no error shown. The single-page repro (deleting the prompt you're editing, from the same page, then saving) no longer exists now that create/edit live on their own routes (`/prompts/new`, `/prompts/[id]/edit`) with no Delete button co-rendered — but the underlying no-op is still there and would resurface via any other path to a stale id (e.g. a second tab deleting the same prompt).
- `usePromptManager` still owns CRUD, filtering, and clipboard state in one hook — deliberately not split yet (single consumer).
- `seedPrompts` test-data generator still lives inside the production hook, self-flagged as temporary, not yet relocated.
- Dark-mode tokens are now theme-correct (`globals.css` `.dark` values match design-system.md §2.1), but there's still no toggle or `prefers-color-scheme` wiring that activates `.dark` — the values are ready, the activation mechanism isn't built.

## Weekly Reviews

| Week | Status   | Key Takeaway                                                                                                                                                                                                                        | Link                    |
| ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1    | Complete | Built filtering, favoriting, search, and a full visual identity through heavy iteration; strongest reasoning shown in TypeScript/state architecture, biggest gap is CRUD's missing "update" and zero test coverage.                 | notes/week-01-review.md |
| 2    | Complete | Closed the CRUD gap (edit/update), migrated the entire app to shadcn/ui well beyond the original two-file scope, stood up Vitest with 69 tests, and found/fixed two separate CSS cascade-layer bugs left over from pre-shadcn code. | notes/week-02-review.md |
