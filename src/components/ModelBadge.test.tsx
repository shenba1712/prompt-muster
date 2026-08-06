import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModelBadge from './ModelBadge';

describe('ModelBadge', () => {
  // Provider decides the badge treatment, not the model string (design-
  // system.md §2.1): only OpenAI/Anthropic have a validated filled color,
  // everything else renders outlined. `Badge`'s variant classes are the
  // only observable proxy for that decision from the rendered DOM.
  it.each([
    { model: 'gpt-4o', provider: 'openai', className: 'text-openai' },
    {
      model: 'claude-sonnet',
      provider: 'anthropic',
      className: 'text-anthropic',
    },
    {
      model: 'gemini-pro',
      provider: 'other',
      className: 'text-muted-foreground',
    },
  ] as const)(
    'renders the model name and the $provider variant class for $model',
    ({ model, className }) => {
      render(<ModelBadge model={model} />);

      const badge = screen.getByText(model);
      expect(badge.className).toContain(className);
    }
  );
});
