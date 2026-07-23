# Engineering Spec — Essential Sections for Generation

Source: ROADMAP_PROJECT_SPEC_v1.0 (full version in reference/)
This extract contains the philosophy, rules, templates, and quality
standards that govern all generated roadmaps.

IMPORTANT OVERRIDES:

- The daily template in spec §12 was the initial draft. The preset's
  daily template (§4.3) supersedes it. See "Daily Template" section
  below for details.
- The full spec §18 incorrectly lists Frontend Masters, Educative,
  DesignGurus as owned courses and Effective Java as an owned book.
  These are NOT owned. The preset §8 is the correct resource list.

---

## Engineering Philosophy (Spec §4, §6)

These principles govern every decision:

- Learn engineering through technologies. Technologies are vehicles, not goals.
- Build over consume. Building > Reading > Watching > Passive consumption.
- Consistency over intensity. Daily progress beats occasional large bursts.
- Output over consumption. Every day produces evidence: code, notes, diagrams, ADRs.
- Engineering judgment over memorization. Teach why, when, why not — not just how.
- Build real software. Production-like projects, not toy examples.
- Practical before academic. Theory only when it improves practical decisions.
- Timeless before trendy. Principles over framework-specific details.
- AI is a collaborator. AI improves capability, never replaces thinking.

---

## Decision Log (Spec §7)

These are settled. Do not change without explicit justification:

- Planning exists at the weekly level only.
- One weekly markdown file contains Monday through Sunday.
- Every day follows the same template.
- Every day has exactly one primary learning theme.
- Every day contains only one implementation stream.
- Portfolio work is long-lived. Build before consume.
- AI Engineering is prioritized over ML Engineering.
- Architecture discussions emphasize trade-offs.
- Knowledge retention is built into the roadmap.
- Saturday is optional. Sunday focuses on review and planning.
- The roadmap should age well.

---

## Weekly Template (Spec §11)

Every weekly roadmap MUST follow this structure:

Week XX — [Theme]
Weekly Mission
Weekly Outcomes
Why This Week Matters
Active Implementation Stream
Weekly Deliverables
Success Criteria
Monday — [Day Theme]
...

Sunday — Review and Planning

Each week concludes with measurable outcomes, not vague objectives.

Good: "Complete shadcn/ui integration for all form components"
Bad: "Learn styling"

---

## Daily Template (Spec §12 — SUPERSEDED by Preset §4.3)

The spec's original §12 defined a 13-section daily template (Today's
Theme, Goal, MVD, Learning, Resources, Build, Architecture, AI Workflow,
Engineering Focus, Professional Growth, Notes, Evidence Produced, Blockers,
Daily Engineering Review).

This was simplified through iteration. **The preset's daily template
(§4.3) is the canonical version.** All Week 1 plans follow it. All
future plans should follow it.

The preset daily template:

| Section            | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| Theme & Goal       | ONE primary topic + single clear objective       |
| Minimum Viable Day | 15–25 minutes of essential work                  |
| Build              | Core implementation work, 40–50 min              |
| Investigate        | One architecture/engineering question, 10–15 min |
| Document & Commit  | Notes, evidence, git push                        |
| Daily Review       | 3–4 reflection questions testing judgment        |

Where the spec's additional sections went:

- Learning and Resources → embedded as inline notes in Build
- Architecture → Investigate section
- AI Workflow → integrated into Build (Claude Code is the development method)
- Engineering Focus → implicit in the day's theme
- Professional Growth → outside the 75-min session, not in daily template
- Blockers → covered in "If Things Go Wrong" section

Additional sections per preset (not in original spec):

- "If Things Go Wrong" with specific failure scenarios and fixes
- Time summary table with per-section breakdown
- Optional reading/watching (OUTSIDE 75-min session)
- System design micro-question (OUTSIDE 75-min session)

---

## Curriculum Ordering (Spec §15)

Topics MUST respect dependencies:

1. Programming fundamentals and language mastery
2. Frontend and backend foundations
3. Database fundamentals and API design
4. Software architecture
5. Distributed systems
6. Cloud and DevOps
7. AI-native engineering
8. Technical leadership
9. Engineering leadership

Advanced topics must not appear before foundations are solid.
High-level discussions MAY appear early for context; deep
implementation follows the dependency order.

---

## Curriculum Areas (Spec §14)

The roadmap rotates across these disciplines:

Programming, Frontend, Backend, Databases, Search & Caching,
Distributed Systems, System Design, Software Architecture,
Cloud & DevOps, Observability, Security, Performance, Testing,
Engineering Practices, Computer Science, AI Engineering,
Product Thinking, Technical Leadership, Professional Growth

AI Engineering focus: Prompt Engineering, Context Engineering,
LLM Fundamentals, Structured Outputs, Tool Calling, MCP, RAG,
Embeddings, Vector Databases, AI Agents, AI UX, AI Evaluation,
Cursor, Claude Code, ChatGPT, GitHub Copilot, Local Models.
Do NOT spend significant time on ML mathematics.

---

## Topic Rotation (Spec §16)

Avoid long periods on a single discipline. Naturally rotate
between complementary topics. Rotation should reinforce previous
knowledge, not introduce unrelated material. Avoid too many new
concepts within the same week.

