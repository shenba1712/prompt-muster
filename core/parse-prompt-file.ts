// Framework-free by design (ADR-001) — see prompt-file.ts's own header note.
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';

import type {
  PromptFile,
  PromptFileConfig,
  PromptMessage,
  PromptMusterExtension,
  PromptRole,
  PicoschemaDefinition,
  VariableKind,
} from './prompt-file';
import type { ParseError } from './parse-error';

export type ParseResult =
  | { readonly success: true; readonly file: PromptFile }
  | { readonly success: false; readonly error: ParseError };

type FieldResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: ParseError };

// Only v1 exists today. A v2 branch belongs in parseExtension's dispatch
// below as an additional case, not a rewrite of parseExtensionV1 — that's
// the point of gating on schemaVersion at all.
const SUPPORTED_SCHEMA_VERSIONS: readonly number[] = [1];

const VARIABLE_KINDS: readonly VariableKind[] = [
  'text',
  'textarea',
  'select',
  'file',
];

// Matches dotprompt's own `{{role "..."}}` helper output convention —
// verified against google/dotprompt's js/src/parse.ts `toMessages`, not
// guessed (see docs/core/completion-log.md).
const ROLE_MARKER = /\{\{\s*role\s+"(system|user|assistant)"\s*\}\}/g;

// A broader net than ROLE_MARKER — anything shaped like an attempted
// {{role ...}} call (single quotes, wrong case, a whitespace-control
// tilde, a missing argument), which real dotprompt would still recognize
// because it renders through Handlebars first and splits on the *rendered*
// marker, not the raw source. This parser deliberately never renders
// (08.3's scope keeps message content a raw string), so anything ROLE_MARKER
// doesn't match would otherwise be silently absorbed as literal message
// content with no error — the same "plausible input, silently wrong
// output" risk ambiguity #1 uncovered for the frontmatter parser (see
// docs/core/completion-log.md). Used only for detection, never to build
// messages.
const ROLE_MARKER_LOOSE = /\{\{~?\s*role\b[^}]*\}\}/g;

export function parsePromptFile(source: string, slug: string): ParseResult {
  let frontmatter: unknown;
  let body: string;

  try {
    const parsed = matter(source, {
      engines: { yaml: (input: string) => parseYaml(input) },
    });
    frontmatter = parsed.data;
    body = parsed.content;
  } catch (caughtError: unknown) {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : `"${slug}" has invalid YAML frontmatter.`;
    return { success: false, error: { code: 'INVALID_FRONTMATTER', message } };
  }

  if (!isPlainObject(frontmatter)) {
    return {
      success: false,
      error: {
        code: 'INVALID_FRONTMATTER',
        message: `"${slug}"'s frontmatter must be a YAML object.`,
      },
    };
  }
  const fm = frontmatter as Record<string, unknown>;

  const name = requireString(fm, 'name', slug);
  if (!name.success) return name;

  const model = requireString(fm, 'model', slug);
  if (!model.success) return model;

  const input = parseSchemaField(fm.input, slug, 'input');
  if (!input.success) return input;

  const output = parseSchemaField(fm.output, slug, 'output');
  if (!output.success) return output;

  const inputVariableNames = input.value
    ? Object.keys(input.value.schema).map(bareVariableName)
    : [];

  const extension = parseExtension(fm, slug, inputVariableNames);
  if (!extension.success) return extension;

  const config = parseConfig(fm.config, slug);
  if (!config.success) return config;

  const messages = parseBody(body, slug);
  if (!messages.success) return messages;

  const description =
    typeof fm.description === 'string' ? fm.description : undefined;

  const file: PromptFile = {
    slug,
    name: name.value,
    ...(description !== undefined ? { description } : {}),
    model: model.value,
    ...(config.value !== undefined ? { config: config.value } : {}),
    ...(input.value !== undefined ? { input: input.value } : {}),
    ...(output.value !== undefined ? { output: output.value } : {}),
    ext: { promptmuster: extension.value },
    messages: messages.value,
  };

  return { success: true, file };
}

// --- frontmatter field helpers ---

// `typeof x === 'object'` alone is true for arrays too — every "must be an
// object" check in this file needs this, not the bare typeof/null check,
// or a YAML list where a mapping is expected silently passes through and
// produces a plausible-looking but wrong result further down (e.g.
// Object.keys() on an array yields index strings "0", "1", ... as if they
// were real field/variable names).
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Strips a Picoschema key down to its bare variable name — the `(array,
// description)` / `(object, ...)` / `(enum, ...)` modifier suffix and the
// trailing `?` optional-marker, per the real compiler's own key-splitting
// logic (google/dotprompt, js/src/picoschema.ts: `key.split('(')` then
// `name.endsWith('?')`). Needed so ext.promptmuster.variableKinds can be
// cross-checked against a variable that's declared with a modifier —
// without this, a variable like `topic(array, ...)` would never match a
// `variableKinds: { topic: ... }` entry naming it, and a valid file would
// be wrongly rejected as referencing an undeclared variable.
function bareVariableName(key: string): string {
  const base = key.split('(')[0];
  return base.endsWith('?') ? base.slice(0, -1) : base;
}

