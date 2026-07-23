# ADR-008: better-sqlite3 with a thin hand-rolled repository for local persistence

Status

🟢 Accepted (owner decision, 2026-07-16 — resolves trd.md §14 Q2 / compliance-matrix D2)

# Context

[ADR-003](ADR-003-sqlite-local-postgres-team.md) settled _which engines_ hold structured
data: SQLite locally, PostgreSQL reserved for the Phase-4 team tier, behind one repository
interface. It deliberately left open _how the SQLite side is driven_. Two credible options:

1. **`better-sqlite3` + a thin, hand-rolled repository** — a synchronous driver (natural
   fit for a CLI that opens the DB, runs a query, exits) with the repository interface
   written by hand against [database-schema.md](../database-schema.md)'s
   five tables.
2. **Prisma throughout** — one ORM covering both engines, making the eventual
   SQLite→Postgres swap mostly configuration; heavier at runtime and build time (client
   generation step, larger install) for a local-first tool whose core promise is
   zero-setup, and it abstracts away the SQL this project explicitly wants to learn.

The decision point was scheduled for the Week-5 persistence fork; the owner resolved it
during the 2026-07-16 decision batch.

# Decision

**`better-sqlite3` with a thin hand-rolled repository.**

- The repository interface (defined by the core library, per ADR-001/ADR-003) gets a
  `better-sqlite3` implementation for local mode. Queries are plain SQL, versioned
  migration files, no ORM.
- The synchronous API is a feature here, not a limitation: the CLI and MCP server are
  short-lived single-user processes where sync reads are simpler and faster than pooling
  ceremony; the dashboard's route handlers call core in-process where the same holds.
- Prisma (or another ORM) is reconsidered **only when the Phase-4 Postgres tier is
  actually being built** — the moment a second engine, a long-lived server process, and
  connection pooling make it earn its weight. Nothing in this decision precludes that;
  the repository interface is exactly the seam it would slot into.

# Consequences

- **Learning:** the SQL, schema design, and migration mechanics stay visible — consistent
  with ADR-004's hand-built-before-abstracted principle and the roadmap's "learn the layer
  before adopting the abstraction" philosophy.
- **Zero-setup preserved:** no codegen step, no daemon; `npm install` and the store works.
- **Cost accepted:** the Postgres implementation in Phase 4 is a real second
  implementation of the repository interface, not a config flip. That cost is deferred to
  the tier that needs it and is bounded by the interface being thin by design
  ([database-schema.md §9](../database-schema.md) keeps the SQL dialect
  deltas to booleans/timestamps/JSON columns).
- **Native-module risk:** `better-sqlite3` is a compiled addon — prebuilt binaries cover
  the common platforms, but Node-version bumps can require a rebuild. Accepted; pinned in
  CI ([devops-cicd.md §1](../devops-cicd.md)).
