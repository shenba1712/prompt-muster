'use client';

import { createContext, useContext, useState } from 'react';
import { CreatePromptInput, UpdatePromptInput, Prompt } from '@/types/prompt';
import { createPrompt } from '@/utils/prompt';

export interface UsePromptsReturn {
  prompts: Prompt[];
  promptCount: number;
  favoriteCount: number;
  error: string | null;
  addPrompt: (input: CreatePromptInput) => Prompt;
  updatePrompt: (id: string, updates: UpdatePromptInput) => void;
  deletePrompt: (id: string) => void;
  copyToClipboard: (content: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  seedPrompts: () => void; // test data
}

interface PromptProviderProps {
  readonly children: React.ReactNode;
}

const PromptContext = createContext<UsePromptsReturn | undefined>(
  undefined
);

export function usePrompts(): UsePromptsReturn {
  const context = useContext(PromptContext);

  if (context === undefined) {
    throw new Error('usePrompts must be used within a <PromptProvider>.');
  }

  return context;
}

export default function PromptProvider({ children }: PromptProviderProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addPrompt = (input: CreatePromptInput): Prompt => {
    const newPrompt = createPrompt(input);
    setPrompts((prev) => [newPrompt, ...prev]);
    return newPrompt;
  };

  const updatePrompt = (id: string, updates: UpdatePromptInput): void => {
    // updatedAt is set after the spread so it always wins over any stale value.
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    );
  };

  const deletePrompt = (id: string): void => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const copyToClipboard = async (content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setError(null);
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to copy prompt to clipboard.';
      setError(message);
    }
  };

  const toggleFavorite = (id: string): void => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // test data
  const seedPrompts = (): void => {
    const seeds: Prompt[] = [
      {
        ...createPrompt({
          title: 'Code Review',
          content:
            'Review this code for bugs, security issues, and performance problems. Focus on error handling and edge cases.',
          model: 'claude-sonnet',
          category: 'code-review',
          tags: ['review', 'quality'],
        }),
        isFavorite: true,
      },
      {
        ...createPrompt({
          title: 'Write Unit Tests',
          content:
            'Generate unit tests for the following function. Cover happy path, edge cases, and error scenarios.',
          model: 'gpt-4o',
          category: 'testing',
          tags: ['testing', 'automation'],
        }),
        isFavorite: true,
      },
      createPrompt({
        title: 'Debug Error',
        content:
          'Help me debug this error. Explain the root cause and suggest a fix with code examples.',
        model: 'gpt-4o-mini',
        category: 'debugging',
        tags: ['debug'],
      }),
      createPrompt({
        title: 'Architecture Review',
        content:
          'Review this architecture for scalability, maintainability, and operational concerns.',
        model: 'claude-sonnet',
        category: 'architecture',
        tags: ['architecture', 'design'],
      }),
      createPrompt({
        title: 'Generate API Docs',
        content:
          'Write API documentation for this endpoint including request/response examples and error codes.',
        model: 'gemini-pro',
        category: 'documentation',
        tags: ['docs', 'api'],
      }),
    ];
    setPrompts(seeds);
  };

  const promptCount = prompts.length;
  const favoriteCount = prompts.filter((p) => p.isFavorite).length;

  const value: UsePromptsReturn = {
    prompts,
    promptCount,
    favoriteCount,
    error,
    addPrompt,
    updatePrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    seedPrompts,
  };

  return (
    <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
  );
}
