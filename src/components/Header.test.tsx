import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Header renders ThemeToggle, which reads matchMedia on mount — jsdom
// doesn't implement it at all, so any test rendering Header needs this
// stub regardless of what it's actually asserting.
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe('Header', () => {
  it('renders the PromptMuster heading', () => {
    render(<Header />);

    expect(
      screen.getByRole('heading', { name: 'PromptMuster' })
    ).not.toBeNull();
  });

  it('renders an "Add Prompt" link to /prompts/new', () => {
    render(<Header />);

    const link = screen.getByRole('link', { name: 'Add Prompt' });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/prompts/new');
  });

  it('renders the theme toggle button', () => {
    render(<Header />);

    expect(
      screen.getByRole('button', { name: /switch to (dark|light) mode/i })
    ).not.toBeNull();
  });
});
