import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';
import { THEME_COOKIE_NAME } from '@/lib/theme';

function getCookieValue(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  // jsdom has no "clear all cookies" API — expiring it is the way to reset.
  document.cookie = `${THEME_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
});

describe('ThemeToggle', () => {
  it('shows the light-mode state when the dark class is absent on mount', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).not.toBeNull();
  });

  it('shows the dark-mode state when the dark class is already present on mount', () => {
    document.documentElement.classList.add('dark');

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).not.toBeNull();
  });

  it('adds the dark class and writes the cookie on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).not.toBeNull();
  });

  it('removes the dark class and writes the cookie on a second click', async () => {
    document.documentElement.classList.add('dark');
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('light');
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).not.toBeNull();
  });
});