---

## Decision Framework (Spec §33)

When multiple valid options exist, optimize in this priority order:

1. Long-term engineering capability
2. Immediate relevance to current work
3. Practical applicability
4. Learning effectiveness
5. Engineering quality
6. Maintainability
7. Cost effectiveness
8. Time efficiency

If two recommendations are otherwise equivalent:

- Prefer building over consuming
- Prefer practical work over additional theory
- Prefer official documentation over secondary resources
- Prefer fewer high-quality resources over many average ones
- Prefer timeless principles over rapidly changing details

---

## Portfolio Philosophy (Spec §23)

Portfolio projects are long-term engineering projects, not tutorials.
Prefer extending existing projects over starting new ones. Projects
should evolve as new skills are learned and progressively demonstrate
better architecture, testing, observability, and documentation.

---

## Build X Philosophy (Spec §24)

Build X is for focused experimentation. Technologies or ideas that
don't belong in the portfolio project. Intentionally short-lived.
Rotate periodically rather than allowing permanent projects.

---

## Repository Structure (Spec §8)

The roadmap planning repository uses:
README.md, DASHBOARD.md, ENGINEERING_PRINCIPLES.md,
roadmap/, resources/, templates/, notes/, adr/, lab/,
backlog/, archive/

NOTE: This describes the roadmap planning repository, not
PromptMuster itself. PromptMuster's project structure is defined
in CLAUDE.md. Not all roadmap directories need to exist
from Day 1 — create them as needed.

---

## Knowledge Retention (Spec §31)

Three levels, all built into the roadmap:

- **Daily Review:** Key concepts, trade-offs, decisions, questions
- **Weekly Review (Sunday):** Completed work, lessons, mistakes,
  topics needing practice, next week priorities
- **Long-Term Review:** Older topics revisited regularly. Never
  assume permanent mastery after one week.

Knowledge checks emphasize application, not memorization.

---

## Difficulty Progression (Spec §32)

- Increase gradually. Each phase builds on previous phases.
- Never introduce multiple advanced concepts simultaneously.
- Expand complexity one dimension at a time: scope, architecture,
  operational concerns, scale, AI sophistication, leadership.
- The learner should feel consistently challenged without overwhelm.

---

## Generation Rules (Spec §38)

### Cohesion

Treat the roadmap as a complete curriculum. Every week builds on
previous weeks. Avoid topics that assume uncovered knowledge.

### Prerequisites

Always introduce topics according to dependencies. Prefer topics
that unlock future learning.

### Reinforce, Don't Repeat

Revisiting is encouraged. Repeating is not. When a topic reappears:
increase difficulty, apply in different context, connect with new
concepts, deepen understanding.

### Balance Breadth and Depth

No months on single technology. No too many unrelated technologies
in a short period. Deepen one area while reinforcing previous areas.

### Connect Topics

Relate new concepts to previously learned material. Engineering
knowledge should become increasingly interconnected.

### Build Before Expanding

Before introducing advanced concepts, ensure the learner has built
something with current concepts. Learn → Build → Reflect → Improve.

### Introduce Complexity Gradually

One dimension at a time. Avoid increasing complexity across multiple
dimensions simultaneously.

### Realistic Engineering

Production-inspired examples. Include maintainability, deployment,
monitoring, debugging, operational concerns, technical debt.

### Optimize for Long-Term Capability

When multiple good decisions exist: which option makes a stronger
engineer five years from now?

### Be Opinionated, Not Dogmatic

Make recommendations. Acknowledge trade-offs. Encourage judgment
over rule-following.

### Preserve Internal Consistency

Future generation must remain consistent with previous weeks.
Evolve intentionally, not unpredictably.

---

## Anti-Goals (Spec §39)

The roadmap must NOT:

- Optimize for completing courses instead of building capability
- Prioritize technologies over engineering fundamentals
- Generate weeks dominated by passive learning
- Introduce multiple unrelated technologies without rationale
- Sacrifice depth for breadth
- Recommend paid resources without justification
- Encourage blind acceptance of AI output
- Present opinions as universally correct
- Produce filler tasks
- Create activities lacking clear connection to long-term goals

---

## Quality Standards (Spec §34)

Every generated roadmap must meet production quality:

- No placeholders, TODOs, filler text, motivational paragraphs
- No generic tutorials or unnecessary repetition
- Every recommendation is specific and actionable
- Assumes an engineering audience, not a beginner audience
- Generated markdown is suitable for direct use without editing

---

## Rule Precedence (Spec §40)

When rules conflict, resolve using this order:

1. Engineering Philosophy
2. Decision Log
3. Decision Framework
4. Generation Rules
5. Output Requirements
6. Current Task

When precedence doesn't resolve it:

- Choose what best develops long-term engineering capability
- Prefer practical implementation over passive consumption
- Favor engineering judgment over framework-specific knowledge

---

## No Dogma (Spec §30)

Topics like TDD, DDD, Clean Architecture, Microservices, FP, OOP
must always be discussed in terms of: benefits, drawbacks, trade-offs,
appropriate contexts, common failure modes. The objective is engineering
judgment, not ideological preferences.
