import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmDialog from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  it('renders a "Delete" trigger and no dialog initially', () => {
    render(<DeleteConfirmDialog promptTitle="My Prompt" onConfirm={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeNull();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('opens the dialog with the specific prompt title when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmDialog promptTitle="My Prompt" onConfirm={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Delete "My Prompt"?')).not.toBeNull();
  });

  it('closes the dialog without confirming when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog promptTitle="My Prompt" onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('calls onConfirm exactly once and closes the dialog when the confirm Delete button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog promptTitle="My Prompt" onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');

    // Both the trigger and the confirm button are named "Delete", so scope
    // the query to the dialog to unambiguously get the confirm button.
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete',
    });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('closes the dialog without confirming when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmDialog promptTitle="My Prompt" onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole('alertdialog');

    await user.keyboard('{Escape}');

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
