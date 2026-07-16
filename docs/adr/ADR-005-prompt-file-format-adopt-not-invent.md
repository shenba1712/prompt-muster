# ADR-005: Adopt an existing prompt-file convention rather than inventing one

Status

🟢 Accepted

Date

2026-07-15 (proposed) — 2026-07-16 (accepted, dotprompt confirmed)

Project

PromptMuster

---

# Context

The prompt file format ([trd.md §3](../trd.md)) is the single most
load-bearing, hardest-to-reverse decision in the whole system — once any prompt is shared,
synced via git, or read by an external tool, its format is a one-way door
([prd.md §11.2](../prd.md)). Emerging conventions already exist in this
space (Microsoft's `.prompty`, Google's dotprompt, GitHub Models' `.prompt.yml`), and there
is at least one adjacent internal precedent worth naming honestly: Claude Code's own
slash-command and skill files are already markdown prompt files living in a git repo.

---

# Decision

**Accepted: adopt and extend [dotprompt](https://github.com/google/dotprompt).** YAML
frontmatter plus a Handlebars body with `{{role "system"}}` markers, matching the shape
[trd.md §3](../trd.md) sketched independently. PromptMuster's own additions
(`schemaVersion`, typed UI variable kinds) live in a namespaced `promptmuster:` frontmatter
block that other dotprompt tooling can just ignore — the "extend" half of "adopt and
extend," not a fork of the base format.

---

# Why?

A bespoke format optimizes for short-term design freedom at the cost of long-term
interoperability and credibility. Adopting an existing convention means other tools can
potentially read PromptMuster's prompt files (and vice versa) without a bespoke import/export
step, and it signals the project understands the existing ecosystem rather than
reinventing it in ignorance of prior art.

---

# Alternatives Considered

Alternative

Fully bespoke format, designed purely around PromptMuster's own needs.

Pros

- No compromise between what an existing convention supports and what PromptMuster actually
  needs (e.g. the eval-suite sibling-file pattern)
- Complete design freedom

Cons

- Zero interoperability with any other tool on day one
- Signals not-invented-here rather than ecosystem awareness
- Every future feature (an output schema, eval assertions) has no reference point to
  design against

Alternative

Adopt an existing convention verbatim, with no PromptMuster-specific extensions.

Pros

- Maximum interoperability
- Zero format-design work

Cons

- None of the surveyed conventions natively models eval test cases or committable
  baselines, which are core to this product's differentiation
  ([prd.md §6.2](../prd.md)) — a verbatim adoption would likely require
  bolting on extensions anyway, so the realistic choice is "adopt and extend," not "adopt
  unmodified"

Alternative

Microsoft's `.prompty`.

Pros

- Was the earlier lean; a recognizable name in the space

Cons

- Its own README states v2's format is explicitly alpha and subject to change — adopting a
  format mid-redesign recreates the exact one-way-door risk adoption was meant to avoid

Alternative

GitHub Models' `.prompt.yml`.

Pros

- The only one of the three with eval test data modeled natively — philosophically closest
  to PromptMuster's eval-first thesis

Cons

- Pure YAML means prompt bodies — the longest, most-read content in the file — live inside
  YAML block scalars, the worst authoring ergonomics of the three
- Better suited as a Phase-3 import/export target than the native format

Chosen: dotprompt.

Pros

- Format shape (YAML frontmatter + Handlebars body) already matches what trd.md §3
  sketched independently — least design friction of the three
- Ecosystem depth: core libraries in JS/TS/Python/Go/Rust/Java, VS Code *and* JetBrains
  plugins, a tree-sitter grammar, Monaco/CodeMirror editor modes — the dashboard's own
  prompt editor gets syntax highlighting close to free
- Apache-2.0, stable (not alpha)
- PromptMuster's deltas from it are two namespaced frontmatter keys, not enough to justify
  owning a bespoke spec forever

Cons

- No native eval-test-case modeling (same gap as bespoke/verbatim-adoption alternatives) —
  addressed by the sibling `.eval.yaml` file (trd.md §3), not the prompt file itself

---

# Consequences

Positive

- Interoperability with the broader dotprompt ecosystem (editor tooling, cross-language
  libraries)
- A natural on-ramp for anyone already using a dotprompt-compatible tool
- Free syntax highlighting in the dashboard editor via existing Monaco/CodeMirror modes

Negative

- Constrained by whatever dotprompt already assumes (Handlebars templating, its own
  frontmatter conventions)
- Must track dotprompt's own future changes

Trade-offs

Some short-term design friction — mapping PromptMuster's specific needs (variables, eval
siblings, output schema) onto someone else's format — in exchange for long-term
interoperability and lower reinvention risk.

---

# Impact

Performance — n/a
Scalability — n/a
Maintainability — tracking an external format's evolution is an ongoing cost, but a shared
one, not solely PromptMuster's burden
Security — n/a beyond the general untrusted-prompt-file handling in
[trd.md §12](../trd.md)
Developer Experience — better; prompt authors may already recognize the format
Deployment — n/a
Testing — parser tests are format-specific either way
Cost — n/a
AI — this is directly the format LLM tooling reads and writes

---

# Risks

dotprompt could itself change in incompatible ways — the same one-way-door risk that ruled
out Prompty (whose v2 is alpha) applies to any upstream dependency, dotprompt included.
Picking wrong here is expensive to undo once real prompt libraries exist in the field, per
[prd.md §11.2](../prd.md). Mitigation: `schemaVersion` and the namespaced
`promptmuster:` block are PromptMuster's own escape hatch — a breaking upstream dotprompt change
would need a migration on the extension layer, not a full-format rewrite.

---

# Validation

A prompt file authored in PromptMuster should be readable — at least its messages and
variables — by at least one other tool in the same convention family, or vice versa,
without a bespoke converter.

---

# Future Revisit

Revisit only if Phase 1's parser work (trd.md §15) surfaces a dotprompt limitation the
`promptmuster:` extension block can't absorb cleanly, or if dotprompt itself has a breaking
change before that work starts. Otherwise this is settled — no scheduled revisit.

---

# Related Documents

[trd.md §3, §14 Q1](../trd.md)
[prd.md §11.2](../prd.md) (open decision #2)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No — dotprompt, extended via a namespaced frontmatter block, for the
ecosystem-tooling and format-fit reasons above.

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No — "adopt and extend" beats inventing a format outright, and dotprompt
needed only two namespaced keys added, not a fork.

---

Did I optimise for today's problems or hypothetical future problems?

☐ Today's　☑ Future　☐ Balanced — this decision is explicitly about avoiding a future
interoperability and credibility cost, at the price of some present-day design friction.

---

Would I make the same decision again?

☑ Yes — pending Phase 1 implementation actually exercising the format. Revisit this answer
once the parser (trd.md §3) is built and dotprompt's fit has been tested against real
prompts, not just read on paper.

---

# Lessons Learned

Separating "which strategy" from "which specific option" into two explicit decision points
(this ADR vs. prd.md §11.2 #2) let the strategy get accepted early and stay stable while
the specific-convention research kept going in parallel — worth doing again for other
one-way-door choices with more than one viable option.
