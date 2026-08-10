import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptCard from './PromptCard';
import { createPrompt } from '@/utils/prompt';
import { Prompt } from '@/types/prompt';

function buildPrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    ...createPrompt({
      title: 'Code Review Helper',
      content: 'Review this code for bugs and style issues.',
      model: 'claude-sonnet',
      category: 'code-review',
      tags: ['review', 'quality'],
    }),
    ...overrides,
  };
}

describe('PromptCard', () => {
  it('renders the title as a link to the prompt detail page', () => {
    const prompt = buildPrompt();
    render(
      <PromptCard
        prompt={prompt}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    const link = screen.getByRole('link', { name: prompt.title });
    expect(link.getAttribute('href')).toBe(`/prompts/${prompt.id}`);
  });

  it('gives the card a visible focus-visible ring on its stretched-link click target', () => {
    // jsdom doesn't apply real CSS, so this checks the ring utility classes
    // are present rather than a computed style — previously there were none
    // at all, unlike every other interactive element in the app.
    const prompt = buildPrompt();
    render(
      <PromptCard
        prompt={prompt}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    const link = screen.getByRole('link', { name: prompt.title });
    expect(link.className).toMatch(/focus-visible:after:ring-1/);
  });

  it('renders the model badge, category badge, and tags', () => {
    const prompt = buildPrompt({ tags: ['review', 'quality'] });
    render(
      <PromptCard
        prompt={prompt}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText(prompt.model)).not.toBeNull();
    expect(screen.getByText(prompt.category)).not.toBeNull();
    expect(screen.getByText('review')).not.toBeNull();
    expect(screen.getByText('quality')).not.toBeNull();
  });

  describe('content preview truncation', () => {
    it('truncates content longer than 120 characters to 120 chars + "..."', () => {
      const longContent = 'a'.repeat(150);
      const prompt = buildPrompt({ content: longContent });
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      );

      const expectedPreview = `${'a'.repeat(120)}...`;
      const preview = screen.getByText(expectedPreview);
      expect(preview.textContent).toHaveLength(123);
      expect(screen.queryByText(longContent)).toBeNull();
    });

    it('renders content exactly at the 120 character limit in full, unmodified', () => {
      const exactContent = 'b'.repeat(120);
      const prompt = buildPrompt({ content: exactContent });
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      );

      const preview = screen.getByText(exactContent);
      expect(preview.textContent).toHaveLength(120);
      expect(preview.textContent?.endsWith('...')).toBe(false);
    });

    it('renders content under the 120 character limit in full, unmodified', () => {
      const shortContent = 'Short prompt content.';
      const prompt = buildPrompt({ content: shortContent });
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      );

      const preview = screen.getByText(shortContent);
      expect(preview.textContent).toHaveLength(shortContent.length);
      expect(preview.textContent?.endsWith('...')).toBe(false);
    });
  });

  describe('favorite button', () => {
    it('shows "Add to favorites" when the prompt is not a favorite', () => {
      const prompt = buildPrompt({ isFavorite: false });
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Add to favorites' })
      ).not.toBeNull();
    });

    it('shows "Remove from favorites" when the prompt is a favorite', () => {
      const prompt = buildPrompt({ isFavorite: true });
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Remove from favorites' })
      ).not.toBeNull();
    });

    it('calls onToggleFavorite with the prompt id when clicked', async () => {
      const user = userEvent.setup();
      const prompt = buildPrompt({ isFavorite: false });
      const onToggleFavorite = vi.fn();
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={vi.fn()}
          onToggleFavorite={onToggleFavorite}
        />
      );

      await user.click(
        screen.getByRole('button', { name: 'Add to favorites' })
      );

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(onToggleFavorite).toHaveBeenCalledWith(prompt.id);
    });
  });

  describe('copy action', () => {
    it('calls onCopy with the prompt content when the Copy button is clicked', async () => {
      const user = userEvent.setup();
      const prompt = buildPrompt();
      const onCopy = vi.fn();
      render(
        <PromptCard
          prompt={prompt}
          onDelete={vi.fn()}
          onCopy={onCopy}
          onToggleFavorite={vi.fn()}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Copy' }));

      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(onCopy).toHaveBeenCalledWith(prompt.content);
    });
  });
});
