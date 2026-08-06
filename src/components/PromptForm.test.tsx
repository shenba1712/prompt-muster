import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptForm from './PromptForm';
import {
  MODEL_OPTIONS,
  CATEGORY_OPTIONS,
  CreatePromptInput,
  Prompt,
} from '@/types/prompt';

// jsdom doesn't implement scrollIntoView; PromptForm calls it on mount to
// bring the form into view before focusing the title input. Polyfill it
// locally since no other component in this project needs it.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const samplePrompt: Prompt = {
  id: 'prompt-1',
  title: 'Existing Title',
  content: 'Existing content',
  model: 'claude-sonnet',
  category: 'debugging',
  tags: ['existing', 'tags'],
  isFavorite: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('PromptForm', () => {
  describe('validation', () => {
    it('shows an error and does not call onSave when title is empty', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt content'), 'Some content');
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      expect(screen.getByRole('alert')).not.toBeNull();
      expect(screen.getByRole('alert').textContent).toBe(
        'Title and content are required.'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('shows an error and does not call onSave when content is empty', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt title'), 'Some title');
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      expect(screen.getByRole('alert').textContent).toBe(
        'Title and content are required.'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with trimmed title/content and current model/category/tags when both are filled', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt title'), '  My Title  ');
      await user.type(
        screen.getByLabelText('Prompt content'),
        '  My content  '
      );
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved: CreatePromptInput = onSave.mock.calls[0][0];
      expect(saved.title).toBe('My Title');
      expect(saved.content).toBe('My content');
      expect(saved.model).toBe(MODEL_OPTIONS[0]);
      expect(saved.category).toBe(CATEGORY_OPTIONS[0]);
      expect(saved.tags).toEqual([]);
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('tag parsing', () => {
    it('dedupes tags case-insensitively, keeping the first-seen casing', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt title'), 'Title');
      await user.type(screen.getByLabelText('Prompt content'), 'Content');
      await user.type(
        screen.getByLabelText('Tags (comma-separated)'),
        'a, b, a, B'
      );
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved: CreatePromptInput = onSave.mock.calls[0][0];
      expect(saved.tags).toEqual(['a', 'b']);
    });

    it('trims whitespace and drops empty tag entries', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt title'), 'Title');
      await user.type(screen.getByLabelText('Prompt content'), 'Content');
      await user.type(
        screen.getByLabelText('Tags (comma-separated)'),
        '  foo ,, bar  ,'
      );
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      const saved: CreatePromptInput = onSave.mock.calls[0][0];
      expect(saved.tags).toEqual(['foo', 'bar']);
    });
  });

  describe('create mode', () => {
    it('renders empty fields with the default model/category', () => {
      render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />);

      expect(
        (screen.getByLabelText('Prompt title') as HTMLInputElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Prompt content') as HTMLTextAreaElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Tags (comma-separated)') as HTMLInputElement)
          .value
      ).toBe('');
      expect(screen.getByRole('button', { name: 'Add Prompt' })).not.toBeNull();
    });

    it('resets title/content/tags and model/category after a successful submit', async () => {
      const user = userEvent.setup();
      render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText('Prompt title'), 'Title');
      await user.type(screen.getByLabelText('Prompt content'), 'Content');
      await user.type(
        screen.getByLabelText('Tags (comma-separated)'),
        'tag1, tag2'
      );
      await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

      expect(
        (screen.getByLabelText('Prompt title') as HTMLInputElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Prompt content') as HTMLTextAreaElement).value
      ).toBe('');
      expect(
        (screen.getByLabelText('Tags (comma-separated)') as HTMLInputElement)
          .value
      ).toBe('');
      expect(
        screen.getByRole('combobox', { name: 'Model' }).textContent
      ).toContain(MODEL_OPTIONS[0]);
      expect(
        screen.getByRole('combobox', { name: 'Category' }).textContent
      ).toContain(CATEGORY_OPTIONS[0]);
    });
  });

  describe('edit mode', () => {
    it('pre-fills inputs with the prompt values', () => {
      render(
        <PromptForm prompt={samplePrompt} onSave={vi.fn()} onCancel={vi.fn()} />
      );

      expect(
        (screen.getByLabelText('Prompt title') as HTMLInputElement).value
      ).toBe(samplePrompt.title);
      expect(
        (screen.getByLabelText('Prompt content') as HTMLTextAreaElement).value
      ).toBe(samplePrompt.content);
      expect(
        (screen.getByLabelText('Tags (comma-separated)') as HTMLInputElement)
          .value
      ).toBe(samplePrompt.tags.join(', '));
      expect(
        screen.getByRole('combobox', { name: 'Model' }).textContent
      ).toContain(samplePrompt.model);
      expect(
        screen.getByRole('combobox', { name: 'Category' }).textContent
      ).toContain(samplePrompt.category);
      expect(
        screen.getByRole('button', { name: 'Save changes' })
      ).not.toBeNull();
    });

    it('calls onSave with the updated values on submit', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(
        <PromptForm prompt={samplePrompt} onSave={onSave} onCancel={vi.fn()} />
      );

      const titleInput = screen.getByLabelText('Prompt title');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved: CreatePromptInput = onSave.mock.calls[0][0];
      expect(saved.title).toBe('Updated Title');
      expect(saved.content).toBe(samplePrompt.content);
      expect(saved.model).toBe(samplePrompt.model);
      expect(saved.category).toBe(samplePrompt.category);
    });
  });

  describe('cancel', () => {
    it('calls onCancel and not onSave when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(<PromptForm onSave={onSave} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('initial focus', () => {
    it('focuses the title input on mount', () => {
      render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />);

      expect(document.activeElement).toBe(
        screen.getByLabelText('Prompt title')
      );
    });
  });
});
