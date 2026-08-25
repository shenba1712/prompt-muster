// Framework-free by design (ADR-001) — this file must never import from
// react, next, or the app's `src/` tree. Enforced by eslint.config.mjs's
// core/** override, not just convention.

export type PromptRole = 'system' | 'user' | 'assistant';

export interface PromptMessage {
  readonly role: PromptRole;
  readonly content: string;
}

export interface PromptFileConfig {
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly topK?: number;
  readonly topP?: number;
  readonly stopSequences?: readonly string[];
}

// Picoschema compiles to JSON Schema, but the compiler doesn't exist yet —
// deferred past 08.3 (whose parser deliberately leaves input/output.schema
// as this raw, uncompiled shape) to whenever compilation actually lands.
// One grammar ambiguity is still open (see docs/prompt-file-format-spike.md
// §3, item 4); item 3 is resolved below.
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
  readonly name: string;
  readonly description?: string;
  // Flat `provider/id`, e.g. "anthropic/claude-sonnet-5" — verified against
  // Genkit's own plugin docs, not guessed (spike note §3, item 2).
  readonly model: string;
  readonly config?: PromptFileConfig;
  readonly input?: { readonly schema: PicoschemaDefinition };
  readonly output?: { readonly schema: PicoschemaDefinition };
  readonly ext: { readonly promptmuster: PromptMusterExtension };
  readonly messages: readonly PromptMessage[];
}
