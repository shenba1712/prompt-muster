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

## 2026-08-10 — Reversed the previous entry's `config` decision, plus 3 more gotchas found the same way

Asked "do we know some common keywords to add to the allowlist" for the
previous entry's reject-unrecognized-`config`-keys behavior. Before
answering, checked dotprompt's real type first (the session's established
rule: verify against source, don't answer from memory) — and found the
allowlist-and-reject design itself was wrong, not just incomplete.
dotprompt's own `ModelConfig` type is `Record<string, any>`, documented
"not all models support all options" — deliberately open, not a fixed
field set. Rejecting anything outside 5 named fields would make this
parser reject valid provider-specific config (`frequency_penalty`, `seed`,
anthropic-specific fields, etc.) that dotprompt itself allows, directly
against ADR-005's tool-interoperability goal. Told the user directly
rather than quietly fixing it, since it meant undoing a decision from the
immediately-preceding entry; user confirmed, then asked for a broader
sweep for the same class of mistake.

That sweep found 3 more real gaps, all from the same root cause — modeling
what seemed reasonable instead of checking dotprompt's actual
`PromptMetadata` type:

- `input.default` (default values for template variables) and
  `output.format` (`'json' | 'text'`, independent of `output.schema`) were
  both real dotprompt fields this parser didn't model at all — either
  would have been silently dropped if present. `PromptFile.input` /
  `.output` are now `{ schema?, default? }` / `{ format?, schema? }`
  matching dotprompt's real shape, parsed by two new functions
  (`parseInput`/`parseOutput`, replacing the old single
  `parseSchemaField`) instead of one.
- Several dotprompt-reserved top-level keys aren't modeled at all yet and
  weren't going to be (`tools`, `toolDefs`, `variant`, `version`,
  `metadata`) — function-calling and prompt-variant concerns for a later,
  execution-focused ticket. dotprompt's own answer for "the typed shape
  doesn't cover everything, and it can't predict what a consuming
  implementation needs" is a `raw?: Record<string, any>` passthrough
  field holding the untouched frontmatter object. Added the same field
  here as `raw` (always populated, unlike dotprompt's optional version),
  set from the already-parsed `matter()` frontmatter object.
- Checked whether `PromptFile.name`/`.model` being required (dotprompt's
  real type has both `?: string`) was an oversight or a real decision —
  it's the latter (a prompt-library UI needs both to list/run prompts
  meaningfully) but hadn't been written down as a deliberate divergence
  anywhere. Documented inline in `core/prompt-file.ts` so it doesn't read
  as a future "fix" candidate.

`config`'s fix: removed `KNOWN_CONFIG_KEYS` and the rejection branch from
`parseConfig`; it still validates the type of the 5 known fields when
present, then returns the object as-is (`PromptFileConfig` gained a
`readonly [key: string]: unknown` index signature to make the passthrough
typed rather than an `as any` escape hatch). The rejected-key regression
test from the previous entry was replaced with two tests: unrecognized
keys survive parsing, and type-checking still applies to the keys this
parser does understand.

