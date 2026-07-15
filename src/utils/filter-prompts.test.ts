import { describe, it, expect } from 'vitest';
import { filterPrompts } from './filter-prompts';
import { createPrompt } from './prompt';
import { FilterState, Prompt } from '@/types/prompt';

const baseFilterState: FilterState = {
    model: 'all',
    category: 'all',
    search: '',
    showFavorites: false,
};

const codeReview: Prompt = {
    ...createPrompt({
        title: 'Code Review',
        content: 'Review this code for bugs and security issues.',
        model: 'claude-sonnet',
        category: 'code-review',
        tags: ['review'],
    }),
    isFavorite: true,
};

const unitTests: Prompt = createPrompt({
    title: 'Write Unit Tests',
    content: 'Generate unit tests covering edge cases.',
    model: 'gpt-4o',
    category: 'testing',
    tags: ['testing'],
});

const debugError: Prompt = createPrompt({
    title: 'Debug Error',
    content: 'Help me debug this error with a code example.',
    model: 'gpt-4o-mini',
    category: 'debugging',
    tags: ['debug'],
});

const prompts = [codeReview, unitTests, debugError];

describe('filterPrompts', () => {
    it('returns all prompts when no filters are active', () => {
        expect(filterPrompts(prompts, baseFilterState)).toEqual(prompts);
    });

    it('returns an empty array when given no prompts', () => {
        expect(filterPrompts([], baseFilterState)).toEqual([]);
    });

    it('passes all prompts when model is "all"', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, model: 'all' });
        expect(result).toEqual(prompts);
    });

    it('filters by model', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, model: 'gpt-4o' });
        expect(result).toEqual([unitTests]);
    });

    it('passes all prompts when category is "all"', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, category: 'all' });
        expect(result).toEqual(prompts);
    });

    it('filters by category', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, category: 'debugging' });
        expect(result).toEqual([debugError]);
    });

    it('filters by showFavorites', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, showFavorites: true });
        expect(result).toEqual([codeReview]);
    });

    it('filters by search matching the title, case-insensitively', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, search: 'unit TESTS' });
        expect(result).toEqual([unitTests]);
    });

    it('filters by search matching the content', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, search: 'security issues' });
        expect(result).toEqual([codeReview]);
    });

    it('treats whitespace-only search as no filter', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, search: '   ' });
        expect(result).toEqual(prompts);
    });

    it('returns an empty array when search matches nothing', () => {
        const result = filterPrompts(prompts, { ...baseFilterState, search: 'no-match-anywhere' });
        expect(result).toEqual([]);
    });

    it('combines multiple filters with AND semantics', () => {
        const result = filterPrompts(prompts, {
            ...baseFilterState,
            category: 'code-review',
            showFavorites: true,
        });
        expect(result).toEqual([codeReview]);

        const noMatch = filterPrompts(prompts, {
            ...baseFilterState,
            category: 'testing',
            showFavorites: true,
        });
        expect(noMatch).toEqual([]);
    });
});
