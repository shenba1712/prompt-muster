# PromptMuster — QA Test Plans & Test Cases

|             |                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**  | 📝 Draft v0.1 — extends [compliance-matrix.md](compliance-matrix.md), tests against [api-specifications.md](api-specifications.md), [ux-flows.md](ux-flows.md), [design-system.md](design-system.md) §4, [threat-model.md](threat-model.md) |
| **Owner**   | Shenbaga Srinivasan                                                                                                                                                                                                                         |
| **Created** | 2026-07-15                                                                                                                                                                                                                                  |
| **Method**  | Every row in [compliance-matrix.md](compliance-matrix.md)'s 40 requirements (30 functional + 10 non-functional, as of matrix v0.2) gets a test-case reference here — this is that matrix's `Verify` column, made concrete.                  |

---

## 0. Scope & method

[compliance-matrix.md](compliance-matrix.md) proved every requirement has a _design_ home.
This document proves each one has a **test** — walking the same 40 requirement IDs against
the specs that have since been finalized ([api-specifications.md](api-specifications.md)'s
contracts, [ux-flows.md](ux-flows.md)'s drawn screens, [design-system.md](design-system.md)
§4's accessibility requirements, [threat-model.md](threat-model.md)'s policies) and writing
real test cases, not just re-stating verification _methods_.

