# ADR-001: Core as a framework-free TypeScript library

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

PromptMuster must expose the exact same domain logic — parse prompts, resolve template
variables, execute against providers, run evals, track cost — from four different
interfaces: a web dashboard, an MCP server, a CLI, and a CI Action ([prd.md §6](../prd.md)).
For the solo/local case, this must work with **zero running server process**, because the
product's own thesis is that it is genuinely local-first, not "local-ish."

An earlier version of this plan (the original 43-feature backlog) risked repeating a common
mistake: building a NestJS + PostgreSQL API purely to serve what was, in practice, local
single-user CRUD — infrastructure the "local-first" pitch explicitly argues against.

---

# Decision

The domain logic ("core") is implemented as a **plain TypeScript library with zero
framework dependency** — no NestJS, no Express. The CLI and the MCP server import this
library directly and run in-process against local files and SQLite. NestJS is reserved for
the optional team/hosted tier only ([Phase 4](../prd.md)), where it wraps the
same core library behind an HTTP API for multi-user access.

---

# Why?

Local-first has to be structurally true, not just described that way in a README. Every
required daemon is a piece of infrastructure a solo user must run and maintain — directly
contradicting the product's own thesis. A framework-free core also means the same logic
powering the CLI/MCP in Phase 1 doesn't need a rewrite when the team tier arrives in Phase 4
— NestJS becomes a thin transport wrapper around existing functions, not a new
implementation.

---

# Alternatives Considered

Alternative

NestJS from day one — CLI/MCP/dashboard all call a local NestJS server over HTTP, even for
solo use.

Pros

- Consistent request/response shape across every interface from day one
- Matches the company stack immediately (a stated learning goal)

Cons

- Requires a background server process just to use a "local-first" tool
- Adds latency/complexity to the simplest possible action (listing prompts)
- A daemon is a support burden for a single-user tool: crash recovery, port conflicts,
  start-on-boot

Alternative

A lightweight Node HTTP framework (Express/Fastify) as a local daemon, still avoiding
NestJS specifically.

Pros

- Slightly more conventional REST-shaped access than raw library calls

Cons

- Still requires a running daemon for local use — same core problem, lighter framework
- Doesn't teach the actual company stack (NestJS), so the learning goal is lost without
  solving the local-first problem either

---

# Consequences

Positive

- True zero-daemon local usage; CLI startup is instant, no server boot
- One codebase for domain logic, reused across every surface
- The NestJS learning goal is preserved, just relocated to where it's architecturally
  honest (the team tier)

Negative

- The core library must be designed with clean module boundaries by hand — no
  framework-provided DI or module system to lean on

Trade-offs

Slower to bootstrap NestJS-flavored patterns from day one, and the "company stack"
practice is partially deferred to Phase 4 rather than exercised immediately. Deliberate:
practicing the pattern on architecture that doesn't need it isn't the same skill as
knowing when _not_ to reach for a framework.

---

# Impact

Performance — better locally (no network hop for in-process calls)
Scalability — team tier scales via NestJS + Postgres later, unaffected by this decision
Maintainability — higher upfront discipline required, but one shared core is easier to
reason about long-term than divergent per-interface logic
Security — fewer network-exposed surfaces for the local/solo case
Developer Experience — simpler local dev loop; nothing to start or manage
Deployment — CLI/MCP need no deployment at all; only the optional team-tier NestJS wrapper
does, later
Testing — core logic is framework-free and trivially unit-testable
Cost — zero infrastructure cost for local/solo use
AI — Claude Code / MCP integration is simpler against a plain library than against an HTTP
API

---

# Risks

- Building clean module boundaries without a framework's structure requires real
  discipline — it's easy to let boundaries blur without a framework enforcing them.
- If Phase 4's NestJS wrapper is built carelessly, it could start dictating the core's
  shape instead of the other way around, quietly reintroducing the coupling this decision
  is meant to avoid.

---

# Validation

The MCP server and CLI both function fully offline with no server process running.
NestJS, when it arrives in Phase 4, requires no changes to core's public API — only a thin
controller layer wrapping existing functions.

---

# Future Revisit

If Phase 4 reveals the core's API doesn't map cleanly onto HTTP / multi-tenant needs,
revisit whether the core needs a dedicated adapter layer rather than a thin NestJS wrapper.

---

# Related Documents

[trd.md §1, §13](../trd.md)
[prd.md §5, §6.1](../prd.md)
[ia.md §5](../ia.md)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No

---

Did I optimise for today's problems or hypothetical future problems?

☐ Today's　☐ Future　☑ Balanced — the core is framework-free for today's local-first need,
but the repository-interface and library-boundary discipline is explicitly there so Phase
4's NestJS wrapper doesn't require a rewrite.

---

Would I make the same decision again?

Yes. The alternative (a local daemon of any kind) fails the product's own stated thesis on
day one — this isn't a close call.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
