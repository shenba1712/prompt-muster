export type Model =
    | 'gpt-4o'
    | 'gpt-4o-mini'
    | 'claude-sonnet'
    | 'claude-haiku'
    | 'gemini-pro'
    | 'gemini-flash';

export type Category =
    | 'code-generation'
    | 'debugging'
    | 'code-review'
    | 'documentation'
    | 'refactoring'
    | 'testing'
    | 'architecture'
    | 'data-modeling'
    | 'devops'
    | 'learning'
    | 'communication';

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

export interface FilterState {
    model: Model | 'all';
    category: Category | 'all';
    search: string;
    showFavorites: boolean;
}