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

**Note on audit references:** two independent audits both ran on 2026-08-04 and each has
its own 1-N finding numbering — the earlier UI/UX-and-product-feel pass (14 findings, cited
as "2026-08-04 audit finding #N" below) and a later broader pass across security,
architecture, testing, requirements, ops, business, and sequencing (26 findings, cited as
"broader audit finding #N" from here on). Where a bare "finding #N" appears without
"broader," it's the earlier UI/UX pass — check the surrounding text's topic, not just the
number, since the two numbering sets overlap (e.g. both have a "#2" and "#3").

**2026-08-04 audit addendum (UI/UX pass):** +~26 SP added across Tier 1 (07.7,
07.8), Phase 1 (08.6, 09.6, 09.7, 12.6, 12a.1-2, 13.3), Phase 2 (20.4, 23.3,
29.2 — 29 is actually a Phase 3 chunk, corrected placement), Phase 3 (32.4,
32a.3), and #11a (11a.2) — a "feels production-grade" pass (see
completion-log.md).

**2026-08-04 audit addendum (broader pass — security/architecture/testing/
requirements/ops/business/sequencing):** a further ~35 SP added, concentrated
in Phase 1: chunk #11 gained five new tickets (11.4-11.8, ~8 SP) plus scope
additions to 11.1; #12/#13's interface-design tickets gained scope (no new SP,
same tickets, higher stakes); #15 gained 15.4 (1 SP); #16's two tickets gained
critical scope (no new SP); #17 gained 17.3 (1 SP); #21 gained scope to 21.1
(no new SP); a new standalone chunk #14a (1 SP) in Phase 2; and #32/#32a
gained 32a.4-32a.5 (3 SP) plus scope to 32.2. Chunk #11a was also relocated
from Phase 1 to Phase 3 (its own stated dependencies were Phase 2/3 tickets —
the same class of sequencing bug already caught and fixed for #29, missed
here until this pass). Full finding-by-finding detail lives in this session's
conversation record, not duplicated here — this file carries the resulting
tickets, not the audit narrative. Both addenda together push Phase 1
noticeably heavier than its original ~80 SP estimate; the next Sunday review
should run the velocity-check step now added to README.md's Document
Maintenance table rather than carrying a stale total forward.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

---

## TIER 1 REMAINDER (Weeks 2-4)

Features #02-#05 are done and not re-ticketed. This is what's left to close
Tier 1.

### Chunk #01 — Prompt CRUD (finish)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [x] 01.1 | 2 | Edit flow: reuse PromptForm pre-filled, update via usePromptManager, cancel/save UX | — | Controlled-form reuse for create vs. edit, immutable update patterns |

### Chunk QA — Test Foundation (Week 2 priority, from completion-log)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [x] QA.1 | 1 | Vitest + React Testing Library setup, first trivial passing test, npm script | — | Test-runner config, jsdom environment |
| [x] QA.2 | 2 | usePromptManager tests: CRUD, favorite toggle, filter/search derived state | QA.1 | Testing hooks with renderHook, arrange-act-assert |
| [x] QA.3 | 1 | createPrompt / utils tests incl. edge cases (empty tags, id uniqueness) | QA.1 | Pure-function testing, edge-case selection |

### Chunk #06 — Next.js Routing

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [x] 06.1 | 2 | App Router structure: root layout, `/prompts` list page, move SPA content in | — | Layouts vs. pages, server/client component split |
| [x] 06.2 | 2 | Prompt detail page `/prompts/[id]` + not-found handling | 06.1 | Dynamic routes, param typing, 404 states |
| [x] 06.3 | 2 | Editor routes: `/prompts/new` + `/prompts/[id]/edit` sharing the form | 06.2, 01.1 | Route-level code sharing, redirect-after-save |
| [x] 06.4 | 2 | Filters/search as URL state (searchParams), shareable filtered views + settings page stub | 06.1 | URL as state store, when not to use useState |

