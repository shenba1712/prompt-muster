PromptMuster FEATURE BACKLOG

Re-cut around the 2026-07-15/16 direction reset. Priority order.
Realistic pace. Each feature built when prerequisites are met and
engineering concepts align with the roadmap curriculum.

Total timeline: ~35-40 weeks / 9-10 months at 75 min/day (approximate —
the source of truth for sequencing is now phase-based, not week-based;
see project-files/prd.md §9). The project is portfolio-worthy at the
end of every phase.

Ticket-level breakdown of every feature here: core/tickets.md
(1 SP ≈ one 75-min session; re-cut together with this file).

═══════════════════════════════════════════════════════
RE-CUT NOTES — 2026-07-16 (read before using)
═══════════════════════════════════════════════════════

This is the re-cut promised by the DIRECTION CHANGE banner that used
to sit here. It follows project-files/prd.md §9's phases and
trd.md's architecture, preserving the prerequisite / "teaches"
discipline from the original 43-feature list. Source of truth for
product decisions is prd.md + trd.md + adr/ — this file is the
week-level translation of those, same relationship as before.

Tier 1 (#01-#07) is UNCHANGED — Weeks 1-4 already happened or are in
flight exactly as originally planned. Everything from #08 onward is
renumbered and reorganized around the four release phases (prd.md §9):
Phase 1 "Useful to me," Phase 2 "Trustworthy," Phase 3 "Shareable,"
Phase 4 "Team." A final Future/Maybe tier holds the explicitly
deferred items.

What got cut or absorbed, and why:

- Old #07a IndexedDB + #07b browser-only Vercel demo — SUPERSEDED.
  Persistence is prompt files + SQLite (ADR-002/003/008), not
  IndexedDB. There is no browser-only mode in the new architecture;
  the dashboard is a local Next.js app whose route handlers import
  the core library directly.
- Old #08-#09 NestJS + PostgreSQL as the core backend — MOVED to the
  Phase 4 team tier only. The core is a framework-free TS library
  (ADR-001); NestJS/Postgres arrive when a hosted, multi-user mode
  actually exists (ADR-003, trd.md §14.3).
- Old #22-#24 (version history, visual diffs, rollback) — LARGELY
  FREE via git now that prompts are files (ADR-002). What remains is
  a thin "read history from git log" feature, folded into Phase 2's
  regression view rather than kept as three separate builds.
- Old #30-#31 (export/import) — KEPT, moved to Phase 3. Still useful
  for portability even though most of the old versioning rationale
  for them is now git's job.
- Old #32-#34 (GitHub/GitLab PR-review webhooks + multi-platform
  adapter) — CUT. Replaced by a CI eval GitHub Action (trd.md §10):
  same webhook/CI learning, on-thesis instead of a second crowded
  "auto-review my PR" product.
- Old #39 (Team Sync) — reframed as Phase 4's repo-based sharing +
  optional Postgres/hosted mode, not a bespoke offline-sync/
  conflict-resolution subsystem. Old #38 (Offline-First with Conflict
  Resolution) is CUT for the same reason — there's no
  IndexedDB-to-server sync problem to solve once files+git+SQLite is
  the model.
