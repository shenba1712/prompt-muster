// Framework-free by design (ADR-001) — this file must never import from
// react, next, or the app's `src/` tree. Enforced by eslint.config.mjs's
// core/** override, not just convention.

export type PromptRole = 'system' | 'user' | 'assistant';

export interface PromptMessage {
  readonly role: PromptRole;
  readonly content: string;
}

// dotprompt's own `config` field is deliberately open — `ModelConfig =
// Record<string, any>` in its real types.ts, with the doc comment "not all
// models support all options" — not a fixed field set (verified against
// the real type, not assumed; see docs/core/completion-log.md). The five
// named fields below are the ones PromptMuster's own code actually
// understands and validates the type of; the index signature lets any
// other provider-specific field (frequency_penalty, seed, ...) pass
// through unvalidated rather than being rejected or silently dropped.
export interface PromptFileConfig {
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly topK?: number;
  readonly topP?: number;
  readonly stopSequences?: readonly string[];
  readonly [key: string]: unknown;
}

// Picoschema compiles to JSON Schema, but the compiler doesn't exist yet —
// deferred past 08.3 (whose parser deliberately leaves input/output.schema
// as this raw, uncompiled shape) to whenever compilation actually lands.
// Both grammar ambiguities from docs/prompt-file-format-spike.md §3 are now
// resolved — item 3 below, item 4 immediately after it.
//
// Ambiguity #4 — RESOLVED 2026-08-10, verified against the real compiler
// source and its own test suite (google/dotprompt, js/src/picoschema.ts +
// picoschema.test.ts): every object schema Picoschema compiles — the
// top-level `output.schema` and any nested `(object, ...)` field alike —
// defaults to `additionalProperties: false`. It's hardcoded in the object
// initializer inside `parsePico()`, the one function both paths go
// through, not something that has to be opted into:
//
//   const schema: JSONSchema = {
//     type: 'object', properties: {}, required: [], additionalProperties: false,
//   };
//
// The only thing that overrides it is an explicit `(*)` wildcard-property
// key, which nothing in this codebase's format uses. Confirmed against 7
// real test cases in picoschema.test.ts, including one asserting it holds
// for both a parent *and* its nested object simultaneously. This means
// the concern the spike flagged — Anthropic's structured-outputs API
// requiring `additionalProperties: false`, so a naive compiler might
// silently produce a schema that looks right and fails at the provider —
// is a non-issue: Picoschema already produces that shape by default, so
// neither this parser nor the eventual Picoschema compiler needs to inject
// anything for it. Nothing to build here — see docs/core/completion-log.md.
//
// Ambiguity #3 — RESOLVED 2026-08-10, verified against the real compiler
// and its own test suite (google/dotprompt, js/src/picoschema.ts +
// picoschema.test.ts), not inferred by analogy:
//
//   const [name, typeInfo] = key.split('(');
//   const [type, description] = extractDescription(
//     typeInfo.substring(0, typeInfo.length - 1)
//   );
//   if (type === 'array') {
//     schema.properties[propertyName] = {
//       type: isOptional ? ['array', 'null'] : 'array',
//       items: await this.parsePico(obj[key], [...path, key]),
//     };
//   }
//
// For a parenthesized key `field(array, description)`, the comma-separated
// description *inside the parens* describes the array/object/enum field
// itself. The value after the colon is recursively parsed as the ITEM
// type, in the same `type, description` form. Confirmed against the real
// test suite: `{ 'items(array, list of items)': 'string' }` compiles to
// `{ type: 'array', items: { type: 'string' }, description: 'list of
// items' }` — the description sits on the array, the value is just the
// item's bare type.
//
// examples/prompts/generate-api-docs.prompt.md originally wrote
// `parameters(array): string, Name and description of each request
// parameter` — empty parens (no array-level description at all), putting
// that description on the item type instead (each string element, not the
// `parameters` field itself). Not what was intended when hand-written —
// corrected 2026-08-10 to `parameters(array, Name and description of each
// request parameter): string`, moving the original wording into the
// parens where it actually belongs; the other two `(array)` fields in that
// file got the same fix.
export type PicoschemaDefinition = Record<string, unknown>;

export type VariableKind = 'text' | 'textarea' | 'select' | 'file';

// PromptMuster's own extension data — lives at `ext.promptmuster` in the
// real frontmatter. A bare top-level `promptmuster:` key is silently
// dropped by a real dotprompt parser (verified against google/dotprompt's
// own source; see docs/prompt-file-format-spike.md §1/§3).
export interface PromptMusterExtension {
  readonly schemaVersion: number;
  // A plain string, not the app's `Category` union — core cannot import
  // from src/ (ADR-001). Whether this becomes a shared type is #09/#10's
  // decision, not this scaffold's.
  readonly category: string;
  readonly tags: readonly string[];
  readonly isFavorite: boolean;
  readonly variableKinds?: Readonly<Record<string, VariableKind>>;
}

export interface PromptFile {
  // Derived from the filename by the parser (08.3), not stored in
  // frontmatter — the file's identity is its path, not a UUID.
  readonly slug: string;
  // dotprompt's own real type makes both `name` and `model` below optional
  // (`name?: string`, `model?: string` in its types.ts). PromptMuster
  // requires both deliberately, not by oversight: a prompt library UI built
  // around listing and running named prompts against a target model needs
  // both to make practical sense. Verified against the real type before
  // deciding to diverge from it, not just defaulted to "required" — see
  // docs/core/completion-log.md.
  readonly name: string;
  readonly description?: string;
  // Flat `provider/id`, e.g. "anthropic/claude-sonnet-5" — verified against
  // Genkit's own plugin docs, not guessed (spike note §3, item 2).
  readonly model: string;
  readonly config?: PromptFileConfig;
  // Both sub-fields optional, matching dotprompt's real `input`/`output`
  // shape exactly (verified against types.ts, not assumed): `schema` alone
  // was the only shape modeled before, which would have silently dropped
  // `input.default` (default variable values) and `output.format`
  // (`'json' | 'text'`, independent of `schema`) if either were ever
  // present in a real file.
  readonly input?: {
    readonly schema?: PicoschemaDefinition;
    readonly default?: Readonly<Record<string, unknown>>;
  };
  readonly output?: {
    readonly format?: string;
    readonly schema?: PicoschemaDefinition;
  };
  readonly ext: { readonly promptmuster: PromptMusterExtension };
  readonly messages: readonly PromptMessage[];
  // Mirrors dotprompt's own `raw?: Record<string, any>` field exactly — "the
  // raw frontmatter as parsed with no additional processing... if your
  // implementation requires custom fields they will be available here."
  // dotprompt reserves several more top-level keys this parser doesn't
  // otherwise model at all (`tools`, `toolDefs`, `variant`, `version`,
  // `metadata` via `HasMetadata`) — function-calling and prompt-variant
  // concerns that belong to a later, execution-focused ticket, not 08.3.
  // Always populated (unlike dotprompt's own optional version) so nothing
  // in a real file is ever silently lost, even fields neither dotprompt's
  // typed shape nor this parser's own fields anticipated.
  readonly raw: Readonly<Record<string, unknown>>;
}
