# Horizons — the whole programme, in order

**Status:** v1.0, 2026-08-06. The master sequencing document across all four projects.

**Nothing here is cancelled.** Everything designed gets built. This file decides *order*,
and it separates two things the roadmap had fused together:

- **Job-ready** — the point where the portfolio, the writing and the interview prep are
  enough. A milestone, roughly 12–18 months out.
- **Complete** — every project finished to the detail it was designed to. A body of work,
  roughly 4 years.

Conflating those two is what made the schedule feel overwhelming. They are different
questions with different answers.

---

## 1. Total scope, counted honestly

| Project | Remaining | Notes |
|---|---|---|
| **PromptMuster** | 202 SP | 21 of 223 done. Phase 4 not yet estimated |
| **Cadence** (the app) | 261 pts | Includes 90 pts of hardening from the pre-build audits |
| **linkedin-lint** | 111 pts | Phase 0a is 16 of those |
| **Context Compiler** | ~75 SP est. | Phase 1 ~32, Phase 2 ~22, Phase 3 ~20 (speculative) |
| **Total** | **~649 sessions** | |

**Available:** Mon/Wed/Fri on the portfolio project ≈ 135 sessions/year, plus roughly half
of Thursdays for tooling ≈ 22/year. About **157 project sessions a year.**

649 ÷ 157 ≈ **4.1 years at 1× velocity.**

Velocity is the honest unknown. Week 2 ran ~2×; Weeks 3–4 look closer to 1.3–1.5× now that
the setup and first-encounter weeks are behind. Every date below is given as a band rather
than a promise.

**The order is a decision. The dates are estimates.** If a date slips, the order still
holds — that is the point of the structure.

---

## 2. Horizon 1 — Job-ready

**~132 sessions · 10 months at 1×, 20 at 2× · call it 12–18 months**

Everything here is chosen by one test: *would an interviewer see it, or ask about it?*

