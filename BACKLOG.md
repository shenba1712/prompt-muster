PROMPTLAB FEATURE BACKLOG

41 features. Priority order. Realistic pace.
Each feature built when prerequisites are met and engineering
concepts align with the roadmap curriculum.

Total timeline: ~40 weeks / 9-10 months at 75 min/day
The project is portfolio-worthy at the end of every tier.


Status Key

[ ] Not started
[~] In progress
[x] Complete


═══════════════════════════════════════════════════════
TIER 1 — FOUNDATION (Weeks 1-4)
═══════════════════════════════════════════════════════

These make PromptLab functional. Without them, nothing
else works. Every feature here is a prerequisite for
something in Tier 2 or 3.


#01 [ ] Prompt CRUD

     Create, read, update, delete prompts.

     Prerequisites: None
     Teaches: React components, TypeScript interfaces,
              state management, custom hooks
     Week: 1


#02 [ ] Prompt Favoriting

     Toggle favorite status with visual indicator.

     Prerequisites: #01
     Teaches: Immutable state updates, component
              composition, extending existing types
     Week: 1


#03 [ ] Multi-Dimensional Filtering

     Filter by model, category, tags, favorites, search.

     Prerequisites: #01, #02
     Teaches: Derived state, higher-order functions,
              computed values, avoiding stored derived state
     Week: 1


#04 [ ] Full-Text Search

     Case-insensitive search across titles and content.

     Prerequisites: #01
     Teaches: String manipulation, filter composition,
              debouncing (later optimization)
     Week: 1


#05 [ ] Category and Tag Organization

     Categorize by purpose, add custom tags.

     Prerequisites: #01
     Teaches: Union types, array manipulation, UI for
              multi-value inputs
     Week: 1


#06 [ ] Next.js Routing

     Separate pages: prompt list, prompt detail, prompt
     editor, settings.

     Prerequisites: #01-#05
     Teaches: App Router, layouts, dynamic routes, URL
              state, page-level data flow
     Week: 2-3


#07 [ ] Professional UI (shadcn/ui)

     Component library integration for consistent,
     professional design.

     Prerequisites: #01-#05
     Teaches: Design system integration, component
              customization, accessibility basics
     Week: 2-3


TIER 1 CHECKPOINT

After Tier 1, you can demonstrate:
- Clean React/TypeScript app with strict types
- Custom hooks with derived state
- Professional UI with routing
- Claude Code as development tool

Interview level: Junior to Mid — "I understand React
fundamentals and TypeScript deeply"


═══════════════════════════════════════════════════════
TIER 2 — BACKEND AND PERSISTENCE (Weeks 5-8)
═══════════════════════════════════════════════════════

The app transitions from frontend exercise to full-stack
application.


#08 [ ] NestJS Backend

     REST API for prompt operations.

     Prerequisites: #01-#07 (stable frontend)
     Teaches: NestJS modules, controllers, services,
              DTOs, validation, company backend stack
     Week: 5-6


#09 [ ] PostgreSQL Database

     Persistent storage replacing in-memory state.

     Prerequisites: #08
     Teaches: Schema design, migrations, SQL, ORM
              (Prisma or TypeORM), connection management
     Week: 5-6


#10 [ ] Local-First Architecture

     All data stored locally by default. No external
     server dependency for core operations.

     Prerequisites: #08, #09
     Teaches: Architectural decision-making, deployment
              models, trust boundaries, data ownership
     Week: 5-6
     DIFFERENTIATOR: Yes — genuine architectural
     distinction from all SaaS competitors


#11 [ ] API Key Encryption at Rest

     Encrypt stored API keys. Never plain text.

     Prerequisites: #09
     Teaches: Encryption basics, key management,
              secrets handling, security practices
     Week: 6


#12 [ ] Basic Prompt Execution (Single Provider)

     Execute a prompt against one LLM API. See result.

     Prerequisites: #08, #09, #11
     Teaches: External API integration, async operations,
              error handling, API key management
     Week: 7


#13 [ ] Streaming LLM Responses

     Token-by-token streaming instead of waiting for
     complete response.

     Prerequisites: #12
     Teaches: Server-Sent Events, chunked responses,
              progressive UI rendering, backpressure
     Week: 7-8


