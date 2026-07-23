# Week 1 Review

## What got built

- Prompt create/delete, favoriting, multi-dimensional filtering (model, category, favorites, search), category/tag organization.
- A `usePromptManager` hook owning CRUD, filter state, derived `filteredPrompts`, and clipboard-copy error state.
- A full visual identity: teal brand color, gradient header, per-model and per-category badge colors, consistent card/panel styling with subtle shadows.
- Type-safety work: `Model`/`Category` derived from `as const` tuples instead of hand-duplicated unions, `CreatePromptInput` via `Omit`, `isModel`/`isCategory` type guards replacing unsafe `as` casts.

**Known gap:** "CRUD" is currently create/read/delete — there's no way to edit an existing prompt yet.

## Key decisions and why

- **Brand color is teal, not indigo/plum** — doesn't overlap any hue already used in the model/category badges, so it stays legible as "the" brand color instead of blending in.
- **Header is capped at the same width as the content below it, not full-bleed** — took four structural attempts (full-bleed-with-narrow-content, capped-but-nested, full-width-everywhere, capped-as-siblings) before landing on the version that didn't look either misaligned or "elongated" on desktop.
- **Form stays open after submit and refocuses the title field, instead of auto-closing** — resolves "annoying to reopen every time" vs. "annoying to close every time" by making open/close a once-per-batch decision instead of once-per-prompt.
- **EmptyState stays generic; `PromptList` decides which message to show** — rejected pushing the total-vs-filtered logic into `EmptyState` itself, since that would make a domain-agnostic presentational component know about filtering, a concept it has no other reason to understand.
- **No bespoke button-variant system, no delete-confirmation modal** — both would either be thrown away by the shadcn/ui migration (Week 2+) or aren't worth the design commitment yet. Cheaper wins (a two-step confirm button reusing the existing Copy-button pattern) were identified but intentionally not built pending a real decision on error-handling/confirmation UX as a whole.

## Bugs found (via a full TypeScript + code + UI audit)

TypeScript itself came back clean — no `any`, no unsafe assertions, everything typed. Real bugs found and fixed:

1. A long unbroken word in a title overflowed its card (missing `min-width: 0` / `overflow-wrap` on a flex child).
2. Whitespace-only search silently returned zero results instead of matching everything.
3. No accessible name (`aria-label`) on any form control.
4. No way to clear all filters at once.
5. Tag deduplication was case-sensitive ("API" and "api" both survived).
6. Redundant `.toLowerCase()` calls recomputed per-prompt inside the filter chain.

## Open questions / deliberately deferred

- Error handling and form-validation feedback — submitting an empty form fails silently; needs a real design pass, not a patch.
- Delete confirmation — no confirmation before an irreversible delete.
- Splitting `usePromptManager` into smaller hooks (CRUD / filtering / clipboard are separable) — reasonable in principle, premature with a single consumer.
- `seedPrompts` test-data generator lives inside the production hook — self-flagged as temporary, not yet relocated.
- Dark mode — only the page background responds to `prefers-color-scheme`; every component is hardcoded light-mode.

## Process notes worth remembering

- A screenshot once rendered at a misleading scale, making a correctly-centered layout look broken. Verifying with actual computed geometry (bounding boxes), not just screenshots, caught the false signal.
- Testing a toggle by firing two clicks in one synchronous script produced a false "doesn't work" result — React batches same-tick updates, which isn't how real, separately-dispatched clicks behave. One action per check, going forward.
- Mid-session discovery: work was happening in an untracked duplicate project directory instead of the real git-tracked repo for a stretch — caught, confirmed, and cleaned up.
- Direct feedback given and taken: disclosing an unrequested change after making it isn't the same as asking before making it. Now captured in `CLAUDE.md`'s Lessons Learned.

## I will answer a few questions based on my understanding, and this is again help prepare the schedule for the next week

### Explain React's rendering cycle without looking at any documentation or notes:

State changes → ? → ? → ? → DOM updates

1. Rendering - Uses the state changes to build the react element tree. This shows which components may need to be rerendered.
2. Comparison - Does a comparison by reference to check if the value has changed and if that component needs to be re-rendered. Note that it's by reference. So, immutable objects. You have to use hooks to change the value for React to capture and render the object.
3. Building the DOM tree - Once comparison is done and the components are identified, the DOM tree is built for re-rendering.

### How server components work in Next.js

