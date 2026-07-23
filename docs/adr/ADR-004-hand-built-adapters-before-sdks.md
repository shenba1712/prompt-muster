# ADR-004: Hand-built provider adapters before reaching for official SDKs

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

PromptMuster's execution engine must call three different LLM providers (OpenAI, Anthropic,
Google) with meaningfully different request/response/streaming shapes, normalized behind
one internal interface. The project's own learning mandate
([core/spec-essential.md](../core/spec-essential.md)) explicitly favors building
understanding over consuming pre-built abstractions where the underlying mechanics are
themselves the lesson.

---

# Decision

The first provider adapter is built directly against the provider's raw HTTP API (using
`fetch`, not an SDK), to learn the actual request/response shape, Server-Sent Events
streaming, and error handling first-hand. Once that adapter works end to end, official
SDKs (`@anthropic-ai/sdk`, `openai`, `@google/genai`) are the expected path for the
remaining adapters, and for productionizing the first one.

---

# Why?

Seeing the actual wire format, and hand-rolling SSE parsing and retry/backoff at least
once, is the specific engineering lesson this project exists to teach
([prd.md §3.3](../prd.md)'s conflict rule: the learning need wins for
internal construction no user ever sees). Once that lesson is learned, there's no ongoing
value in refusing a well-maintained official SDK — that would just be needless maintenance
burden for no further learning payoff.

---

# Alternatives Considered

Alternative

Official SDKs from the very first line of adapter code.

Pros

- Faster to ship
- Less code to maintain
- SDKs already handle retry/streaming edge cases

Cons

- Skips the exact learning moment (raw wire format, SSE, retry logic) this project is
  built to provide
- The reasoning behind SDK design choices (e.g. how streaming events are structured) stays
  opaque

Alternative

Hand-built adapters for all three providers, permanently — never adopting the SDKs.

Pros

- Maximum understanding retained
- No SDK version-drift dependency

Cons

- Ongoing maintenance burden (each provider's API evolves) with no further learning payoff
  after the first adapter — the lesson is learned once, not three times over

---

# Consequences

Positive

- Genuine first-hand understanding of streaming/retry mechanics behind the adapter
  interface
- A specific, defensible interview story: "I built a provider adapter from the raw API
  before reaching for the SDK, so I actually understand what the SDK does for me"

Negative

- The first adapter takes longer to build than if an SDK were used immediately

Trade-offs

Deliberately slower initial velocity in exchange for depth on a skill (raw API +
streaming) that's otherwise easy to skip entirely in modern development.

---

# Impact

Performance — SDKs are typically better-optimized than a first hand-rolled attempt; the
productionized version is expected to end up SDK-based
Scalability — n/a at this stage
Maintainability — SDKs reduce long-term maintenance once adopted
Security — hand-rolled request code must be reviewed carefully for header/key handling,
per [trd.md §12](../trd.md)
Developer Experience — SDKs are more pleasant to work with once adopted
Deployment — n/a
Testing — adapters are tested against recorded fixtures either way
([trd.md §11](../trd.md))
Cost — n/a
AI — this is directly the provider-integration surface of the whole product

---

# Risks

Hand-rolled SSE/retry code has more room for subtle bugs (malformed backoff, mishandled
partial chunks) than a battle-tested SDK — mitigated by treating the hand-built version as
a bounded learning exercise, not the shipped production path for every provider.

---

# Validation

The hand-built adapter correctly streams a real response end to end, and correctly retries
a simulated 429/503 with backoff. Once that's demonstrated, the transition to SDK-based
adapters for the remaining providers should be visibly faster than the first.

---

# Future Revisit

If a hand-built adapter ends up as the long-term production path for a provider (never
migrated to the SDK), revisit whether the ongoing maintenance cost is worth it.

---

# Related Documents

[trd.md §5.1, §5.3](../trd.md)
[core/spec-essential.md](../core/spec-essential.md) (engineering philosophy: build over
consume)
[reference/idea-bank.md](https://github.com/shenba1712/engineeros-roadmap/blob/main/reference/idea-bank.md) (retry-with-backoff exercise, now
load-bearing rather than optional)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☐ Yes　☑ Maybe　☐ No — the simplest path to a working feature is the SDK; the simplest
path to the intended _learning outcome_ is the raw API first. This ADR deliberately
optimizes for the latter.

---

Did I optimise for today's problems or hypothetical future problems?

☑ Today's　☐ Future　☐ Balanced — this is squarely about extracting a learning outcome
from the feature being built right now, not preparing for a future need.

---

Would I make the same decision again?

Yes, but scoped exactly as written — first adapter only. Applying this to all three
providers permanently would flip it from a learning exercise into unnecessary maintenance
debt.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