TIER 2 CHECKPOINT

After Tier 2, you can demonstrate:
- Full-stack application (React + NestJS + PostgreSQL)
- Local-first architecture with security considerations
- Working LLM integration with streaming
- Your company's exact tech stack

Interview level: Mid — "I can build and connect frontend
and backend systems with real AI integration"


═══════════════════════════════════════════════════════
TIER 3 — AI INTEGRATION (Weeks 9-12)
═══════════════════════════════════════════════════════

PromptLab becomes genuinely useful as an AI tool.
Transitions from "full-stack CRUD" to "AI-integrated
application."


#14 [ ] Multi-Provider Execution

     Execute against GPT-4o, Claude Sonnet, Claude Haiku,
     Gemini Pro. User chooses per execution.

     Prerequisites: #12, #13
     Teaches: Provider abstraction, adapter pattern,
              API differences across providers
     Week: 9


#15 [ ] Multi-Model Side-by-Side Comparison

     Run same prompt against multiple models. Compare
     output quality, latency, and cost in one view.

     Prerequisites: #14
     Teaches: Parallel async operations, comparison UI,
              data normalization across providers
     Week: 9-10


#16 [ ] Execution Logging

     Log every execution: model, input tokens, output
     tokens, latency, cost, timestamp.

     Prerequisites: #14
     Teaches: Append-only data modeling, time-series data,
              database schema for logs
     Week: 10


#17 [ ] Performance Ratings

     Rate output quality after execution (thumbs up/down
     or 1-5 stars). Feeds into model recommendations later.

     Prerequisites: #16
     Teaches: Feedback loop design, data collection UX,
              aggregation of subjective data
     Week: 10


#18 [ ] Cost Tracking Dashboard

     Cost per execution, per prompt over time, monthly
     projection, model comparison.

     Prerequisites: #16
     Teaches: Data visualization, aggregation queries,
              dashboard design, computed summaries
     Week: 10-11


#19 [ ] Context Slots (Template Variables)

     Typed template variables with dynamic form generation.

     Example prompt:
       Review this {{language}} code for {{review_focus}}:
       {{code}}
       Respond in {{output_format}}.

     Each slot has a type (text, select, multiline, file)
     and optional default.

     Prerequisites: #12
     Teaches: Template parsing (regex or simple parser),
              dynamic form generation from schema, type
              system design for slot definitions, FileReader API
     Week: 11


#20 [ ] Execution History with Replay

     Browse past executions. Re-run with different model
     or different variable values.

     Prerequisites: #16, #19
     Teaches: Immutable records, reproducibility,
              comparison UX, query patterns
     Week: 11-12


#21 [ ] Pre-Execution Token Count and Cost Estimate

     Before hitting "run," see exact input token count
     and estimated cost per model.

     Prerequisites: #14, #16
     Teaches: Token counting (tiktoken), cost calculation
              with dynamic pricing, UX for pre-action info
     Week: 12
     DIFFERENTIATOR: Partially — pre-execution cost info
     is uncommon


TIER 3 CHECKPOINT

After Tier 3, you can demonstrate:
- Multi-provider AI integration with streaming
- Side-by-side model comparison
- Cost tracking and pre-execution intelligence
- Template system with dynamic forms
- Full execution history with replay

Interview level: Mid to Senior — "I build AI-integrated
applications with thoughtful UX and data-driven features"


═══════════════════════════════════════════════════════
TIER 4 — DEPTH FEATURES (Weeks 13-20)
═══════════════════════════════════════════════════════

Transitions from "works correctly" to "thoughtfully
designed."


#22 [ ] Version History

     Every edit creates a version with timestamp and
     parent reference.

     Prerequisites: #09
     Teaches: Data modeling for versions (linked list
              of snapshots vs deltas), schema design
              for versioned entities
     Week: 13


#23 [ ] Visual Diffs

     Side-by-side comparison of any two versions showing
     additions, deletions, modifications.

     Prerequisites: #22
     Teaches: Diff algorithm (longest common subsequence),
              comparison UI, text analysis
     Week: 13-14


