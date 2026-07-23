# PromptMuster — Information Architecture

|                  |                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| **Status**       | 📝 Draft v0.1 — companion to [prd.md](prd.md) and [trd.md](trd.md)                                      |
| **Owner**        | Shenbaga Srinivasan                                                                                     |
| **Created**      | 2026-07-15                                                                                              |
| **Last updated** | 2026-07-15                                                                                              |
| **Purpose**      | The structural sitemap: how screens connect, and how data flows between them from a user's perspective. |

---

## 0. Scope & method

Information architecture covers the **dashboard's screens and navigation** — that's where
"screens" literally applies. But PromptMuster's whole thesis is "one core, four interfaces"
([prd.md §6](prd.md)), so a dashboard-only IA would understate the product's actual shape.
This doc therefore covers three layers:

1. **Sitemap** ([§1](#1-sitemap)) — the dashboard's screen tree.
2. **Screen inventory & flows** ([§2](#2-screen-inventory)–[§4](#4-user-flows)) — what each
   screen does and how data moves through it.
3. **Non-visual surfaces** ([§5](#5-non-visual-surfaces)) — the MCP tools and CLI commands
   that are the _other_ interfaces' equivalent of a screen, mapped to the same entities.

Status legend matches [compliance-matrix.md](compliance-matrix.md): ✅ built · 🚧 in
progress · 📝 designed, not built · 🔮 deferred (Future). Phases are the PRD's (0–4, F).

---

## 1. Sitemap

```
PromptMuster (Dashboard)
│
├── Library                         /                          [🚧 Wk1 SPA → 📝 routed Wk3]
│   │                               Home. List + search + filter prompts.
│   │
│   ├── New Prompt                  /prompts/new                [📝 Phase 1]
│   │                               Same UI as Editor, no id yet.
│   │
│   └── Prompt Detail               /prompts/:id                [📝 Phase 1]
│       │                           Overview: content preview, metadata, tab nav below.
│       │
│       ├── Editor                  /prompts/:id/edit           [📝 Phase 1]
│       │                           Edit messages, variables, model, output schema.
│       │
│       ├── Run                     /prompts/:id/run            [📝 Phase 1]
│       │   └── Comparison          /prompts/:id/run?models=a,b [📝 Phase 2 — same screen,
│       │                           multi-model mode.            multi-select mode]
│       │
│       ├── Executions              /prompts/:id/runs           [📝 Phase 1]
│       │                           This prompt's past runs (scoped view of global Runs).
│       │
│       ├── History                 /prompts/:id/history        [📝 Phase 2]
│       │   └── Diff                /prompts/:id/diff/:a..:b    [📝 Phase 2]
│       │                           Version list (git log) → pick two → diff.
│       │
│       └── Evals                   /prompts/:id/evals          [📝 Phase 2]
│           ├── Eval Editor         /prompts/:id/evals/edit     [📝 Phase 2]
│           │                       Add/edit test cases (variables + assertions).
│           └── Eval Run            /prompts/:id/evals/runs/:id [📝 Phase 2]
│                                   Suite results, pass/fail, cost, regression vs baseline.
│
├── Runs                            /runs                       [📝 Phase 1]
│   └── Run Detail                  /runs/:id                   [📝 Phase 1]
│                                   Global execution log across all prompts.
│
├── Cost                            /cost                       [📝 Phase 2]
│                                   Aggregated dashboard: cost/tokens by prompt, model, time.
│
├── Settings                        /settings                   [📝 Phase 1–2]
│   ├── Providers & Keys            /settings/providers         [📝 Phase 1]
│   ├── Models                      /settings/models             [📝 Phase 1]
│   │                               The models-as-data table (TRD §5.4/A6) — pricing,
│   │                               context window, snapshot IDs.
│   └── Team & Sync                 /settings/team              [🔮 Phase 4]
│
└── Run Console                     /console                    [🔮 Phase 4]
                                     Simplified surface for non-technical teammates (PRD
                                     Ring 2): variable form → run → compare. No Editor,
                                     no Evals, no History exposed.
```

**What exists today (Week 1–2):** a single unrouted page containing Library-equivalent
functionality only — `PromptList`, `PromptCard`, `PromptFilters`, `PromptForm` as a modal/
inline editor (not yet a separate route), per [core/CLAUDE.md](../CLAUDE.md). Routing
(backlog #06) introduces the tree above starting Week 3; everything past Library is net-new
screen surface tied to Phase 1–2 features.

---

## 2. Screen inventory

| Screen               | Purpose                                    | Primary entities           | Key actions                                                    |
| -------------------- | ------------------------------------------ | -------------------------- | -------------------------------------------------------------- |
| Library              | Browse, search, filter the prompt library  | Prompt (list)              | search, filter, favorite, open, new                            |
| New Prompt / Editor  | Author or edit a prompt                    | Prompt                     | edit messages/variables/model/schema, save                     |
| Prompt Detail        | Orientation hub for one prompt; tabs below | Prompt                     | navigate to sub-screens                                        |
| Run / Comparison     | Execute against one or many models         | Prompt, Execution Run      | fill variables, pick model(s), run, view streamed output       |
| Executions (scoped)  | This prompt's run history                  | Execution Run              | view, re-run with different vars/model (replay)                |
| Runs (global)        | All executions across the library          | Execution Run              | filter by prompt/model/date                                    |
| Run Detail           | One execution's full record                | Execution Run              | view input/output/tokens/cost, replay                          |
| History              | Version list for a prompt                  | Version (git commit)       | select two → diff, rollback                                    |
| Diff                 | Compare two versions                       | Version                    | view structural diff (messages/vars/params)                    |
| Evals                | Test suite overview for a prompt           | Eval Suite                 | view cases, run suite, view past runs                          |
| Eval Editor          | Add/edit test cases                        | Eval Suite (test case)     | add case, edit assertions                                      |
| Eval Run             | One suite run's results                    | Eval Result, Baseline      | view pass/fail, cost, regression vs baseline, save-as-baseline |
| Cost                 | Aggregated spend view                      | Execution Run (aggregated) | filter by prompt/model/time, see projection                    |
| Settings → Providers | Manage API key presence (not values)       | Provider config            | connect/disconnect provider                                    |
| Settings → Models    | View/edit the models-as-data table         | Model                      | see pricing/context, mark preferred                            |
| Settings → Team      | Team sync config                           | —                          | 🔮 Phase 4                                                     |
| Run Console          | Simplified run+compare for non-devs        | Prompt, Execution Run      | fill variables, run, compare — read-only on everything else    |

---

## 3. Navigation model

**Global nav** (persistent, per [core/CLAUDE.md](../CLAUDE.md)'s `Header.tsx`): Library
· Runs · Cost · Settings. Prompt count badge stays in the header per the existing spec.

**Contextual nav:** once inside a Prompt Detail, a tab bar carries Overview / Run / Evals /
History / Executions — these are siblings, not a hierarchy the user drills through linearly.
Comparison is not a separate tab; it's a mode switch inside Run (multi-select models instead
of one) so the mental model stays "one Run screen," not "Run vs. Compare as two things to
learn."

**Breadcrumb pattern:** `Library › {Prompt Name} › {Tab}` — consistent across every
Prompt-Detail sub-screen.

**Entry points that aren't in-app nav:**

- **MCP `run_prompt`** can trigger an execution that later shows up in Runs/Run Detail —
  the dashboard is a _viewer_ of activity that originated elsewhere, not the only place work
  happens (see [§5](#5-non-visual-surfaces)).
- **CI Action** writes results the dashboard never renders directly (they live as a PR
  comment) — but a regressed baseline is visible in Eval Run the next time someone opens it.

---

## 4. User flows

Each flow is written as an ordered, user-facing sequence — what the person does, what the
system does in response. Cross-referenced to the TRD section that designs the underlying
mechanism.

### 4.1 Create and save a prompt

1. Library → **New Prompt**.
2. Editor: title, category/tags, messages (system/user), typed variables, optional output
   schema ([trd.md §3](trd.md)).
3. Save → core writes `<slug>.prompt.md` to the prompts directory.
4. Save writes the file **and auto-commits** with a generated message — _resolved
   2026-07-16, see [§8](#8-open-ia-questions) Q1._

### 4.2 Run once against a model

1. Prompt Detail → **Run**.
2. Run screen renders a form generated from the prompt's `variables` schema; model defaults
   to the prompt's configured model.
3. A cost-preflight badge shows an instant heuristic estimate before the user presses Run
   (exact count available on demand — [trd.md §5.4](trd.md)).
4. User fills variables, presses Run.
5. Request streams via the dashboard's route handler into `core.execute()` → provider
   adapter → SSE back to the screen ([trd.md §5.1–5.2](trd.md)); output renders token-by-token.
6. On completion, core logs the run (model snapshot, tokens, cost, latency) to SQLite
   ([trd.md §4](trd.md)).
7. Screen shows final output + actual cost/latency, with a link into Run Detail.

### 4.3 Compare across models

1. From Run, the user multi-selects models instead of one.
2. Screen switches to a parallel-column layout, one column per model.
3. Dashboard fires N `core.execute()` calls under bounded concurrency
   ([trd.md §6.4](trd.md)); each column streams independently.
4. On completion: output + cost + latency shown per column, side by side.
5. _(Closes part of the FR-EXE-05 gap flagged in [compliance-matrix.md §9](compliance-matrix.md)
   — this is the proposed shape; exact layout/interaction still to be built.)_

### 4.4 Attach an eval and run the suite

1. Prompt Detail → **Evals** → **Eval Editor**: add test cases (variable values +
   assertions), stored in the sibling `.eval.yaml` file ([trd.md §3](trd.md)).
2. **Run Suite** (optionally scoped to specific models).
3. For each (test case × model): core checks the result cache, skips unchanged cells, else
   calls the provider ([trd.md §6.4](trd.md)).
4. Assertions evaluate — exact/contains/schema/property immediately, `llm-judge` via a judge
   model call ([trd.md §6.2](trd.md)).
5. Eval Run screen shows a pass/fail matrix, total cost, and — if a prior baseline exists —
   a regression diff against it ([trd.md §6.5](trd.md)).
6. **Save as new baseline** writes `.baseline.json`, committable for CI ([trd.md §10](trd.md)).

### 4.5 Version history and rollback

1. Prompt Detail → **History**: version list is `git log` on that file, rendered as
   commit sha / date / message / author.
2. Select two versions → **Diff**: structural diff of messages, variables, model params.
3. **Rollback to this version** writes the old content back as a **new commit** — never a
   destructive history rewrite. _(Recommended default — see [§6](#6-open-ia-questions).)_

### 4.6 MCP-driven run from the IDE _(cross-surface)_

```
Developer (Claude Code)  →  MCP get_prompt   →  core.resolve()      →  prompt file
Developer (Claude Code)  →  MCP run_prompt   →  [confirm — untrusted-origin
                                                  or spend gate, trd.md §12]
                          →  core.execute()   →  provider adapter    →  SQLite runs log
                                                                     ↘  same row the dashboard's
                                                                        Runs/Run Detail reads
```

This is the concrete version of "same internal API, different access points"
([prd.md §6.1](prd.md)) — the IDE run and a dashboard run are indistinguishable once logged.

### 4.7 CI eval on a pull request _(cross-surface)_

1. A prompt file changes in a PR.
2. GitHub Action runs `promptmuster eval --changed` (CLI → core, [trd.md §10](trd.md)).
3. Core runs the suite, compares to the committed baseline.
4. Action posts a PR comment: pass/fail + cost delta.
5. A regression past threshold fails the check.

---

## 5. Non-visual surfaces

CLI and MCP have no screens, but they touch the same entities and are the equivalent
navigation surface for Ring 0/1 users who never open the dashboard.

### MCP tools ([trd.md §7](trd.md))

| Tool           | Touches                | Confirm-gated?                          | Dashboard equivalent |
| -------------- | ---------------------- | --------------------------------------- | -------------------- |
| `list_prompts` | Prompt (list)          | No                                      | Library              |
| `get_prompt`   | Prompt                 | No                                      | Prompt Detail        |
| `run_prompt`   | Prompt → Execution Run | **Yes** — spend + untrusted-origin gate | Run                  |

### CLI commands ([trd.md §8](trd.md))

| Command                          | Touches                           | Dashboard equivalent             |
| -------------------------------- | --------------------------------- | -------------------------------- |
| `promptmuster list` / `search`   | Prompt (list)                     | Library                          |
| `promptmuster run <name>`        | Prompt → Execution Run            | Run                              |
| `promptmuster eval <name>`       | Eval Suite → Eval Result/Baseline | Evals / Eval Run                 |
| `promptmuster export` / `import` | Prompt (serialization)            | — (file-level, no screen needed) |
| `promptmuster mcp`               | starts the MCP server             | —                                |

---

## 6. Data model → screen matrix

Ties this doc to the storage design in [trd.md §4](trd.md): which screens read vs. write
each entity.

| Entity                                            | Read by                                                                                        | Written by                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Prompt (file)                                     | Library, Prompt Detail, Run, History, Evals, Comparison, MCP `list/get_prompt`, CLI `list/run` | Editor; rollback action in History                             |
| Version (git commit)                              | History, Diff                                                                                  | Editor's save (pending [§6.1](#6-open-ia-questions)); rollback |
| Execution Run (SQLite)                            | Runs, Run Detail, Cost, Executions tab                                                         | Run/Comparison on execute; MCP `run_prompt`; CLI `run`         |
| Eval Suite (`.eval.yaml`)                         | Evals, Eval Editor                                                                             | Eval Editor                                                    |
| Eval Result / Baseline (`.baseline.json` + cache) | Eval Run, Diff-style regression view                                                           | Eval Run's "save as baseline"; CI Action                       |
| Model (data table, TRD A6)                        | Settings → Models, Run's model picker, Cost                                                    | Settings → Models                                              |
| Provider keys (keychain/env)                      | Settings → Providers (presence only, masked)                                                   | Settings → Providers                                           |

---

## 7. Screen states

Per [core/CLAUDE.md](../CLAUDE.md)'s existing rule — _"Handle empty states in every
list component"_ — every list-bearing screen needs an explicit empty/loading/error design,
not just the happy path.

| Screen            | Empty state                                      | Error state (representative)                                                                              |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Library           | "No prompts yet" + New Prompt CTA                | —                                                                                                         |
| Run / Comparison  | —                                                | Provider call failed (per-model, doesn't block other columns)                                             |
| Runs / Executions | "No executions yet" + link to Run                | —                                                                                                         |
| History           | "No prior versions" (new prompt, no commits yet) | Git read failure                                                                                          |
| Evals             | "No test cases yet" + Add Case CTA               | —                                                                                                         |
| Eval Run          | —                                                | A test case's provider/judge call failed — shown inline in that row, doesn't block the rest of the matrix |
| Cost              | "No spend yet"                                   | —                                                                                                         |

---

## 8. Open IA questions

Distinct from the TRD's open technical questions — these are about the _screen-level_
experience, not the underlying design:

1. **Does Save auto-commit?** ✅ **Resolved 2026-07-16: (b) — Save writes the file and
   auto-commits with a generated message** (e.g. `prompt(code-review-thorough): edit
messages`). No commit-message field in the Editor; the save toast reads
   "Saved · committed as vN" — exactly what [ux-flows.md](ux-flows.md) Flow 1 already drew.
2. **Rollback semantics.** Recommended default (stated in [§4.5](#45-version-history-and-rollback)):
   rollback always creates a **new commit**, never rewrites history. Treat this as settled
   unless there's a reason to reopen it. _Extended (v0.2, via [ux-flows.md](ux-flows.md)
   Flow 5): because it's non-destructive by construction, rollback also needs **no
   confirmation modal** — it completes immediately with a toast._
3. **Comparison as a Run-mode vs. a separate screen.** This doc proposes "mode of Run"
   ([§1](#1-sitemap), [§3](#3-navigation-model)) as the default. _Layout resolved (v0.2,
   via [ux-flows.md](ux-flows.md) Flow 3): parallel columns, one per model, each with its
   own cost/latency footer._
4. **Run Console scope (Phase 4).** How much of Editor/Evals is hidden vs. read-only for
   non-technical users is deliberately deferred — not needed until Phase 4 planning.

---

## Changelog

- **v0.3 (2026-07-16)** — §8 Q1 resolved by owner: Save auto-commits with a generated
  message (§4.1 updated to match). Q4 (Run Console scope) is now the only open item.
- **v0.2 (2026-07-15)** — Reconciliation pass: §8 Q2 extended (no rollback confirmation
  modal) and Q3's layout resolved, both via ux-flows.md; Q1 (auto-commit-on-save) and Q4
  (Run Console scope) remain genuinely open.
- **v0.1 (2026-07-15)** — Initial IA. Full sitemap (Library → Prompt Detail → Run/Evals/
  History tabs, plus Runs/Cost/Settings), screen inventory, seven user-perspective flows
  (including the two cross-surface ones — MCP and CI), non-visual-surface mapping for CLI/
  MCP, entity→screen matrix, and screen-state requirements. Four open IA-level questions
  flagged, none blocking.
