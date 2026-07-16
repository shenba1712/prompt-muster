# Architecture Decision Records — PromptMuster

Records of the specific technical choices made during the [trd.md](../trd.md)
phase — the ones flagged in [trd.md §2](../trd.md) as significant enough that
future-you (or another engineer) would benefit from understanding *why*, not just *what*.

Format: the standard ADR shape (Status / Context / Decision / Consequences) — the original
`templates/adr.md` these followed has since been removed from the repo.

| # | Title | Status |
|---|---|---|
| [001](ADR-001-framework-free-core-library.md) | Core as a framework-free TypeScript library | 🟢 Accepted |
| [002](ADR-002-prompts-as-files-runs-in-database.md) | Prompts and eval baselines as files; runs in a database | 🟢 Accepted |
| [003](ADR-003-sqlite-local-postgres-team.md) | SQLite for local persistence; Postgres reserved for the team tier | 🟢 Accepted |
| [004](ADR-004-hand-built-adapters-before-sdks.md) | Hand-built provider adapters before reaching for official SDKs | 🟢 Accepted |
| [005](ADR-005-prompt-file-format-adopt-not-invent.md) | Adopt an existing prompt-file convention rather than inventing one — dotprompt, extended via namespaced frontmatter | 🟢 Accepted |
| [006](ADR-006-models-and-pricing-as-data.md) | Model and pricing data modeled as data, not code | 🟢 Accepted |
| [007](ADR-007-mcp-before-eval-engine.md) | MCP server ships before the eval engine | 🟢 Accepted |
| [008](ADR-008-better-sqlite3-thin-repository.md) | better-sqlite3 with a thin hand-rolled repository for local persistence | 🟢 Accepted |

Update this index whenever an ADR's status changes or a new one is added.