**"Total coverage" means every requirement has an accounted-for test, not that every one has
a fully-written procedure today.** Detailed step-by-step cases are written for the
highest-value/highest-risk areas ([§3](#3-detailed-test-cases)); the rest get a clear
mapping in [§2](#2-traceability-matrix) — some to a one-line planned case, a few
explicitly marked **blocked-pending-design** where writing a real test is impossible until
a flagged gap closes. Claiming otherwise would be dishonest busywork, not coverage.

**A genuine finding from doing this cross-reference:** compliance-matrix.md flagged
FR-EXE-05 (model comparison) as a design gap — but [ux-flows.md Flow 3](ux-flows.md) has
since drawn the actual comparison screen. That gap is now substantially closed. Feeding
this status update back to compliance-matrix.md is queued for the reconciliation pass, not
silently edited in now — consistent with how this whole doc series handles cross-doc
findings.

---

## 1. Test strategy

| Level                    | Tool                                                     | What it covers                                                                                                                      | Ever calls a real provider?            |
| ------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Unit**                 | Vitest                                                   | Parser, cost calc, template interpolation, assertion evaluators — pure functions ([trd.md §11](trd.md))                             | No                                     |
| **Integration**          | Vitest + recorded fixtures                               | Provider adapters, eval engine against a deterministic fake provider ([trd.md §6.3](trd.md), [devops-cicd.md §1.1](devops-cicd.md)) | **No — fixtures only, always**         |
| **Contract**             | Schema validation                                        | MCP tool calls against [api-specifications.md](api-specifications.md)'s exact JSON Schemas                                          | No                                     |
| **E2E**                  | Playwright _(recommended — see [§6](#6-open-questions))_ | Full user journeys, [ux-flows.md](ux-flows.md)                                                                                      | No — mocked provider responses         |
| **Security**             | Vitest + static checks                                   | [threat-model.md](threat-model.md)'s policies P1–P7                                                                                 | No                                     |
| **Accessibility**        | axe-core + manual keyboard pass                          | [design-system.md §4](design-system.md)                                                                                             | N/A                                    |
| **Manual / exploratory** | —                                                        | Anything tagged `manual` in compliance-matrix.md                                                                                    | Only here, deliberately, at low volume |

**One rule that holds everywhere except manual exploratory testing:** no automated test
suite ever makes a real, billed provider call. This isn't just cost hygiene — a flaky
provider response must never fail an unrelated PR, and [devops-cicd.md §1.1](devops-cicd.md)
already committed the CI pipeline to this. This document extends that rule to _all_
automated levels, not just CI.

---

## 2. Traceability matrix

Every requirement ID from [compliance-matrix.md §1–7](compliance-matrix.md), mapped to its
test case(s). IDs referencing `TC-*` are detailed in [§3](#3-detailed-test-cases); a plain
description means the case is scoped but not yet written out.

### Library

| ID        | Requirement                                                   | Test coverage                                                                                             |
| --------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| FR-LIB-01 | Prompts as files                                              | TC-LIB-01, TC-LIB-02, TC-E2E-001                                                                          |
| FR-LIB-02 | CRUD via dashboard + CLI                                      | TC-E2E-001, TC-LIB-03 (read), TC-LIB-04 (edit → new commit, never overwrite), TC-LIB-05 (delete)          |
| FR-LIB-03 | Typed variables + dynamic form                                | TC-LIB-06 (auto-detect `{{var}}`), TC-LIB-07 (form renders correct input per `variable.type`)             |
| FR-LIB-04 | Search/filter over file-backed library                        | **Blocked-pending-design** — compliance-matrix.md's ⚠️ gap; no indexing design exists yet to test against |
| FR-LIB-05 | Optional output schema                                        | TC-LIB-09 (accepts conforming output, rejects non-conforming)                                             |
| FR-LIB-06 | Duplicate-on-save warning                                     | 🔮 Future — no test planned yet                                                                           |
| FR-LIB-07 | Git-remote-as-backup recommendation at first run (added v0.2) | TC-LIB-10 — first-run flow surfaces the recommendation; dismissible; skipping it never blocks setup       |

### Execution

| ID        | Requirement                 | Test coverage                                                                                   |
| --------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| FR-EXE-01 | Execute vs. one provider    | TC-EXE-01                                                                                       |
| FR-EXE-02 | Multi-provider              | TC-EXE-02 (same request shape across all 3 adapter fixtures)                                    |
| FR-EXE-03 | Streaming                   | TC-EXE-03, TC-PERF-002                                                                          |
| FR-EXE-04 | Keys from keychain/env only | TC-SEC-001, TC-SEC-002                                                                          |
| FR-EXE-05 | Model comparison            | TC-E2E-002 — **substantially un-gapped since compliance-matrix.md**, see [§0](#0-scope--method) |
| FR-EXE-06 | Pre-execution cost estimate | TC-EXE-04 (estimate correctly labeled per-provider), TC-COST-02                                 |

### Evaluation

| ID         | Requirement                                | Test coverage                                               |
| ---------- | ------------------------------------------ | ----------------------------------------------------------- |
| FR-EVAL-01 | Attach test cases                          | TC-EVAL-04 (parse `.eval.yaml`, stable `test_case_key`)     |
| FR-EVAL-02 | Assertions: exact/contains/schema/property | TC-EVAL-03, TC-EVAL-04                                      |
| FR-EVAL-03 | LLM-as-judge                               | TC-EVAL-05                                                  |
| FR-EVAL-04 | Run suite, summarize pass/fail + cost      | TC-EVAL-11                                                  |
| FR-EVAL-05 | Result caching + budget cap                | TC-EVAL-01, TC-EVAL-02, TC-EVAL-07, TC-SEC-003              |
| FR-EVAL-06 | Regression view                            | TC-EVAL-08                                                  |
| FR-EVAL-07 | Repeat runs / determinism thresholds       | TC-EVAL-06                                                  |
| FR-EVAL-08 | Committable baselines                      | TC-EVAL-09                                                  |
| FR-EVAL-09 | Judge golden-set harness                   | Planned only — Phase 2→3 boundary item, no case written yet |

### Cost & observability

| ID         | Requirement                        | Test coverage                                                             |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------- |
| FR-COST-01 | Log every execution                | TC-COST-01 (every `execute()` call — success _or_ failure — writes a row) |
| FR-COST-02 | Cost dashboard visualizations      | **Blocked-pending-design** — same status as compliance-matrix.md's ⚠️ gap |
| FR-COST-03 | Post-run ratings → recommendations | 🔮 Future — no test planned                                               |

### Interfaces

| ID       | Requirement   | Test coverage                                                                                  |
| -------- | ------------- | ---------------------------------------------------------------------------------------------- |
| FR-IF-01 | MCP server    | TC-MCP-001 through TC-MCP-015 ([§3.1](#31-mcp-tool-contract-tests))                            |
| FR-IF-02 | Web dashboard | TC-E2E-001, TC-E2E-002, TC-E2E-003–007 (allocated, undetailed — [§3.5](#35-e2e-ui-flow-tests)) |
| FR-IF-03 | CLI           | TC-IF-01 (CLI output matches calling core directly — contract parity)                          |
| FR-IF-04 | CI Action     | TC-IF-02 (pass case posts correct PR comment), TC-IF-03 (regression fails the check)           |
| FR-IF-05 | Export/import | TC-IF-04 (export → import round-trips to an identical prompt)                                  |

### Sharing / team (Phase 4)

| ID         | Requirement             | Test coverage                                      |
| ---------- | ----------------------- | -------------------------------------------------- |
| FR-TEAM-01 | Repo-based sharing      | Planned only — Phase 4                             |
| FR-TEAM-02 | Non-technical dashboard | 🔮 Future                                          |
| FR-TEAM-03 | Postgres backend        | 🔮 Future, blocked on D3 (compliance-matrix.md §8) |

### Non-functional

| ID     | Requirement                                 | Test coverage                                                                                                                               |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | Local-first, no unwanted network calls      | TC-SEC-007, TC-NFR-01 (no traffic to any PromptMuster-owned host in normal operation)                                                       |
| NFR-02 | Prompt-injection trust boundary             | TC-SEC-006, TC-EXE-05n (external-origin prompt requires confirm)                                                                            |
| NFR-03 | Secrets redacted from logs                  | TC-SEC-001                                                                                                                                  |
| NFR-04 | SQLite/Postgres via one interface           | TC-NFR-02 (identical suite passes against both engines — the concrete test of [ADR-003](adr/ADR-003-sqlite-local-postgres-team.md)'s claim) |
| NFR-05 | Reproducibility (pinned snapshot + sha)     | TC-NFR-03 (stored `resolved_messages_json` reproduces the exact request even after the source file changes)                                 |
| NFR-06 | Cost safety                                 | TC-SEC-003, TC-EVAL-07                                                                                                                      |
| NFR-07 | Bounded concurrency                         | TC-PERF-001                                                                                                                                 |
| NFR-08 | Retry/backoff on 429/503, fail-fast on 4xx  | TC-EXE-06                                                                                                                                   |
| NFR-09 | Dashboard origin validation (added v0.2)    | TC-SEC-004 — the test predated the requirement ID; now anchored                                                                             |
| NFR-10 | Secret-pattern warn-before-run (added v0.2) | TC-SEC-005 — same: test existed, requirement ID added in reconciliation                                                                     |

---

## 3. Detailed test cases

### 3.1 MCP tool contract tests

Directly against [api-specifications.md §2](api-specifications.md)'s JSON Schemas — the
most precise, contract-driven surface in the system, and the one where explicit test cases
pay off most.

| ID         | Case                                      | Expected result                                                                                                                                                        |
| ---------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-MCP-001 | `list_prompts`, no filters                | Returns every prompt in the library                                                                                                                                    |
| TC-MCP-002 | `list_prompts`, `category` filter         | Only matching-category prompts returned                                                                                                                                |
| TC-MCP-003 | `list_prompts`, `search` filter           | Matches title/content substring                                                                                                                                        |
| TC-MCP-004 | `list_prompts`, empty library             | Returns `{"prompts": []}` — **not** an error                                                                                                                           |
| TC-MCP-005 | `get_prompt`, valid slug                  | Full messages/variables/model/outputSchema returned                                                                                                                    |
| TC-MCP-006 | `get_prompt`, unknown slug                | `PROMPT_NOT_FOUND` error shape                                                                                                                                         |
| TC-MCP-007 | `get_prompt`, missing `slug`              | Rejected by schema validation before reaching core                                                                                                                     |
| TC-MCP-008 | `run_prompt`, `dry_run: true`             | Returns estimate only; **zero** provider calls; **zero** `execution_runs` rows written                                                                                 |
| TC-MCP-009 | `run_prompt`, `dry_run` omitted           | Executes for real; returns `output`/`run_id`/`tokens`/`cost_usd`; row written                                                                                          |
| TC-MCP-010 | `run_prompt`, missing a required variable | `MISSING_VARIABLE`                                                                                                                                                     |
| TC-MCP-011 | `run_prompt`, unknown slug                | `PROMPT_NOT_FOUND`                                                                                                                                                     |
| TC-MCP-012 | `run_prompt`, `model` override            | Uses the override, not the prompt's configured default                                                                                                                 |
| TC-MCP-013 | `run_prompt`, provider times out          | `PROVIDER_ERROR`, `isError:true` — **never** an unhandled throw across the MCP boundary                                                                                |
| TC-MCP-014 | `run_prompt`, would exceed budget cap     | `BUDGET_EXCEEDED`, and the provider is **never called** — proves [threat-model.md P2](threat-model.md) holds even when a client skips the `dry_run` confirm convention |
| TC-MCP-015 | Any tool, extra/unknown property in input | Rejected — every schema declares `additionalProperties: false`                                                                                                         |

**Cross-surface error contract** — one parametrized test across every row of
[api-specifications.md §4](api-specifications.md)'s table: for each code
(`PROMPT_NOT_FOUND`, `RUN_NOT_FOUND`, `MISSING_VARIABLE`, `VALIDATION_ERROR`,
`PROVIDER_ERROR`, `BUDGET_EXCEEDED`, `RATE_LIMITED`), assert Surface A throws the matching
typed class **and** Surface B returns the matching `isError` JSON — same underlying
condition, both representations checked in one test per code (TC-ERR-01 through TC-ERR-07).

### 3.2 Eval engine tests

The differentiator ([prd.md §6.2](prd.md)) — where a subtle bug (a cache false-positive, a
budget check that fires too late) would be most damaging.

| ID         | Case                                                                   | Expected result                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-EVAL-01 | Run the same (prompt content + variables + model + params) twice       | Second call is a cache **hit** — no new provider call; the new `eval_result` points at the _existing_ `execution_run` ([database-schema.md §2.5](database-schema.md))                                    |
| TC-EVAL-02 | Change any one of {prompt content, variables, model, params}, re-run   | Cache **miss** — a new `execution_run` is created                                                                                                                                                        |
| TC-EVAL-03 | `exact` / `contains` / `regex` / `property` assertions                 | Each passes/fails per its own defined rule, independent of the others                                                                                                                                    |
| TC-EVAL-04 | `schema` assertion against the prompt's declared `outputSchema`        | Conforming output passes; a missing required field fails, with a specific validation message                                                                                                             |
| TC-EVAL-05 | `llm-judge` assertion                                                  | Produces `judge_score` + `judge_rationale`; `passed` is derived from `score ≥ threshold`, never left null on completion                                                                                  |
| TC-EVAL-06 | A known-flaky case run under pass@k                                    | Majority-vote semantics applied — a single bad draw doesn't flip the suite's overall verdict ([trd.md §6.3](trd.md))                                                                                     |
| TC-EVAL-07 | Suite run whose remaining cases would exceed the configured budget cap | Halts before the over-cap call; reports "N of M cases run, halted on budget" — not a silent partial result                                                                                               |
| TC-EVAL-08 | Baseline at 6/6 passing; new run at 5/6                                | `RegressionReport` correctly names the newly-failing case, not just a pass-count delta                                                                                                                   |
| TC-EVAL-09 | "Save as baseline"                                                     | Writes a `.baseline.json` matching [trd.md §3](trd.md)'s exact shape — diffable, committable                                                                                                             |
| TC-EVAL-10 | Two test cases in the same `.eval.yaml`, reordered                     | `test_case_key` stability holds — results still map to the same logical case after reordering ([database-schema.md §7](database-schema.md)'s open question, now testable once the key requirement lands) |
| TC-EVAL-11 | Suite spans 2 models × 3 cases                                         | Summary reports total cost and pass/fail correctly cross-tabulated, not just a flat list                                                                                                                 |

### 3.3 Security verification tests

Turns [threat-model.md](threat-model.md)'s policies from prose into pass/fail checks —
this is what makes "total coverage" mean something beyond functional correctness.

| ID         | Verifies                      | Case                                                                                               | Expected result                                                                                             |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| TC-SEC-001 | P1                            | Grep full log output (success _and_ error paths) for the configured API key substring              | Zero matches, always                                                                                        |
| TC-SEC-002 | P1                            | Pass an API key as a CLI flag                                                                      | Rejected/ignored — only env/keychain accepted                                                               |
| TC-SEC-003 | P2, [T2](threat-model.md)     | Call `execute()` directly (bypassing any UI) with a request that would exceed the budget cap       | `BUDGET_EXCEEDED` raised **before** any provider network call — not caught after the spend already happened |
| TC-SEC-004 | [T4](threat-model.md)         | POST to a dashboard route handler with a forged/mismatched `Origin` header                         | Rejected (403); `execute()` never invoked                                                                   |
| TC-SEC-005 | [T3](threat-model.md)         | Run a prompt with a variable value matching a known secret pattern (e.g. an AWS-key-shaped string) | Warn-before-run fires ahead of the provider call                                                            |
| TC-SEC-006 | P5, NFR-02                    | Attempt to execute a flagged external-origin prompt without confirmation                           | Blocked                                                                                                     |
| TC-SEC-007 | [T9](threat-model.md), NFR-01 | Use the demo site's client-side key field                                                          | Network traffic goes **only** to the provider's own API host — never to any PromptMuster-owned origin       |
| TC-SEC-008 | P7                            | Inspect the local SQLite file's permissions after creation                                         | `0600`                                                                                                      |

### 3.4 Accessibility tests

Directly against [design-system.md §4](design-system.md)'s stated requirements — concrete
enough to test, so they get tested, not just asserted in a design doc.

| ID         | Case                                                                         | Expected result                                                             |
| ---------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| TC-A11Y-01 | Every semantic foreground/background pair actually used in a component       | Passes WCAG AA (4.5:1 body, 3:1 large/UI)                                   |
| TC-A11Y-02 | Tab through every interactive element on a screen                            | A visible `:focus-visible` ring on each, no dead stops                      |
| TC-A11Y-03 | axe-core pass on every screen                                                | Every icon-only control (e.g. `FavoriteButton`) has an accessible name      |
| TC-A11Y-04 | Measure icon-only touch targets                                              | ≥ 44×44px hit area, even where the visible icon is smaller                  |
| TC-A11Y-05 | Complete each of [ux-flows.md](ux-flows.md)'s 7 journeys using keyboard only | No step requires a mouse                                                    |
| TC-A11Y-06 | Set `prefers-reduced-motion: reduce`, repeat key interactions                | All durations collapse; no transform-based transitions remain               |
| TC-A11Y-07 | Inspect every status badge (pass/fail/warning/review) in rendered markup     | Always icon + label together — never a bare color swatch as the sole signal |

### 3.5 E2E UI flow tests

Two of [ux-flows.md](ux-flows.md)'s seven journeys detailed in full to establish the
pattern; the remaining five (TC-E2E-003 through 007 — Eval, History/Rollback, MCP, CI) get
equivalent E2E coverage using the same shape, allocated but not re-derived here in full —
repeating the same level of step-by-step detail five more times would be bulk without
proportional new insight.

**TC-E2E-001 — Create and save** ([ux-flows.md Flow 1](ux-flows.md)):
Library shows 2 existing cards → New Prompt → fill title/category/model/messages →
`{{language}}`/`{{diff}}` auto-detected as chips → Save. Assert: file written at the
correct path, a new git commit created, Library now shows a 3rd card with a "new"
indicator, and a save toast is shown.

**TC-E2E-002 — Run and compare** ([ux-flows.md Flows 2–3](ux-flows.md)):
Prompt Detail → Run tab → fill variables → cost badge shows an estimate labeled "est." →
Run → assert the streaming state renders (visible cursor) → assert the completed state
shows real cost/tokens/latency → select a 2nd model → Run 2 models → assert the Comparison
layout renders two independent columns, each with its own cost/latency.

### 3.6 Performance & cost-safety tests

| ID          | Case                                                 | Expected result                                                                                                 |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| TC-PERF-001 | Eval suite with many test cases × models             | Concurrent in-flight provider calls never exceed the configured worker-pool limit ([trd.md §5.2, §6.4](trd.md)) |
| TC-PERF-002 | Streaming a long response                            | First token renders before the full response arrives — not batched                                              |
| TC-COST-02  | Preflight estimate vs. actual cost, non-OpenAI model | Estimate is visibly labeled as an estimate, never presented as exact ([trd.md §5.4](trd.md))                    |

---

## 4. Test data & fixtures

Recorded fixtures ([devops-cicd.md §1.1](devops-cicd.md)) need a small canned library per
provider adapter: a success response, streaming chunks, a 429 rate-limit, a 401 auth
failure, and a network timeout. Fixtures are versioned alongside adapter code and need
periodic refreshing — provider response shapes drift (the exact concern [trd.md §5.4](trd.md)
already raised about model IDs and pricing going stale applies equally to response shape).

The running example throughout this whole doc series — `code-review-thorough`,
Anthropic/OpenAI as the two providers — is the default fixture prompt, for the same
continuity reason [ux-flows.md §0](ux-flows.md) gave: one thread, followable across every
document.

---

## 5. Defect severity & release gates

| Severity     | Definition                                                                        | Example                                          |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Blocker**  | Data loss, a security test (TC-SEC-*) fails, or spend occurs without confirmation | TC-SEC-003 fails                                 |
| **Critical** | A core flow is broken with no workaround                                          | Can't save a prompt at all                       |
| **Major**    | A flow is degraded but a workaround exists                                        | Comparison renders but latency figures are wrong |
| **Minor**    | Cosmetic, non-blocking                                                            | A badge's spacing is off                         |

**Release gate:** no release ships with a failing TC-SEC-* case, full stop — no exceptions,
regardless of severity triage elsewhere. All P0 requirements ([compliance-matrix.md](compliance-matrix.md)'s
priority column) must be at 100% pass before a phase is considered complete.

---

## 6. Open questions

1. **E2E tool choice.** No prior doc picked one. **Recommending Playwright** — solid SSE/
   streaming support (this app streams constantly), the Next.js-recommended option,
   cross-browser. Open to reconsideration, not yet exercised by real test-writing.
2. **The five undetailed E2E flows** ([§3.5](#35-e2e-ui-flow-tests)) — TC-E2E-003 through
   007 are allocated ID slots, not yet written in step-by-step form. Writing them is
   mechanical once TC-E2E-001/002 establish the harness; not done here to avoid repetitive
   bulk.
3. **FR-LIB-04 / FR-COST-02 stay untestable until their design gaps close** — this document
   can't manufacture coverage for a screen that hasn't been designed. Tracked, not solved,
   here.

---

## Changelog

- **v0.2 (2026-07-15)** — Reconciliation pass: FR-LIB-07 (TC-LIB-10) and NFR-09/NFR-10
  rows added — notably, TC-SEC-004/005 already existed and only needed requirement
  anchors, which is the traceability system working as intended.
- **v0.1 (2026-07-15)** — Initial test plan. Extended all 40 compliance-matrix.md
  requirement rows with concrete test-case references; detailed MCP contract tests (15
  cases), eval engine tests (11 cases), security verification tests tied directly to
  threat-model.md's policies (8 cases), accessibility tests tied to design-system.md §4 (7
  cases), and 2 of 7 E2E journeys in full. Found that FR-EXE-05's design gap has been
  substantially closed by ux-flows.md since compliance-matrix.md was written — queued as a
  feedback item for the reconciliation pass.
