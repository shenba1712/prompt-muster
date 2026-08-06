import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromptTags from './PromptTags';

describe('PromptTags', () => {
  it('renders one badge per tag when tags is non-empty', () => {
    render(<PromptTags tags={['react', 'typescript']} />);

    expect(screen.getByText('react')).not.toBeNull();
    expect(screen.getByText('typescript')).not.toBeNull();
  });

  it('renders nothing when tags is empty', () => {
    const { container } = render(<PromptTags tags={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
