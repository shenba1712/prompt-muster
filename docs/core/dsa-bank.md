# DSA Bank

**One place for every coding challenge — solved, queued, or offered and skipped.**

Organised by **pattern**, not by problem, because that is what interviews actually test. A
list of 40 solved problems tells you nothing; "I have never touched heaps" tells you where
Tuesday should go next.

Solutions live in `~/Documents/projects/dsa-challenges/src/`.

Status: `[ ]` open · `[x]` solved · `[-]` dropped · `[~]` attempted, not finished

---

## 1. Pattern coverage — read this first

The interview-readiness view. Three problems in one pattern beats one problem in three.

| Pattern | Coverage | Solved | Next up |
| --- | --- | --- | --- |
| Hashmap / frequency | **touched** | Two Sum | Group Anagrams, Contains Duplicate |
| Sliding window | **touched** | Longest Substring w/o Repeating | Minimum Window Substring (harder) |
| Stack | **touched** | Valid Parentheses | Min Stack, Decode String |
| Two pointers | **none** | — | Valid Palindrome, 3Sum, Container With Most Water |
| Binary search | **none** | — | Binary Search, then first/last occurrence |
| Sort + sweep | **none** | — | Merge Intervals |
| Linked list | **none** | — | Reverse a list, detect a cycle |
| Trees / DFS-BFS | **none** | — | Max depth, level-order traversal |
| Heap / top-K | **none** | — | Kth largest, top-K frequent |
| Graphs | **none** | — | Number of Islands |
| Dynamic programming | **none** | — | Climbing Stairs, House Robber |
| Design | **none** | — | LRU Cache |

**Three of twelve patterns touched, one problem each.** That is the honest state at Week 4,
and it is fine — Tuesday has run three times. But it is the number to watch, and the reason
this bank is organised this way: breadth across patterns beats depth in one, for interviews.

**Rule of thumb:** two problems per pattern before moving on. One is exposure; two is
recognition.

---

## 2. Solved

| ✓ | Problem | Pattern | Difficulty | File | Revisit |
| --- | --- | --- | --- | --- | --- |
| [x] | Two Sum | Hashmap | Easy | `two-sums.ts` | — |
| [x] | Valid Parentheses | Stack | Easy | `valid-parentheses.ts` | — |
| [x] | Longest Substring Without Repeating Characters | Sliding window | Medium | `longest-non-repeating-substring.ts` | **due** |

**Revisit** is the column that makes this different from a to-do list. DSA decays faster
than anything else in the roadmap — a pattern you solved once and never returned to is a
pattern you do not have. Mark a revisit due ~4 weeks after solving; redoing a medium from
memory takes 10 minutes and is worth more than a new easy.

---

## 3. Queued

Pick by the gap in §1, not by what looks interesting. Anything from `reference/idea-bank.md`
gets promoted here when it becomes a real candidate.

| ✓ | Min | Problem | Pattern | Why this one |
| --- | --- | --- | --- | --- |
| [ ] | 20 | Contains Duplicate, three ways | Hashmap | Complexity comparison: O(n²) vs O(n log n) vs O(n). Second hashmap rep |
| [ ] | 25 | Group Anagrams | Hashmap keying | "Compute a key, bucket by it" — echoes the `groupBy` already written |
| [ ] | 20 | Valid Palindrome | Two pointers | Cheapest entry into an untouched pattern |
| [ ] | 25 | Binary Search, then first/last occurrence | Binary search | The off-by-one discipline is the real lesson |
| [ ] | 30 | Merge Intervals | Sort + sweep | Shows up constantly — calendars, ranges, coalescing |
| [ ] | 30 | Reverse a Linked List | Linked list | Pointer manipulation, and it is asked everywhere |
| [ ] | 25 | Maximum Depth of Binary Tree | Trees / DFS | The gateway to the whole tree family |
| [ ] | 45 | LRU Cache | Design | Hashmap + doubly-linked list. **Bridges into system design** — the eval-cache reuse in `database-schema.md` §2.3 is this exact mechanism |
| [ ] | 45 | Minimum Window Substring | Sliding window | Harder variant. **Not a first exposure** — only after the window pattern is comfortable |

## 4. Dropped

*Why* something was dropped is the useful part.

| Problem | Why | When |
| --- | --- | --- |
| _(nothing yet)_ | | |

---

## 5. How this gets maintained

- **Tuesday:** solve from §3, move it to §2 with a revisit date, update §1's coverage row.
- **Sunday:** 30 seconds — anything with a revisit due?
- **Quarterly:** re-read §1. Any pattern still at `none` after three months is a deliberate
  choice or an accident; decide which.

Week generation promotes candidates from `reference/idea-bank.md` into §3 rather than
inventing new ones, and never writes a problem into a day plan that is not in this file.

## 6. Related

- `core/bonus-bank.md` — build-your-own utilities, hooks, and type-level puzzles. Different
  job: those teach a language or a library, these teach a pattern.
- `reference/idea-bank.md` — the raw parking lot that feeds §3.
- `preset.md` §8.8 — the stuck protocol: attempt 15–20 min, then AlgoMaster for the pattern,
  Namaste DSA for the data structure, NeetCode for the specific problem. Read the approach,
  never the full solution.