#24 [ ] Version Rollback

     Revert a prompt to any previous version.

     Prerequisites: #22
     Teaches: State management for versioned data,
              confirmation UX, data integrity
     Week: 14


#25 [ ] Prompt Linter

     Rule-based static analysis pipeline catching common
     prompt anti-patterns before execution.

     Example warnings:
     - "No output format instruction — responses may be
       inconsistent"
     - "Uses vague language — consider specifying criteria"
     - "Exceeds context window for selected model"
     - "Asks for multiple unrelated tasks — consider splitting"
     - "No examples provided — examples typically improve
       output quality"

     Built as a pipeline. Each rule is a pure function.
     Adding a rule means one function and one registration.

     Prerequisites: #01 (can work without backend)
     Teaches: Pipeline/chain of responsibility pattern,
              rule engine design, text analysis, plugin
              architecture, pure function testing
     Week: 14-15
     NOTE: Intentionally teaches where rule-based NLP
     analysis breaks down. The false positive rate for
     natural language is much higher than for code. This
     limitation IS the interview story.


#26 [ ] Pre-Execution Model Recommendations

     Based on historical execution data and ratings,
     recommend which model performs best for similar prompts.

     Prerequisites: #16, #17, #21
     Teaches: Recommendation logic from user data,
              statistical aggregation, correlation
     Week: 16-17
     DIFFERENTIATOR: Yes — personal data advantage. The
     tool gets smarter the more you use it. Data stays local.


#27 [ ] Semantic Similarity Detection

     Before saving a new prompt, warn if a similar prompt
     already exists. "This prompt is 87% similar to your
     'code-review-thorough' prompt."

     Prerequisites: #36 (embeddings infrastructure)
     Teaches: Embeddings, cosine similarity, threshold
              tuning, UX for suggestions
     Week: Deferred to after #36 (Tier 6 dependency)
     DIFFERENTIATOR: Partially — ties pre-execution
     intelligence together
     NOTE: Cannot be built until embeddings infrastructure
     exists. Placeholder in Tier 4 for planning but actual
     build happens after #36.


#28 [ ] MCP Server

     Expose prompt library as MCP tools for Claude Code
     and Cursor.

     Example: while coding, ask Claude Code:
       "Use my thorough-code-review prompt from PromptLab
       to review this file"

     Claude Code connects to local PromptLab MCP server,
     retrieves the prompt with template variables, fills
     in code context, executes.

     Prerequisites: #08, #19 (need API and templates)
     Teaches: MCP protocol implementation, tool schema
              design, inter-process communication, API
              design for non-human consumers
     Week: 18-20
     DIFFERENTIATOR: Yes — genuinely novel due to MCP
     ecosystem timing (late 2024). This window won't last
     forever.


TIER 4 CHECKPOINT

After Tier 4, you can demonstrate:
- Version history with visual diffs (data modeling depth)
- Rule-based analysis with honest understanding of
  limitations
- Recommendation system based on user data
- MCP server for IDE integration (genuinely novel)
- Architectural thinking across multiple feature domains

Interview level: Senior — "I design systems with
architectural thinking and understand trade-offs deeply"


═══════════════════════════════════════════════════════
TIER 5 — INTERFACES (Weeks 21-28)
═══════════════════════════════════════════════════════

Transitions from "web application" to "developer tool
with multiple interfaces." Same internal API, different
access points.


#29 [ ] CLI Tool

     Terminal access for power users and scripting.

     Commands:
       promptlab run "code-review" --model=claude-sonnet --file=./src/app.tsx
       promptlab list --category=debugging
       promptlab search "unit test"
       promptlab export --format=json

     Prerequisites: #08
     Teaches: CLI design, argument parsing, terminal UX,
              npm package publishing
     Week: 21-22


#30 [ ] Prompt Export as JSON/YAML

     Export prompt collections as shareable files. Like
     Postman collections.

     Prerequisites: #01
     Teaches: Serialization format design, schema
              versioning, file handling
     Week: 22


#31 [ ] Prompt Import with Validation

     Import collections, validate schema, handle version
     mismatches.

     Prerequisites: #30
     Teaches: Input validation, schema migration, error
              handling for malformed data
     Week: 22-23


