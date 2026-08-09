import {
  act,
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptDetailPage from './page';
import PromptProvider, { usePrompts } from '@/context/PromptProvider';
import { CreatePromptInput } from '@/types/prompt';

const pushMock = vi.fn();
const notFoundMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  // The real notFound() throws a special digest error that halts rendering
  // and is caught by Next's own boundary — a no-op mock would let the
  // component keep running past it and crash on the next line instead.
  notFound: () => {
    notFoundMock();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

beforeEach(() => {
  pushMock.mockClear();
  notFoundMock.mockClear();
});

const testPrompt: CreatePromptInput = {
  title: 'Code Review',
  content: 'Review this code for bugs.',
  model: 'claude-sonnet',
  category: 'code-review',
  tags: ['review', 'quality'],
};

// The page takes params as a Promise (Next 16's route-param contract) and
// unwraps it with use(), which suspends on first render even for an
// already-resolved promise — a real page always has an ancestor Suspense
// boundary from the framework; this harness supplies one since the test
// renders the page directly. It also seeds one real prompt through the
// actual PromptProvider (not a mock) so the id is a real one the page can
// look up, matching how the app actually wires id -> prompt.
function TestHarness({ prompt }: { readonly prompt: CreatePromptInput }) {
  const { addPrompt } = usePrompts();
  // A fresh Promise.resolve() on every render would make use() re-suspend
  // each time — PromptProvider's context value is a new object on every
  // state change, so any consumer (like the favorite-toggle/delete tests
  // below) re-renders TestHarness too. State (set once, on mount) keeps the
  // same promise instance across those unrelated re-renders.
  const [params, setParams] = useState<Promise<{ id: string }> | null>(null);

  useEffect(() => {
    // Test-only setup, not app logic: seeds a real prompt through the
    // provider (an external system from this component's point of view)
    // and stores the id it's given back, not anything derivable at render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams(Promise.resolve({ id: addPrompt(prompt).id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!params) return null;

  return (
    <Suspense fallback={null}>
      <PromptDetailPage params={params} />
    </Suspense>
  );
}

// Standing in for Next's real not-found boundary, which swaps to
// not-found.tsx's UI instead of crashing: the delete-confirm test's mocked
// router.push doesn't actually navigate away (it's a spy, not a real
// router), so the component stays mounted and re-renders with the
// now-deleted prompt missing, hitting notFound() for real — exactly what
// the app's own startTransition avoids by the time a real router unmounts
// it first.
class NotFoundBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// render()'s own act() wrapping is synchronous, but use() suspends on the
// params promise — even an already-resolved one still defers its .then()
// by a microtask — so the initial render must happen inside an async act()
// to let that microtask (and the resulting commit) flush before returning.
async function renderPage(prompt: CreatePromptInput = testPrompt) {
  await act(async () => {
    render(
      <NotFoundBoundary>
        <PromptProvider>
          <TestHarness prompt={prompt} />
        </PromptProvider>
      </NotFoundBoundary>
    );
  });
}

describe('PromptDetailPage', () => {
  it('renders the prompt title, content, badges, and tags', async () => {
    await renderPage();

    expect(await screen.findByText('Code Review')).not.toBeNull();
    expect(screen.getByText('Review this code for bugs.')).not.toBeNull();
    expect(screen.getByText('claude-sonnet')).not.toBeNull();
    expect(screen.getByText('code-review')).not.toBeNull();
    expect(screen.getByText('review')).not.toBeNull();
    expect(screen.getByText('quality')).not.toBeNull();
  });

  it('calls notFound() when no prompt matches the id', async () => {
    function MissingHarness() {
      const params = useMemo(() => Promise.resolve({ id: 'nope' }), []);
      return (
        <Suspense fallback={null}>
          <PromptDetailPage params={params} />
        </Suspense>
      );
    }

    // React re-throws the render error to console.error; silence the noise.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await act(async () => {
        render(
          <PromptProvider>
            <MissingHarness />
          </PromptProvider>
        );
      });
    } catch {
      // Expected: the mocked notFound() throws synthetically, matching the
      // real one's digest-error behavior of halting the render.
    } finally {
      consoleSpy.mockRestore();
    }

    expect(notFoundMock).toHaveBeenCalled();
  });

  it('toggles favorite state when the favorite button is clicked', async () => {
    const user = userEvent.setup();
    await renderPage();

    const favoriteButton = await screen.findByRole('button', {
      name: 'Add to favorites',
    });

    await user.click(favoriteButton);

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).not.toBeNull();
  });

  it('links back to the prompts list', async () => {
    await renderPage();

    const backLink = await screen.findByRole('link', {
      name: '← Back to prompts',
    });
    expect(backLink.getAttribute('href')).toBe('/prompts');
  });

  it('gives the back link a visible focus-visible ring, not just default styling', async () => {
    // jsdom doesn't apply real CSS, so this checks the ring utility classes
    // are present rather than a computed style — the link previously had
    // none at all (keyboard-nav audit finding), unlike every other
    // interactive element in the app.
    await renderPage();

    const backLink = await screen.findByRole('link', {
      name: '← Back to prompts',
    });
    expect(backLink.className).toMatch(/focus-visible:ring-1/);
  });

  it('deletes the prompt and navigates back to the list on confirm', async () => {
    const user = userEvent.setup();
    await renderPage();

    await screen.findByText('Code Review');

    // The trigger button and the dialog's confirm button are both literally
    // named "Delete" — scoping the query to the dialog itself (found by its
    // role) is the unambiguous way to get the confirm button, not the one
    // that opened it.
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('alertdialog');
    await within(dialog).findByText('Delete "Code Review"?');

    // Confirming re-renders with the prompt now gone, hitting notFound() for
    // real (see NotFoundBoundary above) — React logs that to console.error
    // even though the boundary handles it; expected noise, not a real error.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    consoleSpy.mockRestore();

    expect(pushMock).toHaveBeenCalledWith('/prompts');
  });

  it('leaves the prompt untouched when delete is cancelled', async () => {
    const user = userEvent.setup();
    await renderPage();

    await screen.findByText('Code Review');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Code Review')).not.toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
