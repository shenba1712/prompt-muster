import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptsPage from './page';
import PromptProvider from '@/context/PromptProvider';

let mockSearchParams = new URLSearchParams();
const replaceMock = vi.fn();

// No `push` on this mock, deliberately — filtering must go through
// `replace()`. If the page ever called `router.push`, that call would throw
// "push is not a function" and fail the test, rather than silently passing.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/prompts',
  useSearchParams: () => mockSearchParams,
}));

// userEvent.setup() (used below) redefines navigator.clipboard as a
// getter-only accessor for its own clipboard stub, so a later plain
// assignment (Object.assign) would throw "which has only a getter" once a
// test has called it. Object.defineProperty overwrites the accessor
// directly instead of going through property assignment, and stays
// configurable so a later test/userEvent.setup() can redefine it again.
function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  stubClipboard(() => Promise.resolve());
  mockSearchParams = new URLSearchParams();
  replaceMock.mockClear();
});

function renderPage() {
  return render(
    <PromptProvider>
      <PromptsPage />
    </PromptProvider>
  );
}

describe('PromptsPage', () => {
  it('renders the "Load Sample Data" button outside production', () => {
    // The button is gated on process.env.NODE_ENV !== 'production'; vitest
    // runs with NODE_ENV=test, so the button is expected to render here. The
    // production-hidden branch was verified manually via an actual
    // production build, not via a per-test env flip (unreliable, since the
    // check may be evaluated at module-load time depending on bundling).
    expect(process.env.NODE_ENV).not.toBe('production');
    renderPage();

    expect(
      screen.getByRole('button', { name: 'Load Sample Data' })
    ).not.toBeNull();
  });

  it('populates the list when "Load Sample Data" is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText('Showing 0 of 0 prompts.')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Load Sample Data' }));

    expect(screen.getByText('Showing 5 of 5 prompts.')).not.toBeNull();
    expect(screen.getByText('Code Review')).not.toBeNull();
  });

  it('renders an error banner when copying to the clipboard fails', async () => {
    const user = userEvent.setup();
    stubClipboard(() => Promise.reject(new Error('Clipboard denied')));

    renderPage();
    await user.click(screen.getByRole('button', { name: 'Load Sample Data' }));

    const copyButtons = screen.getAllByRole('button', { name: 'Copy' });
    await user.click(copyButtons[0]);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Clipboard denied');
  });

  describe('filters as URL state', () => {
    it('reads the model filter from the URL on load', async () => {
      mockSearchParams = new URLSearchParams('model=gpt-4o');
      const user = userEvent.setup();
      renderPage();

      await user.click(
        screen.getByRole('button', { name: 'Load Sample Data' })
      );

      expect(screen.getByText('Showing 1 of 5 prompts.')).not.toBeNull();
      expect(screen.getByText('Write Unit Tests')).not.toBeNull();
      expect(screen.queryByText('Code Review')).toBeNull();
    });

    it('calls router.replace with the new filter, not push', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Favorites/ }));

      expect(replaceMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith('/prompts?favorites=true');
    });

    it('omits the param entirely when a filter returns to its default, instead of storing an empty/false value', async () => {
      mockSearchParams = new URLSearchParams('favorites=true');
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: /Favorites/ }));

      expect(replaceMock).toHaveBeenCalledWith('/prompts');
    });

    it('removes every param when "Clear filters" is clicked', async () => {
      mockSearchParams = new URLSearchParams('model=gpt-4o&search=foo');
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(replaceMock).toHaveBeenCalledWith('/prompts');
    });
  });
});