- Old #25 (Prompt Linter) — DEMOTED, not cut outright. Its most
  mechanical check (does the output match the declared schema?) is
  now just the eval engine's "schema" assertion (trd.md §3, §6.2).
  Its softer heuristic checks ("no output format instruction," "vague
  language") were never going to generalize well and the eval
  runner's LLM-as-judge assertion is the more honest tool for exactly
  that fuzziness. Kept as an optional Future item, not the flagship
  it once was going to be.
- The eval runner (test cases, assertions, regression vs. baseline)
  is now the FLAGSHIP feature (prd.md §6.2) and gets its own
  multi-feature build-out in Phase 2, where the old backlog had
  nothing.
- The MCP server moves much earlier (Phase 1, before evals) per
  ADR-007 — it's the smaller pillar and starts the daily-use
  flywheel, which is the project's actual success condition
  (prd.md §10).

═══════════════════════════════════════════════════════

Status Key

[ ] Not started
[~] In progress
[x] Complete


═══════════════════════════════════════════════════════
TIER 1 — FOUNDATION (Weeks 1-4) — UNCHANGED
═══════════════════════════════════════════════════════

These make PromptMuster functional as a frontend exercise. Without them,
nothing else works. Every feature here is a prerequisite for
something in a later phase. This tier predates the direction reset
and is unaffected by it (prd.md's Phase 0).


#01 [x] Prompt CRUD

     Create, read, update, delete prompts.

     Prerequisites: None
     Teaches: React components, TypeScript interfaces,
              state management, custom hooks
     Week: 1 (update flow completed Week 2 — tickets.md 01.1)


#02 [x] Prompt Favoriting

     Toggle favorite status with visual indicator.

     Prerequisites: #01
     Teaches: Immutable state updates, component
              composition, extending existing types
     Week: 1


#03 [x] Multi-Dimensional Filtering

     Filter by model, category, tags, favorites, search.

     Prerequisites: #01, #02
     Teaches: Derived state, higher-order functions,
              computed values, avoiding stored derived state
     Week: 1


#04 [x] Full-Text Search

     Case-insensitive search across titles and content.

     Prerequisites: #01
     Teaches: String manipulation, filter composition,
              debouncing (later optimization)
     Week: 1


#05 [x] Category and Tag Organization

     Categorize by purpose, add custom tags.

     Prerequisites: #01
     Teaches: Union types, array manipulation, UI for
              multi-value inputs
     Week: 1


#06 [x] Next.js Routing

     Separate pages: prompt list, prompt detail, prompt
     editor, settings.

     Prerequisites: #01-#05
     Teaches: App Router, layouts, dynamic routes, URL
              state, page-level data flow
     Week: 2-3
     UPDATE (2026-08-04): 06.1-06.3 landed Week 3 (App Router +
     PromptProvider context, detail route + not-found, editor
     routes). 06.4 (filters/search as URL state + settings page
     stub) not started — the one remaining ticket before this
     flips to [x]. Carried into Week 4.
     RESOLVED (2026-08-09): 06.4 landed. `PromptFilters`' four
     dimensions (model, category, search, favorites) read/write via
     a dedicated `useFilterParams` hook (`useSearchParams` +
     `router.replace` — not `push`, since a filter change isn't a
     new history entry); an absent param means "no filter," not a
     stored empty string. `/settings` ships as a real stub route
     (styled to match the app's `Card` pattern, not bare text),
     linked from Header, which also picked up a clickable
     PromptMuster logo → `/prompts` and got hoisted to the root
     layout so every top-level route shares the same shell.
     Manually verified: a filtered URL is shareable (copy, paste in
     a new tab, same filter applies on load) and the back button
     exits a filtered view in one step rather than one filter at a
     time — the deliberate `replace` behavior working as designed,
     not a bug. #06 closed to [x].


#07 [x] Professional UI (shadcn/ui)

     Component library integration for consistent,
     professional design. Brings Tailwind — see
     core/claude.md's "Scheduled Direction Changes."

     Prerequisites: #01-#05
     Teaches: Design system integration, component
              customization, accessibility basics
     Week: 2-3 (shadcn primitives migrated Week 2 Friday
     per reference/roadmap/week2-plans/fri.md)
     NOTE (2026-08-04): Reopened to [~]. A design-review session found
     design-system.md's actual tokens/type-scale/spacing were never fully
     applied, and Week 1 scaffolding (gradient Header, default-anchor
     prompt titles, unicode favorite star, dev-only "Load Sample Data"
     sitting in production layout) was left untouched by the 07.1-07.3
     primitives migration, which only covered Button/Input/Select/
     Textarea/Badge/Card — not layout chrome. Ticket 07.6 (tickets.md)
     closes this gap. Complete #07 again only once 07.6 lands.
     RESOLVED (2026-08-04): 07.6 landed same day — gradient Header
     removed, prompt titles styled as real headings, unicode favorite
     star replaced with a designed icon, design-system.md's type scale/
     spacing rhythm applied app-wide, "Load Sample Data" gated to
     dev-only builds. #07 closed to [x] again. 07.7 (keyboard-nav audit)
     and 07.8 (motion/toast policy) are separate follow-on tickets from
     the same audit — neither gates #07.


TIER 1 CHECKPOINT

After Tier 1, you can demonstrate:
- Clean React/TypeScript app with strict types
- Custom hooks with derived state
- Professional UI with routing
- Claude Code as development tool

Interview level: Junior to Mid — "I understand React fundamentals and TypeScript deeply"

═══════════════════════════════════════════════════════
PHASE 1 — USEFUL TO ME (Weeks 5-9ish)
═══════════════════════════════════════════════════════

Theme: files + execution + IDE (prd.md §9). The frontend-only
prototype becomes a real local tool: prompts become files with a
real schema, execution works against one provider and then several,
and the MCP server puts the library inside the IDE — the daily-use
flywheel this whole project's success depends on (prd.md §10).

Ring: 0 (you, daily, inside Claude Code / Cursor).


#08 [ ] Prompt File Format & Parser

     Each prompt becomes a file (YAML frontmatter + role-tagged
     body) instead of an in-memory object: schemaVersion, name,
     model block, typed variables, optional outputSchema. Parser
     refuses unknown major schemaVersions.

     Prerequisites: #01-#07 (stable frontend)
     Teaches: File-format design as a one-way-door decision,
              gray-matter/yaml parsing, schema versioning,
              adopting vs. inventing a convention
     Week: 5
     NOTE: This is the load-bearing contract (trd.md §3). Format
     decided 2026-07-16: adopt and extend dotprompt (ADR-005) — no
     open decision left to block starting this feature.
     UPDATE (2026-08-04): ticket 08.6 adds detection for a file
     changed underneath an open Editor (branch switch / external
     edit) — a git-native tool's real daily-use failure mode, not
     an edge case (audit finding #7).


#09 [ ] Domain Model Rewrite — Messages, Variables, Params

     content: string becomes a role-tagged messages array
     (system/user/assistant) plus typed template variables
     ({{name}} with a declared type) and model params
     (temperature, max_tokens) as data, not hardcoded.

     Prerequisites: #08
     Teaches: Migrating a shipped domain type without breaking
              consumers, template variable design, why this must
              land before execution is built (trd.md §15) —
              cheapest moment to fix it is now
     Week: 5-6
     NOTE: Corrects the Week 1 content: string model
     (reference/key-desicions.md). This is a planned, good lesson,
     not scope creep.
     UPDATE (2026-08-04): tickets 09.6 (domain-specific validation —
     undeclared {{var}}, malformed outputSchema, unknown model ID)
     and 09.7 (sort/pagination once the library holds 100+ prompts)
     close two gaps every doc's small running example papered over
     (audit findings #9, #10).


#10 [ ] Models & Pricing as Data

     Replace the Model union type with a table:
     {provider, snapshotId, contextWindow, inputPrice, outputPrice}.
     Seed with current snapshots (claude-opus-5, claude-sonnet-5,
     claude-haiku-4-5-20251001, etc. — re-verify against each provider's
     live model list when this ticket is actually picked up, not from
     this note) — the repo's existing strings are already stale.

     Prerequisites: #09
     Teaches: When a union type should become data instead (model
              IDs and prices drift monthly), migration mechanics,
              why snapshot pinning matters for reproducibility
     Week: 6
     ADR: ADR-006


#11 [ ] SQLite Runs & Logs Persistence

     Local SQLite store for execution runs/logs behind a thin
     repository interface (the same interface Postgres implements
     later at the team tier). Prompts stay files; only runs go in
     the database.

     Prerequisites: #09
     Teaches: Repository Pattern for real (swap SQLite for
              Postgres later without touching domain logic),
              why "prompts as files, runs as rows" is two storage
              models on purpose, better-sqlite3's sync API
     Week: 6-7
     ADR: ADR-002, ADR-003, ADR-008 (better-sqlite3 + thin
     hand-rolled repository — decided 2026-07-16, Prisma
     reconsidered only if/when Phase 4 makes it earn its weight)
     UPDATE (2026-08-04, broader audit): five real gaps found in
     this feature's own design, all folded into tickets 11.1/11.4-
     11.8 rather than discovered mid-build or at Phase 4: (1) the
     "mechanical Postgres swap" claim ignores that better-sqlite3
     is sync and Postgres access can't be — resolve at 11.1's
     interface design, not later (finding #4); (2) no migration
     mechanism is defined for the SQLite schema itself (finding
     #5); (3) `prompt_commit_sha` has no defined behavior for
     running against uncommitted edits — the likely majority case
     while iterating (finding #6); (4) multi-process write
     concurrency (dashboard + CLI/MCP/CI writing the same file) is
     named as a risk in ADR-003 but never resolved — WAL mode /
     busy_timeout needed (finding #19); (5) no run-lifecycle
     reconciliation ("interrupted" status) or `runs purge` command
     exists despite trd.md committing to both, and no backup/
     export path exists for run/cost data at all, unlike the
     prompt library which git covers (findings #11, #12).


#11a [ ] Library Home Summary Strip

     A header band above the Library list surfacing prompt
     count, runs today, and cost this week — not a separate
     Home screen (ia.md §8 Q5, resolved 2026-08-04: Library
     stays Home; this is the cheapest real orientation layer,
     not a full dashboard, which would decorate mostly-empty
     data this early).

     Prerequisites: #11, #14, #30 (needs real run/cost data —
                    built once, after Cost exists, not before)
     Teaches: Aggregation over data already being logged,
              designing a UI element that degrades gracefully
              to nothing when there's no data yet
     Week: Phase 3, alongside or just after #30 (corrected
     2026-08-04, audit finding #24 — previously said "Phase 2,"
     which contradicted its own #30 prerequisite; #30 is a Phase 3
     feature, Week 18-19. Same class of error already caught and
     fixed for #29 in the original re-cut; missed here until now.
     11a.2 additionally needs #23, a Phase 2 feature — so 11a
     cannot start until both #23 and #30 exist, i.e. not before
     Phase 3.)
     NOTE: A full dedicated Home dashboard (recent runs,
     favorites, quick-create) was considered and explicitly
     deferred — revisit post-Phase 2 only if this strip proves
     insufficient in daily use.
     UPDATE (2026-08-04): ticket 11a.2 adds proactive local
     regression surfacing to this strip once #23 exists — see
     audit finding #14 below.


#12 [ ] Provider Adapter — Single Provider Execution

     Execute a prompt against one provider (raw fetch, not an SDK)
     and render the result. One ProviderAdapter interface:
     execute() as an async iterable, countTokens(), price().

     Prerequisites: #10, #11
     Teaches: Hand-building an HTTP client against a real API
              before reaching for an SDK, async iterables, why
              "see the wire first" is the point (ADR-004)
     Week: 7
     ADR: ADR-004 (raw fetch first; official SDKs allowed after)
     NOTE (2026-08-04): ux-flows.md's seven journeys are
     happy-path only — no designed rate-limit/invalid-key/
     timeout/dropped-stream screen exists despite trd.md §5.3/§11's
     real error taxonomy underneath. Ticket 12.6 closes this
     (audit finding #1); 13.3 and 29.2/20.4 extend it to streaming
     and multi-provider partial failure.
     UPDATE (2026-08-04, broader audit): ticket 12.1 also needs to
     resolve function-calling/structured-output representation in
     the interface — prompt files already carry `outputSchema` and
     the Phase-2 eval engine's schema assertion depends on it, but
     the three providers enforce structured output through
     structurally different mechanisms with no hook in a flat
     `execute()` call (finding #7). Resolve before Phase 2 builds
     on the assumption it already works.


#12a [ ] Provider Onboarding & Key Health

     A first-run flow for adding a provider API key (Settings →
     Providers), plus a per-provider "test connection" affordance
     to verify a key works before it's trusted with a real,
     money-spending run.

     Prerequisites: #12 (specifically 12.2's key-handling plumbing)
     Teaches: Onboarding as a designed flow rather than an assumed
              prerequisite; cheap trust-building UI ahead of an
              expensive action
     Week: Phase 1, alongside #12
     NOTE: Without this, the first real session is "the app
     silently needs environment variables it never mentions" —
     currently buried as a sub-clause of ticket 12.2, not its own
     experience (2026-08-04 audit findings #2, #3). Competing
     tools (promptfoo, PromptLayer) surface connection health;
     this closes the same gap here.


#13 [ ] Streaming Responses

     Token-by-token streaming instead of waiting for the complete
     response. Normalize the provider's SSE event shape into one
     internal Chunk type.

     Prerequisites: #12
     Teaches: Server-Sent Events, async iterables end-to-end,
              progressive UI rendering, backpressure
     Week: 7-8
     UPDATE (2026-08-04): ticket 13.3 adds stream-drop recovery —
     a connection lost mid-stream must show what was received plus
     a clear "incomplete" marker, not a silently truncated result
     treated as final (audit finding #1).
     UPDATE (2026-08-04, broader audit): the internal `Chunk` type
     (`{text, done}`) has no usage/token field, but the runs schema
     requires input/output tokens and cost per run — resolve where
     `price(usage, model)` gets its `Usage` object from before
     Phase 2's eval cost controls assume it exists (finding #8).


#14 [ ] Token Counting & Cost Preflight

     See token count and estimated cost before running. Per
     provider: OpenAI via local tiktoken (instant), Anthropic and
     Google via their token-counting API (accurate, network —
     tiktoken is wrong for Claude by ~15-20%, don't use it as a
     shortcut). Instant heuristic while typing, exact count on
     demand, both clearly labeled.

     Prerequisites: #12
     Teaches: Why "accurate token count" isn't provider-agnostic,
              labeling estimates vs. exact counts honestly, pricing
              lookup from the models-as-data table (#10)
     Week: 8
     DIFFERENTIATOR: Partially — pre-execution cost info is
     uncommon, and doing it honestly per-provider is a real
     interview story (trd.md §5.4).


#15 [ ] Multi-Provider Execution

     Execute against OpenAI, Anthropic, and Google. User chooses
     per execution. One adapter implementation per provider behind
     the #12 interface.

     Prerequisites: #12, #13, #14
     Teaches: Provider abstraction under real API differences,
              adapter pattern with more than one implementation,
              retry/backoff on transient errors (429/503), fail
              fast on 400/401
     Week: 8-9
     UPDATE (2026-08-04, broader audit): ticket 15.4 adds a
     recurring fixture-drift check — the project's own "no
     automated test ever makes a billed call" rule removes the
     only mechanism that would otherwise catch a silent provider
     API change making an adapter subtly wrong while its fixture
     suite stays green forever (finding #10).


#16 [ ] MCP Server — Read + Run

     Expose the prompt library as MCP tools: list_prompts,
     get_prompt, run_prompt. Stdio server, built on the MCP
     TypeScript SDK, imports core directly (same file index +
     SQLite as everything else). list/get need no execution
     backend and can ship as a degraded-but-useful slice early.

     Prerequisites: #08, #09, #15 (run_prompt needs execution;
                    list_prompts/get_prompt only need #08)
     Teaches: MCP protocol implementation, tool schema design,
              designing an API for a non-human consumer (an IDE
              agent, not a browser), confirm-before-spend UX for
              a tool that can trigger real money
     Week: 9
     ADR: ADR-007 (MCP ships before the eval engine — smallest
     pillar, starts the daily-use flywheel first)
     DIFFERENTIATOR: Yes — the demo moment, and the reason this
     phase exists at all (prd.md §6.1).
     SECURITY: run_prompt is a prompt-injection surface once
     prompts can come from outside your own library — confirm
     before executing (trd.md §12).
     CRITICAL UPDATE (2026-08-04, broader audit finding #1 — the
     audit's single Critical): the confirm-gate as designed
     protects `run_prompt` because it spends money, but the actual
     T1 injection threat lands the moment `get_prompt` (or
     `list_prompts`) hands attacker-controlled file text back to
     the calling agent — a normal, encouraged, zero-spend action
     that today carries no signal at all. Ticket 16.1 must carry
     the external-origin flag into the read tools' responses, not
     just gate the spend tool. Related: ticket 16.2 must also move
     the untrusted-content confirm-gate (P5) into core itself, the
     same fix T2 already forced for budget enforcement but never
     applied to content trust (finding #2) — including a concrete
     definition of "external-origin," which no doc currently gives.


#17 [ ] Local Dashboard Security Hardening

     Bind state-changing route handlers to 127.0.0.1 and validate
     Origin/Host so a hostile webpage can't trigger money-spending
     runs on your local dashboard. Scan variable values against
     credential patterns with a warn-before-run, since run history
     persists exactly what was sent.

     Prerequisites: #11, #15
     Teaches: CSRF/DNS-rebinding on a "local" server that still
              listens on a port, why "it's just localhost" isn't a
              security boundary, secret-scanning heuristics
     Week: 9
     NOTE: This is a Phase 1 requirement, not later polish
     (threat-model.md T3/T4; trd.md §9, §12).
     UPDATE (2026-08-04, broader audit): Origin/Host validation
     widened to every route handler, not just state-changing ones
     — a read-only route serving run history (T3's own "most
     sensitive file on disk") isn't state-changing by the original
     test, yet DNS rebinding defeats the CORS distinction for GETs
     too (finding #3). Also: ticket 17.3 extends the secret scan to
     the model's *output*, not just input variables — a secret can
     be echoed back in a response (e.g. a diff review quoting a
     token), which the original scan doesn't cover (finding #17).


PHASE 1 CHECKPOINT

After Phase 1, you can demonstrate:
- Prompts as versionable files with a real schema, not in-memory
  objects
- Multi-provider streaming execution with honest cost preflight
- An MCP server that puts your prompt library inside your own IDE
  daily — the flywheel prd.md §10 calls the actual success metric
- Repository Pattern applied for real (SQLite now, Postgres later,
  same interface)

Interview level: Mid — "I built a local-first tool that's part of
my own daily workflow, with real provider integration"

═══════════════════════════════════════════════════════
PHASE 2 — TRUSTWORTHY (Weeks 10-15ish)
═══════════════════════════════════════════════════════

Theme: evals (prd.md §9). This is the flagship pillar — the reason
someone would consider PromptMuster over "a place to store prompts"
(prd.md §6.2). Attach test cases to a prompt, edit the prompt,
re-run the suite, see what regressed and what it cost.

Ring: 1 (individual developers, once this ships publicly in Phase 3).


#18 [ ] Eval Test Cases & Core Assertions

     Attach test cases (variable values + assertions) to a prompt
     in a sibling file (name.eval.yaml, not inline). Assertion
     types: exact match, contains/regex, schema (validates against
     the prompt's outputSchema via ajv), property checks (length,
     language, format, must-not-contain).

     Prerequisites: #08 (outputSchema), #15 (execution to test
                    against)
     Teaches: Why exact-match alone is useless for non-deterministic
              output, JSON Schema validation, designing a test-case
              file format that sits beside the prompt like a test
              file sits beside source
     Week: 10


#19 [ ] LLM-as-Judge Assertion

     A cheap model (e.g. claude-haiku-4-5) scores output against a
     rubric, for the fuzzy majority of prompts exact/regex/schema
     checks can't cover.

     Prerequisites: #18
     Teaches: Using a model to grade a model, rubric design,
              known judge biases (verbosity, position,
              self-preference) and why they must be documented,
              not just accepted
     Week: 10-11


#20 [ ] Eval Suite Runner

     Run a suite across one or more models: a matrix of
     prompt-version × model × test-case → result, summarized as
     pass/fail + cost.

     Prerequisites: #18, #19
     Teaches: Matrix expansion, bounded concurrency (worker pool +
              per-provider rate limiting + backoff — evals fire a
              lot of requests fast), summarizing heterogeneous
              assertion results into one report
     Week: 11-12
     UPDATE (2026-08-04): ticket 20.4 adds a distinct "errored"
     matrix-cell state (timeout/rate-limit) — design-system.md's
     Table row only had pass/fail, but a 3-provider matrix will
     regularly have one cell error while the rest succeed (audit
     finding #6).


#21 [ ] Eval Cost Controls & Caching

     Cache results keyed on hash(CACHE_SCHEMA_VERSION + resolved
     messages + model + params + input); re-run only what changed.
     Budget cap per run, estimated up front, confirmed if over —
     enforced inside core so no client can bypass it.

     Prerequisites: #20
     Teaches: Content-addressed caching, why the cache-key version
              constant matters (any future change to what affects
              caching should invalidate stale entries wholesale,
              not silently collide), cost safety as a hard
              guarantee, not a UI nicety
     Week: 12
     NOTE: Evals spend real money every run — this is core, not
     polish (trd.md §6.4; threat-model.md P2).
     UPDATE (2026-08-04, broader audit): the cache's check-then-
     insert has no concurrency guard, despite this feature's own
     bounded-concurrency worker pool (#20.2) — two test cases
     resolving to the same cache key can both miss simultaneously
     and both pay for the provider call, defeating the cache's
     entire cost-control purpose under the exact concurrency model
     it's built for (finding #20).


#22 [ ] Determinism Handling

     Repeat runs / pass@k and score thresholds instead of exact
     deltas, so run-to-run noise isn't reported as a regression.

     Prerequisites: #20
     Teaches: Testing non-deterministic systems honestly — the
              strongest interview story this project has
              (prd.md §10) — statistical thresholds vs. exact
              comparison
     Week: 12-13


#23 [ ] Regression View

     Diff two prompt versions' eval results per model, with a cost
     delta. This is what turns "what changed" (free via git,
     ADR-002) into "did it get better" (this feature).

     Prerequisites: #21, #22
     Teaches: Reading git history programmatically for a version
              list, comparison UI design, why evals + version
              history are one feature, not two
     Week: 13
     NOTE: This absorbs the old #22-#24 (version history / diffs /
     rollback) — most of that is now free via git; the part that
     isn't free is comparing eval results across versions, which
     is this feature.
     UPDATE (2026-08-04): ticket 23.3 adds handling for a replayed
     run whose pinned model snapshot (ADR-006) has since been
     retired by the provider — a clear message instead of a raw
     404 (audit finding #8).


#24 [ ] Committable Eval Baselines

     Save a suite's last-known-good results as a committable file
     (name.baseline.json) for CI comparison later.

     Prerequisites: #21
     Teaches: Why baselines belong in git next to the prompt and
              its test cases, not hidden in a database only you
              can query
     Week: 13-14


#25 [ ] Judge Golden-Set Validation Harness

     Validate the judge prompt itself against a small
     human-labeled golden set, since the judge is itself a
     versioned prompt that can drift or regress.

     Prerequisites: #19
     Teaches: Meta-testing — testing the thing that tests your
              tests — golden-set methodology
     Week: 14
     Priority: P2 (nice-to-have, not required for the pillar to be
     real).


PHASE 2 CHECKPOINT

After Phase 2, you can demonstrate:
- A working eval runner: assertions, LLM-as-judge, regression view,
  cost-aware by design
- Testing non-deterministic systems honestly (pass@k, thresholds,
  documented judge bias) — the strongest interview story available
- ≥ 10 of your own prompts with eval suites (prd.md §10 success
  metric)

Interview level: Mid to Senior — "I built the feature no
saved-prompts manager has, and I can explain why it's hard"

═══════════════════════════════════════════════════════
PHASE 3 — SHAREABLE (Weeks 16-20ish)
═══════════════════════════════════════════════════════

Theme: public dev tool (prd.md §9). Same core, more interfaces:
CLI and CI on top of dashboard + MCP. OSS launch gate sits at the
end of this phase (employer OK + real progress to show,
prd.md §11.2 items 4 and 6).

Ring: 1 (open source: files, CLI, MCP, IDE, CI).


#26 [ ] CLI Tool

     Terminal access: promptmuster run <name> --model=... --var k=v,
     list, search, eval <name>, export, import, mcp (starts the
     stdio server). Thin shell over the same core library
     everything else imports.

     Prerequisites: #15, #20
     Teaches: CLI design, argument parsing (commander or
              hand-rolled), npm package publishing (npx promptmuster)
     Week: 16


#27 [ ] Prompt Export / Import (JSON/YAML)

     Export prompt collections as shareable files; import with
     schema-version validation and mismatch handling.

     Prerequisites: #08
     Teaches: Serialization format design, schema migration,
              validation for malformed/older input
     Week: 16-17
     NOTE: Mostly free via files already (prd.md §7.5) — this
     feature is the validation/migration layer on top, not the
     file format itself.


#28 [ ] CI GitHub Action for Evals

     A composite Action that runs promptmuster eval on changed
     prompts, compares against the committed baseline (#24),
     comments results on the PR, and fails on regressions beyond a
     threshold.

     Prerequisites: #20, #24, #26
     Teaches: GitHub Actions authoring, reusing CLI/core inside CI,
              automated quality gates for a non-deterministic
              system
     Week: 17-18
     NOTE: This is what replaced the old #32-#34 GitHub/GitLab
     PR-review webhooks — same webhook/CI learning, on-thesis
     instead of a second crowded "auto-review my PR" product
     (trd.md §10).
     UPDATE (2026-08-04, broader audit): qa-test-plan.md's TC-SEC-*/
     TC-E2E/TC-IF-* cases are stated as release-blocking, but no
     ticket in this chunk (or #17/#20/#23/#16) ever cited the TC-ID
     it's supposed to satisfy — a blocker with no ticket-level
     acceptance criterion has no forcing function to get written
     (finding #9). Ticket 28.1 now cites TC-IF-02/03 directly.


#29 [ ] Multi-Model Side-by-Side Comparison

     Run the same prompt against multiple models in the dashboard.
     Compare output, latency, and cost in one view.

     Prerequisites: #15
     Teaches: Parallel async operations, comparison UI, data
              normalization across providers
     Week: 18
     UPDATE (2026-08-04): ticket 29.2 adds a partial-failure layout
     — one column erroring while the others succeed is the common
     case with 3 live providers, not the exception (audit finding
     #6).


#30 [ ] Cost Dashboard

     Cost per execution, per prompt over time, monthly projection,
     model comparison — reading the run log SQLite already
     collects (#11).

     Prerequisites: #11, #14
     Teaches: Aggregation queries, data visualization, dashboard
              design over data you were already logging
     Week: 18-19


#31 [ ] Post-Run Quality Ratings

     Rate output quality after execution (thumbs up/down or 1-5
     stars). Feeds model recommendations later (Future tier).

     Prerequisites: #20
     Teaches: Feedback-loop design, subjective-data collection UX
     Week: 19
     Priority: P2.


#32 [ ] OSS Launch Readiness

     README + demo GIF, LICENSE (Apache-2.0, decided 2026-07-16),
     MCP registry/directory listing, employer-IP OK obtained
     (prd.md §11.2 #4) — the actual gate for going public, not a
     calendar date.

     Prerequisites: #16, #20, #26, #28 (the demo needs a working
                    MCP server + eval runner, per prd.md §11.2 #6)
     Teaches: What "portfolio-ready" actually requires beyond
              working code — licensing, a real README, a
              discoverable listing
     Week: 19-20
     NOTE: This is a launch milestone, not a coding feature — kept
     in the backlog because it's a real gate with real
     prerequisites, same as any other item here.
     POSITIONING: the README leads with "why I built my own" —
     honest placement next to promptfoo / Prompt Assay /
     PromptLayer (prd.md §11.1), competing on the combination they
     don't occupy: local-first + git-native files + MCP-in-IDE.
     Landscape awareness is part of the portfolio story, not a
     liability to bury.
     UPDATE (2026-08-04): ticket 32.4 ships 1-2 curated example
     `.prompt` files as starter content — a fresh install currently
     drops a stranger into a completely empty library with no
     example of the messages/variables/outputSchema shape (audit
     finding #4). Also: ticket 07.7 (keyboard-navigation audit
     against design-system.md §4's stated hard requirement) should
     land before this gate — "portfolio-ready" includes a11y that
     was never actually ticketed until now.


#32a [ ] Demo Site Landing Page

     The Pipeline C demo's root route becomes a real landing
     page (hero, screenshots, differentiation narrative, "try
     it live" CTA into the read-only Library/Run screens) —
     not a bare drop into sample data. Same deployment, same
     design-system.md tokens; no separate site/hosting tech
     (devops-cicd.md §3.4, resolved 2026-08-04).

     Prerequisites: #32 (demo site + README pitch exist),
                    #07.6 (screenshots need the visual-polish
                    pass landed first — screenshotting the
                    current stock-shadcn state would undercut
                    the pitch)
     Teaches: A landing page is a conversion surface, distinct
              from a README's discovery job; reusing committed
              positioning copy across two surfaces instead of
              writing it twice
     Week: Phase 3, immediately after #32
     NOTE: Closes the specific failure mode where the demo link
     is shared directly (Slack, Show HN, LinkedIn) with no
     README read first, so a visitor has zero framing.
     UPDATE (2026-08-04): ticket 32a.3 states responsiveness as
     this route's own explicit commitment, separate from the
     dashboard's deliberate desktop-only design — design-system.md
     has zero breakpoints anywhere, which is fine for the dense
     app but not for a page meant to be shared and opened on a
     phone first (audit finding #13).
     UPDATE (2026-08-04, broader audit): two more gaps in the demo
     itself, distinct from the landing-page work above — ticket
     32a.4 adds an incident-response story for the demo's client
     bundle itself being compromised (a bad deploy/dependency/
     injected script silently changing what the key-entry field
     does), which neither devops-cicd.md §3 nor disaster-
     recovery.md §2.3 currently cover beyond "is the demo down"
     (finding #13, this pass — distinct from the same-numbered
     UI/UX finding above, see tickets.md's note on the two audits'
     independent numbering). Ticket 32a.5 adds an explicit caveat
     that a pasted key is visible to any browser extension with
     host/network permissions, independent of the demo's XSS
     defenses (finding #18).


PHASE 3 CHECKPOINT

After Phase 3, you can demonstrate:
- Four interfaces (dashboard, MCP, CLI, CI) over one core library
- A public OSS repo with a live demo, a real README, and a listing
  someone else could find
- ≥ 1 person who isn't you has installed and run it (prd.md §10
  Tier 2 success metric)

Interview level: Senior — "I shipped a real developer tool with
multiple interfaces and clean internal architecture"

═══════════════════════════════════════════════════════
PHASE 4 — TEAM (Weeks 21+) — Ring 2
═══════════════════════════════════════════════════════

Theme: the monetization seam, and the deliberate home for NestJS +
PostgreSQL (trd.md §14.3 — product-vs-learning trade resolved in
favor of the local path staying serverless). Only pursued once Ring
1 (Phase 3) has actually validated the tool is worth teaming up
around.


#33 [ ] Repo-Based Sharing Workflows

     A shared prompt repo a team uses together — PRs reviewed like
     code, evals run in CI (#28) on every change. No server
     required for this part; it's git, same as Phase 1-3.

     Prerequisites: #27, #28
     Teaches: Team workflows built on files + git instead of a
              hosted product, "review a prompt like a code change"
              as a real practice
     Week: 21-22


#34 [ ] Dashboard for Non-Technical Consumers

     The Maya persona (prd.md §4.1): fill variables via the
     generated form, run, compare models, watch cost — never touch
     git or a terminal. Same dashboard as Phase 1-3, tuned for a
     different audience.

     Prerequisites: #29, #30
     Teaches: Designing the same feature set for a non-developer
              audience, the seam where Ring 2 monetization would
              live
     Week: 22-23


#35 [ ] NestJS Team API

     Wraps the same core library over HTTP for multi-user/hosted
     mode. This is where NestJS earns its place — deliberately NOT
     the local path (trd.md §1, §14.3).

     Prerequisites: #11, #33
     Teaches: NestJS modules/controllers/services/DTOs — the
              company stack — applied honestly at the tier where a
              network hop and a server actually make sense
     Week: 23-24


#36 [ ] PostgreSQL Team Backend

     Postgres implementation of the same repository interface
     SQLite implements locally (#11). Multi-user schema, same
     domain logic untouched.

     Prerequisites: #35
     Teaches: Schema design, migrations, ORM (Prisma or TypeORM),
              proving the Repository Pattern abstraction actually
              pays for itself when the backend really does change
     Week: 24-25
     ADR: ADR-003


#37 [ ] Access Controls & Multi-Tenant Auth

     Team accounts, permissions, and multi-tenant data isolation
     for the hosted mode.

     Prerequisites: #36
     Teaches: Multi-tenant architecture, auth, permission systems —
              deliberately deferred out of v1 scope until now
              (trd.md §12)
     Week: 25-26


#38 [ ] Optional Hosted/Team Mode

     Ship the actual hosted option — the monetization seam
     (prd.md §7.6 P2). Explicit opt-in, separate from local mode by
     design.

     Prerequisites: #35, #36, #37
     Teaches: Deployment models, the local-first vs. hosted trust
              boundary made concrete, packaging a "team tier" as a
              genuinely separate offering rather than a mode flag
     Week: 26-27


PHASE 4 CHECKPOINT

After Phase 4, you can demonstrate:
- The company's exact backend stack (NestJS + PostgreSQL), deployed
  at the tier where it's the honest architectural choice, not a
  local-first contradiction
- Multi-tenant architecture with access controls
- A real monetization seam, even if never pursued commercially

Interview level: Senior to Staff — "I know when NOT to reach for a
server, and I know how to add one correctly once the tier actually
calls for it"

═══════════════════════════════════════════════════════
FUTURE — DEFERRED / MAYBE (Ring 3, or "only if Phase 4 wins")
═══════════════════════════════════════════════════════

Explicit v1 non-goals (prd.md §3.4) or Ring 3 items (prd.md §4).
Independently valuable, no fixed order, build only if something
above has already proven its worth.


#39 [ ] Embeddings Infrastructure

     Generate and store embeddings for all prompts.

     Prerequisites: #09, external embedding API or local model
     Teaches: Embeddings, vector storage, batch processing,
              incremental updates
     NOTE: prd.md §3.4 explicitly calls embeddings "optional
     dessert, not a pillar" for early tiers — full-text search
     (#04) is enough for a personal library.


#40 [ ] Semantic Search

     Find prompts by meaning, not just keywords.

     Prerequisites: #39
     Teaches: Vector similarity search, ranking, hybrid search
              (keyword + semantic)


#41 [ ] Semantic Similarity / Duplicate Detection

     Warn if a new prompt is very similar to an existing one before
     saving ("87% similar to your code-review-thorough prompt").

     Prerequisites: #39
     Teaches: Cosine similarity, threshold tuning, UX for
              suggestions rather than hard blocks
     Priority: P2.


#42 [ ] Prompt Chains

     Sequences of prompts where one's output feeds the next's
     input.

     Prerequisites: #15, #09 (typed variables)
     Teaches: Pipeline orchestration, partial-failure recovery,
              DAG execution


#43 [ ] Usage Analytics

     Which prompts get used most, which models perform best, team
     usage patterns if Phase 4 team mode is enabled.

     Prerequisites: #20, #31, #37 (team usage patterns need team
                    mode to exist)
     Teaches: Analytics aggregation, privacy-respecting metrics


#44 [ ] Multi-Turn / Agentic Eval Support

     Extend the eval engine (Phase 2) to multi-turn and
     tool-calling flows, not just single-turn prompts.

     Prerequisites: Phase 2 complete
     Teaches: Why this is a research-grade problem, not a weekend
              extension
     NOTE: Explicit v1 non-goal (prd.md §3.4, trd.md §6.6) —
     deferred in writing on purpose, not an oversight.


#45 [ ] Prosumer Hosted Mode

     A standalone hosted product for prosumer/no-code operators —
     Ring 3.

     Prerequisites: Ring 2 (Phase 4) has actually validated demand
     Teaches: When "the same core, one more interface" stops being
              true and it's actually a different business
     NOTE: prd.md §4 is explicit: this is "a different business —
     only if Ring 2 wins," not a natural next step.


#46 [ ] Prompt Linter (schema-only, demoted)

     What's left of the old flagship linter once its one
     mechanical check (output matches declared schema) moved to
     eval assertions (#18): essentially nothing standalone. Only
     worth building if a rule-based check surfaces that genuinely
     can't be expressed as an eval property assertion.

     Prerequisites: #18
     Teaches: Recognizing when a planned feature has been fully
              absorbed by a different, more honest mechanism — and
              having the discipline not to rebuild it anyway
     NOTE: See RE-CUT NOTES above. This entry exists so the old
     #25's interview story ("I learned where rule-based NLP
     analysis breaks down") isn't silently lost — but expect not
     to build it.


═══════════════════════════════════════════════════════
RULES
═══════════════════════════════════════════════════════

1. Never skip a prerequisite to build a "cooler" feature.

2. Every feature ships with types, error handling, and
   at minimum a few tests before moving on.

3. If a feature takes longer than estimated, that's fine.
   Depth over speed.

4. Features may be reordered within a phase based on what
   you're learning at work or what interests you.

5. Features should NOT be reordered across phases without
   clear justification — recorded as an ADR if it's an
   architectural trade, or a completion-log note if it's just
   sequencing.

6. If work demands shift priorities, the backlog adapts.
   Features can be deprioritized but not deleted — cut items
   are recorded in the RE-CUT NOTES above, not silently dropped.

7. Each completed feature gets a commit, a note about
   what was learned, and an update to completion-log.md.

8. If prd.md or trd.md change in a way that affects sequencing,
   this file needs its own re-cut — don't let it silently drift
   out of sync the way the old backlog did for a day between
   2026-07-15 and 2026-07-16.


═══════════════════════════════════════════════════════
DEPENDENCY GRAPH
═══════════════════════════════════════════════════════

#01 CRUD
├── #02 Favoriting
│    └── #03 Filtering ──→ #06 Routing ──→ #07 UI
├── #04 Search (part of #03)
└── #05 Tags (part of #03)

#01-#07 (stable frontend)
└── #08 File Format & Parser
     ├── #09 Domain Model (messages/vars/params)
     │    ├── #10 Models & Pricing as Data
     │    │    └── #11 SQLite Runs/Logs
     │    │         └── #12 Single-Provider Execution
     │    │              ├── #13 Streaming
     │    │              ├── #14 Cost Preflight
     │    │              └── #15 Multi-Provider Execution
     │    │                   ├── #16 MCP Server (read+run)
     │    │                   ├── #17 Local Dashboard Security
     │    │                   ├── #29 Model Comparison
     │    │                   └── #42 Prompt Chains
     │    └── #16 MCP Server (list/get only need #08/#09)
     ├── #18 Eval Test Cases & Assertions
     │    ├── #19 LLM-as-Judge
     │    │    └── #20 Suite Runner
     │    │         ├── #21 Cost Controls & Caching
     │    │         │    └── #22 Determinism Handling
     │    │         │         └── #23 Regression View
     │    │         ├── #24 Committable Baselines
     │    │         ├── #26 CLI
     │    │         ├── #28 CI Eval Action (needs #24, #26 too)
     │    │         ├── #31 Quality Ratings
     │    │         └── #43 Usage Analytics
     │    ├── #25 Judge Golden-Set Harness
     │    └── #46 Prompt Linter (schema-only, likely moot)
     └── #27 Export/Import

#11 + #14 ──→ #30 Cost Dashboard
#15 + #30 ──→ #34 Non-Technical Dashboard
#11 + #33 ──→ #35 NestJS Team API ──→ #36 Postgres Team Backend
                                        └── #37 Access Controls
                                             └── #38 Hosted/Team Mode
#27 + #28 ──→ #33 Repo-Based Sharing
#16 + #20 + #26 + #28 ──→ #32 OSS Launch Readiness
#09 + external embeddings ──→ #39 Embeddings
                                ├── #40 Semantic Search
                                └── #41 Similarity Detection
Phase 2 complete ──→ #44 Multi-Turn/Agentic Evals
Phase 4 complete ──→ #45 Prosumer Hosted Mode
