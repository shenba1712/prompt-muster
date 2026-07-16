# PromptMuster — Product Requirements Document

> **Name:** PromptMuster (decided 2026-07-16; npm package `promptmuster`, GitHub org free).
> The Weeks 1–2 code was built under the earlier name **PromptLab**; its GitHub repo has
> since been renamed `promptlab` → `prompt-muster` (GitHub auto-redirects old URLs), with
> the Apache-2.0 LICENSE added. See [Open Decisions](#open-decisions) #1.

| | |
|---|---|
| **Status** | 📝 Draft v0.7 — all 8 open decisions closed 2026-07-16 (name: PromptMuster; format: dotprompt/ADR-005 were the last two). Backlog re-cut + ticket board done 2026-07-16; PromptLab→PromptMuster rename propagated through the doc set. See [../core/backlog.md](core/backlog.md), [../core/tickets.md](core/tickets.md). |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-07-15 |
| **Last updated** | 2026-07-16 |
| **Supersedes** | The "Postman for prompts" workbench framing in [readme.md](../README.md) and the 43-feature list in [../core/backlog.md](core/backlog.md) |

---

## 0. Reader's note — what this document is and isn't

This is a real PRD for a real product, but PromptMuster is **also** a 9–10 month learning
and portfolio project built solo at ~75 min/day. Those two mandates mostly agree; where
they conflict, this document says which one wins and why. Pretending it is a funded
startup would produce bad decisions (over-investing in market features); pretending it is
only a learning toy would waste the genuine product opportunity. It is both, on purpose.

Detailed week-by-week sequencing lives in the backlog, not here. This document defines
**what** we are building, **for whom**, **why**, and **what success looks like**. The
re-cut backlog and the technical design docs are companion documents (see
[§12](#12-companion-documents)).

---

## 1. TL;DR

PromptMuster is a **git-native prompt engineering toolkit**: your prompts live as files in a
repository, get **tested like code** against expected outputs, are **measured for cost**
before and after every run, and are **available inside your IDE** through an MCP server.

The one-liner:

> **Your prompts as files in git — tested like code, measured for cost, and available where you work.**

It is developer-first and local-first. Nothing runs on someone else's server unless the
user explicitly opts in. The unit of value is not a marketplace listing or a shared
community feed — it is *your own, tested, versioned prompt library*, portable across the
tools you already use.

---

## 2. Background & problem

Engineers now depend on LLM prompts as production artifacts, but treat them worse than
they treat any other code:

- **Prompts are scattered** across chat histories, Notion pages, and stray text files.
- **Editing a prompt is flying blind.** There is no way to know whether a change made
  outputs better or worse — only a vibe check on the next manual run.
- **Cost is invisible.** No one sees token count or price before spending, or tracks
  spend over time across models.
- **Good prompts die in individual heads.** Nothing captures or shares the prompt that
  actually works.
- **Prompts don't travel.** The prompt you refined in a chat window isn't reachable from
  your IDE, your terminal, or your CI pipeline.

The category has moved. "A place to store prompts" was the 2023 problem and is now table
stakes — the LLM vendors' own consoles do it. The *live* 2026 problem is **"I changed my
prompt; is it better or worse, on which model, at what cost?"** That is an evaluation and
observability problem, and it is where PromptMuster plays.

---

## 3. Goals & non-goals

### 3.1 Product goals

1. Make a prompt a **first-class engineering artifact**: a file, versioned in git, with a
   defined schema.
2. Let a user **test a prompt against expected outputs** and see regressions between
   versions and across models.
3. Give **cost and token visibility** before (preflight) and after (tracking) every run.
4. Make the prompt library **reachable from the IDE** via MCP, so it is used daily without
   context-switching.
5. Stay **local-first and private by default**; opt-in only for anything that leaves the
   machine.

### 3.2 Learning / career goals (the second mandate)

1. Exercise the company stack (React, Next.js, TypeScript, NestJS) on a non-trivial domain.
2. Produce senior/staff-level **interview stories**: testing non-deterministic systems,
   provider abstraction, MCP protocol design, cost-aware architecture, prompt-injection
   trust boundaries.
3. Be a portfolio centerpiece with a **live demo and an open-source repository** people can
   actually find and use.

### 3.3 Conflict resolution rule

When a product need and a learning need disagree, **the product need wins for anything a
user touches** (correctness, cost safety, the daily-use loop), and **the learning need
wins for internal construction** (build the provider adapter by hand rather than pulling a
library, even if a library would ship faster). Every such trade is recorded in an ADR.

### 3.4 Non-goals (v1) — explicit

These are **out of scope for the first year** and saying so is a feature, not an omission:

- **Not a prompt marketplace** (that's PromptBase) — no buying, selling, or listings.
- **Not a public community feed** (that's FlowGPT) — sharing is opt-in and repo-based.
- **Not a non-developer / no-code tool first** — see the ring model in [§4](#4-target-users).
- **Not multi-tenant SaaS** — no accounts, billing, or hosted user data in v1.
- **Not an agent framework** — evaluating multi-turn/agentic/tool-calling flows is
  deferred; v1 evaluates single-turn prompts (with multi-message context).
- **Not semantic search / embeddings** in early tiers — full-text is enough for a personal
  library; embeddings are optional dessert, not a pillar.

---

## 4. Target users

Audience expands in concentric **rings**. We build ring-by-ring; each ring's success earns
the next. Skipping ahead would put us in the crowded space we are deliberately avoiding.

| Ring | Who | How they touch it | When |
|---|---|---|---|
| **0** | **Me** | Daily, inside Claude Code / Cursor, via MCP + CLI | Now → always |
| **1** | **Individual developers** | Open source: files, CLI, MCP, IDE, CI | Phases 1–3 |
| **2** | **Engineering teams** (incl. non-technical members: PMs, support, marketing) | Devs set up the prompt repo; non-devs consume via the **web dashboard** — fill variables, run, compare, watch cost. They never touch git. | Phase 4 |
| **3** | **Prosumer / no-code operators** | Hosted, standalone. A *different business* — only if Ring 2 wins. | Future / maybe |

**On "why leave non-developers out":** we don't — we sequence them. The differentiation
is *where the product lives* (files, git, IDE, CLI). Non-devs have none of those, so
serving them on day one forces a hosted, accounted, supported web app — exactly the
crowded space (Langfuse, PromptLayer, vendor consoles) we are stepping away from. The
proven crossover pattern is developer-created, team-consumed (Postman, GitHub): the
engineer builds the library; colleagues consume it through the dashboard we are building
anyway. That dashboard is Ring 2's on-ramp *and* the seam where monetization lives.

### 4.1 Primary personas

- **Priya, the daily driver (Ring 0/1).** Ships features with AI assistance. Wants her
  code-review and refactor prompts one keystroke away in her IDE, and wants to know a
  prompt tweak didn't quietly regress. *Success:* she reaches for PromptMuster without
  thinking.
- **Sam, the team lead (Ring 2).** Owns a shared prompt repo for the team. Wants prompt
  changes reviewed in PRs like code, evals run in CI, and cost visible per prompt.
- **Maya, the PM (Ring 2, non-technical).** Needs to run the team's approved prompts with
  her own inputs and compare model outputs — through the dashboard, never the terminal.

---

## 5. Product principles

1. **Files first.** The source of truth is a file in a repo, not a row in a hosted DB.
   Version history is `git log`; sharing is `git push`; diffing is `git diff`.
2. **Local by default, opt-in to leave.** Prompts, keys, and results stay on the machine
   unless the user explicitly syncs or hosts.
3. **Honest by default.** Cross-model token counts are estimates and are labeled as such.
   Evals are guidance, not proof. The tool never implies more certainty than it has.
4. **Useful before complete.** The measure of a milestone is "do I use it," not "did I
   finish the tier." The daily-use flywheel is the project's success condition.
5. **Interop over lock-in.** Prefer emerging open prompt-file conventions over a bespoke
   format; a prompt should be portable out of PromptMuster as easily as in.
6. **Safe with other people's prompts.** A shared prompt is untrusted input. Executing one
   is a deliberate, reviewable act.

---

## 6. The product — pillars

One **foundation** and three **pillars**, with a **dashboard** as the human surface.

### 6.0 Foundation — prompts as files

The single most important design decision. Each prompt is a human-readable file
(markdown-with-frontmatter or YAML) containing:

- **Messages** — a role-tagged array (system / user / assistant), *not* a single content
  string. This is a correction of the Week 1 model and must land before execution is built.
- **Typed variables** (a.k.a. context slots) — `{{name}}` with a declared type
  (text / multiline / select / file) and optional default.
- **Model parameters** — model, temperature, max tokens, etc., as data.
- **Output schema** (optional) — an expected JSON shape. Powers structured-output
  validation, richer result rendering, and the linter's one genuinely mechanical check.
- **`schema_version`** — the file format is a one-way door once others adopt it.

Because prompts are files, five would-be features collapse into git for free: version
history, diffs, rollback, export/import, and repo-based team sharing.

### 6.1 Pillar 1 — MCP server *(the distribution channel and the flywheel)*

Expose the prompt library as MCP tools so prompts are retrievable and runnable from Claude
Code, Cursor, and Claude Desktop. Example: *"Run my `thorough-code-review` prompt on this
file."* The IDE agent fetches the prompt, fills context, executes.

Why it leads: it is the smallest pillar, it is the demo moment, it is the only
differentiator with a real timing window, and — critically — it is what makes the tool
part of the daily loop, which is the project's whole survival condition. Claude Desktop
speaks MCP, so this is also a quiet on-ramp for semi-technical users later at no extra
build cost.

*Note:* IDE agents already ship a primitive version of "prompt files in a repo" (Claude
Code slash commands/skills). What PromptMuster adds on top is cross-tool portability, evals,
cost tracking, and multi-model execution — not storage. This sharpens the pitch; it does
not undercut it.

### 6.2 Pillar 2 — Eval runner *(the reason people consider the tool)*

Attach test cases to a prompt; edit the prompt; re-run the suite; see what regressed and
what it cost. This is the feature no saved-prompts manager has, and it is the strongest
interview story available.

**Assertion types** (LLM outputs are non-deterministic, so exact match alone is useless):

| Type | Use |
|---|---|
| Exact match | Tightly constrained outputs only ("reply yes/no") |
| Contains / regex | "must mention the null check" |
| Schema validation | "parses as JSON matching the declared output schema" |
| Property checks | length, language, format, must-not-contain |
| **LLM-as-judge** | A cheap model scores against a rubric — for the fuzzy majority |

**Requirements that make evals trustworthy (not optional polish):**

- **Regression view** — diff results between two prompt versions, per model, with cost
  delta. This is what turns version history from "what changed" into "did it get better."
- **Cost controls** — cache results keyed on (prompt + variables + model + params); re-run
  only what changed; per-run budget caps; cheap models as judges. Evals spend real money
  every run.
- **Determinism handling** — repeat runs / pass@k and score thresholds instead of exact
  deltas, so noise isn't reported as regression.
- **Judge integrity** — the judge prompt is itself versioned and validated against a small
  human-labeled golden set; known biases (verbosity, position, self-preference) documented.
- **Snapshot pinning** — every result records the exact model snapshot ID and pricing at
  run time, or cross-version comparison is meaningless.

### 6.3 Pillar 3 — Web dashboard *(the human surface, and Ring 2's door)*

The Week 1–3 Next.js work becomes the local dashboard, not the product's center: browse
the library, fill variables via generated forms, run prompts, compare models side by side,
and watch cost. In Ring 2 this is how non-technical teammates consume the repo without
touching git.

### 6.4 Cross-cutting capabilities

- **Multi-provider execution** with streaming (OpenAI, Anthropic, Google) behind a
  hand-built adapter.
- **Cost preflight + tracking** — token count and price *before* running (labeled estimate
  for non-OpenAI), spend history after.
- **CLI** — `promptmuster run`, `list`, `eval`, `export` for terminal and scripting.
- **CI GitHub Action** — run prompt evals on every PR and comment results. (This replaces
  the old auto-PR-*reviewer* webhook idea, which was a separate crowded product; the CI
  learning is retained, on-thesis.)

---

## 7. Functional requirements

Priorities: **P0** = required for the pillar to be real; **P1** = strongly wanted; **P2** =
nice-to-have. Phase mapping in [§9](#9-release-phases).

### 7.1 Prompt library (foundation)
- **P0** Prompts stored as files with the schema in [§6.0](#60-foundation--prompts-as-files).
- **P0** Create / read / update / delete via dashboard and CLI. *(CRUD exists; extend to file-backed, multi-message.)*
- **P0** Typed template variables with dynamic form generation on the dashboard.
- **P0** Full-text search + filter by model / category / tag / favorite. *(Done in Week 1.)*
- **P1** Optional declared output schema per prompt.
- **P1** First-run setup recommends connecting a private git remote — framed as
  **backup/disaster recovery**, not sharing ([disaster-recovery.md §1.2](disaster-recovery.md);
  added v0.2).
- **P2** Duplicate-on-save warning (string-similarity; embeddings-based only much later).

### 7.2 Execution
- **P0** Execute a prompt against one provider; render result.
- **P0** Multi-provider execution; user picks model per run.
- **P0** Streaming responses.
- **P0** API keys read from OS keychain / env — **never** stored in the prompt repo.
- **P1** Multi-model side-by-side comparison (output, latency, cost).
- **P1** Pre-execution token count + cost estimate, per candidate model.

### 7.3 Evaluation
- **P0** Attach test cases (variable values + assertions) to a prompt.
- **P0** Assertion types: exact, contains/regex, schema, property.
- **P0** LLM-as-judge assertion with a rubric.
- **P0** Run a suite across one or more models; summarize pass/fail + cost.
- **P0** Result caching keyed on (prompt+vars+model+params); budget cap per run.
- **P1** Regression view: diff two versions' results with cost delta.
- **P1** Repeat runs / thresholds for determinism tolerance.
- **P1** Committable eval baselines (files) for CI comparison.
- **P2** Judge golden-set validation harness.

### 7.4 Cost & observability
- **P0** Log every execution: model snapshot, tokens in/out, latency, cost, timestamp.
- **P1** Cost dashboard: per prompt, per model, over time; monthly projection.
- **P2** Post-run quality rating feeding model recommendations.

### 7.5 Interfaces
- **P0** MCP server: list prompts, get a prompt, run a prompt (read + execute).
- **P0** Web dashboard (local).
- **P1** CLI.
- **P1** CI GitHub Action running evals on PRs.
- **P2** Export/import as JSON/YAML with schema versioning *(mostly free via files)*.

### 7.6 Sharing / team *(Ring 2)*
- **P1** Repo-based sharing (a shared prompt repo; no server).
- **P2** Dashboard tuned for non-technical consumers.
- **P2** Optional hosted/team backend (Postgres) — the monetization seam.

---

## 8. Non-functional requirements

- **Privacy:** local-first; no prompt/key/result leaves the machine without explicit
  opt-in. Repo scaffold ships a `.gitignore` excluding keys, results, and fixtures by
  default (fixtures and logged outputs may contain proprietary code or PII).
- **Security — prompt injection:** prompts originating outside the user's own library are
  untrusted. Executing an externally-sourced prompt (shared repo, public) requires an
  explicit confirmation; MCP run-tools confirm before executing. "Review prompts in PRs
  like code" is a selling point of the file model.
- **Security — secrets:** keys in OS keychain/env only; redacted from logs and error output.
- **Security — local dashboard (added v0.2):** state-changing route handlers bind to
  `127.0.0.1` and validate `Origin`/`Host` — a hostile webpage must not be able to trigger
  money-spending runs on localhost ([threat-model.md T4](threat-model.md)). Phase 1.
- **Security — secret capture (added v0.2):** variable values are scanned against
  credential patterns with a warn-before-run, since run history persists what was sent
  ([threat-model.md T3](threat-model.md)).
- **Persistence:** SQLite for local runs/logs (a "runs on your machine" tool cannot require
  a DB server); prompts and eval baselines as files; Postgres only as the optional team
  backend. *(This is the deliberate resolution of the "learn Postgres" goal vs. the
  local-first product need — Postgres moves to the team tier.)*
- **Reproducibility:** model snapshot IDs and pricing pinned per result.
- **Cost safety:** no eval or batch run can exceed a configured budget without confirmation.
- **Performance:** eval concurrency is bounded (worker pool + rate limiting + backoff);
  streaming UI stays responsive.
- **Reliability:** provider calls retry on transient errors (429/503) with jittered
  backoff; hard-fail on 400/401.

---

## 9. Release phases

Coarse phasing only; week-level detail lives in the backlog. Each phase is independently
demoable and portfolio-worthy.

| Phase | Theme | Ships | Ring |
|---|---|---|---|
| **0 — Prototype** *(done / in progress)* | Local prompt manager | CRUD, filter, search, tests, shadcn UI | 0 |
| **1 — Useful to me** | Files + execution + IDE | File format, multi-message model, single→multi-provider execution, streaming, cost preflight, **MCP server (read+run)** | 0 |
| **2 — Trustworthy** | Evals | Assertions + judge, suite runner, cost caps/caching, regression view, output schemas, git-backed versions | 1 |
| **3 — Shareable** | Public dev tool | CLI, export/import, **CI eval Action**, dashboard compare/cost views, OSS launch + live demo | 1 |
| **4 — Team** | Ring 2 | Shared-repo workflows, dashboard for non-tech consumers, optional Postgres/hosted, access controls — monetization seam | 2 |
| **Future** | Maybe | Multi-turn/agentic evals, embeddings/semantic search, prosumer hosted, marketplace | 3 |

**Ordering call:** MCP (Phase 1) leads evals (Phase 2). MCP is smaller, starts the
dogfooding flywheel, and evals matter more once the library is used daily. This is a
recommendation open to reversal — see [Open Decisions](#open-decisions).

---

## 10. Success metrics

Framed for a solo portfolio project, not a funded startup — so the primary metric is
personal use, not MRR.

**Tier 1 — the flywheel (the real success condition):**
- I use PromptMuster (via MCP/CLI) on ≥ 4 days/week by end of Phase 1, without forcing it.
- I have ≥ 10 of my own prompts with eval suites by end of Phase 2.
- *Leading indicator of failure:* if I'm not reaching for it by ~Phase 2, stop and ask why
  rather than pushing on.

**Tier 2 — external signal (validates "people would consider it"):**
- OSS repo public with a README + demo GIF by end of Phase 3.
- Listed in the MCP registry/directory.
- ≥ 1 person who isn't me installs and runs it; ≥ 1 unsolicited question or issue.

**Tier 3 — career (the second mandate):**
- Live demo link on the résumé.
- Three defensible interview stories written up (evals on non-deterministic systems; MCP
  design; cost-aware/local-first architecture).
- Internal pilot pitched at work once Phase 2+ exists.

Monetization is explicitly **not** a v1 metric. The open-core path (OSS core → paid team
layer) is kept *possible* by the architecture, not pursued now.

---

## 11. Risks & open decisions

### 11.1 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Flywheel never starts** (I don't use it) | Fatal — the whole thesis | MCP-first so it's in the daily loop early; measure use weekly; time-box dashboard polish |
| **File format is a one-way door** | High — breaks users on change | `schema_version` from day one; prefer an existing convention |
| **IDE agents already do a basic version** | Medium — muddies the pitch | Compete on evals+cost+portability, not storage |
| **Direct competitors exist** (promptfoo, Prompt Assay, PromptLayer — live checks 2026-07-16) | Medium — lowers the Tier-2 ceiling; touches nothing in Tier 1/3 (§10) | Launch narrative is "why I built my own," positioned honestly next to the field; compete on the unoccupied combination (local-first + git-native files + MCP-in-IDE); Tier-1 flywheel and Tier-3 career metrics don't depend on market whitespace |
| **Evals cost real money / flake** | Medium — erodes trust & budget | Caching, budget caps, cheap judges, pass@k, honest "guidance not proof" framing |
| **Employer IP claim on a side project** | High — could void ownership | Resolve *before* first public commit (see below) |
| **Solo bandwidth at 75 min/day** | Ongoing | Phases are independently shippable; depth over speed; cut Ring 3/team early if needed |
| **Scope creep into agent-eval research** | Medium | v1 non-goal, stated in writing |

### 11.2 Open decisions

These are teed up here for a decision; none block starting Phase 1.

Owner reviewed the batch 2026-07-16. All six now decided:

1. **Product name — ✅ DECIDED 2026-07-16: PromptMuster** (npm free, GitHub org free,
   checked live). The double meaning is the product: a *muster* is a roll-call/assembly
   (the prompt library) and "pass muster" is the eval — "does it pass muster?" is
   literally the question the eval runner answers. Keeps "prompt" in the name for
   discoverability.

   Passed over, with reasons — first shortlist: **PromptProof** ⭐ (free; named the
   thesis directly, but phonetically close to **promptfoo**, a real competitor);
   Prooflab (free; smallest migration but doesn't contain "prompt"); PromptGauge (free;
   undersells *testing*, chronically misspelled); PromptCI (free; too narrow — one
   surface, not the product). Second round (test/trial idioms): PromptAssay (npm free
   but **promptassay.ai is a live commercial near-clone** — worst collision found);
   Mettle (actively-maintained npm UI library); Verdict (existing LLM-as-judge
   framework); Paces (npm free but a YC-funded AI company owns paces.com); Crucible /
   Gauntlet / Muster / Wringer / Shakedown bare (all npm-squatted by dead packages);
   PromptWringer + PromptGauntlet (both free — runners-up, PromptGauntlet also brushes
   the Gauntlet AI bootcamp brand). Dismissed early: PromptVault (signals *storage* —
   the positioning this PRD moved away from).

   The Weeks 1–2 code was built under the earlier name **PromptLab**; its GitHub repo has
   since been renamed `promptlab` → `prompt-muster` (GitHub auto-redirects old URLs), the
   npm package name set to `promptmuster`, and the Apache-2.0 LICENSE (decision #3) added —
   all in place on the existing repo, not at a future repo-creation event. Renaming away
   from "PromptLab" also retires its collision with IBM watsonx's "Prompt Lab" feature.

2. **File format — ✅ DECIDED 2026-07-16: dotprompt (`.prompt`)**, options pitched against
   the live specs, not memory. Apache-2.0, and its shape
   (YAML frontmatter + Handlebars body with `{{role "system"}}` markers) is close to what
   [trd.md §3](trd.md) sketched independently. The deciding factor is ecosystem depth:
   core libraries in JS/TS/Python/Go/Rust/Java, VS Code *and* JetBrains plugins, a
   tree-sitter grammar, and Monaco/CodeMirror editor modes — meaning PromptMuster's own
   dashboard editor gets syntax highlighting close to free. Our extras (typed UI variable
   kinds, `schemaVersion`) fit in a namespaced `promptmuster:` frontmatter block other
   dotprompt tooling just ignores. Alternatives and why not: **Prompty** (Microsoft) was
   the earlier lean, but its own README now states v2's format is explicitly alpha and
   subject to change — adopting a format mid-redesign recreates the one-way-door risk
   adoption was supposed to avoid; revisit once it stabilizes. **GitHub Models
   `.prompt.yml`** is the only one with eval data built in, philosophically closest to our
   eval-first thesis, but pure-YAML makes prompt bodies (our longest, most-read content)
   live inside YAML block scalars — worst authoring ergonomics of the three; better as a
   Phase-3 import/export target than the native format. **Bespoke** rejected per ADR-005's
   own reasoning — our deltas from dotprompt are two frontmatter keys, not enough to
   justify owning a spec forever. [ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md)
   is now Accepted — compliance-matrix.md D1 is unblocked.
3. **License — ✅ DECIDED 2026-07-16: Apache-2.0** (patent grant, open-core-friendly).
   LICENSE file added to the `prompt-muster` repo, in the same pass as the rename (#1).
4. **Employer IP — ✅ STRATEGY DECIDED 2026-07-16: the repo stays private** through the
   build phase, which defers public exposure. The written employer OK is still required
   **before the repo goes public** (now a Phase-3 launch gate, paired with #6). Private
   work reduces but doesn't legally erase IP-assignment exposure — keep it on personal
   time and equipment.
5. **Phase ordering — ✅ DECIDED** (settled earlier): MCP-first —
   [ADR-007](adr/ADR-007-mcp-before-eval-engine.md).
6. **Build-in-public timing — ✅ DECIDED 2026-07-16: private until there's real progress
   to show.** Target the Phase 2→3 boundary (working MCP server + eval runner — the demo
   that makes opening worth it), progress-driven rather than calendar-driven. Combined
   gate with #4: employer OK first, then open.

---

## 12. Companion documents

This PRD is the first of a set. Planned/related:

- **Backlog re-cut** — [../core/backlog.md](core/backlog.md), re-tiered around these
  phases, preserving the prerequisite / "teaches" discipline so weekly generation keeps
  working. *(Done 2026-07-16 — the DIRECTION CHANGE banner is gone.)*
- **Ticket board** — [../core/tickets.md](core/tickets.md): every backlog feature cut
  into 1–5 SP tickets with a dependency spine *(done 2026-07-16).*
- **Technical design / architecture doc** — [trd.md](trd.md): file format spec, provider
  adapter, eval engine, MCP server, persistence.
- **ADRs** — *written:* [../adr/](adr/README.md), ADR-001…ADR-008, all Accepted.
- **Reconciliation** — *2026-07-15:* [readme.md](../README.md) rewritten,
  [../core/preset.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/core/preset.md) §3.1 updated, `core/CLAUDE.md` carries
  scheduled-change notes. *2026-07-16:* backlog re-cut landed; the PromptLab→PromptMuster
  rename was propagated through the doc set.

---

## Changelog

- **v0.7 (2026-07-16)** — PromptLab→PromptMuster rename propagated through the doc set
  (title, prose, and technical identifiers: `@promptmuster/*` npm scope, CLI verbs,
  `.promptmuster/` config dir, the `promptmuster:` frontmatter namespace). Corrected the
  historical anchors the bulk rename would otherwise have lost — the `promptlab` repo slug,
  the "built under the earlier name PromptLab" origin, and the PromptLab↔IBM "Prompt Lab"
  collision. §12 refreshed: backlog re-cut marked done (not pending), ticket board added.
- **v0.6 (2026-07-16)** — Product name decided: **PromptMuster** (npm + GitHub org free;
  full passed-over list recorded in §11.2 #1). No open decisions remain. *(Superseded by
  v0.7 on the rename mechanics: it lands in place on the existing `promptlab` repo, not at
  a future repo-creation event.)*
- **v0.5 (2026-07-16)** — §11.1: direct-competitor risk named explicitly (Prompt Assay
  et al. surfaced during live name checks); Phase-3 launch framing shifted to honest
  "why I built my own" positioning (backlog #32).
- **v0.4 (2026-07-16)** — File format decided: dotprompt (ADR-005 flipped to Accepted).
  §11.2 #2 resolved; compliance-matrix.md D1 unblocked. Only the product-name pick remains
  open.
- **v0.3 (2026-07-16)** — Decision batch reviewed by owner. Decided: Apache-2.0 license;
  private-repo strategy (employer-OK gate moves to Phase-3 launch); open-at-real-progress
  timing; better-sqlite3 driver (ADR-008); auto-commit-on-save (ia.md); debounced cost
  preflight (ux-flows.md). Still open: name pick, file-format pick (dotprompt recommended).
- **v0.2 (2026-07-15)** — Reconciliation pass. Added: git-remote-as-backup first-run
  recommendation (§7.1, from disaster-recovery.md); two security NFRs — localhost
  origin-validation and secret-capture warn (§8, from threat-model.md T4/T3). §12 statuses
  updated (ADRs written; readme/preset/CLAUDE.md/backlog reconciled; broken
  `templates/adr.md` link fixed — templates/ was deleted).
- **v0.1 (2026-07-15)** — Initial draft. Repositions PromptMuster from "Postman for prompts"
  workbench to git-native, eval-first, IDE-native prompt toolkit. Direction agreed in
  planning conversation; not yet reconciled with README/BACKLOG/preset.
