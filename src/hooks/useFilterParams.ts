import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FilterState } from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';

export interface UseFilterParamsReturn {
  filterState: FilterState;
  setFilter: (updates: Partial<FilterState>) => void;
}

function parseFilterState(params: Pick<URLSearchParams, 'get'>): FilterState {
  const model = params.get('model');
  const category = params.get('category');

  return {
    model: model && isModel(model) ? model : 'all',
    category: category && isCategory(category) ? category : 'all',
    search: params.get('search') ?? '',
    isFavoritesOnly: params.get('favorites') === 'true',
  };
}

export function useFilterParams(): UseFilterParamsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (updates: Partial<FilterState>): void => {
    // Parses straight from searchParams, not the closed-over filterState
    // below — two setFilter calls issued before either's router.replace()
    // has re-rendered this hook would otherwise both start from the same
    // stale snapshot and the second call would clobber the first's update.
    const next: FilterState = {
      ...parseFilterState(searchParams),
      ...updates,
    };

    const params = new URLSearchParams();
    if (next.model !== 'all') params.set('model', next.model);
    if (next.category !== 'all') params.set('category', next.category);
    if (next.search !== '') params.set('search', next.search);
    if (next.isFavoritesOnly) params.set('favorites', 'true');

    const query = params.toString();
    // replace, not push — changing a filter isn't a new place in history.
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  // The URL is the source of truth for filters — derived on every render,
  // never mirrored into useState. An absent param means "no filter", not a
  // stored empty string, so a bookmarked/shared link only carries the
  // filters actually in effect.
  const filterState: FilterState = useMemo(
    () => parseFilterState(searchParams),
    [searchParams]
  );

  return { filterState, setFilter };
}
