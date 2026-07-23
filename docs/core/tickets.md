# PromptMuster Ticket Board

The layer between [backlog.md](backlog.md) (feature level) and the weekly plans
(day level). Every backlog feature (= chunk) is cut into tickets you can pick up
one at a time, GitHub-issues style.

**Sizing:** 1 SP ≈ one focused 75-min session. Tickets are 1–5 SP; anything
bigger was split. Nothing here is epic-sized on purpose.

**How to use:** work the phases in order; inside a phase, pick the top ticket
whose `Needs` are all done. `Needs` only lists ticket IDs — phase order handles
the rest. Every ticket implicitly includes types, error handling, and at least
a few tests (backlog RULES #2) — test-only tickets exist solely for harness
setup.

**Maintenance:** mark tickets `[x]` during Sunday review, same pass as the
backlog checkboxes. If backlog.md gets re-cut (its RULES #8), this file gets
re-cut with it — same relationship backlog.md has to prd.md.

**Calibration cross-check:** ticket totals — Tier 1 remainder ~22 SP, Phase 1
~80 SP, Phase 2 ~48 SP, Phase 3 ~37 SP — at ~6-7 sessions/week put Phase 3's
end around week 30, consistent with the backlog's ~35-40 week estimate once
Phase 4 and slack are added. If actuals drift, fix the estimate here, not the
pace.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

---

## TIER 1 REMAINDER (Weeks 2-4)

Features #02-#05 are done and not re-ticketed. This is what's left to close
Tier 1.

### Chunk #01 — Prompt CRUD (finish)

| ID       | SP  | Ticket                                                                              | Needs | Teaches                                                              |
| -------- | --- | ----------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------- |
| [x] 01.1 | 2   | Edit flow: reuse PromptForm pre-filled, update via usePromptManager, cancel/save UX | —     | Controlled-form reuse for create vs. edit, immutable update patterns |

### Chunk QA — Test Foundation (Week 2 priority, from completion-log)

| ID       | SP  | Ticket                                                                       | Needs | Teaches                                           |
| -------- | --- | ---------------------------------------------------------------------------- | ----- | ------------------------------------------------- |
| [x] QA.1 | 1   | Vitest + React Testing Library setup, first trivial passing test, npm script | —     | Test-runner config, jsdom environment             |
| [x] QA.2 | 2   | usePromptManager tests: CRUD, favorite toggle, filter/search derived state   | QA.1  | Testing hooks with renderHook, arrange-act-assert |
| [x] QA.3 | 1   | createPrompt / utils tests incl. edge cases (empty tags, id uniqueness)      | QA.1  | Pure-function testing, edge-case selection        |

### Chunk #06 — Next.js Routing

| ID       | SP  | Ticket                                                                                    | Needs      | Teaches                                          |
| -------- | --- | ----------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------ |
| [ ] 06.1 | 2   | App Router structure: root layout, `/prompts` list page, move SPA content in              | —          | Layouts vs. pages, server/client component split |
| [ ] 06.2 | 2   | Prompt detail page `/prompts/[id]` + not-found handling                                   | 06.1       | Dynamic routes, param typing, 404 states         |
| [ ] 06.3 | 2   | Editor routes: `/prompts/new` + `/prompts/[id]/edit` sharing the form                     | 06.2, 01.1 | Route-level code sharing, redirect-after-save    |
| [ ] 06.4 | 2   | Filters/search as URL state (searchParams), shareable filtered views + settings page stub | 06.1       | URL as state store, when not to use useState     |

### Chunk #07 — Professional UI (shadcn/ui)

| ID       | SP  | Ticket                                                                                                                             | Needs | Teaches                                            |
| -------- | --- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------- |
| [ ] 07.1 | 2   | Tailwind + shadcn init, theme tokens, globals migration; flip CLAUDE.md CSS conventions (the scheduled direction change)           | —     | Design-token setup, documented convention flips    |
| [ ] 07.2 | 3   | Migrate primitives: Button, Input, Select, Badge, Card across all components                                                       | 07.1  | Component-library adoption in an existing codebase |
| [ ] 07.3 | 2   | Dialog for delete-confirm, form field components, EmptyState + a11y pass (incl. "no prompts" vs "filtered out" — Week-1 known gap) | 07.2  | Composition with primitives, accessibility basics  |

**Tier 1 exit:** backlog TIER 1 CHECKPOINT holds.

---

## PHASE 1 — USEFUL TO ME

### Chunk #08 — Prompt File Format & Parser (dotprompt, ADR-005)

| ID       | SP  | Ticket                                                                                                                                                                               | Needs | Teaches                                                                  |
| -------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------ |
| [ ] 08.1 | 2   | Spike: read dotprompt spec, hand-write 3 sample `.prompt` files from existing prompts, pin down the `promptmuster:` extension block + `schemaVersion` placement (short written note) | —     | Reading a spec before coding, extension-vs-fork discipline               |
| [ ] 08.2 | 2   | Core package scaffold: framework-free `core/` lib (ADR-001), PromptFile types, typed ParseError                                                                                      | 08.1  | Package boundaries, dependency direction (core imports nothing above it) |
| [ ] 08.3 | 3   | Parser: `.prompt` → domain object (frontmatter + role-tagged body), refuse unknown major schemaVersion, error messages worth reading                                                 | 08.2  | YAML/frontmatter parsing, schema versioning as a contract                |
| [ ] 08.4 | 2   | Serializer: domain → `.prompt` file; round-trip property tests (parse∘serialize = id)                                                                                                | 08.3  | Round-trip testing, canonical formatting                                 |
| [ ] 08.5 | 3   | File index: scan the prompt directory, load/validate all, in-memory index, re-scan on change                                                                                         | 08.3  | Filesystem as database, index invalidation                               |

### Chunk #09 — Domain Model Rewrite (messages/vars/params, trd §3)

| ID       | SP  | Ticket                                                                                                                                  | Needs      | Teaches                                                            |
| -------- | --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| [ ] 09.1 | 2   | New domain types: role-tagged messages[], typed variables, model params; map from old `content: string` shape                           | 08.2       | Migrating a shipped domain type, why now is the cheapest moment    |
| [ ] 09.2 | 3   | Migrate usePromptManager + list/card/filter components to the new shape                                                                 | 09.1       | Sweeping a type change through consumers without breaking behavior |
| [ ] 09.3 | 3   | Editor UI for role-tagged messages (system/user blocks, add/remove)                                                                     | 09.2, 07.3 | UI for structured content vs. one big textarea                     |
| [ ] 09.4 | 3   | Typed-variable UI: declare variables, `{{var}}` highlighting in body, dynamic fill form per type (string/select/file)                   | 09.3       | Schema-driven form generation                                      |
| [ ] 09.5 | 3   | Wire dashboard to the file-backed library: route handlers import core, replace in-memory store; migrate seed prompts to `.prompt` files | 08.5, 09.2 | Repository swap in practice, files as the source of truth          |

### Chunk #10 — Models & Pricing as Data (ADR-006)

| ID       | SP  | Ticket                                                                                                         | Needs | Teaches                              |
| -------- | --- | -------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------ |
| [ ] 10.1 | 2   | Models table {provider, snapshotId, contextWindow, input/output price} + seed with current snapshots           | 09.1  | When a union type should become data |
| [ ] 10.2 | 2   | Kill the Model union: model picker + all consumers read the table; stale-string migration for existing prompts | 10.1  | Data-driven UI, migration mechanics  |

### Chunk #11 — SQLite Runs & Logs (ADR-002/003/008)

| ID       | SP  | Ticket                                                                            | Needs      | Teaches                                                           |
| -------- | --- | --------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| [ ] 11.1 | 2   | Run domain type + RunRepository interface (the seam Postgres implements later)    | 09.1       | Repository Pattern designed against the interface, not the driver |
| [ ] 11.2 | 3   | better-sqlite3 implementation + schema bootstrap/migration on first run           | 11.1       | Sync SQLite API, schema evolution for a local file DB             |
| [ ] 11.3 | 2   | Runs list view reading from the repo (empty until execution exists — that's fine) | 11.2, 06.1 | Building the read path before the write path exists               |

### Chunk #12 — Single-Provider Execution (raw fetch, ADR-004)

| ID       | SP  | Ticket                                                                                                                 | Needs            | Teaches                                                            |
| -------- | --- | ---------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------ |
| [ ] 12.1 | 2   | ProviderAdapter interface: execute() as async iterable, countTokens(), price(); typed Result at the boundary (trd §11) | 10.2, 11.1       | Designing the abstraction before the second implementation exists  |
| [ ] 12.2 | 2   | API-key handling: env/keychain read in core, settings UI status (never the key itself), scaffold .gitignore            | 12.1             | Secret handling (threat-model P1), config layering                 |
| [ ] 12.3 | 3   | Anthropic adapter: raw fetch, non-streaming happy path, real request/response logged and understood                    | 12.1, 12.2       | The actual wire format under the SDKs (ADR-004's point)            |
| [ ] 12.4 | 2   | Error taxonomy: fail fast on 400/401, retry/backoff on 429/503, typed errors surfaced to UI                            | 12.3             | Retry discipline, distinguishing caller bugs from transient faults |
| [ ] 12.5 | 3   | Run page: pick prompt → fill variables → execute → render result; persist run via repository                           | 12.3, 09.4, 11.2 | End-to-end slice through every layer built so far                  |

### Chunk #13 — Streaming

| ID       | SP  | Ticket                                                                           | Needs      | Teaches                                           |
| -------- | --- | -------------------------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| [ ] 13.1 | 3   | SSE parsing → one internal Chunk type; adapter execute() yields progressively    | 12.3       | Server-Sent Events, async iterables end-to-end    |
| [ ] 13.2 | 2   | Progressive UI render + cancel mid-stream; persist partial/final state correctly | 13.1, 12.5 | Streaming UX, abort handling, backpressure basics |

### Chunk #14 — Token Counting & Cost Preflight

| ID       | SP  | Ticket                                                                          | Needs      | Teaches                                                                   |
| -------- | --- | ------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| [ ] 14.1 | 2   | Instant heuristic estimate while typing (debounced), clearly labeled "estimate" | 12.5       | Honest labeling of approximations, debounce in practice                   |
| [ ] 14.2 | 2   | Anthropic count-tokens API for exact count on demand, labeled "exact"           | 12.3       | Why token counting isn't provider-agnostic (tiktoken is wrong for Claude) |
| [ ] 14.3 | 1   | Cost preflight: tokens × models-table prices shown before run                   | 14.1, 10.1 | Pricing lookup as data, the differentiator trd §5.4 names                 |

### Chunk #15 — Multi-Provider Execution

| ID       | SP  | Ticket                                                                            | Needs      | Teaches                                                         |
| -------- | --- | --------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| [ ] 15.1 | 3   | OpenAI adapter behind the same interface + local tiktoken exact counting          | 12.4, 14.2 | Second implementation stress-tests the abstraction              |
| [ ] 15.2 | 3   | Google adapter + its count-tokens API                                             | 15.1       | Third data point; what's genuinely common vs. provider-specific |
| [ ] 15.3 | 2   | Provider-conformance suite: one spec run against all three adapters with fixtures | 15.2       | Contract testing, recorded fixtures vs. live calls              |

### Chunk #16 — MCP Server (ADR-007 — the flywheel)

| ID       | SP  | Ticket                                                                                                                                                                       | Needs            | Teaches                                                                      |
| -------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| [ ] 16.1 | 3   | Stdio MCP server (TS SDK): list_prompts + get_prompt from the file index. **Early-start: only needs 08.5/09.5 — pull forward to start the flywheel before execution exists** | 08.5, 09.5       | MCP protocol, tool schema design for a non-human consumer                    |
| [ ] 16.2 | 3   | run_prompt with confirm-before-spend enforced server-side (trd §12)                                                                                                          | 16.1, 15.3, 14.3 | Confirmation UX for a tool that spends real money                            |
| [ ] 16.3 | 2   | Register in Claude Code/Cursor, dogfood a full week, fix the top friction items                                                                                              | 16.1             | Eating your own dogfood as a design method; §10's success metric starts here |

### Chunk #17 — Local Dashboard Security Hardening (threat-model T3/T4)

| ID       | SP  | Ticket                                                                            | Needs | Teaches                                                         |
| -------- | --- | --------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------- |
| [ ] 17.1 | 2   | Bind state-changing route handlers to 127.0.0.1 + validate Origin/Host            | 12.5  | Why "it's just localhost" isn't a boundary (CSRF/DNS-rebinding) |
| [ ] 17.2 | 2   | Secret-scan variable values, warn-before-run (run history persists what was sent) | 12.5  | Secret-scanning heuristics, warn-vs-block UX                    |

**Phase 1 exit:** backlog PHASE 1 CHECKPOINT holds — and you're using the MCP
server ≥4 days/week without forcing it (prd §10 Tier 1).

---

## PHASE 2 — TRUSTWORTHY (the flagship)

### Chunk #18 — Eval Test Cases & Core Assertions

| ID       | SP  | Ticket                                                                                                        | Needs | Teaches                                                       |
| -------- | --- | ------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------- |
| [ ] 18.1 | 3   | `.eval.yaml` sibling-file format + parser (test cases: variable values + assertion list)                      | 08.3  | Test-file-beside-source design applied to prompts             |
| [ ] 18.2 | 2   | Assertions: exact, contains, regex — with a common AssertionResult shape                                      | 18.1  | Why exact-match alone is useless for non-deterministic output |
| [ ] 18.3 | 3   | Schema assertion (ajv against the prompt's outputSchema) + property checks (length, format, must-not-contain) | 18.2  | JSON Schema validation, provider structured-output limits     |

### Chunk #19 — LLM-as-Judge

| ID       | SP  | Ticket                                                                                                              | Needs      | Teaches                                                                   |
| -------- | --- | ------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| [ ] 19.1 | 3   | Judge assertion: rubric prompt, cheap model (haiku-class), score parsing, failure mode when the judge itself errors | 18.2, 15.3 | Using a model to grade a model, rubric design                             |
| [ ] 19.2 | 2   | Judge prompt stored as a versioned `.prompt` file; documented bias notes (verbosity, position, self-preference)     | 19.1       | Dogfooding your own format; documenting known bias instead of ignoring it |

### Chunk #20 — Eval Suite Runner

| ID       | SP  | Ticket                                                                                          | Needs      | Teaches                                                     |
| -------- | --- | ----------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| [ ] 20.1 | 3   | Matrix expansion (version × model × case) + sequential runner + report model (pass/fail + cost) | 18.3, 19.1 | Summarizing heterogeneous assertion results into one report |
| [ ] 20.2 | 3   | Bounded concurrency: worker pool, per-provider rate limits, backoff under matrix load           | 20.1       | Concurrency control when you're firing many paid requests   |
| [ ] 20.3 | 3   | Suite results UI: matrix grid, per-cell drill-down, total cost                                  | 20.1, 07.3 | Dense-data UI design                                        |

### Chunk #21 — Cost Controls & Caching (threat-model P2)

| ID       | SP  | Ticket                                                                                                                                    | Needs      | Teaches                                                                    |
| -------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| [ ] 21.1 | 3   | Content-addressed result cache keyed on hash(CACHE_SCHEMA_VERSION + resolved messages + model + params + input); re-run only what changed | 20.1       | Content-addressed caching, wholesale invalidation via the version constant |
| [ ] 21.2 | 2   | Budget cap per run enforced in core (estimate up front, confirm if over) — no client can bypass                                           | 21.1, 14.3 | Cost safety as a hard guarantee, not a UI nicety                           |

### Chunk #22 — Determinism Handling

| ID       | SP  | Ticket                                                                                   | Needs      | Teaches                                                                              |
| -------- | --- | ---------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| [ ] 22.1 | 3   | Repeat runs / pass@k + score thresholds so run-to-run noise isn't reported as regression | 20.2, 21.1 | Testing non-deterministic systems honestly — the strongest interview story (prd §10) |

### Chunk #23 — Regression View

| ID       | SP  | Ticket                                                          | Needs      | Teaches                                                                    |
| -------- | --- | --------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| [ ] 23.1 | 2   | Read a prompt file's version list from git log programmatically | 09.5       | Git as the version store you already have (ADR-002 payoff)                 |
| [ ] 23.2 | 3   | Diff two versions' eval results per model + cost delta view     | 23.1, 22.1 | "What changed" (git) vs. "did it get better" (this) — one feature, not two |

### Chunk #24 — Committable Baselines

| ID       | SP  | Ticket                                               | Needs | Teaches                                                |
| -------- | --- | ---------------------------------------------------- | ----- | ------------------------------------------------------ |
| [ ] 24.1 | 2   | `name.baseline.json` write/read + compare-to-current | 21.1  | Baselines in git beside the prompt, not hidden in a DB |

### Chunk #25 — Judge Golden-Set Harness (P2 — skippable)

| ID       | SP  | Ticket                                                                          | Needs | Teaches                                               |
| -------- | --- | ------------------------------------------------------------------------------- | ----- | ----------------------------------------------------- |
| [ ] 25.1 | 3   | Small human-labeled golden set + harness validating the judge prompt against it | 19.2  | Meta-testing: testing the thing that tests your tests |

**Phase 2 exit:** backlog PHASE 2 CHECKPOINT holds — including ≥10 of your own
prompts with eval suites (prd §10).

---

## PHASE 3 — SHAREABLE

### Chunk #26 — CLI

| ID       | SP  | Ticket                                                                             | Needs      | Teaches                                         |
| -------- | --- | ---------------------------------------------------------------------------------- | ---------- | ----------------------------------------------- |
| [ ] 26.1 | 2   | CLI scaffold (thin shell over core): `list`, `search`, `mcp` (starts stdio server) | 16.1       | CLI design, argument parsing                    |
| [ ] 26.2 | 2   | `run <name> --model=... --var k=v` with streaming output                           | 26.1, 15.3 | TTY streaming, exit codes                       |
| [ ] 26.3 | 2   | `eval <name>` with pass/fail summary + budget flags                                | 26.2, 22.1 | The same core surface through a third interface |
| [ ] 26.4 | 2   | npm packaging: bin setup, `npx promptmuster` works clean-machine                   | 26.3       | npm publishing, package.json bin mechanics      |

### Chunk #27 — Export / Import

| ID       | SP  | Ticket                                                              | Needs | Teaches                                                     |
| -------- | --- | ------------------------------------------------------------------- | ----- | ----------------------------------------------------------- |
| [ ] 27.1 | 1   | Export collections (JSON/YAML) via CLI + dashboard                  | 26.1  | Serialization is nearly free when prompts are already files |
| [ ] 27.2 | 2   | Import with schema-version validation + mismatch/malformed handling | 27.1  | Defensive parsing of other people's files                   |

### Chunk #28 — CI GitHub Action

| ID       | SP  | Ticket                                                              | Needs      | Teaches                                                |
| -------- | --- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------------ |
| [ ] 28.1 | 3   | Composite Action: run `eval` on changed prompts in a PR             | 26.3, 24.1 | GitHub Actions authoring, change detection             |
| [ ] 28.2 | 3   | Baseline compare + PR comment + fail on regression beyond threshold | 28.1       | Automated quality gates for a non-deterministic system |
| [ ] 28.3 | 2   | Fork-PR safety: estimate-only mode / budget guard (threat-model T8) | 28.2       | CI abuse surfaces when strangers can open PRs          |

### Chunk #29 — Side-by-Side Comparison

| ID       | SP  | Ticket                                                                                    | Needs      | Teaches                                                   |
| -------- | --- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| [ ] 29.1 | 3   | Same prompt against N models in parallel: output, latency, cost columns (ux-flows Flow 3) | 15.3, 13.2 | Parallel async operations, normalization across providers |

### Chunk #30 — Cost Dashboard

| ID       | SP  | Ticket                                                                                     | Needs      | Teaches                                            |
| -------- | --- | ------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------- |
| [ ] 30.1 | 2   | Aggregation queries over the run log: per prompt, per model, over time, monthly projection | 11.2, 14.3 | SQL aggregation over data you were already logging |
| [ ] 30.2 | 2   | Cost views/charts (use the dataviz skill, per compliance-matrix finding #3)                | 30.1       | Dashboard design, honest visualization             |

### Chunk #31 — Quality Ratings (P2 — skippable)

| ID       | SP  | Ticket                                         | Needs | Teaches                       |
| -------- | --- | ---------------------------------------------- | ----- | ----------------------------- |
| [ ] 31.1 | 2   | Post-run thumbs/stars stored on the run record | 12.5  | Subjective-data collection UX |

### Chunk #32 — OSS Launch Readiness (gate, not calendar)

| ID       | SP  | Ticket                                                                                               | Needs      | Teaches                                              |
| -------- | --- | ---------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| [ ] 32.1 | 2   | README with the "why I built my own" positioning (backlog #32 POSITIONING) + demo GIF                | 16.3, 26.4 | Portfolio storytelling, honest competitive placement |
| [ ] 32.2 | 1   | Launch gate checklist: employer written OK, LICENSE present, PromptMuster rename verified everywhere | 32.1       | What "ready to go public" actually requires          |
| [ ] 32.3 | 1   | Repo public + MCP registry/directory listing                                                         | 32.2       | Discoverability mechanics                            |

**Phase 3 exit:** backlog PHASE 3 CHECKPOINT holds — ≥1 person who isn't you
has installed and run it.

---

## PHASE 4 — TEAM (chunk stubs only, deliberately)

Phase 4 is conditional on Ring 1 validating (backlog Phase 4 header). Cutting
tickets now for conditional work six months out is fake precision — these stay
at chunk level until the Phase 3 checkpoint passes.

**Refinement trigger:** when 32.3 ships and the Phase 3 checkpoint holds, cut
tickets for #33-#38 here, same style as above.

- Chunk #33 — Repo-based sharing workflows (~5 SP expected)
- Chunk #34 — Dashboard for non-technical consumers (~8 SP)
- Chunk #35 — NestJS team API (~10 SP)
- Chunk #36 — PostgreSQL team backend (~8 SP)
- Chunk #37 — Access controls & multi-tenant auth (~10 SP)
- Chunk #38 — Optional hosted/team mode (~8 SP)

FUTURE tier (#39-#46): stays in backlog.md only; ticket-cut on promotion out of
Future, never before.

---

## Dependency spine (ticket-level, load-bearing edges only)

```
01.1 → 06.3          QA.1 → QA.2, QA.3        07.1 → 07.2 → 07.3
08.1 → 08.2 → 08.3 → 08.4
              08.3 → 08.5 ─┬→ 09.5 ─┬→ 16.1 → 16.3   (flywheel — earliest start)
08.2 → 09.1 → 09.2 ────────┘        │
       09.1 → 10.1 → 10.2           │
       09.1 → 11.1 → 11.2 → 11.3    │
10.2 + 11.1 → 12.1 → 12.2 → 12.3 → 12.4 → 15.1 → 15.2 → 15.3 ─┬→ 16.2
                            12.3 → 13.1 → 13.2                 ├→ 26.2
                            12.3 → 14.2                        └→ 29.1
              12.5 → 17.1, 17.2, 31.1          14.1 → 14.3 → 16.2, 21.2
18.1 → 18.2 ─┬→ 18.3 ─┬→ 20.1 → 20.2 → 22.1 → 23.2 ← 23.1
             └→ 19.1 ─┴→ 19.2 → 25.1
20.1 → 20.3            20.1 → 21.1 ─┬→ 21.2
                                    └→ 24.1 → 28.1
16.1 → 26.1 → 26.2 → 26.3 → 26.4 → 32.1 → 32.2 → 32.3
                     26.3 → 28.1 → 28.2 → 28.3
11.2 + 14.3 → 30.1 → 30.2
```