#32 [ ] GitHub Webhook Integration

     Auto-review pull requests when opened using configured
     code review prompt.

     Flow:
     1. Webhook arrives with PR metadata
     2. PromptLab fetches diff via GitHub API
     3. PromptLab executes code review prompt
     4. PromptLab posts review as PR comment

     Prerequisites: #08, #14, #19
     Teaches: Webhook handling, GitHub API, OAuth app
              registration, webhook signature verification
     Week: 24-25


#33 [ ] GitLab Webhook Integration

     Same as GitHub but for GitLab merge requests.

     Prerequisites: #32 (reuse architecture)
     Teaches: Adapter pattern in production, payload
              normalization, multi-platform support
     Week: 25-26


#34 [ ] Multi-Platform Adapter

     Common event type normalized from GitLab and GitHub
     payloads. Adding Bitbucket means writing one new
     normalizer, not changing review logic.

     Prerequisites: #32, #33
     Teaches: Adapter pattern, abstraction design,
              interface-based architecture
     Week: 26


#35 [ ] CI/CD Pipeline

     GitHub Actions: tests, lint, type check on push.

     Prerequisites: Tests exist (should by this point)
     Teaches: GitHub Actions YAML, pipeline design,
              automated quality gates
     Week: 26-27


TIER 5 CHECKPOINT

After Tier 5, you can demonstrate:
- Four interfaces (Web, MCP, CLI, Webhook) to same API
- Adapter pattern for multi-platform integration
- CI/CD pipeline with automated quality gates
- Export/import for file-based sharing

Interview level: Senior to Staff — "I build developer
tools with multiple interfaces and clean architecture"


═══════════════════════════════════════════════════════
TIER 6 — ADVANCED (Weeks 29+)
═══════════════════════════════════════════════════════

Senior/staff engineering territory. Each feature is
independently valuable. Build in whatever order interests
you most.


#36 [ ] Embeddings Infrastructure

     Generate and store embeddings for all prompts.

     Prerequisites: #09, external embedding API or
                    local model
     Teaches: Embeddings, vector storage, batch
              processing, incremental updates
     Week: 29-30


#37 [ ] Semantic Search

     Find prompts by meaning, not just keywords.

     Prerequisites: #36
     Teaches: Vector similarity search, ranking, hybrid
              search (keyword + semantic)
     Week: 30-31


#27 [ ] Semantic Similarity Detection (Revisited)

     Now buildable since #36 provides embeddings
     infrastructure.

     Prerequisites: #36
     Week: 31-32
     See Tier 4 entry for full description.


#38 [ ] Offline-First with Conflict Resolution

     App works offline. Syncs when connected. Handles
     edit conflicts gracefully.

     Prerequisites: #09, #10
     Teaches: Conflict resolution strategies (last-write-wins,
              merge, manual resolution), optimistic updates,
              sync protocols, distributed systems concepts
     Week: 32-33


#39 [ ] Team Sync (Optional Mode)

     Shared prompt library with access controls. Explicit
     opt-in. Separate from local mode.

     Prerequisites: #38, deployed backend
     Teaches: Multi-tenant architecture, access control,
              permission systems, deployment
     Week: 34-36


#40 [ ] Prompt Chains

     Sequences of prompts where output feeds into next
     prompt's input.

     Prerequisites: #14, #19
     Teaches: Pipeline orchestration, error handling in
              chains, partial failure recovery, DAG execution
     Week: 37-38


#41 [ ] Usage Analytics

     Which prompts get used most. Which models produce
     best results. Team usage patterns (if team sync
     enabled).

     Prerequisites: #16, #17, #39
     Teaches: Analytics aggregation, data visualization,
              privacy-respecting metrics
     Week: 39-40


TIER 6 CHECKPOINT

After Tier 6, you can demonstrate:
- Embeddings and vector search (RAG-adjacent skills)
- Distributed systems concepts (offline-first, conflict
  resolution)
- Multi-tenant architecture with access controls
- Pipeline orchestration (prompt chains)
- Analytics and data visualization

