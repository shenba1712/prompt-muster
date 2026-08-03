# Week 2 Review

## What got built

- `updatePrompt` added to `usePromptManager`, with edit UI wired into
  `PromptForm`/`PromptCard` — closes Week 1's known gap ("CRUD" was
  create/read/delete only).
- Two more Week 1 gaps closed: submitting an empty title/content now shows
  a visible error instead of silently no-oping, and `PromptForm`'s model
  select initializes to a real union value instead of an empty string.
- Vitest installed; `filterPrompts` extracted from the hook into
  `src/utils/filterPrompts.ts`; 69 tests across `utils/prompt.ts`,
  `utils/filterPrompts.ts`, and `usePromptManager.ts` — first test coverage
  the project has ever had, landed _before_ the UI migration touched
  anything.
- shadcn/ui installed and driving every interactive control app-wide:
  `PromptForm`, `PromptFilters`, `PromptCard`, `Header`, `EmptyState`,
  `FavoriteButton`, and the last raw `<button>` in `page.tsx` — well
  beyond the original scope (PromptForm/PromptFilters only). Two custom
  primitives (`Badge`, `Card`) built to match `design-system.md`'s
  documented badge/card treatment: provider-color badges (OpenAI/Anthropic
  filled, everything else outlined), neutral category badges, no-shadow
  cards.
- `.prettierrc` committed, full codebase reformatted.
- The full spec-doc suite added (`prd.md`, `trd.md`, `design-system.md`,
  `ia.md`, `ux-flows.md`, ADRs) — the project's mission, target users, and
  architectural direction formalized for the first time, superseding the
  original ad-hoc feature list.

**Known gap:** delete confirmation is still missing — there's no
confirm/undo step before an irreversible delete, carried forward
unresolved for two weeks running now.

## Key decisions and why

- **Provider badges use a soft-tint treatment (`bg-{color}/12 text-{color}`),
  not a literal opaque "filled badge"** — design-system.md's own wording
  says "filled," but running its validated hex values through the WCAG
  contrast formula by hand showed 2 of 4 color/mode combinations would fail
  as literal fills (e.g. white text on light-mode Anthropic pink is
  ~2.7:1). A soft tint sidesteps the contrast calculation entirely instead
  of hand-tuning four separate foreground colors.
- **`Card` uses `rounded-none`, not design-system.md's literal `--radius`
  (0.375rem)** — every existing shadcn primitive (`Button`, `Input`,
  `Select`) already committed to a square-cornered look; softening just
  the Card would look inconsistent next to everything already on screen.
- **`FavoriteButton`'s 44×44 touch target was fixed with a `className`
  scoped to that one component**, not by resizing `button.tsx`'s shared
  `icon` size variants — those variants are used elsewhere and resizing
  them globally would have been out of scope for an accessibility fix
  targeting one control.
- **`cursor-pointer` and `resize-y` were added explicitly to `Button`'s and
  `Textarea`'s own Tailwind classes _before_ deleting the legacy CSS
  reset** — neither shadcn primitive set those properties itself, so they
  were silently inherited from the very rule being deleted. "Nothing looks
  different yet" isn't proof a rule is dead, only that its effect is
  currently masked by something else.
- **`EmptyState` was evaluated and deliberately left alone** — no
  documented spec violation, no raw controls needing migration. Redesigning
  it (icon, CTA button) would have been polish, not a fix, so it wasn't
  built. Same discipline as Week 1's "no bespoke button-variant system...
  isn't worth the design commitment yet."
- **Header's "Add Prompt" button migrated to `variant="secondary"` with a
  `className` override, not `variant="default"`** — `default` is built on
  `--primary` (violet), which would clash with the header's own
  green→blue brand gradient. The override preserves the existing
  white-pill/brand-green look instead of silently changing the brand
  identity as a side effect of the shadcn migration.

## Bugs found (via cascading CSS + component audits)

1. `globals.css`'s legacy `button`/`input` reset was **unlayered** CSS,
   which — per the CSS Cascade Layers spec — always wins over anything in
   `@layer utilities` regardless of selector specificity. It was silently
   overriding shadcn `Button`'s hover text color, turning it white
   (invisible) on a light background. Fixed by wrapping the legacy rules
   in `@layer base`.
