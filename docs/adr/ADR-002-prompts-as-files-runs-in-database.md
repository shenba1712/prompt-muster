# ADR-002: Prompts and eval baselines as files; execution runs and logs in a database

Status

🟢 Accepted

Date

2026-07-15

Project

PromptMuster

---

# Context

The product's differentiation thesis ([prd.md §6](../prd.md)) rests on
prompts being versioned, diffed, shared, and reviewed the same way source code is — via
git. At the same time, execution runs (potentially thousands over the product's life,
queried and aggregated for the Cost dashboard and for eval regression comparisons) are a
fundamentally different shape of data: high-volume, append-only, relational — not meant to
be hand-edited or diffed line by line.

---

# Decision

Prompts (`*.prompt.md`) and eval test cases/baselines (`*.eval.yaml`, `*.baseline.json`)
are stored as plain files in the user's own git repository. Execution runs and logs are
stored in a local database (SQLite — see [ADR-003](ADR-003-sqlite-local-postgres-team.md)),
never as files.

---

# Why?

Git already solves version history, diffing, rollback, and sharing — reimplementing any of
that as an in-app feature (as the original 43-feature backlog's Version History / Diffs /
Rollback items proposed) would be strictly worse than what git already provides for free,
and it would undercut the "review prompts in PRs like code" positioning. Execution logs, by
contrast, gain nothing from being files — they need to be queried and aggregated in ways a
flat file store handles poorly at volume.

---

# Alternatives Considered

Alternative

Everything in a database, prompts included — the conventional SaaS CRUD shape.

Pros

- A single storage technology to reason about
- Simpler, ORM-only codebase

Cons

- Loses git-native versioning, diffing, and sharing entirely — the single biggest
  differentiator in [prd.md](../prd.md)
- Re-implementing version history as an app feature was explicitly one of the original
  backlog's weaker ideas

Alternative

Everything as files, execution runs included (e.g. one JSON file per run).

Pros

- Maximum consistency — a single storage model everywhere
- No database dependency at all

Cons

- Aggregating cost/tokens across thousands of run-files for the Cost dashboard would mean
  scanning and parsing every file on every query — a database is the correct tool for
  exactly this access pattern
- A repo accumulating thousands of small generated run-files would bloat repo size and
  clutter `git log` for the user's actual prompt-authoring history

---

# Consequences

Positive

- Version history, diffing, and sharing are free — git already does them
- Execution logs get proper query and aggregation performance
- Each data type's storage matches its actual shape

Negative

- Two storage systems to reason about instead of one
- Every new data type going forward needs a "which store does this belong in" decision

Trade-offs

More architectural surface area than an all-one-database (or all-files) design, in
exchange for each data type getting genuinely appropriate storage rather than a
one-size-fits-all compromise.

---

# Impact

Performance — fast run/cost queries via SQLite; git operations stay fast since run-logs
never bloat the repository
Scalability — the SQLite→Postgres path (ADR-003) is unaffected by file-based prompts
Maintainability — a clear boundary: authored-by-a-human = file, generated-by-the-system-
at-volume = database
Security — prompts/baselines are plaintext in the user's own repo; no secrets belong there
(see [trd.md §12](../trd.md))
Developer Experience — prompts are editable in any text editor, reviewable in any PR tool
Deployment — no migration step for prompt storage; only the database needs schema
migrations
Testing — file I/O and database I/O are tested independently, with simpler fixtures
Cost — no hosted storage cost for either, locally
AI — MCP/CLI can read prompt files directly with zero query layer in between

---

# Risks

- The prompt file format is a one-way door once shared or adopted — see
  [ADR-005](ADR-005-prompt-file-format-adopt-not-invent.md).
- The file/database boundary itself could blur over time if a future feature doesn't
  cleanly belong to either (eval result caching is flagged as exactly this open question
  in [trd.md §14](../trd.md)).

---

# Validation

`git log` / `git diff` on a prompt file produce a meaningful, human-readable history with
zero app-side version-history code. The Cost dashboard's aggregation queries run against
SQLite with acceptable latency at expected run volumes for a solo user (hundreds to low
thousands of runs).

---

# Future Revisit

If eval result caching or team-mode sync reveals the file/database boundary doesn't hold
cleanly, revisit which store owns what.

---

# Related Documents

[prd.md §6.0, §11](../prd.md) (the file format as the load-bearing decision)
[trd.md §3, §4](../trd.md)
[compliance-matrix.md FR-LIB-01, FR-COST-01](../compliance-matrix.md)

---

# Staff Reflection

Could I clearly explain this decision to another engineer?

☑ Yes　☐ Mostly　☐ No

---

Did I choose the simplest solution that satisfies today's requirements?

☑ Yes　☐ Maybe　☐ No

---

Did I optimise for today's problems or hypothetical future problems?

☐ Today's　☐ Future　☑ Balanced — files-for-prompts solves today's git/diff/share need;
database-for-runs anticipates the Cost dashboard's real query pattern rather than waiting
to hit a wall with file-scanning.

---

Would I make the same decision again?

Yes. The split maps cleanly to how each data type is actually used — this held up under
every downstream document (IA's screens, the design system's diff/history components) that
built on it without needing to fight the boundary.

---

# Lessons Learned

Not yet — complete after Phase 1 implementation.
