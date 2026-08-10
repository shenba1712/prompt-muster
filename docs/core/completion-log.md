# Completion Log

Per [backlog.md](backlog.md) RULES #7: "Each completed feature gets a commit,
a note about what was learned, and an update to completion-log.md." Referenced
by `CLAUDE.md`, `design-system.md`, `ia.md`, `dashboard.md`, and `tickets.md`
since Week 2, but never actually created until now — this file existed only
as a dangling pointer for several weeks (see `dashboard.md`'s own Week 2
deliverables table, row 9, which tracked its own creation as "still pending").
Reconstructed from `notes/week-02-review.md`, `dashboard.md`, `backlog.md`,
and `tickets.md`'s already-written rationale, plus this session's own work —
not invented after the fact.

Newest entries first.

---

## 2026-08-09/10 — Keyboard-nav fixes (07.7, partial) + toast/motion policy (07.8, complete)

**07.8 — done.** Audited every current interaction (save, delete, favorite
toggle, filter change) against design-system.md §3.1's toast/inline/silence
policy: favorite-toggle, delete, and filter-change were already correctly
silent; save doesn't get the toast §3.1 names because that toast's real copy
("committed as v1") is tied to file-write/auto-commit, which doesn't exist
yet (Week 5) — adding a stand-in toast now would have overstated what the
app actually does, so it stayed silent-via-navigation instead. Then wired
§2.6's motion tokens (`--duration-fast/base/slow`, `--ease-standard`), which
existed only as prose before this, into real CSS variables in `globals.css`,
the `AlertDialog`'s open/close transition, and `ThemeToggle`'s icon swap
(via Tailwind's `@starting-style`-backed `starting:` variant) — plus a
global `prefers-reduced-motion: reduce` block, since none existed anywhere
in the app before.

**07.7 — partial, not closed.** Not the full ia.md §4 flow-by-flow audit the
ticket scopes. What actually got found and fixed, via a full-app multi-agent
audit: the `AlertDialog`'s Base UI focus trap doesn't reliably redirect Tab
back into the popup at the boundary (confirmed via both a live browser check
and an isolated RTL test in jsdom, not assumed) — fixed with a manual
Tab-wrap handler layered on top of Base UI's own mechanism. The Prompt
Detail page's "Back to prompts" link had no focus-visible ring at all, unlike
every other link in the app — fixed. A follow-up full-app audit also found
`DeleteConfirmDialog` defaulted keyboard focus to the destructive Delete
button instead of Cancel (fixed — Cancel now gets `initialFocus`), and
`PromptCard`'s stretched-link click target had no focus ring at all despite
being the app's primary navigation surface (fixed, via a `focus-visible:ring`
on the link's `::after` pseudo-element so the ring wraps the actual clickable
card area, not just the title text). The remaining gap: no one has yet
walked every ia.md §4 flow end-to-end with only a keyboard, which is what the
ticket actually asks for.

## 2026-08-09 — 06.4 landed, #06 closed; core/ package scaffold (08.2)

`PromptFilters`' four dimensions (model, category, search, favorites) moved
from page-level `useState` to URL state via a dedicated `useFilterParams`
hook (`useSearchParams` + `router.replace`, not `push` — a filter change
isn't a new place in history; an absent param means "no filter," not a
stored empty string). `/settings` shipped as a real stub styled to match the
app's `Card` pattern. `Header` picked up a clickable PromptMuster logo →
`/prompts` and got hoisted from `prompts/layout.tsx` to the root layout so
every top-level route shares the same shell. Manually verified: a filtered
URL is shareable (copy, paste in a new tab, same filter applies), and the
back button exits a filtered view in one step rather than one filter at a
time — confirmed as the deliberate `replace` design working as intended, not
a bug, after being asked to verify it "un-filters one step at a time."

Separately, ticket 08.2 (core package scaffold, ADR-001) landed the same
week: a framework-free `core/` directory at the repo root
(`core/prompt-file.ts`, `core/parse-error.ts`) holding the `PromptFile`/
`PromptMessage`/typed `ParseError` shapes from the 08.1 dotprompt spike,
with the framework-free boundary enforced by an `eslint.config.mjs`
`no-restricted-imports` rule scoped to `core/**/*.ts` (verified to actually
fire, not just assumed to work, via a throwaway violation file).

## 2026-08-08 — Dashboard/tracking-doc sync

`dashboard.md` and `backlog.md`/`tickets.md` had drifted stale relative to
actual progress (07.4 delete-confirm and 07.6's design-system pass were both
already shipped but still showing as open in `dashboard.md`'s Progress
table). Corrected as a documentation-sync pass, no code changes.

## 2026-08-04 — Design-review + broader audit; 07.6 landed same day

