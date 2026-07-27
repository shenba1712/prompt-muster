import {
  Category,
  CATEGORY_OPTIONS,
  CreatePromptInput,
  Model,
  MODEL_OPTIONS,
  Prompt,
} from '@/types/prompt';

export function createPrompt(input: CreatePromptInput): Prompt {
  return {
    ...input,
    id: crypto.randomUUID(),
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function isModel(value: string): value is Model {
  return (MODEL_OPTIONS as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (CATEGORY_OPTIONS as readonly string[]).includes(value);
}

export type Provider = 'openai' | 'anthropic' | 'other';

const OPENAI_MODELS: readonly Model[] = ['gpt-4o', 'gpt-4o-mini'];
const ANTHROPIC_MODELS: readonly Model[] = ['claude-sonnet', 'claude-haiku'];

// Only OpenAI/Anthropic have a validated filled badge color (design-system.md
// §2.1); every other provider renders outlined, so callers need the provider,
// not just the raw model string, to pick a badge variant.
export function getModelProvider(model: Model): Provider {
  if (OPENAI_MODELS.includes(model)) return 'openai';
  if (ANTHROPIC_MODELS.includes(model)) return 'anthropic';
  return 'other';
}
