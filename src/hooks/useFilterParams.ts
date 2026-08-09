import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FilterState } from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';

export interface UseFilterParamsReturn {
  filterState: FilterState;
  setFilter: (updates: Partial<FilterState>) => void;
}

export function useFilterParams(): UseFilterParamsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the source of truth for filters — derived on every render,
  // never mirrored into useState. An absent param means "no filter", not a
  // stored empty string, so a bookmarked/shared link only carries the
  // filters actually in effect.
  const filterState: FilterState = useMemo(() => {
    const model = searchParams.get('model');
    const category = searchParams.get('category');

    return {
      model: model && isModel(model) ? model : 'all',
      category: category && isCategory(category) ? category : 'all',
      search: searchParams.get('search') ?? '',
      showFavorites: searchParams.get('favorites') === 'true',
    };
  }, [searchParams]);

  const setFilter = (updates: Partial<FilterState>) => {
    const next = { ...filterState, ...updates };
    const params = new URLSearchParams();

    if (next.model !== 'all') params.set('model', next.model);
    if (next.category !== 'all') params.set('category', next.category);
    if (next.search !== '') params.set('search', next.search);
    if (next.showFavorites) params.set('favorites', 'true');

    const query = params.toString();
    // replace, not push — changing a filter isn't a new place in history.
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return { filterState, setFilter };
}
