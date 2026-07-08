import { useState } from 'react';
import { CreatePromptInput, Prompt, FilterState } from '@/types/prompt';
import { createPrompt } from '@/utils/prompt';

export interface UsePromptManagerReturn {
    prompts: Prompt[];
    promptCount: number;
    favoriteCount: number;
    copyError: string | null;
    addPrompt: (input: CreatePromptInput) => void;
    deletePrompt: (id: string) => void;
    copyToClipboard: (content: string) => Promise<void>;
    toggleFavorite: (id: string) => void;
    filterState: FilterState;
    setFilter: (updates: Partial<FilterState>) => void;
}

export function usePromptManager(): UsePromptManagerReturn {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [copyError, setCopyError] = useState<string | null>(null);
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
            setCopyError(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to copy prompt to clipboard.';
            setCopyError(message);
        }
    };

    const toggleFavorite = (id: string) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    };

    const setFilter = (updates: Partial<FilterState>) => {
        setFilterState(prev => ({ ...prev, ...updates }));
    };

    const promptCount = prompts.length;
    const favoriteCount = prompts.filter(p => p.isFavorite).length;

    return {
        prompts,
        promptCount,
        favoriteCount,
        copyError,
        addPrompt,
        deletePrompt,
        copyToClipboard,
        toggleFavorite,
        filterState,
        setFilter
    };
}
