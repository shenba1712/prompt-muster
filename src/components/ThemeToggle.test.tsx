import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
      screen.getByRole('button', { name: 'Theme: system. Open theme menu.' })
    ).not.toBeNull();
  });

  it('reports the dark state when data-theme="dark" is already set on mount', () => {
    document.documentElement.dataset.theme = 'dark';

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Theme: dark. Open theme menu.' })
    ).not.toBeNull();
  });

  it('reports the light state when data-theme="light" is already set on mount', () => {
    document.documentElement.dataset.theme = 'light';

    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Theme: light. Open theme menu.' })
    ).not.toBeNull();
  });

  it('opens a menu listing all three themes when clicked, none applied yet', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    const menu = await screen.findByRole('menu');
    expect(
      within(menu).getByRole('menuitemradio', { name: /light/i })
    ).not.toBeNull();
    expect(
      within(menu).getByRole('menuitemradio', { name: /dark/i })
    ).not.toBeNull();
    expect(
      within(menu).getByRole('menuitemradio', { name: /system/i })
    ).not.toBeNull();
    // Opening the menu is just browsing — no theme change until a row is picked.
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('marks the currently active theme as checked in the menu', async () => {
    document.documentElement.dataset.theme = 'dark';
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');

    expect(
      within(menu)
        .getByRole('menuitemradio', { name: /dark/i })
        .getAttribute('aria-checked')
    ).toBe('true');
    expect(
      within(menu)
        .getByRole('menuitemradio', { name: /light/i })
        .getAttribute('aria-checked')
    ).toBe('false');
  });

  it('sets data-theme="light" and writes the cookie when picking Light directly', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    await user.click(within(menu).getByRole('menuitemradio', { name: /light/i }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('light');
  });

  it('sets data-theme="dark" and writes the cookie when picking Dark directly from System, in one click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    await user.click(within(menu).getByRole('menuitemradio', { name: /dark/i }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(getCookieValue(THEME_COOKIE_NAME)).toBe('dark');
  });

  // The point of the three-way control: returning to 'system' has to clear the
  // cookie, not store the word "system". Only an absent cookie lets the server
  // omit data-theme, which is what frees globals.css's prefers-color-scheme
  // layer to track the OS live instead of freezing a stale choice.
  it('removes data-theme and clears the cookie when picking System', async () => {
    document.documentElement.dataset.theme = 'dark';
    document.cookie = `${THEME_COOKIE_NAME}=dark; path=/`;
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    await user.click(
      within(menu).getByRole('menuitemradio', { name: /system/i })
    );

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(getCookieValue(THEME_COOKIE_NAME)).toBeUndefined();
    expect(
      screen.getByRole('button', { name: 'Theme: system. Open theme menu.' })
    ).not.toBeNull();
  });

  it('closes the menu after picking a theme', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    await user.click(within(menu).getByRole('menuitemradio', { name: /dark/i }));

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes without changing the theme when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  it('can jump directly from system to dark in a single click, not two', async () => {
    // The whole point of replacing the old cycle-through-states button: no
    // more clicking twice (system -> light -> dark) to reach a state that
    // isn't adjacent in the old cycle order.
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    const menu = await screen.findByRole('menu');
    await user.click(within(menu).getByRole('menuitemradio', { name: /dark/i }));

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