function requireString(
  fm: Record<string, unknown>,
  field: string,
  slug: string
): FieldResult<string> {
  const value = fm[field];
  if (typeof value !== 'string' || value.trim() === '') {
    return missingField(slug, field);
  }
  return { success: true, value };
}

function missingField<T>(slug: string, field: string): FieldResult<T> {
  return {
    success: false,
    error: {
      code: 'MISSING_REQUIRED_FIELD',
      message: `"${slug}" is missing required frontmatter field "${field}".`,
      field,
    },
  };
}

function invalidField<T>(
  slug: string,
  field: string,
  expected: string
): FieldResult<T> {
  return {
    success: false,
    error: {
      code: 'INVALID_FRONTMATTER',
      message: `"${slug}"'s "${field}" must be ${expected}.`,
    },
  };
}

function parseSchemaField(
  raw: unknown,
  slug: string,
  field: 'input' | 'output'
): FieldResult<{ readonly schema: PicoschemaDefinition } | undefined> {
  if (raw === undefined) return { success: true, value: undefined };
  if (!isPlainObject(raw)) {
    return invalidField(slug, field, 'an object');
  }
  const schema = raw.schema;
  if (!isPlainObject(schema)) {
    return invalidField(slug, `${field}.schema`, 'an object');
  }
  // Picoschema itself is not compiled/validated here — see prompt-file.ts's
  // own comment on PicoschemaDefinition; this stays the raw parsed shape
  // until the compiler exists (grammar ambiguities #3/#4 in the spike note).
  return { success: true, value: { schema: schema as PicoschemaDefinition } };
}

function parseConfig(
  raw: unknown,
  slug: string
): FieldResult<PromptFileConfig | undefined> {
  if (raw === undefined) return { success: true, value: undefined };
  if (!isPlainObject(raw)) {
    return invalidField(slug, 'config', 'an object');
  }
  const c = raw;

  if (c.temperature !== undefined && typeof c.temperature !== 'number') {
    return invalidField(slug, 'config.temperature', 'a number');
  }
  if (
    c.maxOutputTokens !== undefined &&
    typeof c.maxOutputTokens !== 'number'
  ) {
    return invalidField(slug, 'config.maxOutputTokens', 'a number');
  }
  if (c.topK !== undefined && typeof c.topK !== 'number') {
    return invalidField(slug, 'config.topK', 'a number');
  }
  if (c.topP !== undefined && typeof c.topP !== 'number') {
    return invalidField(slug, 'config.topP', 'a number');
  }
  if (
    c.stopSequences !== undefined &&
    (!Array.isArray(c.stopSequences) ||
      !c.stopSequences.every((s) => typeof s === 'string'))
  ) {
    return invalidField(slug, 'config.stopSequences', 'an array of strings');
  }

  return {
    success: true,
    value: {
      ...(c.temperature !== undefined
        ? { temperature: c.temperature as number }
        : {}),
      ...(c.maxOutputTokens !== undefined
        ? { maxOutputTokens: c.maxOutputTokens as number }
        : {}),
      ...(c.topK !== undefined ? { topK: c.topK as number } : {}),
      ...(c.topP !== undefined ? { topP: c.topP as number } : {}),
      ...(c.stopSequences !== undefined
        ? { stopSequences: c.stopSequences as readonly string[] }
        : {}),
    },
  };
}

// --- ext.promptmuster ---

function parseExtension(
  fm: Record<string, unknown>,
  slug: string,
  inputVariableNames: readonly string[]
): FieldResult<PromptMusterExtension> {
  const extRaw = fm.ext;
  const promptmuster = isPlainObject(extRaw) ? extRaw.promptmuster : undefined;

  if (!isPlainObject(promptmuster)) {
    // Deliberate: PromptMuster requires every file to carry ext.promptmuster
    // metadata today. Adopting a bare dotprompt file with no PromptMuster
    // extension at all isn't supported yet — revisit only once that's a
    // real, driving use case (see docs/core/completion-log.md).
    return missingField(slug, 'ext.promptmuster');
  }
  const raw = promptmuster;

  const version = raw.schemaVersion;
  if (version === undefined) {
    return missingField(slug, 'ext.promptmuster.schemaVersion');
  }
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    return invalidField(slug, 'ext.promptmuster.schemaVersion', 'an integer');
  }
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(version)) {
    return {
      success: false,
      error: {
        code: 'UNRECOGNIZED_SCHEMA_VERSION',
        message: `"${slug}" declares ext.promptmuster.schemaVersion ${version}, which this parser doesn't recognize (supported: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}).`,
        found: version,
        supported: SUPPORTED_SCHEMA_VERSIONS,
      },
    };
  }

  switch (version) {
    case 1:
      return parseExtensionV1(raw, slug, inputVariableNames);
    default:
      // Unreachable: already checked against SUPPORTED_SCHEMA_VERSIONS above.
      return invalidField(
        slug,
        'ext.promptmuster.schemaVersion',
        'a supported version'
      );
  }
}

