# ADR-007: MCP server ships before the eval engine

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

Both the MCP server (IDE integration) and the eval engine (test-and-regress prompts) are
core differentiators ([prd.md §6](../prd.md)), but a solo developer building
this at roughly 75 minutes a day cannot build everything at once. The project's stated
survival condition ([prd.md §10](../prd.md)) is that the tool actually gets
used daily — not that every feature ships in some idealized order.

---

# Decision

The MCP server (read + run: `list_prompts`, `get_prompt`, `run_prompt`) ships in Phase 1,
before the eval engine, which ships in Phase 2.

---

# Why?

MCP is the smaller of the two builds, and — critically — it's what puts the prompt library
inside the actual daily workflow (Claude Code), which is the mechanism by which the
project's central risk (nobody using it, including its own author) gets addressed early
rather than discovered late. Evals matter more once there's a library in active daily use
to test; building the eval engine first, against a library nobody's touching yet, risks
polishing a feature for a workflow that hasn't proven itself.

---

# Alternatives Considered

Alternative

Build the eval engine first, since it's the headline differentiator called out most
prominently in [prd.md §6.2](../prd.md).

Pros

- The single most interview-worthy, most product-differentiating feature lands first

Cons

- Delays the one feature that starts the daily-use habit loop
- Risks building a sophisticated eval system against a prompt library that isn't yet part
  of anyone's actual workflow — undercutting the very validation the eval engine is meant
  to provide

Alternative

Build both in parallel, partially.

Pros

- Neither feature is delayed relative to the other

Cons

- At a 75-minutes-a-day solo pace, splitting focus risks finishing neither well within a
  reasonable timeframe
- Contradicts the project's own "depth over breadth" curriculum principle
  ([core/spec-essential.md](../core/spec-essential.md))

---

# Consequences

Positive

- The daily-use flywheel — the project's stated success condition — starts as early as
  architecturally possible
- MCP's timing-sensitive advantage (a genuinely novel window, per
  [prd.md §6.1](../prd.md)) is captured while it still exists, rather than
  risked by deferring it the way the original 43-feature backlog had (Week 18–20)

Negative

- The eval engine — arguably the stronger pure product differentiator — is delayed to
  Phase 2

Trade-offs

Prioritizing "will this actually get used" over "which single feature is most impressive
on its own" — a deliberate bet that the flywheel matters more than sequencing the flashiest
feature first.

---

# Impact

Performance — n/a
Scalability — n/a
Maintainability — n/a
Security — MCP's confirm-before-execute gate ([trd.md §12](../trd.md)) must
exist from day one of this feature, not be added later
Developer Experience — the author's own daily workflow becomes the first real test of the
product
Deployment — MCP runs locally; no deployment needed
Testing — n/a beyond normal coverage
Cost — n/a
AI — this is literally the AI-tool-integration feature

---

# Risks

If MCP alone doesn't actually create daily use — e.g. because the library is still too
small, or the read+run tool surface is too limited — the flywheel bet doesn't pay off, and
the delayed eval engine doesn't get the benefit of an active library to test against
either.

---

# Validation

[prd.md §10](../prd.md)'s own success metric — reaching for PromptMuster via
MCP/CLI on ≥4 days/week by end of Phase 1 — is the direct test of whether this sequencing
bet worked.

---

# Future Revisit

If Phase 1 ends and the flywheel metric isn't being met, revisit whether MCP-first was the
right call, or whether a different feature should have led.

---

# Related Documents

[prd.md §6.1, §9, §10, §11.2](../prd.md) (open decision #5: phase ordering)
[trd.md §7, §13](../trd.md) (decision A7)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No

---

Did I optimise for today's problems or hypothetical future problems?

☐ Today's　☑ Future　☐ Balanced — this is explicitly a bet on which sequencing best serves
the project's long-term survival (daily use), even though the eval engine would be the
more impressive thing to demo *today*.

---

Would I make the same decision again?

Yes — of the two, only MCP directly addresses the risk that actually threatens the whole
project (nobody using it). That risk dominates the sequencing call.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
