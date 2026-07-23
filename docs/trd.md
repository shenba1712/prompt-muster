# PromptMuster — Technical Requirements / Design Document

|                  |                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Status**       | 📝 Draft v0.2 — companion to [prd.md](prd.md) v0.2                                                                                  |
| **Owner**        | Shenbaga Srinivasan                                                                                                                 |
| **Created**      | 2026-07-15                                                                                                                          |
| **Last updated** | 2026-07-15                                                                                                                          |
| **Relationship** | Implements the direction in [prd.md](prd.md). Where this doc and the PRD disagree, the PRD wins on _what/why_; this doc owns _how_. |

---

## 0. Reader's note

This is a design doc, not an implementation spec. Per the project's own philosophy
(from the original project template, since removed from `templates/`): _"A project should never become
blocked because every architectural decision hasn't already been made. The document grows
alongside the implementation."_ So this fixes the **load-bearing contracts** — the ones
that are expensive to change later (the prompt file format, the storage boundary, the
provider-adapter interface) — and leaves the rest to be decided when the code is written.

Week-level sequencing lives in the backlog, not here. Anything marked **OPEN** is a
decision teed up in [§14](#14-open-technical-questions), not a settled choice.

---

## 1. Architecture overview

One **core library** holds all domain logic. Every interface is a thin shell over it.

```
                         ┌─────────────────────────────────────────┐
                         │            @promptmuster/core (TS)          │
                         │  parse · resolve vars · execute · eval · │
                         │  cost · storage · index                  │
                         └───────────────┬─────────────────────────┘
                                         │ imported directly (in-process)
        ┌────────────────┬───────────────┼────────────────┬──────────────────┐
        ▼                ▼               ▼                ▼                  ▼
   Web dashboard     MCP server        CLI           CI Action        (Team API)
   Next.js route     stdio server    Node bin      GitHub Action      NestJS — Phase 4
   handlers                                                            wraps core over HTTP
        │                │               │                │                  │
        ▼                ▼               ▼                ▼                  ▼
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │  Prompts + eval baselines: FILES (git)      Runs + logs: SQLite (local)       │
   │                                              Postgres (team, Phase 4)         │
   └─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                         Providers: OpenAI · Anthropic · Google (behind one adapter)
```

**The one decision everything follows from:** the core is a **plain TypeScript library with
no framework**. CLI and MCP server import it and run in-process against local files +
SQLite — **no daemon, no server required** for the developer-local case. That is what makes
"local-first" true rather than aspirational, and it's why the old plan's "NestJS + Postgres
CRUD API for a local-first app" was incoherent. NestJS earns its place at the **team tier**
(Phase 4), wrapping the same core over HTTP for multi-user/hosted mode — a more honest home
for it than the local path, and it still delivers the NestJS learning goal. _(Trade-off and
the alternative in [§14](#14-open-technical-questions).)_

---

## 2. Key architectural decisions

Decisions with real trade-offs. Each has become an ADR — see [../adr/](adr/README.md) (A1→ADR-001, A2→ADR-002, A3→ADR-003, A4→ADR-004, A5→ADR-005, A6→ADR-006, A7→ADR-007).

| #   | Decision                                                                                        | Why                                                                            | Trade-off accepted                                         |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| A1  | Core as a framework-free TS library                                                             | Local-first needs in-process access from CLI/MCP with no server                | Must design clean module boundaries by hand                |
| A2  | Prompts + eval baselines as **files**; runs/logs in **SQLite**                                  | Version history/diff/sharing = git for free; runs are relational & high-volume | Two storage models to reason about                         |
| A3  | **SQLite** local, **Postgres** team — behind one repository interface                           | A "runs on your machine" tool can't require a DB server                        | Repository abstraction has a cost; keep it thin            |
| A4  | Hand-built provider adapters (raw `fetch` first, official SDKs allowed after)                   | Learning goal: see the wire, SSE, retries; then productionize                  | Slower first adapter than reaching for an SDK              |
| A5  | Adopt/extend an existing prompt-file convention (**OPEN**, [§14](#14-open-technical-questions)) | Interop + credibility; format is a one-way door                                | Less freedom than a bespoke format                         |
| A6  | Models & pricing are **data**, not code (union types)                                           | Model IDs and prices drift monthly; snapshots must be pinnable                 | Migration from Week-1 union types (a planned, good lesson) |
| A7  | MCP server is **read + run**, ships before the eval runner                                      | Smallest pillar, starts the daily-use flywheel, timing window                  | Eval-in-IDE waits for a later phase                        |

---

## 3. Prompt file format _(the load-bearing contract)_

Most care goes here — once another tool or a teammate's repo depends on the shape, it can't
change freely. **Decided: adopt and extend Google's dotprompt**
([ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md)) rather than invent one;
the shape below is in that family, with PromptMuster's own additions namespaced under a
`promptmuster:` frontmatter block.

**Shape:** one file per prompt, YAML frontmatter + a role-tagged body. Example
`code-review.prompt.md`:

```yaml
---
schemaVersion: 1 # one-way door — present from day one
name: code-review-thorough
description: Strict review focused on correctness bugs
model:
  provider: anthropic
  id: claude-opus-4-8 # exact snapshot string, pinned (see §5.4)
  params: { temperature: 0.2, max_tokens: 2000 }
variables: # typed template variables (a.k.a. context slots)
  - { name: language, type: select, options: [typescript, python, go] }
  - { name: diff, type: file }
outputSchema: # OPTIONAL — JSON Schema; powers validation + rendering
  type: object
  properties: { issues: { type: array, items: { type: string } } }
  required: [issues]
  additionalProperties: false
---
system: |
  You are a senior engineer. Report only correctness bugs.
user: |
  Review this {{language}} diff:
  {{diff}}
```

**Design rules:**

- **Messages, not a string.** Body is a role-tagged array (`system`/`user`/`assistant`) —
  corrects the Week-1 `content: string` model. This must land **before** execution is built
  (cheapest moment; after execution it's a migration).
- **Templating is minimal `{{var}}` interpolation** for v1 — no conditionals/loops. Keeps
  the parser tiny and the format portable; escalate to a real templating lib only if a real
  need appears. _(OPEN-ish; lean minimal.)_
- **`outputSchema` is JSON Schema**, and it's the connective tissue: it drives structured-
  output requests, result validation/rendering, the eval "schema" assertion ([§6.2](#62-assertion-types)),
  and the linter's one mechanical check. Note provider JSON-Schema limits (no recursion, no
  numeric/length constraints, `additionalProperties:false` required) — validate the rest
  client-side.
- **`schemaVersion`** on every file; the parser refuses unknown major versions.

**Eval test cases live in a sibling file**, not inline — keeps prompt files clean and lets
baselines be committed separately (mirrors how test files sit beside source):

```
code-review.prompt.md          # the prompt
code-review.eval.yaml          # test cases: variable values + assertions
code-review.baseline.json      # committable last-known-good results (for CI diff)
```

---

## 4. Data & persistence

| Data                        | Store                                  | Rationale                                                            |
| --------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Prompts                     | Files (git)                            | Version history/diff/rollback/share = git                            |
| Eval test cases + baselines | Files (git)                            | Committable; CI compares against baseline                            |
| Execution runs / logs       | **SQLite** local                       | Relational, high-volume, queried by cost dashboard                   |
| Cache of eval results       | SQLite (or content-addressed files)    | Skip re-running unchanged cells ([§6.4](#64-cost-controls--caching)) |
| Config                      | `.promptmuster/config.*`               | Non-secret settings                                                  |
| **API keys**                | OS keychain / env — **never the repo** | Security ([§12](#12-security))                                       |
| Team mode                   | **Postgres** (Phase 4)                 | Multi-user; same schema via the repository interface                 |

**Repository interface (A3).** One storage interface; a SQLite implementation for local, a
Postgres implementation for team. This is both the learning artifact (Repository Pattern)
and the product need (swap the backend without touching domain logic).

**Runs schema (sketch):** `id, prompt_ref, prompt_git_sha, provider, model_snapshot,
input_tokens, output_tokens, cost_usd, latency_ms, status, created_at`. Pinning
`model_snapshot` + `prompt_git_sha` per run is what makes replay and regression comparison
meaningful ([§5.4](#54-token-counting--cost)).

**File-watching / git-branch behavior.** The dashboard/MCP index reacts to prompt files
changing on disk — including when a **git branch switch** swaps the library out. Initially
this is correctness (don't serve a stale index); by design it's also a feature — _a branch
is a prompt experiment_. Build the watcher knowing that's first-class, not a corner case.

---

## 5. Execution engine

### 5.1 Provider adapter interface

One interface, one implementation per provider (OpenAI, Anthropic, Google). Hand-built,
raw `fetch` for the first adapter to learn the wire + SSE (A4); official SDKs
(`@anthropic-ai/sdk`, `openai`, `@google/genai`) acceptable afterward.

```ts
interface ProviderAdapter {
  execute(req: ResolvedRequest): AsyncIterable<Chunk>; // streaming-first
  countTokens(req: ResolvedRequest): Promise<TokenCount>; // see §5.4
  price(usage: Usage, model: ModelSnapshot): number; // from the models table (A6)
}
```

### 5.2 Streaming

Async iterables internally; Server-Sent Events to the dashboard. All three providers stream
token-by-token; normalize their event shapes into one internal `Chunk`.

### 5.3 Reliability

Retry transient errors (429, 503) with **jittered exponential backoff**; fail fast on
400/401. (This is exactly the `retry`/backoff exercise already parked in
[../reference/idea-bank.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/idea-bank.md) — now load-bearing.)

### 5.4 Token counting & cost _(corrects an earlier imprecision)_

Accurate token counts are **per-provider**, and there is a real footgun:

- **OpenAI** — `tiktoken`, computed **locally** (instant, no network).
- **Anthropic** — a **token-counting API call** (`messages.count_tokens`); accurate,
  network. `tiktoken` is **wrong for Claude** — it undercounts by ~15–20% (more on code) —
  so it must **not** be used as a shortcut for the Claude count.
- **Google (Gemini)** — a `countTokens` call; accurate, network.

**Design consequence for cost preflight (PRD §6.4):** show an **instant local heuristic
estimate** while the user types (labeled _estimate_), and offer an **exact count on demand /
before run** via each provider's native method. Never present a heuristic as exact — the UI
labels it. Pricing comes from the models-as-data table (A6), keyed by exact snapshot.

**Model IDs are data (A6).** The Week-1 union (`gpt-4o | claude-sonnet | …` in
[../reference/key-desicions.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/key-desicions.md)) is stale and must migrate to
a table with `{provider, snapshotId, contextWindow, inputPrice, outputPrice}`. Current
examples to seed it: Anthropic `claude-opus-4-8` / `claude-sonnet-5` / `claude-haiku-4-5`
(the repo's `claude-sonnet`/`claude-haiku` strings are out of date). Store the **exact
snapshot** on every run, or replay/regression is meaningless.

---

## 6. Eval engine _(the differentiator)_

Attach test cases to a prompt → run across models → see pass/fail, cost, and **regression vs
a prior version**. See PRD §6.2.

### 6.1 Model

`TestCase = { variables, assertions[] }`. A run expands to a matrix of
`prompt-version × model × test-case → result`.

### 6.2 Assertion types

Pure functions where possible; the judge is the one async/LLM case.

| Type             | Impl                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| exact            | string compare (constrained outputs only)                            |
| contains / regex | substring / `RegExp`                                                 |
| schema           | validate against the prompt's `outputSchema` (JSON Schema via `ajv`) |
| property         | length / language / format / must-not-contain                        |
| **llm-judge**    | cheap model (e.g. `claude-haiku-4-5`) scores against a rubric        |

### 6.3 Determinism handling

LLM output is non-deterministic, so exact-match alone is useless and single-run "regressions"
may be noise. Support **repeat runs / pass@k** and **score thresholds** rather than exact
deltas. The **judge is itself a versioned prompt**, validated against a small human-labeled
**golden set**; document its known biases (verbosity, position, self-preference). Framing
stays honest: _evals are guidance, not proof._

### 6.4 Cost controls & caching

Evals spend real money every run — cost control is core, not polish.

- **Cache** keyed on `hash(CACHE_SCHEMA_VERSION + resolved messages + model + params +
input)`; re-run only changed cells. The version constant (added v0.2) lets any future
  change to what affects caching invalidate stale entries wholesale, instead of leaving
  silent collisions behind ([disaster-recovery.md §1.4](disaster-recovery.md)).
- **Budget cap** per run; estimate suite cost up front and **confirm** if over. Enforced
  **inside core** on every execution path — no client convention can bypass it
  ([threat-model.md P2](threat-model.md); added v0.2).
- **Bounded concurrency**: worker pool (`p-limit`-style) + per-provider rate limiting +
  backoff. (New learning surface that replaces the dropped IndexedDB/offline-sync lessons.)

### 6.5 Regression view

Diff two versions' results per model with a **cost delta**. This is what turns version
history from "what changed" into "did it get better" — evals + version history are one
feature.

### 6.6 Explicit v1 non-goal

**Single-turn only** (multi-message _context_ is fine). Evaluating multi-turn / agentic /
tool-calling flows is deferred in writing — it's a research-grade problem and a scope sink.

---

## 7. MCP server _(ships first — flywheel)_

- Built on the **MCP TypeScript SDK**; runs as a local **stdio** server, registered in
  Claude Code / Cursor / Claude Desktop config.
- Imports core directly → same file index + SQLite as everything else.
- **Tools (v1):** `list_prompts`, `get_prompt`, `run_prompt`. (`eval_prompt` later.)
- **Read needs no backend** — `list`/`get` can serve straight from files, so a degraded
  useful slice ships very early.
- **Security:** `run_prompt` spends money and is a prompt-injection surface → confirm before
  executing; prompts sourced from outside the user's own library are flagged/untrusted
  ([§12](#12-security)).

Config the user adds (illustrative):

```json
{
  "mcpServers": {
    "PromptMuster": { "command": "PromptMuster", "args": ["mcp"] }
  }
}
```

---

## 8. CLI

Node bin over core. Commands: `promptmuster run <name> --model … --var k=v`, `list`, `search`,
`eval <name>`, `export`, `import`, `mcp` (starts the stdio server). Arg parsing via
`commander` (or a build-your-own parser as a learning exercise). npm-publishable (`npx
PromptMuster`).

## 9. Web dashboard

Next.js App Router (the Week 1–3 work). **Route handlers / server actions import core
directly** for local mode — no separate API tier until Phase 4. shadcn/ui + Tailwind for UI;
variable forms generated from the prompt's `variables` via **React Hook Form + Zod** (the
Week-2 Thursday spike). Streams results via a route handler `ReadableStream`. Because these route handlers can
trigger spend, they are a CSRF/DNS-rebinding surface: bind to `127.0.0.1` only and
validate `Origin`/`Host` on every state-changing handler — a **Phase 1 requirement**, not
polish ([threat-model.md T4](threat-model.md); NFR-09; added v0.2). In Phase 4 the
dashboard is also the surface non-technical teammates use (PRD Ring 2).

> **Convention conflict to resolve:** [../core/CLAUDE.md](../CLAUDE.md) currently
> mandates _CSS Modules, no Tailwind_. shadcn/ui brings Tailwind, so that rule is superseded
> the moment shadcn lands (Week 2 Friday). Update CLAUDE.md then, or the guidance contradicts
> the stack.

## 10. CI GitHub Action

A JS/composite Action that runs `promptmuster eval` on changed prompts, compares to the
committed `*.baseline.json`, comments results on the PR, and fails on regressions beyond a
threshold. Reuses the CLI/core. **This replaces the old auto-PR-reviewer webhook** (#32–34) —
same webhook/CI learning, on-thesis, and not a second crowded product.

---

## 11. Cross-cutting

- **Config & secrets:** keys via OS keychain (`keytar`-style) or env; config in `.promptmuster/`.
  Repo scaffold ships a `.gitignore` excluding keys, run logs, and eval fixtures by default.
- **Error model:** typed results over thrown exceptions at provider boundaries (the `Result<T,E>`
  exercise in the idea bank is the natural fit); redact secrets from all logs/errors.
- **Observability:** structured run logs are a _product feature_ (the cost dashboard reads
  them), so this comes largely for free.
- **Run lifecycle (added v0.2):** on startup, core reconciles orphaned rows — any run still
  `streaming`/`running` from a dead process transitions to **`interrupted`** (distinct from
  `failed`: unknown outcome, not a known error; [disaster-recovery.md §1.3](disaster-recovery.md)).
- **Testing:** Vitest (chosen Week 2). Pure functions (assertions, parser, cost, template
  interpolation) are unit-tested; adapters tested against recorded fixtures; the eval engine
  gets a deterministic fake provider.

## 12. Security

- **Prompt injection via shared prompts.** Once prompts sync via git, a teammate's or a
  public repo's prompt file is **untrusted input** that an IDE agent would execute with the
  user's keys. Mitigation: prompts originating outside the user's own library are
  flagged; executing one (via MCP `run_prompt`, CLI, or dashboard) requires **explicit
  confirmation**. Silver lining — _"review prompts in PRs like code"_ becomes a selling point
  of the file model.
- **API keys:** keychain/env only, never in the repo, redacted from logs.
- **Secret capture (added v0.2):** variable values are scanned against credential patterns
  with a **warn-before-run** — run history persists exactly what was sent, making local
  SQLite quietly sensitive at rest (`0600` perms; a `runs purge` command planned;
  [threat-model.md T3](threat-model.md), NFR-10).
- **Fixtures/results:** eval inputs and logged outputs may contain proprietary code or PII →
  gitignored by default (default-safe beats documented-safe).
- **Team/hosted (Phase 4):** auth + access control — detailed later, out of scope for v1.

## 13. Tech stack & dependencies

| Layer            | Choice                                                                   | Justification / learning tension                                                                      |
| ---------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Language/runtime | TypeScript (strict), Node 18+                                            | Company stack; matches CLAUDE.md conventions                                                          |
| Core             | Framework-free TS lib                                                    | A1                                                                                                    |
| Parsing          | `gray-matter` + `yaml`; JSON Schema via `ajv`                            | Standard, small                                                                                       |
| Templating       | minimal `{{var}}` (build-your-own)                                       | Learning + portability; escalate only if needed                                                       |
| Local store      | `better-sqlite3` (sync API suits CLI)                                    | Zero-daemon; simple. ✅ Decided 2026-07-16 ([ADR-008](adr/ADR-008-better-sqlite3-thin-repository.md)) |
| Team store       | Postgres (Prisma or TypeORM)                                             | Phase 4; company stack                                                                                |
| Providers        | raw `fetch` first, then `@anthropic-ai/sdk` / `openai` / `@google/genai` | A4 — learn the wire, then productionize                                                               |
| MCP              | MCP TypeScript SDK                                                       | Standard for building an MCP server                                                                   |
| Validation       | Zod                                                                      | Week-2 plan; RHF integration for forms                                                                |
| CLI              | `commander` (or hand-rolled)                                             | Small; hand-rolled optional exercise                                                                  |
| Web              | Next.js, React, shadcn/ui, Tailwind, RHF+Zod                             | Company stack + Week 1–3 work                                                                         |
| Test             | Vitest                                                                   | Week-2 choice                                                                                         |
| Package/deploy   | npm (core+CLI+MCP), Docker (team), Vercel (demo)                         | PRD phases                                                                                            |

Dependency rule stays aligned with CLAUDE.md: _don't add libraries not justified by the
current phase._ Each new dep gets a one-line reason in the PR.

## 14. Open technical questions

Teed up for decisions/ADRs; none block Phase 1 coding.

1. **Prompt file format** — ✅ **Resolved 2026-07-16: adopt and extend dotprompt**
   ([ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md)) — mature
   cross-language tooling (incl. JetBrains + VS Code plugins, tree-sitter), while Prompty
   v2's format is explicitly in alpha and GitHub's `.prompt.yml` has the worst authoring
   ergonomics of the three. PromptMuster's `schemaVersion` + typed variable kinds live in a
   namespaced `promptmuster:` frontmatter block.
2. **Local store driver** — ✅ **Resolved 2026-07-16: `better-sqlite3` + thin hand-rolled
   repository** ([ADR-008](adr/ADR-008-better-sqlite3-thin-repository.md)). Prisma is
   reconsidered only if/when the Phase-4 Postgres tier makes it earn its weight.
3. **NestJS placement** — team-tier only (recommended: keeps the local path serverless) vs.
   introduce earlier as a local execution service for NestJS practice (adds a process/hop to
   a local tool). Product-vs-learning trade; PRD §3.3 rule says product wins for user-facing
   latency, so team-tier.
4. **Templating power** — minimal interpolation (recommended) vs. a real templating engine.
   Defer until a prompt actually needs logic.
5. **Eval result cache location** — SQLite rows vs. content-addressed files (committable).
   Committable baselines are already files (§3); decide whether the _cache_ is too.

## 15. Sequencing

Phase mapping is the PRD's ([prd.md §9](prd.md)); week-level detail is the backlog's. The
only near-term, order-sensitive technical items:

1. **Fix the domain model** (messages array + typed vars + params + `schemaVersion`) **before
   execution** — Week 3–4.
2. **Week 5 fork:** files-on-disk (this direction) vs. the old plan's IndexedDB — the first
   real divergence, and the moment to resolve open questions 1 and 2.

---

## Changelog

- **v0.5 (2026-07-16)** — PromptLab→PromptMuster rename propagated: prose, the
  `@promptmuster/*` npm scope, CLI verbs, `.promptmuster/` config dir, and the
  `promptmuster:` frontmatter namespace all lowercased/updated. No design changes.
- **v0.4 (2026-07-16)** — §14 Q1 resolved: dotprompt confirmed as the prompt file format
  (ADR-005 flipped to Accepted). §3 updated from "final choice OPEN" to decided.
- **v0.3 (2026-07-16)** — Decisions: §14 Q2 resolved (better-sqlite3 + thin repository,
  ADR-008); Q1's recommendation sharpened to dotprompt after checking the live specs
  (Prompty v2 in alpha), pick pending.
- **v0.2 (2026-07-15)** — Reconciliation pass. §9: localhost origin-validation is a Phase 1
  requirement (threat-model T4). §6.4: `CACHE_SCHEMA_VERSION` in the cache key
  (disaster-recovery §1.4); budget cap explicitly enforced in core (threat-model P2). §11:
  startup run-lifecycle reconciliation with new `interrupted` status (disaster-recovery
  §1.3). §12: secret-capture warn-before-run (threat-model T3). §2: A1–A7 now map to
  written ADRs; broken `templates/` links fixed (directory was deleted).
- **v0.1 (2026-07-15)** — Initial draft. Core-library-first architecture; file-based prompts
  - SQLite runs; provider-adapter, eval-engine, and MCP designs; corrected token-counting
    approach (per-provider; `tiktoken` is OpenAI-only and wrong for Claude). Not yet reconciled
    with CLAUDE.md (CSS-Modules-vs-Tailwind) or the Week-1 model-union domain type.
