import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  });
});
