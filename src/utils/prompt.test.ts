import { describe, it, expect } from 'vitest';
import { createPrompt, isModel, isCategory } from './prompt';
import { MODEL_OPTIONS, CATEGORY_OPTIONS } from '@/types/prompt';

describe('createPrompt', () => {
  it('generates a unique id', () => {
    const a = createPrompt({
      title: 'A',
      content: 'x',
      model: 'gpt-4o',
      category: 'testing',
      tags: [],
    });
    const b = createPrompt({
      title: 'B',
      content: 'y',
      model: 'gpt-4o',
      category: 'testing',
      tags: [],
    });
    expect(a.id).not.toBe(b.id);
  });

  it('defaults isFavorite to false', () => {
    const prompt = createPrompt({
      title: 'A',
      content: 'x',
      model: 'gpt-4o',
      category: 'testing',
      tags: [],
    });
    expect(prompt.isFavorite).toBe(false);
  });

  it('sets createdAt and updatedAt to a Date instance', () => {
    const prompt = createPrompt({
      title: 'A',
      content: 'x',
      model: 'gpt-4o',
      category: 'testing',
      tags: [],
    });
    expect(prompt.createdAt).toBeInstanceOf(Date);
    expect(prompt.updatedAt).toBeInstanceOf(Date);
  });

  it('preserves all input fields', () => {
    const input = {
      title: 'A',
      content: 'x',
      model: 'gpt-4o' as const,
      category: 'testing' as const,
      tags: ['t1'],
    };
    const prompt = createPrompt(input);
    expect(prompt.title).toBe(input.title);
    expect(prompt.content).toBe(input.content);
    expect(prompt.model).toBe(input.model);
    expect(prompt.category).toBe(input.category);
    expect(prompt.tags).toEqual(input.tags);
  });
});

describe('isModel', () => {
  it.each(MODEL_OPTIONS)('returns true for valid model %s', (model) => {
    expect(isModel(model)).toBe(true);
  });

  it('returns false for an invalid model string', () => {
    expect(isModel('not-a-model')).toBe(false);
  });

  it('returns false for a near-miss casing', () => {
    expect(isModel('GPT-4o')).toBe(false);
  });
});

describe('isCategory', () => {
  it.each(CATEGORY_OPTIONS)(
    'returns true for valid category %s',
    (category) => {
      expect(isCategory(category)).toBe(true);
    }
  );

  it('returns false for an invalid category string', () => {
    expect(isCategory('not-a-category')).toBe(false);
  });

  it('returns false for a near-miss casing', () => {
    expect(isCategory('Code-Generation')).toBe(false);
  });
});
