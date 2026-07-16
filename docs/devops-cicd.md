# PromptMuster — DevOps & CI/CD Pipeline Docs

| | |
|---|---|
| **Status** | 📝 Draft v0.1 — companion to [trd.md §10, §13](trd.md), [ADR-001](adr/ADR-001-framework-free-core-library.md), [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md) |
| **Owner** | Shenbaga Srinivasan |
| **Created** | 2026-07-15 |

---

## 0. Read this first — there is no production server to deploy the core product to

"Automate building, testing, and shipping code" usually means: CI runs on push, then a
deploy pipeline pushes a server to production. That model doesn't fit here, on purpose —
[ADR-001](adr/ADR-001-framework-free-core-library.md) put the domain logic in a
framework-free library the CLI and MCP server run **locally, in-process, on the user's own
machine.** There is no PromptMuster production server serving the core product, so there is
nothing to "deploy" in the conventional sense for Phase 1–3.

What "shipping" actually means here splits into **four distinct pipelines**, each with a
different trigger, a different audience, and — critically — different secrets. Conflating
them is the most likely mistake, so each gets its own section:

| Pipeline | Ships what | To whom | Runs where |
|---|---|---|---|
| **[§1](#1-pipeline-a--repo-ci-keeps-this-codebase-healthy) A — Repo CI** | Nothing — verifies the codebase | Nobody; internal quality gate | This repo's own GitHub Actions |
| **[§2](#2-pipeline-b--package-publish-the-real-shipping-mechanism) B — Package publish** | `@promptmuster/core`, `cli`, `mcp` | Anyone running `npm install` | This repo's own GitHub Actions, on a version tag |
| **[§3](#3-pipeline-c--demo-site-deploy-corrected-from-the-old-plan) C — Demo site deploy** | A read-only sample instance | Hiring managers, résumé link | Vercel |
| **[§4](#4-pipeline-d--the-ci-action-a-shipped-product-feature-not-internal-tooling) D — The CI Action** | A GitHub Action *product* | Other people's repos | Whichever repo installs it |

Phase 4's team backend is the **one** place a conventional "build → test → deploy to a
running server" pipeline actually exists — that gets its own light section
([§5](#5-pipeline-e--team-tier-deploy-phase-4-only)), sketched at the same shallow depth
this whole doc series uses for anything two phases out.

---

## 1. Pipeline A — Repo CI (keeps this codebase healthy)

Runs on every push and PR to the PromptMuster tool's own repository. Ships nothing; its only
job is to fail loudly before something broken merges.

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm test          # vitest run — see §1.1 for what this actually covers
      - run: npm run build
```

### 1.1 What "test" covers here — and what it deliberately never does

Per [trd.md §11](trd.md): pure functions (parser, cost calculation, template
interpolation) are unit-tested directly; provider adapters are tested against **recorded
fixtures**, never live calls; the eval engine is tested against a deterministic fake
provider. This is a deliberate constraint, not a gap:

> **Pipeline A never calls a real LLM provider.** No `ANTHROPIC_API_KEY`, no
> `OPENAI_API_KEY`, nothing live — for cost (this runs on every push), determinism
> (a flaky provider response shouldn't fail an unrelated PR), and because this repo's own
> CI has no legitimate reason to hold anyone's provider credentials at all.

This is worth stating explicitly because it's the opposite of Pipeline D
([§4](#4-pipeline-d--the-ci-action-a-shipped-product-feature-not-internal-tooling)), where
making real provider calls is the *entire point*. Conflating the two — e.g. assuming
"PromptMuster has an eval-on-PR Action" means *this* repo's CI burns real API spend on every
commit — is the specific mistake this split is meant to prevent.

### 1.2 Branch protection

`main` requires Pipeline A green before merge. No additional gate exists yet for Pipeline
A itself to run PromptMuster's eval engine against a fixture prompt library as a deeper
regression check on the eval engine's own correctness — flagged as a genuine future idea in
[§6](#6-open-questions), not committed to here.

---

## 2. Pipeline B — Package publish (the real shipping mechanism)

Since there's no server, **this is what "ship code" actually means for the core
product** — versioning and publishing `@promptmuster/core`, `@promptmuster/cli`, and
`@promptmuster/mcp` to npm, matching the monorepo-with-scoped-packages shape implied by
[trd.md §1](trd.md)'s `@promptmuster/core` naming.

```yaml
# .github/workflows/publish.yml
name: Publish
on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --workspaces --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 2.1 Versioning strategy — lockstep, deliberately, for now

`core`, `cli`, and `mcp` share **one version number**, bumped together on every release,
rather than independent per-package semver (the norm in larger monorepos, typically via a
tool like Changesets). For a solo maintainer, "core v2.3 + cli v1.1 + mcp v1.4" is
combinatorial confusion with no present payoff — lockstep is the simplest thing that
satisfies today's requirement. Revisit if multiple contributors arrive, or if any package
develops a stable public contract that shouldn't be forced to rev just because a sibling
package changed.

---

## 3. Pipeline C — Demo site deploy (corrected from the old plan)

The original backlog's `#07b Vercel Deployment` planned a browser-only demo persisting
data in IndexedDB. **That plan is now stale** — [ADR-002](adr/ADR-002-prompts-as-files-runs-in-database.md)
moved prompts to git files, not IndexedDB, and a Vercel serverless deployment has neither a
persistent writable git repo nor the visitor's own filesystem. The old plan's storage
model doesn't exist anymore; the demo needs a different answer, not a resurrection of the
old one.

### 3.1 What the demo actually is

A **read-only sample instance**, not a live multi-user deployment of the real product:

- A small, curated set of sample `*.prompt.md` files is bundled into the deployment at
  build time (not user-editable — there's no writable git repo to save into in a
  serverless context).
- **Execute and Compare work for real** — a visitor pastes their own API key into a
  client-side field; the request goes straight from their browser to the provider, and the
  key is never sent to or stored by PromptMuster's own infrastructure. This is the one
  interactive part of the demo, and it stays honest to the local-first thesis even though
  it's hosted: PromptMuster still never sees anyone's key.
- **Save, History/Diff, and MCP are not demoable this way** — there's no writable repo and
  no IDE to demo from a browser tab. These are covered by the OSS repo itself plus a
  recorded walkthrough (GIF/video) linked from the same demo page, rather than faked.

### 3.2 Deploy mechanism

Vercel's native GitHub integration (auto-deploy on push to `main`) is sufficient — no
custom Action needed. `VERCEL_TOKEN` and project linkage are PromptMuster's own deploy
credentials; no provider API key is ever a Vercel environment variable, since the demo
takes the visitor's own key client-side per [§3.1](#31-what-the-demo-actually-is).

### 3.3 What this replaces

`#07a IndexedDB Persistence Layer` and `#07b Vercel Deployment` in
[core/backlog.md](core/backlog.md) described the old plan. This section is the
corrected version; the backlog entries themselves are stale and should be updated to point
here rather than left describing an architecture that no longer exists.

---

## 4. Pipeline D — The CI Action (a shipped product feature, not internal tooling)

This is the one pipeline that's actually a **product PromptMuster ships to other people's
repos** — [trd.md §10](trd.md), demoed in [ux-flows.md Flow 7](ux-flows.md). It has two
parts: the Action's own definition, and what a PromptMuster user puts in *their* repo to
consume it.

### 4.1 The Action itself (`action.yml`, maintained in this repo)

```yaml
# action.yml
name: 'PromptMuster Eval'
description: 'Run promptmuster eval suites on changed prompts and comment results on the PR'
inputs:
  anthropic-api-key:
    required: false
  openai-api-key:
    required: false
  google-api-key:
    required: false
  budget-cap-usd:
    description: 'Fail the run rather than exceed this spend'
    required: false
    default: '5.00'
runs:
  using: 'node20'
  main: 'dist/index.js'
```

The Action's implementation is a thin wrapper calling `promptmuster eval --changed` (the CLI —
[api-specifications.md §1](api-specifications.md)'s `runEvalSuite`), diffing against the
committed `*.baseline.json`, and posting the PR comment shown in
[ux-flows.md Flow 7](ux-flows.md).

### 4.2 What a PromptMuster user puts in *their* repo to use it

```yaml
# a PromptMuster user's own .github/workflows/promptmuster-eval.yml
name: PromptMuster Eval
on: pull_request

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: promptmuster/eval-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**This is the one pipeline that makes real provider calls on purpose** — that's its entire
job. The API key is the *consuming repo's own* secret, configured by that repo's owner —
never something PromptMuster's own infrastructure holds or sees, the same "keys never touch
PromptMuster's infra" principle from [trd.md §12](trd.md), just extended to a new context.

### 4.3 The Action's own release mechanism

Consumers pin `@v1`, not a specific patch — the standard GitHub Actions convention (the
same one `actions/checkout` uses): a `v1` tag is repointed to the latest compatible commit
on each release, so users get fixes automatically without re-pinning. A breaking change
would ship as `@v2`, leaving existing `@v1` consumers untouched.

---

## 5. Pipeline E — Team tier deploy (Phase 4 only)

Sketched lightly, matching this doc series' convention for anything two phases out. NestJS
+ Postgres ([ADR-001](adr/ADR-001-framework-free-core-library.md),
[ADR-003](adr/ADR-003-sqlite-local-postgres-team.md)) need an actual running server —
the one legitimate "deploy to production" pipeline in this whole system.

```
docker-compose.yml (sketch only)
├── app        — NestJS wrapper around @promptmuster/core (ADR-001)
└── db         — postgres:16
```

Full CI/build/deploy detail, environment separation, and secrets management for this tier
are explicitly **not** designed here — out of scope until Phase 4 planning, consistent
with [prd.md §7.6](prd.md).

---

## 6. Secrets — one consolidated view

The question "who holds which secret" is exactly where conflating the four pipelines would
cause real harm, so it gets one table instead of being scattered across four sections:

| Secret | Lives in | Used by | Never appears in |
|---|---|---|---|
| `NPM_TOKEN` | This repo's GitHub secrets | Pipeline B only | Pipelines A, C, D |
| `VERCEL_TOKEN` | This repo's GitHub secrets (or Vercel's own git integration) | Pipeline C's deploy step only | Anywhere a provider key could leak from |
| Anthropic/OpenAI/Google keys (demo) | The **visitor's browser**, entered client-side | Pipeline C's Execute/Compare feature | PromptMuster's servers, ever |
| Anthropic/OpenAI/Google keys (eval Action) | The **consuming repo's own** GitHub secrets | Pipeline D only | This repo, or any other consumer's repo |
| Anthropic/OpenAI/Google keys (repo CI) | **Nowhere — Pipeline A never holds one** | — | Pipeline A, by design ([§1.1](#11-what-test-covers-here--and-what-it-deliberately-never-does)) |

---

## 7. Open questions

1. **Sample-data curation for the demo ([§3](#3-pipeline-c--demo-site-deploy-corrected-from-the-old-plan)).**
   Who decides which prompts ship in the read-only demo, and how do they stay in sync with
   the prompt file format as it evolves (dotprompt, per
   [ADR-005](adr/ADR-005-prompt-file-format-adopt-not-invent.md))? Not yet decided.
2. **When to move off lockstep versioning ([§2.1](#21-versioning-strategy--lockstep-deliberately-for-now)).**
   Flagged with its own trigger condition rather than left as a vague "someday."
3. **Should Pipeline A eventually dogfood the eval engine against a fixture prompt
   library** — using the product to test the product, distinct from Pipeline D which
   serves *other* repos — as a deeper regression check on the eval engine's own
   correctness? A real idea, not committed to here.

---

## Changelog

- **v0.1 (2026-07-15)** — Initial pipelines. Four shipping mechanisms identified and kept
  deliberately separate (repo CI, npm package publish, demo site, the CI Action as a
  product) plus a light Phase 4 sketch; the old IndexedDB-based Vercel demo plan
  identified as stale against ADR-002 and replaced with a read-only sample-instance design;
  one consolidated secrets table showing which pipeline holds which credential and,
  crucially, which ones hold none at all.
