# PromptMuster — UI/UX Prototypes & Flows

|                        |                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Status**             | 📝 Draft v0.1 — companion to [ia.md](ia.md) §4 and [design-system.md](design-system.md) |
| **Owner**              | Shenbaga Srinivasan                                                                     |
| **Created**            | 2026-07-15                                                                              |
| **Companion artifact** | Seven journeys as connected screens — see link accompanying this document               |

---

## 0. What this is

[ia.md §4](ia.md) described each journey as an ordered list of steps. This draws them as
the actual screens, chained in sequence, so the step-by-step is _seen_, not just read. Same
running example throughout both this and the design-system artifact — the
`code-review-thorough` prompt, Anthropic as its primary model, OpenAI as the comparison
partner — so a reader can follow one thread across every document in the set.

All seven journeys use the exact tokens and component classes from
[design-system.md](design-system.md) — no new colors, no new type scale. What's new is
**composition**: full dashboard screens (sidebar + breadcrumb + tabs + content), not
isolated components, chained into filmstrips a reader scrolls through left to right.

Two journeys ([ia.md §4.6](ia.md), [§4.7](ia.md)) aren't dashboard screens at all — an IDE
chat panel and a GitHub PR. Those are shown in **their own product's actual chrome**
(VS Code-dark, GitHub-light), deliberately never reskinned into PromptMuster's theme — showing
them in PromptMuster colors would misrepresent what a user actually sees on those surfaces.

---

## 1. The seven journeys

| #   | Journey                   | Screens                                                    | Notes                                                                                     |
| --- | ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Create and save a prompt  | Library → Editor → Library                                 | New card highlighted, "committed as v1" toast                                             |
| 2   | Run once                  | Run (before) → Run (streaming) → Run (complete)            | See [§2](#2-new-patterns-this-exercise-surfaced) for the streaming state                  |
| 3   | Compare across models     | Run (multi-select) → Comparison                            | Confirms Comparison is a _mode_ of Run, not a separate screen — matches [ia.md §3](ia.md) |
| 4   | Attach eval, run suite    | Evals editor → Eval run (in progress) → Eval run (results) | Progressive reveal, not batch — see [§2](#2-new-patterns-this-exercise-surfaced)          |
| 5   | Version history, rollback | History → Diff → History (post-rollback)                   | Rollback needs no confirm dialog — see [§2](#2-new-patterns-this-exercise-surfaced)       |
| 6   | MCP-driven run from IDE   | IDE panel (confirm-before-spend) → IDE panel (result)      | Confirm gate ties directly to [trd.md §12](trd.md)                                        |
| 7   | CI eval on a PR           | GitHub PR (check + bot comment)                            | Shows the pass case; regression noted as a caption, not a second frame                    |

---

## 2. New patterns this exercise surfaced

Drawing the actual screens forced a few decisions the prose-only flows in
[ia.md §4](ia.md) hadn't needed to make yet. None of these are edits to prior docs — they're
additions the visual layer made necessary.

- **Streaming needs its own visible state.** A blinking cursor + a pulsing "Generating…"
  label, distinct from a generic spinner — added to the component vocabulary here.
  _(Folded into [design-system.md §3](design-system.md) in v0.2.)_
- **Eval rows reveal progressively, not as one batch.** Rows in progress show a neutral
  "…" pending badge until their result lands, rather than the whole table appearing at
  once when the suite finishes. Direct application of the design system's own "what's
  interactive should look interactive" principle.
- **Rollback resolved: no confirmation modal.** [ia.md §8](ia.md) left this genuinely
  open. Building the screen made the answer obvious: since a rollback is _always_ a new
  commit ([ia.md §4.5](ia.md)'s already-settled rule), there's nothing destructive to
  confirm — the action completes immediately with a toast, the same pattern as saving a
  prompt. This is a resolution, not a new open question.

## 3. Still open

- **Cost-preflight recompute trigger.** ✅ **Resolved 2026-07-16: debounced on change** —
  the local heuristic estimate recomputes ~400ms after the last keystroke; the exact
  provider-side count stays on-demand ([trd.md §5.4](trd.md)).
- **Eval "pending" row state** — was missing from [design-system.md](design-system.md)'s
  component table; _added there in v0.2_ alongside the streaming-state pattern, so both
  docs are now in sync.

---

## Changelog

- **v0.3 (2026-07-16)** — Cost-preflight trigger resolved by owner (debounced on change);
  no open items remain in this doc.
- **v0.2 (2026-07-15)** — Reconciliation pass: both component feedback items (streaming
  state, pending row) folded into design-system.md §3; cost-preflight recompute trigger
  remains the one open item here.
- **v0.1 (2026-07-15)** — Initial flows. Seven journeys from ia.md §4 drawn as connected
  screens against design-system.md's tokens; IDE and GitHub surfaces shown in their own
  chrome. Surfaced one new component pattern (streaming state), one progressive-reveal
  pattern (eval rows), resolved rollback's confirm-dialog question, and left the cost-
  preflight recompute trigger open.
