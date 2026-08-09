# Prompt File Format — Spike Note (ticket 08.1)

| | |
|---|---|
| **Status** | ✅ Done — feeds 08.2 (core package scaffold) and 08.3 (parser) directly |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-08-09 |
| **Method** | Read the real dotprompt spec (`google.github.io/dotprompt`, frontmatter/template/Picoschema references) and Genkit's plugin docs, then hand-authored 3 real seed prompts as `.prompt.md` files — not from a template. Worked examples live in [`examples/prompts/`](../examples/prompts/): `code-review.prompt.md`, `debug-error.prompt.md`, `generate-api-docs.prompt.md`. |
| **Related** | [trd.md §3](trd.md), [ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md) |

---

## 1. The `promptmuster:` extension — exact keys and nesting

**Corrected 2026-08-09, verified against the real parser source** (`google/dotprompt`,
`js/src/parse.ts` — see ambiguity #1 in [§3](#3-open-ambiguities-and-how-they-were-resolved)
for the exact code). A bare top-level `promptmuster:` block — what all 3 worked examples
originally used — is **silently dropped** by a real dotprompt parser. The correct shape
nests one level deeper, under dotprompt's own reserved `ext` key:

```yaml
ext:
  promptmuster:
    schemaVersion: 1
    category: code-review
    tags: [review, correctness]
    isFavorite: false
    variableKinds:
      diff: file
      language: select
```

- **`ext:`** is one of dotprompt's own reserved top-level keys (`RESERVED_METADATA_KEYWORDS`
  in the real parser) — its value is passed through untouched, no dot-key splitting needed.
  Nesting `promptmuster:` under it is what makes this survive a real dotprompt parse instead
  of vanishing. (A flat dot-keyed alternative, `promptmuster.schemaVersion: 1` etc. at the
  frontmatter's own top level, produces the identical `ext.promptmuster.*` result via the
  parser's namespace-splitting path — either form works; the nested `ext:` form is used here
  for readability.)
- **`category`** — string, one of the existing `Category` union values (`src/types/prompt.ts`).
- **`tags`** — array of strings, unordered, no schema beyond "array of strings."
- **`isFavorite`** — boolean.
- **`variableKinds`** — object, keyed by variable name (**must** match a key already declared
  in `input.schema` — the parser should reject a `variableKinds` entry with no matching
  variable, and should treat a variable with no `variableKinds` entry as a plain text input,
  not an error). Value is a UI-control-kind string for the dashboard's auto-generated
  variable form. Kinds seen across the 3 worked examples: `select`, `file`, `textarea`. This
  is **not an exhaustive enum yet** — `PromptForm` today has no concept of this at all, so
  08.2's `PromptFile` types should define the kind as a string literal union sized to
  whatever the dashboard's form-control set actually ends up being, not copied from this
  list verbatim.

**Why this scope, not less:** ADR-005 originally named only two things needing the
namespace — `schemaVersion` and typed variable kinds. Actually writing 3 real files showed
the block also has to carry `category`/`tags`/`isFavorite`, because dotprompt has *zero*
native concept of any of them. The rule that generalizes: **anything PromptMuster-domain
that dotprompt doesn't model at all goes in this block; anything dotprompt already models
(the model, its params, the variables, the output shape) stays in dotprompt's own native
keys.** ADR-005 and trd.md §3 have been corrected to say this.

**What deliberately has no home here, native or extended:**
- **`id` (UUID)** — gone entirely. The filename is the identifier (`code-review.prompt.md`
  → `name: code-review`). 08.2's `PromptFile` type should not carry an `id` field at all;
  callers key by slug.
