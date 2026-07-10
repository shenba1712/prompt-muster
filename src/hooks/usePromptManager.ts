import { useState } from 'react';
import { CreatePromptInput, Prompt, FilterState } from '@/types/prompt';
import { createPrompt } from '@/utils/prompt';

export interface UsePromptManagerReturn {
    prompts: Prompt[];
    filteredPrompts: Prompt[];
    promptCount: number;
    filteredPromptCount: number;
    favoriteCount: number;
    error: string | null;
    addPrompt: (input: CreatePromptInput) => void;
    deletePrompt: (id: string) => void;
    copyToClipboard: (content: string) => Promise<void>;
    toggleFavorite: (id: string) => void;
    filterState: FilterState;
    setFilter: (updates: Partial<FilterState>) => void;
    seedPrompts: () => void; // test data
}

export function usePromptManager(): UsePromptManagerReturn {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filterState, setFilterState] = useState<FilterState>({
        model: 'all',
        category: 'all',
        search: '',
        showFavorites: false,
    });

    const addPrompt = (input: CreatePromptInput) => {
        const newPrompt = createPrompt(input);
        setPrompts(prev => [newPrompt, ...prev]);
    };

    const deletePrompt = (id: string) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
    };

    const copyToClipboard = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setError(null);
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'Failed to copy prompt to clipboard.';
            setError(message);
        }
    };

    const toggleFavorite = (id: string) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    };

    const setFilter = (updates: Partial<FilterState>) => {
        setFilterState(prev => ({ ...prev, ...updates }));
    };

    const searchTerm = filterState.search.trim().toLowerCase();

    const filteredPrompts = prompts
        .filter(p =>
            filterState.model === 'all' || p.model === filterState.model
        )
        .filter(p =>
            filterState.category === 'all' || p.category === filterState.category
        )
        .filter(p => !filterState.showFavorites || p.isFavorite)
        .filter(p =>
            searchTerm === '' ||
            p.title.toLowerCase().includes(searchTerm) ||
            p.content.toLowerCase().includes(searchTerm)
        );

    const promptCount = prompts.length;
    const filteredPromptCount = filteredPrompts.length;
    const favoriteCount = prompts.filter(p => p.isFavorite).length;

    // test data
    const seedPrompts = () => {
        const seeds: Prompt[] = [
            {
                ...createPrompt({
                    title: 'Code Review',
                    content: 'Review this code for bugs, security issues, and performance problems. Focus on error handling and edge cases.',
                    model: 'claude-sonnet',
                    category: 'code-review',
                    tags: ['review', 'quality'],
                }),
                isFavorite: true,
            },
            {
                ...createPrompt({
                    title: 'Write Unit Tests',
                    content: 'Generate unit tests for the following function. Cover happy path, edge cases, and error scenarios.',
                    model: 'gpt-4o',
                    category: 'testing',
                    tags: ['testing', 'automation'],
                }),
                isFavorite: true,
            },
            createPrompt({
                title: 'Debug Error',
                content: 'Help me debug this error. Explain the root cause and suggest a fix with code examples.',
                model: 'gpt-4o-mini',
                category: 'debugging',
                tags: ['debug'],
            }),
            createPrompt({
                title: 'Architecture Review',
                content: 'Review this architecture for scalability, maintainability, and operational concerns.',
                model: 'claude-sonnet',
                category: 'architecture',
                tags: ['architecture', 'design'],
            }),
            createPrompt({
                title: 'Generate API Docs',
                content: 'Write API documentation for this endpoint including request/response examples and error codes.',
                model: 'gemini-pro',
                category: 'documentation',
                tags: ['docs', 'api'],
            }),
        ];
        setPrompts(seeds);
    };

    return {
        prompts,
        filteredPrompts,
        promptCount,
        filteredPromptCount,
        favoriteCount,
        error,
        addPrompt,
        deletePrompt,
        copyToClipboard,
        toggleFavorite,
        filterState,
        setFilter,
        seedPrompts
    };
}
