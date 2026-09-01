# PromptMuster — Full Project Walkthrough

This document exists so that anyone (including a future version of you who hasn't looked
at this project in months) can understand the whole thing without having to piece it
together from a dozen separate documents. It's written in plain language on purpose — no
unexplained jargon, no compressed reference tables you have to decode. If a technical term
shows up, it gets explained the first time it's used.

**How this relates to the other documents in `docs/`:** those documents (`prd.md`,
`trd.md`, `ia.md`, and so on) are the original planning documents — each one is detailed
and focused on one topic. This document is different: it's a single guided tour through
the *whole* project, written so you can read it start to finish and come away actually
understanding the thing, not just skimming a reference card. Where it matters, it points
you to the specific document that goes deeper on a topic.

**One important rule:** if anything in this document ever disagrees with the actual code,
the code is right and this document is wrong — treat this as a guide to help you find your
way, not as the final word.

---

## Table of contents

1. [What PromptMuster actually is](#1-what-promptmuster-actually-is)
2. [What's built right now vs. what's still a plan](#2-whats-built-right-now-vs-whats-still-a-plan)
3. [The big architecture idea: one shared brain, four front doors](#3-the-big-architecture-idea-one-shared-brain-four-front-doors)
4. [A tour of the app as it exists today](#4-a-tour-of-the-app-as-it-exists-today)
5. [The look and feel (design system)](#5-the-look-and-feel-design-system)
6. [The new `core/` library and the `.prompt` file format](#6-the-new-core-library-and-the-prompt-file-format)
7. [The four-phase roadmap](#7-the-four-phase-roadmap)
8. [The big engineering decisions, and why they were made](#8-the-big-engineering-decisions-and-why-they-were-made)
9. [Thinking about safety](#9-thinking-about-safety)
10. [How we know it works (testing)](#10-how-we-know-it-works-testing)
11. [Things that look like bugs but are actually deliberate](#11-things-that-look-like-bugs-but-are-actually-deliberate)
12. [Where to find things in the code](#12-where-to-find-things-in-the-code)
13. [Commands you can run](#13-commands-you-can-run)
14. [Map of every other document in this project](#14-map-of-every-other-document-in-this-project)

---

## 1. What PromptMuster actually is

If you write prompts for AI models — the instructions you feed into ChatGPT, Claude, or
similar — you've probably noticed a problem: those prompts live nowhere real. They're
scattered across chat histories, random text files, or buried in code. When you tweak a
prompt, you have no way to tell whether the new version is actually better. You don't know
what it costs to run. And it doesn't travel with you into the tools you actually work in.

PromptMuster's pitch, in the project's own words: **"Your prompts as files in git —
tested like code, measured for cost, and available where you work."**

Concretely, that means four things, once the whole plan is built out:

- **Prompts live as ordinary text files, stored in a git repository** — the same way your
  code does. That means you get version history, diffing, and code-review-style pull
  requests on your prompts for free, just by using git the normal way.
- **Prompts get tested like code.** You attach test cases to a prompt (example inputs and
  what a "good" output looks like), and there's a test runner that checks whether a prompt
  change made things better or worse — including using a second AI model as a judge for
  cases too fuzzy for an exact string match.
- **You always see what things cost**, before and after you run something, instead of
  cost being an invisible surprise.
- **The prompt library shows up inside the tools you already use** — specifically, inside
  AI coding assistants like Claude Code or Cursor, via a technology called **MCP** (Model
  Context Protocol — think of it as a standard way for an AI coding assistant to call out
  to an external tool, the same way a phone app can call out to your calendar or contacts).

**What it deliberately is *not*:** it's not a marketplace for buying/selling prompts, not
a public social feed for sharing prompts, not a general framework for building AI agents,
and not a piece of software you sign up for online. It runs on your own computer, doesn't
require an account, and doesn't need a server running in the background.

**Who it's for.** The project's planning documents name three people it's designed
around:

- **Priya**, a developer who uses AI assistance daily and wants her review/refactor
  prompts one keystroke away inside her editor, with confidence that a tweak didn't
  quietly make things worse.
- **Sam**, a team lead who wants a shared prompt library the team can review changes to
  like code, with tests running automatically and cost visible per prompt.
- **Maya**, a non-technical product manager who wants to run the team's already-built
  prompts with her own inputs and compare results, through a simple web page — never a
  terminal.

Only Priya's world is built today. Sam's and Maya's needs (team sharing, a non-technical
run screen) are planned for much later.

**How success is measured.** Rather than "line has to reach production," the project's
own success bar is refreshingly concrete: is the author actually using this tool at least
4 days a week by a certain point? Has at least one prompt of their own been tested with
real eval suites? Has at least one stranger installed and run it? These are logged in
`docs/prd.md` §10 and repeated at each phase's checkpoint in the backlog.

---

## 2. What's built right now vs. what's still a plan

This is the single most important thing to get right about this project, because the
planning documents describe a much bigger system than what currently runs.

**What actually exists and runs today:** a website you can start on your own computer
(`npm run dev`, opens in your browser). It's a prompt *library manager* — you can create a
prompt, edit it, delete it, mark it as a favorite, search and filter your list of prompts,
and switch between light/dark/system theme. That's it. There is no database, no
server-side code, no user accounts, and nothing gets saved permanently — if you refresh
the page, everything you created disappears (see the note on this in section 4). None of
the prompts actually get *run* against a real AI model yet.

Separately, a small building block for the *next* stage has just been built: a way to
read a `.prompt` text file (the planned on-disk format for a prompt) and turn it into a
structured object your program can work with, catching malformed files with a clear error
message. This isn't wired into the website yet — it's a standalone piece being built ahead
of the day the website actually needs it. Section 6 explains this in detail.

**Everything else — and it's a lot — is planned but not built:** actually running a
prompt against OpenAI/Anthropic/Google and seeing a real response; comparing multiple
models side by side; the automatic test-grading system (evals); a cost dashboard; version
history and rollback; the MCP server that would let Claude Code or Cursor use your prompt
library directly; a command-line tool; a GitHub Action that tests prompts automatically on
every pull request; and the optional "team" mode with shared hosting. All of it is
described in detail in the planning documents, none of it exists in code yet.

If you only remember one thing from this section: **when you read a planning document
that describes something in confident detail (a database table, a security policy, an API
endpoint), that's the design for something that hasn't been built. Cross-check against the
actual file tree (section 12) before assuming it's live.**

---

## 3. The big architecture idea: one shared brain, four front doors

Here's the core engineering idea the whole plan is built around, explained without jargon.

Once PromptMuster is fully built, there will be four different ways to use it:

1. A **website** (what exists today, in an early form) — you click around in a browser.
2. A **command you type in your terminal** (like `promptmuster run my-prompt`).
3. A **plug-in that AI coding assistants can call** (the MCP server mentioned above) — so
   Claude Code or Cursor can list your prompts and run them on your behalf.
4. A **robot that runs automatically on GitHub** whenever someone opens a pull request
   that changes a prompt, to check nothing broke.

The obvious bad way to build this is to write the actual logic (how to read a prompt file,
how to call an AI provider, how to grade a test case) four separate times — once for each
of those four things. Instead, all four of them are designed to call into **one shared
library** that contains all of the real logic. Nothing about *how prompts work* is
duplicated; the website, the terminal command, the AI-assistant plug-in, and the GitHub
robot are just four different "front doors" into the same one set of functions.

This shared library is called `core` in the code (the actual folder is named `core/`, and
it's set up to eventually be published as its own package named `@promptmuster/core`).
The rule that makes this work is: **`core/` is not allowed to depend on anything specific
to a website, a server framework, or React** (the library the website's UI is built with).
It's just plain, ordinary code with no attachments — which means the terminal command and
the AI-assistant plug-in can use it directly, instantly, with nothing extra to install or
start running in the background.

That last point matters a lot to this project's whole pitch: **there is no server you have
to keep running.** A lot of tools like this would normally run as a background service you
start once and leave running. PromptMuster is deliberately built so that using it locally
never requires that — the website, the terminal tool, and the AI-assistant plug-in all
just read files and a small local database directly, with nothing to start, nothing to
crash, and nothing to forget to turn back on. (A real server *does* eventually get built,
but only for an optional "hosted team" mode that's far down the roadmap — see section 7 —
and even then, it's a thin wrapper *around* the same shared library, not a rewrite of it.)

---

## 4. A tour of the app as it exists today

The website is built with Next.js (a popular framework for building React-based websites)
and uses what's called the **App Router** — a way of organizing a website where each
folder under `src/app/` corresponds to a URL path.

Here's every page that exists right now:

| When you visit... | You see... |
|---|---|
| `/` | Nothing to look at — it immediately redirects you to `/prompts`. |
| `/prompts` | **The main screen.** A list of all your prompts, with search and filter controls (by AI model, by category, by favorites-only) built into the page's own URL — so if you copy the link while filtered, and paste it in a new tab, you get the exact same filtered view back. |
| `/prompts/new` | A form to create a new prompt (title, the actual prompt text, which AI model it's meant for, a category, tags). |
| `/prompts/[some-id]` | The detail view for one specific prompt — its full text, its tags, a favorite button, and buttons to edit or delete it. |
| `/prompts/[some-id]/edit` | The same form as "new," but pre-filled, for editing an existing prompt. |
| `/settings` | A placeholder page that just says "Coming soon." Nothing lives here yet. |

**How the app remembers things while you're using it.** All of your prompts are held in
memory, in a single place in the code called `PromptProvider` (found in
`src/context/PromptProvider.tsx`). Think of it as a shared notebook that every page of the
app can read from and write to — that's how creating a prompt on one page and seeing it
show up in the list on another page works, without needing a database. The catch: it's
*only* in memory. The moment you refresh the browser tab, that notebook is wiped clean and
you start over with zero prompts. This is a known, deliberate limitation for right now —
real, permanent storage (as `.prompt` files, described in section 6) is planned for a
later phase, not an oversight.

There's a dev-only "Load Sample Data" button that fills the list with five example prompts
so you have something to look at — it only appears when running the app in development
mode, never in a real build.

**A note on the visible gap between what you can do today and what's planned.** Every
prompt has fields for things like "category" and "tags" already, and those work today
(you can filter by them). But nothing about the *content* of a prompt is structured yet —
it's just one big block of text. The plan (described in section 6 and 7) is to eventually
split that into separate "system instructions" vs. "user message" parts, plus typed
variables you can fill in like a form. That rework hasn't started on the website side yet
— only the underlying `.prompt` file reader has been built, in isolation, ready for when
the website needs it.

---

## 5. The look and feel (design system)

The app deliberately looks like a piece of developer tooling — closer to a code editor or
a terminal than a typical consumer website. A few specific choices, explained plainly:

- **Everything is set in a monospace font** (the kind where every letter takes up the same
  width, like in a code editor) — including plain UI text like button labels, not just
  the prompt content itself. This was actually tried both ways: first with two different
  fonts (a normal one for buttons/menus, monospace only for the prompt text itself), and
  then changed back to all-monospace, because it reads as a more distinct, deliberate
  "developer tool" identity rather than a half-finished mix.
- **Square corners everywhere, not the rounded corners you'd see on a typical app.** This
  is a genuine case where the actual code and the written design document disagree
  slightly: the design document says corners should be gently rounded (a specific small
  radius), but every actual component in the code uses fully square corners, because that
  was judged to look more consistent once one component (a card) was accidentally built
  with square corners and rounding just that one component back would have looked odd next
  to everything else. Trust what's actually built (square corners) over what the design
  document says here.
- **A three-way dark mode switch** — light, dark, or "match your system," not just a
  simple on/off toggle. The clever part is *how* "match your system" is implemented: it
  isn't stored as a saved preference at all. The absence of a saved choice *is* what
  "match my system" means, which is what lets the app follow your operating system's
  light/dark setting live, without a page reload, the moment you change it in your OS
  settings. If a concrete "system" value were ever accidentally saved, the app would get
  stuck mimicking whatever your OS happened to be set to at that one moment, instead of
  actually following it.
- **A second, smaller mismatch worth knowing about:** the actual dark-mode background/text
  colors that ship in the code are close to, but not byte-for-byte identical to, the exact
  numbers written down in the design document — they were fine-tuned slightly during
  actual implementation, and the document was never updated to match. Not a bug, just
  something to be aware of if you're ever comparing the two side by side.
- **A recent addition: a small pop-up menu for switching themes**, styled to look like a
  miniature command-line prompt (a "$ theme" label with a blinking cursor, then three
  clickable lines: light / dark / system) rather than a plain dropdown — a small but
  deliberate touch to keep the "this is a developer's tool" personality consistent even in
  small details.
- **Motion is intentionally minimal and fast.** Things like a pop-up menu opening use a
  quick, snappy animation (well under a quarter of a second), and if your operating system
  is set to reduce motion (an accessibility setting some people rely on to avoid
  discomfort from animation), the whole app respects that and collapses all animation down
  to effectively nothing.
- **Accessibility is treated as a real requirement, not an afterthought.** Every clickable
  thing needs to be reachable and usable with a keyboard alone, not just a mouse. Several
  real gaps were found and fixed this way — for example, a delete-confirmation pop-up used
  to default your keyboard focus to the "Delete" button instead of "Cancel" (dangerous, if
  you reflexively press Enter twice), and the main list of prompts had no visible outline
  at all when you tabbed to a card with your keyboard. Both are fixed now, but a full,
  systematic walk-through of every single flow in the app with only a keyboard has still
  not been finished — it's a known, tracked, unfinished piece of work.

---

## 6. The new `core/` library and the `.prompt` file format

This is the newest, most actively-being-built part of the project, so it's worth walking
through carefully.

**The idea.** Eventually, every prompt won't live inside the browser's memory (as it does
today) — it'll live as an actual text file on your computer, inside a git repository,
named something like `code-review.prompt.md`. The file's name *is* its identity — there's
no separate ID number to keep track of.

**What one of these files actually looks like.** It has two parts, separated by three
dashes (`---`):

1. **A settings block at the top**, written in YAML (a simple, readable way of writing
   structured settings — you've probably seen it before as `key: value` pairs). This is
   where you write the prompt's name, description, which AI model it's meant for, any
   input variables it expects, and a small block of PromptMuster-specific extras
   (category, tags, whether it's a favorite).
2. **The actual prompt text below that**, written using a template language called
   Handlebars — the main thing you need to know about it is that it lets you mark which
   parts of the text are "system instructions" vs. "what the user is asking," using
   markers that look like `{{role "system"}}` and `{{role "user"}}`.

This file format isn't invented from scratch — it's borrowed from an existing,
already-established convention called **dotprompt** (an open format originally from
Google's Genkit project), with a small PromptMuster-specific extension added on top for
the handful of things dotprompt has no concept of at all (category, tags, favorites). The
reasoning for borrowing rather than inventing: a format only your own tool understands is
much less useful, and reinventing something that already exists well is wasted effort. The
project deliberately checked its assumptions against dotprompt's *actual source code* on
GitHub multiple times rather than trusting the written documentation alone, and found (and
fixed) two real mistakes this way that the documentation didn't make clear — more on this
below.

**What the parser (the piece of code that reads these files) actually does.** Given the
raw text of a `.prompt` file, it:

- Splits the settings block away from the prompt text.
- Checks that the required settings are actually present and are the right type (a
  missing title, a model field that's secretly a number, and so on all get caught here).
- Splits the prompt text into separate "system" / "user" / "assistant" messages, based on
  those `{{role "..."}}` markers.
- Hands back either a clean, structured result, or a clear description of exactly what
  was wrong — it never just crashes with a cryptic error, and it never silently accepts
  something broken and produces a wrong-but-plausible-looking result instead.

That second point — never silently producing a wrong result — was treated as seriously
as catching outright errors. A few examples of subtle mistakes that were specifically
hunted for and fixed, because a careless version of this parser could have let them
through without any error at all:

- If someone accidentally writes a role marker slightly wrong — say, using single quotes
  (`{{role 'system'}}`) instead of the expected double quotes, or capitalizing it
  differently — a careless parser would just treat that stray text as part of the prompt
  itself, silently losing an intended message boundary with zero warning. This is now
  caught and reported as an error instead.
- If a setting that's supposed to be a small structured object (like the model
  configuration) is accidentally written as a list instead, a careless parser might
  silently produce something like an empty, nonsensical result rather than an error. This
  is now caught too.

**The one genuinely interesting discovery.** While reading dotprompt's real source code
(rather than trusting its written documentation) to double-check an assumption about how
array-type fields are described, it turned out one of the three example prompt files
already checked into this project had been written *incorrectly* — the description text
was placed in the wrong spot, meaning it would have quietly described the wrong thing once
actually compiled. It's since been corrected. This is exactly the kind of subtle mistake
that only shows up if you actually verify against the real implementation instead of
assuming — a lesson this project takes seriously enough that it's mentioned more than once
in its own internal notes.

**What's deliberately *not* done yet.** The parser does not try to actually run the
Handlebars template (substituting in variables like `{{code}}` with real values) — the
text of each message is kept exactly as written, unexpanded. It also doesn't try to fully
understand or validate the shape of input/output variable schemas (a related but separate,
more complex piece of the format called Picoschema) — that's intentionally left for a
later stage of the project, once the rest of the pieces that actually need it exist.

---

## 7. The four-phase roadmap

The plan is broken into four phases, each with a clear theme and a way to know you're
actually done with it (not just "ran out of time on it").

**Phase 1 — "Useful to me."** Get the tool to a point where the author personally uses it
regularly. This is where the `.prompt` file format, the file-reading parser (section 6),
actually running a prompt against a real AI model, streaming the response back
token-by-token, showing an honest cost estimate before you run anything, and the
AI-assistant plug-in (MCP) all get built. **Done when:** the author is actually reaching
for this tool, inside their coding assistant or terminal, at least four days a week —
without having to force themselves to use it.

**Phase 2 — "Trustworthy."** This is described as the single most important feature of
the whole project — the automatic test-grading system (called "evals" here). You attach
test cases to a prompt (example inputs plus a description of a good output), and a test
runner checks whether editing the prompt made things better or worse — including using a
second, cheaper AI model as a judge for the many cases where a fuzzy "does this sound
right" judgment matters more than an exact string match. **Done when:** at least ten of
the author's own prompts have real test suites attached.

**Phase 3 — "Shareable."** Package everything up so a stranger can actually install and
use it: a proper command-line tool, the ability to export/import prompt collections, a
robot that automatically tests prompts on GitHub pull requests, a cost dashboard, and a
public release with a working live demo anyone can try without installing anything.
**Done when:** the project is public, and at least one person who isn't the author has
installed it and asked a real question or filed a real issue.

**Phase 4 — "Team."** An optional mode for teams: a shared prompt repository reviewed like
code, a simpler run-and-compare screen designed for non-technical teammates (this is where
Maya's needs finally get built), and — only at this point — an actual server, built with
the same backend framework (NestJS) and database (PostgreSQL) a typical company would use.
This is deliberately the *only* phase that involves a real hosted server, and it's built
as a thin wrapper around the same shared `core` library from section 3, not a rewrite.

**Why this particular order, and not, say, building the test-grading system first (since
it's called "the most important feature")?** Because a feature nobody actually uses
doesn't matter no matter how good it is. Getting the tool inside the author's daily coding
workflow (via the AI-assistant plug-in) as early as possible — even before the flashier
test-grading system — is what actually determines whether this project survives past being
an abandoned side project. That's a specific, deliberate engineering decision (see ADR-007
in section 8), not an accident of convenience.

---

## 8. The big engineering decisions, and why they were made

The project keeps a written record of its major technical decisions (called ADRs —
Architecture Decision Records — one short document per decision, each naming what was
decided, what else was considered, and why the alternative lost). Here they are, explained
plainly:

**Why doesn't this need a server?** Because the whole pitch is that it works entirely on
your own computer with nothing extra to install or keep running. A background server you
have to start and babysit would directly contradict that pitch. So the real logic lives in
a plain, framework-free library (section 3), and a proper server only gets built much
later, for the optional team mode — see ADR-001.

**Why are prompts stored as files, but the record of when you ran them stored in a small
local database?** Because those two kinds of data have genuinely different needs. Prompts
benefit enormously from being files in git — you get history, diffing, and code-review
for free, and that's the whole point of the "git-native" pitch. But a record of "you ran
this prompt 500 times, here's what each run cost" doesn't want to be 500 separate files —
it wants to be rows in a proper, queryable database, which is exactly what a lightweight
local database is good at. So: prompts as files, run history in a small local database.
See ADR-002 and ADR-003.

**Why not just use Postgres (the "real" production database) from day one, even for
personal local use?** Because requiring someone to install and run a full database server
just to try a "runs on your machine, no setup" tool defeats the point. A much simpler,
zero-setup local database (called SQLite, essentially just a single file on disk) is used
locally instead, and Postgres only enters the picture for the Phase 4 team mode, where a
real server already exists anyway. See ADR-003 and ADR-008 (which also explains a related
choice: talking to that local database directly with plain, hand-written SQL rather than
through a heavier tool that auto-generates the SQL for you — deliberately, to actually
learn how the database queries work, not to hide them).

**Why hand-build the code that talks to OpenAI/Anthropic/Google, instead of just using
their official pre-built libraries?** For the *first* provider only, it's built by hand
against the raw web request format on purpose — specifically to actually learn how
streaming responses and retries work under the hood, rather than have an official library
hide all of that. Once that's understood, official libraries are used for the rest and to
tidy up the first one. See ADR-004.

**Why borrow an existing prompt-file format instead of inventing one?** Explained already
in section 6 — reinventing a wheel that already exists well isn't worth it, and using a
widely-recognized format means other tools can potentially read your prompt files too. See
ADR-005.

**Why treat "which AI models exist and what they cost" as data instead of code?** Because
model names and prices change constantly — new model versions ship almost every month, and
hardcoding them directly into the program's code means every single price change requires
a code change and a new release. Keeping that information as an editable table instead
means it can be updated without touching the actual program logic. See ADR-006.

**Why does the AI-assistant plug-in (MCP) get built before the test-grading system, even
though the test-grading system is called the more important feature?** Already covered in
section 7 — using the tool daily matters more, early on, than having the fanciest feature
nobody's actually reaching for. See ADR-007.

---

## 9. Thinking about safety

Even though nothing about this is live yet, the project has already thought carefully
about what could go wrong once it is, and written it down (`docs/threat-model.md`). A few
of the more important, plain-language versions of those concerns:

- **The biggest one:** if you ever use someone *else's* shared prompt library — say, a
  teammate's, or something you found publicly — that file could contain hidden
  instructions written to trick your AI coding assistant into doing something you didn't
  intend. The subtle part is exactly *when* the danger happens: it's not just when the
  prompt actually gets **run** (spending money) — it's the moment the AI assistant even
  **reads** the prompt's text at all (to just show you what it says), because reading
  untrusted text is already enough to influence an AI model reading it. The original
  design only added a "please confirm" safety check before spending money on actually
  running something — this gap (a safety check that protects the wrong moment) was found
  and is flagged as the single most serious issue in the whole safety review.
- **Money safety:** running a prompt against an AI model costs real money, so anything
  that runs a prompt needs a "please confirm first" step, and a hard spending cap that's
  enforced by the core program itself — not just something a well-behaved caller is
  expected to check on its own, since a careless or malicious caller could otherwise just
  skip that check.
- **Accidentally leaking secrets:** if you ever pasted something sensitive (like a
  password) into a prompt's input while testing it, that exact text would get saved,
  unencrypted, into your local run history forever, unless something actively watches for
  and warns about that.
- **A hostile webpage attacking your local website:** because the local dashboard listens
  on a port on your computer like any website does, a malicious webpage you happen to have
  open in another browser tab could try to secretly send requests to it (this general
  category of attack is called CSRF). The plan is to make the local server refuse requests
  that don't look like they came from itself.
- **Supply-chain risk:** since this project will eventually publish real, installable
  packages (via a tool called npm) that other people install and a GitHub robot that other
  people's repositories run automatically, there's a real risk if the account that
  publishes those ever got compromised, or if this project ever pulled in a compromised
  dependency of its own.

None of these are fixed today because none of the features they apply to are built yet —
they're documented in advance so the fix gets designed in from the start, rather than
bolted on as an afterthought once something's already shipped and being used.

---

## 10. How we know it works (testing)

The project has an actual automated test suite (using a tool called Vitest), currently
sitting at 23 test files and 201 individual tests, all passing. A few things worth knowing
about how testing is set up here specifically:

- **Type-checking runs twice, on purpose, in two different modes.** The main website code
  gets checked one way (which assumes it's allowed to use browser-only features). The new
  `core/` library gets checked a *second*, stricter way that assumes it is **not** allowed
  to use anything browser-specific at all (no `window`, no `document`) — because if it
  ever accidentally did, that would quietly break the whole point of it being a
  framework-free library usable from a plain terminal command with no browser involved.
  Catching that requires actually checking it separately; the normal, browser-aware check
  wouldn't catch it.
- **The written coding rules for this project are unusually strict and are actually
  followed, not just written down and ignored.** No use of the type `any` (a TypeScript
  escape hatch that turns off type-checking — banned here on purpose, since the whole
  point of using TypeScript is to catch mistakes before they happen), no shortcuts, and
  every change gets checked against the type-checker, the linter (a tool that checks for
  common mistakes and style issues), and the test suite before being considered done.
- **A recurring habit this project follows, worth calling out explicitly:** whenever a
  design document makes an assumption about how some third-party tool or format actually
  behaves, that assumption gets checked against the real thing's actual source code before
  anything gets built on top of it, rather than trusted at face value. This has caught
  real mistakes more than once already (see section 6's dotprompt example).

---

## 11. Things that look like bugs but are actually deliberate

A short list of things that might look wrong at first glance, with the actual reasoning,
so you don't waste time "fixing" something that was already a considered choice:

- **Changing a filter (like the search box) doesn't add a new entry to your browser's
  back-button history.** If it did, pressing "back" after typing a few letters into search
  would step back through every single letter you typed, one at a time, which would be
  annoying. Instead, changing a filter *replaces* the current entry, so pressing "back"
  once takes you straight out of the filtered view entirely, in one step.
- **All-monospace font and fully-square corners**, even though the original design
  document describes something slightly different — explained already in section 5. This
  was a deliberate choice made *after* the design document was written, and the document
  was simply never updated to match.
- **The theme-picker icon shows the theme you'll get if you click it, not the theme
  you're currently in.** Early on, it briefly showed the *current* theme instead (so a sun
  icon meant "you're in light mode"), which was confusing on its own, without a tooltip,
  because it read like "click this to get more sun" rather than "you are currently in
  light mode." It was changed to show the destination instead (a moon icon while you're in
  light mode, meaning "click to go dark") specifically so the icon explains itself without
  needing a tooltip.
- **A prompt file must include PromptMuster's own small settings block, and one written by
  someone else without it will be rejected, not silently accepted with guessed defaults.**
  This was a real decision point (not an oversight): the alternative — silently inventing
  a category/tags for a foreign file — was rejected because making up facts about someone
  else's prompt and showing them as if they were real is worse than clearly saying "this
  file is missing something PromptMuster needs."

---

## 12. Where to find things in the code

Use this as a "if you want to look at X, open Y" map, not an exhaustive file listing.

**The website (what you see in the browser):**
- `src/app/` — every page and its URL, organized by folder (see section 4's table).
- `src/components/` — every reusable piece of the interface (the prompt card, the delete
  confirmation pop-up, the theme switcher, and so on) — one file per component.
- `src/components/ui/` — the lower-level building blocks (buttons, dropdown menus,
  pop-up menus) that the components above are built out of.
- `src/context/PromptProvider.tsx` — the shared in-memory "notebook" described in
  section 4 that holds all the prompts while you're using the app.
- `src/hooks/useFilterParams.ts` — the piece of code that keeps the search/filter
  controls in sync with the page's URL.
- `src/types/prompt.ts` — the exact shape of what a "Prompt" is in the current, in-memory
  version of the app (this is expected to change once the file-based rework in section 6
  reaches the website).
- `src/app/globals.css` — where all the visual design tokens (colors, spacing, motion
  timing) actually live as real values.

**The new file-based library (section 6):**
- `core/prompt-file.ts` — the exact shape of a parsed `.prompt` file, as a type.
- `core/parse-error.ts` — the specific, named kinds of errors the parser can report.
- `core/parse-prompt-file.ts` — the actual parser itself.
- `core/parse-prompt-file.test.ts` — its tests, including the three real example files.
- `examples/prompts/` — three real, hand-written `.prompt` files used both as
  documentation and as test material.

**Everything else worth knowing about:**
- `docs/core/backlog.md` — the full, long-term feature list, organized by phase.
- `docs/core/tickets.md` — that same backlog broken down into much smaller, individually
  completable pieces of work.
- `docs/core/completion-log.md` — a running, dated journal of what's actually been
  finished and any non-obvious lessons learned along the way — read this before assuming
  something isn't done yet.
- `docs/adr/` — the individual decision documents referenced throughout section 8.

---

## 13. Commands you can run

| Command | What it does |
|---|---|
| `npm run dev` | Starts the website on your own computer, for you to look at in a browser (usually at `http://localhost:3000`). |
| `npm run build` | Builds a real, production-ready version of the website (used before actually deploying it somewhere, not for everyday development). |
| `npm run lint` | Checks the code for common mistakes and style issues, without running anything. |
| `npx tsc --noEmit` | Checks that all the *website* code's types are consistent and correct, without actually building anything. |
| `npm run typecheck:core` | The same kind of check, but specifically for the `core/` library, run in the stricter, browser-free mode explained in section 10. |
| `npm test` | Runs the full automated test suite once. |
| `npm run test:watch` | Runs the test suite and keeps watching for changes, re-running automatically as you edit code. |
| `npm run format` | Automatically re-formats all the code consistently. |

---

## 14. Map of every other document in this project

A short, plain-language description of what each one actually contains, so you know which
one to open for a given question.

| Document | What it's actually for |
|---|---|
| `docs/prd.md` | The product pitch — who this is for, what problem it solves, how it's different from similar existing tools, and how success will be measured. |
| `docs/trd.md` | The engineering plan — the technology choices behind the product pitch, and the reasoning for each one. |
| `docs/ia.md` | Every screen the finished product will eventually have, and how they connect to each other (the site map). |
| `docs/ux-flows.md` | Step-by-step walkthroughs of what a person actually does on screen for each major task (creating a prompt, running one, comparing models, and so on). |
| `docs/design-system.md` | The exact visual details — colors, fonts, spacing, animation timing — explained further, with the reasoning, in section 5 of this document. |
| `docs/database-schema.md` | The exact planned shape of the local database mentioned in section 8 — which tables, which columns. Not built yet. |
| `docs/api-specifications.md` | The exact planned shape of the "front door" interfaces mentioned in section 3 — the internal library's functions, the AI-assistant plug-in's three commands, and the eventual team-mode web API. |
| `docs/threat-model.md` | The full, detailed version of section 9's safety concerns. |
| `docs/qa-test-plan.md` | The detailed plan for what will be tested and how, once the features described in it actually exist. |
| `docs/devops-cicd.md` | The plan for how this project will actually get built, tested automatically, and published/deployed, once there's something to deploy. |
| `docs/disaster-recovery.md` | The plan for what to do if something goes wrong later on (a corrupted local database, a bad release accidentally published, and so on). |
| `docs/compliance-matrix.md` | A single master checklist mapping every planned feature to whether it's built yet, and how it'll be verified. Useful as a fast way to check current status without reading every other document. |
| `docs/prompt-file-format-spike.md` | The research notes behind the `.prompt` file format described in section 6 — including the real mistakes found by checking against dotprompt's actual source code. |
| `docs/adr/` | The individual decision write-ups referenced throughout section 8. |
| `docs/core/backlog.md` and `docs/core/tickets.md` | The actual, current to-do list — see section 12. |
| `docs/core/completion-log.md` | The dated journal of finished work — see section 12. |
| `README.md` | The short, public-facing introduction to the project. |
| `CLAUDE.md` | Working conventions for how code changes get made in this repository day to day — not about the product itself. |
