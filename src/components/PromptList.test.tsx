import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromptList from './PromptList';
import { createPrompt } from '@/utils/prompt';
import { Prompt } from '@/types/prompt';

const promptA: Prompt = createPrompt({
  title: 'Code Review Helper',
  content: 'Review this code for bugs.',
  model: 'gpt-4o',
  category: 'code-review',
  tags: [],
});

const promptB: Prompt = createPrompt({
  title: 'Unit Test Generator',
  content: 'Generate unit tests covering edge cases.',
  model: 'claude-sonnet',
  category: 'testing',
  tags: [],
});

const noopHandlers = {
  onDelete: vi.fn(),
  onCopy: vi.fn(),
  onToggleFavorite: vi.fn(),
};

const DEFAULT_EMPTY_MESSAGE =
  'No prompts yet. Create your first prompt to get started.';
const FILTERED_EMPTY_MESSAGE = 'No prompts match your filters.';

describe('PromptList', () => {
  it('renders the default empty state when there are no prompts at all', () => {
    render(<PromptList prompts={[]} totalCount={0} {...noopHandlers} />);

    expect(screen.getByText(DEFAULT_EMPTY_MESSAGE)).not.toBeNull();
    expect(screen.queryByText(FILTERED_EMPTY_MESSAGE)).toBeNull();
  });

  it('renders the "no matches" empty state when prompts exist but are all filtered out', () => {
    render(<PromptList prompts={[]} totalCount={2} {...noopHandlers} />);

    expect(screen.getByText(FILTERED_EMPTY_MESSAGE)).not.toBeNull();
    expect(screen.queryByText(DEFAULT_EMPTY_MESSAGE)).toBeNull();
  });

  it('renders a PromptCard for each prompt and no empty state', () => {
    render(
      <PromptList
        prompts={[promptA, promptB]}
        totalCount={2}
        {...noopHandlers}
      />
    );

    expect(screen.getByText('Code Review Helper')).not.toBeNull();
    expect(screen.getByText('Unit Test Generator')).not.toBeNull();
    expect(screen.queryByText(DEFAULT_EMPTY_MESSAGE)).toBeNull();
    expect(screen.queryByText(FILTERED_EMPTY_MESSAGE)).toBeNull();
  });
});
