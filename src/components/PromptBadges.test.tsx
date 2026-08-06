import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromptBadges from './PromptBadges';

describe('PromptBadges', () => {
  it('renders a ModelBadge with the model text and a category badge', () => {
    render(<PromptBadges model="gpt-4o" category="code-review" />);

    expect(screen.getByText('gpt-4o')).not.toBeNull();
    expect(screen.getByText('code-review')).not.toBeNull();
  });

  it('renders both badges for a different model/category pair', () => {
    render(<PromptBadges model="claude-sonnet" category="debugging" />);

    expect(screen.getByText('claude-sonnet')).not.toBeNull();
    expect(screen.getByText('debugging')).not.toBeNull();
  });
});
