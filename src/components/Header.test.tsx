import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

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
      screen.getByRole('button', { name: /^Theme: (system|light|dark)\./ })
    ).not.toBeNull();
  });
});
