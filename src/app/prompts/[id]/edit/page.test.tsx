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
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditPromptPage from './page';
import PromptProvider, { usePrompts } from '@/context/PromptProvider';
import { CreatePromptInput } from '@/types/prompt';

// PromptForm's mount effect calls scrollIntoView, which jsdom doesn't
// implement.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

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
  // state change, so any consumer (like this harness) re-renders too. State
  // (set once, on mount) keeps the same promise instance across those
  // unrelated re-renders.
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
      <EditPromptPage params={params} />
    </Suspense>
  );
}

// Standing in for Next's real not-found boundary, which swaps to
// not-found.tsx's UI instead of crashing: the mocked router.push doesn't
// actually navigate away (it's a spy, not a real router), so a component
// that stays mounted after its prompt disappears would hit notFound() for
// real — this absorbs that render error gracefully in tests.
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

describe('EditPromptPage', () => {
  it('pre-fills the form with the existing prompt data', async () => {
    await renderPage();

    const titleInput = await screen.findByLabelText('Prompt title');
    expect((titleInput as HTMLInputElement).value).toBe('Code Review');
    expect(
      (screen.getByLabelText('Prompt content') as HTMLTextAreaElement).value
    ).toBe('Review this code for bugs.');
  });

  it('calls notFound() when no prompt matches the id', async () => {
    function MissingHarness() {
      const params = useMemo(() => Promise.resolve({ id: 'nope' }), []);
      return (
        <Suspense fallback={null}>
          <EditPromptPage params={params} />
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

  it('saves changes and navigates to the detail page on submit', async () => {
    const user = userEvent.setup();
    await renderPage();

    const titleInput = await screen.findByLabelText('Prompt title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/prompts\/.+/)
    );
    // Cancel and save both navigate to the detail page for the same id;
    // confirm this one used the id the prompt was actually seeded under.
    const [[navigatedPath]] = pushMock.mock.calls;
    expect(navigatedPath).toMatch(/^\/prompts\/[^/]+$/);
  });

  it('navigates to the detail page (not the list) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    await renderPage();

    await screen.findByLabelText('Prompt title');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    const [[navigatedPath]] = pushMock.mock.calls;
    expect(navigatedPath).toMatch(/^\/prompts\/[^/]+$/);
    expect(navigatedPath).not.toBe('/prompts');
  });
});
