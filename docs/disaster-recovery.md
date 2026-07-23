# PromptMuster — Disaster Recovery & Runbooks

|             |                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**  | 📝 Draft v0.1 — companion to [database-schema.md](database-schema.md), [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md), [devops-cicd.md](devops-cicd.md), [threat-model.md](threat-model.md) |
| **Owner**   | Shenbaga Srinivasan                                                                                                                                                                                      |
| **Created** | 2026-07-15                                                                                                                                                                                               |

---

## 0. Read this first — there is no server to crash

"Server crashes or data corruption" assumes a production server whose failure is an
_incident_ — paged on-call, many users affected, a status page. [ADR-001](adr/ADR-001-framework-free-core-library.md)
means that server mostly doesn't exist for this product. The process that could crash is
the user's **own local dashboard, on their own machine** — and if it does, there's no
incident, no on-call, no other users affected. It's one person's tool needing a restart.

That doesn't make disaster recovery irrelevant — it **inverts what the disasters are.**
Precisely _because_ this is local-first, there's no ops team and no automated backup
running behind the scenes unless the user set one up. A corrupted local file isn't a
service-wide outage, but for that one person it can be a permanent, total loss with nobody
else holding a copy — arguably a _worse_ personal outcome than a SaaS outage, even though
its blast radius is one person wide instead of thousands.

So this document is organized by **blast radius**, not by "server vs. not":

