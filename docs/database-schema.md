# PromptMuster — Database Schema / ERD

| | |
|---|---|
| **Status** | 📝 Draft v0.1 — companion to [trd.md §4](trd.md), [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md), [ADR-003](adr/ADR-003-sqlite-local-postgres-team.md), [ADR-006](adr/ADR-006-models-and-pricing-as-data.md) |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-07-15 |
| **Engine** | SQLite (local, Phase 1+) → PostgreSQL (team tier, Phase 4) — one repository interface, per ADR-003 |

---

## 0. Read this first — the boundary this schema does *not* cross

The single most important fact about this schema: **prompts are not in it.**
[ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md) put prompts, eval test
cases, and eval baselines in git-tracked files, specifically so version history, diffing,
and sharing come free from git instead of being reimplemented as app features. A
conventional ERD tutorial would draw a `prompts` table with `eval_runs.prompt_id` as a
foreign key — **that would be wrong for this system.** This document only schemas what
actually lives in the database: execution runs, eval results, and reference data (models,
provider credential presence). Prompts, eval suites, and baselines appear here only as
**file-backed entities the database refers to by natural key**, never by foreign key —
see [§4](#4-file-backed-entities-not-in-this-database).

---

## 1. Entity overview

```
  DATABASE (SQLite local → Postgres team)          FILES (git, per ADR-002)
 ┌─────────────────────────────────────┐          ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
 │                                     │  natural  │ Prompt                  │
 │   models  ──1───*── execution_runs  │◄┄┄key┄┄┄┄┤ code-review-thorough.   │
 │                          │    ▲     │  (slug +  │   prompt.md             │
 │                          │    │     │  commit)  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
 │                          1    │*                          │ sibling
 │                          │    │                            ▼
 │                     eval_results             ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
 │                          │*                   │ EvalSuite               │
 │                          1                     │   code-review.eval.yaml│
 │                     eval_runs  ┄┄┄┄┄natural┄┄┄▶│                         │
 │                                 key (path)     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
 │                                                ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
 │                    provider_credentials        │ Baseline                │
 │                    (presence only — trd.md §12)│   code-review.baseline. │
 │                                                 │   json                 │
 └─────────────────────────────────────┘          └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Solid arrows = real foreign keys, enforced by the database. Dashed arrows = **soft
references** — a string the application resolves against the filesystem/git, not
something the database can join or enforce. [§5](#5-the-two-kinds-of-reference-and-why) explains why
that split exists and why it's deliberate, not a gap.

---

## 2. Tables

### 2.1 `models`

The models-as-data table ([ADR-006](adr/ADR-006-models-and-pricing-as-data.md)) —
edited via Settings → Models ([ia.md](ia.md)), never hardcoded. Every other table
references a model by its `id` here, which is the exact provider snapshot string
(`claude-opus-4-8`, `gpt-4o`), not a generic family name.

```sql
CREATE TABLE models (
  id                    TEXT PRIMARY KEY,       -- exact snapshot id, e.g. "claude-opus-4-8"
  provider              TEXT NOT NULL,          -- 'openai' | 'anthropic' | 'google'
  display_name          TEXT NOT NULL,
  context_window        INTEGER NOT NULL,
  max_output_tokens     INTEGER NOT NULL,
  input_price_per_mtok  REAL NOT NULL,
  output_price_per_mtok REAL NOT NULL,
  supports_streaming    INTEGER NOT NULL DEFAULT 1,  -- SQLite bool; Postgres: BOOLEAN
  deprecated            INTEGER NOT NULL DEFAULT 0,
  updated_at            TEXT NOT NULL               -- ISO-8601; Postgres: TIMESTAMPTZ
);
```

`deprecated` (not a hard delete) matters because historical `execution_runs` must keep
resolving to the model they actually ran against, even after a provider retires that
snapshot — deleting the row would break every past run's cost/context lookups.

### 2.2 `provider_credentials`

Presence and metadata only. **The actual secret is never in this table** — it lives in the
OS keychain or env, per [trd.md §12](trd.md). This table exists so Settings → Providers
can show "connected" / "last verified" without ever holding a key value in the local
database file.

```sql
CREATE TABLE provider_credentials (
  id                TEXT PRIMARY KEY,      -- uuid, crypto.randomUUID()
  provider          TEXT NOT NULL UNIQUE,  -- 'openai' | 'anthropic' | 'google'
  keychain_ref      TEXT NOT NULL,         -- opaque lookup key into the OS keychain, not the secret
  connected_at      TEXT NOT NULL,
  last_verified_at  TEXT                   -- nullable; null until a real call succeeds
);
```

### 2.3 `execution_runs`

Every single model call, from whichever surface triggered it — dashboard Run/Comparison,
MCP `run_prompt`, or CLI `run`. This is the one table [ia.md §4.6](ia.md) leans on to prove
"same core, many interfaces": an MCP-triggered run and a dashboard-triggered run are rows
in the exact same table, indistinguishable except by `source`.

```sql
CREATE TABLE execution_runs (
  id                    TEXT PRIMARY KEY,       -- uuid
  prompt_slug           TEXT NOT NULL,          -- soft ref — see §5
  prompt_commit_sha     TEXT NOT NULL,          -- soft ref — see §5
  model_id              TEXT NOT NULL REFERENCES models(id),
  variables_json        TEXT NOT NULL,          -- resolved {{var}} values used for this run
  resolved_messages_json TEXT NOT NULL,         -- the exact messages actually sent — see §2.3.1
  input_tokens          INTEGER,
  output_tokens         INTEGER,
  cost_usd              REAL,
  latency_ms            INTEGER,
  status                TEXT NOT NULL,          -- 'streaming' | 'succeeded' | 'failed' | 'cancelled' | 'interrupted'
                                                -- 'interrupted' (added v0.2): process died mid-run; set by the
                                                -- startup reconciliation scan (disaster-recovery.md §1.3)
  error_message         TEXT,                   -- nullable; only when status = 'failed'
  source                TEXT NOT NULL,          -- 'dashboard' | 'cli' | 'mcp' | 'ci' | 'eval'
  cache_key             TEXT NOT NULL,          -- hash(CACHE_SCHEMA_VERSION + prompt_commit_sha + variables
                                                --      + model_id + params) — see §6.2; version constant added
                                                -- v0.2 so cache-affecting changes can invalidate wholesale
                                                -- (disaster-recovery.md §1.4)
  created_at            TEXT NOT NULL
);
```

**2.3.1 — why `resolved_messages_json` is stored, not just referenced.** It would be
possible to reconstruct the exact prompt sent from `prompt_commit_sha` + `variables_json`
at read time instead of storing it. This schema stores it directly instead, because
reconstruction depends on the prompt file still being reachable at that exact commit —
true today, but not guaranteed forever (a rebased branch, a squashed history, a deleted
fork). [trd.md](trd.md)'s reproducibility requirement (NFR-05) is about being able to see
*exactly* what was sent for any past run, so this table is self-contained on that point
even if the git history it references is later disturbed.

### 2.4 `eval_runs`

One row per "Run Suite" action ([ia.md §4.4](ia.md)) — a single suite may execute across
several models at once.

```sql
CREATE TABLE eval_runs (
  id                    TEXT PRIMARY KEY,
  prompt_slug           TEXT NOT NULL,          -- soft ref — see §5
  prompt_commit_sha     TEXT NOT NULL,          -- the version being evaluated
  eval_suite_path       TEXT NOT NULL,          -- soft ref to the sibling *.eval.yaml — see §5
  models_json           TEXT NOT NULL,          -- array of model_id's evaluated in this run
  baseline_path         TEXT,                   -- soft ref to the *.baseline.json compared against, nullable
  total_cost_usd        REAL,
  status                TEXT NOT NULL,          -- 'running' | 'complete' | 'failed' | 'interrupted' (v0.2 — see §2.3)
  created_at            TEXT NOT NULL
);
```

### 2.5 `eval_results`

One row per (test case × model) inside an `eval_run`. Deliberately **does not duplicate**
tokens/cost/output — it wraps the `execution_run` that actually produced the result, and
adds the assertion verdict on top.

```sql
CREATE TABLE eval_results (
  id                TEXT PRIMARY KEY,
  eval_run_id       TEXT NOT NULL REFERENCES eval_runs(id),
  execution_run_id  TEXT NOT NULL REFERENCES execution_runs(id),
  test_case_key     TEXT NOT NULL,          -- stable id of the test case within the .eval.yaml — see §7
  assertion_type    TEXT NOT NULL,          -- 'exact' | 'contains' | 'regex' | 'schema' | 'property' | 'llm-judge'
  passed             INTEGER,               -- nullable while running; SQLite bool
  judge_score        REAL,                  -- nullable; only populated for 'llm-judge'
  judge_rationale    TEXT,                  -- nullable; only populated for 'llm-judge'
  created_at         TEXT NOT NULL
);
```

**Why wrap `execution_run` instead of storing output directly:** this is what makes the
eval cache ([trd.md §6.4](trd.md)) a real mechanism rather than a described intention — if
an `execution_run` with a matching `cache_key` already exists, the eval engine points a new
`eval_results` row at that *existing* row instead of spending money on a repeat call. The
cache isn't a separate structure bolted onto evals; it's just "reuse a row you already
have."

---

## 3. Relationships

| From | To | Kind | Cardinality |
|---|---|---|---|
| `execution_runs.model_id` | `models.id` | Foreign key | many → 1 |
| `eval_results.eval_run_id` | `eval_runs.id` | Foreign key | many → 1 |
| `eval_results.execution_run_id` | `execution_runs.id` | Foreign key | many → 1 |
| `execution_runs.prompt_slug` + `prompt_commit_sha` | Prompt file | **Soft** (natural key) | many → 1 |
| `eval_runs.prompt_slug` + `prompt_commit_sha` | Prompt file | **Soft** (natural key) | many → 1 |
| `eval_runs.eval_suite_path` | EvalSuite file | **Soft** (natural key) | many → 1 |
| `eval_runs.baseline_path` | Baseline file | **Soft** (natural key), nullable | many → 0..1 |

---

## 4. File-backed entities (not in this database)

Shown here only for the fields the database actually needs to cross-reference — their full
shape is [trd.md §3](trd.md)'s job, not this document's.

| Entity | File | Stable identifier the database stores |
|---|---|---|
| **Prompt** | `<slug>.prompt.md` | `prompt_slug` (the file's declared `name`) + `prompt_commit_sha` (git commit at run time) |
| **EvalSuite** | `<slug>.eval.yaml` (sibling) | `eval_suite_path`; each test case needs its own stable `key` — see [§7](#7-open-questions) |
| **Baseline** | `<slug>.baseline.json` (sibling) | `baseline_path` |

---

## 5. The two kinds of reference, and why

This schema deliberately uses two different reference mechanisms, and the difference isn't
arbitrary — it follows directly from which side of the [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md)
boundary each thing is on:

- **`models.id` is a real foreign key** because `models` is a database table
  ([ADR-006](adr/ADR-006-models-and-pricing-as-data.md)) — the database can enforce
  referential integrity, and a `JOIN` is just a `JOIN`.
- **`prompt_slug` + `prompt_commit_sha` is a soft, natural-key reference** because the
  Prompt is a *file*, not a row — the database has no way to enforce that a given slug and
  commit sha actually resolve to something on disk, and it shouldn't try to. The
  application layer resolves it (read the file at that git commit) when needed; the
  database just stores the pointer.

A schema that tried to make everything a foreign key would either require pulling prompts
into the database (undoing [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md)) or
faking referential integrity the database can't actually check. Better to be honest about
which references are enforced and which are resolved by convention.

---

## 6. Indexes & query patterns

Each index below is tied to a specific feature already specified elsewhere, not added
speculatively.

### 6.1 Cost dashboard ([ia.md](ia.md) `/cost`, compliance-matrix FR-COST-02)

```sql
CREATE INDEX idx_execution_runs_created_at   ON execution_runs(created_at);
CREATE INDEX idx_execution_runs_prompt_slug  ON execution_runs(prompt_slug, created_at);
CREATE INDEX idx_execution_runs_model_id     ON execution_runs(model_id, created_at);
```

Supports "cost by prompt over time," "cost by model," and monthly aggregation without a
full table scan.

### 6.2 Eval cache hit-check ([trd.md §6.4](trd.md))

```sql
CREATE INDEX idx_execution_runs_cache_key ON execution_runs(cache_key);
```

Before calling a provider, the eval engine checks this index for an existing row with a
matching `cache_key`. A hit means "this exact prompt content + variables + model + params
combination was already run" — reuse it, spend nothing.

### 6.3 Eval regression lookups ([ia.md §4.4](ia.md), [trd.md §6.5](trd.md))

```sql
CREATE INDEX idx_eval_runs_prompt_slug     ON eval_runs(prompt_slug, created_at);
CREATE INDEX idx_eval_results_eval_run_id  ON eval_results(eval_run_id);
```

"Find the most recent prior `eval_run` for this prompt" and "get all results for this run"
are both index-only lookups.

### 6.4 Source attribution ([ia.md §4.6](ia.md))

```sql
CREATE INDEX idx_execution_runs_source ON execution_runs(source);
```

Lets the Cost dashboard or a debugging session answer "how much of this month's spend came
from MCP vs. the dashboard vs. CI" — the concrete, queryable version of the "one core, many
interfaces" architecture claim.

---

## 7. Open questions

1. **Test case keys must be stable across edits.** `eval_results.test_case_key` assumes
   each test case in a `.eval.yaml` file has a durable identifier that survives reordering
   or unrelated edits to the file. [trd.md §3](trd.md)'s eval-suite file shape doesn't
   currently specify this — feeding this requirement back there is the fix, not a change to
   this schema.
2. **Retention / pruning policy — shape resolved in v0.2, build pending.** The answer is a
   `promptmuster runs purge` command, and the motivation is now security as much as disk
   space: run history persists `resolved_messages_json`, which can capture secrets pasted
   into variables ([threat-model.md T3](threat-model.md), [disaster-recovery.md §1.1](disaster-recovery.md)).
   The SQLite file is also created `0600`. Still worth automating before Phase 3's CI
   Action starts generating runs on every PR.
3. **`resolved_messages_json` size.** Storing the full resolved prompt on every run is
   simple and reproducible ([§2.3.1](#231--why-resolved_messages_json-is-stored-not-just-referenced))
   but could bloat the local SQLite file for very large prompts run frequently. Not a
   problem at current scale; worth revisiting if it becomes one.

---

## 8. Phase 4 — team tier (Postgres), additive only

Sketched lightly, per this doc series' own convention of not over-designing what's still
two phases away. Everything in §2 stays as-is; Postgres adds:

```sql
CREATE TABLE workspaces (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE workspace_members (
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id),
  user_id       TEXT NOT NULL REFERENCES users(id),
  role          TEXT NOT NULL,  -- 'owner' | 'member'
  PRIMARY KEY (workspace_id, user_id)
);

-- execution_runs and eval_runs each gain:
ALTER TABLE execution_runs ADD COLUMN workspace_id TEXT REFERENCES workspaces(id);
ALTER TABLE eval_runs      ADD COLUMN workspace_id TEXT REFERENCES workspaces(id);
```

`workspace_id` is nullable specifically so the local/solo schema and the team schema stay
the *same* tables with one additive column — not a fork. Access control, invitations, and
row-level security are explicitly out of scope for this document (per prd.md §7.6, Phase 4
is not yet designed in detail).

---

## 9. SQLite ↔ Postgres syntax notes

Because [ADR-003](adr/ADR-003-sqlite-local-postgres-team.md) commits to one repository
interface over both engines, the syntax deltas below are the *only* things that should
differ between the two implementations — the table/column shapes in §2 stay identical.

| Concern | SQLite | Postgres |
|---|---|---|
| Primary keys | `TEXT` (app-generated `crypto.randomUUID()`, per [core/CLAUDE.md](../CLAUDE.md)'s existing convention) | Same — identical `TEXT` UUIDs, no syntax change |
| Booleans | `INTEGER` (0/1) | `BOOLEAN` |
| Timestamps | `TEXT` (ISO-8601) | `TIMESTAMPTZ` |
| JSON columns | `TEXT` (app parses/serializes) | `JSONB` (native querying available, unused for now to keep the repository interface identical) |

Using app-generated UUIDs everywhere (rather than `AUTOINCREMENT`/`SERIAL`) is what keeps
primary-key handling identical across both engines — a direct, deliberate consequence of
[ADR-003](adr/ADR-003-sqlite-local-postgres-team.md)'s "the swap is mechanical, not a
rewrite" claim.

---

## Changelog

- **v0.2 (2026-07-15)** — Reconciliation pass. Added `'interrupted'` to both status enums
  with the startup reconciliation scan that sets it (disaster-recovery §1.3); added
  `CACHE_SCHEMA_VERSION` to the `cache_key` preimage (disaster-recovery §1.4); retention
  open-question updated with its resolved shape (`runs purge`) and security motivation
  (threat-model T3).
- **v0.1 (2026-07-15)** — Initial schema. Five local tables (`models`,
  `provider_credentials`, `execution_runs`, `eval_runs`, `eval_results`); the file-backed
  entities they reference by natural key, not foreign key; indexes tied to the cost
  dashboard, eval cache, and regression-lookup features already specified elsewhere; a
  light additive Phase 4/Postgres sketch; three open questions (test-case key stability,
  retention policy, resolved-message storage size).