Also checked two more candidate gaps before writing code, both ruled out:
`Schema` (Picoschema's own type) is already `Record<string, any>` in
dotprompt's real types, so `PicoschemaDefinition` needed no change; and
`HasMetadata.metadata?` is automatically covered by the new `raw` field
with no separate handling needed.

`core/parse-prompt-file.test.ts` grew to 32 tests (2 replacing the old
rejection test, 2 new for `input.default`/`output.format`, 1 new
confirming `raw` preserves fields like `variant`/`tools` that nothing else
models, plus the existing systematic round-trip test strengthened with
`expect(file.raw).toEqual(rawFrontmatter)`). Full suite: 23 files, 209
tests; `tsc`, `typecheck:core`, lint all green.

## 2026-08-10 — `config` now rejects unrecognized keys instead of silently dropping them

Closed the gap the round-trip-readiness check (previous entry) surfaced
and flagged but didn't fix. `parseConfig` now checks every key present
against a fixed allowlist (`temperature`, `maxOutputTokens`, `topK`,
`topP`, `stopSequences` — the exact fields `PromptFileConfig` types) and
rejects with `INVALID_FRONTMATTER` naming the offending key if anything
else shows up, instead of silently discarding it.

Chose reject-with-error over the two alternatives (preserve unknown keys
as opaque passthrough data, or leave the allowlist-and-drop behavior as
is): it matches this parser's own already-established pattern of failing
loudly rather than guessing (malformed role markers, arrays where objects
are expected, and a missing `ext.promptmuster` block are all rejected the
same way, not silently absorbed or defaulted); it catches a more likely
real bug for free — a config-key typo like `temperatur` previously vanished
with zero signal, now it's a clear error naming exactly which key; and
growing `config`'s shape later is meant to be a deliberate, tracked change
to both the type and this allowlist together, the same relationship
`schemaVersion` already has to `parseExtensionV1`. Passthrough was
rejected because it would give a supposedly fully-typed `PromptFileConfig`
an untyped escape hatch that doesn't actually solve anything downstream —
real execution code still would only know how to use the five typed
fields either way.

Confirmed none of the 3 real example files are affected (each only uses
`temperature`) by re-running the round-trip-readiness tests specifically,
not just trusting the full suite. Added one new regression test. Full
suite: 23 files, 206 tests; `tsc`, `typecheck:core`, lint all green.

## 2026-08-10 — Round-trip readiness check for 08.3's parser (ahead of 08.4)

08.4 (the serializer, not built yet) needs `parse(serialize(parse(file)))`
to be a no-op. Didn't build that — there's no serializer to test against
yet — but checked the half that's actually 08.3's job: does the parser's
output still hold everything a future serializer would need, for each of
the 3 real worked examples? Two of the three (`debug-error.prompt.md`,
`generate-api-docs.prompt.md`) previously only had partial checks (a model
string, a message count) — exactly the kind of narrower test that stays
green even if something got silently dropped. Brought both up to the same
exhaustiveness `code-review.prompt.md`'s test already had: full
`ext.promptmuster` shape, exact message text, model provider prefix.

Also added a systematic check, not just hand-picked spot checks: for each
of the 3 files, parse the raw frontmatter independently (via `gray-matter`
directly) and confirm every top-level key actually written in the file
maps to a populated field on the resulting `PromptFile` — nothing
silently missing. All pass; nothing observably lossy today.

**One latent gap surfaced, flagged not fixed:** `parseConfig` only
recognizes `temperature`/`maxOutputTokens`/`topK`/`topP`/`stopSequences` —
any other key under `config:` is silently dropped, not preserved and not
an error. None of the 3 real files use any other config key today, so
this doesn't show up in the round-trip check above, but it's a real
"making 08.4's job impossible" risk for a future file that does use one.
Left as-is pending a decision on whether to preserve unrecognized config
keys, reject them, or leave the allowlist as documentation of what's
actually supported. `core/parse-prompt-file.test.ts` now has 29 tests;
full suite 23 files / 205 tests, all green (`tsc`, `typecheck:core`, lint
too). No production code changed — test-only pass.

## 2026-08-10 — Ambiguity #4 resolved: Picoschema does default to `additionalProperties: false`

The spike (08.1) left this open and flagged it as concretely mattering:
Anthropic's structured-outputs API requires `additionalProperties: false`,
so if Picoschema's compiler didn't default to it, a prompt targeting
Anthropic with an `output.schema` would compile to a schema that looks
correct and fails at the provider — a real failure mode once execution
(09.x+) exists, not a hypothetical one.

Resolved the same way 08.1 resolved ambiguity #1 and 08.3 resolved
ambiguity #3: checked the real compiler source and its own test suite
(`google/dotprompt`, `js/src/picoschema.ts` + `picoschema.test.ts`), not
the reference docs. Verified twice over — the source (the object
initializer inside `parsePico()`, the one function both the top-level
schema and any nested `(object, ...)` field go through, hardcodes
`additionalProperties: false`) and 7 real test cases, including one
asserting it holds for a parent object and its nested object at once. The
only override is an explicit `(*)` wildcard-property key, unused anywhere
in this project's format.

**Answer: yes, unconditionally.** Per the ticket's own branching
instruction, that means there's nothing to build — neither 08.3's parser
nor the eventual Picoschema compiler needs to inject
`additionalProperties: false` itself, defensively or otherwise, since
Picoschema already produces exactly that shape by default. Documented in
full in `core/prompt-file.ts`'s `PicoschemaDefinition` comment and in the
spike note itself (§3, item 4, now RESOLVED — all four of the spike's
original ambiguities are resolved as of this entry). No code changes; this
was a pure documentation/verification pass.

---

## 2026-08-10 — Test-first check: schemaVersion 2 is rejected, not silently coerced

Added a dedicated regression test for `08.1`'s schemaVersion contract, using
`schemaVersion: 2` specifically — the realistic "next version bump" case —
rather than only the existing arbitrary-far-future-version test
(`schemaVersion: 99`). Confirms three things explicitly, matching the
"error messages worth reading" requirement literally: `parsePromptFile`
never throws for this input; the result is a failure, not a `PromptFile`
silently treated as v1; and the error's `message` string actually names
the file, the version found, and the version(s) supported — not a generic
"invalid schema" string. Wrote the test first, ran it, and confirmed it
passes against the existing implementation with no code changes needed —
`core/parse-prompt-file.ts`'s `parseExtension` already had this contract
correct from when 08.3 first landed; this closes the gap between "the
behavior exists" and "the behavior is actually pinned down by a test that
would catch a regression." `core/parse-prompt-file.test.ts` now has 25
tests; full suite 23 files / 202 tests, all green.

## 2026-08-10 — Self-audit of `core/parse-prompt-file.ts` for ambiguity-#1-shaped silent failures

Prompted by a direct question: given ambiguity #1 (08.1) was only caught by
reading the real parser source rather than the docs, what's the equivalent
risk in the parser I wrote myself — input that wouldn't error, wouldn't
throw, and would just silently produce a wrong-but-plausible result?
Found and fixed three, all in `core/parse-prompt-file.ts`:

1. **Malformed `{{role ...}}` markers silently became literal message
   content.** `ROLE_MARKER` only matched the exact double-quoted, lowercase
   form. But this parser never renders the body through Handlebars (08.3's
   own scope keeps content a raw string) — so a single-quoted
   `{{role 'system'}}`, a wrong-case `{{role "System"}}`, or a
   no-argument `{{role}}` would all silently fall through as ordinary text
   inside whichever message was currently accumulating, with
   `result.success: true` and a perfectly well-formed-looking
   `PromptMessage[]` that's just quietly missing a message boundary. Fixed
   with `ROLE_MARKER_LOOSE`, a broader pattern that catches anything
   shaped like an attempted role marker, cross-checked against the strict
   pattern — a mismatch is now a named `INVALID_BODY` error instead of
   silent absorption.
2. **Every "must be an object" check accepted arrays too** — plain JS
   semantics (`typeof [] === 'object'`), not a guess. `input: {schema: [a,
   b]}` would pass validation, then `Object.keys(['a','b'])` downstream
   silently produced variable names `"0"`, `"1"`. `config: [0.3]` would
   pass, then every field lookup came back `undefined`, silently producing
   an *empty* config object instead of an error. Fixed with a shared
   `isPlainObject()` helper (`typeof === 'object' && !== null &&
   !Array.isArray`), replacing every ad hoc `typeof x !== 'object' || x
   === null` check in the file.
3. **`variableKinds` cross-validation didn't strip Picoschema's own key
   modifiers.** `parseVariableKinds` compared against `input.schema`'s raw
   keys — but a Picoschema key can be `topic(array, ...)` or `topic?`.
   A `variableKinds` entry for a variable declared either way would be
   *wrongly rejected* as undeclared (the opposite direction — a false
   rejection, not a silent bad-pass, found by re-reading `picoschema.ts`'s
   own key-splitting logic already fetched for the ambiguity-#3 work).
   Fixed with `bareVariableName()`, stripping the `(...)` suffix and
   trailing `?` before comparing.

None of the 3 real example files triggered any of these — all three were
latent, not currently broken in practice — but all three are real and
fixable, so fixed rather than just logged. 8 new regression tests added;
full suite (23 files, 201 tests), `tsc`, `typecheck:core`, and lint all
green.

---

## 2026-08-10 — Picoschema `(array)` grammar ambiguity resolved (spike note §3, item 3)

Verified against `google/dotprompt`'s real Picoschema compiler source
(`js/src/picoschema.ts`) and its own test suite (`picoschema.test.ts`),
fetched live — not inferred by analogy, which is how the spike note (08.1)
had originally left this. For a parenthesized key `field(array,
description)`, the description *inside the parens* describes the
array/object/enum field itself; the value after the colon is recursively
parsed as the item type in the same `type, description` form. Confirmed
against a real test case: `{ 'items(array, list of items)': 'string' }` →
`{ type: 'array', items: { type: 'string' }, description: 'list of
items' }`.

**This surfaced that `examples/prompts/generate-api-docs.prompt.md` was
itself written wrong**: `parameters(array): string, Name and description of
each request parameter` had empty parens (no array-level description) and
put the description on the item type instead. Flagged first, then fixed
once asked to: all three `(array)` fields in that file (`parameters`,
`responses`, `errorCodes`) now carry their original wording as the
array-level description in the parens, with a bare `string` item type —
verified by hand-simulating the real compiler's `extractDescription` regex
against the corrected YAML before committing to it, not just re-reading it
and hoping. Documented in full in `core/prompt-file.ts`'s
`PicoschemaDefinition` comment and in the spike note itself (§3, item 3,
now RESOLVED). `docs/dashboard.md` and `tickets.md`'s 08.1 notes updated to
stop saying "two ambiguities open" now that one of the two is resolved.
(The other, ambiguity #4 — `additionalProperties: false`'s default — was
resolved the same day in a separate pass; see the entry above this one.)

## 2026-08-10 — `.prompt` file parser (08.3)

`core/parse-prompt-file.ts`: `parsePromptFile(source, slug)` returns a
`{success, file} | {success, error}` result (never throws), splitting a raw
`.prompt` file into frontmatter (validated into `PromptFile`'s typed fields)
and a role-tagged `PromptMessage[]` body — per the ticket's explicit scope,
message *content* stays a raw string; no Handlebars variable interpolation
and no Picoschema compilation happen here (`input`/`output.schema` remain
the raw passthrough `PicoschemaDefinition` shape the type already
documented; Picoschema compilation and variable interpolation are 09.x's
job).

Two decisions made explicitly, not defaulted silently:

- **A fully-missing `ext.promptmuster` block rejects** with
  `MISSING_REQUIRED_FIELD`, matching `PromptMusterExtension`'s fields exactly
  as already typed (all required, no defaults synthesized). Adopting a bare
  dotprompt file authored outside PromptMuster isn't supported yet — that's
  deliberately deferred to whenever there's a real driving use case (import,
  or the MCP "adopt a library wholesale" scenario), not designed for
  speculatively. This doesn't block future format growth: that's what
  `schemaVersion` is for. The parser dispatches extension-parsing on
  `schemaVersion` (`parseExtensionV1` today; a v2 branch would be additive,
  not a rewrite) — most "add a field/relax a constraint" changes (e.g., an
  optional field defaulted by the parser) don't even need a version bump;
  only changes to a field's fundamental shape (e.g., single category →
  multiple) do, and that's the case a version bump is supposed to gate.
- **Body-splitting on `{{role "..."}}` markers was verified against
  google/dotprompt's real `js/src/parse.ts` `toMessages` source** (fetched
  live, not assumed) rather than guessed: content before the first marker
  (or the whole body, if there are no markers at all) defaults to role
  `user`; a marker seen before any content has accumulated relabels the
  still-empty current message rather than inserting an empty leading one —
  which is why a body that opens with `{{role "system"}}` produces a clean
  2-message array, not 3 with a stray empty one. My first guess here
  (erroring on leading content) was wrong; checked before implementing it,
  not after.

Also: added `gray-matter` + `yaml` as real dependencies (the stack `trd.md`
already specified, just not installed until this ticket needed it) —
`gray-matter`'s own bundled `yaml` engine is overridden to use the `yaml`
package explicitly, not its default `js-yaml`. `vitest.config.ts`'s
`include` only matched `src/**/*.test.{ts,tsx}`; widened to also run
`core/**/*.test.ts`, or the new test file would have silently never run.
Confirmed via `npm audit` that gray-matter's own transitive `js-yaml@3.15.1`
isn't in the vulnerable range flagged elsewhere in the tree (that's a
separate, pre-existing `js-yaml@4.3.0` from `eslint`/`shadcn`, unrelated to
this change) — not something to silently wave past.

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
