import { describe, it, expect, beforeEach, vi } from 'vitest';
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

// jsdom doesn't implement matchMedia at all — this stubs it so tests can
// control what "the OS prefers dark" resolves to for the no-explicit-choice
// fallback path.
function stubPrefersColorScheme(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' && prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  delete document.documentElement.dataset.theme;
  // jsdom has no "clear all cookies" API — expiring it is the way to reset.
  document.cookie = `${THEME_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  stubPrefersColorScheme(false);
});

describe('ThemeToggle', () => {
  it('shows the light-mode state when no explicit theme is set and the OS prefers light', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).not.toBeNull();
  });

  it('shows the dark-mode state when no explicit theme is set but the OS prefers dark', () => {
    stubPrefersColorScheme(true);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).not.toBeNull();
  });

  it('shows the dark-mode state when data-theme="dark" is already set on mount, regardless of OS', () => {
    document.documentElement.dataset.theme = 'dark';
    stubPrefersColorScheme(false);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).not.toBeNull();
  });

  it('shows the light-mode state when data-theme="light" is already set on mount, even if the OS prefers dark', () => {
    document.documentElement.dataset.theme = 'light';
    stubPrefersColorScheme(true);

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).not.toBeNull();
  });

  it('sets data-theme="dark" and writes the cookie on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    );

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light mode' })
    ).not.toBeNull();
  });

  it('sets data-theme="light" and writes the cookie on a second click', async () => {
    document.documentElement.dataset.theme = 'dark';
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Switch to light mode' })
    );

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('light');
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' })
    ).not.toBeNull();
  });
});
