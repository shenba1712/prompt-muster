import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptManager } from './usePromptManager';
import { CreatePromptInput, UpdatePromptInput } from '@/types/prompt';

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  });
});

describe('usePromptManager', () => {
  describe('addPrompt', () => {
    it('increases the prompts array length', () => {
      const { result } = renderHook(() => usePromptManager());
      expect(result.current.prompts).toHaveLength(0);

      const input: CreatePromptInput = {
        title: 'Test Prompt',
        content: 'Test content',
        model: 'gpt-4o',
        category: 'testing',
        tags: ['test'],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      expect(result.current.prompts).toHaveLength(1);
    });

    it('creates a prompt with the right fields', () => {
      const { result } = renderHook(() => usePromptManager());

      const input: CreatePromptInput = {
        title: 'Code Review',
        content: 'Review this code',
        model: 'claude-sonnet',
        category: 'code-review',
        tags: ['review', 'quality'],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const prompt = result.current.prompts[0];
      expect(prompt.title).toBe(input.title);
      expect(prompt.content).toBe(input.content);
      expect(prompt.model).toBe(input.model);
      expect(prompt.category).toBe(input.category);
      expect(prompt.tags).toEqual(input.tags);
      expect(prompt.isFavorite).toBe(false);
      expect(prompt.id).toBeDefined();
      expect(prompt.createdAt).toBeInstanceOf(Date);
      expect(prompt.updatedAt).toBeInstanceOf(Date);
    });

    it('adds new prompts to the front of the array', () => {
      const { result } = renderHook(() => usePromptManager());
      const input1: CreatePromptInput = {
        title: 'First',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input2: CreatePromptInput = {
        title: 'Second',
        content: 'b',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input1);
      });
      const firstId = result.current.prompts[0].id;

      act(() => {
        result.current.addPrompt(input2);
      });

      expect(result.current.prompts[0].title).toBe('Second');
      expect(result.current.prompts[1].id).toBe(firstId);
    });
  });

  describe('updatePrompt', () => {
    it('is a no-op when updating non-existent prompt', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'A',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const originalLength = result.current.prompts.length;
      const originalPrompt = { ...result.current.prompts[0] };

      act(() => {
        result.current.updatePrompt('non-existent-id', { title: 'New' });
      });

      expect(result.current.prompts).toHaveLength(originalLength);
      expect(result.current.prompts[0]).toEqual(originalPrompt);
    });

    it('changes only the updated fields', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'Original Title',
        content: 'Original content',
        model: 'gpt-4o',
        category: 'testing',
        tags: ['original'],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const promptId = result.current.prompts[0].id;
      const originalCreatedAt = result.current.prompts[0].createdAt;
      const originalUpdatedAtTime =
        result.current.prompts[0].updatedAt.getTime();

      const updates: UpdatePromptInput = {
        title: 'Updated Title',
      };

      act(() => {
        result.current.updatePrompt(promptId, updates);
      });

      const updated = result.current.prompts[0];
      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Original content');
      expect(updated.model).toBe('gpt-4o');
      expect(updated.category).toBe('testing');
      expect(updated.tags).toEqual(['original']);
      expect(updated.createdAt).toEqual(originalCreatedAt);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAtTime
      );
    });

    it('updates multiple fields while preserving others', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'Original',
        content: 'Original content',
        model: 'gpt-4o',
        category: 'testing',
        tags: ['a', 'b'],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const promptId = result.current.prompts[0].id;
      const updates: UpdatePromptInput = {
        title: 'New Title',
        content: 'New content',
        tags: ['c', 'd'],
      };

      act(() => {
        result.current.updatePrompt(promptId, updates);
      });

      const updated = result.current.prompts[0];
      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('New content');
      expect(updated.tags).toEqual(['c', 'd']);
      expect(updated.model).toBe('gpt-4o');
      expect(updated.category).toBe('testing');
    });

    it('stacks multiple sequential updates correctly', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'Original',
        content: 'Original content',
        model: 'gpt-4o',
        category: 'testing',
        tags: ['a'],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const promptId = result.current.prompts[0].id;

      act(() => {
        result.current.updatePrompt(promptId, { title: 'Updated Title' });
      });

      act(() => {
        result.current.updatePrompt(promptId, { content: 'Updated content' });
      });

      act(() => {
        result.current.updatePrompt(promptId, { tags: ['b', 'c'] });
      });

      const final = result.current.prompts[0];
      expect(final.title).toBe('Updated Title');
      expect(final.content).toBe('Updated content');
      expect(final.tags).toEqual(['b', 'c']);
      expect(final.model).toBe('gpt-4o');
      expect(final.category).toBe('testing');
    });
  });

  describe('deletePrompt', () => {
    it('removes exactly one prompt by id', () => {
      const { result } = renderHook(() => usePromptManager());
      const input1: CreatePromptInput = {
        title: 'First',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input2: CreatePromptInput = {
        title: 'Second',
        content: 'b',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input3: CreatePromptInput = {
        title: 'Third',
        content: 'c',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input1);
        result.current.addPrompt(input2);
        result.current.addPrompt(input3);
      });

      const secondId = result.current.prompts[1].id;
      expect(result.current.prompts).toHaveLength(3);

      act(() => {
        result.current.deletePrompt(secondId);
      });

      expect(result.current.prompts).toHaveLength(2);
      expect(result.current.prompts.some((p) => p.id === secondId)).toBe(false);
    });

    it('decrements favoriteCount when deleting a favorite', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'Fav',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const promptId = result.current.prompts[0].id;

      act(() => {
        result.current.toggleFavorite(promptId);
      });

      expect(result.current.favoriteCount).toBe(1);

      act(() => {
        result.current.deletePrompt(promptId);
      });

      expect(result.current.favoriteCount).toBe(0);
    });

    it('is a no-op when deleting non-existent prompt', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'A',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const originalLength = result.current.prompts.length;

      act(() => {
        result.current.deletePrompt('non-existent-id');
      });

      expect(result.current.prompts).toHaveLength(originalLength);
    });
  });

  describe('toggleFavorite', () => {
    it('toggles isFavorite and updates favoriteCount', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'T',
        content: 'c',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const promptId = result.current.prompts[0].id;
      expect(result.current.prompts[0].isFavorite).toBe(false);
      expect(result.current.favoriteCount).toBe(0);

      act(() => {
        result.current.toggleFavorite(promptId);
      });

      expect(result.current.prompts[0].isFavorite).toBe(true);
      expect(result.current.favoriteCount).toBe(1);

      act(() => {
        result.current.toggleFavorite(promptId);
      });

      expect(result.current.prompts[0].isFavorite).toBe(false);
      expect(result.current.favoriteCount).toBe(0);
    });

    it('is a no-op when toggling non-existent prompt', () => {
      const { result } = renderHook(() => usePromptManager());
      const input: CreatePromptInput = {
        title: 'T',
        content: 'c',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input);
      });

      const originalPrompt = { ...result.current.prompts[0] };
      const originalCount = result.current.favoriteCount;

      act(() => {
        result.current.toggleFavorite('non-existent-id');
      });

      expect(result.current.prompts[0]).toEqual(originalPrompt);
      expect(result.current.favoriteCount).toBe(originalCount);
    });
  });

  describe('copyToClipboard', () => {
    it('writes content to clipboard', async () => {
      const { result } = renderHook(() => usePromptManager());
      const content = 'Clipboard test content';

      await act(async () => {
        await result.current.copyToClipboard(content);
      });

      expect(result.current.error).toBe(null);
    });

    it('sets error when clipboard write fails with Error', async () => {
      const { result } = renderHook(() => usePromptManager());

      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.reject(new Error('Clipboard denied')),
        },
      });

      await act(async () => {
        await result.current.copyToClipboard('test');
      });

      expect(result.current.error).toBe('Clipboard denied');
    });

    it('sets fallback error when clipboard rejects with non-Error object', async () => {
      const { result } = renderHook(() => usePromptManager());

      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.reject('String error'),
        },
      });

      await act(async () => {
        await result.current.copyToClipboard('test');
      });

      expect(result.current.error).toBe('Failed to copy prompt to clipboard.');
    });

    it('clears error on successful clipboard write after prior failure', async () => {
      const { result } = renderHook(() => usePromptManager());

      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.reject(new Error('First failure')),
        },
      });

      await act(async () => {
        await result.current.copyToClipboard('test');
      });

      expect(result.current.error).toBe('First failure');

      Object.assign(navigator, {
        clipboard: {
          writeText: () => Promise.resolve(),
        },
      });

      await act(async () => {
        await result.current.copyToClipboard('test');
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('filtering', () => {
    it('narrows filteredPrompts when model filter is set', () => {
      const { result } = renderHook(() => usePromptManager());
      const input1: CreatePromptInput = {
        title: 'A',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input2: CreatePromptInput = {
        title: 'B',
        content: 'b',
        model: 'claude-sonnet',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input1);
        result.current.addPrompt(input2);
      });

      expect(result.current.filteredPrompts).toHaveLength(2);

      act(() => {
        result.current.setFilter({ model: 'gpt-4o' });
      });

      expect(result.current.filteredPrompts).toHaveLength(1);
      expect(result.current.filteredPrompts[0].model).toBe('gpt-4o');
    });

    it('narrows filteredPrompts when search filter is set', () => {
      const { result } = renderHook(() => usePromptManager());
      const input1: CreatePromptInput = {
        title: 'Code Review',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input2: CreatePromptInput = {
        title: 'Unit Test',
        content: 'b',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input1);
        result.current.addPrompt(input2);
      });

      expect(result.current.filteredPrompts).toHaveLength(2);

      act(() => {
        result.current.setFilter({ search: 'Code' });
      });

      expect(result.current.filteredPrompts).toHaveLength(1);
      expect(result.current.filteredPrompts[0].title).toBe('Code Review');
    });

    it('clears filters and shows all prompts again', () => {
      const { result } = renderHook(() => usePromptManager());
      const input1: CreatePromptInput = {
        title: 'A',
        content: 'a',
        model: 'gpt-4o',
        category: 'testing',
        tags: [],
      };
      const input2: CreatePromptInput = {
        title: 'B',
        content: 'b',
        model: 'claude-sonnet',
        category: 'debugging',
        tags: [],
      };

      act(() => {
        result.current.addPrompt(input1);
        result.current.addPrompt(input2);
      });

      act(() => {
        result.current.setFilter({ model: 'gpt-4o', search: 'A' });
      });

      expect(result.current.filteredPrompts).toHaveLength(1);

      act(() => {
        result.current.setFilter({
          model: 'all',
          category: 'all',
          search: '',
          showFavorites: false,
        });
      });

      expect(result.current.filteredPrompts).toHaveLength(2);
    });
  });

  describe('filtering', () => {
    it('partial filter updates preserve existing filter state', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.addPrompt({
          title: 'A',
          content: 'a',
          model: 'gpt-4o',
          category: 'testing',
          tags: [],
        });
        result.current.addPrompt({
          title: 'B',
          content: 'b',
          model: 'claude-sonnet',
          category: 'debugging',
          tags: [],
        });
      });

      act(() => {
        result.current.setFilter({ model: 'gpt-4o' });
      });

      expect(result.current.filterState.model).toBe('gpt-4o');

      act(() => {
        result.current.setFilter({ search: 'A' });
      });

      expect(result.current.filterState.model).toBe('gpt-4o');
      expect(result.current.filterState.search).toBe('A');
      expect(result.current.filteredPrompts).toHaveLength(1);
      expect(result.current.filteredPrompts[0].title).toBe('A');
    });

    it('combines multiple filters with AND semantics', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.addPrompt({
          title: 'Code Review',
          content: 'Review this code',
          model: 'gpt-4o',
          category: 'code-review',
          tags: [],
        });
        result.current.addPrompt({
          title: 'Unit Tests',
          content: 'Write tests',
          model: 'gpt-4o',
          category: 'testing',
          tags: [],
        });
        result.current.addPrompt({
          title: 'Debug Guide',
          content: 'Debug code',
          model: 'claude-sonnet',
          category: 'debugging',
          tags: [],
        });
      });

      act(() => {
        result.current.toggleFavorite(
          result.current.prompts.find((p) => p.title === 'Code Review')!.id
        );
      });

      act(() => {
        result.current.setFilter({
          model: 'gpt-4o',
          category: 'code-review',
          search: 'Code',
          showFavorites: true,
        });
      });

      expect(result.current.filteredPrompts).toHaveLength(1);
      expect(result.current.filteredPrompts[0].title).toBe('Code Review');
    });
  });

  describe('seedPrompts', () => {
    it('loads seed data with correct count and structure', () => {
      const { result } = renderHook(() => usePromptManager());

      expect(result.current.prompts).toHaveLength(0);

      act(() => {
        result.current.seedPrompts();
      });

      expect(result.current.prompts).toHaveLength(5);
    });

    it('replaces existing prompts when called twice', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.seedPrompts();
      });

      const firstSeedIds = result.current.prompts.map((p) => p.id);
      expect(firstSeedIds).toHaveLength(5);

      act(() => {
        result.current.seedPrompts();
      });

      const secondSeedIds = result.current.prompts.map((p) => p.id);
      expect(secondSeedIds).toHaveLength(5);
      expect(secondSeedIds).not.toEqual(firstSeedIds);
    });

    it('seed data has all required fields', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.seedPrompts();
      });

      result.current.prompts.forEach((prompt) => {
        expect(prompt.id).toBeDefined();
        expect(prompt.title).toBeDefined();
        expect(prompt.content).toBeDefined();
        expect(prompt.model).toBeDefined();
        expect(prompt.category).toBeDefined();
        expect(prompt.tags).toBeDefined();
        expect(prompt.isFavorite).toBeDefined();
        expect(prompt.createdAt).toBeInstanceOf(Date);
        expect(prompt.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('seed data includes favorites', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.seedPrompts();
      });

      const favorites = result.current.prompts.filter((p) => p.isFavorite);
      expect(favorites.length).toBeGreaterThan(0);
      expect(result.current.favoriteCount).toBe(favorites.length);
    });

    it('seed data is fully filtered when filter is applied', () => {
      const { result } = renderHook(() => usePromptManager());

      act(() => {
        result.current.seedPrompts();
      });

      act(() => {
        result.current.setFilter({ model: 'claude-sonnet' });
      });

      const filtered = result.current.filteredPrompts;
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((prompt) => {
        expect(prompt.model).toBe('claude-sonnet');
      });
    });
  });
});