### Chunk #07 — Professional UI (shadcn/ui)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [x] 07.1 | 2 | Tailwind v4 + shadcn init (Base UI, base-lyra), design-system §2.1 tokens, globals migration; flip CLAUDE.md CSS conventions | — | Design-token setup, documented convention flips |
| [x] 07.2 | 3 | Migrate primitives app-wide (Button, Input, Select, Textarea, Badge, Card) — exceeded scope, incl. page.tsx | 07.1 | Component-library adoption in an existing codebase |
| [x] 07.3 | 2 | Form-field components + EmptyState a11y pass ("no prompts" vs "filtered out") | 07.2 | Composition with primitives, accessibility basics |
| [x] 07.4 | 2 | Delete-confirm dialog (shadcn AlertDialog) — carried from Week 1; deferred to Week 4 | 07.2 | Destructive-action UX, controlled dialog state |
| [x] 07.5 | 2 | Dark-mode activation: toggle + `prefers-color-scheme`, per design-system §5 (tokens already set Week 2) | 07.1 | Class-based dark mode, theme switching (Week 3, Sat with 06.4). **Shipped better than spec'd**: server-read cookie via `cookies()`, not `localStorage` + inline script — see completion-log.md Week 3 |
| [x] 07.6 | 3 | Design-system application pass: kill the gradient `Header` (never migrated by 07.2 — it only touched primitives, not layout chrome), style prompt titles as real headings (not default `<a>` styling), replace the unicode favorite star with a designed icon component, apply design-system.md's actual 14px type scale + spacing rhythm, move "Load Sample Data" out of production layout (dev-only affordance) | 07.2, 07.3 | Closing the gap between a documented design system and what's actually rendered; auditing your own past work against a spec written after it — **DONE same day, 2026-08-04**: gradient removed, titles styled via `CardTitle`, star replaced with a phosphor icon, sample-data button gated to `NODE_ENV !== 'production'`, type scale/spacing applied app-wide as real CSS custom properties matching design-system.md §2.2 exactly |
| [~] 07.7 | 2 | Keyboard-navigation audit across every ia.md §4 flow (design-system.md §4 states this as a hard requirement — "must be completable without a mouse" — but no ticket has ever enforced it; 2026-08-04 audit finding #11). Do this before #32's launch gate, not automatically covered by 07.3's a11y pass | 07.6 | A stated non-functional requirement is only real once something is scheduled to verify it — **PARTIAL as of 2026-08-10**: found and fixed via ad hoc full-app audits, not the ia.md §4 walkthrough this ticket actually scopes — `AlertDialog`'s Base UI focus trap didn't reliably wrap Tab at the boundary (fixed with a manual handler, verified live + via an isolated RTL test), the Prompt Detail back-link had no focus-visible ring, `DeleteConfirmDialog` defaulted focus to the destructive button instead of Cancel (fixed via `initialFocus`), `PromptCard`'s stretched-link card had no focus ring on its actual clickable area (fixed via a `focus-visible:ring` on the link's `::after` pseudo-element). Still needed: the actual flow-by-flow ia.md §4 walkthrough |
| [x] 07.8 | 2 | Interaction feedback + motion policy: decide which actions get a toast vs. inline feedback vs. silence (save/delete/run/eval — only 2 toasts exist anywhere in the doc set today), then wire design-system.md §2.6's motion tokens into real hover/tab/dialog transitions instead of leaving them defined-but-unapplied, the same gap 07.6 just closed for color/type/spacing (2026-08-04 audit findings #5, #12) | 07.6 | Tokens and rules on paper aren't real until something is scheduled to apply them — **DONE 2026-08-09/10**: audited save/delete/favorite-toggle/filter-change against the policy — save stays silent-via-navigation since the toast this policy names is tied to file-write/auto-commit, which doesn't exist until Week 5 (a stand-in toast would overstate what the app does); wired `--duration-fast/base/slow` + `--ease-standard` into `globals.css`, `AlertDialog`'s open/close, `ThemeToggle`'s icon swap, and the `Select` dropdown; added a global `prefers-reduced-motion: reduce` collapse that didn't exist before |

**Tier 1 exit:** backlog TIER 1 CHECKPOINT holds. `#07` reopened to `[~]`
2026-08-04 when 07.6/07.7/07.8 were found; 07.6 landed the same day, closing
`#07` back to `[x]` (see backlog.md note). `07.7`/`07.8` are separate
follow-on tickets from the same audit and don't gate `#07` itself — `07.8`
is now done too (2026-08-09/10); `07.7` stays `[~]` (partial).

---

## PHASE 1 — USEFUL TO ME

### Chunk #08 — Prompt File Format & Parser (dotprompt, ADR-005)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [x] 08.1 | 2 | Spike: read dotprompt spec, hand-write 3 sample `.prompt` files from existing prompts, pin down the `promptmuster:` extension block + `schemaVersion` placement (short written note) | — | Reading a spec before coding, extension-vs-fork discipline — **DONE 2026-08-09**: `docs/prompt-file-format-spike.md` (160 lines) + 3 real `.prompt.md` files in `examples/prompts/`; extension data lives at `ext.promptmuster` (a bare top-level `promptmuster:` key is silently dropped by a real dotprompt parser, verified against google/dotprompt); two grammar ambiguities left explicitly open for 08.3, not glossed over |
| [x] 08.2 | 2 | Core package scaffold: framework-free `core/` lib (ADR-001), PromptFile types, typed ParseError | 08.1 | Package boundaries, dependency direction (core imports nothing above it) — **DONE 2026-08-09, hardened 2026-08-10**: `core/prompt-file.ts` + `core/parse-error.ts` at the repo root (not `src/`), boundary enforced by `eslint.config.mjs`'s `no-restricted-imports` scoped to `core/**/*.ts` — verified to actually fire via a throwaway violation file, not just assumed. Hardened same week: the eslint guard didn't catch `require()`/dynamic `import()`, and the root tsconfig's `dom` lib let a stray browser global type-check fine inside "framework-free" core — closed with `no-restricted-syntax` plus a standalone `core/tsconfig.json` (`npm run typecheck:core`) |
| [ ] 08.3 | 3 | Parser: `.prompt` → domain object (frontmatter + role-tagged body), refuse unknown major schemaVersion, error messages worth reading | 08.2 | YAML/frontmatter parsing, schema versioning as a contract |
| [ ] 08.4 | 2 | Serializer: domain → `.prompt` file; round-trip property tests (parse∘serialize = id) | 08.3 | Round-trip testing, canonical formatting |
| [ ] 08.5 | 3 | File index: scan the prompt directory, load/validate all, in-memory index, re-scan on change | 08.3 | Filesystem as database, index invalidation |
| [ ] 08.6 | 2 | Detect external file change while the Editor is open (git branch switch or an out-of-band edit) — warn before a save silently overwrites it, instead of the current no-story gap (2026-08-04 audit finding #7) | 08.5, 09.5 | A git-native tool's actual daily-use failure mode, not an edge case |

### Chunk #09 — Domain Model Rewrite (messages/vars/params, trd §3)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 09.1 | 2 | New domain types: role-tagged messages[], typed variables, model params; map from old `content: string` shape | 08.2 | Migrating a shipped domain type, why now is the cheapest moment |
| [ ] 09.2 | 3 | Migrate usePromptManager + list/card/filter components to the new shape | 09.1 | Sweeping a type change through consumers without breaking behavior |
| [ ] 09.3 | 3 | Editor UI for role-tagged messages (system/user blocks, add/remove) | 09.2, 07.3 | UI for structured content vs. one big textarea |
| [ ] 09.4 | 3 | Typed-variable UI: declare variables, `{{var}}` highlighting in body, dynamic fill form per type (string/select/file) | 09.3 | Schema-driven form generation |
| [ ] 09.5 | 3 | Wire dashboard to the file-backed library: route handlers import core, replace in-memory store; migrate seed prompts to `.prompt` files | 08.5, 09.2 | Repository swap in practice, files as the source of truth |
| [ ] 09.6 | 2 | Domain-specific validation UX: a `{{var}}` used in the body but not declared, a malformed `outputSchema`, an unrecognized model ID — clear inline messages naming the actual problem, not generic red-border-plus-text (design-system.md §3's Input/Textarea error state is generic; 2026-08-04 audit finding #9) | 09.3, 09.4 | Domain-aware error messaging vs. generic form validation |
| [ ] 09.7 | 2 | Library at scale: sort (recency / last-run / cost once #30 exists) + pagination or virtualization once the library holds 100+ prompts — every doc's own example uses a handful (2026-08-04 audit finding #10) | 09.5 | Designing for the size the product will actually reach, not the demo size |

### Chunk #10 — Models & Pricing as Data (ADR-006)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 10.1 | 2 | Models table {provider, snapshotId, contextWindow, input/output price} + seed with current snapshots | 09.1 | When a union type should become data |
| [ ] 10.2 | 2 | Kill the Model union: model picker + all consumers read the table; stale-string migration for existing prompts | 10.1 | Data-driven UI, migration mechanics |

### Chunk #11 — SQLite Runs & Logs (ADR-002/003/008)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 11.1 | 2 | Run domain type + RunRepository interface (the seam Postgres implements later). **Resolve two design questions here, not later** (2026-08-04 audit findings #4, #6): (a) Postgres access is necessarily async — a sync-returning method can't be reused by an async driver, so design every repository method to return `Promise<T>` from day one even though better-sqlite3 itself is sync, or the Phase-4 swap becomes a breaking signature change across core/CLI/MCP/dashboard; (b) decide what a run against *uncommitted* edits records for its "prompt version" field — forcing the last real commit sha silently misrepresents what was actually sent, for what's likely the majority case while iterating | 09.1 | Repository Pattern designed against the interface, not the driver — including the axis (sync vs. async) that would otherwise only surface when the second implementation is built |
| [ ] 11.2 | 3 | better-sqlite3 implementation + schema bootstrap/migration on first run | 11.1 | Sync SQLite API, schema evolution for a local file DB |
| [ ] 11.3 | 2 | Runs list view reading from the repo (empty until execution exists — that's fine) | 11.2, 06.1 | Building the read path before the write path exists |
| [ ] 11.4 | 2 | Define the actual SQLite migration mechanism: a `schema_migrations` table or version pragma, forward-only migration files, and a pre-migration snapshot (cheaper than the "scheduled backup" idea disaster-recovery.md already rejected) — currently only "versioned migration files, no ORM" is stated with no numbering/tracking/detection convention (2026-08-04 audit finding #5) | 11.2 | Schema evolution needs a convention before the schema changes twice, not after |
| [ ] 11.5 | 2 | Resolve SQLite multi-process write concurrency: WAL mode + `busy_timeout`, since dashboard-open-while-CLI/MCP/CI-Action-writes is an ordinary workflow this architecture guarantees, not an edge case (2026-08-04 audit finding #19) | 11.2 | The first correctness problem a "no server, no setup" pitch actually needs solved |
| [ ] 11.6 | 2 | Run-lifecycle reconciliation: on startup, transition any row still "streaming"/"running" from a dead process into "interrupted"; add the `runs purge` command trd.md already commits to — neither has a ticket today despite being firm design commitments (2026-08-04 audit finding #11) | 11.2 | A crashed process is a normal failure mode to design for, not an exception |
| [ ] 11.7 | 1 | `promptmuster db export` — dump runs/results to portable JSON, and correct the onboarding copy that recommends a git remote so it doesn't imply run/cost history is covered too (it isn't — only the prompt library is) (2026-08-04 audit finding #12) | 11.2 | The cheap middle ground between "no backup" and "automatic scheduled backup" |
| [ ] 11.8 | 1 | Detect schema-version skew on restore: `PRAGMA integrity_check` only catches physical corruption, not a restored backup reflecting an older migration state than the installed binary expects (2026-08-04 audit finding #23) | 11.4 | Corruption and version-skew are different failure classes needing different diagnostics |

**Chunk #11a (Library Home Summary Strip) relocated to Phase 3, after #30 — see there.**
*(Moved 2026-08-04, audit finding #24: it was sequenced here in Phase 1 despite 11a.1
needing `30.1` and 11a.2 needing `23.2`, both later-phase tickets — the same class of
dependency-ordering bug already caught and fixed for #29 in the original re-cut.)*

### Chunk #12 — Single-Provider Execution (raw fetch, ADR-004)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 12.1 | 2 | ProviderAdapter interface: execute() as async iterable, countTokens(), price(); typed Result at the boundary (trd §11). **Also design a hook for function-calling/structured-output enforcement here** — prompt files already carry `outputSchema` and the Phase-2 eval engine's schema assertion depends on it, but OpenAI/Anthropic/Gemini each enforce output shape through structurally different mechanisms with no representation in a flat `execute()` call (broader audit finding #7) — resolving this now avoids a breaking interface change after Phase 2 is already built on top of it | 10.2, 11.1 | Designing the abstraction before the second implementation exists — including the axis most likely to break it |
| [ ] 12.2 | 2 | API-key handling: env/keychain read in core, settings UI status (never the key itself), scaffold .gitignore | 12.1 | Secret handling (threat-model P1), config layering |
| [ ] 12.3 | 3 | Anthropic adapter: raw fetch, non-streaming happy path, real request/response logged and understood | 12.1, 12.2 | The actual wire format under the SDKs (ADR-004's point) |
| [ ] 12.4 | 2 | Error taxonomy: fail fast on 400/401, retry/backoff on 429/503, typed errors surfaced to UI | 12.3 | Retry discipline, distinguishing caller bugs from transient faults |
| [ ] 12.5 | 3 | Run page: pick prompt → fill variables → execute → render result; persist run via repository | 12.3, 09.4, 11.2 | End-to-end slice through every layer built so far |
| [ ] 12.6 | 2 | Designed error-state screens for Run: rate-limited, invalid key, timeout, dropped mid-stream — ux-flows.md's seven journeys are happy-path only today even though trd.md §5.3/§11's error taxonomy exists underneath (2026-08-04 audit finding #1). With 3 live providers these aren't edge cases, they're routine | 12.4 | Designing the failure the architecture already anticipates, not just the success path |

### Chunk #12a — Provider Onboarding & Key Health (2026-08-04 audit findings #2, #3)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 12a.1 | 2 | First-run provider setup flow: Settings → Providers actually walks a first-time user through adding a key, rather than silently requiring an env var it never mentions (currently buried as a sub-clause of 12.2, not its own experience) | 12.2 | Onboarding as a designed flow, not an assumed prerequisite |
| [ ] 12a.2 | 2 | "Test connection" / key-health affordance per provider — verify a key works before it's trusted to spend money on a real run, the way promptfoo/PromptLayer surface connectivity status | 12a.1 | Cheap trust-building UI before the expensive action it gates |

### Chunk #13 — Streaming

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 13.1 | 3 | SSE parsing → one internal Chunk type; adapter execute() yields progressively. **`Chunk` needs a usage/token field**, not just `{text, done}` — the runs schema requires `input_tokens`/`output_tokens`/`cost_usd` per run, and each provider surfaces usage differently mid-stream (or only on a final chunk); resolve how `price(usage, model)` gets its `Usage` object before Phase 2's eval cost controls are built assuming it exists (broader audit finding #8) | 12.3 | Server-Sent Events, async iterables end-to-end — including where the data for cost accounting actually comes from |
| [ ] 13.2 | 2 | Progressive UI render + cancel mid-stream; persist partial/final state correctly | 13.1, 12.5 | Streaming UX, abort handling, backpressure basics |
| [ ] 13.3 | 1 | Stream-drop recovery: a connection lost mid-stream shows what was received + a clear "incomplete" marker, not a silently truncated result treated as final (part of 2026-08-04 audit finding #1) | 13.2, 12.6 | Distinguishing "finished" from "stopped" in a streamed UI |

### Chunk #14 — Token Counting & Cost Preflight

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 14.1 | 2 | Instant heuristic estimate while typing (debounced), clearly labeled "estimate" | 12.5 | Honest labeling of approximations, debounce in practice |
| [ ] 14.2 | 2 | Anthropic count-tokens API for exact count on demand, labeled "exact" | 12.3 | Why token counting isn't provider-agnostic (tiktoken is wrong for Claude) |
| [ ] 14.3 | 1 | Cost preflight: tokens × models-table prices shown before run | 14.1, 10.1 | Pricing lookup as data, the differentiator trd §5.4 names |

### Chunk #15 — Multi-Provider Execution

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 15.1 | 3 | OpenAI adapter behind the same interface + local tiktoken exact counting | 12.4, 14.2 | Second implementation stress-tests the abstraction |
| [ ] 15.2 | 3 | Google adapter + its count-tokens API | 15.1 | Third data point; what's genuinely common vs. provider-specific |
| [ ] 15.3 | 2 | Provider-conformance suite: one spec run against all three adapters with fixtures | 15.2 | Contract testing, recorded fixtures vs. live calls |
| [ ] 15.4 | 1 | Recurring fixture-drift check: a periodic (or manually-triggered) task that validates recorded fixtures against a real, deliberately-limited live call per provider — otherwise a silent provider API change could make an adapter subtly wrong while its fixture suite stays green forever, and the project's own "no automated test ever makes a billed call" rule removes the only mechanism that would catch it (broader audit finding #10) | 15.3 | Test fixtures need a refresh mechanism, not just an initial recording |

### Chunk #16 — MCP Server (ADR-007 — the flywheel)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 16.1 | 3 | Stdio MCP server (TS SDK): list_prompts + get_prompt from the file index. **Early-start: only needs 08.5/09.5 — pull forward to start the flywheel before execution exists.** **CRITICAL — carry the external-origin flag (P5) into `get_prompt`'s response and `list_prompts`' summaries, visible to the calling agent/client** (broader audit finding #1, the audit's single Critical): the confirm-gate on `run_prompt` protects the *spend* decision, but the actual T1 injection threat lands the moment `get_prompt` hands attacker-controlled file text back — a normal, encouraged, zero-spend action that today carries zero signal. This doesn't fully close the threat (agent-side handling is out of PromptMuster's control) but nothing currently even flags it at read time | 08.5, 09.5 | MCP protocol, tool schema design for a non-human consumer — and where a threat model's stated mitigation doesn't actually cover its own named scenario |
| [ ] 16.2 | 3 | run_prompt with confirm-before-spend enforced server-side (trd §12). **Also enforce the P5 untrusted-content confirm-gate inside core itself**, not just as client-side convention — T2 already forced budget enforcement (P2) into core for exactly this reason (a non-cooperating MCP client skips client-side checks), but the content-trust gate never got the same fix (broader audit finding #2). **Define "external-origin" concretely before building this** — git author/committer? path outside a designated directory? differing remote? — naive heuristics fail the threat model's own opening scenario (adopting a teammate's/public library wholesale): path-based flags nothing, authorship-based flags everything forever | 16.1, 15.3, 14.3 | Confirmation UX for a tool that spends real money — and closing the same enforcement hole already found and fixed once for spend, not yet for content trust |
| [ ] 16.3 | 2 | Register in Claude Code/Cursor, dogfood a full week, fix the top friction items | 16.1 | Eating your own dogfood as a design method; §10's success metric starts here |

### Chunk #17 — Local Dashboard Security Hardening (threat-model T3/T4)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 17.1 | 2 | Bind **every route handler, not only state-changing ones**, to 127.0.0.1 + validate Origin/Host (widened 2026-08-04, broader audit finding #3 — the original state-changing-only scope left read routes serving T3-sensitive run history uncovered, and DNS rebinding defeats the CORS read/write distinction for GETs too). Satisfies TC-SEC-* release-blocking cases (qa-test-plan.md §5) — cite the TC-ID here when picked up | 12.5 | Why "it's just localhost" isn't a boundary (CSRF/DNS-rebinding) |
| [ ] 17.2 | 2 | Secret-scan variable values (request side), warn-before-run (run history persists what was sent). Satisfies TC-SEC-* release-blocking cases (qa-test-plan.md §5) — cite the TC-ID here when picked up | 12.5 | Secret-scanning heuristics, warn-vs-block UX |
| [ ] 17.3 | 1 | Extend the secret scan to the response side too — a secret can be echoed back in the model's own output (e.g. reviewing a diff that quotes a token), which T3's scan doesn't cover today, and this product's review/eval workloads make that common (broader audit finding #17) | 17.2 | A preventive control scoped to only one side of a round-trip misses the other | backlog PHASE 1 CHECKPOINT holds — and you're using the MCP
server ≥4 days/week without forcing it (prd §10 Tier 1).

---

## PHASE 2 — TRUSTWORTHY (the flagship)

### Chunk #18 — Eval Test Cases & Core Assertions

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 18.1 | 3 | `.eval.yaml` sibling-file format + parser (test cases: variable values + assertion list) | 08.3 | Test-file-beside-source design applied to prompts |
| [ ] 18.2 | 2 | Assertions: exact, contains, regex — with a common AssertionResult shape | 18.1 | Why exact-match alone is useless for non-deterministic output |
| [ ] 18.3 | 3 | Schema assertion (ajv against the prompt's outputSchema) + property checks (length, format, must-not-contain) | 18.2 | JSON Schema validation, provider structured-output limits |

### Chunk #19 — LLM-as-Judge

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 19.1 | 3 | Judge assertion: rubric prompt, cheap model (haiku-class), score parsing, failure mode when the judge itself errors | 18.2, 15.3 | Using a model to grade a model, rubric design |
| [ ] 19.2 | 2 | Judge prompt stored as a versioned `.prompt` file; documented bias notes (verbosity, position, self-preference) | 19.1 | Dogfooding your own format; documenting known bias instead of ignoring it |

### Chunk #20 — Eval Suite Runner

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 20.1 | 3 | Matrix expansion (version × model × case) + sequential runner + report model (pass/fail + cost). Satisfies TC-EVAL-* release-blocking cases (qa-test-plan.md §5) — cite the TC-ID here when picked up | 18.3, 19.1 | Summarizing heterogeneous assertion results into one report |
| [ ] 20.2 | 3 | Bounded concurrency: worker pool, per-provider rate limits, backoff under matrix load | 20.1 | Concurrency control when you're firing many paid requests |
| [ ] 20.3 | 3 | Suite results UI: matrix grid, per-cell drill-down, total cost | 20.1, 07.3 | Dense-data UI design |
| [ ] 20.4 | 2 | Errored-cell state for the matrix: design-system.md's Table row component only has pass/fail — a timed-out or rate-limited cell in an otherwise-successful matrix needs its own distinct treatment, not a forced pass/fail (2026-08-04 audit finding #6) | 20.3, 12.6 | Modeling three outcomes (pass/fail/errored) instead of forcing a binary |

### Chunk #21 — Cost Controls & Caching (threat-model P2)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 21.1 | 3 | Content-addressed result cache keyed on hash(CACHE_SCHEMA_VERSION + resolved messages + model + params + input); re-run only what changed. **Add a concurrency guard around the check-then-insert** — under 20.2's own bounded-concurrency worker pool, two test cases resolving to the same cache key can both miss the cache simultaneously and both pay for the provider call, defeating the cache's entire cost-control purpose in exactly the concurrency model it's designed to run under (broader audit finding #20) | 20.1 | Content-addressed caching, wholesale invalidation via the version constant — and why check-then-insert needs a lock under real concurrency |
| [ ] 21.2 | 2 | Budget cap per run enforced in core (estimate up front, confirm if over) — no client can bypass | 21.1, 14.3 | Cost safety as a hard guarantee, not a UI nicety |

### Chunk #22 — Determinism Handling

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 22.1 | 3 | Repeat runs / pass@k + score thresholds so run-to-run noise isn't reported as regression | 20.2, 21.1 | Testing non-deterministic systems honestly — the strongest interview story (prd §10) |

### Chunk #23 — Regression View

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 23.1 | 2 | Read a prompt file's version list from git log programmatically | 09.5 | Git as the version store you already have (ADR-002 payoff) |
| [ ] 23.2 | 3 | Diff two versions' eval results per model + cost delta view. Satisfies TC-EVAL-08 and related release-blocking cases (qa-test-plan.md §5) — cite the TC-ID here when picked up | 23.1, 22.1 | "What changed" (git) vs. "did it get better" (this) — one feature, not two |
| [ ] 23.3 | 1 | Deprecated-model handling on replay: a pinned snapshot (ADR-006) that the provider has since retired shows a clear "no longer available" message instead of a raw provider 404 (2026-08-04 audit finding #8) | 23.2, 10.1 | Reproducibility pinning has a lifespan — design for the day the pin expires |

### Chunk #24 — Committable Baselines

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 24.1 | 2 | `name.baseline.json` write/read + compare-to-current | 21.1 | Baselines in git beside the prompt, not hidden in a DB |

### Chunk #25 — Judge Golden-Set Harness (P2 — skippable)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 25.1 | 3 | Small human-labeled golden set + harness validating the judge prompt against it | 19.2 | Meta-testing: testing the thing that tests your tests |

### Chunk #14a — Start the Employer IP Conversation (not a coding ticket)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 14a.1 | 1 | Send the employer IP-clearance ask now, with real lead time — not at the Phase-3 gate it currently blocks. Define who it goes to, what "written OK" means concretely, and what happens on "no"/"not as-is." Do this **before** any internal pilot demo (prd §10's separate Tier-3 metric) — showing a working pilot first changes negotiating leverage on ownership, and the two threads were never reconciled (broader audit finding #14) | — | Sequencing a business/legal dependency by actual lead time, not by convenience |

**Phase 2 exit:** backlog PHASE 2 CHECKPOINT holds — including ≥10 of your own
prompts with eval suites (prd §10).

---

## PHASE 3 — SHAREABLE

### Chunk #26 — CLI

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 26.1 | 2 | CLI scaffold (thin shell over core): `list`, `search`, `mcp` (starts stdio server) | 16.1 | CLI design, argument parsing |
| [ ] 26.2 | 2 | `run <name> --model=... --var k=v` with streaming output | 26.1, 15.3 | TTY streaming, exit codes |
| [ ] 26.3 | 2 | `eval <name>` with pass/fail summary + budget flags | 26.2, 22.1 | The same core surface through a third interface |
| [ ] 26.4 | 2 | npm packaging: bin setup, `npx promptmuster` works clean-machine | 26.3 | npm publishing, package.json bin mechanics |

### Chunk #27 — Export / Import

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 27.1 | 1 | Export collections (JSON/YAML) via CLI + dashboard | 26.1 | Serialization is nearly free when prompts are already files |
| [ ] 27.2 | 2 | Import with schema-version validation + mismatch/malformed handling | 27.1 | Defensive parsing of other people's files |

### Chunk #28 — CI GitHub Action

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 28.1 | 3 | Composite Action: run `eval` on changed prompts in a PR. Satisfies TC-IF-02/03 release-blocking cases (qa-test-plan.md §5) — cite the TC-ID here when picked up | 26.3, 24.1 | GitHub Actions authoring, change detection |
| [ ] 28.2 | 3 | Baseline compare + PR comment + fail on regression beyond threshold | 28.1 | Automated quality gates for a non-deterministic system |
| [ ] 28.3 | 2 | Fork-PR safety: estimate-only mode / budget guard (threat-model T8) | 28.2 | CI abuse surfaces when strangers can open PRs |

### Chunk #29 — Side-by-Side Comparison

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 29.1 | 3 | Same prompt against N models in parallel: output, latency, cost columns (ux-flows Flow 3) | 15.3, 13.2 | Parallel async operations, normalization across providers |
| [ ] 29.2 | 2 | Partial-failure layout: one column erroring while the others succeed is the common case with 3 live providers, not a rare one — each column needs an independent error state, not a whole-screen failure (2026-08-04 audit finding #6) | 29.1, 12.6 | Designing for partial success as the default, not the exception |

### Chunk #30 — Cost Dashboard

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 30.1 | 2 | Aggregation queries over the run log: per prompt, per model, over time, monthly projection | 11.2, 14.3 | SQL aggregation over data you were already logging |
| [ ] 30.2 | 2 | Cost views/charts (use the dataviz skill, per compliance-matrix finding #3) | 30.1 | Dashboard design, honest visualization |

### Chunk #11a — Library Home Summary Strip (ia.md §8 Q5; relocated here 2026-08-04, audit finding #24)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 11a.1 | 2 | Summary strip component above Library: prompt count, runs today, cost this week; renders nothing/neutral when data is empty | 11.3, 30.1 | Aggregation over already-logged data, graceful-empty UI design |
| [ ] 11a.2 | 1 | Surface local eval regressions in the strip itself ("2 prompts regressed since last edit") — today regressions only reach a PR comment (28.2), so working locally means remembering to open Eval Results to notice anything broke, which undercuts Phase 2's own "Trustworthy" theme (2026-08-04 audit finding #14) | 11a.1, 23.2 | Proactive trust signals vs. reactive-only CI checks |

### Chunk #31 — Quality Ratings (P2 — skippable)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 31.1 | 2 | Post-run thumbs/stars stored on the run record | 12.5 | Subjective-data collection UX |

### Chunk #32 — OSS Launch Readiness (gate, not calendar)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 32.1 | 2 | README with the "why I built my own" positioning (backlog #32 POSITIONING) + demo GIF | 16.3, 26.4 | Portfolio storytelling, honest competitive placement |
| [ ] 32.2 | 1 | Launch gate checklist: employer written OK (see 14a.1, started in Phase 2), LICENSE present, PromptMuster rename verified everywhere, **a one-line trademark/NOTICE statement alongside the LICENSE** — Apache-2.0 explicitly disclaims trademark rights, so nothing else protects the name a future paid tier would depend on recognizing (broader audit finding #25) | 32.1 | What "ready to go public" actually requires |
| [ ] 32.3 | 1 | Repo public + MCP registry/directory listing | 32.2 | Discoverability mechanics |
| [ ] 32.4 | 1 | Ship 1-2 curated example `.prompt` files as starter content for a fresh `npx promptmuster`/OSS install — otherwise a new user hits a completely empty library with no example of the messages/variables/outputSchema shape (2026-08-04 audit finding #4) | 26.4 | The difference between "I get it" and "now what" for a stranger's first five minutes |

### Chunk #32a — Demo Site Landing Page (devops-cicd.md §3.4)

| ID | SP | Ticket | Needs | Teaches |
|---|---|---|---|---|
| [ ] 32a.1 | 2 | Landing route for the Pipeline C demo: hero, pitch, "try it live" CTA into read-only Library/Run | 32.1, 07.6 | Landing page as a conversion surface, distinct from a README's discovery job |
| [ ] 32a.2 | 1 | Real screenshots + the #32 differentiation narrative reused (not rewritten) on the landing route | 32a.1 | Reusing committed copy across surfaces instead of duplicating it |
| [ ] 32a.3 | 1 | Explicit responsive/mobile requirement for the landing route specifically — design-system.md has zero breakpoints anywhere (a defensible choice for the dense desktop dashboard), but this page will get shared via LinkedIn/Show HN and opened on a phone first (2026-08-04 audit finding #13). State it as two separate commitments: landing route is responsive, the app behind it stays desktop-only by design | 32a.1 | Not every surface in a product needs the same responsiveness commitment — naming which is which |
| [ ] 32a.4 | 2 | Incident-response story for the demo's client bundle itself being compromised (bad deploy, dependency, or injected script silently changing what the key-entry field does — e.g. exfiltrating a pasted key). Both devops-cicd.md §3 and disaster-recovery.md §2.3 only cover "is the demo down," mitigated by instant rollback — neither considers a credential-theft incident using PromptMuster's own deployed artifact as the vector against visitors who trusted the "we never see your key" claim (broader audit finding #13) | 32a.1 | The demo's trust claim depends on a specific client bundle being what was reviewed — that's a security property, not just an uptime one |
| [ ] 32a.5 | 1 | Add an explicit caveat shown before a visitor pastes their key: the key is visible in plaintext to any installed browser extension with host/network permissions, independent of the demo's own XSS defenses — and this pattern (browser-JS key transmission) is one most providers actively discourage, at odds with the doc series' "we never see your key" positioning if left unstated (broader audit finding #18) | 32a.1 | Being honest about a trust boundary the design doesn't fully control, not just the ones it does |

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
01.1 → 06.3          QA.1 → QA.2, QA.3        07.1 → 07.2 → 07.3 → 07.6 → 07.7, 07.8
08.1 → 08.2 → 08.3 → 08.4
              08.3 → 08.5 ─┬→ 09.5 ─┬→ 16.1 → 16.2, 16.3   (flywheel — earliest start)
                            08.5 → 08.6             │
08.2 → 09.1 → 09.2 ────────┘        │
                     09.2 → 09.3 → 09.6, 09.7        │
       09.1 → 10.1 → 10.2           │
       09.1 → 11.1 → 11.2 → 11.3    │
                       11.2 → 11.4 → 11.8            │
                       11.2 → 11.5                   │
                       11.2 → 11.6                   │
                       11.2 → 11.7                   │
10.2 + 11.1 → 12.1 → 12.2 → 12a.1 → 12a.2   12.2 → 12.3 → 12.4 → 12.6 → 15.1 → 15.2 → 15.3 ─┬→ 16.2
                            12.3 → 13.1 → 13.2 → 13.3 (needs 12.6)                           ├→ 26.2
                            12.3 → 14.2                                     15.3 → 15.4      └→ 29.1 → 29.2 (needs 12.6)
              12.5 → 17.1 → 17.2 → 17.3, 31.1          14.1 → 14.3 → 16.2, 21.2
18.1 → 18.2 ─┬→ 18.3 ─┬→ 20.1 → 20.2 → 22.1 → 23.2 → 23.3 (needs 10.1) ← 23.1
             └→ 19.1 ─┴→ 19.2 → 25.1
20.1 → 20.3 → 20.4 (needs 12.6)     20.1 → 21.1 ─┬→ 21.2
                                    └→ 24.1 → 28.1 → 28.2 → 28.3
16.1 → 26.1 → 26.2 → 26.3 → 26.4 → 32.1 → 32.2 (needs 14a.1) → 32.3
                            26.4 → 32.4
                     26.3 → 28.1
11.2 + 14.3 → 30.1 → 30.2
30.1 + 11.3 → 11a.1 → 11a.2 (needs 23.2)   (relocated to Phase 3, 2026-08-04 — see chunk #11a)
32.1 + 07.6 → 32a.1 → 32a.2, 32a.3, 32a.4, 32a.5
14a.1 (no deps — start in Phase 2, well before 32.2's gate)
```
