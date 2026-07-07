# PromptLab

AI prompt engineering workbench for managing, organizing, and iterating
on AI prompts. Built with Next.js, React, and TypeScript.


## Current State

Week 1 — frontend only, no backend, no database.
All data is in-memory using React useState.
No tests yet.
No styling library yet (shadcn/ui planned for Week 2+).
No routing yet — single page application.


## How to Work

### Plan Before Coding

Before making any changes:

1. Read the relevant files first
2. State what you understand about the current code
3. Propose a plan with specific files and changes
4. Wait for approval before writing code
5. If the task is ambiguous, ask clarifying questions instead of guessing

Do not start writing code until you have a clear plan.
Do not make changes beyond what was asked.

### Verify After Coding

After every change:

1. Run npx tsc --noEmit to verify types compile
2. Run npm run lint to check for lint errors
3. If tests exist, run npm test
4. Confirm the change does what was asked — nothing more, nothing less

If verification fails, fix the issue before reporting completion.
Do not say "done" when there are type errors or lint warnings.

### Track Progress

For multi-step tasks, maintain a checklist:

- [x] Step 1 — completed
- [x] Step 2 — completed
- [ ] Step 3 — in progress
- [ ] Step 4 — not started

Update the checklist as you work. If I ask "where are we?", show
the current checklist state.

### Justify Changes

For every file you modify, briefly explain:

- What you changed
- Why you changed it
- What would break if you didn't

Do not make drive-by changes. If you notice an improvement
opportunity in a file you're editing for another reason, mention
it but don't apply it unless asked.

### Learn and Capture Mistakes

If something you generated doesn't compile, doesn't work, or gets
rejected:

1. Explain what went wrong
2. Explain why it went wrong
3. State what you'll do differently next time
4. Suggest whether a new rule should be added to this file to
   prevent the same mistake

I may add the lesson to this file so you don't repeat it.

### Use Subagents

For independent tasks that don't depend on each other, use
subagents to work in parallel. Examples:

- Creating multiple component files that don't import each other
- Running type check while writing documentation
- Auditing multiple files for the same issue

Do not use subagents for tasks that have dependencies between them.

### Simplify

Always prefer the simpler solution.

Before proposing a change, ask yourself:

- Can this be done with less code?
- Am I adding abstraction that isn't needed yet?
- Would a junior developer understand this?

If you catch yourself writing something complex, stop and propose
the simpler alternative.

### Self-Improvement

At the end of a session, if you notice patterns that should be
captured in this file, suggest them:

"I noticed I keep generating X. Should I add a rule to CLAUDE.md
to handle this consistently?"

I'll decide whether to add it. Don't modify this file yourself.


## Sessions

### Quick Task (single file, small change)

1. Read the file
2. Make the change
3. Verify (tsc, lint)
4. Report what you changed and why

### Feature (multiple files, new functionality)

1. Read relevant files
2. Propose a plan (which files, what changes, what order)
3. Wait for approval
4. Implement step by step, tracking progress
5. Verify after each step (tsc, lint)
6. Report completion with summary of all changes

### Refactor (restructuring existing code)

1. Read all affected files
2. State what the current code does
3. Propose the refactored structure
4. Explain what improves and what the risks are
5. Wait for approval
6. Implement, verifying behavior is preserved at each step
7. Run full verification (tsc, lint, tests if they exist)

### Code Review

1. Read the files specified
2. Check against the conventions in this file
3. Report findings with severity (critical, suggestion, nitpick)
4. For each finding, explain the bug or problem it would cause
5. Do not make changes — only report findings

### Type Audit

1. Scan all files in the specified directory
2. Check for: any, untyped callbacks, missing null checks, unsafe
   assertions, implicit types on exported functions
3. Report each finding with file, line, problem, and fix
4. Wait for approval before applying fixes


## Commands

- npm run dev — Start development server (localhost:3000)
- npm run build — Production build
- npm run lint — Run ESLint
- npx tsc --noEmit — Type-check without emitting files


## Tech Stack

- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+ (strict mode)
- Node.js 18+


## Project Structure

- src/app/ — Next.js App Router pages and layouts
- src/components/ — React components (one per file)
- src/hooks/ — Custom React hooks
- src/types/ — TypeScript type definitions
- src/utils/ — Pure utility functions


## Domain

A Prompt represents a reusable AI prompt template:

- id: string (crypto.randomUUID())
- title: string
- content: string
- model: Model (gpt-4o | gpt-4o-mini | claude-sonnet | claude-haiku | gemini-pro | gemini-flash)
- category: Category (code-generation | debugging | code-review | documentation | refactoring | testing | architecture | data-modeling | devops | learning | communication)
- tags: string[]
- isFavorited: boolean
- createdAt: Date


## TypeScript Conventions