- **`createdAt`** — gone entirely. `git log` on the file already gives real, accurate
  provenance for free (ADR-002's whole argument for putting prompts in git) — a frontmatter
  copy would just go stale the moment it drifts from the actual last-commit date. If a
  screen needs "created," it should shell out to git, not read a field.

## 2. `schemaVersion` — value and location

- **Starting value: `1`** (integer, not a string, not `0` — this is the one-way-door field,
  so it starts at the lowest real version).
- **Location: `ext.promptmuster.schemaVersion`** in the parsed object (authored as
  `ext: { promptmuster: { schemaVersion: 1 } }` in the frontmatter) — nested inside the
  extension namespace, **not** top-level and **not** a bare `promptmuster:` block either
  (corrected 2026-08-09 — see §1).
- **Parser contract (08.3):** refuse to load a file whose `ext.promptmuster.schemaVersion`'s
  major version the parser doesn't recognize, with an error message that names the file,
  the version found, and the versions supported — not a generic parse failure. A missing
  extension entirely (a hand-written file with no PromptMuster extensions at all) is a
  separate case from a present-but-unrecognized version, and should probably be treated as
  version `1` by default rather than rejected — worth confirming in 08.3, not assumed here.

## 3. Open ambiguities, and how they were resolved (or weren't)

Reading the spec closely enough to write 3 real files surfaced four real ambiguities.
Two are now resolved (one after a second pass, prompted by a direct question about whether
it was worth chasing down); two are flagged as genuinely open, not papered over:

1. **Unrecognized top-level frontmatter key — RESOLVED 2026-08-09, verified against the real
   parser source, not the docs.** Fetched `google/dotprompt`'s actual TypeScript source
   (`js/src/parse.ts`) rather than relying on the reference docs, which don't spell this out.
   The parsing loop is exactly this:
   ```ts
   const RESERVED_METADATA_KEYWORDS = [
     'config', 'description', 'ext', 'input', 'model', 'name',
     'output', 'raw', 'toolDefs', 'tools', 'variant', 'version',
   ];
   for (const k in raw) {
     if (RESERVED_METADATA_KEYWORDS.includes(k)) pruned[k] = raw[k];      // passthrough
     else if (k.includes('.')) convertNamespacedEntryToNestedObject(k, raw[k], ext); // → ext[ns][field]
     // else: a bare, undotted, unreserved key — silently dropped, kept only in `raw`
   }
   ```
   **A bare top-level `promptmuster:` block is silently dropped** — not an error, just gone
   from what a real dotprompt tool sees. `ext` is itself reserved and passed through
   untouched, so nesting one level deeper (`ext: { promptmuster: {...} }`) survives a real
   parse. All 3 worked examples and this note's §1/§2 have been corrected to that shape.
   This directly matters for ADR-005's own validation criterion — "readable... by at least
   one other tool in the same convention family" — which the original bare-block shape
   would have quietly failed.

2. **Model provider prefix — RESOLVED, verified not guessed.** The `model:` field's
   `pluginName/modelId` shape is confirmed directly from Genkit's own plugin docs, not
   inferred: `genkitx-openai`'s docs show a literal frontmatter example
   (`model: openai/gpt-4o`); the official `@genkit-ai/anthropic` plugin registers itself
   under the name `anthropic` and follows the identical convention. Confidence is high for
   `openai/` (shown as a literal frontmatter example) and good-but-slightly-lower for
   `anthropic/` (confirmed via the plugin's registration name + Genkit's documented
   convention, not a literal frontmatter example in what I could fetch). `googleai/` is the
   one confirmed directly in dotprompt's own docs (it's a Google project). All three are in
   live use in `examples/prompts/`.

3. **Picoschema's `(array)` + trailing description grammar — OPEN, low-stakes.** The scalar
   form (`diff: string, The diff to review`) is directly confirmed. The compound form used
   in `generate-api-docs.prompt.md` (`parameters(array): string, Name and description of
   each request parameter`) was inferred by analogy, not found as a live example in either
   spec page fetched. 08.3's parser should verify this exact grammar against the real
   Picoschema compiler's own test suite before relying on it — if wrong, it's a narrow,
   mechanical fix (this is punctuation-level, not structural, unlike ambiguity #1).

4. **Does Picoschema default to `additionalProperties: false`? — OPEN, matters for the
   Anthropic structured-outputs constraint.** Neither spec page fetched states whether a
   Picoschema `output.schema` compiles with `additionalProperties: false` by default or
   needs it stated some other way. This matters concretely: Anthropic's structured-outputs
   API *requires* `additionalProperties: false`, so if Picoschema doesn't default to it,
   08.3's linter needs to inject it for any prompt targeting an Anthropic model — silently
   getting this wrong would produce a schema that looks right and fails at the provider.

## 4. Body / role-tagged messages — no separate ambiguity, but worth stating plainly

One Handlebars string per file, not separate YAML keys per role. Message boundaries are
inline `{{role "system"}}` / `{{role "user"}}` markers (`{{role "assistant"}}` exists for
multi-turn few-shot; none of the 3 worked examples needed it). PromptMuster's own v1
constraint — plain `{{var}}` interpolation only, no `{{#if}}`/`{{#each}}` — means **every**
variable referenced in the body must be `required` in `input.schema`; there's no clean way
to reference an optional, unfilled variable without conditionals. 08.2's `PromptFile` types
should make variables required-by-default, not optional-by-default, to match.

## 5. Worked reference

The 3 files in [`examples/prompts/`](../examples/prompts/) are the concrete answer to all of
the above — read them alongside this note, not instead of it:

- `code-review.prompt.md` — Anthropic, single variable, no `output.schema`, `ext.promptmuster`
  extension (shows the minimal case).
- `debug-error.prompt.md` — OpenAI, single variable, `textarea` variable kind.
- `generate-api-docs.prompt.md` — Google, has `output.schema` with a Picoschema array field
  (shows ambiguity #3 and #4 in context).