| Tier                                                       | Blast radius                         | What's actually at risk                                                                                |
| ---------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **[§1](#1-tier-1--single-user-local-incidents) Tier 1**    | One user, their machine              | Run history, cost data, eval cache — **not** prompts (see [§1.0](#10-the-asymmetry-that-matters-here)) |
| **[§2](#2-tier-2--multi-user-affecting-incidents) Tier 2** | Everyone who installed a bad release | A published npm version, the CI Action, the demo site                                                  |
| **[§3](#3-tier-3--phase-4-team-tier-not-built) Tier 3**    | Team tier, once it exists            | Where classic server DR finally applies — not built yet                                                |

### 1.0 The asymmetry that matters here

[ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md) put prompts, eval suites,
and baselines in git — the most important data in the system is **already disaster-
resistant by design**, inheriting git's own durability and (if a remote exists) off-machine
replication for free. The one thing that lives only in local SQLite —
`execution_runs`/`eval_runs`/`eval_results` — is real to lose, but losing it costs you
_history and cost tracking_, never your actual prompt library. Every Tier 1 runbook below
should be read with that asymmetry in mind: it changes what "how bad is this" actually
means for this product specifically.

---

## 1. Tier 1 — single-user, local incidents

### 1.1 SQLite database corrupted or lost

**Symptom:** app fails to start, or queries throw `database disk image is malformed` /
`file is not a database`.

**Diagnose:**

```sh
sqlite3 promptmuster.db "PRAGMA integrity_check;"
```

Lists corrupted pages/tables, if any.

**Impact assessment — say this plainly to the user:** run history, cost data, and the eval
cache are affected. **Your prompts, eval suites, and baselines are untouched** — they're
git files ([§1.0](#10-the-asymmetry-that-matters-here)), not in this database at all.

**Recovery, in order:**

```sh
# 1. SQLite's own recovery tool — salvages what it can into a fresh file
sqlite3 promptmuster.db ".recover" | sqlite3 promptmuster-recovered.db

# 2. If that fails, or the file is gone entirely: re-initialize from scratch.
# You lose run history and cost history permanently — but nothing about
# the actual product (prompts) is lost, only its accounting layer.
PromptMuster db init --fresh
```

**Prevention:** PromptMuster doesn't need its own backup infrastructure here — the honest
recommendation is that the user's **existing OS-level backup** (Time Machine, File
History) already covers this if enabled, since the SQLite file just sits in a normal user
data directory. Reinventing that would be solving a problem the OS already solves.

### 1.2 Prompt library (git repo) corrupted or lost

**This is the more serious Tier 1 scenario** — unlike [§1.1](#11-sqlite-database-corrupted-or-lost),
this can genuinely mean losing the actual product, not just its history.

**Diagnose:**

```sh
git -C ~/.promptmuster/prompts fsck --full
git -C ~/.promptmuster/prompts remote -v   # is there anywhere else a copy exists?
```

**Recovery — if a remote exists:** full recovery, zero loss beyond anything not yet pushed.

```sh
git clone <remote-url> prompts-recovered
```

**Recovery — if no remote exists:** stated plainly, not softened — this is a real
limitation of local-first that a hosted SaaS wouldn't have (a SaaS backs up its own
database by default; local-first pushes that responsibility onto the user). Recovery
options at that point are OS trash/recycle bin (if not yet emptied) or OS-level file
recovery tools, best-effort only.

**Prevention — the actual fix, and a genuine gap in every prior doc:** nothing in
[prd.md](prd.md) or [trd.md](trd.md) currently frames a git remote as a **backup**
recommendation for solo Phase 1–3 users — remotes only come up in the context of Phase 4
team sharing. **They should be recommended from day one, for this reason specifically.** A
first-run setup step suggesting "connect an empty private GitHub repo" — framed as disaster
recovery, not collaboration — is a small, high-leverage addition. Queued as a finding in
[§4](#4-findings-that-feed-back-into-earlier-docs).

### 1.3 A run or eval suite stuck "running" forever

**New finding — no prior doc specified this.** [database-schema.md](database-schema.md)
defines `execution_runs.status` and `eval_runs.status` as enums including `'streaming'` /
`'running'`, but never specifies what reconciles a row if the process dies mid-execution —
laptop sleep, a crash, `kill -9`. Without a fix, the Runs screen and Cost dashboard show a
phantom row "still running" forever.

**Symptom:** a run visibly stuck in-progress after the app has been restarted.

**Diagnose:**

```sql
SELECT * FROM execution_runs
WHERE status IN ('streaming', 'running')
  AND created_at < datetime('now', '-1 hour');
```

Any match is almost certainly orphaned — a genuinely in-flight request wouldn't still be
`streaming` an hour later in normal operation.

**Fix — a new required behavior, feeding back to [trd.md §6](trd.md) and
[database-schema.md §2.3/2.4](database-schema.md):** on every core startup, run exactly
this query and transition matching rows to a new status value, **`'interrupted'`** —
distinct from `'failed'`, because `'failed'` implies a known error occurred and
`'interrupted'` honestly means "the process died; we don't know what happened." This is a
schema addition this document is proposing, not one that already existed.

### 1.4 Eval results look wrong — suspected cache poisoning

**New finding.** A user reports: "the eval says this still passes, but the output I can
see doesn't look right." [database-schema.md §2.5](database-schema.md)'s cache mechanism —
reusing an `execution_run` when its `cache_key` matches — has a failure mode no prior doc
addressed: if the hash function backing `cache_key` doesn't cover every input that actually
affects the output (say a future change adds a new model parameter but the hash isn't
updated to include it), two genuinely different requests can collide onto the same cached
row, and a _wrong_ result gets served with total confidence.

**Diagnose:** compare the cached row's `resolved_messages_json` against what the current
request _should_ have produced — if they differ but `cache_key` matched, that's the bug,
not user error.

**Fix — a new design requirement, feeding back to [trd.md §6.4](trd.md) and
[database-schema.md §2.3](database-schema.md):** `cache_key`'s hash preimage must include a
**`CACHE_SCHEMA_VERSION`** constant. Bumping that constant on any future change to what
factors into caching invalidates every old cache entry at once — a clean break, not a
silent, lingering collision. Without this, a cache bugfix has no way to invalidate the
stale entries the bug already created.

**Recovery in the interim:**

```sh
PromptMuster cache clear   # new CLI command this runbook is proposing
```

Forces every subsequent eval run to bypass the cache and create fresh `execution_runs`.

### 1.5 Migration failure on startup

**Symptom:** app won't start; a schema migration errored partway through.

**Diagnose:** check which migration failed and whether it left the schema in a partial
state (SQLite's lack of full transactional DDL in older versions makes this a real risk).

**Recovery:** restore from the most recent OS-level backup if the failure is destructive;
otherwise, a forward-fix migration is the correct response — never a manual schema edit
that isn't captured in a migration file, since that silently diverges the local schema from
what every future migration assumes.

### 1.6 OS keychain / credential issues

**Symptom:** "provider not connected" after previously working, or after switching
machines. **Impact:** low — this is a re-entry inconvenience, not data loss, since keys are
never the only copy of anything (the provider account itself is the source of truth).
**Recovery:** Settings → Providers → reconnect. No data at risk either way, per
[trd.md §12](trd.md)'s "keys never in the repo or database" design.

---

## 2. Tier 2 — multi-user-affecting incidents

The closest thing this system has to a classic "production incident" — one bad action
affects everyone who installed it, not just one machine.

### 2.1 A bad `@promptmuster/*` version published to npm

Ties directly to [threat-model.md T6](threat-model.md) and [devops-cicd.md §2](devops-cicd.md).

**Detection:** a user report, or a post-publish smoke test failing.

**Immediate mitigation** — `npm unpublish` is time-limited (72 hours) and discouraged once
a version has real installs; `deprecate` is the honest, always-available tool:

```sh
npm deprecate @promptmuster/core@1.4.2 "Broken — upgrade to 1.4.3 immediately, do not install this version"
```

**Fix-forward:** publish the patched version immediately. `deprecate` only warns future
installers — it doesn't touch anyone already on the broken version, so the patch release
is the actual fix, not the warning.

### 2.2 CI Action causing runaway spend in a consumer's repo

Ties to [threat-model.md T8](threat-model.md).

**Detection:** a consumer reports unexpected cost.

**Diagnose:** check whether this is the known fork-PR gap ([threat-model.md §6.2](threat-model.md) —
currently an _open question_, not yet built) or a genuine bug where `budget-cap-usd` wasn't
respected. **This runbook existing is itself an argument for building fork-PR estimate-only
mode sooner** — without it, this incident is a _when_, not an _if_.

**Mitigation:** in the interim, tell the affected user to lower `budget-cap-usd` or disable
the Action on their repo; ship a patched Action release under the existing `v1` tag once
fixed ([devops-cicd.md §4.3](devops-cicd.md)).

### 2.3 Demo site (Vercel) down

**Detection:** Vercel's own status page, or a report that the résumé link is broken.

**Diagnose:** platform-wide Vercel outage (nothing to fix; wait) vs. a broken deploy from a
bad commit to `main`.

**Mitigation:** Vercel's instant rollback to the last working deployment.

**Severity, stated honestly:** this is a résumé link, not a paying customer's production
system. No 3am urgency — proportional response, not incident-response theater for a demo.

---

## 3. Tier 3 — Phase 4 team tier (not built)

Sketched lightly, matching this doc series' convention for anything two phases out. This
is the **one** place classic server DR finally applies in full, once
[ADR-003](adr/ADR-003-sqlite-local-postgres-team.md)'s Postgres tier exists: automated
backups with point-in-time recovery, NestJS health checks, and a rolling or blue-green
deploy so a bad release doesn't take the whole team tier down at once. None of this is
designed here — out of scope until Phase 4 planning, consistent with [prd.md §7.6](prd.md).

---

## 4. Findings that feed back into earlier docs

Consistent with this series' pattern — each doc audits its predecessors rather than
silently absorbing new decisions. **Update (same day):** all four items below were folded
upstream in the 2026-07-15 reconciliation pass — see each target doc's v0.2 changelog.

1. **Stuck-run reconciliation** ([§1.3](#13-a-run-or-eval-suite-stuck-running-forever)) —
   a new required startup routine and a new `'interrupted'` status value, owed to
   [trd.md §6](trd.md) and [database-schema.md §2.3–2.4](database-schema.md).
2. **Cache schema versioning** ([§1.4](#14-eval-results-look-wrong--suspected-cache-poisoning)) —
   `CACHE_SCHEMA_VERSION` in the `cache_key` hash preimage, owed to [trd.md §6.4](trd.md)
   and [database-schema.md §2.3](database-schema.md).
3. **Git remote as a backup recommendation, not just a sharing feature**
   ([§1.2](#12-prompt-library-git-repo-corrupted-or-lost)) — belongs in onboarding /
   [prd.md](prd.md), currently absent from every prior doc.
4. **Fork-PR estimate-only mode** — [threat-model.md](threat-model.md) left this as an open
   question; [§2.2](#22-ci-action-causing-runaway-spend-in-a-consumers-repo)'s concrete
   incident scenario is an argument for resolving it toward "build it," not "document the
   limitation and move on."

---

## 5. Postmortem template

Lightweight, for a solo maintainer's own use — no blameless-culture ceremony needed when
there's one person, but the habit of writing it down still pays for itself:

```
## What happened
## When detected, and how
## Root cause
## Immediate fix
## Prevention (what changes so this can't recur)
## Was this in threat-model.md? If not — add it now, not later.
```

That last line is deliberate: a postmortem that reveals a threat
[threat-model.md](threat-model.md) didn't anticipate is exactly the kind of finding this
whole doc series has been feeding backward the entire time — this is the mechanism that
keeps doing it after launch.

---

## 6. Open questions

1. **A `promptmuster doctor` command.** Bundling [§1.1](#11-sqlite-database-corrupted-or-lost)'s
   integrity check, [§1.3](#13-a-run-or-eval-suite-stuck-running-forever)'s stuck-run scan,
   and [§1.2](#12-prompt-library-git-repo-corrupted-or-lost)'s `git fsck` into one
   convenience command, rather than expecting a user to know each individually. Not
   committed to here, but a natural next CLI feature.
2. **Should PromptMuster ever run its own scheduled SQLite backup** (a rotating local `.bak`
   copy) rather than relying entirely on OS-level backup? Deferred — not clearly worth the
   complexity yet, per [§1.1](#11-sqlite-database-corrupted-or-lost)'s reasoning.

---

## Changelog

- **v0.2 (2026-07-15)** — All four §4 findings folded upstream same-day (TRD §6.4/§11/§12,
  database-schema §2.3–2.4/§7, PRD §7.1, threat-model §6 Q2).
- **v0.1 (2026-07-15)** — Initial runbooks. Reframed around blast radius instead of
  "server vs. not," since there's mostly no server; six Tier 1 (single-user) runbooks, three
  Tier 2 (multi-user) runbooks, a light Tier 3 sketch. Two genuine engineering gaps found and
  fed back upstream (stuck-run reconciliation, cache-key schema versioning), plus a product
  recommendation (git remote as backup, not just sharing) absent from every prior doc.
