# ADR-006: Model and pricing data modeled as data, not code

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

The Week 1 prototype modeled available models as a hardcoded TypeScript union type
(`gpt-4o | gpt-4o-mini | claude-sonnet | claude-haiku | gemini-pro | gemini-flash`, per
[reference/key-desicions.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/key-desicions.md)) — a reasonable choice for
learning TypeScript early on, but the placeholder identifiers were already stale by the
time real execution work began (current Anthropic models are `claude-opus-4-8` /
`claude-sonnet-5` / `claude-haiku-4-5`, not the names in the union), and pricing /
context-window figures change independently of any code release.

---

# Decision

Models — their exact provider snapshot IDs, context windows, and per-token pricing — are
modeled as a **data table** (queryable, editable via Settings → Models per
[ia.md](../ia.md)), not as a hardcoded union type or embedded constant.

---

# Why?

Model identifiers and pricing are external facts that change on a schedule outside this
project's control. Encoding them in source code means every provider price change or model
deprecation requires a code change and redeploy; as data, the same information updates
without touching application logic. This is also the exact refactor the Week 1 plan itself
anticipated — [reference/key-desicions.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/key-desicions.md) notes: "the
refactoring from union type to data model is itself a good engineering lesson."

---

# Alternatives Considered

Alternative

Keep models as a TypeScript union type indefinitely, updating the union whenever a new
model ships.

Pros

- Compile-time exhaustiveness checking on model names
- Simplest possible representation

Cons

- Every new model or price change requires a code change
- The union was already out of date by the time real execution work began — exactly the
  failure mode a data table avoids
- A run record referencing a since-removed union member has no clean historical
  representation

Alternative

Fetch model/pricing data live from each provider's API at runtime, with no local table at
all.

Pros

- Always current, zero manual maintenance

Cons

- Not every provider exposes a public, stable pricing API
- Adds a network dependency and a new failure mode to a supposedly local-first core
  operation (picking a model to run against)
- Still needs a local fallback/cache, which is most of the complexity of a local data table
  anyway

---

# Consequences

Positive

- Adding, deprecating, or repricing a model is a data edit, not a code change
- Every execution run can pin the exact snapshot ID it used, making replay and
  cross-version regression comparison meaningful ([trd.md §6.5](../trd.md))
- Settings → Models gives the user direct visibility into exactly what's configured

Negative

- Requires migrating the existing Week 1 union-typed domain model — a real, if modest,
  refactor

Trade-offs

Loses compile-time exhaustiveness checking on "is this a valid model" in exchange for
runtime flexibility that matches how models actually change over time.

---

# Impact

Performance — negligible; a small local lookup
Scalability — n/a
Maintainability — significantly better; no code change needed for routine provider updates
Security — n/a
Developer Experience — a Settings UI over hardcoded constants
Deployment — no redeploy needed for a price update
Testing — fixtures reference stable data rows instead of magic string literals
Cost — accurate, current pricing directly powers the cost-preflight and cost-dashboard
features
AI — every execution run's provider/model/pricing context is fully traceable

---

# Risks

If the data table itself goes stale (nobody updates it when a provider changes pricing),
the cost-preflight feature silently becomes inaccurate — worse than no estimate at all if
not clearly labeled as an estimate ([trd.md §5.4](../trd.md)).

---

# Validation

A new model or price change can be reflected by editing the data table alone, with zero
source-code changes required anywhere else in the execution or cost-tracking path.

---

# Future Revisit

If a provider ships a stable, public pricing API, revisit whether the local table should
sync from it automatically rather than being manually maintained.

---

# Related Documents

[trd.md §5.4, §13](../trd.md) (decision A6)
[reference/key-desicions.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/key-desicions.md) (original union type, now
superseded)
[core/backlog.md](../core/backlog.md) (original Tier 1 model union, likewise superseded)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No

---

Did I optimise for today's problems or hypothetical future problems?

☐ Today's　☐ Future　☑ Balanced — fixes today's already-stale union type while directly
enabling tomorrow's pre-execution cost intelligence and replay features, which depend on
pinned snapshot data existing at all.

---

Would I make the same decision again?

Yes — the union type was already wrong by the time this was written, which is the clearest
possible evidence the data-modeling approach was overdue rather than premature.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
