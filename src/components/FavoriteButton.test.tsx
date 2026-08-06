import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoriteButton from './FavoriteButton';

describe('FavoriteButton', () => {
  it('shows "Add to favorites" and an unfilled star when not a favorite', () => {
    const { container } = render(
      <FavoriteButton isFavorite={false} onToggle={vi.fn()} />
    );

    expect(
      screen.getByRole('button', { name: 'Add to favorites' })
    ).not.toBeNull();
    expect(
      container.querySelector('svg')?.classList.contains('text-amber-500')
    ).toBe(false);
  });

  it('shows "Remove from favorites" and a filled star when a favorite', () => {
    const { container } = render(
      <FavoriteButton isFavorite={true} onToggle={vi.fn()} />
    );

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).not.toBeNull();
    expect(
      container.querySelector('svg')?.classList.contains('text-amber-500')
    ).toBe(true);
  });

  it('calls onToggle exactly once when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorite={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