A design-review session found the Week 2 shadcn/ui migration (07.1-07.3) had
only covered primitives (Button/Input/Select/Textarea/Badge/Card), not
layout chrome: the gradient `Header` and default-anchor-styled prompt titles
predated `design-system.md` and were never migrated, the favorite indicator
was still a raw unicode star, and the dev-only "Load Sample Data" affordance
was sitting in production layout with no environment gate. Ticket 07.6
closed all four the same day: gradient removed, titles styled via
`CardTitle`, star replaced with a phosphor icon, sample-data button gated to
`NODE_ENV !== 'production'`. `backlog.md` reopened `#07` to `[~]` for the
gap, then closed it back to `[x]` once 07.6 landed — 07.7 (keyboard-nav
audit) and 07.8 (toast/motion policy) were split out as separate follow-on
tickets from the same audit, neither gating `#07` itself.

A second, broader audit the same day (security/architecture/testing/
requirements/ops/business/sequencing) added roughly 35 SP of tickets across
Phase 1-3 — see `tickets.md`'s own addendum note for the full breakdown; not
duplicated here since it's the ticket board's job to carry the resulting
tickets, not re-narrate the audit.

## Week 3 (2026-08-03 to 2026-08-05) — Routing + dark mode

Shipped App Router structure (`/prompts` list, `/prompts/[id]` detail +
`not-found.tsx`, `/prompts/new` + `/prompts/[id]/edit` editor routes sharing
`PromptForm`) and lifted state out of page components into a `PromptProvider`
React Context so it survives client-side navigation.

**Dark-mode toggle shipped better than spec'd.** The original plan (per
Week 2's token-only groundwork) was a `localStorage`-backed toggle with an
inline `<script>` to avoid a hydration flash. Instead: a three-way toggle
(`light`/`dark`/`system`) backed by a **server-read cookie** — `cookies()` in
`layout.tsx` reads it and stamps `data-theme` on `<html>` before the client
ever runs, so there's no flash to prevent in the first place, and no inline
script needed at all. `system` is deliberately never given a stored value —
it's the *absence* of both the cookie and the attribute, which is what lets
`globals.css`'s `@media (prefers-color-scheme: dark)` layer keep resolving
the OS preference live, on every paint, even after the toggle has been used
once. See `CLAUDE.md`'s Current State section for the load-bearing CSS
details (source-order dependency between the `[data-theme]` blocks and the
media query, the `@custom-variant dark` mirroring requirement, and the
`notFound()` boundary's `generateViewport()` special case) — verified against
a production build, since `next dev` injects CSS via JS and gives the wrong
answer for this specific check.

Test suite grew to 77 tests, still green.

## Week 2 (2026-07-20 to 2026-07-26) — CRUD completion, Vitest, shadcn/ui

Closed Week 1's known gap: `updatePrompt` added, with edit UI wired into
`PromptForm`/`PromptCard`. Two more Week 1 gaps closed: empty title/content
now shows a visible error instead of silently no-oping, and `PromptForm`'s
model select initializes to a real union value instead of an empty string.

Vitest + React Testing Library installed; `filterPrompts` extracted from the
hook into its own utils file; 69 tests landed **before** the shadcn/ui
migration touched anything, so the migration had a safety net.

shadcn/ui installed and driving every interactive control app-wide, well
beyond the original two-file scope (`PromptForm`/`PromptFilters` only) —
extended to `PromptCard`, `Header`, `EmptyState`, `FavoriteButton`, and the
last raw `<button>` in `page.tsx`. Two custom primitives (`Badge`, `Card`)
built to match `design-system.md`'s documented treatment.

**Key decisions, condensed** (full detail in `notes/week-02-review.md`):
provider badges use a soft-tint treatment, not a literal opaque fill —
`design-system.md`'s validated hex values fail WCAG contrast as literal
fills in 2 of 4 color/mode combinations, checked by hand rather than
eyeballed; `Card` uses `rounded-none`, not the documented `--radius`, to
stay visually consistent with every other already-square-cornered primitive;
`FavoriteButton`'s 44×44 touch target was fixed with a component-scoped
`className`, not by resizing `button.tsx`'s shared `icon` size variants,
since those are used elsewhere and a global resize would have been out of
scope for a single-control accessibility fix.

**Bugs found**, all traced to the same root cause (unlayered legacy CSS
always winning over `@layer utilities` regardless of specificity, per the
CSS Cascade Layers spec): shadcn `Button`'s hover text turned invisible
against a light background; `page.module.css`'s leftover `.page` class
shadowed shadcn's own `--foreground`/`--background` token names app-wide;
`Badge` rendered with zero padding. All three fixed by moving the legacy
resets into `@layer base`. Separately: two of four provider-badge
foreground/background combinations would have failed WCAG contrast as
literal opaque fills, caught by computing the ratios by hand rather than
eyeballing the colors — resolved by the soft-tint decision above.

**Process lesson worth repeating:** a written design spec is only as good as
someone actually checking the code against it — `PromptCard`'s badges had
silently contradicted `design-system.md`'s documented rules for two weeks
before anyone noticed, because nothing forced a side-by-side comparison
until the shadcn migration pass.
