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
  delete document.documentElement.dataset.theme;
  // jsdom has no "clear all cookies" API — expiring it is the way to reset.
  document.cookie = `${THEME_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
});

describe('ThemeToggle', () => {
  it('reports the system state when no explicit theme is set', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Theme: system. Switch to light.' })
    ).not.toBeNull();
  });

  it('reports the dark state when data-theme="dark" is already set on mount', () => {
    document.documentElement.dataset.theme = 'dark';

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Theme: dark. Switch to system.' })
    ).not.toBeNull();
  });

  it('reports the light state when data-theme="light" is already set on mount', () => {
    document.documentElement.dataset.theme = 'light';

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Theme: light. Switch to dark.' })
    ).not.toBeNull();
  });

  it('sets data-theme="light" and writes the cookie when leaving system', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Theme: system. Switch to light.' })
    );

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('light');
  });

  it('sets data-theme="dark" and writes the cookie on the next click', async () => {
    document.documentElement.dataset.theme = 'light';
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Theme: light. Switch to dark.' })
    );

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('dark');
  });

  // The point of the three-way control: returning to 'system' has to clear the
  // cookie, not store the word "system". Only an absent cookie lets the server
  // omit data-theme, which is what frees globals.css's prefers-color-scheme
  // layer to track the OS live instead of freezing a stale choice.
  it('removes data-theme and clears the cookie when returning to system', async () => {
    document.documentElement.dataset.theme = 'dark';
    document.cookie = `${THEME_COOKIE_NAME}=dark; path=/`;
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Theme: dark. Switch to system.' })
    );

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(getCookieValue(THEME_COOKIE_NAME)).toBeUndefined();
    expect(
      screen.getByRole('button', { name: 'Theme: system. Switch to light.' })
    ).not.toBeNull();
  });

  it('cycles system -> light -> dark -> system', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe('light');

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(getCookieValue(THEME_COOKIE_NAME)).toBeUndefined();
  });
});
