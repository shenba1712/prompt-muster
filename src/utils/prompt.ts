import { Category, CATEGORY_OPTIONS, CreatePromptInput, Model, MODEL_OPTIONS, Prompt } from '@/types/prompt';

export function createPrompt(input: CreatePromptInput): Prompt {
    return {
        ...input,
        id: crypto.randomUUID(),
        isFavorite: false,
        createdAt: new Date(),
    };
}

export function isModel(value: string): value is Model {
    return (MODEL_OPTIONS as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
    return (CATEGORY_OPTIONS as readonly string[]).includes(value);
}
