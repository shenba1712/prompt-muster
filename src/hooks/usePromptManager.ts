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

    const filteredPrompts = prompts
        .filter(p =>
            filterState.model === 'all' || p.model === filterState.model
        )
        .filter(p =>
            filterState.category === 'all' || p.category === filterState.category
        )
        .filter(p => !filterState.showFavorites || p.isFavorite)
        .filter(p =>
            filterState.search === '' ||
            p.title.toLowerCase().includes(
                filterState.search.toLowerCase()
            ) ||
            p.content.toLowerCase().includes(
                filterState.search.toLowerCase()
            )
        );

    const promptCount = prompts.length;
    const filteredPromptCount = filteredPrompts.length;
    const favoriteCount = prompts.filter(p => p.isFavorite).length;

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
        setFilter
    };
}