function parseExtensionV1(
  raw: Record<string, unknown>,
  slug: string,
  inputVariableNames: readonly string[]
): FieldResult<PromptMusterExtension> {
  const category = raw.category;
  if (typeof category !== 'string' || category.trim() === '') {
    return missingField(slug, 'ext.promptmuster.category');
  }

  const tags = raw.tags;
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
    return invalidField(
      slug,
      'ext.promptmuster.tags',
      'an array of strings'
    );
  }

  const isFavorite = raw.isFavorite;
  if (typeof isFavorite !== 'boolean') {
    return missingField(slug, 'ext.promptmuster.isFavorite');
  }

  const variableKinds = parseVariableKinds(
    raw.variableKinds,
    slug,
    inputVariableNames
  );
  if (!variableKinds.success) return variableKinds;

  return {
    success: true,
    value: {
      schemaVersion: 1,
      category,
      tags,
      isFavorite,
      ...(variableKinds.value !== undefined
        ? { variableKinds: variableKinds.value }
        : {}),
    },
  };
}

function parseVariableKinds(
  raw: unknown,
  slug: string,
  inputVariableNames: readonly string[]
): FieldResult<Readonly<Record<string, VariableKind>> | undefined> {
  if (raw === undefined) return { success: true, value: undefined };
  if (!isPlainObject(raw)) {
    return invalidField(slug, 'ext.promptmuster.variableKinds', 'an object');
  }

  const result: Record<string, VariableKind> = {};
  for (const [variableName, kind] of Object.entries(raw)) {
    if (!inputVariableNames.includes(variableName)) {
      return {
        success: false,
        error: {
          code: 'INVALID_FRONTMATTER',
          message: `"${slug}"'s ext.promptmuster.variableKinds references "${variableName}", which isn't declared in input.schema.`,
        },
      };
    }
    if (!isVariableKind(kind)) {
      return invalidField(
        slug,
        `ext.promptmuster.variableKinds.${variableName}`,
        `one of: ${VARIABLE_KINDS.join(', ')}`
      );
    }
    result[variableName] = kind;
  }

  return { success: true, value: result };
}

function isVariableKind(value: unknown): value is VariableKind {
  return (
    typeof value === 'string' &&
    (VARIABLE_KINDS as readonly string[]).includes(value)
  );
}

// --- body / role-tagged messages ---

interface MessageSource {
  role: PromptRole;
  source: string;
}

function parseBody(
  body: string,
  slug: string
): FieldResult<readonly PromptMessage[]> {
  const malformed = findMalformedRoleMarker(body);
  if (malformed !== undefined) {
    return {
      success: false,
      error: {
        code: 'INVALID_BODY',
        message: `"${slug}" has a malformed role marker: ${JSON.stringify(malformed)}. Only exactly {{role "system"}}, {{role "user"}}, or {{role "assistant"}} (double-quoted, lowercase) are recognized — this parser never renders the body through Handlebars, so anything else would otherwise be silently absorbed as literal message content instead of a role boundary.`,
      },
    };
  }

  // Mirrors google/dotprompt's js/src/parse.ts `toMessages` exactly: content
  // before any {{role ...}} marker (or the whole body, if there are no
  // markers at all) defaults to 'user'; a marker encountered before any
  // content has accumulated relabels the still-empty current message
  // instead of starting a new, empty one. Verified against the real source
  // rather than assumed — see docs/core/completion-log.md.
  let current: MessageSource = { role: 'user', source: '' };
  const sources: MessageSource[] = [current];

  let lastIndex = 0;
  for (const match of body.matchAll(ROLE_MARKER)) {
    current.source += body.slice(lastIndex, match.index);

    const role = match[1] as PromptRole;
    if (current.source.trim() !== '') {
      current = { role, source: '' };
      sources.push(current);
    } else {
      current.role = role;
    }

    lastIndex = (match.index ?? 0) + match[0].length;
  }
  current.source += body.slice(lastIndex);

  const messages: PromptMessage[] = sources
    .map((s) => ({ role: s.role, content: s.source.trim() }))
    .filter((m) => m.content !== '');

  if (messages.length === 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_BODY',
        message: `"${slug}" has no message content in its body.`,
      },
    };
  }

  return { success: true, value: messages };
}

// Anything ROLE_MARKER_LOOSE matches that ROLE_MARKER doesn't match
// identically is a role-marker attempt this parser doesn't recognize —
// see ROLE_MARKER_LOOSE's own comment for why that's a real risk, not a
// pedantic one.
function findMalformedRoleMarker(body: string): string | undefined {
  const strictExact = new RegExp(`^(?:${ROLE_MARKER.source})$`);
  for (const match of body.matchAll(ROLE_MARKER_LOOSE)) {
    if (!strictExact.test(match[0])) {
      return match[0];
    }
  }
  return undefined;
}
