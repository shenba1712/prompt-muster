# PromptMuster — Design System / Style Guide

| | |
|---|---|
| **Status** | 📝 Draft v0.1 — companion to [prd.md](prd.md), [trd.md](trd.md), [ia.md](ia.md) |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-07-15 |
| **Last updated** | 2026-07-15 |
| **Companion artifact** | Live token/component showcase — see [§9](#9-companion-artifact) |
| **Relationship** | Implements the screens in [ia.md](ia.md) with concrete tokens. Assumes the shadcn/ui + Tailwind adoption already decided in [../core/backlog.md](core/backlog.md) #07. |

---

## 0. Scope & how this was built

This fixes the token layer (color, type, spacing, motion) and the component states the
[IA's](ia.md) screens actually need — not a full component library, and not wireframes
(a natural next artifact, not this one).

**Method, not vibes.** Categorical color choices below were run through a CVD-safety and
contrast validator rather than eyeballed — the commands and results are inlined in
[§2.1](#21-color) as evidence, not just asserted. Where the validator failed a candidate
palette, that failure and the resulting design decision are shown, not hidden — it's the
more honest record and it's why the provider-color system ends up simpler than a first
guess would produce.

---

## 1. Design principles — grounded in this subject, not generic

1. **Content is often code.** Prompts, diffs, JSON schemas, token counts — a meaningful
   share of what's on screen is monospace-native. Typography treats this as functional,
   not decorative (§2.2).
2. **Dense over spacious.** This is a tool used for hours at a stretch, not a marketing
   surface skimmed once — UI text runs smaller than "body copy" scale (14px base, not 16),
   matching the register of VS Code, Linear, GitHub's own dashboards.
3. **Borders and layered surfaces over shadows.** A dev tool's cards don't need to look like
   they're floating off the page. Shadows are reserved for genuinely transient/elevated
   surfaces (dropdowns, toasts, modals) — resting surfaces (cards, panels) are a border +
   a background-layer step (§2.5).
4. **Semantic color is not the accent, and the accent is not data color.** The brand/
   interactive accent (buttons, links, focus) and the categorical colors (provider
   identity) are different systems that happen to share a hue family in one deliberate
   place — see [§2.1](#21-color) for why that's safe here.
5. **Status color is fixed and never carries meaning alone.** Pass/fail/budget-warning
   colors are a small reserved scale, always paired with an icon + label — never a bare
   color dot (WCAG 1.4.1, and just good practice for a tool people use tired).
6. **Two type roles, chosen for the job, not "the safe default."** A native UI sans for
   chrome, a real coding monospace for content — not Inter-for-everything.

---

## 2. Foundations

### 2.1 Color

#### Semantic UI tokens (shadcn/ui CSS-variable convention)

Values are `H S% L%`. **The installed toolchain is Tailwind v4** (shadcn's current setup),
where `globals.css` consumes each variable directly through an `@theme inline` block
(`--color-background: var(--background)`) — so each value must be a complete color, wrapped
as `hsl(H S% L%)`, e.g. `--background: hsl(250 20% 99%);`. Do **not** paste the bare
triplets: the bare-`H S% L%` + `hsl(var(--token))` form is the older Tailwind v3 convention
and resolves to invalid colors under v4. The color values themselves are identical either way.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | `250 20% 99%` | `252 22% 6%` | Page background |
| `--foreground` | `252 15% 12%` | `250 15% 95%` | Default text |
| `--card` | `250 20% 99%` | `252 18% 9%` | Card / panel surface |
| `--card-foreground` | `252 15% 12%` | `250 15% 95%` | Text on card |
| `--popover` / `--popover-foreground` | same as card | same as card | Dropdowns, tooltips |
| `--primary` | `252 47% 41%` | `248 74% 75%` | Primary buttons, links, active states |
| `--primary-foreground` | `0 0% 100%` | `252 30% 12%` | Text/icons on primary |
| `--secondary` / `--muted` / `--accent` | `250 15% 95%` | `252 12% 15%` | Secondary buttons, subtle fills |
| `--muted-foreground` | `252 8% 45%` | `252 8% 62%` | Placeholder, disabled, captions |
| `--destructive` | `0 58% 52%` | *same* `0 58% 52%` | Destructive actions, eval fail, errors |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` | Text on destructive |
| `--border` / `--input` | `250 15% 89%` | `252 12% 18%` | Hairlines, input borders |
| `--ring` | `252 47% 41%` | `248 74% 75%` | Focus ring (= `--primary`) |
| `--radius` | `0.375rem` | *(not themed)* | Base corner radius |

**Toolchain notes (Tailwind v4 shadcn):** `--destructive-foreground` is **not consumed** by
the current shadcn primitives (the destructive variant uses `text-white`) — omit it unless a
component references it. `--secondary-foreground` and `--accent-foreground` aren't listed
above (subtle fills carry default text); set both to the `--foreground` value for their mode.

**Two extra semantic tokens, not in stock shadcn** — needed because evals produce more than
binary pass/fail:

| Token | Value (fixed, both modes) | Used for |
|---|---|---|
| `--success` | `112 89% 33%` (`#0ca30c`) | Eval pass, saved/confirmed states |
| `--warning` | `40 97% 56%` (`#fab219`) | Approaching cost budget, non-fatal notice |
| `--serious` | `15 78% 67%` (`#ec835a`) | Flaky/uncertain eval result — needs review |

`--success`/`--warning`/`--serious`/`--destructive` are a **fixed 4-step status scale**,
identical in light and dark mode by design — status meaning must not shift with theme.
`--warning` and `--serious` sit below 3:1 contrast on a light surface by design; per
[§4](#4-accessibility-requirements), they are **never used as text color alone** — always
an icon + label, per the same rule that governs categorical color below.

**Why base radius is `0.375rem` (6px), not shadcn's stock `0.5rem`:** a deliberately
tighter corner than the generic-SaaS "rounded-lg-everywhere" default — reads closer to an
editor/terminal than a consumer app. Derived scale: `sm = 0.25rem`, `md = 0.375rem` (base),
`lg = 0.625rem`, `full = 9999px` (pills/avatars only).

#### Provider-identity color — validated, not guessed

The Comparison screen ([ia.md §4.3](ia.md)) and model badges need to distinguish
**OpenAI / Anthropic / Google** at a glance. Rather than pick three "nice" hues, I validated
candidates against the CVD-safety + contrast checker (`dataviz` skill's
`validate_palette.js`, Machado-2009 simulation, checked pairwise since a user can select
*any subset* to compare — not always all three in a fixed order).

**First attempt failed** — blue + violet + aqua/magenta looked fine in light mode but broke
in dark mode:

```
$ node validate_palette.js "#3987e5,#9085e9,#199e70,#d55181" --mode dark --surface "#0b0b12" --pairs all
[FAIL] CVD separation   worst all-pairs #9085e9↔#3987e5 ΔE 2.5 (protan)
```

Mapping every pair among the four "status-safe" hues (blue/aqua/violet/magenta — excluding
green/yellow/orange/red, which are the status scale's hue family and would let a provider
badge impersonate a pass/fail state) showed two **irreconcilable conflicts** in dark mode:
blue↔violet (ΔE 2.5) and aqua↔magenta (ΔE 4.7). With exactly two disjoint bad pairs among
four hues, **every possible 3-hue subset contains one of them** — there is no clean triple
to be found by trying harder.

**Resolution:** two hues, not three, plus a neutral for everything else.

```
$ node validate_palette.js "#3987e5,#d55181" --mode dark --surface "#0b0b12"
[PASS] CVD separation   worst adjacent ΔE 40.5+   → ALL CHECKS PASS
```

| Provider | Light | Dark | Treatment |
|---|---|---|---|
| **OpenAI** | `208 65% 51%` (`#2a78d6`) | `213 74% 60%` (`#3987e5`) | Filled badge |
| **Anthropic** | `340 68% 76%` (`#e87ba4`) | `340 54% 62%` (`#d55181`) | Filled badge |
| **Google & everything else** (local, self-hosted, future providers) | `--muted-foreground` on `--border` | same | **Outlined, no fill** — a genuinely different encoding channel, not a third competing hue |

This isn't a compromise — it **scales better**: a filled-hue system runs out of safely
distinguishable colors fast (this exercise just proved 3 was already the ceiling); an
outlined "everything else" bucket absorbs a 4th, 5th, 10th provider with zero new color
decisions. It also happens to freed up **violet** with no collision, which is why the UI's
primary/brand accent (`--primary` above) can be that same validated violet step
(`#4a3aa7` / `#9085e9`) reused as a *different job* — brand accent, not series identity —
which the method explicitly treats as a separate concern.

Providers are **always labeled by name as text** — the badge color is a supporting scan aid,
never the sole identifier (mandatory regardless of CVD status, per WCAG 1.4.1).

#### Category color — deliberately *not* color-coded

PromptMuster has **11 fixed prompt categories** (code-generation, debugging, code-review,
documentation, refactoring, testing, architecture, data-modeling, devops, learning,
communication — [key-decisions.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/key-desicions.md)). The categorical method
caps at **8 safely distinguishable hues**; a 9th+ "folds into Other" rather than getting a
generated color. With 11 fixed categories already over that ceiling on day one, hue-per-
category was never viable — so **category badges are neutral, text-only** (`--secondary`
background, `--secondary-foreground` text), same treatment for all 11. This is the
method's own answer, not a shortcut around it.

---

### 2.2 Typography

Two roles, chosen for what this product actually displays — not a third "display" face,
which would be over-designing a reference tool.

| Role | Stack | Why |
|---|---|---|
| **UI** | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | Native per OS — reads as a tool installed on your machine, not a webapp; avoids the generic-default "Inter for everything" |
| **Content / code** | `"JetBrains Mono", "Cascadia Code", "SF Mono", Consolas, "Roboto Mono", Menlo, monospace` | Prompt bodies, diffs, JSON schemas, and template variables (`{{var}}`) are literally monospace content — whitespace and alignment are load-bearing, not stylistic |

`prompts.write` will be the *most-read* text in the product, so the mono stack leads with
real coding fonts (JetBrains Mono ships with JetBrains IDEs; Cascadia Code ships with
Windows Terminal) rather than falling straight to generic `monospace`.

**Type scale** (Tailwind-numbered for direct implementation):

| Step | Size / line-height | Role |
|---|---|---|
| `xs` | 12px / 16px | Micro-labels, badges, timestamps |
| `sm` | 13px / 20px | Secondary text, form labels, table cells |
| `base` | 14px / 22px | Default UI text — deliberately smaller than marketing "body" scale |
| `md` | 16px / 24px | Emphasized body, card titles |
| `lg` | 18px / 28px | Section headers |
| `xl` | 22px / 30px | Page titles |
| `2xl` | 28px / 36px | Dashboard hero numbers only (Cost screen) — used sparingly |

Prompt/code content uses the same size steps but **1.6 line-height** (vs. 1.4–1.5 for UI
text) — prompts are read carefully, closer to how an editor sets code than how a UI sets
labels. Anywhere digits stack in a column (token counts, cost figures, contrast ratios,
version lists) — `font-variant-numeric: tabular-nums`.

---

### 2.3 Spacing scale

4px base, identical to Tailwind's default numeric scale — no translation layer needed
between this doc and `className="gap-4"`:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80` (px)

Per [core/CLAUDE.md](../CLAUDE.md)'s existing convention and the artifact-design
guidance: layout spacing comes from flex/grid `gap`, not per-element margin — margins
collapse and double silently in ways `gap` doesn't.

### 2.4 Radius

Derived from `--radius` (`0.375rem`): `sm = 0.25rem` · `md = 0.375rem` · `lg = 0.625rem` ·
`full = 9999px` (pills/avatars only — not a default for cards or buttons).

### 2.5 Elevation

Two shadow levels, reserved for genuinely transient surfaces — not applied to resting cards
(principle 3, [§1](#1-design-principles--grounded-in-this-subject-not-generic)):

| Token | Value | Used for |
|---|---|---|
| `--shadow-sm` | `0 1px 2px hsl(252 15% 12% / 0.06)` | Dropdowns, popovers |
| `--shadow-md` | `0 4px 16px hsl(252 15% 12% / 0.12)` | Modals, dialogs |

Resting cards/panels: `--border` (1px) + `--card` background only, no shadow.

### 2.6 Motion

| Token | Value |
|---|---|
| `--duration-fast` | 120ms — hover, focus ring |
| `--duration-base` | 180ms — tab switches, accordions |
| `--duration-slow` | 240ms — dialog/modal open |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` — snappy start, decelerate to rest; not a springy/bouncy curve, which reads as "playful app" rather than dev tool |

`@media (prefers-reduced-motion: reduce)`: all durations collapse to ≤1ms; no transform-
based transitions, opacity-only where a state change must be perceptible at all.

---

## 3. Components

Scoped to what [ia.md](ia.md)'s screens actually need — not a full library.

| Component | Variants | States | Notes |
|---|---|---|---|
| **Button** | primary, secondary, destructive, ghost, link | default, hover, focus-visible, active, disabled | Primary = `--primary` fill; destructive reserved for genuinely destructive actions (delete prompt, discard changes) |
| **Input / Textarea** | text, multiline (prompt editor) | default, focus, error, disabled | Error state = `--destructive` border + inline message below, never color-only |
| **Select** | single-select (model picker, category) | default, open, disabled | Model picker groups by provider using the [§2.1](#21-color) badge treatment |
| **Badge — category** | 11 fixed categories | static | Neutral/text-only — see [§2.1](#21-color) |
| **Badge — provider** | OpenAI, Anthropic, Other | static | Filled (OpenAI/Anthropic) or outlined (Other) — see [§2.1](#21-color) |
| **Badge — status** | pass, fail, warning, review | static | Icon + label + `--success`/`--destructive`/`--warning`/`--serious` — never color alone |
| **Card** (PromptCard) | default, favorited | default, hover, focus-visible | Border + `--card` background, no shadow (principle 3) |
| **Tabs** (Prompt Detail sub-nav) | — | default, active, hover, focus-visible | Active tab underline = `--primary`, not a filled pill |
| **Alert / Toast** | info, success, warning, destructive | enter, visible, exit | Exit respects `--duration-base`; reduced-motion → fade only |
| **Table row** (Eval Run results) | pass, fail | default, hover | Row-level status stripe (functional, not decorative — see artifact-design's "severity stripe" guidance) + icon, matching Badge — status |
| **Stat tile** (Cost/token figures) | default, over-budget | — | Large figure in tabular-nums; over-budget uses `--warning` background wash, not text-color-only |
| **Code / prompt block** | read-only, editable | default, focus (editable) | Mono content stack; `{{variable}}` tokens rendered in `--primary` to visually separate template slots from literal text |
| **Diff line** (History → Diff) | added, removed, unchanged | — | Added = `--success` background wash + left border; removed = `--destructive` equivalent — a git-diff-familiar pattern, functional not decorative |
| **Streaming output** (added v0.2) | — | generating, complete | Blinking block cursor + pulsing "Generating…" label — a distinct state, not a generic spinner; folded back from [ux-flows.md](ux-flows.md) Flow 2 |
| **Table row — pending** (added v0.2) | — | pending, resolved | Neutral "…" badge until that row's result lands; eval rows reveal progressively rather than as one delayed batch ([ux-flows.md](ux-flows.md) Flow 4) |

---

## 4. Accessibility requirements

- **Contrast:** body text ≥ 4.5:1, large text/UI components ≥ 3:1 (WCAG AA). `--warning`/
  `--serious` fall short on a light surface by design — mandatory pairing with icon + label
  is the mitigation, never optional.
- **Never color alone:** status, provider, and category all carry a text label; color is a
  scan aid, not the identifier (WCAG 1.4.1) — this is the same rule that shaped the
  category and provider decisions in [§2.1](#21-color), not a separate afterthought.
- **Focus visibility:** every interactive element gets a visible `:focus-visible` ring
  (`--ring`, 2px, offset 2px) — never `outline: none` without a replacement.
- **Touch targets:** minimum 44×44px hit area for icon-only controls (e.g.
  `FavoriteButton` per [core/CLAUDE.md](../CLAUDE.md)), even where the visible icon is
  smaller.
- **Icon-only controls need an accessible name** — `aria-label` on `FavoriteButton` and any
  icon-only button; never rely on a tooltip alone.
- **Reduced motion:** honored per [§2.6](#26-motion).
- **Keyboard:** every flow in [ia.md §4](ia.md) must be completable without a mouse — tabs,
  model multi-select, and the Diff view's two-version picker included.

---

## 5. Dark mode strategy

Token-level, matching the artifact-design pattern used for the companion showcase
([§9](#9-companion-artifact)): define tokens once on `:root`, redefine only the *values*
(never component CSS directly) under `@media (prefers-color-scheme: dark)`, then redefine
again under explicit `[data-theme="dark"]` / `[data-theme="light"]` so an in-app theme
toggle can override the OS preference in either direction. Status tokens
(`--success`/`--warning`/`--serious`/`--destructive`) are the one exception — fixed across
both modes, per [§2.1](#21-color).

---

## 6. Implementation mapping

Paste the §2.1 values into `globals.css`, each `hsl()`-wrapped for the Tailwind v4
`@theme inline` consumer (see §2.1). Landed in the Week 2 shadcn migration (backlog #07):

```css
:root {
  --background: hsl(250 20% 99%);
  --foreground: hsl(252 15% 12%);
  /* …the 18 §2.1 tokens, hsl()-wrapped, in shadcn's generated order.
     secondary-foreground / accent-foreground = the --foreground value;
     --destructive-foreground omitted (unused in v4). */
  --radius: 0.375rem;
}
.dark {
  --background: hsl(252 22% 6%);
  --foreground: hsl(250 15% 95%);
  /* … */
}
```

> **Resolved (Week 2 shadcn migration):** [core/CLAUDE.md](../CLAUDE.md) previously
> banned Tailwind; its CSS Conventions section now carries the coexistence rule — new
> `src/components/ui/` components use Tailwind, existing components keep their CSS Modules
> until each is individually migrated.

Tailwind theme extension for the type/spacing scale in [§2.2](#22-typography)/
[§2.3](#23-spacing-scale) is a direct `fontSize`/`spacing` map in `tailwind.config` — no
separate design-token build step needed at this project's scale.

---

## 7. Open design questions

1. **Stat-tile "over-budget" threshold** — at what % of the configured cost cap does a Cost
   tile switch from neutral to `--warning`? Not yet decided; a product/UX call, not a token
   one.
2. **Diff-view granularity** — line-level (shown above) vs. word-level diffing for prompt
   text. Line-level is simpler and matches git's own default; word-level reads better for
   prose-heavy prompt edits. Left open for whoever builds History/Diff ([ia.md §1](ia.md)).
3. **A 4th+ provider gets its own filled hue eventually?** Current design deliberately says
   no ([§2.1](#21-color)) — revisit only if a specific provider becomes a first-class,
   frequently-compared citizen (unlikely before Phase 2–3).

---

## 8. Companion artifact

A live, interactive rendering of this token system — real color swatches with computed
contrast, a type specimen, the spacing/radius scale, and working component states
(hover/focus-visible are real CSS, not mockup screenshots) — is published separately;
see the message accompanying this document for the link. It's a *showcase* of these tokens,
not a second source of truth — if the two ever disagree, this document wins.

---

## Changelog
- **v0.3 (2026-07-23)** — §2.1/§6 corrected for the installed **Tailwind v4** toolchain:
  token values must be `hsl()`-wrapped (v4's `@theme inline` consumes the var directly; the
  bare `hsl(var(--token))` form was v3). Noted `--destructive-foreground` is unused in v4,
  and the `--secondary-foreground`/`--accent-foreground` gap-fill from `--foreground`. §6
  CLAUDE.md contradiction marked resolved (coexistence rule landed).
- **v0.2 (2026-07-15)** — Reconciliation pass: two component patterns surfaced by
  ux-flows.md (streaming output state; pending table row) folded into §3, closing that
  doc's feedback items.
- **v0.1 (2026-07-15)** — Initial design system. Full shadcn-compatible token set (color,
  type, spacing, radius, elevation, motion); provider-identity color derived from an actual
  validator run (documented failure → simplified, more scalable 2-hue-plus-neutral
  resolution); category color deliberately non-hue-coded (11 categories exceed the
  method's 8-hue ceiling); component state table scoped to IA's screens; accessibility
  requirements; dark-mode strategy; shadcn/Tailwind implementation mapping with the
  CLAUDE.md contradiction flagged (not yet resolved — resolves itself at Week 2 shadcn
  adoption).