Interview level: Staff — "I understand distributed
systems, data infrastructure, and advanced AI patterns"

---

## Tier 7 — Local Model Integration (Decision Deferred to Week 13+)

> **Status:** Exploratory. May extend PromptLab or become a separate project.  
> **Prerequisites:** Weeks 8-10 local model intro complete, core PromptLab stable.  
> **Hardware:** M1 16GB (7B models now), M4/M5 24GB (13B models later).

### Candidate Features (not committed)

| # | Feature | Concept | Notes |
|---|---------|---------|-------|
| 42 | Ollama integration | Local model serving | Run prompts against local models from the app |
| 43 | Prompt testing workbench | Inference comparison | Same prompt → different models/temperatures → side-by-side results |
| 44 | Response history | Prompt-response pairs | Save outputs for iteration and comparison |
| 45 | Model comparison dashboard | Evaluation | Quality, speed, token usage across models |
| 46 | RAG pipeline prototype | Retrieval-augmented generation | Embeddings → vector store → retrieval → generation |
| 47 | Agent playground | Tool use, chains | Experimental — depends on scope decision |

### Scope Decision (Week 13+)
- **If PromptLab extension:** Features 42-45 integrate into existing app. Story: "Full-stack prompt engineering workbench with local LLM backend."
- **If new project:** All features above become the foundation. Story: "AI engineering toolkit for model evaluation, RAG, and agent prototyping."
- **Decision criteria:** Which framing is stronger for interviews? Which architecture is cleaner? Does PromptLab's codebase support it without forcing it?

### Engineering Concepts Unlocked
- Model serving (Ollama API, streaming responses)
- Tokenization and context window management
- Embedding generation and vector similarity
- Quantization awareness (GGUF, 4-bit vs 8-bit tradeoffs)
- Agent orchestration patterns


═══════════════════════════════════════════════════════
RULES
═══════════════════════════════════════════════════════

1. Never skip a prerequisite to build a "cooler" feature.

2. Every feature ships with types, error handling, and
   at minimum a few tests before moving on.

3. If a feature takes longer than estimated, that's fine.
   Depth over speed.

4. Features may be reordered within a tier based on what
   you're learning at work or what interests you.

5. Features should NOT be reordered across tiers without
   clear justification.

6. If work demands shift priorities, the backlog adapts.
   Features can be deprioritized but not deleted.

7. Each completed feature gets a commit, a note about
   what was learned, and an update to DASHBOARD.md.


═══════════════════════════════════════════════════════
DEPENDENCY GRAPH
═══════════════════════════════════════════════════════

#01 CRUD
|-- #02 Favoriting
|    |-- #03 Filtering --> #06 Routing --> #07 UI
|-- #04 Search (part of #03)
|-- #05 Tags (part of #03)
|-- #25 Linter (no backend needed)
|-- #30 Export

#08 NestJS Backend
|-- #09 PostgreSQL
|    |-- #10 Local-First
|    |-- #11 Encryption
|    |    |-- #12 Basic Execution
|    |         |-- #13 Streaming
|    |         |    |-- #14 Multi-Provider
|    |         |         |-- #15 Comparison
|    |         |         |-- #16 Logging
|    |         |         |    |-- #17 Ratings
|    |         |         |    |-- #18 Cost Dashboard
|    |         |         |    |-- #20 Replay
|    |         |         |    |-- #21 Pre-Execution Cost
|    |         |         |    |    |-- #26 Recommendations
|    |         |         |    |-- #41 Analytics
|    |         |         |-- #19 Template Variables
|    |         |              |-- #28 MCP Server
|    |         |-- #32 GitHub Webhooks
|    |              |-- #33 GitLab Webhooks
|    |                   |-- #34 Adapter
|    |-- #22 Version History
|    |    |-- #23 Diffs
|    |    |-- #24 Rollback
|    |-- #36 Embeddings
|    |    |-- #37 Semantic Search
|    |    |-- #27 Similarity Detection
|    |-- #38 Offline-First
|         |-- #39 Team Sync
|-- #29 CLI

#14 + #19 --> #40 Prompt Chains
#31 Import <-- #30 Export
#35 CI/CD (needs tests)