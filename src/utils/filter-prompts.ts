import { Prompt, FilterState } from '@/types/prompt';

type Predicate = (item: Prompt, filterState: FilterState) => boolean;

export function filterPrompts(
  prompts: readonly Prompt[],
  filterState: FilterState
): Prompt[] {
  const filters: Predicate[] = [];

  add(
    filters,
    (prompt, filterState) =>
      filterState.model === 'all' || prompt.model === filterState.model
  );
  add(
    filters,
    (prompt, filterState) =>
      filterState.category === 'all' || prompt.category === filterState.category
  );
  add(
    filters,
    (prompt, filterState) => !filterState.showFavorites || prompt.isFavorite
  );
  add(
    filters,
    (prompt, filterState) =>
      filterState.search.trim().toLowerCase() === '' ||
      prompt.title
        .toLowerCase()
        .includes(filterState.search.trim().toLowerCase()) ||
      prompt.content
        .toLowerCase()
        .includes(filterState.search.trim().toLowerCase())
  );

  return applyFilters(prompts, filterState, filters);
}

function add(filters: Predicate[], filterFn: Predicate): void {
  filters.push(filterFn);
}

function applyFilters(
  data: readonly Prompt[],
  filterState: FilterState,
  filters: Predicate[]
): Prompt[] {
  return data.filter((item) =>
    filters.every((filter) => filter(item, filterState))
  );
}
