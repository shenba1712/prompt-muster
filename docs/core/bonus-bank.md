# Bonus Bank

**One place to look.** Everything ever offered as a bonus lives here, whether or not it was
attempted. Pick what you feel like, tick it off, or drop it.

> **This is a menu, not a backlog.** Nothing here is owed. An entry sitting untouched for
> three months is not debt — it is evidence you had better things to do. Drop it and move
> on.

Replaces the old per-day BONUS section, which had one real flaw: a bonus you skipped became
invisible unless you reopened seven day-files to find it.

---

## How it works

- **Weekly generation appends here** instead of embedding a BONUS block in each day plan.
  Day plans carry a one-line pointer: *"Bonus: pick one from `core/bonus-bank.md`."*
- **Sorted by kind, not by week**, so you can pick by mood and by the time you actually
  have. "I have 20 minutes and I want TypeScript" is answerable in one glance.
- **Sunday review:** append the week's new entries, tick anything done. Once a quarter,
  batch-drop what has aged out. That is the whole maintenance cost.

**Status:** `[ ]` open · `[x]` done · `[-]` dropped (with a reason, because *why* you
dropped it is the useful part)

**Timing:** `anytime` for almost everything · `same-day` for the few that only make sense
against the day they came from.

### The one trade-off, named

The old per-day bonus was *contextual* — it reinforced the thing you built that day. A bank
loses that timing. The fix is the **From** and **Reinforces** columns: if you pick something
up two months later, you can see what it was originally attached to. Anything genuinely
same-day-only is marked, and there are very few.

---

## Build Your Own — utilities and hooks

The core of the bank. Each one is a small, self-contained thing with a real lesson.

| ✓ | Min | Item | Reinforces | From | Timing |
| --- | --- | --- | --- | --- | --- |
| [x] | 20 | Type-safe `pick` / `omit` (`coding-challenges/pick-omit.ts`) | Utility types, `keyof`, generic constraints | W2 Mon | anytime |
| [x] | 20 | The `cn()` helper (`coding-challenges/cn.ts`) | What a dependency actually does | W2 Fri | anytime |
| [x] | 20 | A minimal `expect()` (`coding-challenges/expect.ts`) | How a test framework works underneath | W2 Wed | anytime |
| [ ] | 25 | React Hook Form + Zod, hands-on spike | Hand-rolled validation vs. a library | W2 Thu | anytime |
| [ ] | 20 | Generic context-hook factory | Context ergonomics, generics in hooks | W3 Wed | anytime |
| [ ] | 20 | A tiny dynamic-route matcher | How file-based routing resolves `[id]` | W3 Thu | anytime |
| [ ] | 20 | Standalone `useDarkMode` hook | Effects, storage, media queries | W3 Sat | anytime |
| [ ] | 20 | Promise-based `useConfirm` hook | Bridging imperative flow and React state | W4 Wed | anytime |
| [ ] | 20 | A naive frontmatter splitter | Parsing a `---` delimited header before reaching for a library | W4 Fri | **same-day** |
| [ ] | 20 | `throttle` | The pair to `debounce` — rate vs. silence | idea-bank | anytime |
| [ ] | 30 | `EventEmitter` (`on`/`off`/`emit`/`once`) | Pub/sub, reference equality in `off` | idea-bank | anytime |
| [ ] | 20 | `pipe` / `compose` | `reduce` vs `reduceRight`; your filter predicates are a pipeline | idea-bank | anytime |
| [ ] | 15 | `partition` | One-pass `reduce` with an accumulator | idea-bank | anytime |
| [ ] | 25 | `retry` with exponential backoff + jitter | Which errors are retryable; thundering herd | idea-bank | anytime |
| [ ] | 25 | `memoize` (single then multi-arg) | What `useMemo` does underneath; lossy keys | idea-bank | anytime |
| [ ] | 30 | `deepEqual` | `NaN`, `Date`, circular refs, `{a: undefined}` vs `{}` | idea-bank | anytime |

## TypeScript, type-level only

No runtime. Good commute-sized puzzles.

| ✓ | Min | Item | Reinforces | From |
| --- | --- | --- | --- | --- |
| [ ] | 20 | `MyPartial<T>`, `MyRequired<T>`, `MyReadonly<T>` | Mapped types from scratch | idea-bank |
| [ ] | 25 | `DeepPartial<T>` | Recursive mapped types — the recursion *is* the lesson | idea-bank |
| [ ] | 15 | `MyReturnType<T>` | `infer` | idea-bank |
| [ ] | 30 | `Result<T, E>` + `map` / `unwrap` / `unwrapOr` | Errors as data; directly relevant to trd §11 | idea-bank |
| [ ] | 30 | A 20-line zod-style validator with `.parse()` | How schema → static type inference works | idea-bank |

## DSA

**Moved to `core/dsa-bank.md`** — DSA needs pattern-coverage tracking and a revisit
cadence, which a flat checklist cannot give. Kept here as a pointer only.

## Dropped

Keep these. *Why* you dropped something is the most useful signal in the file.

| Item | Why | When |
| --- | --- | --- |
| _(nothing yet)_ | | |

---

## Quarterly sweep

Once a quarter, read the open list and ask one question per entry: **would I choose this
today?** If not, move it to Dropped with a one-line reason.

Expect to drop a lot. That is the file working — it is a menu that shows you what you keep
walking past, which tells you something about what you actually want to learn.

## Related

- `reference/idea-bank.md` — raw parking lot for things to **schedule into a future week**
  (system-design micro topics, format ideas, reading suggestions). Different job: that file
  feeds week generation, this one feeds a spare twenty minutes.
