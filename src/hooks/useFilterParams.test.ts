import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilterParams } from './useFilterParams';

let mockSearchParams = new URLSearchParams();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/prompts',
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
  replaceMock.mockClear();
});

describe('useFilterParams', () => {
  describe('reading filterState from the URL', () => {
    it('defaults to no filters when the URL has no params', () => {
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState).toEqual({
        model: 'all',
        category: 'all',
        search: '',
        showFavorites: false,
      });
    });

    it('reads a valid model param', () => {
      mockSearchParams = new URLSearchParams('model=gpt-4o');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.model).toBe('gpt-4o');
    });

    it('falls back to "all" for an unrecognized model value', () => {
      mockSearchParams = new URLSearchParams('model=not-a-real-model');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.model).toBe('all');
    });

    it('reads a valid category param', () => {
      mockSearchParams = new URLSearchParams('category=testing');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.category).toBe('testing');
    });

    it('falls back to "all" for an unrecognized category value', () => {
      mockSearchParams = new URLSearchParams('category=not-a-real-category');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.category).toBe('all');
    });

    it('reads the search param verbatim', () => {
      mockSearchParams = new URLSearchParams('search=code+review');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.search).toBe('code review');
    });

    it('treats favorites=true as showFavorites: true', () => {
      mockSearchParams = new URLSearchParams('favorites=true');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.showFavorites).toBe(true);
    });

    it('treats any other favorites value as showFavorites: false', () => {
      mockSearchParams = new URLSearchParams('favorites=1');
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.filterState.showFavorites).toBe(false);
    });
  });

  describe('setFilter', () => {
    it('writes a single changed dimension to the URL', () => {
      const { result } = renderHook(() => useFilterParams());

      result.current.setFilter({ model: 'gpt-4o' });

      expect(replaceMock).toHaveBeenCalledWith('/prompts?model=gpt-4o');
    });

    it('merges an update with the existing filterState rather than replacing it', () => {
      mockSearchParams = new URLSearchParams('model=gpt-4o');
      const { result } = renderHook(() => useFilterParams());

      result.current.setFilter({ search: 'review' });

      expect(replaceMock).toHaveBeenCalledWith(
        '/prompts?model=gpt-4o&search=review'
      );
    });

    it('omits a param entirely when its value returns to the default, rather than storing all/""/false', () => {
      mockSearchParams = new URLSearchParams('model=gpt-4o');
      const { result } = renderHook(() => useFilterParams());

      result.current.setFilter({ model: 'all' });

      expect(replaceMock).toHaveBeenCalledWith('/prompts');
    });

    it('calls router.replace, not push', () => {
      const { result } = renderHook(() => useFilterParams());

      result.current.setFilter({ showFavorites: true });

      // The mock only defines `replace` — a `router.push` call here would
      // throw "push is not a function" and fail this test.
      expect(replaceMock).toHaveBeenCalledWith('/prompts?favorites=true');
    });
  });
});
