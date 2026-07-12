# PromptLab Dashboard

## Current Week

**Week 1** — Project Foundation, React Fundamentals, AI-First Development

## Progress

*"Complete" means the feature works as an interactive frontend feature per Week 1's documented scope (frontend-only, in-memory — see `CLAUDE.md`). It does not mean production-hardened: there's no persistence (expected, out of scope until a later tier), no input validation feedback, and no error handling beyond clipboard-copy failures. Tracked in Topics to Revisit, not repeated per row below.*

### Backlog Features

| #   | Feature                      | Status      |
|-----|------------------------------|-------------|
| 01  | Prompt CRUD                  | In progress — create/read/delete work; no edit/update yet |
| 02  | Prompt Favoriting            | Complete    |
| 03  | Multi-Dimensional Filtering  | Complete    |
| 04  | Full-Text Search             | Complete    |
| 05  | Category and Tag Organization| Complete    |
| 06  | Next.js Routing              | Not started |
| 07  | Professional UI (shadcn/ui)  | Not started |

### Week 1 Deliverables

| #   | Deliverable                             | Status                                                                                           |
|-----|-----------------------------------------|--------------------------------------------------------------------------------------------------|
| 1   | Claude Code installed with CLAUDE.md    | Complete                                                                                         |
| 2   | Next.js + TypeScript project            | Complete                                                                                         |
| 3   | Domain types                            | Complete                                                                                         |
| 4   | Seven typed components                  | Complete — Header, PromptForm, PromptFilters, PromptCard, PromptList, EmptyState, FavoriteButton |
| 5   | State management (CRUD + favorite)      | In progress — add/delete/favorite done, update/edit missing                                      |
| 6   | Custom usePromptManager hook            | Complete                                                                                         |
| 7   | Multi-dimensional filtering             | Complete                                                                                         |
| 8   | Coding challenge                        | Not started                                                                                      |
| 9   | GitHub repo with daily commits          | Complete                                                                                         |

## Confidence Levels

Scale: 1 (unfamiliar) to 5 (confident). **Self-assessed only** — Claude can't reliably tell a question backed by genuine understanding apart from one built on borrowed phrasing, so it doesn't fill in Level. The Notes column is a neutral log of what came up each week, as a memory aid for your own rating, not a judgment.

| Skill             | Level | Notes |
|-------------------|-------|-------|
| Claude Code       |       | This week: relied on CLAUDE.md's existing session-type/verify/justify conventions rather than defining them mid-session; asked how memory, CLAUDE.md, and BACKLOG.md should divide responsibility across chat threads. |
| TypeScript        |       | This week: questions centered on where types should live and why (e.g. CreatePromptInput in utils vs. types), `Omit`, `as const` derivation, and type guards vs. unsafe `as` casts. |
| React Components  |       | This week: discussed whether `EmptyState` should own total-vs-filtered branching logic itself, or leave it to the caller. |
| React State       |       | This week: discussed stale closures and the functional-updater pattern specifically when asking for a hook review. |
| Custom Hooks      |       | This week: raised whether `usePromptManager` was doing too much (CRUD + filtering + clipboard) and should be split. |
| Derived State     |       | This week: discussed `filteredPrompts`/counts as values computed during render rather than stored in state. |

## Coding Challenges

| Date | Problem        | Status    |
|------|----------------|-----------|
|   Sat Wk 1   |    groupBy/countBy/sortBy            | Completed |

## Topics to Revisit

- Error-handling and form-validation strategy — currently ad hoc (one try/catch added reactively during review); needs a deliberate pass once the shape is clearer.
- Delete confirmation / undo pattern — deferred pending design thinking on where this goes.
- Prompt CRUD is missing "update" — add/delete/favorite exist, editing an existing prompt doesn't yet.
- Button/UI-primitive consistency — deliberately deferred to the shadcn/ui migration (Week 2+) rather than building throwaway variants now.

## Weekly Reviews

| Week | Status   | Key Takeaway | Link                       |
|------|----------|--------------|----------------------------|
| 1    | Active   | Built filtering, favoriting, search, and a full visual identity through heavy iteration; strongest reasoning shown in TypeScript/state architecture, biggest gap is CRUD's missing "update" and zero test coverage. | notes/week-01-review.md    |