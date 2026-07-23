# PromptMuster

**Your prompts as files in git — tested like code, measured for cost, and available where
you work.**

A git-native prompt engineering toolkit. Prompts live as files in a repository, get tested
against expected outputs, are measured for cost before and after every run, and are
reachable inside your IDE through an MCP server. Local-first: no PromptMuster server ever
holds your prompts or API keys.

> Working codename was **PromptLab** (Weeks 1–2); renamed to PromptMuster 2026-07-16. The
> npm package is `promptmuster`; this repo is `prompt-muster`.

## Why

Engineers treat prompts worse than any other production artifact:

- Editing a prompt is flying blind — no way to know whether a change made outputs better
  or worse.
- Cost is invisible, before and after every run.
- Prompts are scattered across chat histories and stray text files, and don't travel to
  where the work happens (IDE, terminal, CI).

Storage is table stakes in 2026 — the live problem is **"I changed my prompt; is it better
or worse, on which model, at what cost?"** That's an evaluation problem, and it's where
PromptMuster plays.

## What it does

- **Prompts as files** — version history is `git log`, diffing is `git diff`, sharing is a
  repo, and prompt changes are reviewable in PRs like code. File format is
  [dotprompt](https://github.com/google/dotprompt), extended via a namespaced
  `promptmuster:` frontmatter block.
- **Eval runner** — test cases and assertions (exact / contains / schema / property /
  LLM-judge) attached to each prompt; run the suite across models; see regressions against
  a committed baseline, with cost deltas.
- **MCP server** — your prompt library as native tools inside Claude Code, Cursor, and
  Claude Desktop: _"run my code-review prompt on this file."_
- **Cost intelligence** — token/cost preflight before you press run (exact where a
  provider exposes counting; honestly-labeled estimates where it doesn't), execution
  logging, and budget caps enforced in core.
- **Multi-model** — execute and compare across OpenAI, Anthropic, and Google from one
  place.

## Status

🚧 **Week 2 of ~40** — pre-release, built solo at ~75 min/day.

### Working now (Phase 0 — prototype)

- [x] Create, read, update, delete prompts
- [x] Favorite prompts
- [x] Filter by model, category, tags, favorites
- [x] Full-text search across titles and content
- [x] Category and tag organization
- [x] Test suite (Vitest + React Testing Library)
- [ ] Professional UI (shadcn/ui) — in progress
- [ ] Next.js routing (list / detail / editor pages)

### Roadmap (phase-based, not a flat feature list)

| Phase | Theme        | What lands                                                                                                           |
| ----- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| 1     | Useful-to-me | Prompts as dotprompt files, domain-model rewrite, multi-provider streaming execution, cost preflight, **MCP server** |
| 2     | Trustworthy  | The **eval runner** — assertions, LLM-as-judge, caching + budget caps, regression-vs-baseline                        |
| 3     | Shareable    | CLI, CI eval GitHub Action, side-by-side + cost dashboards, OSS launch + read-only demo                              |
| 4     | Team         | Shared prompt repos, and a NestJS + PostgreSQL hosted tier (team-only, by design)                                    |

Full product & technical docs are mirrored in this repo — [PRD](./docs/prd.md),
[TRD](./docs/trd.md), [backlog](./docs/core/backlog.md),
[ticket board](./docs/core/tickets.md), [dashboard](./docs/dashboard.md), and the
[ADRs](./docs/adr/README.md) — synced from the canonical roadmap repo:
<https://github.com/shenba1712/engineeros-roadmap>. Edit there, then re-sync here.

## Architecture

```
                    @promptmuster/core  (framework-free TypeScript)
                    parse · resolve vars · execute · eval · cost · storage
                                        │  in-process
        ┌──────────────┬───────────────┼────────────────┬──────────────┐
   Web dashboard   MCP server         CLI          CI eval Action   (Team API — Phase 4)
   Next.js         stdio, IDEs      terminal       other repos' PRs   NestJS + Postgres
        │
   Prompts + eval baselines → FILES in git · Runs + cost logs → local SQLite
   API keys → OS keychain / env, never anywhere else
```

There is no server in the core product — the CLI, MCP server, and dashboard all run the
same library in-process on your machine.

## Tech stack

| Layer     | Choice                                                                                       |
| --------- | -------------------------------------------------------------------------------------------- |
| Core      | TypeScript (strict), framework-free library                                                  |
| Dashboard | Next.js, React, shadcn/ui                                                                    |
| Storage   | Prompt files (git) + SQLite locally; PostgreSQL in the Phase-4 team tier only                |
| AI        | OpenAI, Anthropic, Google APIs — hand-built adapters first                                   |
| IDE       | MCP TypeScript SDK (stdio)                                                                   |
| Ship      | npm packages (`@promptmuster/core` / `cli` / `mcp`), GitHub Actions, Vercel (read-only demo) |

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/shenba1712/prompt-muster.git
cd prompt-muster
npm install
npm run dev        # dashboard on http://localhost:3000
```

Planned: `npm i -g @promptmuster/cli`, then `promptmuster mcp` to register the MCP server
in your IDE.

## Commands

```bash
npm run dev            # Start development server
npm run build          # Production build
npm run lint           # Run ESLint
npm test               # Run the test suite (Vitest)
npx tsc --noEmit       # Type-check without emitting
```

## Project structure

Docs and code are kept deliberately separate:

```
docs/               Everything that describes the project (not code)
  prd.md, trd.md,   Product & technical specs, IA, schema, threat model,
  ia.md, …          test plan, dashboard, …
  core/             Backlog, ticket board, engineering philosophy
  adr/              Architecture Decision Records
src/                Application code
  app/              Next.js App Router pages and layouts
  components/       React components (one per file)
  hooks/            Custom React hooks
  types/            TypeScript type definitions
  utils/            Pure utility functions
public/             Static assets
```

## License

Apache-2.0 — see [LICENSE](./LICENSE). Chosen for its patent grant and open-core
friendliness.
