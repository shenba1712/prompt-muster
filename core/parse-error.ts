// Discriminated union, not an Error subclass. Stub shape for now — see
// ticket 08.3 for the parser that actually produces these; variants may
// grow once it exists and knows what actually fails in practice.

export interface UnrecognizedSchemaVersionError {
  readonly code: 'UNRECOGNIZED_SCHEMA_VERSION';
  readonly message: string;
  readonly found: number;
  readonly supported: readonly number[];
}

export interface InvalidFrontmatterError {
  readonly code: 'INVALID_FRONTMATTER';
  readonly message: string;
}

export interface MissingRequiredFieldError {
  readonly code: 'MISSING_REQUIRED_FIELD';
  readonly message: string;
  readonly field: string;
}

export interface InvalidBodyError {
  readonly code: 'INVALID_BODY';
  readonly message: string;
}

export type ParseError =
  | UnrecognizedSchemaVersionError
  | InvalidFrontmatterError
  | MissingRequiredFieldError
  | InvalidBodyError;