| Order | What | SP | Why this position |
|---|---|---|---|
| 1 | **Tier 1 remainder** (#01, QA, #06, #07) | 11 | Closes the gaps a design audit already found. Cheapest credibility available |
| 2 | **linkedin-lint Phase 0a** — the escaper | 16 | **Unblocks the writing cadence and Cadence #25.** Publishable alone. A real finding, an article, four interview stories, for 16 sessions |
| 3 | **PromptMuster Phase 1, load-bearing** (#08, #09, #10, #12, #14, #16, #17) | 68 | The product. Files, domain model, execution, cost preflight, MCP server, security |
| 4 | **PromptMuster Phase 2, the eval loop** (#18, #20, #22, #23, #24) | 30 | **The differentiator.** Without it the project is table stakes against Langfuse and promptfoo |
| 5 | **Demo landing page** (#32a) | 7 | A demoable project with no landing page is a link you cannot share |

**Exit:** a working, demoable, genuinely-used local-first prompt toolkit with evals and an
MCP server; a published npm package with a real technical finding behind it; a twelve-month
writing archive; and pattern coverage across most of the DSA bank.

Running alongside, never displaced — these are cheap and they compound:

- **Two LinkedIn posts a week.** The lowest-effort, highest-return item in the entire plan
- **Tuesday DSA**, steered by `dsa-bank.md` §1's coverage gaps
- **Medium**, on the Thursday rotation
- **Interview prep** from Week 12, evenings and weekends, separate from the session

---

## 3. Horizon 2 — Depth

**~213 sessions · 16 months at 1×, 32 at 2×**

The things that make each project *good* rather than *sufficient*. Starts after H1's exit,
not alongside it.

| Order | What | SP |
|---|---|---|
| 1 | **PromptMuster Phase 1 remainder** — SQLite run logs (#11), streaming (#13), multi-provider (#15), provider onboarding (#12a) | 34 |
| 2 | **PromptMuster Phase 2 remainder** — LLM-as-judge (#19), cost controls and caching (#21), golden-set harness (#25) | 13 |
| 3 | **linkedin-lint 0b–0f** — counts, fold, prohibitions, bold, tells, similarity, CLI, npm release | 82 |
| 4 | **Context Compiler Phase 1** — conversion-fidelity validation, MCP/agent UX, eval fixtures, ops notes | ~32 |
| 5 | **PromptMuster Phase 3** — CLI (#26), CI eval Action (#28), comparison (#29), cost dashboard (#30), export/import (#27), OSS launch gate (#32) | 39 |
| 6 | **linkedin-lint 0g** — the landing page with the linter running client-side | 13 |

**Exit:** PromptMuster is a fully shipped open-source dev tool with a CLI and a CI Action.
linkedin-lint is complete and published with a live demo. Context Compiler's documented
holes are closed.

**Note on order:** the linter's remaining phases sit *above* PromptMuster Phase 3 because
they are small, independent, and directly serve the writing habit. PromptMuster Phase 3 is
the bigger, more impressive block — but it is polish on something already demoable.

---

## 4. Horizon 3 — Complete

**~304 sessions · 23 months at 1×, 46 at 2×**

| Order | What | Pts |
|---|---|---|
| 1 | **Cadence Phase 0.5** — schema and corpus import | 27 |
| 2 | **Cadence Phase 1 + hardening** — the app that actually publishes | 167 |
| 3 | **Cadence Phase 2** — voice learning, the reflection loop | 43 |
| 4 | **Cadence Phase 3** — metrics, re-mining, images, landing page | 44 |
| 5 | **Context Compiler Phase 2** — multi-file corpus, second scorer, CLI | ~22 |
| 6 | **PromptMuster Phase 4** — team tier, NestJS + Postgres | TBD |
| 7 | **Context Compiler Phase 3** — speculative, revisit only if 1–2 held up | ~20 |

### One honest observation about H3

**Cadence is 261 of these 304 points, and it is the least career-critical thing in the
programme.** It is a personal tool. Its value is real — it makes the writing habit
reliable, and the escaping finding is genuinely good material — but that value is almost
entirely delivered by `linkedin-lint`, which lands in Horizon 1.

Three years out, H3 should be re-decided rather than inherited. By then you will have a
job, a published package, a shipped OSS tool, and three years of writing. Whether the
Cadence app is still the right use of 261 sessions is a question for that version of you,
with information this one does not have.

**Recording it rather than resolving it. That is the point of a horizon.**

---

## 5. The rules that make this work

1. **One project per slot.** Mon/Wed/Fri is whatever is top of the current horizon. Thursday
   alternates writing and one tool stream. No parallel starts, ever — that is what produced
   fourteen concurrent streams.
2. **Horizons are sequential, not overlapping.** H2 begins when H1 exits. Pulling an H2 item
   forward because it is interesting is how H1 slips.
3. **The compounding habits are never displaced.** Posting, DSA, and interview prep come out
   of a different budget. If a project needs their time, the project waits.
4. **Order is a decision; dates are estimates.** Re-forecast at each Sunday review. Do not
   re-order without writing down why.
5. **Queued is not cancelled.** Anything not in the current horizon is *scheduled later*.
   That is the whole reframe: nothing is lost, and only one thing is urgent.
6. **A horizon exit is a real gate.** Write the exit criteria down, meet them, then move.

---

## 6. What to do this week

Horizon 1, item 1: **Tier 1 remainder.** `06.4` (filters and search as URL state, plus the
settings stub) and `07.6` (the layout-chrome pass the design audit reopened `#07` for).

Item 2, `linkedin-lint` Phase 0a, needs 20 minutes of prep first: put the four published
LinkedIn posts and six Medium pieces into `linkedin-lint/test/fixtures/`. That single
blocker gates 16 sessions of work, and `linkedin-lint/NEXT.md` has the ordered list behind
it.

---

## 7. Related

- `core/tickets.md` — PromptMuster's ticket-level breakdown
- `cadence/docs/core/tickets.md` · `linkedin-lint/docs/core/tickets.md` — theirs
- `context-compiler/docs/FUTURE.md` — its phased list
- `core/dsa-bank.md` · `core/bonus-bank.md` — the two menus
- `preset.md` §3 — project definitions · §4.2 — the weekly schedule
