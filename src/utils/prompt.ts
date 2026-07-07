import { Category, Model } from '@/types/prompt';

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
