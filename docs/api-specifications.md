# PromptMuster — API Specifications

|             |                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Status**  | 📝 Draft v0.1 — companion to [trd.md §1, §7](trd.md), [ADR-001](adr/ADR-001-framework-free-core-library.md), [ia.md §5](ia.md) |
| **Owner**   | Shenbaga Srinivasan                                                                                                            |
| **Created** | 2026-07-15                                                                                                                     |

---

## 0. Read this first — there is no HTTP frontend/backend split in Phase 1–3

The phrase "the endpoints that let the frontend and backend talk to each other" assumes a
client calling a server over HTTP. That assumption is **wrong for most of this system**,
on purpose: [ADR-001](adr/ADR-001-framework-free-core-library.md) put the domain logic
in a framework-free library, and [trd.md §9](trd.md) is explicit that "route handlers /
server actions import core directly for local mode — no separate API tier until Phase 4."
The Next.js dashboard is not a frontend calling a backend; it's one more in-process caller
of the same library the CLI and MCP server also call directly. Spec'ing a REST API for
that relationship would document a boundary that doesn't exist.

What this system actually has is **three distinct contract surfaces**, only one of which
is a conventional client/server API:

| Surface                                                                 | What crosses it                                   | Is it "an API"?                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| **[§1](#1-surface-a--internal-core-library-api) Internal core library** | TypeScript function calls, in-process             | A contract in the "stable interface" sense, not a network one |
| **[§2](#2-surface-b--mcp-server-api) MCP server**                       | JSON-RPC-ish tool calls, IDE agent ↔ PromptMuster | Yes — the one real process-boundary contract in Phase 1–3     |
| **[§3](#3-surface-c--team-http-api-phase-4-only) Team HTTP API**        | REST, only in Phase 4                             | Yes, but doesn't exist yet                                    |

Each is spec'd below in its own native contract language — TypeScript signatures for the
library, JSON Schema for MCP tools, REST endpoint sketches for Phase 4 — rather than
flattening all three into one OpenAPI document that would misrepresent two of them.

---

## 1. Surface A — Internal core library API

Every CLI command, MCP tool, and dashboard route handler is a thin wrapper around these
functions. This is the surface [trd.md §1](trd.md)'s architecture diagram labels
"parse · resolve vars · execute · eval · cost · storage · index" — spelled out concretely.

| Module    | Function                                     | Input                                   | Returns                                                         | Throws                 | Used by                                         |
| --------- | -------------------------------------------- | --------------------------------------- | --------------------------------------------------------------- | ---------------------- | ----------------------------------------------- |
| Prompt    | `listPrompts(opts)`                          | `{category?, tag?, search?, favorite?}` | `PromptSummary[]`                                               | —                      | Library screen, MCP `list_prompts`, CLI `list`  |
| Prompt    | `getPrompt(slug)`                            | `slug: string`                          | `Prompt`                                                        | `PromptNotFoundError`  | Prompt Detail, MCP `get_prompt`, CLI            |
| Prompt    | `savePrompt(prompt)`                         | `Prompt`                                | `{slug, commitSha}`                                             | `ValidationError`      | Editor screen                                   |
| Prompt    | `resolveVariables(prompt, vars)`             | `Prompt, Record<string,string>`         | `ResolvedMessages`                                              | `MissingVariableError` | Run screen, `execute()`                         |
| Execution | `execute(req)`                               | `ExecutionRequest`                      | `AsyncIterable<Chunk>`                                          | `ProviderError`        | Run, Comparison, MCP `run_prompt`               |
| Execution | `countTokens(req)`                           | `ExecutionRequest`                      | `TokenCount` (flags exact vs. estimate — [trd.md §5.4](trd.md)) | —                      | Cost preflight badge                            |
| Execution | `estimateCost(req)`                          | `ExecutionRequest`                      | `CostEstimate`                                                  | —                      | Cost preflight badge, MCP `run_prompt(dry_run)` |
| Eval      | `runEvalSuite(slug, opts)`                   | `slug, {models: string[]}`              | `AsyncIterable<EvalResultEvent>`                                | —                      | Eval Run screen                                 |
| Eval      | `compareToBaseline(evalRunId, baselinePath)` | ids                                     | `RegressionReport`                                              | —                      | Eval Run regression view                        |
| Eval      | `saveBaseline(evalRunId, path)`              | ids                                     | `void`                                                          | —                      | "Save as baseline" action                       |
| Cost      | `getCostSummary(range)`                      | `DateRange`                             | `CostSummary`                                                   | —                      | Cost dashboard                                  |
| Storage   | `queryRuns(filter)`                          | `RunFilter`                             | `ExecutionRun[]`                                                | —                      | Runs screen, Run Detail                         |
| Storage   | `getRun(id)`                                 | `id: string`                            | `ExecutionRun`                                                  | `RunNotFoundError`     | Run Detail                                      |

**Key shared types** (full field definitions live in [database-schema.md](database-schema.md)
and [trd.md §3](trd.md) — this is just enough to read the table above):

```ts
interface ExecutionRequest {
  promptSlug: string;
  variables: Record<string, string>;
  modelId: string; // FK to models.id, database-schema.md §2.1
}

interface Chunk {
  text: string;
  done: boolean;
}

interface CostEstimate {
  tokens: number;
  costUsd: number;
  isEstimate: boolean; // true for Anthropic/Google heuristic counts — trd.md §5.4
}
```

This surface has **no formal versioning** — it's internal to one codebase, not a contract
external callers depend on independently. See [§4](#4-cross-cutting-the-one-error-contract)
for how errors are represented consistently across this and the other two surfaces.

---

## 2. Surface B — MCP server API

The one real external contract in Phase 1–3 ([ia.md §5](ia.md),
[trd.md §7](trd.md)). Three tools, matching what's already been scoped — no more, no less.

### 2.1 `list_prompts`

Read-only, no confirmation required.

```json
{
  "name": "list_prompts",
  "description": "List prompts in the local library, optionally filtered by category, tag, or search text.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "category": { "type": "string" },
      "tag": { "type": "string" },
      "search": { "type": "string" }
    },
    "additionalProperties": false
  }
}
```

Result:

```json
{
  "prompts": [
    {
      "slug": "code-review-thorough",
      "title": "code-review-thorough",
      "category": "code-review",
      "model": "claude-opus-4-8",
      "favorite": false
    }
  ]
}
```

### 2.2 `get_prompt`

Read-only, no confirmation required. Returns enough for the calling agent to know what
variables it needs to fill and what the default model/pricing looks like.

```json
{
  "name": "get_prompt",
  "description": "Retrieve a prompt's full content, variables, output schema, and model configuration.",
  "inputSchema": {
    "type": "object",
    "properties": { "slug": { "type": "string" } },
    "required": ["slug"],
    "additionalProperties": false
  }
}
```

Result:

```json
{
  "slug": "code-review-thorough",
  "commitSha": "a3f9c12",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior engineer. Report only correctness bugs."
    },
    { "role": "user", "content": "Review this {{language}} diff:\n{{diff}}" }
  ],
  "variables": [
    { "name": "language", "type": "select" },
    { "name": "diff", "type": "file" }
  ],
  "model": {
    "id": "claude-opus-4-8",
    "provider": "anthropic",
    "inputPricePerMtok": 5.0,
    "outputPricePerMtok": 25.0
  },
  "outputSchema": null
}
```

### 2.3 `run_prompt`

**Spends real money and is confirm-gated** — see [§2.4](#24-the-confirm-before-spend-contract)
for how the gate actually works.

```json
{
  "name": "run_prompt",
  "description": "Execute a prompt with the given variables. Spends real money against the configured provider unless dry_run is set.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "slug": { "type": "string" },
      "variables": {
        "type": "object",
        "additionalProperties": { "type": "string" }
      },
      "model": {
        "type": "string",
        "description": "Override the prompt's default model"
      },
      "dry_run": {
        "type": "boolean",
        "default": false,
        "description": "If true, return a cost estimate only — do not call the provider or record a run."
      }
    },
    "required": ["slug", "variables"],
    "additionalProperties": false
  }
}
```

Result — `dry_run: true`:

```json
{
  "estimate": true,
  "estimated_tokens": 1150,
  "estimated_cost_usd": 0.006,
  "model": "claude-opus-4-8"
}
```

Result — `dry_run: false` (or omitted):

```json
{
  "output": "1. The optional-chaining fix on line 13 is correct...",
  "run_id": "b7e2...",
  "model": "claude-opus-4-8",
  "tokens": { "in": 1148, "out": 42 },
  "cost_usd": 0.0057
}
```

### 2.4 The confirm-before-spend contract

This is a **calling-convention contract, not a protocol-level handshake** — MCP has no
built-in "confirm before executing" step, so this is implemented as an expected two-call
pattern the agent follows, exactly as drawn in
[ux-flows.md Flow 6](ux-flows.md):

1. Agent calls `run_prompt` with `dry_run: true` (or reads pricing off an already-fetched
   `get_prompt` result) to get a cost estimate.
2. Agent surfaces that estimate to the user and waits for approval — this is agent/client
   behavior, not something the MCP server can enforce from its side.
3. Only after approval does the agent call `run_prompt` again with `dry_run` omitted.

The server-side reinforcement is tool annotation: `run_prompt` is marked non-read-only and
cost-incurring so MCP clients that support tool-risk hints surface their own confirmation
UI, but the actual approval step documented in [ux-flows.md](ux-flows.md) lives on the
client/agent side, not inside this server's tool schema.

**Enforcement counterpart (added v0.2):** because the above is only a convention, the
budget cap is enforced _inside core_ on every execution path — a client that skips the
dry-run handshake entirely still cannot exceed it ([threat-model.md P2/T2](threat-model.md);
verified by [qa-test-plan.md](qa-test-plan.md) TC-MCP-014 and TC-SEC-003).

### 2.5 v1 scope limit — worth stating explicitly

`run_prompt` executes against **one model per call**. Multi-model comparison
([ia.md §4.3](ia.md)) is a dashboard-only feature in v1 — an agent wanting to compare
models would need to call `run_prompt` twice, once per model, itself. This is a real,
current limitation, not an oversight; a `models: string[]` variant is a natural future
addition if MCP-driven comparison turns out to matter.

---

## 3. Surface C — Team HTTP API (Phase 4 only)

Doesn't exist yet. Sketched lightly, matching this doc series' own convention of not
over-designing what's two phases away — NestJS wraps the exact functions in
[§1](#1-surface-a--internal-core-library-api) behind REST, per
[ADR-001](adr/ADR-001-framework-free-core-library.md).

| Method | Path                      | Wraps                                    |
| ------ | ------------------------- | ---------------------------------------- |
| `GET`  | `/api/v1/prompts`         | `listPrompts()`                          |
| `GET`  | `/api/v1/prompts/:slug`   | `getPrompt()`                            |
| `POST` | `/api/v1/prompts`         | `savePrompt()`                           |
| `POST` | `/api/v1/runs`            | `execute()` (SSE response for streaming) |
| `GET`  | `/api/v1/runs/:id`        | `getRun()`                               |
| `GET`  | `/api/v1/runs`            | `queryRuns()`                            |
| `POST` | `/api/v1/evals/:slug/run` | `runEvalSuite()`                         |
| `GET`  | `/api/v1/cost/summary`    | `getCostSummary()`                       |

Full request/response schemas, auth (workspace-scoped per
[database-schema.md §8](database-schema.md)), and rate limiting are explicitly **not**
designed here — out of scope until Phase 4 planning, consistent with
[prd.md §7.6](prd.md).

---

## 4. Cross-cutting: the one error contract

A single set of error codes, represented differently per surface but never redefined per
surface — this is what [trd.md §11](trd.md)'s "typed results over thrown exceptions at
provider boundaries" note becomes concretely.

| Code               | Meaning                                                        | Surface A (throws)     | Surface B (MCP result)                 | Surface C (Phase 4 HTTP) |
| ------------------ | -------------------------------------------------------------- | ---------------------- | -------------------------------------- | ------------------------ |
| `PROMPT_NOT_FOUND` | slug doesn't resolve to a file                                 | `PromptNotFoundError`  | `{isError:true, error:{code,message}}` | `404`                    |
| `RUN_NOT_FOUND`    | run id doesn't exist                                           | `RunNotFoundError`     | same shape                             | `404`                    |
| `MISSING_VARIABLE` | a required `{{var}}` wasn't supplied                           | `MissingVariableError` | same shape                             | `400`                    |
| `VALIDATION_ERROR` | malformed prompt/eval file                                     | `ValidationError`      | same shape                             | `400`                    |
| `PROVIDER_ERROR`   | upstream OpenAI/Anthropic/Google call failed                   | `ProviderError`        | same shape                             | `502`                    |
| `BUDGET_EXCEEDED`  | run would exceed a configured cost cap ([trd.md §6.4](trd.md)) | `BudgetExceededError`  | same shape                             | `402`                    |
| `RATE_LIMITED`     | provider 429, retries exhausted ([trd.md §5.3](trd.md))        | `RateLimitError`       | same shape                             | `429`                    |

Surface B's MCP result shape for every error:

```json
{
  "isError": true,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "This run would exceed the $20.00 monthly cap by $3.40."
  }
}
```

---

## 5. What this document doesn't cover

**Outbound provider calls** (PromptMuster → OpenAI/Anthropic/Google) are a different API
relationship entirely — PromptMuster is the _client_ there, not the server. That contract is
already spec'd in [trd.md §5.1](trd.md)'s `ProviderAdapter` interface; this document isn't
duplicating it.

---

## 6. Open questions

1. **`list_prompts` pagination.** No page/cursor parameters yet — fine at a personal
   library's likely size (tens to low hundreds of prompts), worth revisiting if a shared
   team library (Phase 4) grows much larger.
2. **MCP tool versioning.** No breaking change has happened yet, so no versioning scheme is
   defined. Preference when it's needed: add optional fields rather than rename/break an
   existing tool.
3. **Should `run_prompt` support multi-model in one call?** Deliberately deferred —
   [§2.5](#25-v1-scope-limit--worth-stating-explicitly) states the current single-model
   limit explicitly rather than leaving it ambiguous.

---

## Changelog

- **v0.2 (2026-07-15)** — Reconciliation pass: §2.4 gains its enforcement counterpart —
  the budget cap is core-enforced on every path, so the confirm convention's weakness
  (threat-model T2) is bounded server-side.
- **v0.1 (2026-07-15)** — Initial spec. Three contract surfaces identified and spec'd
  natively (TypeScript signatures for the internal library, JSON Schema for MCP's three
  tools, a light REST sketch for the not-yet-built Phase 4 API); one shared error-code
  contract represented per surface; the MCP confirm-before-spend pattern documented as a
  calling convention, not a protocol feature; the single-model-per-call limitation on
  `run_prompt` stated explicitly rather than left implicit.
