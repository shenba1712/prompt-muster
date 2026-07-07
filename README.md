# PromptLab

A local-first AI prompt engineering workbench for managing, organizing,
versioning, testing, and iterating on AI prompts.

Think Postman for APIs, but for AI prompts.

## What It Does

PromptLab gives you one place to write, store, organize, test, compare,
and improve your AI prompts — accessible from your browser, your IDE,
your terminal, and your CI/CD pipeline.

**Your prompts stay on your machine.** No third-party server sees your
data unless you explicitly opt into team sync.

## Why

- Prompts are scattered across chat histories, Notion docs, and random
  text files
- No way to compare how the same prompt performs across different models
- No visibility into what prompts cost before or after execution
- Good prompts exist only in individual engineers' heads
- No version history to track how a prompt evolved

## Features

### Current (Week 1)

- [x] Create, edit, delete prompts
- [x] Favorite prompts
- [x] Filter by model, category, favorites
- [x] Full-text search across titles and content
- [x] Category and tag organization

### Planned

- [ ] Professional UI with shadcn/ui
- [ ] Next.js routing (list, detail, editor pages)
- [ ] NestJS backend with PostgreSQL
- [ ] Local-first architecture with API key encryption
- [ ] Execute prompts against GPT-4o, Claude, Gemini
- [ ] Streaming responses
- [ ] Multi-model side-by-side comparison
- [ ] Template variables with dynamic form generation
- [ ] Pre-execution cost estimation and model recommendations
- [ ] Version history with visual diffs
- [ ] Prompt linter (static analysis for anti-patterns)
- [ ] Cost and performance tracking dashboard
- [ ] MCP server for IDE integration (Claude Code, Cursor)
- [ ] CLI tool
- [ ] GitLab and GitHub webhook integration for automated PR reviews
- [ ] Embeddings and semantic search
- [ ] Optional team sync with access controls

See [BACKLOG.md](./BACKLOG.md) for the full 41-feature roadmap.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js, React, TypeScript          |
| Styling   | shadcn/ui (planned)                 |
| Backend   | NestJS (planned)                    |
| Database  | PostgreSQL (planned)                |
| AI        | OpenAI, Anthropic, Google AI APIs   |
| Search    | Embeddings + vector similarity      |
| Deploy    | Docker                              |
| CI/CD     | GitHub Actions                      |

## Architecture

### Local-First

All data stays on your machine by default. Three modes:

| Mode  | For                    | Data Location                    |
|-------|------------------------|----------------------------------|
| Local | Solo developer         | Your machine only                |
| Sync  | Multiple devices       | Your machine + encrypted backup  |
| Team  | Engineering teams      | Shared server, access controls   |

### Four Interfaces

Same internal API, different access points:

PromptLab
├── Web UI        Browse, edit, execute prompts
├── MCP Server    IDE integration (Claude Code, Cursor)
├── CLI           Terminal access, scripting, automation
└── Webhook API   GitLab + GitHub automated reviews

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/<your-username>/promptlab.git
cd promptlab
npm install
npm run dev
Open http://localhost:3000.

##Commands
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx tsc --noEmit     # Type-check without emitting

##Project Structure
src/
  app/              Next.js App Router pages and layouts
  components/       React components (one per file)
  hooks/            Custom React hooks
  types/            TypeScript type definitions
  utils/            Pure utility functions

```

## Status
This is an actively developed portfolio project. See
DASHBOARD.md for current progress.

License
MIT