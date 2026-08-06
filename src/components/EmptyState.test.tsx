import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders the default message when no message prop is given', () => {
    render(<EmptyState />);

    expect(
      screen.getByText(
        'No prompts yet. Create your first prompt to get started.'
      )
    ).not.toBeNull();
  });

  it('renders a custom message when one is passed', () => {
    render(<EmptyState message="No results match your filters." />);

    expect(screen.getByText('No results match your filters.')).not.toBeNull();
    expect(
      screen.queryByText(
        'No prompts yet. Create your first prompt to get started.'
      )
    ).toBeNull();
  });
});
