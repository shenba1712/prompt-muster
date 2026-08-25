# PromptMuster — Compliance / Requirements Traceability Matrix

| | |
|---|---|
| **Status** | 📝 Draft v0.2 — traces [prd.md](prd.md) v0.2 against [trd.md](trd.md) v0.2 |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-07-15 |
| **Last updated** | 2026-07-15 |
| **Purpose** | Prove every requirement has a design home, a phase, and a way to be verified — and surface the gaps where it doesn't. |

---

## 0. How to read this

Each requirement from [PRD §7 (functional)](prd.md) and [§8 (non-functional)](prd.md) gets a
stable ID and a row tracing it to: the **TRD** section that designs it, the **phase** it
ships in, how it's **verified**, and its **status**. A requirement with no TRD coverage is a
**design gap**; a TRD design with no requirement is **over-engineering** — both are called
out in [§9](#9-findings). This is a living doc: update the Status column as work lands.

**Status legend**

| | Meaning |
|---|---|
| ✅ | Built and working |
| 🚧 | In progress (current week) |
| 📝 | Designed, not yet built |
| ⚠️ | Design gap — requirement exists, TRD coverage thin or missing |
| ⛔ | Blocked on an open decision ([§8](#8-open-decisions-blocking-rows)) |
| 🔮 | Deferred to Future (post-v1, intentionally) |

**Verification legend** — `unit` (pure-function test) · `int` (integration, e.g. adapter vs
fixture) · `e2e` (drive the real flow end-to-end) · `eval` (self-hosted against the eval
engine) · `manual` (hands-on check) · `review` (design/security review).

**Phases** are the PRD's: 0 Prototype · 1 Useful-to-me · 2 Trustworthy · 3 Shareable ·
4 Team · F Future.

---

## 1. Prompt library (PRD §7.1)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-LIB-01 | Prompts stored as files (schema §6.0) | P0 | 7.1 | §3, §4 | 1 | int, review | 📝 |
| FR-LIB-02 | CRUD via dashboard + CLI | P0 | 7.1 | §8, §9 | 0→1 | e2e | ✅ create/read/delete; 🚧 update (Wk2); 📝 file-backed |
| FR-LIB-03 | Typed template variables + dynamic form | P0 | 7.1 | §3, §9 | 1 | unit, e2e | 📝 |
| FR-LIB-04 | Full-text search + filter (model/category/tag/fav) | P0 | 7.1 | — | 0→1 | unit, e2e | ✅ in-memory; 📝 file-backed design closed 2026-08-04 (tickets 08.5/09.2/09.5), build pending |
| FR-LIB-05 | Optional per-prompt output schema | P1 | 7.1 | §3 | 2 | unit | 📝 |
| FR-LIB-06 | Duplicate-on-save warning | P2 | 7.1 | — | F | unit | 🔮 ⚠️(string-sim undesigned; embeddings later) |
| FR-LIB-07 | First-run recommends a private git remote (backup, not sharing) | P1 | 7.1 | [disaster-recovery.md §1.2](disaster-recovery.md) | 1 | e2e, manual | 📝 (added v0.2) |

## 2. Execution (PRD §7.2)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-EXE-01 | Execute against one provider; render result | P0 | 7.2 | §5.1 | 1 | int, e2e | 📝 |
| FR-EXE-02 | Multi-provider; model chosen per run | P0 | 7.2 | §5.1 | 1 | int | 📝 |
| FR-EXE-03 | Streaming responses | P0 | 7.2 | §5.2 | 1 | int, e2e | 📝 |
| FR-EXE-04 | Keys from keychain/env, never repo | P0 | 7.2 | §4, §11, §12 | 1 | review | 📝 |
| FR-EXE-05 | Multi-model side-by-side comparison | P1 | 7.2 | §5.1 (engine) + [ux-flows.md](ux-flows.md) Flow 3 (view) | 2 | e2e (TC-E2E-002) | 📝 design gap closed v0.2; build pending |
| FR-EXE-06 | Pre-execution token count + cost estimate | P1 | 7.2 | §5.4 | 1 | unit, int | 📝 |

## 3. Evaluation (PRD §7.3)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-EVAL-01 | Attach test cases (vars + assertions) | P0 | 7.3 | §3, §6.1 | 2 | unit | 📝 |
| FR-EVAL-02 | Assertions: exact / contains / schema / property | P0 | 7.3 | §6.2 | 2 | unit | 📝 |
| FR-EVAL-03 | LLM-as-judge assertion | P0 | 7.3 | §6.2–6.3 | 2 | eval | 📝 |
| FR-EVAL-04 | Run suite across ≥1 model; summarize pass/fail + cost | P0 | 7.3 | §6.1, §6.4 | 2 | int, e2e | 📝 |
| FR-EVAL-05 | Result caching + per-run budget cap | P0 | 7.3 | §6.4 | 2 | unit, int | 📝 |
| FR-EVAL-06 | Regression view (diff versions + cost delta) | P1 | 7.3 | §6.5 | 2 | e2e | 📝 |
| FR-EVAL-07 | Repeat runs / thresholds (determinism) | P1 | 7.3 | §6.3 | 2 | unit | 📝 |
| FR-EVAL-08 | Committable eval baselines | P1 | 7.3 | §3, §4 | 3 | int | 📝 |
| FR-EVAL-09 | Judge golden-set validation harness | P2 | 7.3 | §6.3 | 2→3 | eval | 📝 |

## 4. Cost & observability (PRD §7.4)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-COST-01 | Log every execution (snapshot, tokens, cost, latency, ts) | P0 | 7.4 | §4, §11 | 1 | int | 📝 |
| FR-COST-02 | Cost dashboard (per prompt/model/time; projection) | P1 | 7.4 | §9 (surface only) | 2 | e2e | ⚠️ data modeled; visualizations undesigned (use dataviz skill) |
| FR-COST-03 | Post-run quality rating → recommendations | P2 | 7.4 | — | F | manual | 🔮 (downgraded from old #17) |

## 5. Interfaces (PRD §7.5)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-IF-01 | MCP server: list / get / run prompt | P0 | 7.5 | §7 | 1 | int, e2e | 📝 |
| FR-IF-02 | Web dashboard (local) | P0 | 7.5 | §9 | 0→2 | e2e | 🚧 (Wk1 SPA; shadcn Wk2) |
| FR-IF-03 | CLI | P1 | 7.5 | §8 | 3 | e2e | 📝 |
| FR-IF-04 | CI GitHub Action running evals on PRs | P1 | 7.5 | §10 | 3 | e2e | 📝 |
| FR-IF-05 | Export/import JSON/YAML w/ schema versioning | P2 | 7.5 | §8 | 3 | unit, int | 📝 (mostly free via files) |

## 6. Sharing / team (PRD §7.6)

| ID | Requirement | Pri | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|---|
| FR-TEAM-01 | Repo-based sharing (shared prompt repo, no server) | P1 | 7.6 | §4 | 4 | e2e | 📝 (implicit in file model) |
| FR-TEAM-02 | Dashboard tuned for non-technical consumers | P2 | 7.6 | §9 | 4 | manual | 🔮 |
| FR-TEAM-03 | Optional hosted/team backend (Postgres) | P2 | 7.6 | §1, §4, §14-Q3 | 4 | int | 🔮 ⛔(D3) |

## 7. Non-functional (PRD §8)

| ID | Requirement | PRD | TRD | Phase | Verify | Status |
|---|---|---|---|---|---|---|
| NFR-01 | Local-first; nothing leaves machine without opt-in | 8 | §1, §4 | 1 | review | 📝 |
| NFR-02 | Prompt-injection trust boundary (confirm on external prompts) | 8 | §12, §7 | 1 | review, e2e | 📝 |
| NFR-03 | Secrets in keychain/env; redacted from logs | 8 | §4, §11, §12 | 1 | review | 📝 |
| NFR-04 | SQLite local / files / Postgres team | 8 | §4 | 1/4 | int | 📝 (D2 resolved → ADR-008) |
| NFR-05 | Reproducibility — pin model snapshot + prompt git sha | 8 | §4, §5.4 | 1 | int | 📝 |
| NFR-06 | Cost safety — no run over budget without confirm | 8 | §6.4 | 2 | unit, e2e | 📝 |
| NFR-07 | Bounded eval concurrency; responsive streaming | 8 | §5.2, §6.4 | 2 | int | 📝 |
| NFR-08 | Retry 429/503 w/ backoff; fail-fast 4xx | 8 | §5.3 | 1 | unit, int | 📝 |
| NFR-09 | Dashboard binds 127.0.0.1 + Origin/Host validation on state-changing routes | 8 | §9 | 1 | int (TC-SEC-004) | 📝 (added v0.2 from threat-model T4) |
| NFR-10 | Secret-pattern warn-before-run on variable values | 8 | §12 | 1→2 | unit (TC-SEC-005) | 📝 (added v0.2 from threat-model T3) |

---

## 8. Open decisions blocking rows

Rows tagged ⛔ are gated by a decision in [TRD §14](trd.md) / [PRD §11.2](prd.md):

| Ref | Decision | Blocks | Needed by |
|---|---|---|---|
| ~~D1~~ | ✅ Resolved 2026-07-16: dotprompt, adopted and extended ([ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md)) | — (rows unblocked) | — |
| ~~D2~~ | ✅ Resolved 2026-07-16: `better-sqlite3` + thin repository ([ADR-008](adr/ADR-008-better-sqlite3-thin-repository.md)) | — (rows unblocked) | — |
| D3 | NestJS placement / team backend | FR-TEAM-03 | Phase 4 (not near-term) |

Non-blocking-but-tracked: ~~D-name~~ (✅ PromptMuster, 2026-07-16), ~~D-license~~
(✅ Apache-2.0), **D-employer-IP (resolve before first public commit)** — see
[§10](#10-governance--external-compliance).

---

## 9. Findings

### Design gaps (requirement exists; TRD coverage thin or missing) — ⚠️
1. ~~**FR-LIB-04 — search over the file-backed library.**~~ **Closed (v0.7, 2026-08-04):**
   [tickets.md](core/tickets.md) 08.5 (file index, re-scan on change) + 09.2/09.5 (wire
   dashboard to the file-backed library) already cover this — the design gap existed at
   this matrix's last update, but ticket coverage landed the next day (2026-07-16 backlog
   re-cut) and this row was never refreshed to match (2026-08-04 audit finding #26). The
   *build* remains pending like any 📝 row; the design gap itself is gone.
2. ~~**FR-EXE-05 — side-by-side comparison.**~~ **Closed (v0.2):** [ux-flows.md](ux-flows.md)
   Flow 3 drew the comparison view — a mode of Run, parallel columns, per-column
   cost/latency. The *design* gap is gone; the build remains pending like any 📝 row.
3. **FR-COST-02 — cost dashboard visualizations.** The runs schema (TRD §4) has the data,
   but no chart/aggregation design. **Owed:** dashboard cost views — and this is exactly
   where the `dataviz` skill should drive the design rather than ad-hoc charts.

### Over-engineering check (design without a driving requirement)
**None found.** The TRD is lean: the team/Postgres tier is requirement-backed (FR-TEAM-03,
P2) and phase-gated to Phase 4; no speculative subsystems. This is the healthy direction —
contrast the old 43-feature backlog, which carried team-sync, offline conflict resolution,
webhook PR-review, and embeddings with no near-term requirement pulling them.

### Coverage summary
- **Functional requirements:** 33 total — **P0: 16, P1: 11, P2: 6** (recounted 2026-08-04,
  audit finding #21 — the prior "30 total, P0:14/P1:9/P2:7" figure didn't match the actual
  row count and was never caught by anything that verifies its own tallies).
- **Non-functional:** 10 total (NFR-09/NFR-10 added v0.2 from [threat-model.md](threat-model.md)).
  **43 requirements total** (33 functional + 10 non-functional — corrects the prior "40,"
  which qa-test-plan.md's header also repeated uncorrected).
- **Verified design coverage:** now fully traced; **1 remaining design gap** (FR-COST-02,
  ⚠️ above — FR-EXE-05 closed v0.2, FR-LIB-04 closed 2026-08-04); **2** intentionally
  undesigned Future items (FR-LIB-06, FR-COST-03).
- **By status:** ✅ 3 · 🚧 2 · 📝 ~25 · ⚠️ 1 · 🔮 4 (some rows carry two states across phases;
  counts approximate pending a full re-tag pass).
- **Blocked:** 0 near-term rows. Only D3 (Phase-4 NestJS/Postgres placement) remains, and
  it isn't near-term. D1 resolved 2026-07-16 (ADR-005, dotprompt); D2 resolved 2026-07-16
  (ADR-008).
- **P0 gap check:** every P0 now has design coverage — FR-LIB-04 closed 2026-08-04 (see
  Design gaps above).

---

## 10. Governance & external compliance

The other reading of "compliance" — obligations to things outside the codebase. Tracked
here so they don't get lost between the PRD's risk list and the TRD's security section.

| Area | Obligation | Where handled | Status |
|---|---|---|---|
| **Employer IP** | Written OK required (ticket `14a.1`, still `[ ]`) — remains a Phase-3 launch gate. ~~Strategy 2026-07-16: repo stays private through the build phase~~ **superseded 2026-08-25: the repo is public** (and had been since 2026-07-07, before that strategy was written); reaffirmed as intentional. Visibility ≠ clearance — the open IP question is now visible work, which argues for sending the ask sooner. Keep work on personal time/equipment | PRD §11.2 #4 | ⚠️ **no longer deferred by privacy**; ask not yet sent |
| **License** | ✅ **Apache-2.0** (decided 2026-07-16); add LICENSE at product-repo creation | PRD §11.2 #3 | ✅ decided |
| **Naming/trademark** | ✅ **PromptMuster** (decided 2026-07-16; npm package `promptmuster`). Built Weeks 1–2 under the earlier name PromptLab; GitHub repo renamed `promptlab` → `prompt-muster` (LICENSE added same pass), retiring the PromptLab ↔ IBM watsonx "Prompt Lab" collision | PRD §0/§11.2 #1 | ✅ decided |
| **Privacy / data handling** | Local-first by default; keys never in repo; fixtures/results may hold PII → gitignored | TRD §4, §12; NFR-01/03 | 📝 |
| **Provider Terms of Service** | Storing/executing against OpenAI/Anthropic/Google APIs must respect each provider's ToS (key handling, rate limits, no prohibited use) | TRD §5, §12 | 📝 review |
| **Prompt-injection safety** | Shared/external prompts treated as untrusted; confirm-before-execute | TRD §12; NFR-02 | 📝 |

---

## 11. Maintenance

Update this matrix whenever: a requirement changes in the PRD, a design lands or moves in
the TRD, a phase completes, or an open decision resolves (flip ⛔ → 📝 and record the ADR).
The one remaining ⚠️ design gap (FR-COST-02) is the near-term to-do this matrix exists to
keep visible.

## Changelog
- **v0.7 (2026-08-04)** — Multi-angle audit findings: recounted functional requirements
  (33, not 30 — P0:16/P1:11/P2:6, not 14/9/7) and the total (43, not 40) — a miscount that
  had propagated uncorrected into qa-test-plan.md's header too (finding #21). FR-LIB-04
  closed: ticket coverage already existed (08.5/09.2/09.5) since the day after this
  matrix's last update but was never reflected here (finding #26). Cross-referenced to
  qa-test-plan.md §6 for TC-NFR-02's blocked status (finding #22).
- **v0.6 (2026-07-16)** — Rename propagated (§10 naming row): GitHub repo renamed
  `promptlab` → `prompt-muster` (npm package `promptmuster`), LICENSE added same pass;
  PromptLab↔IBM "Prompt Lab" collision origin preserved.
- **v0.5 (2026-07-16)** — D-name resolved: PromptMuster (§10 naming row flipped to
  decided; rename deferred to product-repo creation).
- **v0.4 (2026-07-16)** — D1 resolved: dotprompt adopted and extended (ADR-005 flipped to
  Accepted) — FR-LIB-01 unblocked. No near-term decisions remain blocked.
- **v0.3 (2026-07-16)** — Decision batch: D2 resolved (better-sqlite3, ADR-008 — NFR-04
  unblocked); license decided (Apache-2.0); employer-IP gate moved to Phase-3 launch via
  private-repo strategy. D1 remains the only near-term blocker (pick pending).
- **v0.2 (2026-07-15)** — Reconciliation pass. FR-EXE-05 design gap closed (ux-flows.md
  Flow 3); FR-LIB-07 (git-remote-as-backup) and NFR-09/NFR-10 (localhost origin
  validation; secret-scan warn) added and threaded to existing test cases; totals now
  30 FR + 10 NFR, 2 design gaps remaining.
- **v0.1 (2026-07-15)** — Initial matrix. Traced 29 functional + 8 non-functional
  requirements from PRD v0.1 against TRD v0.1. Found 3 design gaps (file-backed search,
  comparison view, cost-dashboard viz), no over-engineering, and 3 decision-blocked rows.
