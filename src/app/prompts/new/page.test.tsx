import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPromptPage from './page';
import PromptProvider from '@/context/PromptProvider';

// PromptForm's mount effect calls scrollIntoView, which jsdom doesn't
// implement.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockClear();
});

function renderPage() {
  return render(
    <PromptProvider>
      <NewPromptPage />
    </PromptProvider>
  );
}

describe('NewPromptPage', () => {
  it('creates a prompt on submit and navigates to its detail page', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Prompt title'), 'A New Prompt');
    await user.type(
      screen.getByLabelText('Prompt content'),
      'Some prompt content.'
    );

    await user.click(screen.getByRole('button', { name: 'Add Prompt' }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/prompts\/.+/)
    );
  });

  it('navigates to the prompts list when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/prompts');
  });
});