2. A second, unrelated collision, same root cause: `page.module.css`'s
   `.page` class — leftover from the pre-shadcn Next.js scaffold —
   redefined `--foreground`/`--background` for its own purposes, which
   shadowed shadcn's own token names for every component nested inside it.
   This is what caused "hover makes button text white," and it was
   app-wide, not specific to one button.
3. Once the first two layering bugs were fixed, `Badge` components still
   rendered with zero padding — traced to the _same class_ of bug: the
   top-level `* { margin: 0; padding: 0; }` reset hadn't been moved into
   `@layer base` yet either.
4. base-ui's `Select.Value` renders the raw selected value with no
   built-in label mapping — `PromptFilters`' "All models"/"All categories"
   literally showed the string `all` until a render-function child was
   added to map it to a label.
5. Two of four provider-badge foreground/background combinations would
   have failed WCAG contrast as literal opaque fills — caught by computing
   the contrast ratios by hand rather than eyeballing the colors, resolved
   by the soft-tint decision above.

## Open questions / deliberately deferred

- Delete confirmation / undo pattern — still deferred pending design
  thinking on where this goes. Two weeks running now.
- `usePromptManager` still owns CRUD, filtering, and clipboard state in one
  hook — deliberately not split yet (single consumer), same reasoning as
  Week 1.
- `seedPrompts` test-data generator still lives inside the production
  hook, self-flagged as temporary, not yet relocated.
- Error-handling strategy beyond form validation and clipboard-copy
  failures is still ad hoc.
- Dark-mode _tokens_ are now correct (`.dark` class values in `globals.css`
  match design-system.md §2.1), but there's still no in-app toggle or
  `prefers-color-scheme` wiring that actually activates `.dark` — the
  values are ready, the activation mechanism isn't built.
- Coding-challenge deliverables (Two Sum, LeetCode 3) live in a separate
  repo and weren't verifiable from this session — worth confirming they're
  actually committed there.
- No `notes/week-02-*.md` daily notes were found for any day this week in
  this repo — only this closing review exists.
- Next.js routing (#06) is not started — but this was deliberately deferred
  to Week 3 per the Week 2 plan, not a slip.
- Tracking docs (`backlog.md` #07, `dashboard.md`, root `CLAUDE.md`'s
  Current State, `completion-log.md`) had all drifted stale relative to
  actual progress by the end of the week — synced as part of this review
  rather than during the week itself.

## Process notes worth remembering

- Automated browser-tool coordinate spaces (CSS pixels from
  `getBoundingClientRect()`, screenshot-pixel space, and
  `devicePixelRatio`) are not interchangeable. Conflating them produced
  several false "the click didn't register" readings before the actual
  bug (hover text turning invisible) was reproduced reliably — by forcing
  and inspecting real `:hover` computed state, not by trial-and-error
  clicking.
- A written design spec is only as good as someone checking the code
  against it. `PromptCard`'s model/category badges had been hardcoded to a
  6-color-per-model, 11-color-per-category rainbow for two weeks before
  anyone noticed it directly contradicted `design-system.md`'s own
  documented rules — nothing forced a side-by-side comparison until this
  week's redesign pass.
- Migrating to a component library surfaces every place the app was
  silently relying on the thing being deleted. Verify what a legacy rule
  actually still does (cursor, resize, focus outline) before removing it,
  not after — "looks the same" during a quick glance isn't the same as
  "provably has no effect."
- Assessed-and-declined is a valid outcome, not a cop-out: `EmptyState`
  and a proposed "Add Prompt" CTA inside it were both explicitly
  considered and left alone once no real defect or spec violation turned
  up, rather than redesigning something just because a redesign pass was
  underway.

## Week 3 Priorities

1. **Next.js routing (#06)** — separate pages for prompt list, detail,
   editor, and settings. The one item explicitly deferred from Week 2.
2. **Decide on delete-confirmation UX** — carried forward for two weeks
   now; worth an actual decision rather than a third deferral.
3. **Dark-mode activation** — tokens are theme-correct as of this week;
   wire an actual toggle or `prefers-color-scheme` media query per
   design-system.md §5's documented strategy.
4. **Confirm coding-challenge deliverables** landed in the separate
   `coding-challenges` repo.
5. **Resume daily `notes/week-03-*.md` entries** — Week 2's were skipped;
   this review had to be reconstructed from git history and doc
   cross-referencing instead.