- strict mode is enabled — do not weaken it
- No use of any — use unknown and narrow if type is uncertain
- String literal union types, not enums
- Use interface for component props and object shapes
- Use type for unions, intersections, and utility type derivations
- Derive types with utility types rather than duplicating: type CreatePromptInput = Omit<Prompt, 'id' | 'createdAt' | 'isFavorited'>
- Exported functions must have explicit return types
- Use readonly on props and parameters that should not be mutated


## React Conventions

- Functional components only
- One component per file
- Every component has an explicit Props interface
- Add 'use client' only on components that use hooks or browser APIs
- Use functional updater for setState when depending on previous state: setPrompts(prev => [...prev, newPrompt])
- State updates must be immutable — never mutate directly
- Compute derived values during render — do not store in separate useState
- Use crypto.randomUUID() for generating IDs
- Handle empty states in every list component
- Use entity ID as key prop — never array index for dynamic lists


## 'use client' Rules

Add 'use client' when a component uses ANY of:

- useState, useEffect, useReducer, useRef, or any hook
- onClick, onChange, onSubmit, or any event handler
- Browser APIs (navigator, window, document, localStorage)

Do NOT add 'use client' when a component ONLY:

- Receives props and renders JSX
- Maps over arrays to render children
- Conditionally renders based on props
- Passes callbacks through to children without using them


## Component File Structure

Every component file follows this order:

1. 'use client' directive (only if needed)
2. Imports (React/Next first, then internal modules)
3. Props interface
4. Component function (export default)

 Example:

```typescript

'use client';
import { Prompt } from '@/types/prompt';

interface PromptCardProps {     
    prompt: Prompt;
    onDelete: (id: string) => void;
}
export default function PromptCard({prompt, onDelete,}: PromptCardProps) {
    return (
        <div>
                <h3>{prompt.title}</h3> 
                <button onClick={() => onDelete(prompt.id)}>Delete</button>
        </div>
);
      }
```
   


## Hook File Structure

Every hook file follows this order:

1. Imports
2. Interface for hook parameters (if any)
3. Interface for return type
4. Hook function (named export)

Hooks must:

- Declare all useState at the top
- Define mutation functions in the middle
- Compute derived values after mutations
- Return a typed object as the last statement


## Naming

- Components: PascalCase — PromptCard.tsx
- Hooks: camelCase with use prefix — usePromptManager.ts
- Types: camelCase — prompt.ts
- Utilities: camelCase — prompt.ts
- CSS Modules: PascalCase.module — PromptCard.module.css
- Tests: PascalCase.test — PromptCard.test.tsx
- Props interfaces: ComponentNameProps — PromptCardProps
- Hook returns: UseHookNameReturn — UsePromptManagerReturn
- Callback props: onAction — onDelete, onCopy, onFilterChange
- Boolean props: is/has/should prefix — isFavorited, hasError

## CSS Conventions

- Use CSS Modules for component-specific styles
- File name matches component: PromptCard.module.css
- Import as: import styles from './PromptCard.module.css'
- Apply as: className={styles.card}
- Global styles go in app/globals.css only
- Do not use inline styles except for truly dynamic values
- Do not use styled-components, Tailwind, or CSS-in-JS
- Keep class names descriptive: .card, .header, .badge not .c1, .h, .b


## Imports

- Use @/ path alias for all src/ imports
- Named exports for types, interfaces, utilities, hooks
- Default exports only for components
- Group: React/Next first, then external libraries, then internal modules


## Common React Event Types

- Form submit: React.FormEvent<HTMLFormElement>
- Text input change: React.ChangeEvent<HTMLInputElement>
- Textarea change: React.ChangeEvent<HTMLTextAreaElement>
- Select change: React.ChangeEvent<HTMLSelectElement>
- Button click: React.MouseEvent<HTMLButtonElement>


## State Update Patterns

Array — add item:
setPrompts(prev => [...prev, newPrompt])

Array — remove item:
setPrompts(prev => prev.filter(p => p.id !== id))

Array — update one item:
setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorited: !p.isFavorited } : p))

Object — partial update (for filter state):
setFilterState(prev => ({ ...prev, ...updates }))


## Error Handling

- Wrap async operations in try/catch
- Show user-visible feedback for errors
- Type error objects as unknown, not any, then narrow


## Do NOT

- Do not use any
- Do not use enums
- Do not use class components
- Do not use React.FC — use plain function declarations with typed props
- Do not use default exports for types or interfaces
- Do not mutate state directly
- Do not store derived state in useState
- Do not use array index as key for dynamic lists
- Do not add 'use client' to every file
- Do not suggest deprecated React patterns
- Do not create barrel files (index.ts re-exports) unless asked
- Do not add unnecessary useEffect
- Do not wrap callbacks in useCallback unless measured performance need
- Do not suggest installing libraries not in the current package.json
- Do not make changes beyond what was asked
- Do not skip verification (tsc, lint) after changes


## When Uncertain

1. Ask me rather than guessing
2. Prefer simplicity over cleverness
3. Prefer explicit types over inferred types
4. Prefer composition over inheritance
5. Prefer small focused functions over large ones


## Lessons Learned

(Add entries here as mistakes are discovered during development)