import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
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

  it('defaults keyboard focus to Cancel, not the destructive Delete button', async () => {
    // A reflexive second Enter after opening the dialog (habit from opening
    // it) must land on Cancel, not silently confirm an irreversible delete.
    const user = userEvent.setup();
    render(<DeleteConfirmDialog promptTitle="My Prompt" onConfirm={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');

    // Base UI moves initial focus in on a microtask/rAF after the popup
    // appears, not synchronously with it — findByRole resolving doesn't
    // guarantee that has flushed yet, so this must poll rather than assert
    // once (confirmed via an isolated scratch test before relying on this).
    await waitFor(() => {
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: 'Cancel' })
      );
    });
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

  it('traps focus inside the dialog instead of tabbing out to the page behind it', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Something before</button>
        <DeleteConfirmDialog promptTitle="My Prompt" onConfirm={vi.fn()} />
        <button type="button">Something after</button>
      </>
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');

    // Regardless of exactly where initial focus lands inside the dialog,
    // repeated Tab and Shift+Tab must never move focus onto "Something
    // before"/"Something after" (or anywhere else outside the dialog) — it
    // previously fell all the way through to <body> and then into the page.
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i += 1) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
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
