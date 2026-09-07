import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { describe, it, expect } from 'vitest';
import { parsePromptFile } from './parse-prompt-file';

function readExample(filename: string): string {
  return readFileSync(
    resolve(__dirname, '..', 'examples', 'prompts', filename),
    'utf-8'
  );
}

function minimalSource(overrides: Partial<Record<string, string>> = {}): string {
  const frontmatter = `name: test-prompt
model: anthropic/claude-sonnet-5
input:
  schema:
    topic: string, The topic
ext:
  promptmuster:
    schemaVersion: 1
    category: testing
    tags: [a, b]
    isFavorite: false
`;
  return `---\n${overrides.frontmatter ?? frontmatter}---\n${
    overrides.body ?? '{{role "user"}}\nTell me about {{topic}}.\n'
  }`;
}

describe('parsePromptFile', () => {
  describe('real example files', () => {
    it('parses code-review.prompt.md exactly', () => {
      const result = parsePromptFile(
        readExample('code-review.prompt.md'),
        'code-review'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.file.slug).toBe('code-review');
      expect(result.file.name).toBe('code-review');
      expect(result.file.model).toBe('anthropic/claude-sonnet-5');
      expect(result.file.config).toEqual({ temperature: 0.3 });
      expect(result.file.output).toBeUndefined();
      expect(result.file.ext.promptmuster).toEqual({
        schemaVersion: 1,
        category: 'code-review',
        tags: ['review', 'quality'],
        isFavorite: true,
        variableKinds: { code: 'file' },
      });
      expect(result.file.messages).toEqual([
        {
          role: 'system',
          content:
            'You are a senior code reviewer. Focus on bugs, security issues, performance problems,\nerror handling, and edge cases.',
        },
        { role: 'user', content: 'Review this code:\n\n{{code}}' },
      ]);
    });

    it('parses debug-error.prompt.md', () => {
      const result = parsePromptFile(
        readExample('debug-error.prompt.md'),
        'debug-error'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.file.model).toBe('openai/gpt-5.6-luna');
      expect(result.file.ext.promptmuster.variableKinds).toEqual({
        error: 'textarea',
      });
      expect(result.file.messages).toHaveLength(2);
      expect(result.file.messages[0].role).toBe('system');
      expect(result.file.messages[1].role).toBe('user');
    });

    it('parses generate-api-docs.prompt.md, including an output.schema it does not compile', () => {
      const result = parsePromptFile(
        readExample('generate-api-docs.prompt.md'),
        'generate-api-docs'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.file.model).toBe('googleai/gemini-2.5-pro');
      // Picoschema stays a raw passthrough — no compilation attempted here.
      expect(result.file.output).toEqual({
        schema: {
          summary: 'string, One-sentence description of what the endpoint does',
          'parameters(array, Name and description of each request parameter)':
            'string',
          'responses(array, Example response shapes, one per relevant status code)':
            'string',
          'errorCodes(array, Error codes this endpoint can return and what each means)':
            'string',
        },
      });
    });
  });

  describe('round-trip readiness (08.4 will need this; not testing serialization itself)', () => {
    // 08.4 (the serializer, not built yet) needs parse -> serialize -> parse
    // to be a no-op. This doesn't test that — there's no serializer to test
    // against — it tests the half that's actually 08.3's responsibility
    // today: does the parser's output still contain everything a future
    // serializer would need, for each of the 3 real worked examples? Three
    // things specifically named as at-risk: the raw body text (never
    // interpolated, so it must survive character-for-character within each
    // message), the exact ext.promptmuster shape (every field, not just the
    // one or two a narrower test happened to check), and model provider
    // prefixes (a bare "gemini-2.5-pro" instead of "googleai/gemini-2.5-pro"
    // would silently lose the provider on the way back out).
    //
    // "real example files" above already does this exhaustively for
    // code-review.prompt.md; this fills the same exhaustiveness in for the
    // other two, which previously only got partial checks (a model string,
    // a message count) — exactly the kind of narrower check that would stay
    // green even if, say, a tag got dropped or a message's internal
    // whitespace got mangled.
    it('debug-error.prompt.md: full ext.promptmuster shape and exact message text survive', () => {
      const result = parsePromptFile(
        readExample('debug-error.prompt.md'),
        'debug-error'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.file.model).toBe('openai/gpt-5.6-luna');
      expect(result.file.description).toBe(
        'Help debug an error, explain the root cause, and suggest a fix'
      );
      expect(result.file.config).toEqual({ temperature: 0.4 });
      expect(result.file.input).toEqual({
        schema: {
          error: 'string, The error message or stack trace to debug',
        },
      });
      expect(result.file.ext.promptmuster).toEqual({
        schemaVersion: 1,
        category: 'debugging',
        tags: ['debug'],
        isFavorite: false,
        variableKinds: { error: 'textarea' },
      });
      expect(result.file.messages).toEqual([
        {
          role: 'system',
          content:
            'You are a debugging assistant. Explain the root cause and suggest a fix with code examples.',
        },
        {
          role: 'user',
          content: 'Help me debug this error:\n\n{{error}}',
        },
      ]);
    });

    it('generate-api-docs.prompt.md: full ext.promptmuster shape and exact message text survive', () => {
      const result = parsePromptFile(
        readExample('generate-api-docs.prompt.md'),
        'generate-api-docs'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.file.model).toBe('googleai/gemini-2.5-pro');
      expect(result.file.description).toBe(
        "Write API documentation for an endpoint, including request/response examples and error codes"
      );
      expect(result.file.config).toEqual({ temperature: 0.2 });
      expect(result.file.ext.promptmuster).toEqual({
        schemaVersion: 1,
        category: 'documentation',
        tags: ['docs', 'api'],
        isFavorite: false,
        variableKinds: { endpoint: 'file' },
      });
      expect(result.file.messages).toEqual([
        {
          role: 'system',
          content:
            'You are a technical writer producing API reference documentation. Include request/response\nexamples and error codes.',
        },
        {
          role: 'user',
          content: 'Write API documentation for this endpoint:\n\n{{endpoint}}',
        },
      ]);
    });

    it('every top-level frontmatter key present in each of the 3 examples maps to a populated PromptFile field — nothing silently dropped', () => {
      // A systematic check, not just hand-picked spot checks: parse each
      // real file's frontmatter independently (via gray-matter directly,
      // bypassing parsePromptFile) to get the raw key set actually written
      // in the file, then confirm parsePromptFile's output accounts for
      // every one of them somewhere.
      const FIELD_FOR_FRONTMATTER_KEY: Record<string, (f: ReturnType<typeof getFile>) => unknown> = {
        name: (f) => f.name,
        description: (f) => f.description,
        model: (f) => f.model,
        config: (f) => f.config,
        input: (f) => f.input,
        output: (f) => f.output,
        ext: (f) => f.ext.promptmuster,
      };

      function getFile(filename: string) {
        const result = parsePromptFile(readExample(filename), filename);
        if (!result.success) {
          throw new Error(`expected ${filename} to parse: ${result.error.message}`);
        }
        return result.file;
      }

      for (const filename of [
        'code-review.prompt.md',
        'debug-error.prompt.md',
        'generate-api-docs.prompt.md',
      ]) {
        const rawFrontmatter = matter(readExample(filename)).data as Record<
          string,
          unknown
        >;
        const file = getFile(filename);

        for (const rawKey of Object.keys(rawFrontmatter)) {
          const getField = FIELD_FOR_FRONTMATTER_KEY[rawKey];
          expect(
            getField,
            `${filename}: frontmatter key "${rawKey}" has no known PromptFile field mapping — round-trip readiness is untested for it`
          ).toBeDefined();
          expect(
            getField(file),
            `${filename}: frontmatter key "${rawKey}" was present in the source but ended up undefined on the parsed PromptFile`
          ).not.toBeUndefined();
        }

        // And the body: every message's content must be non-empty — an
        // empty string surviving through would mean the raw text was lost
        // between gray-matter's split and the role-marker splitter.
        for (const message of file.messages) {
          expect(message.content.length).toBeGreaterThan(0);
        }

        // The stronger, simpler version of the same guarantee: file.raw
        // mirrors dotprompt's own `raw` field (the complete, unprocessed
        // frontmatter) and should deep-equal exactly what gray-matter
        // parsed, independent of which fields this parser also gives a
        // typed home to elsewhere.
        expect(file.raw).toEqual(rawFrontmatter);
      }
    });

    it('captures input.default and output.format, which are real independent dotprompt fields this parser used to read right past', () => {
      // Neither example file uses these, so this is synthetic — but the
      // fields are real (verified against dotprompt's types.ts, not
      // assumed) and were previously silently dropped since the parser only
      // ever read .schema out of input/output.
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\ninput:\n  default:\n    topic: "kittens"\n  schema:\n    topic: string, The topic\noutput:\n  format: json\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.input).toEqual({
        default: { topic: 'kittens' },
        schema: { topic: 'string, The topic' },
      });
      expect(result.file.output).toEqual({ format: 'json' });
    });

    it('preserves a dotprompt-reserved field this parser gives no typed home to at all (tools, toolDefs, variant, version), via raw', () => {
      // Function-calling and prompt-variant support are real, later-phase
      // concerns (09.x+/execution) — 08.3 deliberately doesn't build typed
      // support for them. But per dotprompt's own "raw" field philosophy
      // ("if your implementation requires custom fields they will be
      // available here"), the data itself must not just vanish if present.
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\nvariant: formal\ntools: [webSearch]\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.raw.variant).toBe('formal');
      expect(result.file.raw.tools).toEqual(['webSearch']);
    });
  });

  describe('body / role-tagged messages', () => {
    it('splits multiple {{role ...}} markers into separate messages, leaving {{var}} unexpanded', () => {
      const result = parsePromptFile(minimalSource(), 'test');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.messages).toEqual([
        { role: 'user', content: 'Tell me about {{topic}}.' },
      ]);
    });

    it('treats a body with zero role markers as a single user message', () => {
      const result = parsePromptFile(
        minimalSource({ body: 'Just plain text, no role marker at all.\n' }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.messages).toEqual([
        { role: 'user', content: 'Just plain text, no role marker at all.' },
      ]);
    });

    it('relabels the still-empty first message instead of inserting an empty leading one when a marker opens the body', () => {
      const result = parsePromptFile(
        minimalSource({
          body: '{{role "system"}}\nSystem instructions.\n\n{{role "user"}}\nUser text.\n',
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      // Exactly 2 messages, not 3 with a stray empty leading one — verified
      // against google/dotprompt's real toMessages behavior.
      expect(result.file.messages).toEqual([
        { role: 'system', content: 'System instructions.' },
        { role: 'user', content: 'User text.' },
      ]);
    });

    it('assigns content before the first marker to the user role, per real dotprompt behavior', () => {
      const result = parsePromptFile(
        minimalSource({
          body: 'Leading preamble.\n\n{{role "system"}}\nSystem text.\n',
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.messages).toEqual([
        { role: 'user', content: 'Leading preamble.' },
        { role: 'system', content: 'System text.' },
      ]);
    });

    it('supports the assistant role for multi-turn few-shot bodies', () => {
      const result = parsePromptFile(
        minimalSource({
          body: '{{role "user"}}\nHi\n\n{{role "assistant"}}\nHello!\n\n{{role "user"}}\nHow are you?\n',
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.messages.map((m) => m.role)).toEqual([
        'user',
        'assistant',
        'user',
      ]);
    });

    it('rejects a body with no message content at all', () => {
      const result = parsePromptFile(minimalSource({ body: '   \n\n  ' }), 'test');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_BODY');
    });

    it('rejects a single-quoted {{role \'system\'}} marker instead of silently treating it as literal content', () => {
      // Valid Handlebars (single and double quotes are both legal string
      // literals), but this parser never renders the body — it only
      // recognizes the exact double-quoted form. Without this check, the
      // marker text would silently end up inside the message content
      // instead of creating a message boundary.
      const result = parsePromptFile(
        minimalSource({
          body: "{{role 'system'}}\nSystem text.\n\n{{role \"user\"}}\nUser text.\n",
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_BODY');
      expect(result.error.message).toContain("{{role 'system'}}");
    });

    it('rejects a {{role}} marker with no argument at all', () => {
      const result = parsePromptFile(
        minimalSource({ body: '{{role}}\nSome text.\n' }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_BODY');
    });

    it('rejects a wrong-case {{role "System"}} marker', () => {
      const result = parsePromptFile(
        minimalSource({ body: '{{role "System"}}\nSome text.\n' }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_BODY');
    });
  });

  describe('malformed input where an object is expected (not just missing)', () => {
    it('rejects frontmatter that is a YAML list instead of a mapping', () => {
      const result = parsePromptFile('---\n- a\n- b\n---\nBody text.\n', 'test');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
    });

    it('rejects input.schema being a YAML list instead of a mapping, rather than treating array indices as variable names', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\ninput:\n  schema:\n    - a\n    - b\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
    });

    it('rejects config being a YAML list instead of a mapping, rather than silently producing an empty config', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\nconfig:\n  - 0.3\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
    });
  });

  describe('variableKinds cross-check strips Picoschema key modifiers', () => {
    it('accepts a variableKinds entry for an input variable declared with a (array, ...) modifier', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\ninput:\n  schema:\n    'topics(array, the topics)': string\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n    variableKinds:\n      topics: select\n`,
          body: '{{role "user"}}\nTopics: {{topics}}\n',
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.ext.promptmuster.variableKinds).toEqual({
        topics: 'select',
      });
    });

    it('accepts a variableKinds entry for an optional input variable declared with a trailing "?"', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\ninput:\n  schema:\n    'topic?': string\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n    variableKinds:\n      topic: text\n`,
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.ext.promptmuster.variableKinds).toEqual({
        topic: 'text',
      });
    });
  });

  describe('required frontmatter fields', () => {
    it('rejects a file missing "name"', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `model: anthropic/claude-sonnet-5\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.error).toMatchObject({ field: 'name' });
    });

    it('rejects a file missing "model"', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.error).toMatchObject({ field: 'model' });
    });
  });

  describe('ext.promptmuster — required per the Q1 decision (no bare-dotprompt adoption yet)', () => {
    it('rejects a file with no "ext" block at all', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.error).toMatchObject({ field: 'ext.promptmuster' });
    });

    it('rejects a file with "ext" but no "promptmuster" key under it', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\next:\n  picoschema: {}\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('MISSING_REQUIRED_FIELD');
      expect(result.error).toMatchObject({ field: 'ext.promptmuster' });
    });

    it('rejects an unrecognized schemaVersion, naming what was found and what is supported', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\next:\n  promptmuster:\n    schemaVersion: 99\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toMatchObject({
        code: 'UNRECOGNIZED_SCHEMA_VERSION',
        found: 99,
        supported: [1],
      });
    });

    it('rejects schemaVersion 2 — the realistic next-version case, not just an arbitrary far-future one — without throwing or silently treating it as v1', () => {
      const source = minimalSource({
        frontmatter: `name: future-prompt\nmodel: anthropic/claude-sonnet-5\next:\n  promptmuster:\n    schemaVersion: 2\n    category: x\n    tags: []\n    isFavorite: false\n`,
      });

      // Contract per 08.1's spike: refuse to load, don't throw.
      expect(() => parsePromptFile(source, 'future-prompt')).not.toThrow();

      const result = parsePromptFile(source, 'future-prompt');

      // Not silently coerced to v1, not passed through as if it were valid —
      // this must be a failure result, not a PromptFile.
      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe('UNRECOGNIZED_SCHEMA_VERSION');
      if (result.error.code !== 'UNRECOGNIZED_SCHEMA_VERSION') return;

      expect(result.error.found).toBe(2);
      expect(result.error.supported).toEqual([1]);

      // "Error messages worth reading" per the ticket's own wording: the
      // message has to actually name the file, the version found, and the
      // version(s) expected — not a generic "invalid schema" string that
      // makes you go read the code to find out what actually went wrong.
      expect(result.error.message).toContain('future-prompt');
      expect(result.error.message).toContain('2');
      expect(result.error.message).toContain('1');
    });

    it('rejects variableKinds referencing a variable not declared in input.schema', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n    variableKinds:\n      nonexistent: file\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
      expect(result.error.message).toContain('nonexistent');
    });
  });

  describe('config', () => {
    it('rejects a non-numeric temperature', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\nconfig:\n  temperature: "hot"\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
    });

    it('preserves an unrecognized config key instead of rejecting or silently dropping it', () => {
      // Corrected 2026-08-10: dotprompt's own `config` type is Record<string,
      // any> ("not all models support all options") — verified against the
      // real types.ts, not assumed. A file using a provider-specific field
      // this parser doesn't validate the type of (e.g. OpenAI's
      // frequency_penalty) is a completely valid dotprompt file; rejecting
      // it would make this parser stricter than the format it's meant to be
      // compatible with. The five known fields still get real type
      // validation — see the next test.
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\nconfig:\n  temperature: 0.5\n  frequency_penalty: 0.2\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.file.config).toEqual({
        temperature: 0.5,
        frequency_penalty: 0.2,
      });
    });

    it('still validates the type of the fields it does know about, even with unrecognized keys also present', () => {
      const result = parsePromptFile(
        minimalSource({
          frontmatter: `name: test\nmodel: anthropic/claude-sonnet-5\nconfig:\n  temperature: "hot"\n  frequency_penalty: 0.2\next:\n  promptmuster:\n    schemaVersion: 1\n    category: x\n    tags: []\n    isFavorite: false\n`,
        }),
        'test'
      );
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_FRONTMATTER');
    });
  });
});
