export const MODEL_OPTIONS = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-sonnet',
    'claude-haiku',
    'gemini-pro',
    'gemini-flash',
] as const;

export type Model = typeof MODEL_OPTIONS[number];

export const CATEGORY_OPTIONS = [
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
] as const;

export type Category = typeof CATEGORY_OPTIONS[number];

export interface Prompt {
    id: string;
    title: string;
    content: string;
    model: Model;
    category: Category;
    tags: string[];
    isFavorite: boolean;
    createdAt: Date;
}

export type CreatePromptInput = Omit<Prompt, 'id' | 'createdAt' | 'isFavorite'>;

export interface FilterState {
    model: Model | 'all';
    category: Category | 'all';
    search: string;
    showFavorites: boolean;
}