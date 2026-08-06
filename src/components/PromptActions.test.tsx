import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptActions from './PromptActions';

describe('PromptActions', () => {
  it('renders an Edit link pointing to the prompt edit route', () => {
    render(
      <PromptActions
        promptId="prompt-1"
        promptTitle="My Prompt"
        content="Some content"
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const editLink = screen.getByRole('link', { name: 'Edit' });
    expect(editLink.getAttribute('href')).toBe('/prompts/prompt-1/edit');
  });

  it('calls onCopy with the exact content and shows "Copied!" after clicking Copy', async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <PromptActions
        promptId="prompt-1"
        promptTitle="My Prompt"
        content="Some content"
        onCopy={onCopy}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledWith('Some content');
    expect(screen.getByRole('button', { name: 'Copied!' })).not.toBeNull();

    // The "Copied!" label reverts to "Copy" after 1500ms via setTimeout.
    // Testing that revert would require vi.useFakeTimers(), which conflicts
    // with @testing-library/user-event v14's own timer usage for the click
    // above, so the revert itself is left uncovered here.
  });

  it('calls onDelete with the exact promptId when the delete flow is confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <PromptActions
        promptId="prompt-1"
        promptTitle="My Prompt"
        content="Some content"
        onCopy={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');

    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('prompt-1');
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
