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

// Picoschema compiles to JSON Schema, but the compiler doesn't exist yet
// (08.3) and two grammar ambiguities are still open (see
// docs/prompt-file-format-spike.md §3, items 3-4). This is the raw parsed
// YAML shape until then — do not treat it as validated or complete.
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
