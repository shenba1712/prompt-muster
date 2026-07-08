import { Category, Model, Prompt } from '@/types/prompt';

export type CreatePromptInput = Omit<Prompt, 'id' | 'createdAt' | 'isFavorite'>;

export function createPrompt(input: CreatePromptInput): Prompt {
    return {
        ...input,
        id: crypto.randomUUID(),
        isFavorite: false,
        createdAt: new Date(),
    };
}

export const MODEL_OPTIONS: readonly Model[] = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-sonnet',
    'claude-haiku',
    'gemini-pro',
    'gemini-flash',
];

export const CATEGORY_OPTIONS: readonly Category[] = [
    'code-generation',
    'debugging',
    'code-review',
    'documentation',
    'refactoring',
    'testing',
    'architecture',
    'data-modeling',
    'devops',
    'learning',
    'communication',
];