- Client components are like build your own taco. You get the pieces and you have to connect and build them to make your page work. This is useful when you have JS components with clicks, toggles, etc. Enables human interaction. 'use client' is needed in such cases.
- Server components are the prepared dish from the kitchen. You can consume it, but you can't modify it and build it the way you want. You only get what the kitchen presents. No interactable JS components.
- If a parent is marked as a client component, all the child components are automatically client components.
- Tradeoff is speed vs interactability. Server components are faster because there's no JS to load. Client components have JS and hence, slower.

### How to debug when the UI doesn't update?

1. Devtools - use breakpoints and logs to figure the problem.
2. React Profiler extension

### Why the @/ import alias sometimes doesn't resolve?

- Because tsconfig may not be configured properly.
- Case sensitivity is a thing. Mac is by default case insensitive, but other OS like Linux is case sensitive. So, @/components/Header vs @/components/header is considered different.
- Cache staleness. Refresh can help

### When is the functional updater (setState(prev => ...)) necessary vs when is setState(newValue) safe? Describe one scenario for each?

- setState(newValue) ---> changes the value with no need for previous values
- (setState(prev => ...)) ----> if you need previous values too, then helps. Like updating an object attribute or array value.

### A colleague stores both prompts and filteredPrompts in separate useState calls, updating filteredPrompts in a useEffect. You tell them it's a bug waiting to happen. Explain why and what they should do instead.

- Because if you change prompts and forget to update filteredPrompts, then you lose important data and enable incorrect behaviour.
- Whereas deriving the filtered prompts from actual prompts help avoid this.
- Derived states work when there is no human element to it. Here filter state has the human interaction. Filtered prompts is created from that filter state and prompts.
- Also might enable extra renders with two different hooks.

### What does Omit<Prompt, 'id' | 'createdAt'> produce? When would you use it instead of defining a separate interface?

- When you want to omit certain fields from the interface.
- Helps when you want to create something that only needs a part of the main interface. But you don't create a second one because then, you'll have to maintain both.

### usePromptManager returns { prompts, addPrompt, deletePrompt }. A colleague asks why not return [prompts, addPrompt, deletePrompt] like useState. What's your answer?

- Arrays would mean you can't use named variables. And if you miss a field or mix fields, then the index changes and can get incorrect data.
- On the other hand, tuples can use named variables. So, missing or mixing fields is not a problem.

### Your filtering chains four .filter() calls. A colleague says "that iterates the array four times, use a single filter with a combined predicate." Are they right about the performance concern? When would you switch approaches?

- They are right, but when there's a lot of data. Both approach has O(n) time complexity, but one uses 4 iterations, while one uses only 1.
- But when there is so much data, we also have to change the approach to include pagination.

### You extracted FavoriteButton from PromptCard. A colleague says it's over-engineering — it's just a button with a star. Defend or agree with the extraction. What would change your mind?

- Can be used in multiple places. May not make sense now, but later.
- Also, favorite button has its own style, logic and design that's different from the other buttons in the prompt card. So, by keeping it in prompt card, you have to maintain two different mechanisms.
- What can change my mind -> when prompt value is needed or there is no custom styling.

### Your usePromptManager hook is analogous to the Repository Pattern. If you replaced useState with useReducer inside the hook, what would change for the components that use it?

No, the interface and return type matters, not the implementation.

## Week Review

1. 60-90 mins was sustainable. Some days I got tasks done fast, some took long, but that's also because life happens. But I managed to finish all the tasks and some more (UI/UX focused).
2. None of the days felt really hard. Claude does help. Maybe Saturday with the challenge. And that's only because I'm rusty and getting back to coding. And this is exactly the kind of push I need. It's okay if it's a little hard, but that helps. It's not that this group by, count by and sort by task was difficult, it just took some time for my brain to think that way and figure things out.
3. Probably Friday felt the lightest, and that's because it was designed so. Maybe we could have a bonus task or something not related to the project itself. Like another challenge or build your own X or something. Bonus only.
4. I never stopped at MVD itself but that is a good thing to have. Especially, on days when there's a lot happening.
5. Never missed two consecutive days. Actually never missed any day.
6. Heard a bit about useEffect and useReducer and stuff, but never got to use it yet. But I'm sure that will come when it makes sense.
7. Likely priorities:
   - Professional styling with shadcn/ui (#07)
   - Next.js routing (#06)
   - First tests (usePromptManager, createPrompt)
   - Transition to goal-based Claude Code prompts
