# ADR-003: SQLite for local persistence; PostgreSQL reserved for the team tier

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

The product must run with zero setup for a solo developer — "runs on your machine by
default" is a stated principle ([prd.md §5](../prd.md)). Yet the company
stack and the original learning plan specifically called for PostgreSQL
([core/backlog.md](../core/backlog.md)'s original Tier 2 built NestJS + Postgres for what
was, in practice, local single-user CRUD).

---

# Decision

Local execution runs and logs use **SQLite**, accessed through a thin repository
interface. **PostgreSQL** is used only for the optional, explicitly opt-in team/hosted
backend ([Phase 4](../prd.md)).

---

# Why?

A database server is infrastructure — requiring one for a tool whose entire pitch is "no
server, no setup" is a direct contradiction. SQLite requires nothing beyond a file on disk.
The PostgreSQL learning goal isn't lost, just relocated to the one tier where a real server
actually makes architectural sense: team mode, with multiple users needing concurrent,
networked access.

---

# Alternatives Considered

Alternative

PostgreSQL from day one, for local use too (the original plan).

Pros

- Learn Postgres immediately
- One database technology throughout the whole project

Cons

- Requires installing and running a Postgres server just to use a single-player tool —
  directly contradicts the "runs on your machine" principle
- Adds a real setup step to the simplest possible onboarding experience (clone, install,
  run)

Alternative

An embedded document store (e.g. LevelDB/NeDB) instead of SQLite.

Pros

- No SQL required for simple key-value-shaped access

Cons

- The Cost dashboard's actual access pattern (aggregate by prompt, model, time) is
  inherently relational — SQL is the right fit for it
- SQLite is more broadly known and documented, and directly transfers relational-modeling
  skill toward the eventual Postgres tier; a document store wouldn't

---

# Consequences

Positive

- Zero-setup local persistence
- Relational-modeling skill built against SQLite transfers directly to Postgres in Phase 4
- One repository interface, two implementations — the swap is mechanical, not a rewrite

Negative

- SQLite's single-writer concurrency model is a real constraint if local usage patterns
  ever need concurrent writers (unlikely for a solo tool, but worth naming honestly)

Trade-offs

The Postgres/NestJS learning goal happens later in the roadmap than originally planned
(Phase 4, not Weeks 7–8) — a deliberate resequencing driven by
[ADR-001](ADR-001-framework-free-core-library.md), not a loss.

---

# Impact

Performance — SQLite is fast enough for a solo user's run volume, with no network
round-trip
Scalability — the Postgres path exists exactly where scale/concurrency actually matters
(team mode)
Maintainability — one repository interface, two implementations, swapped behind it
Security — no exposed database port locally; team-tier Postgres carries its own auth/
access-control scope, explicitly out of v1
Developer Experience — zero setup for local development
Deployment — no database server to deploy for the core product; Postgres deployment is
scoped entirely to the optional team tier
Testing — SQLite is trivial to spin up per test, in-memory or as a temp file
Cost — zero hosting cost locally
AI — n/a directly, but keeps the MCP/CLI path server-free (reinforces
[ADR-001](ADR-001-framework-free-core-library.md))

---

# Risks

If the repository-interface abstraction leaks SQLite-specific behavior (relying on
SQLite-only SQL dialect quirks), the Postgres swap in Phase 4 could require more rework
than intended.

---

# Validation

The same repository interface passes its test suite against both a SQLite implementation
now and a Postgres implementation later, with no changes to calling code.

---

# Future Revisit

At the Week 5 fork point ([trd.md §15](../trd.md)), when file-based
persistence work begins in earnest — this is also the moment to settle the local store
driver choice (`better-sqlite3` vs. an ORM such as Prisma), flagged open in
[trd.md §14](../trd.md).

---

# Related Documents

[trd.md §4, §13, §14](../trd.md) (open question: local store driver)
[prd.md §8](../prd.md) (non-functional: local-first)
[compliance-matrix.md NFR-04](../compliance-matrix.md)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No

---

Did I optimise for today's problems or hypothetical future problems?

☑ Today's　☐ Future　☐ Balanced — SQLite solves today's zero-setup requirement directly;
Postgres is deferred until team mode actually needs it, not built in speculatively ahead
of that need.

---

Would I make the same decision again?

Yes — requiring a database server for a "no server" pitch was never going to hold up under
its own stated thesis.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
