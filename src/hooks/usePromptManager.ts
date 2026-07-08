import { useState } from 'react';
import { Prompt, Model, Category } from '@/types/prompt';

export interface UsePromptManagerReturn {
    prompts: Prompt[];
    promptCount: number;
    favoriteCount: number;
    copyError: string | null;
    addPrompt: (
        title: string,
        content: string,
        model: Model,
        category: Category,
        tags: string[]
    ) => void;
    deletePrompt: (id: string) => void;
    copyToClipboard: (content: string) => Promise<void>;
    toggleFavorite: (id: string) => void;
}

export function usePromptManager(): UsePromptManagerReturn {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [copyError, setCopyError] = useState<string | null>(null);

    const addPrompt = (
        title: string,
        content: string,
        model: Model,
        category: Category,
        tags: string[]
    ) => {
        const newPrompt: Prompt = {
            id: crypto.randomUUID(),
            title,
            content,
            model,
            category,
            tags,
            isFavorite: false,
            createdAt: new Date(),
        };
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
    };
}
